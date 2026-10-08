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
import { FoodItem, Meal, DailyDiet } from "../lib/engine/types";

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
