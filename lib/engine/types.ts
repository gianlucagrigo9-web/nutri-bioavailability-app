// lib/engine/types.ts
//
// Tipi condivisi da TUTTI i motori (nutrizione, microbiota, cottura, LCA).
// Prima di questo file, ogni motore definiva il proprio FoodItem (FoodItem,
// FoodItemMicrobiota, FoodItemLCA), e il "ponte" della cottura veniva chiamato
// passando un oggetto `any` per far quadrare i tipi in fase di dashboard.
// Un'unica interfaccia elimina il bisogno di `any` e la possibilità che un
// campo richiesto da un motore manchi silenziosamente quando arriva da un altro.

export interface SourcedValue {
  value: number;
  confidenceLow: number | null;
  confidenceHigh: number | null;
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  sourceIds: string[];
  verificationStatus: "draft" | "verified";
  // Vedi docs/PRD.md §4.0. true = il valore riflette un vero modello di
  // assorbimento/biodisponibilità (equazione o fattore di conversione
  // sourced), anche se evidenceLevel e' basso. false/assente = valore di
  // composizione grezza (es. USDA FDC), perche' per questo nutriente non
  // esiste ancora in letteratura verificata un modello di assorbimento --
  // non va confuso con evidenceLevel, che misura la qualita' della fonte,
  // non la presenza di un modello. Campo opzionale: usato dal motore di
  // nutrizione; non si applica a microbiota/LCA (domini diversi).
  bioavailabilityAdjusted?: boolean;
}

export type OxalateCategory = "high_oxalate" | "medium_oxalate" | "low_oxalate";

export interface FoodItem {
  id: string;
  name: string;

  // Nutrizione (ferro / zinco / calcio)
  iron_mg: number;
  zinc_mg: number;
  calcium_mg: number;
  vitamin_c_mg: number;
  phytates_mg: number;
  oxalates_mg: number;
  polyphenols_mg: number;
  is_heme_iron: boolean;
  matrix_category_calcium: OxalateCategory;

  // Microbiota
  macs_mg: number;
  botanical_family: string | null;

  // Vitamina B12 e Folati (aggiunti 2026-10-09, vedi docs/PRD.md §4.0 e §4.2)
  vitamin_b12_mcg: number;
  folate_mcg: number;          // folato alimentare "naturale" (non da fortificazione)
  is_fortified_folate: boolean; // true solo per alimenti fortificati con acido folico sintetico

  // Vitamina A / carotenoidi provitaminici (aggiunti 2026-10-09, vedi docs/PRD.md §4.3)
  // NON includiamo ancora il retinolo preformato (fonti animali): l'app
  // non ha ancora un campo per quello, limitazione dichiarata.
  beta_carotene_mcg: number;
  other_provitamin_a_carotenoids_mcg: number; // alfa-carotene, beta-criptoxantina
  // Stato della matrice per il beta-carotene (vedi docs/PRD.md §4.2 — Livny 2003
  // integrato il 2026-10-09 su richiesta esplicita dell'utente, che accetta
  // il rischio di doppio conteggio col fattore RAE medio ("al massimo lo
  // togliamo più avanti come dato")). NON si applica a
  // other_provitamin_a_carotenoids_mcg: Livny ha misurato solo beta-carotene
  // da carote.
  carotenoid_matrix_state: "raw_intact" | "cooked_or_disrupted";

  // Bioaccessibilità dello zinco post-cottura (aggiunto 2026-10-09, vedi
  // docs/PRD.md §4.4). SCOPO VOLUTAMENTE RISTRETTO: Doniec et al. 2022 hanno
  // misurato SOLO cavoletti di Bruxelles, e nel paper stesso gli autori
  // non generalizzano ad altre crucifere (anzi notano che le differenze
  // con altri studi "possono essere dovute proprio alla differenza di
  // specie") -- quindi questo campo NON si chiama "crucifere_cotte" ma
  // nomina esplicitamente l'unico alimento misurato. "none" per tutto il
  // resto (default), incluse tutte le altre crucifere.
  zinc_bioaccessibility_bucket: "none" | "brussels_sprouts_boiled" | "brussels_sprouts_steamed";

  // Micronutrienti "senza modello di biodisponibilità pubblicato" (aggiunti
  // 2026-10-09, vedi docs/PRD.md §4.0 e §4.5). Per questi non esiste, nella
  // letteratura recuperata finora, un'equazione di assorbimento citabile
  // come per ferro/zinco/calcio/B12: vengono quindi mostrati come
  // composizione grezza (sourced a un database di composizione, es. USDA
  // FDC), con bioavailabilityAdjusted=false -- "info sommarie" per usare
  // le parole dell'utente, distinguibili in UI da quelle con un vero
  // modello. Elenco scelto fra quelli già citati come esempio in §4.0.
  magnesium_mg: number;
  copper_mg: number;
  selenium_mcg: number;
  iodine_mcg: number;
  vitamin_k_mcg: number; // fillochinone (K1); non distingue K1/K2, limitazione dichiarata

  // Macronutrienti (aggiunti 2026-10-10, richiesta esplicita dell'utente:
  // "non abbiamo da nessuna parte i macro"). Stesso trattamento di
  // magnesio/rame/selenio/iodio/vitamina K: nessun modello di
  // biodisponibilità pubblicato applicato qui (la digeribilità proteica
  // tipo PDCAAS/DIAAS esiste in letteratura ma non è implementata --
  // limite dichiarato, non introdotto ora), quindi composizione grezza,
  // bioavailabilityAdjusted=false. energy_kcal è energia totale (Atwater),
  // non "energia netta disponibile" -- nessuna correzione per fibra/
  // alcol zuccheri applicata.
  energy_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface Meal {
  foods: FoodItem[];
}

export interface DailyDiet {
  meals: Meal[];
}

export function isDailyDiet(context: Meal | DailyDiet): context is DailyDiet {
  return "meals" in context;
}

export function flattenFoods(context: Meal | DailyDiet): FoodItem[] {
  return isDailyDiet(context) ? context.meals.flatMap(m => m.foods) : context.foods;
}

// Campi di FoodItem che rappresentano una quantità di nutriente per 100g
// (tutti i valori salvati in nutrient_values seguono la convenzione USDA
// "per 100g"). Scalati linearmente dalla grammatura reale della porzione.
// ESCLUSI deliberatamente: id, name (identità, non quantità), is_heme_iron/
// matrix_category_calcium/botanical_family/is_fortified_folate/
// carotenoid_matrix_state/zinc_bioaccessibility_bucket (categorici/booleani:
// restano gli stessi indipendentemente da quanto l'alimento viene mangiato —
// scalarli non avrebbe senso fisico, es. "mezzo booleano").
const SCALABLE_NUTRIENT_FIELDS = [
  "iron_mg", "zinc_mg", "calcium_mg", "vitamin_c_mg", "phytates_mg",
  "oxalates_mg", "polyphenols_mg", "macs_mg", "vitamin_b12_mcg",
  "folate_mcg", "beta_carotene_mcg", "other_provitamin_a_carotenoids_mcg",
  "magnesium_mg", "copper_mg", "selenium_mcg", "iodine_mcg", "vitamin_k_mcg",
  "energy_kcal", "protein_g", "carbohydrates_g", "fat_g", "fiber_g",
] as const satisfies readonly (keyof FoodItem)[];

/**
 * Scala un FoodItem (i cui valori nutrienti sono sempre per 100g, convenzione
 * USDA) alla grammatura REALE della porzione nel piatto. Pura funzione di
 * moltiplicazione lineare: non introduce alcun modello nuovo, non tocca i
 * campi categorici (vedi SCALABLE_NUTRIENT_FIELDS sopra).
 *
 * Architettura difensiva: un input non fisico (grammi negativi, NaN, non
 * finito) non produce mai NaN/Infinity propagato silenziosamente nel resto
 * della UI -- viene trattato come 0g (porzione assente), il comportamento
 * più sicuro quando l'input non è interpretabile, mai un valore inventato.
 */
export function scaleFoodItemToGrams(food: FoodItem, grams: number): FoodItem {
  const safeGrams = Number.isFinite(grams) && grams > 0 ? grams : 0;
  const factor = safeGrams / 100;
  const scaled: FoodItem = { ...food };
  for (const field of SCALABLE_NUTRIENT_FIELDS) {
    (scaled[field] as number) = food[field] * factor;
  }
  return scaled;
}

export function createZeroValue(sources: string[]): SourcedValue {
  return {
    value: 0,
    confidenceLow: 0,
    confidenceHigh: 0,
    evidenceLevel: 5,
    sourceIds: sources,
    verificationStatus: "verified"
  };
}
