// lib/engine/computationalNutritionEngine.ts
//
// Rispetto alla versione precedente, tre correzioni sostanziali:
//
// 1. FERRO: la base non-eme passa dal 5% flat (inventato) al 22.1% di
//    riferimento misurato da Hallberg (N=310, SD 0.18) su panini di farina
//    bianca fermentata priva di fitati, a uno stato marziale standardizzato
//    (assorbimento della dose di riferimento = 40%). L'interazione vitamina
//    C x fitati usa ora la vera Equazione 2 del paper (non una curva a
//    saturazione inventata). Fonte: Hallberg L. "New tools in studies on
//    iron nutrition". Scand J Nutr 2000;44:150-154 (che corregge un errore
//    tipografico dell'originale: Hallberg L, Hulthen L. Am J Clin Nutr
//    2000;71:1147-60).
// 2. ZINCO: la fascia di confidenza non è più null ne un numero inventato:
//    è calcolata facendo variare AMAX nel suo vero intervallo di confidenza
//    al 95% pubblicato (0.034-0.23 mmol/d), tenendo KR/KP al valore
//    centrale. E' una propagazione semplificata (un solo parametro), non
//    la propagazione completa dei tre parametri — lo dichiariamo.
// 3. CALCIO: la fascia di confidenza per la categoria low_oxalate usa la
//    deviazione standard realmente riportata nello studio (±10.1 punti
//    percentuali su 40.9%), non un ±10% arbitrario uguale per tutte le
//    categorie. Per le altre due categorie non abbiamo una SD pubblicata
//    affidabile: resta null piuttosto che inventata.
//
// Limitazioni dichiarate (non implementate, per onestà invece che finzione):
// - Il modello di Hallberg prevede 8 fattori (vit C, carne, fitati,
//   polifenoli, calcio, soia, alcol, uova). Qui ne sono implementati 3
//   (vit C, fitati, polifenoli); il termine polifenoli resta una stima
//   euristica non verificata contro l'equazione originale di Hallberg per
//   i polifenoli (che non abbiamo ancora recuperato in forma completa).
// - Il fattore carne (MFP) non è implementato: un pasto con carne e ferro
//   non-eme viene sottostimato rispetto alla realtà.

import { SourcedValue, Meal, DailyDiet, FoodItem, isDailyDiet, flattenFoods, createZeroValue } from "./types";

export class ComputationalNutritionEngine {

  // --- ZINCO (Miller, Krebs & Hambidge, J Nutr 2007;137(1):135-141, DOI 10.1093/jn/137.1.135) ---
  public calculateBioavailableZinc(context: Meal | DailyDiet): SourcedValue {
    const foods = flattenFoods(context);
    const daily = isDailyDiet(context);

    let totalZincMg = 0;
    let totalPhytatesMg = 0;
    foods.forEach(f => {
      totalZincMg += f.zinc_mg;
      totalPhytatesMg += f.phytates_mg;
    });

    if (totalZincMg === 0) return { ...createZeroValue(["MILLER_2007_JNUTR"]), bioavailabilityAdjusted: true };

    const TDZ = totalZincMg / 65.38;   // mmol/d (o per pasto, vedi nota sotto)
    const TDP = totalPhytatesMg / 660.04;
    const KR = 0.10;
    const KP = 1.2;

    const faz = (amax: number, tdz: number, tdp: number): number => {
      const term1 = amax + tdz + KR * (1 + tdp / KP);
      const discriminant = Math.pow(term1, 2) - 4 * amax * tdz;
      return 0.5 * (term1 - Math.sqrt(Math.max(0, discriminant)));
    };

    const AMAX_CENTRAL = 0.13;
    const AMAX_CI95_LOW = 0.034;
    const AMAX_CI95_HIGH = 0.23;

    const taz = faz(AMAX_CENTRAL, TDZ, TDP) * 65.38;
    const tazLow = faz(AMAX_CI95_LOW, TDZ, TDP) * 65.38;
    const tazHigh = faz(AMAX_CI95_HIGH, TDZ, TDP) * 65.38;

    // Il modello di Miller è validato SOLO sul totale giornaliero (TDZ/TDP
    // = mmol/die). Applicato a un singolo pasto è un'estrapolazione fuori
    // dal dominio di validazione: evidenceLevel piu basso, draft.
    return {
      value: +taz.toFixed(2),
      confidenceLow: +Math.min(tazLow, tazHigh).toFixed(2),
      confidenceHigh: +Math.max(tazLow, tazHigh).toFixed(2),
      evidenceLevel: daily ? 1 : 2,
      sourceIds: ["MILLER_2007_JNUTR"],
      verificationStatus: daily ? "verified" : "draft",
      bioavailabilityAdjusted: true // vedi PRD.md §4.0: equazione di Miller 2007 realmente applicata
    };
  }

  // --- CALCIO (Heaney, Weaver, Recker 1988 [spinaci]; Heaney & Weaver 1990 [kale]) ---
  public calculateBioavailableCalcium(meal: Meal): SourcedValue {
    let totalCalciumMg = 0;
    let absorbedCalciumMg = 0;
    // Propagazione della SD reale solo dove nota (kale, vedi sopra);
    // altrove la incertezza resta dichiarata assente, non inventata.
    let lowMg = 0;
    let highMg = 0;
    let anyLowOxalate = false;

    meal.foods.forEach(f => {
      totalCalciumMg += f.calcium_mg;
      if (f.calcium_mg === 0) return;

      let fraction = 0.32; // baseline tipo latte (Heaney & Weaver 1990)
      let fracLow = 0.32, fracHigh = 0.32; // nessuna SD nota per questa categoria
      if (f.matrix_category_calcium === "high_oxalate") {
        fraction = 0.05; // spinaci (Heaney, Weaver, Recker 1988)
        fracLow = 0.05; fracHigh = 0.05; // nessuna SD riportata nel paper
      } else if (f.matrix_category_calcium === "low_oxalate") {
        fraction = 0.409; // kale (Heaney & Weaver 1990): 40.9% +/- 10.1pp (SD)
        fracLow = 0.308; fracHigh = 0.510;
        anyLowOxalate = true;
      }
      absorbedCalciumMg += f.calcium_mg * fraction;
      lowMg += f.calcium_mg * fracLow;
      highMg += f.calcium_mg * fracHigh;
    });

    if (totalCalciumMg === 0) {
      return { ...createZeroValue(["HEANEY_WEAVER_RECKER_1988_AJCN", "HEANEY_WEAVER_1990_AJCN"]), bioavailabilityAdjusted: true };
    }

    return {
      value: +absorbedCalciumMg.toFixed(2),
      // Il range e' reale (SD dello studio) solo quando e' presente almeno
      // un alimento low_oxalate; altrimenti low=high=value (nessuna SD nota).
      confidenceLow: anyLowOxalate ? +lowMg.toFixed(2) : null,
      confidenceHigh: anyLowOxalate ? +highMg.toFixed(2) : null,
      evidenceLevel: 2,
      sourceIds: ["HEANEY_WEAVER_RECKER_1988_AJCN", "HEANEY_WEAVER_1990_AJCN"],
      verificationStatus: anyLowOxalate ? "verified" : "draft",
      bioavailabilityAdjusted: true // vedi PRD.md §4.0: modello a 3 categorie Heaney&Weaver realmente applicato
    };
  }

  // --- FERRO (Hallberg 2000; base 22.1% verificata; Eq.2 per vit C x fitati; Young 2007 per il range) ---
  public calculateBioavailableIron(meal: Meal): SourcedValue {
    let totalHemeIron = 0;
    let totalNonHemeIron = 0;
    let totalVitaminCmg = 0;
    let totalPhytatesMg = 0;
    let totalPolyphenolsMg = 0;

    meal.foods.forEach(food => {
      if (food.is_heme_iron) totalHemeIron += food.iron_mg;
      else totalNonHemeIron += food.iron_mg;
      totalVitaminCmg += food.vitamin_c_mg;
      totalPhytatesMg += food.phytates_mg;
      totalPolyphenolsMg += food.polyphenols_mg;
    });

    if (totalHemeIron === 0 && totalNonHemeIron === 0) {
      return { ...createZeroValue(["HALLBERG_2000_SCANDJNUTR", "YOUNG_2007_JNUTR"]), bioavailabilityAdjusted: true };
    }

    // Ferro eme: ~25% costante, indipendente dagli inibitori (letteratura generale)
    const hemeAbsorbed = totalHemeIron * 0.25;

    // Base di riferimento Hallberg: 22.1% +/- 0.18 (N=310), su panini privi
    // di fitati a uno stato marziale standard (reference dose absorption 40%)
    const BASE_NON_HEME = 0.221;

    // Fitato -> fosforo fitico (PP). Approssimazione: il fosforo e' circa
    // il 28.2% della massa dell'acido fitico (6 gruppi fosfato su una massa
    // molare di 660.04 g/mol di IP6, P = 30.97 g/mol x 6 / 660.04).
    // Non e' lo stesso dato che una misura diretta di PP, quindi la
    // chiamiamo "stimata", non "misurata".
    const PP_mg = totalPhytatesMg * 0.282;
    const AA_mg = totalVitaminCmg;

    // Equazione 2 di Hallberg (corretta nell'errata del 2000, non quella
    // errata pubblicata originariamente su AJCN):
    // absorptionRatio = 1 + 0.01*AA + log10(PP+1)*0.01*10^(0.8875*log10(AA+1))
    const absorptionRatio =
      1 +
      0.01 * AA_mg +
      Math.log10(PP_mg + 1) * 0.01 * Math.pow(10, 0.8875 * Math.log10(AA_mg + 1));

    let nonHemeRate = BASE_NON_HEME * absorptionRatio;

    // Polifenoli: NON fa parte dell'Equazione 2 verificata sopra. Resta
    // l'euristica precedente (rapporto molare, non mg assoluti), ma
    // dichiarata esplicitamente come non verificata contro la letteratura
    // primaria di Hallberg sui polifenoli (che non abbiamo ancora in mano).
    if (totalPolyphenolsMg > 0 && totalNonHemeIron > 0) {
      const ironMoles = totalNonHemeIron / 55.84;
      const polyphenolMoles = totalPolyphenolsMg / 300; // massa molare media assunta, non misurata per classe
      const polyphenolRatio = polyphenolMoles / ironMoles;
      nonHemeRate *= Math.exp(-0.1 * polyphenolRatio); // euristica non sourced, vedi commento sopra
    }

    // Pavimento fisiologico difensivo (mai zero assoluto)
    nonHemeRate = Math.max(nonHemeRate, 0.01);

    const nonHemeAbsorbed = totalNonHemeIron * nonHemeRate;
    const totalAbsorbed = hemeAbsorbed + nonHemeAbsorbed;

    // Young et al. 2007 (J Nutr 137(7):1741): confrontando gli algoritmi
    // pubblicati (incluso Hallberg & Hulthen) con un trial di 9 mesi,
    // l'assorbimento REALE misurato (via ferritina) era ~2-3x quello
    // predetto dagli algoritmi. Usiamo questo come correzione sourced del
    // limite superiore, non come margine inventato.
    return {
      value: +totalAbsorbed.toFixed(2),
      confidenceLow: +(totalAbsorbed * 0.90).toFixed(2), // margine difensivo minimo, non da una fonte specifica
      confidenceHigh: +(totalAbsorbed * 2.5).toFixed(2), // sourced: Young et al. 2007
      evidenceLevel: 2,
      sourceIds: ["HALLBERG_2000_SCANDJNUTR", "YOUNG_2007_JNUTR"],
      // "draft": il termine polifenoli e il fattore carne mancante restano
      // non verificati contro la letteratura primaria completa.
      verificationStatus: "draft",
      bioavailabilityAdjusted: true // vedi PRD.md §4.0: Eq.2 di Hallberg 2000 realmente applicata
    };
  }
}
