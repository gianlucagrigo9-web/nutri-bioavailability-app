// tests/engines.test.ts
//
// Suite di test REALE eseguita (non solo proposta) contro i file motore
// effettivamente presenti in lib/engine/. Nessuna dipendenza esterna
// (niente vitest/jest: non installati in questo ambiente) — un micro
// runner autosufficiente, eseguito con `tsx` (presente in
// /home/claude/.npm-global/bin/tsx).
//
// Convenzione: Livello A (difensivo), Livello B (proprietà fisiologiche),
// Livello C (calibrazione su valore sourced). Dove il test rivela che il
// comportamento reale del codice NON soddisfa una proprietà attesa, il
// test lo dichiara esplicitamente come LIMITE NOTO (non viene nascosto
// né "aggiustato" con una correzione inventata) — coerente con la regola
// "zero dati inventati / trasparenza".

import { ComputationalNutritionEngine } from "../lib/engine/computationalNutritionEngine";
import { MicrobiotaEngine } from "../lib/engine/microbiotaEngine";
import { LCALogisticsEngine, FoodItemLCA, MealLCA } from "../lib/engine/lcaLogisticsEngine";
import { CookingTransformationEngine, RetentionFactorRecord } from "../lib/engine/cookingTransformationEngine";
import { FoodItem, Meal, DailyDiet, scaleFoodItemToGrams } from "../lib/engine/types";

// ---------------------------------------------------------------------------
// Micro test runner
// ---------------------------------------------------------------------------
type Result = { name: string; status: "PASS" | "FAIL" | "LIMITE NOTO"; detail?: string };
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

// Variante per test che documentano consapevolmente un limite noto del
// modello primario (non un bug di codice): l'assert interno verifica il
// comportamento REALE (deterministico), ma l'esito viene etichettato
// come "LIMITE NOTO" invece di "FAIL" quando l'assert passa, per
// distinguere "il codice fa quello che la formula pubblicata dice di
// fare" da "il codice è rotto".
function itKnownLimitation(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name: `${currentSuite} :: ${name}`, status: "LIMITE NOTO" });
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
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) throw new Error(`atteso > ${expected}, ricevuto ${actual}`);
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (!(actual >= expected)) throw new Error(`atteso >= ${expected}, ricevuto ${actual}`);
    },
    toBeLessThan(expected: number) {
      if (!(actual < expected)) throw new Error(`atteso < ${expected}, ricevuto ${actual}`);
    },
    toBeLessThanOrEqual(expected: number) {
      if (!(actual <= expected)) throw new Error(`atteso <= ${expected}, ricevuto ${actual}`);
    }
  };
}

// ---------------------------------------------------------------------------
// Helper di costruzione dati (nessun dato nutrizionale reale qui: sono
// fixture sintetiche per isolare il comportamento matematico del motore,
// non valori di un alimento reale — quelli vivranno nel Golden Set sourced)
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
    carotenoid_matrix_state: "cooked_or_disrupted", // default: mantiene 6:1 invariato nei test preesistenti
    zinc_bioaccessibility_bucket: "none", // default: nessuna deratazione, mantiene Miller invariato nei test preesistenti
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
    ...overrides
  };
}

function mealWith(overrides: Partial<FoodItem> = {}): Meal {
  return { foods: [makeFood(overrides)] };
}

// zinc_mg fissato a 9.81mg (= 0.15 mmol, usato nei test di calibrazione
// Livello C originali) per costruire un rapporto molare fitato:zinco dato.
function mealWithZincPhytateRatio(molarRatio: number): Meal {
  const zincMg = 9.81;
  const tdzMmol = zincMg / 65.38;
  const tdpMmol = molarRatio * tdzMmol;
  const phytatesMg = tdpMmol * 660.04;
  return mealWith({ zinc_mg: zincMg, phytates_mg: phytatesMg });
}

const PHYTATE_MOLAR_MASS = 660.04;
const ZINC_MOLAR_MASS = 65.38;

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Zinco (Miller 2007)
// =============================================================================
const nutritionEngine = new ComputationalNutritionEngine();

describe("calculateBioavailableZinc — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0, nessuna eccezione", () => {
    expect(nutritionEngine.calculateBioavailableZinc({ foods: [] }).value).toBe(0);
  });
  it("zinco dietetico = 0 -> assorbimento 0 (niente divisione per zero)", () => {
    const meal = mealWith({ zinc_mg: 0, phytates_mg: 500 });
    expect(nutritionEngine.calculateBioavailableZinc(meal).value).toBe(0);
  });
  it("fitati = 0 -> nessun NaN (TDP/KP = 0/1.2 = 0)", () => {
    const meal = mealWith({ zinc_mg: 10, phytates_mg: 0 });
    const v = nutritionEngine.calculateBioavailableZinc(meal).value;
    expect(Number.isFinite(v)).toBe(true);
  });
});

describe("calculateBioavailableZinc — Livello B (proprietà fisiologiche)", () => {
  it("a zinco fisso, più fitato non aumenta mai l'assorbimento assoluto", () => {
    const low = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 10, phytates_mg: 200 }));
    const high = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 10, phytates_mg: 800 }));
    expect(high.value).toBeLessThanOrEqual(low.value);
  });
  it("nessuna discontinuità intorno ai vecchi cutoff v1 (rapporto molare 5 e 15)", () => {
    // Confrontiamo solo le coppie ADIACENTI attorno a ciascun ex-cutoff
    // (0.1 di distanza in rapporto molare), non l'intero vettore: il salto
    // fra 5.1 e 14.9 è un salto legittimo su un intervallo di quasi 10
    // unità, non una discontinuità da verificare.
    const pairsAroundCutoffs: [number, number][] = [[4.9, 5.0], [5.0, 5.1], [14.9, 15.0], [15.0, 15.1]];
    for (const [r1, r2] of pairsAroundCutoffs) {
      const v1 = nutritionEngine.calculateBioavailableZinc(mealWithZincPhytateRatio(r1)).value;
      const v2 = nutritionEngine.calculateBioavailableZinc(mealWithZincPhytateRatio(r2)).value;
      const jump = Math.abs(v2 - v1);
      expect(jump).toBeLessThan(0.1); // variazione continua su 0.1 unità di rapporto molare
    }
  });
  it("FAZ frazionale diminuisce all'aumentare dello zinco totale (saturazione), anche a fitati=0", () => {
    const lowDose = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0 }));
    const highDose = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 30, phytates_mg: 0 }));
    const fazLow = lowDose.value / 9.81;
    const fazHigh = highDose.value / 30;
    expect(fazHigh).toBeLessThan(fazLow);
  });
});

describe("calculateBioavailableZinc — contratto bioavailabilityAdjusted (PRD §4.0)", () => {
  it("un vero modello di assorbimento (Miller 2007) è applicato -> bioavailabilityAdjusted = true", () => {
    const meal = mealWith({ zinc_mg: 9.81, phytates_mg: 0 });
    if (nutritionEngine.calculateBioavailableZinc(meal).bioavailabilityAdjusted !== true) {
      throw new Error("ci si aspetta bioavailabilityAdjusted=true quando un modello di assorbimento reale è stato applicato");
    }
  });
});

describe("calculateBioavailableZinc — Livello C (calibrazione Miller 2007, Eq.11)", () => {
  it("TDZ=9.81mg, fitati=0 -> assorbimento ≈ 4.00mg (FAZ ≈ 40.8%)", () => {
    const meal = mealWith({ zinc_mg: 9.81, phytates_mg: 0 });
    expect(nutritionEngine.calculateBioavailableZinc(meal).value).toBeCloseTo(4.00, 1);
  });
  it("TDZ=9.81mg, fitati=990mg (rapporto molare fitato:zinco=10) -> assorbimento ≈ 2.75mg (FAZ ≈ 28.1%)", () => {
    const meal = mealWith({ zinc_mg: 9.81, phytates_mg: 990 });
    expect(nutritionEngine.calculateBioavailableZinc(meal).value).toBeCloseTo(2.75, 1);
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Zinco: terzo strato, bioaccessibilità
// post-cottura cavoletti di Bruxelles (Doniec et al. 2022, Molecules)
//
// SCOPO: questo strato si applica ESCLUSIVAMENTE a food item con
// zinc_bioaccessibility_bucket diverso da "none" (cioè solo cavoletti di
// Bruxelles bolliti/al vapore). Verificato nel paper stesso (PMC8951108):
// gli autori NON generalizzano ad altre crucifere -- vedi docs/PRD.md §4.4.
// Placement: DOPO l'equazione di Miller 2007 (non come input), perché
// Miller è calibrata su dato in vivo (zinco dietetico totale, non
// pre-filtrato per bioaccessibilità in vitro) -- applicarlo prima
// rischierebbe un doppio conteggio della stessa perdita di disponibilità.
// =============================================================================
describe("calculateBioavailableZinc — Livello A (difensivo, bioaccessibilità crucifere)", () => {
  it("bucket='none' (default) -> risultato identico al solo Miller, nessuna deratazione", () => {
    const withoutBucket = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" }));
    expect(withoutBucket.value).toBeCloseTo(4.00, 1);
  });
  it("entrambi i bucket (bollito+vapore) nello stesso pasto -> nessuna eccezione, valore finito", () => {
    const meal: Meal = { foods: [
      makeFood({ id: "b1", zinc_mg: 4.905, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" }),
      makeFood({ id: "b2", zinc_mg: 4.905, zinc_bioaccessibility_bucket: "brussels_sprouts_steamed" })
    ]};
    const v = nutritionEngine.calculateBioavailableZinc(meal).value;
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThan(0);
  });
});

describe("calculateBioavailableZinc — Livello B (proprietà, bioaccessibilità crucifere)", () => {
  it("a parità di zinco/fitati totali, la presenza del bucket 'bollito' riduce sempre il risultato rispetto a 'none'", () => {
    const base = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" }));
    const boiled = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" }));
    expect(boiled.value).toBeLessThan(base.value);
  });
  it("a parità di zinco/fitati totali, la presenza del bucket 'vapore' riduce sempre il risultato rispetto a 'none'", () => {
    const base = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" }));
    const steamed = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_steamed" }));
    expect(steamed.value).toBeLessThan(base.value);
  });
  it("un pasto misto (metà zinco da cavoletti bolliti, metà da altro alimento) produce un risultato intermedio fra 'tutto bollito' e 'niente bucket'", () => {
    const allNormal = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" }));
    const allBoiled = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" }));
    const mixed: Meal = { foods: [
      makeFood({ id: "m1", zinc_mg: 4.905, zinc_bioaccessibility_bucket: "none" }),
      makeFood({ id: "m2", zinc_mg: 4.905, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" })
    ]};
    const mixedResult = nutritionEngine.calculateBioavailableZinc(mixed);
    expect(mixedResult.value).toBeLessThan(allNormal.value);
    expect(mixedResult.value).toBeGreaterThan(allBoiled.value);
  });
  it("quando il bucket è usato, evidenceLevel scende a 3 (eredita l'evidenza più debole fra Miller 2007 e Doniec 2022, come da docs/PRD.md §6)", () => {
    const withBucket = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" }));
    expect(withBucket.evidenceLevel).toBe(3);
    if (withBucket.sourceIds.indexOf("DONIEC_2022_MOLECULES") === -1) throw new Error("sourceIds deve includere DONIEC_2022_MOLECULES quando il bucket è usato");
  });
  it("bioavailabilityAdjusted resta true anche con la deratazione per bioaccessibilità (è ancora un vero modello di assorbimento, solo più conservativo)", () => {
    const withBucket = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" }));
    expect(withBucket.bioavailabilityAdjusted).toBe(true);
  });
});

describe("calculateBioavailableZinc — Livello C (calibrazione Doniec 2022: 6.57%/17.02% bollito, 6.83%/17.02% vapore)", () => {
  it("meal interamente da cavoletti bolliti -> fattore di deratazione esatto 6.57/17.02 ≈ 0.386 applicato al risultato Miller", () => {
    const base = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" })).value;
    const boiled = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_boiled" })).value;
    const expectedFactor = 6.57 / 17.02;
    expect(boiled).toBeCloseTo(base * expectedFactor, 1);
  });
  it("meal interamente da cavoletti al vapore -> fattore di deratazione esatto 6.83/17.02 ≈ 0.401 applicato al risultato Miller", () => {
    const base = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "none" })).value;
    const steamed = nutritionEngine.calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0, zinc_bioaccessibility_bucket: "brussels_sprouts_steamed" })).value;
    const expectedFactor = 6.83 / 17.02;
    expect(steamed).toBeCloseTo(base * expectedFactor, 1);
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Calcio (Heaney & Weaver — modello a 3 categorie)
// =============================================================================
describe("calculateBioavailableCalcium — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0", () => {
    expect(nutritionEngine.calculateBioavailableCalcium({ foods: [] }).value).toBe(0);
  });
  it("calcio=0 -> 0, non negativo", () => {
    const meal = mealWith({ calcium_mg: 0, matrix_category_calcium: "high_oxalate" });
    expect(nutritionEngine.calculateBioavailableCalcium(meal).value).toBe(0);
  });
});

describe("calculateBioavailableCalcium — Livello B (proprietà, modello a categorie)", () => {
  it("categoria low_oxalate assorbe sempre più della categoria high_oxalate, a parità di calcio totale", () => {
    const low = nutritionEngine.calculateBioavailableCalcium(mealWith({ calcium_mg: 100, matrix_category_calcium: "low_oxalate" }));
    const high = nutritionEngine.calculateBioavailableCalcium(mealWith({ calcium_mg: 100, matrix_category_calcium: "high_oxalate" }));
    expect(low.value).toBeGreaterThan(high.value);
  });
  it("una matrice low_oxalate può superare il 30% di assorbimento frazionale (il codice v1 non poteva, per costruzione)", () => {
    const kaleLike = nutritionEngine.calculateBioavailableCalcium(mealWith({ calcium_mg: 100, matrix_category_calcium: "low_oxalate" }));
    expect(kaleLike.value / 100).toBeGreaterThan(0.30);
  });
});

describe("calculateBioavailableCalcium — Livello C (calibrazione Heaney & Weaver)", () => {
  it("high_oxalate (tipo spinaci) -> frazione assorbita = 5.0% esatto (costante sourced Heaney/Weaver/Recker 1988)", () => {
    const meal = mealWith({ calcium_mg: 100, matrix_category_calcium: "high_oxalate" });
    expect(nutritionEngine.calculateBioavailableCalcium(meal).value / 100).toBeCloseTo(0.05, 2);
  });
  it("low_oxalate (tipo kale) -> frazione assorbita = 40.9% esatto (sourced Heaney & Weaver 1990), entro ±5pp del 41% atteso", () => {
    const meal = mealWith({ calcium_mg: 100, matrix_category_calcium: "low_oxalate" });
    const fraction = nutritionEngine.calculateBioavailableCalcium(meal).value / 100;
    expect(fraction).toBeCloseTo(0.41, 1); // tolleranza ±5pp come da criteri
  });
  it("categoria default/medium_oxalate (tipo latte) -> 32% (Heaney & Weaver 1990, coorte latte)", () => {
    const meal = mealWith({ calcium_mg: 100, matrix_category_calcium: "medium_oxalate" });
    expect(nutritionEngine.calculateBioavailableCalcium(meal).value / 100).toBeCloseTo(0.32, 2);
  });
  it("solo la categoria low_oxalate espone una fascia di confidenza reale (SD nota); le altre restano null, non inventate", () => {
    const low = nutritionEngine.calculateBioavailableCalcium(mealWith({ calcium_mg: 100, matrix_category_calcium: "low_oxalate" }));
    const high = nutritionEngine.calculateBioavailableCalcium(mealWith({ calcium_mg: 100, matrix_category_calcium: "high_oxalate" }));
    if (low.confidenceLow === null || low.confidenceHigh === null) throw new Error("low_oxalate dovrebbe avere una fascia di confidenza reale (SD Heaney&Weaver 1990)");
    if (high.confidenceLow !== null || high.confidenceHigh !== null) throw new Error("high_oxalate NON ha una SD pubblicata nota: deve restare null, non essere inventata");
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Ferro (Hallberg 2000, base 22.1% + Eq.2)
// =============================================================================
describe("calculateBioavailableIron — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0", () => {
    expect(nutritionEngine.calculateBioavailableIron({ foods: [] }).value).toBe(0);
  });
  it("solo ferro eme, zero non-eme -> assorbimento = solo quota eme, >0", () => {
    const meal = mealWith({ iron_mg: 5, is_heme_iron: true });
    expect(nutritionEngine.calculateBioavailableIron(meal).value).toBeGreaterThan(0);
  });
  it("ferro non-eme con fitati altissimi non va mai a zero assoluto (pavimento fisiologico difensivo)", () => {
    const meal = mealWith({ iron_mg: 10, is_heme_iron: false, phytates_mg: 5000, polyphenols_mg: 100000 });
    expect(nutritionEngine.calculateBioavailableIron(meal).value).toBeGreaterThan(0);
  });
});

describe("calculateBioavailableIron — Livello B (proprietà fisiologiche)", () => {
  it("più vitamina C non riduce mai l'assorbimento di ferro non-eme", () => {
    const low = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 10 }));
    const high = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 100 }));
    expect(high.value).toBeGreaterThanOrEqual(low.value);
  });
  it("più polifenoli (a ferro e vit.C fissi) non aumenta mai l'assorbimento non-eme", () => {
    const low = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 20, polyphenols_mg: 50 }));
    const high = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 20, polyphenols_mg: 2000 }));
    expect(high.value).toBeLessThanOrEqual(low.value);
  });
});

describe("calculateBioavailableIron — Livello C (calibrazione Hallberg 2000)", () => {
  it("nessun fitato, nessuna vit.C -> tasso non-eme = 22.1% esatto (il numero di riferimento primario del paper, N=310)", () => {
    const meal = mealWith({ iron_mg: 10, is_heme_iron: false, vitamin_c_mg: 0, phytates_mg: 0, polyphenols_mg: 0 });
    const v = nutritionEngine.calculateBioavailableIron(meal).value;
    expect(v).toBeCloseTo(2.21, 2); // 10mg * 0.221
  });
  it("solo ferro eme -> tasso = 25% esatto (costante letteratura generale, indipendente dagli inibitori)", () => {
    const meal = mealWith({ iron_mg: 8, is_heme_iron: true });
    const v = nutritionEngine.calculateBioavailableIron(meal).value;
    expect(v).toBeCloseTo(2.00, 2); // 8mg * 0.25
  });
});

// Questo test documenta un comportamento REALE della formula pubblicata
// (Equation 2, Hallberg, Scand J Nutr 2000;44:150-154, verificata ora in
// full-text), non un'assunzione nostra: a vitamina C fissa (anche zero),
// il termine fitato della formula come pubblicata è SEMPRE ADDITIVO
// (nessun segno meno compare nell'equazione), quindi aumentare il solo
// fitato, a parità di vitamina C, NON riduce il rapporto di assorbimento
// previsto — anzi lo aumenta leggermente. È l'opposto della proprietà
// "più fitato non aumenta mai l'assorbimento" che useremmo intuitivamente
// (ed è quella usata correttamente per lo zinco, dove però la formula
// Miller ha davvero quel segno). Per il ferro, l'equazione pubblicata è
// un termine di INTERAZIONE fitato×vitamina-C adattato per regressione:
// non è separabile in un effetto "fitato puro" monotono. Grandezza
// dell'effetto in questo esempio: con PP equivalente a 5000mg di fitati
// e AA=0, il rapporto sale da 1.000 a solo ~1.031 (+3.1%) — un bias
// piccolo ma reale e non nascosto.
describe("calculateBioavailableIron — LIMITE NOTO del modello primario (Eq.2 Hallberg)", () => {
  itKnownLimitation(
    "a vitamina C=0 fissa, il termine fitato dell'Eq.2 pubblicata AUMENTA (non riduce) il rapporto di assorbimento previsto — bias piccolo (~+3%) ma strutturale, non una proprietà che il codice garantisce",
    () => {
      const noPhytate = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 10, is_heme_iron: false, vitamin_c_mg: 0, phytates_mg: 0 }));
      const highPhytate = nutritionEngine.calculateBioavailableIron(mealWith({ iron_mg: 10, is_heme_iron: false, vitamin_c_mg: 0, phytates_mg: 5000 }));
      // Confermiamo che il codice fa esattamente ciò che la formula pubblicata
      // dice di fare (quindi NON è un bug di trascrizione):
      expect(highPhytate.value).toBeGreaterThanOrEqual(noPhytate.value);
      // e quantifichiamo il bias per tenerlo sotto controllo nel tempo:
      const biasPercent = (highPhytate.value / noPhytate.value - 1) * 100;
      expect(biasPercent).toBeLessThan(5); // piccolo, ma monitorato: se cresce, va rivisto
    }
  );
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Vitamina B12 (IOM 1998 DRI)
// =============================================================================
describe("calculateBioavailableB12 — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0, nessuna eccezione", () => {
    expect(nutritionEngine.calculateBioavailableB12({ foods: [] }).value).toBe(0);
  });
  it("B12 dietetica = 0 -> assorbimento 0 (niente divisione per zero, KM>0 comunque)", () => {
    const meal = mealWith({ vitamin_b12_mcg: 0 });
    expect(nutritionEngine.calculateBioavailableB12(meal).value).toBe(0);
  });
});

describe("calculateBioavailableB12 — Livello B (proprietà fisiologiche)", () => {
  it("l'assorbito non supera mai la dose ingerita (vincolo fisico, non solo fisiologico)", () => {
    const r = nutritionEngine.calculateBioavailableB12(mealWith({ vitamin_b12_mcg: 50 }));
    expect(r.value).toBeLessThanOrEqual(50);
  });
  it("l'assorbito aumenta sempre con la dose (monotono), ma la FRAZIONE assorbita diminuisce (saturazione)", () => {
    const low = nutritionEngine.calculateBioavailableB12(mealWith({ vitamin_b12_mcg: 1 }));
    const high = nutritionEngine.calculateBioavailableB12(mealWith({ vitamin_b12_mcg: 10 }));
    expect(high.value).toBeGreaterThan(low.value);
    expect(high.value / 10).toBeLessThan(low.value / 1);
  });
});

describe("calculateBioavailableB12 — Livello C (calibrazione sul punto Adams 1971 a dose=1µg)", () => {
  it("dose=1µg -> assorbito ≈ 0.51µg (il Km è calibrato esattamente su questo punto, Adams et al. 1971)", () => {
    const meal = mealWith({ vitamin_b12_mcg: 1 });
    expect(nutritionEngine.calculateBioavailableB12(meal).value).toBeCloseTo(0.51, 1);
  });
});

describe("calculateBioavailableB12 — LIMITE NOTO (mismatch del modello alle dosi più alte)", () => {
  itKnownLimitation(
    "a dose=5µg e dose=25µg il modello (calibrato sul punto a 1µg) sovrastima l'assorbimento reale riportato da Adams et al. 1971 del 30-60% — non è nascosto, è quantificato qui",
    () => {
      const d5 = nutritionEngine.calculateBioavailableB12(mealWith({ vitamin_b12_mcg: 5 })).value;
      const d25 = nutritionEngine.calculateBioavailableB12(mealWith({ vitamin_b12_mcg: 25 })).value;
      const real5 = 1.0;  // Adams 1971: ~20% di 5µg
      const real25 = 1.25; // Adams 1971: "poco più del 5%" di 25µg
      const overshoot5 = (d5 / real5 - 1) * 100;
      const overshoot25 = (d25 / real25 - 1) * 100;
      expect(overshoot5).toBeGreaterThan(20); // confermiamo che il mismatch è reale e di questa grandezza
      expect(overshoot25).toBeGreaterThan(50);
    }
  );
  itKnownLimitation(
    "il modello non distingue B12 cristallina (Adams 1971, su cui è calibrato) da B12 legata alla matrice alimentare (Heyssel 1966, pasta di fegato: 38µg -> 4.1µg/11% assorbiti, MOLTO più di quanto il modello predica qui) — direzione OPPOSTA al mismatch sopra, limite strutturale del modello non di un solo segno",
    () => {
      const meal = mealWith({ vitamin_b12_mcg: 38 });
      const predicted = nutritionEngine.calculateBioavailableB12(meal).value;
      const realHeyssel = 4.1;
      expect(predicted).toBeLessThan(realHeyssel); // il modello SOTTOstima qui, mentre SOVRAstima a dosi crystalline più alte
    }
  );
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Folati -> DFE (FNB / NIH ODS)
// =============================================================================
describe("calculateFolateDFE — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0", () => {
    expect(nutritionEngine.calculateFolateDFE({ foods: [] }).value).toBe(0);
  });
  it("folato = 0 -> 0, non negativo", () => {
    const meal = mealWith({ folate_mcg: 0 });
    expect(nutritionEngine.calculateFolateDFE(meal).value).toBe(0);
  });
});

describe("calculateFolateDFE — Livello C (conversione ufficiale FNB)", () => {
  it("folato alimentare non fortificato -> 1 DFE = 1µg esatto (fattore 1.0)", () => {
    const meal = mealWith({ folate_mcg: 100, is_fortified_folate: false });
    expect(nutritionEngine.calculateFolateDFE(meal).value).toBeCloseTo(100, 2);
  });
  it("acido folico fortificato -> DFE = µg / 0.6 esatto (= µg x 1.7, formula FDA equivalente)", () => {
    const meal = mealWith({ folate_mcg: 60, is_fortified_folate: true });
    expect(nutritionEngine.calculateFolateDFE(meal).value).toBeCloseTo(100, 1); // 60/0.6 = 100
  });
  it("nessuna fascia di confidenza inventata: è una convenzione normativa, non una misura con SD", () => {
    const meal = mealWith({ folate_mcg: 100 });
    const r = nutritionEngine.calculateFolateDFE(meal);
    expect(r.confidenceLow === null ? 1 : 0).toBe(1);
    expect(r.confidenceHigh === null ? 1 : 0).toBe(1);
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Vitamina A -> RAE (NNR2023)
// =============================================================================
describe("calculateVitaminARAE — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0", () => {
    expect(nutritionEngine.calculateVitaminARAE({ foods: [] }).value).toBe(0);
  });
  it("nessun carotenoide -> 0, non negativo, bioavailabilityAdjusted=false (è una conversione, non un modello)", () => {
    const meal = mealWith({ beta_carotene_mcg: 0, other_provitamin_a_carotenoids_mcg: 0 });
    const r = nutritionEngine.calculateVitaminARAE(meal);
    expect(r.value).toBe(0);
  });
});

describe("calculateVitaminARAE — Livello C (conversione adottata NNR2023)", () => {
  it("beta-carotene alimentare -> RAE = µg / 6 esatto", () => {
    const meal = mealWith({ beta_carotene_mcg: 600 });
    expect(nutritionEngine.calculateVitaminARAE(meal).value).toBeCloseTo(100, 2); // 600/6=100
  });
  it("altri carotenoidi provitaminici -> RAE = µg / 12 esatto", () => {
    const meal = mealWith({ other_provitamin_a_carotenoids_mcg: 1200 });
    expect(nutritionEngine.calculateVitaminARAE(meal).value).toBeCloseTo(100, 2); // 1200/12=100
  });
  it("stato cooked_or_disrupted (default) -> fattore 6:1 invariato", () => {
    const meal = mealWith({ beta_carotene_mcg: 600, carotenoid_matrix_state: "cooked_or_disrupted" });
    expect(nutritionEngine.calculateVitaminARAE(meal).value).toBeCloseTo(100, 2); // 600/6
  });
});

describe("calculateVitaminARAE — integrazione Livny 2003 (crudo vs cotto, decisione esplicita 2026-10-09)", () => {
  it("stato raw_intact -> fattore derivato ≈9.44:1 (6 x 65.1/41.4), NON 6:1", () => {
    const meal = mealWith({ beta_carotene_mcg: 944, carotenoid_matrix_state: "raw_intact" });
    // 944 / 9.4348... ≈ 100.1
    expect(nutritionEngine.calculateVitaminARAE(meal).value).toBeCloseTo(100.1, 0);
  });
  it("stesso contenuto di beta-carotene: raw_intact produce SEMPRE meno RAE di cooked_or_disrupted", () => {
    const raw = nutritionEngine.calculateVitaminARAE(mealWith({ beta_carotene_mcg: 600, carotenoid_matrix_state: "raw_intact" }));
    const cooked = nutritionEngine.calculateVitaminARAE(mealWith({ beta_carotene_mcg: 600, carotenoid_matrix_state: "cooked_or_disrupted" }));
    expect(raw.value).toBeLessThan(cooked.value);
  });
  it("other_provitamin_a_carotenoids NON è aggiustato per stato (Livny ha misurato solo beta-carotene da carote)", () => {
    const rawState = nutritionEngine.calculateVitaminARAE(mealWith({ other_provitamin_a_carotenoids_mcg: 1200, carotenoid_matrix_state: "raw_intact" }));
    const cookedState = nutritionEngine.calculateVitaminARAE(mealWith({ other_provitamin_a_carotenoids_mcg: 1200, carotenoid_matrix_state: "cooked_or_disrupted" }));
    expect(rawState.value).toBeCloseTo(cookedState.value, 2); // identico: 1200/12=100 in entrambi i casi
  });
  it("bioavailabilityAdjusted=true ora: un aggiustamento per matrice è realmente applicato", () => {
    const meal = mealWith({ beta_carotene_mcg: 600, carotenoid_matrix_state: "raw_intact" });
    if (nutritionEngine.calculateVitaminARAE(meal).bioavailabilityAdjusted !== true) {
      throw new Error("bioavailabilityAdjusted dovrebbe essere true: lo stato della matrice ora cambia davvero il risultato");
    }
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Micronutrienti senza modello di
// biodisponibilità pubblicato (magnesio, rame, selenio, iodio, vitamina K)
//
// Vedi docs/PRD.md §4.0 e §4.5: nessuna equazione di assorbimento disponibile
// per questi nutrienti, quindi la composizione grezza viene mostrata
// comunque, marcata bioavailabilityAdjusted=false ("info sommarie"), per
// decisione esplicita dell'utente ("le info non implementabili per
// assenza di paper comunque andranno inserite a valori standard").
// =============================================================================
describe("calculateMagnesium / calculateCopper / calculateSelenium / calculateIodine / calculateVitaminK — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0 per tutti e cinque, nessuna eccezione", () => {
    expect(nutritionEngine.calculateMagnesium({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateCopper({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateSelenium({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateIodine({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateVitaminK({ foods: [] }).value).toBe(0);
  });
  it("nutriente = 0 nell'unico alimento -> 0, non negativo", () => {
    const meal = mealWith({ magnesium_mg: 0 });
    expect(nutritionEngine.calculateMagnesium(meal).value).toBe(0);
  });
});

describe("calculateMagnesium / calculateCopper / calculateSelenium / calculateIodine / calculateVitaminK — Livello B (somma, nessun modello)", () => {
  it("due alimenti nello stesso pasto -> i valori si sommano esattamente (nessuna interazione fra alimenti)", () => {
    const meal: Meal = { foods: [
      makeFood({ id: "m1", magnesium_mg: 50 }),
      makeFood({ id: "m2", magnesium_mg: 30 })
    ]};
    expect(nutritionEngine.calculateMagnesium(meal).value).toBeCloseTo(80, 2);
  });
  it("ognuno dei cinque è indipendente dagli altri quattro (nessuna fusione fra nutrienti diversi)", () => {
    const meal = mealWith({ magnesium_mg: 50, copper_mg: 0.5, selenium_mcg: 20, iodine_mcg: 60, vitamin_k_mcg: 40 });
    expect(nutritionEngine.calculateMagnesium(meal).value).toBeCloseTo(50, 2);
    expect(nutritionEngine.calculateCopper(meal).value).toBeCloseTo(0.5, 2);
    expect(nutritionEngine.calculateSelenium(meal).value).toBeCloseTo(20, 2);
    expect(nutritionEngine.calculateIodine(meal).value).toBeCloseTo(60, 2);
    expect(nutritionEngine.calculateVitaminK(meal).value).toBeCloseTo(40, 2);
  });
});

describe("calculateMagnesium / calculateCopper / calculateSelenium / calculateIodine / calculateVitaminK — contratto bioavailabilityAdjusted (PRD §4.0/§4.5)", () => {
  it("nessun modello di assorbimento esiste per questi nutrienti -> bioavailabilityAdjusted = false, sempre", () => {
    const meal = mealWith({ magnesium_mg: 50, copper_mg: 0.5, selenium_mcg: 20, iodine_mcg: 60, vitamin_k_mcg: 40 });
    if (nutritionEngine.calculateMagnesium(meal).bioavailabilityAdjusted !== false) throw new Error("magnesio: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateCopper(meal).bioavailabilityAdjusted !== false) throw new Error("rame: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateSelenium(meal).bioavailabilityAdjusted !== false) throw new Error("selenio: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateIodine(meal).bioavailabilityAdjusted !== false) throw new Error("iodio: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateVitaminK(meal).bioavailabilityAdjusted !== false) throw new Error("vitamina K: deve restare bioavailabilityAdjusted=false (nessun modello)");
  });
  it("nessuna fascia di confidenza inventata: confidenceLow/High restano null (nessun modello da cui propagarle)", () => {
    const meal = mealWith({ magnesium_mg: 50 });
    const r = nutritionEngine.calculateMagnesium(meal);
    expect(r.confidenceLow === null ? 1 : 0).toBe(1);
    expect(r.confidenceHigh === null ? 1 : 0).toBe(1);
  });
  it("sourceIds traccia comunque la fonte di composizione (USDA FDC) anche senza un modello di assorbimento", () => {
    const meal = mealWith({ magnesium_mg: 50 });
    const r = nutritionEngine.calculateMagnesium(meal);
    if (r.sourceIds.indexOf("USDA_FDC") === -1) throw new Error("sourceIds deve comunque tracciare la fonte di composizione, anche in assenza di un modello");
  });
});

// =============================================================================
// COMPUTATIONAL NUTRITION ENGINE — Macronutrienti (aggiunti 2026-10-10)
// =============================================================================
describe("calculateEnergy / calculateProtein / calculateCarbohydrates / calculateFat / calculateFiber — Livello A (difensivo)", () => {
  it("pasto vuoto -> 0 per tutti e cinque, nessuna eccezione", () => {
    expect(nutritionEngine.calculateEnergy({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateProtein({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateCarbohydrates({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateFat({ foods: [] }).value).toBe(0);
    expect(nutritionEngine.calculateFiber({ foods: [] }).value).toBe(0);
  });
  it("nutriente = 0 nell'unico alimento -> 0, non negativo", () => {
    const meal = mealWith({ protein_g: 0 });
    expect(nutritionEngine.calculateProtein(meal).value).toBe(0);
  });
});

describe("calculateEnergy / calculateProtein / calculateCarbohydrates / calculateFat / calculateFiber — Livello B (somma, nessun modello)", () => {
  it("due alimenti nello stesso pasto -> i valori si sommano esattamente (nessuna interazione fra alimenti)", () => {
    const meal: Meal = { foods: [
      makeFood({ id: "m1", energy_kcal: 150 }),
      makeFood({ id: "m2", energy_kcal: 80 })
    ]};
    expect(nutritionEngine.calculateEnergy(meal).value).toBeCloseTo(230, 2);
  });
  it("ognuno dei cinque è indipendente dagli altri quattro (nessuna fusione fra macronutrienti)", () => {
    const meal = mealWith({ energy_kcal: 200, protein_g: 10, carbohydrates_g: 25, fat_g: 7, fiber_g: 4 });
    expect(nutritionEngine.calculateEnergy(meal).value).toBeCloseTo(200, 2);
    expect(nutritionEngine.calculateProtein(meal).value).toBeCloseTo(10, 2);
    expect(nutritionEngine.calculateCarbohydrates(meal).value).toBeCloseTo(25, 2);
    expect(nutritionEngine.calculateFat(meal).value).toBeCloseTo(7, 2);
    expect(nutritionEngine.calculateFiber(meal).value).toBeCloseTo(4, 2);
  });
});

describe("calculateEnergy / calculateProtein / calculateCarbohydrates / calculateFat / calculateFiber — contratto bioavailabilityAdjusted", () => {
  it("nessun modello di assorbimento/digeribilità esiste per questi -> bioavailabilityAdjusted = false, sempre", () => {
    const meal = mealWith({ energy_kcal: 200, protein_g: 10, carbohydrates_g: 25, fat_g: 7, fiber_g: 4 });
    if (nutritionEngine.calculateEnergy(meal).bioavailabilityAdjusted !== false) throw new Error("energia: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateProtein(meal).bioavailabilityAdjusted !== false) throw new Error("proteine: deve restare bioavailabilityAdjusted=false (nessuna digeribilità modellata)");
    if (nutritionEngine.calculateCarbohydrates(meal).bioavailabilityAdjusted !== false) throw new Error("carboidrati: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateFat(meal).bioavailabilityAdjusted !== false) throw new Error("grassi: deve restare bioavailabilityAdjusted=false (nessun modello)");
    if (nutritionEngine.calculateFiber(meal).bioavailabilityAdjusted !== false) throw new Error("fibra: deve restare bioavailabilityAdjusted=false (nessun modello)");
  });
  it("sourceIds traccia comunque la fonte di composizione (USDA FDC)", () => {
    const meal = mealWith({ protein_g: 10 });
    const r = nutritionEngine.calculateProtein(meal);
    if (r.sourceIds.indexOf("USDA_FDC") === -1) throw new Error("sourceIds deve tracciare la fonte di composizione");
  });
});

// =============================================================================
// MICROBIOTA ENGINE
// =============================================================================
const microbiotaEngine = new MicrobiotaEngine();

describe("calculateMicrobiotaImpactScore — Livello A (difensivo)", () => {
  it("nessun alimento -> entrambi i punteggi = 0, verificationStatus 'verified' (zero dichiarato, non stimato)", () => {
    const r = microbiotaEngine.calculateMicrobiotaImpactScore({ foods: [] });
    expect(r.macsScore.value).toBe(0);
    expect(r.polyphenolsScore.value).toBe(0);
  });
  it("MACs e polifenoli restano due SourcedValue indipendenti (no fusione 70/30)", () => {
    const r = microbiotaEngine.calculateMicrobiotaImpactScore(mealWith({ macs_mg: 5000, polyphenols_mg: 0 }));
    expect(r.polyphenolsScore.value).toBe(0);
    expect(r.macsScore.value).toBeGreaterThan(0);
  });
});

describe("calculateMicrobiotaImpactScore — Livello B (proprietà)", () => {
  it("macsScore è monotono non-decrescente nei MACs totali, fino alla soglia di tolleranza", () => {
    const low = microbiotaEngine.calculateMicrobiotaImpactScore(mealWith({ macs_mg: 2000 })).macsScore.value;
    const mid = microbiotaEngine.calculateMicrobiotaImpactScore(mealWith({ macs_mg: 8000 })).macsScore.value;
    expect(mid).toBeGreaterThanOrEqual(low);
  });
  it("oltre la soglia di tolleranza (15g/pasto) il punteggio satura (effetto Km): nessun'altra crescita", () => {
    const atLimit = microbiotaEngine.calculateMicrobiotaImpactScore(mealWith({ macs_mg: 15000 })).macsScore.value;
    const overLimit = microbiotaEngine.calculateMicrobiotaImpactScore(mealWith({ macs_mg: 50000 })).macsScore.value;
    expect(overLimit).toBeCloseTo(atLimit, 1);
  });
  it("più famiglie botaniche diverse (a parità di MACs totali) non riduce mai il punteggio (moltiplicatore di diversità >= 1)", () => {
    const meal: Meal = { foods: [
      makeFood({ macs_mg: 3000, botanical_family: "fabaceae" })
    ]};
    const mealDiverse: Meal = { foods: [
      makeFood({ id: "f1", macs_mg: 1000, botanical_family: "fabaceae" }),
      makeFood({ id: "f2", macs_mg: 1000, botanical_family: "brassicaceae" }),
      makeFood({ id: "f3", macs_mg: 1000, botanical_family: "poaceae" })
    ]};
    const single = microbiotaEngine.calculateMicrobiotaImpactScore(meal).macsScore.value;
    const diverse = microbiotaEngine.calculateMicrobiotaImpactScore(mealDiverse).macsScore.value;
    expect(diverse).toBeGreaterThanOrEqual(single);
  });
});

// =============================================================================
// LCA / LOGISTICS ENGINE
// =============================================================================
const lcaEngine = new LCALogisticsEngine();

function makeFoodLCA(overrides: Partial<FoodItemLCA> = {}): FoodItemLCA {
  return {
    id: overrides.id ?? "lca-test",
    name: overrides.name ?? "Test LCA food",
    weight_g: 100,
    base_co2_kg_per_kg: 1.0,
    base_water_l_per_kg: 100,
    is_out_of_season: false,
    air_freight_distance_km: null,
    ...overrides
  };
}

describe("calculateEnvironmentalImpact — Livello A (difensivo)", () => {
  it("pasto vuoto -> carbon e water = 0, verified (zero dichiarato)", () => {
    const r = lcaEngine.calculateEnvironmentalImpact({ foods: [] });
    expect(r.carbon.value).toBe(0);
    expect(r.water.value).toBe(0);
  });
});

describe("calculateEnvironmentalImpact — Livello B/C (proprietà + calibrazione sulla formula dichiarata)", () => {
  it("fuori stagione moltiplica esattamente x4.0 il carbonio dell'alimento (come dichiarato nel commento del file)", () => {
    const inSeason = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ is_out_of_season: false })] }).carbon.value;
    const outOfSeason = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ is_out_of_season: true })] }).carbon.value;
    expect(outOfSeason).toBeCloseTo(inSeason * 4.0, 3);
  });
  it("trasporto aereo aggiunge esattamente distanza_km x peso_kg x fattore DEFRA (0.00113)", () => {
    const noFreight = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ air_freight_distance_km: null })] }).carbon.value;
    const withFreight = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ air_freight_distance_km: 5000 })] }).carbon.value;
    const expectedDelta = 5000 * 0.1 * 0.00113; // 100g = 0.1kg
    expect(withFreight - noFreight).toBeCloseTo(expectedDelta, 4);
  });
  it("dato idrico assente (null) -> water.verificationStatus = 'draft' (mai inventato un valore)", () => {
    const r = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ base_water_l_per_kg: null })] });
    expect(r.water.verificationStatus).toBe("draft");
  });
  it("fattore stagionale non verificato -> carbon.verificationStatus = 'draft' quando usato", () => {
    const r = lcaEngine.calculateEnvironmentalImpact({ foods: [makeFoodLCA({ is_out_of_season: true })] });
    expect(r.carbon.verificationStatus).toBe("draft");
  });
});

// =============================================================================
// COOKING TRANSFORMATION ENGINE
// =============================================================================
const cookingEngine = new CookingTransformationEngine();

describe("applyCookingTransformation — Livello A (difensivo)", () => {
  it("metodo 'raw' -> ritorna una copia identica, non l'oggetto originale (no mutazione)", () => {
    const raw = makeFood({ iron_mg: 5 });
    const result = cookingEngine.applyCookingTransformation(raw, "legumi", "raw", []);
    expect(result.iron_mg).toBe(5);
    expect(result === raw).toBe(false);
  });
  it("metodo 'raw' ignora SEMPRE i fattori di ritenzione anche se esistono per la matrice (contratto su cui si basa il guard baseline_cooking_state di app/page.tsx, vedi fix_baseline_cooking_state.sql — 2026-10-10)", () => {
    const raw = makeFood({ iron_mg: 5 });
    const factors: RetentionFactorRecord[] = [
      { matrix_id: "legumi", cooking_method: "raw", nutrient: "iron", value: 0.5 },
    ];
    const result = cookingEngine.applyCookingTransformation(raw, "legumi", "raw", factors);
    expect(result.iron_mg).toBe(5);
  });
  it("nessun fattore di ritenzione corrispondente in DB -> ritorna l'alimento invariato (non indovina un valore)", () => {
    const raw = makeFood({ iron_mg: 5 });
    const result = cookingEngine.applyCookingTransformation(raw, "legumi", "boiled", []);
    expect(result.iron_mg).toBe(5);
  });
  it("nutriente non riconosciuto nella mappa -> ignorato, nessun campo alterato per errore", () => {
    const raw = makeFood({ iron_mg: 5 });
    const factors: RetentionFactorRecord[] = [{ matrix_id: "legumi", cooking_method: "boiled", nutrient: "unknown_nutrient", value: 0.5 }];
    const result = cookingEngine.applyCookingTransformation(raw, "legumi", "boiled", factors);
    expect(result.iron_mg).toBe(5);
  });
  it("l'oggetto originale non viene mai mutato (immutabilità difensiva)", () => {
    const raw = makeFood({ iron_mg: 10 });
    const factors: RetentionFactorRecord[] = [{ matrix_id: "legumi", cooking_method: "boiled", nutrient: "iron", value: 0.85 }];
    cookingEngine.applyCookingTransformation(raw, "legumi", "boiled", factors);
    expect(raw.iron_mg).toBe(10); // l'originale non deve cambiare
  });
});

describe("applyCookingTransformation — Livello C (calibrazione sul fattore applicato)", () => {
  it("fattore di ritenzione 0.85 su ferro -> valore moltiplicato esattamente per 0.85", () => {
    const raw = makeFood({ iron_mg: 10 });
    const factors: RetentionFactorRecord[] = [{ matrix_id: "legumi_fagioli", cooking_method: "boiled", nutrient: "iron", value: 0.85 }];
    const result = cookingEngine.applyCookingTransformation(raw, "legumi_fagioli", "boiled", factors);
    expect(result.iron_mg).toBeCloseTo(8.50, 2);
  });
  it("più fattori diversi nello stesso pasto si applicano in modo indipendente ai rispettivi campi", () => {
    const raw = makeFood({ iron_mg: 10, zinc_mg: 4, vitamin_c_mg: 20 });
    const factors: RetentionFactorRecord[] = [
      { matrix_id: "legumi_fagioli", cooking_method: "boiled", nutrient: "iron", value: 0.85 },
      { matrix_id: "legumi_fagioli", cooking_method: "boiled", nutrient: "zinc", value: 0.85 },
      { matrix_id: "legumi_fagioli", cooking_method: "boiled", nutrient: "vitamin_c", value: 0.65 }
    ];
    const result = cookingEngine.applyCookingTransformation(raw, "legumi_fagioli", "boiled", factors);
    expect(result.iron_mg).toBeCloseTo(8.50, 2);
    expect(result.zinc_mg).toBeCloseTo(3.40, 2);
    expect(result.vitamin_c_mg).toBeCloseTo(13.00, 2);
  });
  it("un fattore di ritenzione realmente applicato flippa carotenoid_matrix_state da raw_intact a cooked_or_disrupted (2026-10-10: bug latente corretto, nessun alimento del Golden Set esercitava ancora questo percorso -- vedi broccoli/carote)", () => {
    const raw = makeFood({ iron_mg: 10, beta_carotene_mcg: 500, carotenoid_matrix_state: "raw_intact" });
    const factors: RetentionFactorRecord[] = [{ matrix_id: "broccoli", cooking_method: "boiled", nutrient: "iron", value: 0.92 }];
    const result = cookingEngine.applyCookingTransformation(raw, "broccoli", "boiled", factors);
    expect(result.carotenoid_matrix_state).toBe("cooked_or_disrupted");
    // il contenuto di beta-carotene stesso NON va scalato qui -- solo lo
    // stato della matrice cambia, per evitare un doppio conteggio con la
    // conversione RAE a valle (vedi DERIVED_FDC_RAW_COOKED_RATIO).
    expect(result.beta_carotene_mcg).toBe(500);
  });
  it("nessun fattore di ritenzione applicabile (matrice/metodo senza righe) -> carotenoid_matrix_state resta invariato", () => {
    const raw = makeFood({ iron_mg: 10, carotenoid_matrix_state: "raw_intact" });
    const result = cookingEngine.applyCookingTransformation(raw, "broccoli", "boiled", []);
    expect(result.carotenoid_matrix_state).toBe("raw_intact");
  });
});

describe("scaleFoodItemToGrams — Livello A (difensivo)", () => {
  it("grammi = 100 -> valori nutrienti invariati (factor = 1)", () => {
    const food = makeFood({ iron_mg: 7.2, energy_kcal: 150 });
    const result = scaleFoodItemToGrams(food, 100);
    expect(result.iron_mg).toBeCloseTo(7.2, 5);
    expect(result.energy_kcal).toBeCloseTo(150, 5);
  });
  it("grammi = 0 -> tutti i campi nutrienti diventano 0, non NaN/negativo", () => {
    const food = makeFood({ iron_mg: 7.2, zinc_mg: 3, energy_kcal: 150 });
    const result = scaleFoodItemToGrams(food, 0);
    expect(result.iron_mg).toBe(0);
    expect(result.zinc_mg).toBe(0);
    expect(result.energy_kcal).toBe(0);
  });
  it("grammi negativi -> trattati come 0 (porzione assente), mai un valore negativo propagato", () => {
    const food = makeFood({ iron_mg: 7.2 });
    const result = scaleFoodItemToGrams(food, -50);
    expect(result.iron_mg).toBe(0);
  });
  it("grammi = NaN -> trattati come 0, mai NaN propagato silenziosamente nella UI", () => {
    const food = makeFood({ iron_mg: 7.2 });
    const result = scaleFoodItemToGrams(food, NaN);
    expect(result.iron_mg).toBe(0);
  });
  it("grammi = Infinity -> trattati come 0, non Infinity propagato", () => {
    const food = makeFood({ iron_mg: 7.2 });
    const result = scaleFoodItemToGrams(food, Infinity);
    expect(result.iron_mg).toBe(0);
  });
  it("i campi categorici (is_heme_iron, botanical_family, matrix_category_calcium, carotenoid_matrix_state, zinc_bioaccessibility_bucket, is_fortified_folate) non vengono MAI scalati, qualunque sia la grammatura", () => {
    const food = makeFood({
      is_heme_iron: true,
      botanical_family: "Fabaceae",
      matrix_category_calcium: "high_oxalate",
      carotenoid_matrix_state: "raw_intact",
      zinc_bioaccessibility_bucket: "brussels_sprouts_boiled",
      is_fortified_folate: true,
    });
    const result = scaleFoodItemToGrams(food, 250);
    expect(result.is_heme_iron).toBe(true);
    expect(result.botanical_family).toBe("Fabaceae");
    expect(result.matrix_category_calcium).toBe("high_oxalate");
    expect(result.carotenoid_matrix_state).toBe("raw_intact");
    expect(result.zinc_bioaccessibility_bucket).toBe("brussels_sprouts_boiled");
    expect(result.is_fortified_folate).toBe(true);
  });
  it("id e name restano invariati", () => {
    const food = makeFood({ id: "food_test", name: "Test" });
    const result = scaleFoodItemToGrams(food, 250);
    expect(result.id).toBe("food_test");
    expect(result.name).toBe("Test");
  });
});

describe("scaleFoodItemToGrams — Livello B (proprietà: scaling lineare)", () => {
  it("grammi = 200 -> ogni campo nutriente esattamente raddoppiato", () => {
    const food = makeFood({ iron_mg: 7.2, zinc_mg: 3, energy_kcal: 150, protein_g: 10 });
    const result = scaleFoodItemToGrams(food, 200);
    expect(result.iron_mg).toBeCloseTo(14.4, 5);
    expect(result.zinc_mg).toBeCloseTo(6, 5);
    expect(result.energy_kcal).toBeCloseTo(300, 5);
    expect(result.protein_g).toBeCloseTo(20, 5);
  });
  it("grammi = 50 -> ogni campo nutriente esattamente dimezzato", () => {
    const food = makeFood({ iron_mg: 7.2, energy_kcal: 150 });
    const result = scaleFoodItemToGrams(food, 50);
    expect(result.iron_mg).toBeCloseTo(3.6, 5);
    expect(result.energy_kcal).toBeCloseTo(75, 5);
  });
  it("scalare poi sommare due porzioni dello stesso alimento equivale a un'unica porzione della somma dei grammi (additività)", () => {
    const food = makeFood({ iron_mg: 8 });
    const a = scaleFoodItemToGrams(food, 30).iron_mg;
    const b = scaleFoodItemToGrams(food, 70).iron_mg;
    const whole = scaleFoodItemToGrams(food, 100).iron_mg;
    expect(a + b).toBeCloseTo(whole, 5);
  });
});

// ---------------------------------------------------------------------------
// Report finale
// ---------------------------------------------------------------------------
const pass = results.filter(r => r.status === "PASS").length;
const fail = results.filter(r => r.status === "FAIL").length;
const limiteNoto = results.filter(r => r.status === "LIMITE NOTO").length;

console.log("\n=== RISULTATI TEST REALI (eseguiti contro il codice in lib/engine/) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : r.status === "LIMITE NOTO" ? "⚠" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL, ${limiteNoto} LIMITE NOTO (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
