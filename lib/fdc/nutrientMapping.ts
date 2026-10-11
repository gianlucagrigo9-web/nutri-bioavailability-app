// lib/fdc/nutrientMapping.ts
//
// Modulo PURO (nessuna chiamata di rete, nessun accesso a Supabase) che
// mappa i 17 `nutrient_code` della tabella `nutrient_values` con
// `source_id = 'USDA_FDC'` ai rispettivi nutrienti nell'API ufficiale
// USDA FoodData Central (https://api.nal.usda.gov/fdc/v1/food/{fdcId}).
//
// Perche' questo file esiste separato dallo script batch
// (scripts/verify_golden_set_batch.ts): e' logica deterministica, senza
// I/O, quindi testabile in questo sandbox (che NON ha accesso di rete a
// api.nal.usda.gov -- vedi docs/PRD.md §9 Fase 4 punto 15) con fixture
// finte. Lo script batch vero (che fa le fetch reali) va eseguito sulla
// macchina dell'utente.
//
// FONTE della mappatura: i "nutrient number" qui sotto (es. "301" per il
// calcio) sono identificatori STABILI e pubblici del catalogo nutrienti
// USDA (li si trova citati nelle stesse pagine food-details di FDC e
// nella documentazione storica SR Legacy/Foundation Foods), non un dato
// specifico di un alimento -- non viola quindi "zero dati inventati"
// (quella regola riguarda i VALORI per singolo alimento, non i codici del
// catalogo). Resta comunque un'assunzione dichiarata: se per un
// particolare alimento FDC riporta un nutriente sotto un "number" diverso
// da quello previsto qui, questo modulo lo classifica come NON TROVATO
// (mai inventato / mai ignorato silenziosamente) -- vedi getMappedFdcValue.
//
// CASO SPECIALE -- other_provitamin_a_carotenoids_mcg: non e' un singolo
// nutriente FDC, ma la somma di "Carotene, alpha" (322) + "Cryptoxanthin,
// beta" (334) -- scelta per coerenza con i valori gia' presenti in
// golden_set_foods.sql (es. food_carrots_raw = 3480, che corrisponde
// all'alfa-carotene FDC di quell'alimento; "Lutein + zeaxanthin" (338) e'
// volutamente ESCLUSO perche' non ha attivita' provitaminica A).
//
// Tolleranza numerica per il confronto DB vs FDC ri-scaricato: i valori
// nel Golden Set sono stati trascritti arrotondati (es. 23.0, 60.0, 127)
// dal valore FDC originale -- un confronto di uguaglianza esatta in
// floating point produrrebbe falsi MISMATCH per puro arrotondamento.
// Soglia dichiarata esplicitamente (non nascosta): MATCH se
// |db - fdc| <= max(TOLERANCE_ABS, TOLERANCE_REL * max(|db|, |fdc|)).
// Qualunque differenza oltre questa soglia e' un MISMATCH reale, mai
// scartata in silenzio.

export const TOLERANCE_ABS = 0.05;
export const TOLERANCE_REL = 0.005; // 0.5%

export type FdcUnit = "G" | "MG" | "UG" | "KCAL";

export interface FdcComponent {
  /** Il campo "number" del nutriente FDC (stringa, es. "301"). */
  fdcNumber: string;
  /** Nome leggibile solo per i log/report, non usato per il match. */
  fdcName: string;
  unit: FdcUnit;
}

/**
 * Un singolo nutriente FDC come appare in foodNutrients[].nutrient / amount
 * nella risposta di GET /v1/food/{fdcId} dell'API ufficiale. Tipizzato in
 * modo permissivo (campi opzionali) perche' lo script batch deve restare
 * difensivo rispetto a varianti di schema reali che non possiamo
 * verificare da questo sandbox (nessun accesso di rete a api.nal.usda.gov).
 */
export interface FdcFoodNutrient {
  amount?: number;
  nutrient?: {
    number?: string;
    name?: string;
    unitName?: string;
  };
}

export interface FdcFoodDetail {
  fdcId?: number;
  description?: string;
  foodNutrients?: FdcFoodNutrient[];
}

/**
 * Mappa nutrient_code (colonna nutrient_values) -> uno o piu' componenti
 * FDC da sommare. Un solo componente nella stragrande maggioranza dei
 * casi; piu' di uno solo per other_provitamin_a_carotenoids_mcg.
 */
export const FDC_NUTRIENT_MAP: Record<string, FdcComponent[]> = {
  protein_g: [{ fdcNumber: "203", fdcName: "Protein", unit: "G" }],
  fat_g: [{ fdcNumber: "204", fdcName: "Total lipid (fat)", unit: "G" }],
  carbohydrates_g: [{ fdcNumber: "205", fdcName: "Carbohydrate, by difference", unit: "G" }],
  energy_kcal: [{ fdcNumber: "208", fdcName: "Energy", unit: "KCAL" }],
  fiber_g: [{ fdcNumber: "291", fdcName: "Fiber, total dietary", unit: "G" }],
  calcium_mg: [{ fdcNumber: "301", fdcName: "Calcium, Ca", unit: "MG" }],
  iron_mg: [{ fdcNumber: "303", fdcName: "Iron, Fe", unit: "MG" }],
  magnesium_mg: [{ fdcNumber: "304", fdcName: "Magnesium, Mg", unit: "MG" }],
  zinc_mg: [{ fdcNumber: "309", fdcName: "Zinc, Zn", unit: "MG" }],
  copper_mg: [{ fdcNumber: "312", fdcName: "Copper, Cu", unit: "MG" }],
  selenium_mcg: [{ fdcNumber: "317", fdcName: "Selenium, Se", unit: "UG" }],
  beta_carotene_mcg: [{ fdcNumber: "321", fdcName: "Carotene, beta", unit: "UG" }],
  vitamin_c_mg: [{ fdcNumber: "401", fdcName: "Vitamin C, total ascorbic acid", unit: "MG" }],
  folate_mcg: [{ fdcNumber: "417", fdcName: "Folate, total", unit: "UG" }],
  vitamin_b12_mcg: [{ fdcNumber: "418", fdcName: "Vitamin B-12", unit: "UG" }],
  vitamin_k_mcg: [{ fdcNumber: "430", fdcName: "Vitamin K (phylloquinone)", unit: "UG" }],
  other_provitamin_a_carotenoids_mcg: [
    { fdcNumber: "322", fdcName: "Carotene, alpha", unit: "UG" },
    { fdcNumber: "334", fdcName: "Cryptoxanthin, beta", unit: "UG" },
  ],
};

/** nutrient_code deliberatamente SENZA mappatura FDC (fonte non è USDA_FDC
 *  in pratica: iodine_mcg, phytates_mg, oxalates_mg, polyphenols_mg,
 *  macs_mg). Usato solo per distinguere in modo esplicito un
 *  "non mappato per scelta" da un bug di battitura nel codice del
 *  codice nutriente -- non e' usato per bloccare nulla, solo per i log. */
export const KNOWN_UNMAPPED_NUTRIENT_CODES = [
  "iodine_mcg",
  "phytates_mg",
  "oxalates_mg",
  "polyphenols_mg",
  "macs_mg",
] as const;

function normalizeFdcUnit(raw: string | undefined | null): FdcUnit | null {
  if (!raw) return null;
  const u = raw.trim().toUpperCase();
  if (u === "G") return "G";
  if (u === "MG") return "MG";
  if (u === "UG" || u === "µG" || u === "MCG") return "UG";
  if (u === "KCAL") return "KCAL";
  return null;
}

export type ComponentLookup =
  | { status: "FOUND"; amount: number; actualUnit: FdcUnit }
  | { status: "NOT_FOUND_IN_FDC" }
  | { status: "UNIT_MISMATCH"; expected: FdcUnit; actual: string | null };

/** Cerca un singolo componente FDC (per "number") in foodNutrients. Non
 *  assume nulla sull'ordine o la completezza dell'array. */
export function lookupFdcComponent(
  foodNutrients: FdcFoodNutrient[] | undefined,
  component: FdcComponent
): ComponentLookup {
  const entry = (foodNutrients ?? []).find(
    (fn) => fn.nutrient?.number === component.fdcNumber
  );
  if (!entry || entry.amount === undefined || entry.amount === null) {
    return { status: "NOT_FOUND_IN_FDC" };
  }
  const actualUnit = normalizeFdcUnit(entry.nutrient?.unitName);
  if (actualUnit !== component.unit) {
    return { status: "UNIT_MISMATCH", expected: component.unit, actual: entry.nutrient?.unitName ?? null };
  }
  return { status: "FOUND", amount: entry.amount, actualUnit };
}

export type MappedValueResult =
  | { status: "OK"; value: number }
  | { status: "NOT_MAPPED" }
  | { status: "NOT_FOUND_IN_FDC"; missingComponents: string[] }
  | { status: "UNIT_MISMATCH"; details: string };

/**
 * Risolve il valore FDC equivalente a un nutrient_code, sommando i
 * componenti mappati. Se ANCHE UN SOLO componente richiesto manca nella
 * risposta FDC, il risultato e' NOT_FOUND_IN_FDC per l'intero
 * nutrient_code -- scelta deliberatamente conservativa: FDC spesso omette
 * del tutto i nutrienti con valore zero/in traccia, quindi "assente"
 * NON viene mai interpretato automaticamente come "zero" (sarebbe un dato
 * inventato). Il prezzo di questa scelta: per alcuni alimenti con
 * other_provitamin_a_carotenoids_mcg=0 nel DB (perche' un componente era
 * davvero a zero/non riportato), questo script non potra' promuoverli
 * automaticamente -- restano draft, segnalati come caso da controllo
 * umano, non silenziosamente forzati a MATCH.
 */
export function getMappedFdcValue(
  foodNutrients: FdcFoodNutrient[] | undefined,
  nutrientCode: string
): MappedValueResult {
  const components = FDC_NUTRIENT_MAP[nutrientCode];
  if (!components) {
    return { status: "NOT_MAPPED" };
  }

  let sum = 0;
  const missing: string[] = [];
  const unitProblems: string[] = [];

  for (const component of components) {
    const lookup = lookupFdcComponent(foodNutrients, component);
    if (lookup.status === "FOUND") {
      sum += lookup.amount;
    } else if (lookup.status === "NOT_FOUND_IN_FDC") {
      missing.push(`${component.fdcName} (FDC #${component.fdcNumber})`);
    } else {
      unitProblems.push(
        `${component.fdcName} (FDC #${component.fdcNumber}): atteso ${lookup.expected}, ricevuto ${lookup.actual ?? "N/D"}`
      );
    }
  }

  if (unitProblems.length > 0) {
    return { status: "UNIT_MISMATCH", details: unitProblems.join("; ") };
  }
  if (missing.length > 0) {
    return { status: "NOT_FOUND_IN_FDC", missingComponents: missing };
  }
  return { status: "OK", value: sum };
}

export type ComparisonClassification = "MATCH" | "MISMATCH";

export interface ComparisonResult {
  classification: ComparisonClassification;
  dbValue: number;
  fdcValue: number;
  diff: number;
  toleranceUsed: number;
}

/** Confronta un valore DB con il valore FDC ri-scaricato usando la
 *  soglia dichiarata in cima al file. Pura funzione, nessun side effect. */
export function compareWithTolerance(dbValue: number, fdcValue: number): ComparisonResult {
  const diff = Math.abs(dbValue - fdcValue);
  const toleranceUsed = Math.max(TOLERANCE_ABS, TOLERANCE_REL * Math.max(Math.abs(dbValue), Math.abs(fdcValue)));
  return {
    classification: diff <= toleranceUsed ? "MATCH" : "MISMATCH",
    dbValue,
    fdcValue,
    diff,
    toleranceUsed,
  };
}
