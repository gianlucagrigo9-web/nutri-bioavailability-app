// tests/dishComposition.test.ts
//
// Suite di test REALE eseguita contro la logica pura in
// lib/engine/dishComposition.ts (Fase 4 punto 16b, docs/PRD.md §4.8 --
// design approvato dall'utente il 2026-10-11). Logica pura, nessuna rete
// né Supabase coinvolta: eseguibile in questo sandbox.
//
// Stesso micro test runner autosufficiente di tests/engines.test.ts e
// tests/fdcVerification.test.ts (niente vitest/jest), duplicato qui
// deliberatamente per coerenza con quei due file.

import { expandDishComponentsToFoodItems, sumConfidenceRange } from "../lib/engine/dishComposition";
import { FoodItem } from "../lib/engine/types";

// ---------------------------------------------------------------------------
// Micro test runner (identico agli altri due file di test)
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
// Fixture: FoodItem sintetici (nessun dato nutrizionale reale -- stesso
// spirito di makeFood() in tests/engines.test.ts, duplicato minimale qui
// per i soli campi che questo file esercita).
// ---------------------------------------------------------------------------
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
// expandDishComponentsToFoodItems
// =============================================================================
describe("expandDishComponentsToFoodItems — espansione in lista, mai in un unico FoodItem fuso", () => {
  it("scala correttamente ogni componente alla propria grammatura (riusa scaleFoodItemToGrams, nessuna logica nuova)", () => {
    const pomodoro = makeFood({ id: "food_tomato_raw", vitamin_c_mg: 14, iron_mg: 0.3 }); // per 100g
    const pasta = makeFood({ id: "food_pasta_cooked", iron_mg: 1.0, energy_kcal: 130 }); // per 100g

    const result = expandDishComponentsToFoodItems(
      [
        { food: pomodoro, gramsPerServing: 200 }, // doppio
        { food: pasta, gramsPerServing: 80 }, // 0.8x
      ],
      "DERIVED_COMPOSITE_RECIPE_TEST"
    );

    expect(result.length).toBe(2);
    expect(result[0].vitamin_c_mg).toBeCloseTo(28, 5); // 14 * 2
    expect(result[0].iron_mg).toBeCloseTo(0.6, 5);
    expect(result[1].iron_mg).toBeCloseTo(0.8, 5); // 1.0 * 0.8
    expect(result[1].energy_kcal).toBeCloseTo(104, 5); // 130 * 0.8
  });

  it("marca ogni componente isCompositeDish=true e con lo stesso compositeDishSourceId (badge 'Ricetta stimata')", () => {
    const a = makeFood({ id: "a" });
    const b = makeFood({ id: "b" });
    const result = expandDishComponentsToFoodItems(
      [{ food: a, gramsPerServing: 50 }, { food: b, gramsPerServing: 50 }],
      "DERIVED_COMPOSITE_RECIPE_MINESTRONE"
    );
    for (const item of result) {
      expect(item.isCompositeDish).toBe(true);
      expect(item.compositeDishSourceId).toBe("DERIVED_COMPOSITE_RECIPE_MINESTRONE");
    }
  });

  it("NON fonde i campi categorici dei componenti -- ciascun FoodItem risultante mantiene i PROPRI valori originali", () => {
    const pomodoro = makeFood({ id: "tomato", matrix_category_calcium: "high_oxalate", is_heme_iron: false });
    const carne = makeFood({ id: "beef", matrix_category_calcium: "low_oxalate", is_heme_iron: true });
    const result = expandDishComponentsToFoodItems(
      [{ food: pomodoro, gramsPerServing: 100 }, { food: carne, gramsPerServing: 100 }],
      "SRC"
    );
    // Se questa funzione fondesse i componenti in un solo oggetto dovrebbe
    // scegliere UN valore per matrix_category_calcium/is_heme_iron -- una
    // decisione arbitraria che violerebbe "zero dati inventati" (vedi
    // commento di testa del file). Verifichiamo che non lo faccia: resta
    // una lista di 2, ciascuno con i propri campi originali intatti.
    expect(result.length).toBe(2);
    expect(result[0].matrix_category_calcium).toBe("high_oxalate");
    expect(result[0].is_heme_iron).toBe(false);
    expect(result[1].matrix_category_calcium).toBe("low_oxalate");
    expect(result[1].is_heme_iron).toBe(true);
  });

  it("un dish_template senza componenti (array vuoto) restituisce una lista vuota, nessuna eccezione (difensivo)", () => {
    const result = expandDishComponentsToFoodItems([], "SRC");
    expect(result.length).toBe(0);
  });

  it("grammatura non fisica (0, negativa, NaN) nel componente eredita il comportamento difensivo già testato di scaleFoodItemToGrams (trattata come 0g, mai inventata)", () => {
    const food = makeFood({ id: "x", iron_mg: 10 });
    const result = expandDishComponentsToFoodItems([{ food, gramsPerServing: -50 }], "SRC");
    expect(result[0].iron_mg).toBe(0);
  });
});

// =============================================================================
// sumConfidenceRange
// =============================================================================
describe("sumConfidenceRange — propagazione lineare del range attraverso la somma (Regola 2)", () => {
  it("somma value/low/high quando TUTTI i componenti hanno un range dichiarato", () => {
    const r = sumConfidenceRange([
      { value: 10, confidenceLow: 8, confidenceHigh: 12 },
      { value: 5, confidenceLow: 4, confidenceHigh: 6 },
    ]);
    expect(r.value).toBe(15);
    expect(r.confidenceLow).toBe(12);
    expect(r.confidenceHigh).toBe(18);
  });

  it("se ANCHE UN SOLO componente non ha un range, il totale non ha un range (mai un range fabbricato)", () => {
    const r = sumConfidenceRange([
      { value: 10, confidenceLow: 8, confidenceHigh: 12 },
      { value: 5, confidenceLow: null, confidenceHigh: null }, // fonte senza range, es. USDA FDC
    ]);
    expect(r.value).toBe(15);
    expect(r.confidenceLow).toBe(null);
    expect(r.confidenceHigh).toBe(null);
  });

  it("lista vuota: value=0, nessun range (difensivo, nessuna eccezione)", () => {
    const r = sumConfidenceRange([]);
    expect(r.value).toBe(0);
    expect(r.confidenceLow).toBe(null);
    expect(r.confidenceHigh).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri due file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (eseguiti contro lib/engine/dishComposition.ts) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
