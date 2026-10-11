// tests/dietEngine.test.ts
//
// Suite di test REALE eseguita contro la logica pura del motore di
// generazione dieta (Fase pre-5, docs/PRD.md §4.9 -- design chiuso il
// 2026-10-11): lib/engine/dietAdequacy.ts, lib/engine/dietTypeFilter.ts,
// lib/engine/dietGenerator.ts, lib/engine/dietRecommender.ts. Nessuna
// rete/Supabase coinvolta, eseguibile in questo sandbox. Stesso micro
// test runner autosufficiente degli altri file di test.

import { calculateNAR, calculateMAR, findBottleneckNutrient } from "../lib/engine/dietAdequacy";
import { filterFoodsByDietType, DietType } from "../lib/engine/dietTypeFilter";
import { generateDiet, DietNutrientTarget, buildDietNutrientTargets } from "../lib/engine/dietGenerator";
import { findBestSwaps, DietItem } from "../lib/engine/dietRecommender";
import { FoodItem } from "../lib/engine/types";

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
    toBeLessThanOrEqual(expected: number) {
      if (!(actual <= expected)) throw new Error(`atteso <= ${expected}, ricevuto ${actual}`);
    },
  };
}

// ---------------------------------------------------------------------------
// Fixture (nessun dato nutrizionale reale -- stesso spirito degli altri file)
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
// calculateNAR / calculateMAR / findBottleneckNutrient
// =============================================================================
describe("calculateNAR — Nutrient Adequacy Ratio, capped a 1.0 (Hatloy et al. 1998)", () => {
  it("intake sotto target: NAR = intake/target", () => {
    expect(calculateNAR(5, 10)).toBeCloseTo(0.5, 5);
  });
  it("intake sopra target: NAR cappato a 1.0 (non compensa altri nutrienti carenti)", () => {
    expect(calculateNAR(50, 10)).toBe(1);
  });
  it("intake = target: NAR = 1.0 esatto", () => {
    expect(calculateNAR(10, 10)).toBe(1);
  });
  it("target <= 0: NAR non definito (null), mai una divisione per zero propagata", () => {
    expect(calculateNAR(5, 0)).toBeNull();
    expect(calculateNAR(5, -1)).toBeNull();
  });
  it("target non finito (NaN/Infinity): null, difensivo", () => {
    expect(calculateNAR(5, NaN)).toBeNull();
    expect(calculateNAR(5, Infinity)).toBeNull();
  });
  it("intake negativo o non finito: trattato come 0 (mai un valore inventato)", () => {
    expect(calculateNAR(-5, 10)).toBe(0);
    expect(calculateNAR(NaN, 10)).toBe(0);
  });
});

describe("calculateMAR — Mean Adequacy Ratio", () => {
  it("media dei NAR validi su più nutrienti", () => {
    const { mar } = calculateMAR([
      { nutrientCode: "a", intake: 10, target: 10 }, // NAR 1
      { nutrientCode: "b", intake: 5, target: 10 }, // NAR 0.5
    ]);
    expect(mar).toBeCloseTo(0.75, 5);
  });
  it("un target non valido esclude quel nutriente dalla media E viene elencato in excludedNutrients (mai silenziato)", () => {
    const { mar, narByNutrient, excludedNutrients } = calculateMAR([
      { nutrientCode: "a", intake: 10, target: 10 }, // NAR 1
      { nutrientCode: "b", intake: 5, target: 0 }, // target invalido
    ]);
    expect(mar).toBe(1); // media solo su 'a'
    expect(narByNutrient["b"]).toBe(undefined);
    expect(excludedNutrients.length).toBe(1);
    expect(excludedNutrients[0]).toBe("b");
  });
  it("lista vuota: mar = 0, mai NaN", () => {
    const { mar } = calculateMAR([]);
    expect(mar).toBe(0);
  });
});

describe("findBottleneckNutrient — nutriente col NAR più basso", () => {
  it("trova correttamente il minimo", () => {
    expect(findBottleneckNutrient({ a: 0.9, b: 0.3, c: 0.7 })).toBe("b");
  });
  it("oggetto vuoto: null, difensivo", () => {
    expect(findBottleneckNutrient({})).toBeNull();
  });
});

// =============================================================================
// filterFoodsByDietType
// =============================================================================
describe("filterFoodsByDietType — filtro tipo-dieta", () => {
  const meat = makeFood({ id: "meat", dietCompatibility: { vegetarian: false, vegan: false, fruitarian: false } });
  const cheese = makeFood({ id: "cheese", dietCompatibility: { vegetarian: true, vegan: false, fruitarian: false } });
  const apple = makeFood({ id: "apple", dietCompatibility: { vegetarian: true, vegan: true, fruitarian: true } });
  const unclassified = makeFood({ id: "unclassified" }); // dietCompatibility assente

  it("omnivore: nessun filtro, tutto compatibile (anche il non classificato)", () => {
    const result = filterFoodsByDietType([meat, cheese, apple, unclassified], "omnivore");
    expect(result.length).toBe(4);
  });
  it("vegan: solo apple", () => {
    const result = filterFoodsByDietType([meat, cheese, apple, unclassified], "vegan");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("apple");
  });
  it("vegetarian: cheese e apple", () => {
    const result = filterFoodsByDietType([meat, cheese, apple, unclassified], "vegetarian");
    expect(result.length).toBe(2);
  });
  it("un alimento SENZA dietCompatibility viene escluso da qualunque filtro diverso da omnivore (mai assunto compatibile)", () => {
    const result = filterFoodsByDietType([unclassified], "vegan");
    expect(result.length).toBe(0);
  });
});

// =============================================================================
// generateDiet — euristica golosa
// =============================================================================
describe("generateDiet — Livello A (difensivo)", () => {
  it("nessun alimento candidato: warning, nessuna eccezione", () => {
    const result = generateDiet([], [], 2000);
    expect(result.foods.length).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
  it("targetKcal non valido (<=0, NaN): warning, nessuna eccezione", () => {
    const food = makeFood({ id: "x", energy_kcal: 100 });
    expect(generateDiet([food], [], 0).warnings.length).toBeGreaterThan(0);
    expect(generateDiet([food], [], NaN).warnings.length).toBeGreaterThan(0);
  });
  it("alimenti con energy_kcal <= 0 vengono ignorati e segnalati in warnings (mai una divisione per zero)", () => {
    const zeroEnergy = makeFood({ id: "zero", energy_kcal: 0, iron_mg: 100 });
    const withEnergy = makeFood({ id: "ok", energy_kcal: 100, iron_mg: 1 });
    const result = generateDiet([zeroEnergy, withEnergy], [{ nutrientCode: "iron_mg", target: 5 }], 100);
    expect(result.foods.some((f) => f.food.id === "zero")).toBe(false);
    expect(result.warnings.some((w) => w.includes("energy_kcal"))).toBe(true);
  });
});

describe("generateDiet — Livello B (proprietà: preferisce l'alimento a maggior densità del collo di bottiglia)", () => {
  it("con un solo nutriente target, alloca prima l'alimento con densità nutriente/kcal maggiore, poi passa all'altro una volta esaurito il suo massimo per porzione", () => {
    const foodA = makeFood({ id: "A", iron_mg: 10, energy_kcal: 100 }); // densità 0.1
    const foodB = makeFood({ id: "B", iron_mg: 1, energy_kcal: 100 }); // densità 0.01
    const result = generateDiet(
      [foodA, foodB],
      [{ nutrientCode: "iron_mg", target: 5 }],
      150,
      { maxGramsPerFood: 100, stepGrams: 10 }
    );
    const grA = result.foods.find((f) => f.food.id === "A")?.grams ?? 0;
    const grB = result.foods.find((f) => f.food.id === "B")?.grams ?? 0;
    expect(grA).toBe(100); // ha saturato il proprio massimo per porzione
    expect(grB).toBe(50); // il resto del budget energetico va a B
  });

  it("rispetta il budget energetico entro la tolleranza di default (5%)", () => {
    const food = makeFood({ id: "x", iron_mg: 1, energy_kcal: 100 });
    const result = generateDiet([food], [{ nutrientCode: "iron_mg", target: 100 }], 200, { maxGramsPerFood: 1000, stepGrams: 10 });
    const totalKcal = result.foods.reduce((sum, f) => sum + (f.grams / 100) * f.food.energy_kcal, 0);
    expect(Math.abs(totalKcal - 200) <= 200 * 0.05 + 0.001 ? 1 : 0).toBe(1);
  });

  it("si ferma dopo maxIterations (guardia anti-loop-infinito) e lo segnala in warnings", () => {
    const food = makeFood({ id: "x", iron_mg: 1, energy_kcal: 100 });
    const result = generateDiet([food], [{ nutrientCode: "iron_mg", target: 100 }], 1_000_000, {
      maxGramsPerFood: 1_000_000,
      stepGrams: 10,
      maxIterations: 5,
    });
    expect(result.warnings.some((w) => w.includes("iterazioni"))).toBe(true);
  });
});

// =============================================================================
// findBestSwaps — recommender "Pareto-superiore"
// =============================================================================
describe("findBestSwaps — Livello A (difensivo)", () => {
  it("piano vuoto: improved=false, nessuna eccezione", () => {
    const result = findBestSwaps([], {}, []);
    expect(result.improved).toBe(false);
  });
  it("nessun candidato nel contesto dell'alimento attuale: nessun miglioramento trovato", () => {
    const current: DietItem[] = [{ food: makeFood({ id: "bread", iron_mg: 1, energy_kcal: 100 }), grams: 100, context: "colazione" }];
    const result = findBestSwaps(current, {}, [{ nutrientCode: "iron_mg", target: 10 }]);
    expect(result.improved).toBe(false);
  });
});

describe("findBestSwaps — Livello B (proprietà)", () => {
  it("trova e applica una sostituzione migliorativa nello stesso contesto", () => {
    const bread = makeFood({ id: "bread_nutella", iron_mg: 0.5, energy_kcal: 100 });
    const eggs = makeFood({ id: "eggs_rye", iron_mg: 3, energy_kcal: 100 });
    const current: DietItem[] = [{ food: bread, grams: 100, context: "colazione" }];
    const result = findBestSwaps(current, { colazione: [eggs] }, [{ nutrientCode: "iron_mg", target: 10 }]);
    expect(result.improved).toBe(true);
    expect(result.swaps.length).toBe(1);
    expect(result.swaps[0].added.food.id).toBe("eggs_rye");
    expect(result.marAfter).toBeGreaterThan(result.marBefore);
  });

  it("MAI confronta alimenti di contesti diversi, anche se il candidato è oggettivamente migliore", () => {
    const bread = makeFood({ id: "bread", iron_mg: 0.5, energy_kcal: 100 });
    const steak = makeFood({ id: "steak", iron_mg: 10, energy_kcal: 100 });
    const current: DietItem[] = [{ food: bread, grams: 100, context: "colazione" }];
    // steak e' candidato solo per "cena", MAI per "colazione"
    const result = findBestSwaps(current, { cena: [steak] }, [{ nutrientCode: "iron_mg", target: 10 }]);
    expect(result.improved).toBe(false);
  });

  it("non propone mai un cambiamento se nessun candidato migliora il MAR", () => {
    const current: DietItem[] = [{ food: makeFood({ id: "good", iron_mg: 10, energy_kcal: 100 }), grams: 100, context: "colazione" }];
    const worseCandidate = makeFood({ id: "worse", iron_mg: 1, energy_kcal: 100 });
    const result = findBestSwaps(current, { colazione: [worseCandidate] }, [{ nutrientCode: "iron_mg", target: 10 }]);
    expect(result.improved).toBe(false);
    expect(result.swaps.length).toBe(0);
  });

  it("rispetta maxChanges: con due alimenti migliorabili e maxChanges=1, applica solo 1 sostituzione", () => {
    const item1 = makeFood({ id: "item1", iron_mg: 0.5, zinc_mg: 5, energy_kcal: 100 });
    const item2 = makeFood({ id: "item2", iron_mg: 5, zinc_mg: 0.5, energy_kcal: 100 });
    const betterForIron = makeFood({ id: "better_iron", iron_mg: 5, zinc_mg: 5, energy_kcal: 100 });
    const betterForZinc = makeFood({ id: "better_zinc", iron_mg: 5, zinc_mg: 5, energy_kcal: 100 });
    const current: DietItem[] = [
      { food: item1, grams: 100, context: "pranzo" },
      { food: item2, grams: 100, context: "pranzo" },
    ];
    const result = findBestSwaps(
      current,
      { pranzo: [betterForIron, betterForZinc] },
      [
        { nutrientCode: "iron_mg", target: 10 },
        { nutrientCode: "zinc_mg", target: 10 },
      ],
      1
    );
    expect(result.swaps.length).toBeLessThanOrEqual(1);
  });
});

describe("buildDietNutrientTargets — adattatore nutrientTargets.ts -> DietNutrientTarget[] (docs/PRD.md §4.9)", () => {
  it("include esattamente gli 8 nutrienti con mapsToRawFoodItemField=true (vitamina C, B12, magnesio, rame, selenio, iodio, vitamina K, calcio)", () => {
    const { targets } = buildDietNutrientTargets("male", 30);
    const codes = targets.map((t) => t.nutrientCode).sort();
    const attesi = ["calcium_mg", "copper_mg", "iodine_mcg", "magnesium_mg", "selenium_mcg", "vitamin_b12_mcg", "vitamin_c_mg", "vitamin_k_mcg"].sort();
    expect(JSON.stringify(codes)).toBe(JSON.stringify(attesi));
  });

  it("omette esplicitamente ferro, zinco, folati e vitamina A con un motivo (mai silenziato, mai wired su un campo grezzo sbagliato)", () => {
    const { omittedNutrients } = buildDietNutrientTargets("male", 30);
    const omittedKeys = omittedNutrients.map((o) => o.nutrientKey).sort();
    expect(JSON.stringify(omittedKeys)).toBe(JSON.stringify(["folate_dfe", "iron", "vitamin_a_rae", "zinc"].sort()));
    for (const o of omittedNutrients) {
      if (!o.reason || o.reason.length === 0) throw new Error(`${o.nutrientKey}: nessun motivo dichiarato per l'omissione`);
    }
  });

  it("il target del calcio riflette l'override di eta' (uomo 65+ -> 1100mg, non 950mg)", () => {
    const sotto = buildDietNutrientTargets("male", 64).targets.find((t) => t.nutrientCode === "calcium_mg");
    const sopra = buildDietNutrientTargets("male", 65).targets.find((t) => t.nutrientCode === "calcium_mg");
    if (!sotto || !sopra) throw new Error("target calcio non trovato");
    expect(sotto.target).toBe(950);
    expect(sopra.target).toBe(1100);
  });

  it("i valori generati sono utilizzabili direttamente da generateDiet (stesso NutrientFieldName, nessuna conversione necessaria)", () => {
    const { targets } = buildDietNutrientTargets("female", 30);
    const food = makeFood({ id: "test_food", energy_kcal: 100, calcium_mg: 100, vitamin_c_mg: 10 });
    const result = generateDiet([food], targets, 500, { maxGramsPerFood: 500 });
    // Non deve lanciare eccezioni e deve produrre un MAR valido (0..1)
    if (result.mar < 0 || result.mar > 1) throw new Error(`MAR fuori range: ${result.mar}`);
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (eseguiti contro il motore di generazione dieta, lib/engine/diet*.ts) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
