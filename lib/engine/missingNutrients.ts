// lib/engine/missingNutrients.ts
//
// Modulo PURO (nessun I/O) per distinguere "il nutriente vale zero" da "il
// dato per questo nutriente non esiste nella letteratura consultata".
//
// Decisione dell'utente (2026-10-22): gli alimenti con pochi nutrienti
// trovati entrano comunque nell'app; un nutriente assente non deve apparire
// come uno zero. Nel database l'assenza e' gia' rappresentata correttamente
// (nessuna riga in nutrient_values: scripts/add_food_from_fdc.ts non
// inserisce MAI uno zero per un'assenza). Il problema era solo in lettura:
// app/page.tsx convertiva la riga mancante in 0 (i motori vogliono un
// numero) senza dire nulla. Qui nasce l'informazione che mancava: per ogni
// FoodItem, l'elenco dei campi senza dato (FoodItem.missingNutrients).
//
// I valori numerici dei motori restano a 0 per quei campi (limite
// dichiarato: i motori non sanno distinguere); la UI usa questo modulo per
// mostrare "n.d." al posto dello zero e per elencare quali alimenti hanno la
// lacuna. Un totale del pasto con una lacuna parziale e' quindi
// un'eventuale SOTTOSTIMA, mai un "zero" certo: la UI lo dichiara.

import { FoodItem, NutrientFieldName, SCALABLE_NUTRIENT_FIELDS } from "./types";

export const NUTRIENT_LABELS_IT: Record<NutrientFieldName, string> = {
  iron_mg: "Ferro",
  zinc_mg: "Zinco",
  calcium_mg: "Calcio",
  vitamin_c_mg: "Vitamina C",
  phytates_mg: "Fitati",
  oxalates_mg: "Ossalati",
  polyphenols_mg: "Polifenoli",
  macs_mg: "MACs (carboidrati accessibili al microbiota)",
  vitamin_b12_mcg: "Vitamina B12",
  folate_mcg: "Folati",
  beta_carotene_mcg: "Beta-carotene",
  other_provitamin_a_carotenoids_mcg: "Altri carotenoidi provitamina A",
  magnesium_mg: "Magnesio",
  copper_mg: "Rame",
  selenium_mcg: "Selenio",
  iodine_mcg: "Iodio",
  vitamin_k_mcg: "Vitamina K",
  energy_kcal: "Energia",
  protein_g: "Proteine",
  carbohydrates_g: "Carboidrati",
  fat_g: "Grassi",
  fiber_g: "Fibra",
};

/**
 * Dati i nutrient_code realmente presenti in nutrient_values per un
 * alimento, restituisce i campi nutriente di FoodItem che NON hanno
 * nessuna riga (ordine canonico di SCALABLE_NUTRIENT_FIELDS). Codici
 * sconosciuti o duplicati sono ignorati: non inventa mai un campo.
 */
export function computeMissingNutrients(presentCodes: Iterable<string>): NutrientFieldName[] {
  const present = new Set<string>(presentCodes);
  return SCALABLE_NUTRIENT_FIELDS.filter((f) => !present.has(f));
}

export interface NutrientGap {
  /** true solo se il pasto ha almeno un alimento e TUTTI mancano di TUTTI i campi indicati. */
  unavailable: boolean;
  /** Nomi (senza doppioni) degli alimenti a cui manca almeno uno dei campi indicati. */
  foodsWithGap: string[];
}

function lacks(food: FoodItem, field: NutrientFieldName): boolean {
  // missingNutrients assente = nessuna informazione = nessuna lacuna dichiarata.
  return (food.missingNutrients ?? []).includes(field);
}

/**
 * Stato di un nutriente (o di un gruppo di campi che concorrono allo stesso
 * punteggio, es. vitamina A = beta-carotene + altri carotenoidi) in un pasto.
 */
export function describeNutrientGap(foods: FoodItem[], fields: NutrientFieldName[]): NutrientGap {
  const unavailable = foods.length > 0 && foods.every((f) => fields.every((field) => lacks(f, field)));
  const names: string[] = [];
  for (const f of foods) {
    if (fields.some((field) => lacks(f, field)) && !names.includes(f.name)) names.push(f.name);
  }
  return { unavailable, foodsWithGap: names };
}

export interface MealMissingEntry {
  field: NutrientFieldName;
  label: string;
  foodNames: string[];
  allFoodsMissing: boolean;
}

/** Riepilogo per nutriente delle lacune nel pasto (vuoto se nessuna), in ordine canonico. */
export function summarizeMissingInMeal(foods: FoodItem[]): MealMissingEntry[] {
  const out: MealMissingEntry[] = [];
  for (const field of SCALABLE_NUTRIENT_FIELDS) {
    const gap = describeNutrientGap(foods, [field]);
    if (gap.foodsWithGap.length > 0) {
      out.push({
        field,
        label: NUTRIENT_LABELS_IT[field],
        foodNames: gap.foodsWithGap,
        allFoodsMissing: gap.unavailable,
      });
    }
  }
  return out;
}
