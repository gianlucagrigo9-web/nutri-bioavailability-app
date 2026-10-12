// tests/dietCategory.test.ts
//
// Criteri di accettazione (Regola 5) per lib/fdc/dietCategory.ts, scritti
// PRIMA del codice di produzione (2026-10-12).
//
// Perche' esiste: scripts/add_food_from_fdc.ts (Fase 4.16) non scriveva le
// 3 colonne foods_raw.diet_compat_vegetarian/vegan/fruitarian. Ogni alimento
// aggiunto dalla pipeline restava quindi NULL = "non classificato", e
// filterFoodsByDietType (lib/engine/dietTypeFilter.ts) lo ESCLUDE da
// qualunque dieta diversa da "onnivora" (scelta difensiva dichiarata: mai
// assumere compatibile cio' che non e' classificato). Risultato: la
// copertura alimenti cresceva ma per vegetariani/vegani/fruttariani
// restava invisibile -- un fallimento silenzioso (Regola 4).
//
// Fix: la classificazione e' una decisione editoriale che chi lancia lo
// script deve dichiarare (come --analogy-food-id), tramite UNA categoria
// fra le 4 gia' usate dal Golden Set -- non tre booleani liberi, cosi'
// una combinazione incoerente (es. vegano ma non vegetariano) non si puo'
// nemmeno esprimere.
//
// Stesso micro test runner autosufficiente degli altri file di test.

import { DIET_CATEGORY_NAMES, dietFlagsToColumns, parseDietCategory } from "../lib/fdc/dietCategory";
import { GOLDEN_SET_DIET_COMPATIBILITY } from "../lib/engine/goldenSetDietCompatibility";

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
      if (actual !== expected) throw new Error(`atteso ${JSON.stringify(expected)}, ricevuto ${JSON.stringify(actual)}`);
    },
    toEqual(expected: any) {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) throw new Error(`atteso ${e}, ricevuto ${a}`);
    },
    toContain(sub: string) {
      if (typeof actual !== "string" || !actual.includes(sub)) {
        throw new Error(`atteso che "${actual}" contenga "${sub}"`);
      }
    },
  };
}

function mustBeOk(r: ReturnType<typeof parseDietCategory>) {
  if (!r.ok) throw new Error(`atteso ok=true, ricevuto errore: ${r.error}`);
  return r;
}

describe("parseDietCategory — le 4 categorie valide mappano ai flag corretti", () => {
  it("meat_fish -> vegetarian=false, vegan=false, fruitarian=false", () => {
    expect(mustBeOk(parseDietCategory("meat_fish")).flags).toEqual({ vegetarian: false, vegan: false, fruitarian: false });
  });
  it("egg_dairy -> vegetarian=true, vegan=false, fruitarian=false (uova, latticini, miele)", () => {
    expect(mustBeOk(parseDietCategory("egg_dairy")).flags).toEqual({ vegetarian: true, vegan: false, fruitarian: false });
  });
  it("fresh_fruit -> true/true/true (unica categoria fruttariana, definizione restrittiva del PRD)", () => {
    expect(mustBeOk(parseDietCategory("fresh_fruit")).flags).toEqual({ vegetarian: true, vegan: true, fruitarian: true });
  });
  it("plant_non_fruit -> vegetarian=true, vegan=true, fruitarian=false (verdure, legumi, cereali, frutta secca)", () => {
    expect(mustBeOk(parseDietCategory("plant_non_fruit")).flags).toEqual({ vegetarian: true, vegan: true, fruitarian: false });
  });
  it("il risultato riporta anche il nome della categoria scelta (per l'audit nel riepilogo dello script)", () => {
    expect(mustBeOk(parseDietCategory("egg_dairy")).category).toBe("egg_dairy");
  });
});

describe("parseDietCategory — input mancante o non valido: MAI un default", () => {
  it("null (flag non passato) -> errore, non una categoria di default", () => {
    const r = parseDietCategory(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("obbligatorio");
  });
  it("stringa vuota (--diet-category=) -> errore, non trattata come 'non passato'", () => {
    expect(parseDietCategory("").ok).toBe(false);
  });
  it("valore sconosciuto (es. 'vegano') -> errore che elenca TUTTE le categorie valide", () => {
    const r = parseDietCategory("vegano");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      for (const name of DIET_CATEGORY_NAMES) expect(r.error).toContain(name);
    }
  });
  it("differenza di maiuscole ('Meat_Fish') -> errore, nessuna normalizzazione silenziosa", () => {
    expect(parseDietCategory("Meat_Fish").ok).toBe(false);
  });
  it("spazi attorno al valore (' plant_non_fruit ') -> errore, nessun trim silenzioso", () => {
    expect(parseDietCategory(" plant_non_fruit ").ok).toBe(false);
  });
  it("nomi ereditati da Object.prototype ('constructor', 'toString') -> errore, non una 'categoria'", () => {
    expect(parseDietCategory("constructor").ok).toBe(false);
    expect(parseDietCategory("toString").ok).toBe(false);
    expect(parseDietCategory("__proto__").ok).toBe(false);
  });
});

describe("parseDietCategory — coerenza logica (non esprimibile una combinazione incoerente)", () => {
  it("per OGNI categoria: vegano implica vegetariano, fruttariano implica vegano", () => {
    for (const name of DIET_CATEGORY_NAMES) {
      const { flags } = mustBeOk(parseDietCategory(name));
      if (flags.vegan && !flags.vegetarian) throw new Error(`${name}: vegan=true ma vegetarian=false`);
      if (flags.fruitarian && !flags.vegan) throw new Error(`${name}: fruitarian=true ma vegan=false`);
    }
  });
  it("esattamente 4 categorie (se ne aggiungi una, aggiorna anche PRD §4.9 e questo test, non solo il codice)", () => {
    expect(DIET_CATEGORY_NAMES.length).toBe(4);
  });
  it("il risultato e' una copia: modificarlo non altera le classificazioni successive", () => {
    const first = mustBeOk(parseDietCategory("meat_fish"));
    first.flags.vegetarian = true; // mutazione deliberata
    expect(mustBeOk(parseDietCategory("meat_fish")).flags.vegetarian).toBe(false);
  });
});

describe("Singola fonte di verita' con il Golden Set (nessuna classificazione duplicata che possa divergere)", () => {
  it("meat_fish == classificazione di food_beef_ground_raw", () => {
    expect(mustBeOk(parseDietCategory("meat_fish")).flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_beef_ground_raw"]);
  });
  it("egg_dairy == classificazione di food_egg_raw e food_milk_whole", () => {
    const flags = mustBeOk(parseDietCategory("egg_dairy")).flags;
    expect(flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_egg_raw"]);
    expect(flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_milk_whole"]);
  });
  it("fresh_fruit == classificazione di food_oranges_raw", () => {
    expect(mustBeOk(parseDietCategory("fresh_fruit")).flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_oranges_raw"]);
  });
  it("plant_non_fruit == classificazione di food_kale_raw e food_pasta_enriched_dry", () => {
    const flags = mustBeOk(parseDietCategory("plant_non_fruit")).flags;
    expect(flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_kale_raw"]);
    expect(flags).toEqual(GOLDEN_SET_DIET_COMPATIBILITY["food_pasta_enriched_dry"]);
  });
});

describe("dietFlagsToColumns — nomi colonna esatti di foods_raw (add_diet_compatibility_golden_set.sql)", () => {
  it("mappa i tre flag sulle tre colonne diet_compat_*", () => {
    expect(dietFlagsToColumns({ vegetarian: true, vegan: false, fruitarian: false })).toEqual({
      diet_compat_vegetarian: true,
      diet_compat_vegan: false,
      diet_compat_fruitarian: false,
    });
  });
  it("tutti e tre i valori sono booleani veri (mai null/undefined) per ogni categoria", () => {
    for (const name of DIET_CATEGORY_NAMES) {
      const cols = dietFlagsToColumns(mustBeOk(parseDietCategory(name)).flags);
      for (const [k, v] of Object.entries(cols)) {
        if (typeof v !== "boolean") throw new Error(`${name}: ${k} non e' booleano (${String(v)})`);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Report finale (stessa convenzione degli altri file di test)
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.status === "PASS").length;
const fail = results.filter((r) => r.status === "FAIL").length;

console.log("\n=== RISULTATI TEST REALI (categoria dieta per add-food) ===\n");
for (const r of results) {
  const icon = r.status === "PASS" ? "✓" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}${r.detail ? `\n    -> ${r.detail}` : ""}`);
}
console.log(`\n--- ${pass} PASS, ${fail} FAIL (su ${results.length} test totali) ---\n`);

if (fail > 0) {
  process.exit(1);
}
