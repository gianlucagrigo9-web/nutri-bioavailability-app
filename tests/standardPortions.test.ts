// tests/standardPortions.test.ts
//
// Verifica difensiva delle porzioni standard LARN 2024 (docs/PRD.md §4.8,
// §4.9; lib/engine/standardPortions.ts). Stesso micro test runner
// autosufficiente degli altri file di test del progetto.

import {
  LARN_STANDARD_PORTIONS,
  GOLDEN_SET_STANDARD_PORTIONS,
  getStandardPortionGrams,
  StandardPortionCategory,
} from "../lib/engine/standardPortions";

// ---------------------------------------------------------------------------
// Micro test runner (identico agli altri file di test)
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
    toBeNull() {
      if (actual !== null) throw new Error(`atteso null, ricevuto ${actual}`);
    },
    toBeCloseTo(expected: number, decimals: number) {
      const tol = Math.pow(10, -decimals) / 2;
      if (Math.abs(actual - expected) > tol) {
        throw new Error(`atteso ≈${expected} (±${tol}), ricevuto ${actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) throw new Error(`atteso > ${expected}, ricevuto ${actual}`);
    },
  };
}

describe("LARN_STANDARD_PORTIONS — tabella per categoria (fonte: LARN V Revisione 2024, porzioni standard)", () => {
  it("tutte e 13 le categorie dichiarate sono presenti", () => {
    const categorie: StandardPortionCategory[] = [
      "cereali_primo_asciutto", "pasta_fresca", "legumi_secchi", "legumi_freschi_reidratati",
      "pesce_fresco_surgelato", "carne_fresca_surgelata", "latte", "formaggio_fresco",
      "uova", "verdura", "frutta_fresca", "frutta_secca_oleosa", "tuberi",
    ];
    for (const c of categorie) {
      if (!LARN_STANDARD_PORTIONS[c]) throw new Error(`categoria mancante: ${c}`);
    }
  });

  it("ogni categoria ha grammi positivi e almeno un sourceId (mai un valore senza fonte, Regola 1)", () => {
    for (const key of Object.keys(LARN_STANDARD_PORTIONS) as StandardPortionCategory[]) {
      const ref = LARN_STANDARD_PORTIONS[key];
      if (!(ref.grams > 0)) throw new Error(`${key}: grammi non positivi (${ref.grams})`);
      if (!ref.sourceIds || ref.sourceIds.length === 0) throw new Error(`${key}: nessun sourceId`);
      if (ref.evidenceLevel !== 5) throw new Error(`${key}: evidenceLevel atteso 5`);
    }
  });

  it("cereali per primo asciutto: 80g (valore reale della fonte, non un placeholder tondo per convenienza)", () => {
    expect(LARN_STANDARD_PORTIONS.cereali_primo_asciutto.grams).toBe(80);
  });

  it("verdura: 200g (stesso valore per cruda/cotta, dichiarato nella nota -- la fonte non le separa)", () => {
    expect(LARN_STANDARD_PORTIONS.verdura.grams).toBe(200);
    if (!LARN_STANDARD_PORTIONS.verdura.note) throw new Error("atteso un note che dichiari la mancata separazione cruda/cotta");
  });

  it("latte: 128.75g, con nota esplicita sulla conversione da 125 mL (densita' dichiarata, non dalla fonte LARN)", () => {
    expect(LARN_STANDARD_PORTIONS.latte.grams).toBeCloseTo(128.75, 2);
    if (!LARN_STANDARD_PORTIONS.latte.note) throw new Error("atteso un note sulla conversione mL->g");
  });
});

describe("GOLDEN_SET_STANDARD_PORTIONS — mappatura ai 30 food_id del Golden Set", () => {
  it("esattamente 28 alimenti mappati (30 del Golden Set meno le 2 frattaglie, deliberatamente assenti)", () => {
    expect(Object.keys(GOLDEN_SET_STANDARD_PORTIONS).length).toBe(28);
  });

  it("food_beef_liver_raw/cooked NON sono mappati (gap dichiarato, mai forzati sulla categoria 'carne' generica)", () => {
    expect(getStandardPortionGrams("food_beef_liver_raw")).toBeNull();
    expect(getStandardPortionGrams("food_beef_liver_cooked")).toBeNull();
  });

  it("food_id sconosciuto (non del Golden Set) -> null, mai un default indovinato", () => {
    expect(getStandardPortionGrams("food_quinoa_raw")).toBeNull();
  });

  it("pasta secca: 80g diretto dalla tabella di categoria, nessun campo derived", () => {
    const p = GOLDEN_SET_STANDARD_PORTIONS["food_pasta_enriched_dry"];
    expect(p.grams).toBe(80);
    expect(p.derived).toBe(undefined);
  });

  it("pasta cotta: valore derivato (~187.8g) dalla conservazione dell'energia fra secco e cotto, non preso 1:1 dalla tabella", () => {
    const p = GOLDEN_SET_STANDARD_PORTIONS["food_pasta_enriched_cooked"];
    expect(p.grams).toBeCloseTo(187.8, 1);
    if (!p.derived) throw new Error("atteso un campo derived per la pasta cotta");
    expect(p.derived!.method).toBe("energy_conservation_ratio");
  });

  it("verifica indipendente del calcolo di conservazione dell'energia per la pasta cotta (371 kcal/100g secca, 158 kcal/100g cotta, Golden Set)", () => {
    const kcalDrySource = 371;
    const kcalCookedSource = 158;
    const dryGrams = 80;
    const totalKcal = (dryGrams / 100) * kcalDrySource;
    const expectedCookedGrams = totalKcal / (kcalCookedSource / 100);
    const p = GOLDEN_SET_STANDARD_PORTIONS["food_pasta_enriched_cooked"];
    expect(p.grams).toBeCloseTo(expectedCookedGrams, 0);
  });

  it("legumi: secchi 50g, cotti/reidratati 150g, per tutti e 3 i legumi del Golden Set (ceci, fagioli kidney, lenticchie)", () => {
    for (const base of ["chickpeas", "kidney_beans", "lentils"]) {
      expect(GOLDEN_SET_STANDARD_PORTIONS[`food_${base}_raw`]?.grams).toBe(50);
      expect(GOLDEN_SET_STANDARD_PORTIONS[`food_${base}_boiled`]?.grams).toBe(150);
    }
  });

  it("verdura (6 alimenti, crudo+bollito dove presente): tutti 200g", () => {
    const verdure = [
      "food_broccoli_raw", "food_broccoli_boiled",
      "food_brussels_sprouts_raw", "food_brussels_sprouts_boiled",
      "food_carrots_raw", "food_carrots_boiled",
      "food_kale_raw",
      "food_spinach_raw", "food_spinach_boiled",
    ];
    for (const id of verdure) {
      expect(GOLDEN_SET_STANDARD_PORTIONS[id]?.grams).toBe(200);
    }
  });

  it("ogni alimento mappato referenzia la categoria corretta (category coerente con LARN_STANDARD_PORTIONS)", () => {
    for (const [foodId, portion] of Object.entries(GOLDEN_SET_STANDARD_PORTIONS)) {
      if (!LARN_STANDARD_PORTIONS[portion.category]) {
        throw new Error(`${foodId}: categoria ${portion.category} non esiste in LARN_STANDARD_PORTIONS`);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (porzioni standard LARN 2024) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
