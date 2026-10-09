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
  // Vedi PRD.md §4.0. true = il valore riflette un vero modello di
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

  // Vitamina B12 e Folati (aggiunti 2026-10-09, vedi PRD.md §4.0 e §4.2)
  vitamin_b12_mcg: number;
  folate_mcg: number;          // folato alimentare "naturale" (non da fortificazione)
  is_fortified_folate: boolean; // true solo per alimenti fortificati con acido folico sintetico

  // Vitamina A / carotenoidi provitaminici (aggiunti 2026-10-09, vedi PRD.md §4.3)
  // NON includiamo ancora il retinolo preformato (fonti animali): l'app
  // non ha ancora un campo per quello, limitazione dichiarata.
  beta_carotene_mcg: number;
  other_provitamin_a_carotenoids_mcg: number; // alfa-carotene, beta-criptoxantina
  // Stato della matrice per il beta-carotene (vedi PRD.md §4.2 — Livny 2003
  // integrato il 2026-10-09 su richiesta esplicita dell'utente, che accetta
  // il rischio di doppio conteggio col fattore RAE medio ("al massimo lo
  // togliamo più avanti come dato")). NON si applica a
  // other_provitamin_a_carotenoids_mcg: Livny ha misurato solo beta-carotene
  // da carote.
  carotenoid_matrix_state: "raw_intact" | "cooked_or_disrupted";

  // Bioaccessibilità dello zinco post-cottura (aggiunto 2026-10-09, vedi
  // PRD.md §4.4). SCOPO VOLUTAMENTE RISTRETTO: Doniec et al. 2022 hanno
  // misurato SOLO cavoletti di Bruxelles, e nel paper stesso gli autori
  // non generalizzano ad altre crucifere (anzi notano che le differenze
  // con altri studi "possono essere dovute proprio alla differenza di
  // specie") -- quindi questo campo NON si chiama "crucifere_cotte" ma
  // nomina esplicitamente l'unico alimento misurato. "none" per tutto il
  // resto (default), incluse tutte le altre crucifere.
  zinc_bioaccessibility_bucket: "none" | "brussels_sprouts_boiled" | "brussels_sprouts_steamed";
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
