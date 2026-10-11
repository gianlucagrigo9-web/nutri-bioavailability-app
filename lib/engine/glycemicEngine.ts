// lib/engine/glycemicEngine.ts
//
// Indice glicemico (IG) e carico glicemico (CG) -- docs/PRD.md §4.10.
// PROPOSTA scritta e approvata nella stessa sessione del 2026-10-11
// ("andare avanti col resto", dopo aver parcheggiato solo il punto 5
// del recommender -- vedi dietRecommender.ts). Nessun dato IG reale
// e' ancora stato caricato nel Golden Set in questa sessione: questo
// file e' solo l'infrastruttura di calcolo, testata su casi sintetici.
//
// Fonti:
// - Soglie di classificazione IG/CG: Atkinson FS, Foster-Powell K,
//   Brand-Miller JC. "International Tables of Glycemic Index and
//   Glycemic Load Values: 2008." Diabetes Care. 2008;31(12):2281-2283.
//   doi:10.2337/dc08-1239.
// - Aggiustamento grassi/proteine per pasti misti: Ballance S, Knutsen
//   SH, Fosvold OW, et al. "Predicting mixed-meal measured glycaemic
//   index in healthy subjects." Eur J Nutr. 2019;58:2657-2667.
//   doi:10.1007/s00394-018-1813-z. Coefficienti (0.29 grassi, 1.45
//   proteine) presi da una revisione di Wolever (2013) citata nel
//   paper, non stimati da noi.
//
// Scelta dichiarata (Regola 6): NON applichiamo la retta di
// calibrazione finale del paper (MMGI ~= 1.316*Adjusted-CMGI - 13.27),
// fittata sui loro 15 pasti -- overfit al loro campione, non
// generalizzabile ai nostri alimenti. Usiamo solo l'aggiustamento
// moltiplicativo (fisiologicamente motivato, coefficienti da una
// revisione ampia), dichiarato come stima non quanto il modello
// calibrato originale.
//
// Limiti dichiarati dagli stessi autori di Ballance 2019 (da non
// nascondere, Regola 6): validato solo su soggetti sani (non
// diabetici/insulino-resistenti), su pasti a basso contenuto di fibra
// (<5g) -- il modello non modella fibra ne' acidi fenolici/organici;
// l'effetto proteico varia per fonte (tonno piu' debole del pollo nei
// loro dati, non distinto qui); l'effetto dei grassi e' piccolo e
// forse trascurabile quando le proteine sono alte; campione piccolo
// (14 soggetti, 15 pasti dopo esclusioni).

import { FoodItem } from "./types";

// Carico glicemico: null se IG o carboidrati non validi, mai un NaN
// propagato silenziosamente.
export function calculateGL(availableCarbG: number, gi: number | null | undefined): number | null {
  if (gi === null || gi === undefined || !Number.isFinite(gi) || gi < 0) return null;
  if (!Number.isFinite(availableCarbG) || availableCarbG < 0) return null;
  return (availableCarbG * gi) / 100;
}

export type GlycemicBand = "basso" | "medio" | "alto";

// Soglie Atkinson et al. 2008, descrittive (non un vincolo dietetico --
// vedi docs/PRD.md §4.10, "vincolo o informativo").
export function classifyGI(gi: number | null | undefined): GlycemicBand | null {
  if (gi === null || gi === undefined || !Number.isFinite(gi) || gi < 0) return null;
  if (gi <= 55) return "basso";
  if (gi <= 69) return "medio";
  return "alto";
}

export function classifyGL(gl: number | null | undefined): GlycemicBand | null {
  if (gl === null || gl === undefined || !Number.isFinite(gl) || gl < 0) return null;
  if (gl <= 10) return "basso";
  if (gl <= 19) return "medio";
  return "alto";
}

// Carboidrati "disponibili" = totale meno fibra (definizione standard
// usata nelle tabelle IG/CG, non una nostra invenzione -- la fibra non
// e' digerita come i carboidrati disponibili e non alza la glicemia
// allo stesso modo). Clampato a >=0: mai un valore negativo propagato
// per un alimento con dati di composizione incoerenti.
function availableCarbG(food: FoodItem, grams: number): number {
  const factor = Number.isFinite(grams) && grams > 0 ? grams / 100 : 0;
  const raw = (food.carbohydrates_g - food.fiber_g) * factor;
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

export interface MealComponent {
  food: FoodItem;
  grams: number;
  // Alimento "base" carboidratico del pasto (es. il riso in un piatto
  // di riso+verdure+pollo) -- richiesto dal modello Ballance 2019 per
  // calcolare M_fat-F_fat/M_prot-P_prot. Dichiarato esplicitamente dal
  // chiamante, mai indovinato (vedi docs/PRD.md §4.10 punto 5 dei
  // criteri di accettazione). Al massimo un componente per pasto deve
  // averlo true.
  isStaple?: boolean;
}

export interface MixedMealGIResult {
  // Media pesata per carboidrati disponibili (metodo Wolever & Jenkins),
  // nessun aggiustamento. null se nessun componente ha un IG disponibile
  // o se il pasto non ha carboidrati disponibili.
  cmgiNaive: number | null;
  // Aggiustamento moltiplicativo grassi/proteine (Ballance et al. 2019).
  // null quando mixedMealAdjusted e' false.
  adjustedCmgi: number | null;
  // true SOLO quando esattamente un componente e' isStaple:true e
  // cmgiNaive e' calcolabile -- mai un aggiustamento su un'ipotesi
  // indovinata (criterio di accettazione §4.10).
  mixedMealAdjusted: boolean;
  warnings: string[];
}

const BALLANCE_CHO_DECAY = 0.0222;
const BALLANCE_FAT_COEFFICIENT = 0.29;
const BALLANCE_PROTEIN_COEFFICIENT = 1.45;
const FIBER_VALIDATION_THRESHOLD_G = 5; // soglia dei pasti testati in Ballance 2019

/**
 * Stima l'indice glicemico di un pasto misto. Architettura difensiva:
 * nessun input incompleto o ambiguo produce un'eccezione o un
 * aggiustamento inventato -- solo warning espliciti e, dove serve,
 * `null`.
 */
export function calculateMixedMealGI(components: MealComponent[]): MixedMealGIResult {
  const warnings: string[] = [];

  const withGrams = components.filter((c) => Number.isFinite(c.grams) && c.grams > 0);
  if (withGrams.length === 0) {
    return { cmgiNaive: null, adjustedCmgi: null, mixedMealAdjusted: false, warnings: ["nessun componente con grammatura valida nel pasto"] };
  }

  const withGI: Array<{ component: MealComponent; gi: number; carbG: number }> = [];
  for (const c of withGrams) {
    const gi = c.food.glycemicIndex?.value;
    if (gi === undefined || gi === null || !Number.isFinite(gi)) {
      warnings.push(`"${c.food.name}" escluso dal calcolo: nessun indice glicemico disponibile per questo alimento`);
      continue;
    }
    withGI.push({ component: c, gi, carbG: availableCarbG(c.food, c.grams) });
  }

  if (withGI.length === 0) {
    return { cmgiNaive: null, adjustedCmgi: null, mixedMealAdjusted: false, warnings: [...warnings, "nessun alimento del pasto ha un indice glicemico disponibile: impossibile stimare il pasto"] };
  }

  const totalCarbG = withGI.reduce((sum, x) => sum + x.carbG, 0);
  if (totalCarbG <= 0) {
    return { cmgiNaive: null, adjustedCmgi: null, mixedMealAdjusted: false, warnings: [...warnings, "il pasto non contiene carboidrati disponibili: carico/indice glicemico non applicabile"] };
  }

  const cmgiNaive = withGI.reduce((sum, x) => sum + x.gi * x.carbG, 0) / totalCarbG;

  // Fibra totale del pasto (su TUTTI i componenti con grammatura valida,
  // non solo quelli con IG noto -- la fibra conta comunque per la
  // validita' del modello, indipendentemente dal fatto che il suo
  // alimento abbia un IG sourced).
  const totalFiberG = withGrams.reduce((sum, c) => {
    const factor = c.grams / 100;
    const f = c.food.fiber_g * factor;
    return sum + (Number.isFinite(f) && f > 0 ? f : 0);
  }, 0);
  if (totalFiberG > FIBER_VALIDATION_THRESHOLD_G) {
    warnings.push(
      `fibra totale del pasto (${totalFiberG.toFixed(1)}g) supera la soglia dei pasti su cui il modello di aggiustamento e' stato validato (${FIBER_VALIDATION_THRESHOLD_G}g, Ballance et al. 2019) -- l'aggiustamento sotto, se calcolato, va considerato meno affidabile.`
    );
  }

  const staples = withGrams.filter((c) => c.isStaple === true);
  if (staples.length !== 1) {
    warnings.push(
      staples.length === 0
        ? "nessun alimento base dichiarato nel pasto (isStaple): aggiustamento grassi/proteine non applicato, restituita solo la stima naive"
        : `${staples.length} alimenti dichiarati come base (isStaple) nello stesso pasto: ambiguo, aggiustamento grassi/proteine non applicato`
    );
    return { cmgiNaive, adjustedCmgi: null, mixedMealAdjusted: false, warnings };
  }

  const staple = staples[0];
  const stapleFactor = staple.grams / 100;
  const stapleCarbG = availableCarbG(staple.food, staple.grams);
  if (stapleCarbG <= 0) {
    warnings.push("l'alimento base dichiarato non ha carboidrati disponibili: aggiustamento grassi/proteine non applicato (divisione per zero evitata)");
    return { cmgiNaive, adjustedCmgi: null, mixedMealAdjusted: false, warnings };
  }

  const mealFatG = withGrams.reduce((sum, c) => sum + c.food.fat_g * (c.grams / 100), 0);
  const mealProteinG = withGrams.reduce((sum, c) => sum + c.food.protein_g * (c.grams / 100), 0);
  const stapleFatG = staple.food.fat_g * stapleFactor;
  const stapleProteinG = staple.food.protein_g * stapleFactor;

  const adjCho =
    (1 - Math.exp(-BALLANCE_CHO_DECAY * totalCarbG)) / (1 - Math.exp(-BALLANCE_CHO_DECAY * stapleCarbG));
  const adjFat = 1 - BALLANCE_FAT_COEFFICIENT * ((mealFatG - stapleFatG) / 100);
  const adjProtein = 1 - BALLANCE_PROTEIN_COEFFICIENT * ((mealProteinG - stapleProteinG) / 100);

  let adjustedCmgi = cmgiNaive * adjCho * adjFat * adjProtein;
  if (!Number.isFinite(adjustedCmgi)) {
    warnings.push("aggiustamento grassi/proteine non calcolabile (risultato non finito): restituita solo la stima naive");
    return { cmgiNaive, adjustedCmgi: null, mixedMealAdjusted: false, warnings };
  }
  if (adjustedCmgi < 0) {
    warnings.push(
      "l'aggiustamento grassi/proteine ha prodotto un valore negativo (pasto con grassi/proteine molto oltre il range testato in Ballance et al. 2019, 14 soggetti sani): clampato a 0, da considerare poco affidabile per questo pasto."
    );
    adjustedCmgi = 0;
  }

  return { cmgiNaive, adjustedCmgi, mixedMealAdjusted: true, warnings };
}
