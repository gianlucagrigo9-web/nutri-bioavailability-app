// lib/engine/goldenSetDietCompatibility.ts
//
// Classificazione dietCompatibility per i 30 alimenti del Golden Set
// (docs/PRD.md §4.9) -- STESSA classificazione di
// add_diet_compatibility_golden_set.sql (root del repo), duplicata qui
// come mappa TypeScript per due motivi dichiarati:
// 1. Il filtro (lib/engine/dietTypeFilter.ts) e il generatore/recommender
//    hanno bisogno di FoodItem.dietCompatibility popolato per essere
//    testabili con dati realistici -- oggi nessun food caricato da
//    Supabase lo ha (la migrazione SQL non è ancora stata eseguita sul
//    DB reale, bloccato in questo sandbox, vedi docs/PENDING_HUMAN_ACTIONS.md).
// 2. Mantenere le due liste sincronizzate manualmente è un rischio
//    dichiarato (Regola 6): GOLDEN_SET_FOOD_IDS sotto e il test
//    `tests/goldenSetDietCompatibility.test.ts` controllano che questa
//    mappa abbia esattamente 30 voci e nessuna violazione logica
//    (vegano implica vegetariano, fruttariano implica vegano) -- non
//    controllano automaticamente che sia IDENTICA al file .sql (nessun
//    modo di eseguire SQL in questo sandbox per confrontarle): se una
//    delle due viene corretta in futuro, l'altra va aggiornata a mano,
//    dichiarato come compito manuale, non automatizzato.
//
// Uso previsto: quando app/page.tsx (o uno script) costruisce i
// FoodItem dal DB, finché la colonna reale non esiste/non è popolata,
// questa mappa può fornire temporaneamente dietCompatibility per i
// soli 30 food_id del Golden Set -- MAI per food_id non elencati qui
// (getGoldenSetDietCompatibility restituisce undefined, mai un default
// indovinato, coerente con la regola "non classificato -> escluso").

export interface DietCompatibilityFlags {
  vegetarian: boolean;
  vegan: boolean;
  fruitarian: boolean;
}

// Carne/pesce/pollame: false su tutti e tre gli assi.
const MEAT_FISH: DietCompatibilityFlags = { vegetarian: false, vegan: false, fruitarian: false };
// Uova/latticini: vegetariano sì, vegano no, fruttariano no.
const EGG_DAIRY: DietCompatibilityFlags = { vegetarian: true, vegan: false, fruitarian: false };
// Frutta fresca: compatibile su tutti e tre gli assi.
const FRESH_FRUIT: DietCompatibilityFlags = { vegetarian: true, vegan: true, fruitarian: true };
// Verdure/legumi/frutta secca/pasta di semola: vegetariano e vegano sì,
// fruttariano no (definizione restrittiva dichiarata nel PRD).
const PLANT_NON_FRUIT: DietCompatibilityFlags = { vegetarian: true, vegan: true, fruitarian: false };

export const GOLDEN_SET_DIET_COMPATIBILITY: Readonly<Record<string, DietCompatibilityFlags>> = {
  food_beef_ground_cooked: MEAT_FISH,
  food_beef_ground_raw: MEAT_FISH,
  food_beef_liver_cooked: MEAT_FISH,
  food_beef_liver_raw: MEAT_FISH,
  food_salmon_cooked: MEAT_FISH,
  food_salmon_raw: MEAT_FISH,

  food_egg_hard_boiled: EGG_DAIRY,
  food_egg_raw: EGG_DAIRY,
  food_milk_whole: EGG_DAIRY,

  food_oranges_raw: FRESH_FRUIT,

  food_almonds: PLANT_NON_FRUIT,
  food_broccoli_boiled: PLANT_NON_FRUIT,
  food_broccoli_raw: PLANT_NON_FRUIT,
  food_brussels_sprouts_boiled: PLANT_NON_FRUIT,
  food_brussels_sprouts_raw: PLANT_NON_FRUIT,
  food_carrots_boiled: PLANT_NON_FRUIT,
  food_carrots_raw: PLANT_NON_FRUIT,
  food_chickpeas_boiled: PLANT_NON_FRUIT,
  food_chickpeas_raw: PLANT_NON_FRUIT,
  food_kale_raw: PLANT_NON_FRUIT,
  food_kidney_beans_boiled: PLANT_NON_FRUIT,
  food_kidney_beans_raw: PLANT_NON_FRUIT,
  food_lentils_boiled: PLANT_NON_FRUIT,
  food_lentils_raw: PLANT_NON_FRUIT,
  food_pasta_enriched_cooked: PLANT_NON_FRUIT,
  food_pasta_enriched_dry: PLANT_NON_FRUIT,
  food_potato_boiled_in_skin: PLANT_NON_FRUIT,
  food_potato_raw: PLANT_NON_FRUIT,
  food_spinach_boiled: PLANT_NON_FRUIT,
  food_spinach_raw: PLANT_NON_FRUIT,
};

/**
 * Restituisce la classificazione per un food_id del Golden Set, o
 * `undefined` se non elencato -- MAI un default indovinato (coerente
 * con la regola "non classificato -> sempre escluso" di dietTypeFilter.ts).
 */
export function getGoldenSetDietCompatibility(foodId: string): DietCompatibilityFlags | undefined {
  return GOLDEN_SET_DIET_COMPATIBILITY[foodId];
}
