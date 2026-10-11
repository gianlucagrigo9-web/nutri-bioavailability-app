// tests/nutrientTargets.test.ts
//
// Verifica difensiva dei target numerici LARN/EFSA per micronutrienti
// (docs/PRD.md §4.9, lib/engine/nutrientTargets.ts). Stesso micro test
// runner autosufficiente degli altri file di test del progetto.

import { ADULT_NUTRIENT_REFERENCE_VALUES, getNutrientReferenceValue } from "../lib/engine/nutrientTargets";

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
    toBeCloseTo(expected: number, precision = 2) {
      if (Math.abs(actual - expected) > Math.pow(10, -precision)) {
        throw new Error(`atteso ~${expected}, ricevuto ${actual}`);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Valori base per sesso/nutriente (nessun override di età)
// ---------------------------------------------------------------------------
describe("getNutrientReferenceValue — valori base (eta' sotto qualunque soglia di override)", () => {
  it("ferro uomo: 10mg (LARN 2024)", () => {
    expect(getNutrientReferenceValue("iron", "male", 30).value).toBe(10);
  });

  it("ferro donna sotto i 60 anni: 18mg (nessun override)", () => {
    expect(getNutrientReferenceValue("iron", "female", 30).value).toBe(18);
  });

  it("zinco uomo: 12mg, donna: 9mg", () => {
    expect(getNutrientReferenceValue("zinc", "male", 30).value).toBe(12);
    expect(getNutrientReferenceValue("zinc", "female", 30).value).toBe(9);
  });

  it("calcio adulto sotto le soglie di override: 950mg per entrambi i sessi", () => {
    expect(getNutrientReferenceValue("calcium", "male", 30).value).toBe(950);
    expect(getNutrientReferenceValue("calcium", "female", 30).value).toBe(950);
  });

  it("vitamina C: uomo 105mg, donna 85mg", () => {
    expect(getNutrientReferenceValue("vitamin_c", "male", 30).value).toBe(105);
    expect(getNutrientReferenceValue("vitamin_c", "female", 30).value).toBe(85);
  });

  it("vitamina B12: 4mcg per entrambi i sessi (AI)", () => {
    expect(getNutrientReferenceValue("vitamin_b12", "male", 30).value).toBe(4);
    expect(getNutrientReferenceValue("vitamin_b12", "female", 30).value).toBe(4);
    expect(getNutrientReferenceValue("vitamin_b12", "male", 30).category).toBe("AI");
  });

  it("folati (DFE): 330mcg per entrambi i sessi", () => {
    expect(getNutrientReferenceValue("folate_dfe", "male", 30).value).toBe(330);
    expect(getNutrientReferenceValue("folate_dfe", "female", 30).value).toBe(330);
  });

  it("magnesio: 350mg per entrambi i sessi, mai cambia con l'eta' (nessun ageOverride definito)", () => {
    expect(getNutrientReferenceValue("magnesium", "male", 30).value).toBe(350);
    expect(getNutrientReferenceValue("magnesium", "male", 90).value).toBe(350);
    expect(getNutrientReferenceValue("magnesium", "female", 90).value).toBe(350);
  });

  it("rame: uomo 1.4mg, donna 1.3mg (LARN V Revisione 2024, non 0.9mg della IV Revisione 2014)", () => {
    expect(getNutrientReferenceValue("copper", "male", 30).value).toBe(1.4);
    expect(getNutrientReferenceValue("copper", "female", 30).value).toBe(1.3);
  });

  it("selenio: 55mcg per entrambi i sessi", () => {
    expect(getNutrientReferenceValue("selenium", "male", 30).value).toBe(55);
    expect(getNutrientReferenceValue("selenium", "female", 30).value).toBe(55);
  });

  it("iodio: 150mcg per entrambi i sessi (AI)", () => {
    expect(getNutrientReferenceValue("iodine", "male", 30).value).toBe(150);
    expect(getNutrientReferenceValue("iodine", "female", 30).value).toBe(150);
  });

  it("vitamina K: uomo 135mcg, donna 125mcg (AI)", () => {
    expect(getNutrientReferenceValue("vitamin_k", "male", 30).value).toBe(135);
    expect(getNutrientReferenceValue("vitamin_k", "female", 30).value).toBe(125);
  });

  it("vitamina A (RAE): uomo 750mcg, donna 650mcg", () => {
    expect(getNutrientReferenceValue("vitamin_a_rae", "male", 30).value).toBe(750);
    expect(getNutrientReferenceValue("vitamin_a_rae", "female", 30).value).toBe(650);
  });
});

// ---------------------------------------------------------------------------
// Override di eta' — SOLO ferro e calcio, soglie esplicite dalla fonte
// ---------------------------------------------------------------------------
describe("getNutrientReferenceValue — override di eta' (ferro/calcio, proxy post-menopausa dichiarato)", () => {
  it("ferro donna: a 59 anni resta 18mg (sotto soglia 60)", () => {
    expect(getNutrientReferenceValue("iron", "female", 59).value).toBe(18);
  });

  it("ferro donna: esattamente a 60 anni scatta l'override a 10mg (soglia inclusiva)", () => {
    expect(getNutrientReferenceValue("iron", "female", 60).value).toBe(10);
  });

  it("ferro donna: sopra i 60 anni resta a 10mg", () => {
    expect(getNutrientReferenceValue("iron", "female", 75).value).toBe(10);
  });

  it("ferro uomo: nessun override definito a nessuna eta' (resta 10mg anche a 90 anni)", () => {
    expect(getNutrientReferenceValue("iron", "male", 90).value).toBe(10);
  });

  it("calcio uomo: a 64 anni resta 950mg (sotto soglia 65)", () => {
    expect(getNutrientReferenceValue("calcium", "male", 64).value).toBe(950);
  });

  it("calcio uomo: esattamente a 65 anni scatta l'override a 1100mg (soglia esplicita della fonte)", () => {
    expect(getNutrientReferenceValue("calcium", "male", 65).value).toBe(1100);
  });

  it("calcio donna: a 59 anni resta 950mg (sotto soglia 60 -- soglia diversa dall'uomo, dichiarato)", () => {
    expect(getNutrientReferenceValue("calcium", "female", 59).value).toBe(950);
  });

  it("calcio donna: esattamente a 60 anni scatta l'override a 1100mg (proxy post-menopausa, soglia diversa da quella maschile)", () => {
    expect(getNutrientReferenceValue("calcium", "female", 60).value).toBe(1100);
  });
});

// ---------------------------------------------------------------------------
// Architettura difensiva: eta' non fisica non deve mai lanciare né applicare
// un override indebito -- ricade sempre sul valore di default.
// ---------------------------------------------------------------------------
describe("getNutrientReferenceValue — architettura difensiva su eta' non valida", () => {
  it("eta' negativa: nessun override applicato, nessuna eccezione lanciata, valore di default", () => {
    expect(getNutrientReferenceValue("iron", "female", -5).value).toBe(18);
    expect(getNutrientReferenceValue("calcium", "male", -1).value).toBe(950);
  });

  it("eta' NaN: nessun override applicato, nessuna eccezione lanciata, valore di default", () => {
    expect(getNutrientReferenceValue("iron", "female", NaN).value).toBe(18);
  });

  it("eta' Infinity: non finita, trattata come non valida -- nessun override applicato", () => {
    expect(getNutrientReferenceValue("calcium", "female", Infinity).value).toBe(950);
  });

  it("eta' zero: valida (>=0) e sotto qualunque soglia -- valore di default, nessuna eccezione", () => {
    expect(getNutrientReferenceValue("iron", "female", 0).value).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// Metadati dichiarati (Regola 1/3/6): evidenceLevel, sourceIds, categoria
// best-guess, mapping a campo grezzo vs output del motore.
// ---------------------------------------------------------------------------
describe("Metadati dichiarati — evidenceLevel, sourceIds, categoryConfirmed, mapsToRawFoodItemField", () => {
  it("ogni voce ha evidenceLevel=5 (database istituzionale, Regola 3)", () => {
    for (const sex of ["male", "female"] as const) {
      for (const key of Object.keys(ADULT_NUTRIENT_REFERENCE_VALUES[sex]) as Array<keyof typeof ADULT_NUTRIENT_REFERENCE_VALUES["male"]>) {
        const v = ADULT_NUTRIENT_REFERENCE_VALUES[sex][key];
        if (v.evidenceLevel !== 5) throw new Error(`${sex}/${key}: evidenceLevel atteso 5, ricevuto ${v.evidenceLevel}`);
      }
    }
  });

  it("ogni voce ha categoryConfirmed=false (gap dichiarato: formattazione PRI/AI persa nell'estrazione PDF)", () => {
    for (const sex of ["male", "female"] as const) {
      for (const key of Object.keys(ADULT_NUTRIENT_REFERENCE_VALUES[sex]) as Array<keyof typeof ADULT_NUTRIENT_REFERENCE_VALUES["male"]>) {
        const v = ADULT_NUTRIENT_REFERENCE_VALUES[sex][key];
        if (v.categoryConfirmed !== false) throw new Error(`${sex}/${key}: categoryConfirmed atteso false, ricevuto ${v.categoryConfirmed}`);
      }
    }
  });

  it("ogni voce ha almeno un sourceId non vuoto (mai un valore senza fonte dichiarata, Regola 1)", () => {
    for (const sex of ["male", "female"] as const) {
      for (const key of Object.keys(ADULT_NUTRIENT_REFERENCE_VALUES[sex]) as Array<keyof typeof ADULT_NUTRIENT_REFERENCE_VALUES["male"]>) {
        const v = ADULT_NUTRIENT_REFERENCE_VALUES[sex][key];
        if (!v.sourceIds || v.sourceIds.length === 0) throw new Error(`${sex}/${key}: nessun sourceId`);
      }
    }
  });

  it("ferro/zinco/folati/vitamina A: mapsToRawFoodItemField=false (confronto va fatto con l'output del motore, non il campo grezzo)", () => {
    for (const sex of ["male", "female"] as const) {
      for (const key of ["iron", "zinc", "folate_dfe", "vitamin_a_rae"] as const) {
        const v = ADULT_NUTRIENT_REFERENCE_VALUES[sex][key];
        if (v.mapsToRawFoodItemField !== false) throw new Error(`${sex}/${key}: atteso mapsToRawFoodItemField=false`);
        if (!v.engineOutputNote) throw new Error(`${sex}/${key}: atteso un engineOutputNote che spieghi il gap di wiring`);
      }
    }
  });

  it("vitamina C/B12/magnesio/selenio/iodio/vitamina K/calcio: mapsToRawFoodItemField=true (campo grezzo di FoodItem)", () => {
    for (const sex of ["male", "female"] as const) {
      for (const key of ["vitamin_c", "vitamin_b12", "magnesium", "selenium", "iodine", "vitamin_k", "calcium"] as const) {
        const v = ADULT_NUTRIENT_REFERENCE_VALUES[sex][key];
        if (v.mapsToRawFoodItemField !== true) throw new Error(`${sex}/${key}: atteso mapsToRawFoodItemField=true`);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (target numerici LARN/EFSA per micronutrienti) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
