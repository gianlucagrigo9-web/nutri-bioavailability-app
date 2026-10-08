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
