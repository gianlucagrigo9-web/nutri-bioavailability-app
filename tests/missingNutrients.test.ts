// tests/missingNutrients.test.ts
//
// Criteri di accettazione (Regola 5) per lib/engine/missingNutrients.ts,
// scritti PRIMA del codice di produzione (2026-10-23).
//
// Perche' esiste: decisione dell'utente del 2026-10-22 -- gli alimenti con
// pochi nutrienti trovati in FDC entrano comunque nell'app, ma un nutriente
// ASSENTE dalla letteratura non deve essere confuso con un nutriente che
// VALE ZERO. Nel database l'assenza e' gia' "nessuna riga in
// nutrient_values" (add_food_from_fdc.ts non inserisce mai uno zero per
// un'assenza); app/page.tsx pero' la convertiva in 0 senza segnalarlo.
//
// Stesso micro test runner autosufficiente degli altri file di test.

import { FoodItem, NutrientFieldName, SCALABLE_NUTRIENT_FIELDS } from "../lib/engine/types";
import {
  NUTRIENT_LABELS_IT,
  computeMissingNutrients,
  describeNutrientGap,
  summarizeMissingInMeal,
} from "../lib/engine/missingNutrients";

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
    results.push({ name: `${currentSuite} > ${name}`, status: "PASS" });
  } catch (e) {
    results.push({ name: `${currentSuite} > ${name}`, status: "FAIL", detail: (e as Error).message });
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) throw new Error(`atteso ${JSON.stringify(expected)}, ricevuto ${JSON.stringify(actual)}`);
    },
    toEqual(expected: unknown) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) throw new Error(`atteso ${b}, ricevuto ${a}`);
    },
  };
}

function food(id: string, name: string, missing?: NutrientFieldName[]): FoodItem {
  const base = {
    id,
    name,
    is_heme_iron: false,
    matrix_category_calcium: "medium_oxalate",
    botanical_family: null,
    is_fortified_folate: false,
    carotenoid_matrix_state: "cooked_or_disrupted",
    zinc_bioaccessibility_bucket: "none",
    missingNutrients: missing,
  } as Record<string, unknown>;
  for (const f of SCALABLE_NUTRIENT_FIELDS) base[f] = 0;
  return base as unknown as FoodItem;
}

describe("computeMissingNutrients", () => {
  it("con tutte le righe presenti non segnala nulla", () => {
    expect(computeMissingNutrients([...SCALABLE_NUTRIENT_FIELDS])).toEqual([]);
  });

  it("con nessuna riga segnala tutti i campi nutriente", () => {
    expect(computeMissingNutrients([]).length).toBe(SCALABLE_NUTRIENT_FIELDS.length);
  });

  it("segnala solo i campi senza riga, nell'ordine canonico", () => {
    const present = SCALABLE_NUTRIENT_FIELDS.filter((f) => f !== "iron_mg" && f !== "zinc_mg");
    expect(computeMissingNutrients(present)).toEqual(["iron_mg", "zinc_mg"]);
  });

  it("ignora codici sconosciuti e duplicati, senza inventare campi", () => {
    const present = [...SCALABLE_NUTRIENT_FIELDS, "codice_inventato", "iron_mg"];
    expect(computeMissingNutrients(present)).toEqual([]);
  });
});

describe("NUTRIENT_LABELS_IT", () => {
  it("ha un'etichetta italiana non vuota per ogni campo nutriente", () => {
    for (const f of SCALABLE_NUTRIENT_FIELDS) {
      expect(typeof NUTRIENT_LABELS_IT[f]).toBe("string");
      expect(NUTRIENT_LABELS_IT[f].length > 0).toBe(true);
    }
  });
});

describe("describeNutrientGap", () => {
  it("pasto vuoto: nessun dato mancante e nulla di 'non disponibile'", () => {
    const g = describeNutrientGap([], ["iron_mg"]);
    expect(g.unavailable).toBe(false);
    expect(g.foodsWithGap).toEqual([]);
  });

  it("un solo alimento senza il dato: non disponibile", () => {
    const g = describeNutrientGap([food("a", "Riso venere", ["iron_mg"])], ["iron_mg"]);
    expect(g.unavailable).toBe(true);
    expect(g.foodsWithGap).toEqual(["Riso venere"]);
  });

  it("dato presente solo in alcuni alimenti: disponibile ma parziale (elenca chi manca)", () => {
    const g = describeNutrientGap(
      [food("a", "Lenticchie"), food("b", "Riso venere", ["iron_mg"])],
      ["iron_mg"]
    );
    expect(g.unavailable).toBe(false);
    expect(g.foodsWithGap).toEqual(["Riso venere"]);
  });

  it("alimenti senza informazione (missingNutrients assente) non sono considerati lacunosi", () => {
    const g = describeNutrientGap([food("a", "Prodotto scansionato", undefined)], ["iron_mg"]);
    expect(g.unavailable).toBe(false);
    expect(g.foodsWithGap).toEqual([]);
  });

  it("stesso alimento due volte nel piatto: nome elencato una volta sola", () => {
    const f = food("a", "Riso venere", ["zinc_mg"]);
    const g = describeNutrientGap([f, f], ["zinc_mg"]);
    expect(g.foodsWithGap).toEqual(["Riso venere"]);
  });

  it("con piu' campi (es. vitamina A): non disponibile solo se TUTTI gli alimenti mancano di TUTTI i campi", () => {
    const a = food("a", "A", ["beta_carotene_mcg", "other_provitamin_a_carotenoids_mcg"]);
    const b = food("b", "B", ["beta_carotene_mcg"]);
    expect(describeNutrientGap([a], ["beta_carotene_mcg", "other_provitamin_a_carotenoids_mcg"]).unavailable).toBe(true);
    // b ha l'altro campo: la vitamina A e' calcolabile in parte -> disponibile ma parziale
    const g = describeNutrientGap([a, b], ["beta_carotene_mcg", "other_provitamin_a_carotenoids_mcg"]);
    expect(g.unavailable).toBe(false);
    expect(g.foodsWithGap).toEqual(["A", "B"]);
  });
});

describe("summarizeMissingInMeal", () => {
  it("pasto senza lacune: elenco vuoto", () => {
    expect(summarizeMissingInMeal([food("a", "A", [])])).toEqual([]);
  });

  it("raggruppa per nutriente con i nomi degli alimenti, ordine canonico dei campi", () => {
    const s = summarizeMissingInMeal([
      food("a", "A", ["zinc_mg", "iron_mg"]),
      food("b", "B", ["iron_mg"]),
    ]);
    expect(s.map((x) => x.field)).toEqual(["iron_mg", "zinc_mg"]);
    expect(s[0].foodNames).toEqual(["A", "B"]);
    expect(s[1].foodNames).toEqual(["A"]);
    expect(s[0].allFoodsMissing).toBe(true);
    expect(s[1].allFoodsMissing).toBe(false);
  });
});

// ---------------------------------------------------------------------------
const failed = results.filter((r) => r.status === "FAIL");
for (const r of results) {
  console.log(`${r.status === "PASS" ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` -- ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} test passati`);
if (failed.length > 0) process.exit(1);
