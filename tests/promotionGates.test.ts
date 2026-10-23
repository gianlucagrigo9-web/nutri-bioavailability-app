// tests/promotionGates.test.ts
//
// Criteri di accettazione (Regola 5) per lib/fdc/promotionGates.ts, scritti
// PRIMA del codice di produzione (2026-10-23).
//
// Perche' esiste: il 2026-10-23 l'utente ha chiesto di promuovere da
// 'draft' a 'verified' i 428 alimenti della pipeline add-food "con criteri
// solo automatici". scripts/verify_golden_set_batch.ts controllava gia' che
// OGNI valore nutriente combaci con FDC, ma non che l'alimento fosse
// "completo" per l'app: un alimento senza flag dieta (NULL) viene escluso da
// ogni dieta non onnivora (dietTypeFilter.ts) e un fdc_id che oggi punta a
// un record diverso da quello scelto al momento dell'inserimento
// passerebbe comunque il confronto numerico di righe riscritte. Questi
// controlli ("gate") si applicano PRIMA di promuovere qualunque riga.
//
// Stesso micro test runner autosufficiente degli altri file di test.

import { evaluatePromotionGate } from "../lib/fdc/promotionGates";

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
  };
}

const ok = {
  nameIt: "Zucchine, crude (con buccia)",
  fdcNameStored: "Squash, summer, zucchini, includes skin, raw",
  fdcDescriptionLive: "Squash, summer, zucchini, includes skin, raw",
  dietVegetarian: true as boolean | null,
  dietVegan: true as boolean | null,
  dietFruitarian: false as boolean | null,
};

describe("evaluatePromotionGate", () => {
  it("alimento completo e coerente: promuovibile", () => {
    const g = evaluatePromotionGate(ok);
    expect(g.ok).toBe(true);
    expect(g.reasons.length).toBe(0);
  });

  it("ignora differenze di sola spaziatura nella descrizione FDC", () => {
    expect(evaluatePromotionGate({ ...ok, fdcDescriptionLive: "  Squash, summer,  zucchini, includes skin, raw " }).ok).toBe(true);
  });

  it("descrizione FDC diversa da quella salvata all'inserimento: bloccato", () => {
    const g = evaluatePromotionGate({ ...ok, fdcDescriptionLive: "Squash, summer, zucchini, baby, raw" });
    expect(g.ok).toBe(false);
  });

  it("descrizione FDC salvata assente: bloccato (non si promuove cio' che non si puo' controllare)", () => {
    expect(evaluatePromotionGate({ ...ok, fdcNameStored: null }).ok).toBe(false);
    expect(evaluatePromotionGate({ ...ok, fdcNameStored: "   " }).ok).toBe(false);
  });

  it("descrizione FDC live assente: bloccato", () => {
    expect(evaluatePromotionGate({ ...ok, fdcDescriptionLive: undefined }).ok).toBe(false);
  });

  it("un flag dieta NULL (alimento non classificato): bloccato", () => {
    expect(evaluatePromotionGate({ ...ok, dietVegetarian: null }).ok).toBe(false);
    expect(evaluatePromotionGate({ ...ok, dietVegan: null }).ok).toBe(false);
    expect(evaluatePromotionGate({ ...ok, dietFruitarian: null }).ok).toBe(false);
  });

  it("flag dieta incoerenti (vegano ma non vegetariano; fruttariano ma non vegano): bloccato", () => {
    expect(evaluatePromotionGate({ ...ok, dietVegetarian: false, dietVegan: true }).ok).toBe(false);
    expect(evaluatePromotionGate({ ...ok, dietVegan: false, dietFruitarian: true }).ok).toBe(false);
  });

  it("combinazioni valide delle 4 categorie dieta: promuovibili", () => {
    // meat_fish f/f/f, egg_dairy t/f/f, fresh_fruit t/t/t, plant_non_fruit t/t/f
    for (const [v, g, f] of [[false, false, false], [true, false, false], [true, true, true], [true, true, false]] as const) {
      expect(evaluatePromotionGate({ ...ok, dietVegetarian: v, dietVegan: g, dietFruitarian: f }).ok).toBe(true);
    }
  });

  it("nome italiano vuoto: bloccato", () => {
    expect(evaluatePromotionGate({ ...ok, nameIt: "  " }).ok).toBe(false);
    expect(evaluatePromotionGate({ ...ok, nameIt: null }).ok).toBe(false);
  });

  it("riporta TUTTI i motivi, non solo il primo", () => {
    const g = evaluatePromotionGate({ ...ok, nameIt: "", dietVegetarian: null, fdcNameStored: null });
    expect(g.ok).toBe(false);
    expect(g.reasons.length >= 3).toBe(true);
  });
});

const failed = results.filter((r) => r.status === "FAIL");
for (const r of results) {
  console.log(`${r.status === "PASS" ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` -- ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} test passati`);
if (failed.length > 0) process.exit(1);
