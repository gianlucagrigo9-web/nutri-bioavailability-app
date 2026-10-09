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
  //
  // Terzo strato aggiunto il 2026-10-09 (decisione esplicita dell'utente):
  // bioaccessibilità post-cottura per i cavoletti di Bruxelles, da Doniec
  // et al. 2022 (Molecules 27(6):1861, Tabella 5, digestione in vitro
  // simulata): crudo 17.02%, bollito 6.57%, vapore 6.83% dello zinco
  // totale è "dializzabile" (chimicamente disponibile).
  //
  // SCOPO: ESCLUSIVAMENTE cavoletti di Bruxelles (vedi zinc_bioaccessibility_
  // bucket in types.ts) -- il paper stesso non generalizza ad altre
  // crucifere, anzi nota differenze di specie come possibile causa di
  // discrepanze con altri studi. Nessuna estensione a "crucifere" in generale.
  //
  // PERCHÉ APPLICATO DOPO L'EQUAZIONE DI MILLER, NON PRIMA: la bioaccessibilità
  // in vitro e il modello di Miller (calibrato su dati di assorbimento IN
  // VIVO, usando come input il contenuto totale di zinco dietetico come
  // normalmente misurato, non una frazione "pre-filtrata" per bioaccessibilità)
  // sono due paradigmi di misura diversi. Dare in input a Miller una massa
  // già scontata per bioaccessibilità rischierebbe di applicare due volte
  // lo stesso tipo di sconto (il modello di Miller include già, nella sua
  // costante AMAX fittata su dati reali, qualunque bioaccessibilità media
  // fosse presente nei 21 studi usati per calibrarlo). Trattiamo quindi la
  // bioaccessibilità dei cavoletti come una correzione EMPIRICA AGGIUNTIVA,
  // separata e dichiarata, applicata in proporzione alla quota di zinco che
  // i cavoletti rappresentano sul totale del pasto/giornata -- non dentro
  // l'equazione di Miller.
  //
  // Limite dichiarato: l'allocazione proporzionale (quanto dell'assorbito
  // aggregato "appartiene" ai cavoletti) è una nostra semplificazione, non
  // una misura — ragionevole perché Miller non scompone per alimento, ma va
  // detto. evidenceLevel scende quando questa correzione si applica
  // (eredita il livello più debole tra le evidenze coinvolte, come da
  // PRD.md §6).
  public calculateBioavailableZinc(context: Meal | DailyDiet): SourcedValue {
    const foods = flattenFoods(context);
    const daily = isDailyDiet(context);

    let totalZincMg = 0;
    let totalPhytatesMg = 0;
    let boiledSproutsZincMg = 0;
    let steamedSproutsZincMg = 0;
    foods.forEach(f => {
      totalZincMg += f.zinc_mg;
      totalPhytatesMg += f.phytates_mg;
      if (f.zinc_bioaccessibility_bucket === "brussels_sprouts_boiled") boiledSproutsZincMg += f.zinc_mg;
      if (f.zinc_bioaccessibility_bucket === "brussels_sprouts_steamed") steamedSproutsZincMg += f.zinc_mg;
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

    // Bioaccessibilità cavoletti: media pesata fra la quota "normale" (1.0,
    // nessuno sconto aggiuntivo) e la quota cavoletti (rapporto cotto/crudo
    // misurato da Doniec), proporzionale alla composizione del pasto.
    const BIOACCESS_RAW = 17.02;
    const BIOACCESS_BOILED = 6.57;
    const BIOACCESS_STEAMED = 6.83;
    const boiledShare = boiledSproutsZincMg / totalZincMg;
    const steamedShare = steamedSproutsZincMg / totalZincMg;
    const normalShare = 1 - boiledShare - steamedShare;
    const effectiveRetainedFraction =
      normalShare * 1.0 +
      boiledShare * (BIOACCESS_BOILED / BIOACCESS_RAW) +
      steamedShare * (BIOACCESS_STEAMED / BIOACCESS_RAW);
    const usedBioaccessibilityDerating = boiledShare > 0 || steamedShare > 0;

    const finalValue = taz * effectiveRetainedFraction;
    const finalLow = Math.min(tazLow, tazHigh) * effectiveRetainedFraction;
    const finalHigh = Math.max(tazLow, tazHigh) * effectiveRetainedFraction;

    // Il modello di Miller è validato SOLO sul totale giornaliero (TDZ/TDP
    // = mmol/die). Applicato a un singolo pasto è un'estrapolazione fuori
    // dal dominio di validazione: evidenceLevel piu basso, draft.
    return {
      value: +finalValue.toFixed(2),
      confidenceLow: +finalLow.toFixed(2),
      confidenceHigh: +finalHigh.toFixed(2),
      // eredita il livello più debole tra le evidenze coinvolte (PRD.md §6):
      // la correzione di bioaccessibilità (studio singolo, n=3, in vitro) è
      // più debole sia del Miller giornaliero (1) che di quello per pasto (2).
      evidenceLevel: usedBioaccessibilityDerating ? 3 : (daily ? 1 : 2),
      sourceIds: usedBioaccessibilityDerating
        ? ["MILLER_2007_JNUTR", "DONIEC_2022_MOLECULES"]
        : ["MILLER_2007_JNUTR"],
      verificationStatus: usedBioaccessibilityDerating ? "draft" : (daily ? "verified" : "draft"),
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

  // --- VITAMINA B12 (IOM, Dietary Reference Intakes for B Vitamins, 1998,
  // NBK114302 su NCBI Bookshelf) ---
  //
  // Due componenti reali, sourced separatamente, SOMMATI:
  // 1. Via attiva (fattore intrinseco, ileale): satura. Il range di
  //    saturazione riportato (Scott 1997, citato nel report IOM 1998) e'
  //    1.5-2.5 ug/pasto. Usiamo 2.0 come centrale, 1.5/2.5 come fascia di
  //    confidenza reale (stesso trattamento dato all'AMAX dello zinco).
  // 2. Via passiva (diffusione di massa, non satura): ~1% della dose,
  //    indipendente dal fattore intrinseco (Berlin 1968; Doscherholmen &
  //    Hagen 1957, entrambi citati nello stesso report IOM 1998).
  //
  // LIMITE DICHIARATO (non nascosto): la FORMA della curva di saturazione
  // della via attiva (qui: Michaelis-Menten con Km=1.0 ug) NON e' essa
  // stessa sourced da un fit statistico pubblicato -- a differenza
  // dell'equazione di Miller 2007 per lo zinco, qui non abbiamo in mano il
  // paper primario con Km fittato e la sua CI. Km=1.0 e' scelto solo per
  // dare una forma a saturazione fisiologicamente plausibile (stesso
  // pattern già usato in microbiotaEngine.ts per Km dei MACs/polifenoli),
  // coerente con i punti dose-risposta riportati nello stesso report IOM
  // (Adams et al. 1971: 1ug->~50%, 5ug->~20%, 25ug->~5%; Heyssel et al.
  // 1966: 38ug da pasta di fegato -> media 4.1ug/11% assorbiti). Non e'
  // un fit statistico di questi punti: evidenceLevel e verificationStatus
  // riflettono questa differenza rispetto a ferro/zinco/calcio.
  public calculateBioavailableB12(context: Meal | DailyDiet): SourcedValue {
    const foods = flattenFoods(context);
    let totalB12Mcg = 0;
    foods.forEach(f => { totalB12Mcg += f.vitamin_b12_mcg; });

    if (totalB12Mcg === 0) {
      return { ...createZeroValue(["IOM_1998_DRI_B_VITAMINS"]), bioavailabilityAdjusted: true };
    }

    // Km=3.0: non e' un parametro riportato da un paper con una propria CI
    // (a differenza di AMAX). E' calibrato SOLO sul punto a dose=1ug di
    // Adams et al. 1971 (dose cristallina, stessa metodologia della fonte
    // della soglia AMAX) perche' e' il punto piu' vicino al contenuto
    // reale di B12 di una porzione di cibo. A dosi piu' alte (5-25ug) la
    // curva SOVRASTIMA l'assorbimento reale riportato da Adams di un
    // 30-60% (vedi test "LIMITE NOTO" sotto) — dichiarato, non nascosto.
    const KM_UNSOURCED = 3.0;
    const PASSIVE_FRACTION = 0.01; // Berlin 1968; Doscherholmen & Hagen 1957

    const activeAbsorbed = (amax: number) => (amax * totalB12Mcg) / (KM_UNSOURCED + totalB12Mcg);

    const AMAX_CENTRAL = 2.0;
    const AMAX_LOW = 1.5;
    const AMAX_HIGH = 2.5;

    const passiveAbsorbed = totalB12Mcg * PASSIVE_FRACTION;

    const central = activeAbsorbed(AMAX_CENTRAL) + passiveAbsorbed;
    const low = activeAbsorbed(AMAX_LOW) + passiveAbsorbed;
    const high = activeAbsorbed(AMAX_HIGH) + passiveAbsorbed;

    return {
      value: +central.toFixed(3),
      confidenceLow: +Math.min(low, high).toFixed(3),
      confidenceHigh: +Math.max(low, high).toFixed(3),
      evidenceLevel: 3, // via attiva + passiva sourced, ma Km della curva non fittato (vedi commento)
      sourceIds: ["IOM_1998_DRI_B_VITAMINS", "ADAMS_1971", "HEYSSEL_1966"],
      verificationStatus: "draft",
      bioavailabilityAdjusted: true
    };
  }

  // --- FOLATI -> Dietary Folate Equivalents (FNB; NIH Office of Dietary
  // Supplements, Folate Health Professional Fact Sheet) ---
  //
  // Conversione ufficiale, non un'equazione di assorbimento continua:
  // 1 DFE = 1ug folato alimentare = 0.6ug acido folico da fonte fortificata
  // consumata con cibo. Non implementiamo il caso "acido folico a digiuno"
  // (fattore 0.5) perche' l'app modella pasti, non integratori a digiuno.
  // Nessuna incertezza (confidenceLow/High) e' pubblicata per questi
  // fattori: sono una convenzione normativa, non una misura con SD --
  // restano null, non inventiamo una fascia.
  public calculateFolateDFE(context: Meal | DailyDiet): SourcedValue {
    const foods = flattenFoods(context);
    let totalDFE = 0;
    let anyFood = false;

    foods.forEach(f => {
      if (f.folate_mcg === 0) return;
      anyFood = true;
      totalDFE += f.is_fortified_folate ? f.folate_mcg / 0.6 : f.folate_mcg;
      // dividere per 0.6 e' equivalente a moltiplicare per 1.7 (mcg DFE =
      // folato naturale + 1.7 x acido folico), la stessa formula FDA.
    });

    if (!anyFood) {
      return { ...createZeroValue(["NIH_ODS_FOLATE_FACT_SHEET"]), bioavailabilityAdjusted: true };
    }

    return {
      value: +totalDFE.toFixed(2),
      confidenceLow: null, // nessuna SD pubblicata: convenzione normativa, non misura
      confidenceHigh: null,
      evidenceLevel: 2, // conversione ufficiale FNB, ma non una meta-analisi/studio continuo
      sourceIds: ["NIH_ODS_FOLATE_FACT_SHEET"],
      verificationStatus: "verified", // la conversione stessa è pacifica/ufficiale, non in discussione
      bioavailabilityAdjusted: true
    };
  }

  // --- VITAMINA A (da carotenoidi provitaminici) -> Retinol Activity
  // Equivalents (RAE) ---
  //
  // Fonte base: Olsen T, Lerner UH. "Vitamin A - a scoping review for
  // Nordic Nutrition Recommendations 2023." Food Nutr Res. 2023;67:10229.
  // Fattore ADOTTATO per NNR2023 per beta-carotene alimentare: 6:1. La
  // fonte stessa dice "the evidence does not yet allow a precise factor"
  // e non cita una fonte specifica per questo numero -- e' una convenzione,
  // non un risultato di uno studio dedicato.
  //
  // Fonte per la differenza crudo/cotto: Livny O, et al. "Beta-carotene
  // bioavailability from differently processed carrot meals in human
  // ileostomy volunteers." Eur J Nutr. 2003;42(6):338-45. Misura DIRETTA
  // di assorbimento intestinale (non plasma): 65.1+/-7.4% da carote
  // cotte/pureed vs 41.4+/-7.4% da carote crude tritate (stesso pasto,
  // stesso contenuto di olio in entrambe le condizioni).
  //
  // INTEGRAZIONE (decisione esplicita dell'utente, 2026-10-09, accettando
  // il rischio sotto): trattiamo il 6:1 di NNR2023 come il fattore per lo
  // stato "cooked_or_disrupted" (le revisioni citate da NNR2023 si basano
  // in buona parte su diete con verdure cotte/processate), e deriviamo il
  // fattore per "raw_intact" scalando 6:1 per il rapporto di assorbimento
  // Livny (cotto/crudo = 65.1/41.4 = 1.573): 6 x 1.573 = 9.44:1 circa.
  //
  // RISCHIO DICHIARATO (non nascosto, accettato esplicitamente
  // dall'utente): questa combinazione è una nostra ricombinazione di due
  // fonti che non si citano a vicenda, non un numero che compare in un
  // singolo paper. Se il 6:1 di NNR2023 incorpora GIA' una miscela
  // implicita crudo/cotto nella popolazione di riferimento, il fattore
  // derivato per "raw_intact" (9.44:1) rischia di contare l'effetto
  // cottura una seconda volta. evidenceLevel riflette questo (piu' basso
  // di entrambe le fonti prese singolarmente). Rimovibile: se smentito,
  // si torna al 6:1 flat (vedi PRD.md §4.2).
  //
  // other_provitamin_a_carotenoids_mcg (alfa-carotene, beta-criptoxantina):
  // Livny ha misurato solo beta-carotene da carote -- nessun aggiustamento
  // crudo/cotto per questo bucket, resta 12:1 flat (NNR2023).
  // Preformed retinol (fonti animali) non e' ancora un campo dell'app:
  // limitazione dichiarata, non silenziosa.
  public calculateVitaminARAE(context: Meal | DailyDiet): SourcedValue {
    const foods = flattenFoods(context);

    const RAE_FACTOR_COOKED = 6;
    const LIVNY_COOKED_FRACTION = 0.651;
    const LIVNY_RAW_FRACTION = 0.414;
    const RAE_FACTOR_RAW = RAE_FACTOR_COOKED * (LIVNY_COOKED_FRACTION / LIVNY_RAW_FRACTION); // ≈9.44:1, derivato, non pubblicato così

    let raeMcg = 0;
    let anyFood = false;

    foods.forEach(f => {
      if (f.beta_carotene_mcg > 0) {
        anyFood = true;
        const factor = f.carotenoid_matrix_state === "raw_intact" ? RAE_FACTOR_RAW : RAE_FACTOR_COOKED;
        raeMcg += f.beta_carotene_mcg / factor;
      }
      if (f.other_provitamin_a_carotenoids_mcg > 0) {
        anyFood = true;
        raeMcg += f.other_provitamin_a_carotenoids_mcg / 12; // non aggiustato, vedi commento sopra
      }
    });

    if (!anyFood) {
      return { ...createZeroValue(["NNR2023_OLSEN_LERNER_FNR"]), bioavailabilityAdjusted: false };
    }

    return {
      value: +raeMcg.toFixed(2),
      confidenceLow: null, // nessuna delle due fonti pubblica un intervallo per la combinazione
      confidenceHigh: null,
      evidenceLevel: 4, // ricombinazione nostra di due fonti non co-pubblicate (vedi commento sopra)
      sourceIds: ["NNR2023_OLSEN_LERNER_FNR", "LIVNY_2003_EURJNUTR"],
      verificationStatus: "draft",
      bioavailabilityAdjusted: true // ora sì: un aggiustamento per stato della matrice è realmente applicato al beta-carotene
    };
  }
}
