// tests/glycemicEngine.test.ts
//
// Suite di test REALE eseguita contro la logica pura del motore
// glicemico (docs/PRD.md §4.10 -- design proposto e approvato il
// 2026-10-11, "andare avanti col resto"). Nessuna rete/Supabase
// coinvolta. Stesso micro test runner autosufficiente degli altri
// file di test.

import { calculateGL, classifyGI, classifyGL, calculateMixedMealGI, MealComponent, getTimeOfDayGlycemicNote } from "../lib/engine/glycemicEngine";
import { FoodItem, SourcedValue } from "../lib/engine/types";

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
    toBeTrue() {
      if (actual !== true) throw new Error(`atteso true, ricevuto ${actual}`);
    },
    toBeFalse() {
      if (actual !== false) throw new Error(`atteso false, ricevuto ${actual}`);
    },
    toContainMatch(substring: string) {
      const found = Array.isArray(actual) && actual.some((s: string) => s.includes(substring));
      if (!found) throw new Error(`nessuna stringa in ${JSON.stringify(actual)} contiene "${substring}"`);
    },
  };
}

// ---------------------------------------------------------------------------
// Helper: stesso pattern makeFood degli altri file, estesa con GI opzionale
// ---------------------------------------------------------------------------
function makeGI(value: number, overrides: Partial<SourcedValue> = {}): SourcedValue {
  return {
    value,
    confidenceLow: null,
    confidenceHigh: null,
    evidenceLevel: 2,
    sourceIds: ["SCAZZINA_2016_NMCD"],
    verificationStatus: "draft",
    ...overrides,
  };
}

function makeFood(overrides: Partial<FoodItem> = {}): FoodItem {
  return {
    id: overrides.id ?? "test-food",
    name: overrides.name ?? "Test food",
    iron_mg: 0,
    zinc_mg: 0,
    calcium_mg: 0,
    vitamin_c_mg: 0,
    phytates_mg: 0,
    oxalates_mg: 0,
    polyphenols_mg: 0,
    is_heme_iron: false,
    matrix_category_calcium: "medium_oxalate",
    macs_mg: 0,
    botanical_family: null,
    vitamin_b12_mcg: 0,
    folate_mcg: 0,
    is_fortified_folate: false,
    beta_carotene_mcg: 0,
    other_provitamin_a_carotenoids_mcg: 0,
    carotenoid_matrix_state: "cooked_or_disrupted",
    zinc_bioaccessibility_bucket: "none",
    magnesium_mg: 0,
    copper_mg: 0,
    selenium_mcg: 0,
    iodine_mcg: 0,
    vitamin_k_mcg: 0,
    energy_kcal: 0,
    protein_g: 0,
    carbohydrates_g: 0,
    fat_g: 0,
    fiber_g: 0,
    ...overrides,
  };
}

// =============================================================================
// calculateGL
// =============================================================================
describe("calculateGL — carico glicemico (Atkinson et al. 2008)", () => {
  it("caso normale: 30g carboidrati disponibili, IG 70 -> CG 21", () => {
    expect(calculateGL(30, 70)).toBeCloseTo(21, 5);
  });
  it("IG null -> null (mai un NaN propagato)", () => {
    expect(calculateGL(30, null)).toBeNull();
  });
  it("IG undefined -> null", () => {
    expect(calculateGL(30, undefined)).toBeNull();
  });
  it("carboidrati negativi -> null", () => {
    expect(calculateGL(-5, 70)).toBeNull();
  });
  it("IG negativo -> null (non fisico)", () => {
    expect(calculateGL(30, -10)).toBeNull();
  });
  it("carboidrati zero -> CG zero (non null: zero e' un valore valido)", () => {
    expect(calculateGL(0, 70)).toBe(0);
  });
});

// =============================================================================
// classifyGI / classifyGL
// =============================================================================
describe("classifyGI — soglie Atkinson et al. 2008 (classificazione descrittiva, non vincolo)", () => {
  it("54 -> basso", () => { expect(classifyGI(54)).toBe("basso"); });
  it("55 -> basso (confine incluso)", () => { expect(classifyGI(55)).toBe("basso"); });
  it("56 -> medio", () => { expect(classifyGI(56)).toBe("medio"); });
  it("69 -> medio (confine incluso)", () => { expect(classifyGI(69)).toBe("medio"); });
  it("70 -> alto", () => { expect(classifyGI(70)).toBe("alto"); });
  it("null -> null, mai una classificazione inventata", () => { expect(classifyGI(null)).toBeNull(); });
});

describe("classifyGL — soglie Atkinson et al. 2008 (per porzione)", () => {
  it("10 -> basso (confine incluso)", () => { expect(classifyGL(10)).toBe("basso"); });
  it("11 -> medio", () => { expect(classifyGL(11)).toBe("medio"); });
  it("19 -> medio (confine incluso)", () => { expect(classifyGL(19)).toBe("medio"); });
  it("20 -> alto", () => { expect(classifyGL(20)).toBe("alto"); });
  it("null -> null", () => { expect(classifyGL(null)).toBeNull(); });
});

// =============================================================================
// calculateMixedMealGI
// =============================================================================
describe("calculateMixedMealGI — Wolever/Jenkins + aggiustamento Ballance et al. 2019", () => {
  it("pasto vuoto -> null, warning esplicito", () => {
    const result = calculateMixedMealGI([]);
    expect(result.cmgiNaive).toBeNull();
    expect(result.mixedMealAdjusted).toBeFalse();
    expect(result.warnings).toContainMatch("nessun componente");
  });

  it("nessun componente ha IG disponibile -> cmgiNaive null, warning per ogni alimento escluso", () => {
    const riso = makeFood({ name: "Riso", carbohydrates_g: 28, fiber_g: 0.4 });
    const components: MealComponent[] = [{ food: riso, grams: 200, isStaple: true }];
    const result = calculateMixedMealGI(components);
    expect(result.cmgiNaive).toBeNull();
    expect(result.warnings).toContainMatch("escluso dal calcolo");
  });

  it("un solo alimento con IG, nessun isStaple dichiarato -> cmgiNaive calcolato ma SENZA aggiustamento", () => {
    const pane = makeFood({ name: "Pane bianco", carbohydrates_g: 50, fiber_g: 2.5, glycemicIndex: makeGI(75) });
    const components: MealComponent[] = [{ food: pane, grams: 100 }]; // isStaple non dichiarato
    const result = calculateMixedMealGI(components);
    expect(result.cmgiNaive).toBeCloseTo(75, 3);
    expect(result.mixedMealAdjusted).toBeFalse();
    expect(result.adjustedCmgi).toBeNull();
    expect(result.warnings).toContainMatch("nessun alimento base dichiarato");
  });

  it("due alimenti dichiarati come isStaple -> ambiguo, nessun aggiustamento", () => {
    const a = makeFood({ id: "a", carbohydrates_g: 50, fiber_g: 1, glycemicIndex: makeGI(70) });
    const b = makeFood({ id: "b", carbohydrates_g: 40, fiber_g: 1, glycemicIndex: makeGI(60) });
    const components: MealComponent[] = [
      { food: a, grams: 100, isStaple: true },
      { food: b, grams: 100, isStaple: true },
    ];
    const result = calculateMixedMealGI(components);
    expect(result.mixedMealAdjusted).toBeFalse();
    expect(result.warnings).toContainMatch("ambiguo");
  });

  it("pasto con staple + aggiunta di proteine/grassi -> aggiustamento abbassa la stima rispetto alla naive (effetto noto in letteratura)", () => {
    // Patata (staple) + pollo (proteine, IG irrilevante/assente -> escluso dalla media pesata
    // ma conta comunque per l'aggiustamento fat/protein, che usa l'intero pasto).
    const patata = makeFood({ id: "patata", name: "Patata bollita", carbohydrates_g: 17, fiber_g: 2.2, fat_g: 0.1, protein_g: 2, glycemicIndex: makeGI(78) });
    const pollo = makeFood({ id: "pollo", name: "Petto di pollo", carbohydrates_g: 0, fiber_g: 0, fat_g: 3, protein_g: 31 }); // nessun IG: alimento non glicemico
    const components: MealComponent[] = [
      { food: patata, grams: 200, isStaple: true },
      { food: pollo, grams: 150 },
    ];
    const result = calculateMixedMealGI(components);
    expect(result.cmgiNaive).toBeCloseTo(78, 3); // unico alimento con IG pesa 100%
    expect(result.mixedMealAdjusted).toBeTrue();
    // L'aggiunta di proteine (pollo) deve abbassare la stima aggiustata rispetto alla naive.
    if (result.adjustedCmgi === null) throw new Error("adjustedCmgi non dovrebbe essere null in questo scenario");
    if (!(result.adjustedCmgi < result.cmgiNaive!)) {
      throw new Error(`atteso adjustedCmgi (${result.adjustedCmgi}) < cmgiNaive (${result.cmgiNaive}) per l'aggiunta di proteine`);
    }
  });

  it("fibra totale del pasto > 5g -> warning esplicito di validita' del modello", () => {
    const avena = makeFood({ id: "avena", carbohydrates_g: 60, fiber_g: 10, fat_g: 7, protein_g: 13, glycemicIndex: makeGI(55) });
    const components: MealComponent[] = [{ food: avena, grams: 100, isStaple: true }];
    const result = calculateMixedMealGI(components);
    expect(result.warnings).toContainMatch("supera la soglia");
  });

  it("alimento base senza carboidrati disponibili -> nessun aggiustamento (divisione per zero evitata)", () => {
    const strano = makeFood({ id: "strano", carbohydrates_g: 0, fiber_g: 0, glycemicIndex: makeGI(50) });
    const contorno = makeFood({ id: "contorno", carbohydrates_g: 10, fiber_g: 1, glycemicIndex: makeGI(40) });
    const components: MealComponent[] = [
      { food: strano, grams: 100, isStaple: true },
      { food: contorno, grams: 100 },
    ];
    const result = calculateMixedMealGI(components);
    expect(result.mixedMealAdjusted).toBeFalse();
    expect(result.warnings).toContainMatch("divisione per zero evitata");
  });

  it("componenti con grammatura zero/non valida vengono ignorati, mai un NaN propagato", () => {
    const pane = makeFood({ carbohydrates_g: 50, fiber_g: 2, glycemicIndex: makeGI(75) });
    const components: MealComponent[] = [
      { food: pane, grams: 100, isStaple: true },
      { food: pane, grams: 0 },
      { food: pane, grams: NaN },
    ];
    const result = calculateMixedMealGI(components);
    expect(result.cmgiNaive).toBeCloseTo(75, 3);
  });
});

// =============================================================================
// getTimeOfDayGlycemicNote — tendenza qualitativa, mai un numero inventato
// =============================================================================
describe("getTimeOfDayGlycemicNote — Egli 2020 / Takahashi 2018 / Leung 2020 (direzione, non grandezza)", () => {
  it("colazione -> tendenza migliore_tolleranza, evidenceLevel 1, fonti presenti", () => {
    const result = getTimeOfDayGlycemicNote("colazione");
    expect(result.tendency).toBe("migliore_tolleranza");
    expect(result.evidenceLevel).toBe(1);
    if (result.sourceIds.length === 0) throw new Error("ci si aspettano fonti per colazione");
  });

  it("cena -> tendenza peggiore_tolleranza, evidenceLevel 1, fonti presenti", () => {
    const result = getTimeOfDayGlycemicNote("cena");
    expect(result.tendency).toBe("peggiore_tolleranza");
    expect(result.evidenceLevel).toBe(1);
    if (result.sourceIds.length === 0) throw new Error("ci si aspettano fonti per cena");
  });

  it("pranzo -> non_determinato, nessuna fonte, mai interpolato fra mattina e sera", () => {
    const result = getTimeOfDayGlycemicNote("pranzo");
    expect(result.tendency).toBe("non_determinato");
    expect(result.evidenceLevel).toBeNull();
    expect(result.sourceIds.length).toBe(0);
  });

  it("contesto sconosciuto/arbitrario -> non_determinato, mai un'eccezione", () => {
    const result = getTimeOfDayGlycemicNote("spuntino_notturno_3am");
    expect(result.tendency).toBe("non_determinato");
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (eseguiti contro il motore glicemico, lib/engine/glycemicEngine.ts) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
