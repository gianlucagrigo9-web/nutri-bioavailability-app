// tests/goldenSetDietCompatibility.test.ts
//
// Verifica difensiva della classificazione dietCompatibility del
// Golden Set (docs/PRD.md §4.9, lib/engine/goldenSetDietCompatibility.ts
// + add_diet_compatibility_golden_set.sql). Stesso micro test runner
// autosufficiente degli altri file di test.

import { GOLDEN_SET_DIET_COMPATIBILITY, getGoldenSetDietCompatibility } from "../lib/engine/goldenSetDietCompatibility";

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
    toBeUndefined() {
      if (actual !== undefined) throw new Error(`atteso undefined, ricevuto ${JSON.stringify(actual)}`);
    },
  };
}

const ALL_IDS = Object.keys(GOLDEN_SET_DIET_COMPATIBILITY);

describe("GOLDEN_SET_DIET_COMPATIBILITY — completezza e coerenza (stessa classificazione del .sql)", () => {
  it("esattamente 30 alimenti classificati (il Golden Set attuale, verificato leggendo i file .sql committati)", () => {
    expect(ALL_IDS.length).toBe(30);
  });

  it("nessuna riga ha vegan=true e vegetarian=false (vegano implica vegetariano)", () => {
    const violazioni = ALL_IDS.filter((id) => {
      const c = GOLDEN_SET_DIET_COMPATIBILITY[id];
      return c.vegan === true && c.vegetarian === false;
    });
    if (violazioni.length > 0) throw new Error(`violazioni: ${violazioni.join(", ")}`);
  });

  it("nessuna riga ha fruitarian=true e vegan=false (fruttariano implica vegano)", () => {
    const violazioni = ALL_IDS.filter((id) => {
      const c = GOLDEN_SET_DIET_COMPATIBILITY[id];
      return c.fruitarian === true && c.vegan === false;
    });
    if (violazioni.length > 0) throw new Error(`violazioni: ${violazioni.join(", ")}`);
  });

  it("esattamente un alimento (le arance) è fruitarian=true -- unica frutta fresca nel Golden Set attuale", () => {
    const frutta = ALL_IDS.filter((id) => GOLDEN_SET_DIET_COMPATIBILITY[id].fruitarian === true);
    expect(frutta.length).toBe(1);
    expect(frutta[0]).toBe("food_oranges_raw");
  });

  it("carne e pesce (6 alimenti: manzo x4, salmone x2) sono false sui tre assi", () => {
    const carnePesce = ["food_beef_ground_cooked", "food_beef_ground_raw", "food_beef_liver_cooked", "food_beef_liver_raw", "food_salmon_cooked", "food_salmon_raw"];
    for (const id of carnePesce) {
      const c = GOLDEN_SET_DIET_COMPATIBILITY[id];
      if (c.vegetarian !== false || c.vegan !== false || c.fruitarian !== false) {
        throw new Error(`${id} dovrebbe essere false/false/false, trovato ${JSON.stringify(c)}`);
      }
    }
  });

  it("uova e latte sono vegetarian=true, vegan=false", () => {
    for (const id of ["food_egg_hard_boiled", "food_egg_raw", "food_milk_whole"]) {
      const c = GOLDEN_SET_DIET_COMPATIBILITY[id];
      if (c.vegetarian !== true || c.vegan !== false) {
        throw new Error(`${id} dovrebbe essere vegetarian=true, vegan=false, trovato ${JSON.stringify(c)}`);
      }
    }
  });
});

describe("getGoldenSetDietCompatibility — mai un default indovinato per un food_id non elencato", () => {
  it("food_id del Golden Set -> restituisce la classificazione", () => {
    const c = getGoldenSetDietCompatibility("food_spinach_raw");
    if (!c) throw new Error("atteso un valore per food_spinach_raw");
    expect(c.vegetarian).toBe(true);
  });

  it("food_id non elencato (es. non ancora nel Golden Set) -> undefined, mai un default", () => {
    expect(getGoldenSetDietCompatibility("food_quinoa_raw")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (classificazione dietCompatibility del Golden Set) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
