// tests/fdcVerification.test.ts
//
// Suite di test REALE eseguita (non solo proposta) contro la logica pura
// in lib/fdc/nutrientMapping.ts -- la parte del batch di verifica (Fase 4
// punto 15, docs/PRD.md §9) che NON richiede rete né Supabase, quindi
// eseguibile anche in questo sandbox (che non ha accesso diretto a
// api.nal.usda.gov né a Supabase -- vedi lo stesso §9). Lo script
// scripts/verify_golden_set_batch.ts che fa le fetch reali va invece
// eseguito sulla macchina dell'utente e non è testato qui.
//
// Stesso micro test runner autosufficiente di tests/engines.test.ts
// (niente vitest/jest: non installati in questo ambiente), duplicato
// qui deliberatamente invece di condiviso via import, per coerenza con
// com'è già strutturato quel file (self-contained, eseguito con tsx).

import {
  FDC_NUTRIENT_MAP,
  getMappedFdcValue,
  lookupFdcComponent,
  compareWithTolerance,
  TOLERANCE_ABS,
  type FdcFoodNutrient,
} from "../lib/fdc/nutrientMapping";

// ---------------------------------------------------------------------------
// Micro test runner (identico a tests/engines.test.ts)
// ---------------------------------------------------------------------------
type Result = { name: string; status: "PASS" | "FAIL"; detail?: string };
const results: Result[] = [];
let currentSuite = "";

function describe(name: string, fn: () => void) {
  currentSuite = name;
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name: `${currentSuite} :: ${name}`, status: "PASS" });
  } catch (e: any) {
    results.push({ name: `${currentSuite} :: ${name}`, status: "FAIL", detail: e.message });
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`atteso ${expected}, ricevuto ${actual}`);
    },
    toBeCloseTo(expected: number, decimals: number) {
      const tol = Math.pow(10, -decimals) / 2;
      if (Math.abs(actual - expected) > tol) {
        throw new Error(`atteso ≈${expected} (±${tol}), ricevuto ${actual}`);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Fixture: risposte FDC FINTE (nessuna chiamata di rete). Numeri scelti
// per rispecchiare lo stesso ordine di grandezza dei valori reali già in
// golden_set_foods.sql, ma sono dati sintetici di test, non valori di un
// alimento vero.
// ---------------------------------------------------------------------------
function fdcNutrient(number: string, name: string, unitName: string, amount: number): FdcFoodNutrient {
  return { amount, nutrient: { number, name, unitName } };
}

const CARROTS_RAW_FAKE: FdcFoodNutrient[] = [
  fdcNutrient("203", "Protein", "G", 0.93),
  fdcNutrient("204", "Total lipid (fat)", "G", 0.24),
  fdcNutrient("205", "Carbohydrate, by difference", "G", 9.58),
  fdcNutrient("208", "Energy", "KCAL", 41),
  fdcNutrient("291", "Fiber, total dietary", "G", 2.8),
  fdcNutrient("301", "Calcium, Ca", "MG", 33),
  fdcNutrient("321", "Carotene, beta", "UG", 8285),
  fdcNutrient("322", "Carotene, alpha", "UG", 3477),
  // Cryptoxanthin, beta (334) deliberatamente ASSENTE -- replica il caso
  // reale in cui FDC omette un nutriente in traccia invece di riportare 0.
];

describe("lookupFdcComponent — ricerca di un singolo componente", () => {
  it("trova un componente presente con unità corretta", () => {
    const r = lookupFdcComponent(CARROTS_RAW_FAKE, { fdcNumber: "301", fdcName: "Calcium, Ca", unit: "MG" });
    expect(r.status).toBe("FOUND");
    if (r.status === "FOUND") expect(r.amount).toBe(33);
  });

  it("segnala NOT_FOUND_IN_FDC per un componente assente dall'array", () => {
    const r = lookupFdcComponent(CARROTS_RAW_FAKE, { fdcNumber: "334", fdcName: "Cryptoxanthin, beta", unit: "UG" });
    expect(r.status).toBe("NOT_FOUND_IN_FDC");
  });

  it("segnala UNIT_MISMATCH se l'unità riportata da FDC non è quella attesa (mai convertita a caso)", () => {
    const fakeWrongUnit: FdcFoodNutrient[] = [fdcNutrient("301", "Calcium, Ca", "G", 0.033)];
    const r = lookupFdcComponent(fakeWrongUnit, { fdcNumber: "301", fdcName: "Calcium, Ca", unit: "MG" });
    expect(r.status).toBe("UNIT_MISMATCH");
  });

  it("riconosce varianti di scrittura dell'unità dei microgrammi (UG/µg/mcg) senza convertire il valore", () => {
    const fakeLowercase: FdcFoodNutrient[] = [fdcNutrient("317", "Selenium, Se", "ug", 0.4)];
    const r = lookupFdcComponent(fakeLowercase, { fdcNumber: "317", fdcName: "Selenium, Se", unit: "UG" });
    expect(r.status).toBe("FOUND");
  });
});

describe("getMappedFdcValue — risoluzione di un intero nutrient_code", () => {
  it("nutrient_code a singolo componente: ritorna il valore diretto", () => {
    const r = getMappedFdcValue(CARROTS_RAW_FAKE, "calcium_mg");
    expect(r.status).toBe("OK");
    if (r.status === "OK") expect(r.value).toBe(33);
  });

  it("nutrient_code multi-componente (other_provitamin_a_carotenoids_mcg): NOT_FOUND se manca anche un solo componente, non assume zero", () => {
    // CARROTS_RAW_FAKE ha alpha-carotene (322) ma NON cryptoxanthin (334) --
    // deve essere NOT_FOUND_IN_FDC, non "3477" per silenziosa somma parziale.
    const r = getMappedFdcValue(CARROTS_RAW_FAKE, "other_provitamin_a_carotenoids_mcg");
    expect(r.status).toBe("NOT_FOUND_IN_FDC");
    if (r.status === "NOT_FOUND_IN_FDC") {
      if (r.missingComponents.length !== 1) throw new Error(`attesi esattamente 1 componente mancante, ricevuti ${r.missingComponents.length}`);
    }
  });

  it("nutrient_code multi-componente: somma correttamente quando TUTTI i componenti sono presenti", () => {
    const bothPresent: FdcFoodNutrient[] = [
      fdcNutrient("322", "Carotene, alpha", "UG", 3477),
      fdcNutrient("334", "Cryptoxanthin, beta", "UG", 3),
    ];
    const r = getMappedFdcValue(bothPresent, "other_provitamin_a_carotenoids_mcg");
    expect(r.status).toBe("OK");
    if (r.status === "OK") expect(r.value).toBe(3480);
  });

  it("nutrient_code senza mappatura (es. macs_mg, non viene da USDA_FDC): NOT_MAPPED, mai un crash né un valore a caso", () => {
    const r = getMappedFdcValue(CARROTS_RAW_FAKE, "macs_mg");
    expect(r.status).toBe("NOT_MAPPED");
  });

  it("tutti e 17 i nutrient_code noti con source_id=USDA_FDC hanno una mappatura definita (sentinella anti-disallineamento)", () => {
    const expected17 = [
      "beta_carotene_mcg", "calcium_mg", "carbohydrates_g", "copper_mg", "energy_kcal",
      "fat_g", "fiber_g", "folate_mcg", "iron_mg", "magnesium_mg",
      "other_provitamin_a_carotenoids_mcg", "protein_g", "selenium_mcg", "vitamin_b12_mcg",
      "vitamin_c_mg", "vitamin_k_mcg", "zinc_mg",
    ];
    for (const code of expected17) {
      if (!FDC_NUTRIENT_MAP[code]) throw new Error(`manca la mappatura FDC per ${code}`);
    }
    if (Object.keys(FDC_NUTRIENT_MAP).length !== expected17.length) {
      throw new Error(`attese esattamente ${expected17.length} mappature, trovate ${Object.keys(FDC_NUTRIENT_MAP).length}`);
    }
  });
});

describe("compareWithTolerance — soglia dichiarata per il confronto DB vs FDC", () => {
  it("valori identici sono MATCH", () => {
    const r = compareWithTolerance(100, 100);
    expect(r.classification).toBe("MATCH");
  });

  it("piccola differenza di arrotondamento (entro TOLERANCE_ABS) è MATCH", () => {
    const r = compareWithTolerance(60.0, 60.0 + TOLERANCE_ABS / 2);
    expect(r.classification).toBe("MATCH");
  });

  it("differenza chiaramente oltre soglia è MISMATCH, mai scartata in silenzio", () => {
    const r = compareWithTolerance(60, 75);
    expect(r.classification).toBe("MISMATCH");
  });

  it("per valori grandi la tolleranza relativa (0.5%) domina su quella assoluta", () => {
    // 3480 * 0.5% = 17.4 di tolleranza -> una diff di 10 deve restare MATCH
    const r = compareWithTolerance(3480, 3470);
    expect(r.classification).toBe("MATCH");
  });

  it("per valori grandi una diff oltre la tolleranza relativa è MISMATCH", () => {
    const r = compareWithTolerance(3480, 3000);
    expect(r.classification).toBe("MISMATCH");
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione di tests/engines.test.ts)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (eseguiti contro lib/fdc/nutrientMapping.ts) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
