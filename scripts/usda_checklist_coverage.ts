// scripts/usda_checklist_coverage.ts
//
// Calcola la copertura di docs/USDA_CHECKLIST.csv rispetto al lavoro già
// fatto/valutato in questo repo (docs/PRD.md, docs/GOLDEN_SET_READY_TO_RUN.md,
// docs/PENDING_HUMAN_ACTIONS.md, lotti_alimenti/*.txt) e stampa i prossimi
// candidati non ancora coperti, a rotazione fra le categorie USDA della
// priorità più alta non ancora esaurita.
//
// PERCHÉ QUESTO FILE ESISTE (2026-11-24, turno delle 23:12):
// Lo script di copertura incollato ogni turno nel prompt del task pianificato
// "Ricerca Golden Set" ha DUE bug noti, entrambi già scoperti e corretti "al
// volo" in sessioni precedenti (217°, 219° lotto e altri) ma MAI persistiti,
// perché ogni turno riparte da una sessione fresca senza memoria e il prompt
// stesso non viene aggiornato da qui:
//   1. `\d{6}` cattura solo FDC ID a 6 cifre (SR Legacy tipici), non i 7 cifre
//      tipici di Foundation Foods (es. 2646174, 2710822) -- sotto-conta la
//      copertura reale (confermato più volte, es. 193° lotto 2026-11-17).
//   2. Anche con la regex corretta a 6-7 cifre, un alimento già VALUTATO
//      (⚠ o variante scartata) in un turno precedente ma citato in prosa
//      compatta SENZA il prefisso letterale "FDC " (es. "(168046/168047)"
//      invece di "FDC 168046") non viene riconosciuto come coperto, e
//      ricompare come "candidato nuovo" al turno successivo -- confermato
//      concretamente in questo turno (23:12): quasi TUTTI i ~90 alimenti
//      valutati dal 219° lotto (19:12, poche ore prima) sono ricomparsi
//      come candidati "mai fatti" perché citati solo tra parentesi. Il
//      217°/215°/211° lotto avevano già raccomandato un controllo di
//      prossimità testuale (parole chiave della descrizione, non solo FDC
//      ID) come mitigazione più robusta -- qui implementato in modo
//      persistente invece di essere ripetuto "al volo" ogni turno.
//
// USO: tsx scripts/usda_checklist_coverage.ts [--limit=130] [--priority=A]
//   Nessuna scrittura, nessuna rete, nessuna dipendenza da variabili
//   d'ambiente -- solo lettura di file di testo già nel repo.
//
// NOTA: questo script aiuta a NON sprecare ricerca web su doppioni/varianti
// già scartati, ma non sostituisce il giudizio umano/dell'agente: un
// candidato segnalato come "probabile doppione" dal controllo di
// prossimità testuale va comunque riletto nel contesto (il grep del match)
// prima di scartarlo definitivamente, perché un falso positivo (due
// alimenti diversi che condividono parole comuni) è possibile.

import * as fs from "fs";

function readSafe(path: string): string {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

const args = process.argv.slice(2);
function argValue(name: string, def: string): string {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : def;
}

const LIMIT = parseInt(argValue("limit", "130"), 10);
const FORCE_PRIORITY = argValue("priority", "");

const sourceFiles = [
  "docs/PRD.md",
  "docs/GOLDEN_SET_READY_TO_RUN.md",
  "docs/PENDING_HUMAN_ACTIONS.md",
  ...fs.readdirSync("lotti_alimenti").filter((f) => f.endsWith(".txt")).map((f) => `lotti_alimenti/${f}`),
];

const fullText = sourceFiles.map((f) => readSafe(f)).join("\n");

// --- 1) Copertura per FDC ID ---
// (a) Forma esplicita "FDC 123456" / "FDC ID 123456" / "fdc-id=123456"
//     (6 o 7 cifre -- l'intervallo reale degli FDC ID in uso in questo
//     progetto: SR Legacy tipicamente 6 cifre, Foundation Foods 7 cifre).
// (b) Forma compatta tra parentesi usata spesso nelle code riassuntive,
//     es. "(168046/168047)" o "(2644289, e 2644290 ...)": qualunque numero
//     di 6-7 cifre che compare DENTRO una coppia di parentesi tonde viene
//     considerato coperto anche senza il prefisso "FDC" esplicito. Non
//     generico quanto "qualunque numero nel testo" (che rischierebbe falsi
//     positivi su conteggi/date), ma copre il pattern di citazione reale
//     osservato nei lotti passati (217°/219°).
const fdcCovered = new Set<string>();
for (const m of fullText.matchAll(/(?:FDC(?: ID)?s?|fdc-id=)[ =:#~]*(\d{6,7})/g)) {
  fdcCovered.add(m[1]);
}
for (const paren of fullText.matchAll(/\(([^()]{1,300})\)/g)) {
  for (const m of paren[1].matchAll(/(?<!\d)(\d{6,7})(?!\d)/g)) {
    fdcCovered.add(m[1]);
  }
}

// --- 2) Normalizzazione testo per il controllo di prossimità per parola chiave ---
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòù\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const normalizedFullText = normalize(fullText);

// Indice invertito parola -> posizioni, costruito con UN SOLO passaggio sul
// testo completo (non uno per candidato: con 8217 righe e ~5MB di testo uno
// scan per riga sarebbe troppo lento). Poi il controllo per ogni candidato
// è solo un confronto fra piccoli array di posizioni già pronti.
const wordPositions = new Map<string, number[]>();
{
  const re = /[a-z0-9àèéìòù]{4,}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalizedFullText)) !== null) {
    const w = m[0];
    let arr = wordPositions.get(w);
    if (!arr) {
      arr = [];
      wordPositions.set(w, arr);
    }
    arr.push(m.index);
  }
}

const stopwords = new Set([
  "with", "raw", "cooked", "canned", "fresh", "without", "from", "that",
  "this", "other", "than", "only", "whole", "mature", "seeds", "drained",
]);

function keywordHit(descrizioneUsda: string): boolean {
  // Parole significative (>=4 caratteri, non troppo generiche) della
  // descrizione inglese USDA. Se almeno 2 parole chiave DISTINTE compaiono
  // a poca distanza (stessa finestra di ~120 caratteri) nel testo già
  // scritto, consideriamo il candidato un probabile doppione/variante già
  // valutato.
  const words = Array.from(
    new Set(
      normalize(descrizioneUsda)
        .split(" ")
        .filter((w) => w.length >= 4 && !stopwords.has(w))
    )
  );
  if (words.length < 2) return false;
  const positions: { word: string; idx: number }[] = [];
  for (const w of words) {
    const arr = wordPositions.get(w);
    if (!arr) continue;
    for (const idx of arr) positions.push({ word: w, idx });
  }
  if (positions.length < 2) return false;
  positions.sort((a, b) => a.idx - b.idx);
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[j].idx - positions[i].idx > 120) break;
      if (positions[j].word !== positions[i].word) return true;
    }
  }
  return false;
}

// --- 3) Carica il checklist ---
type Row = {
  fdc_id: string;
  tipo_dato: string;
  ndb_number: string;
  categoria_usda: string;
  priorita: string;
  descrizione_usda: string;
  crosswalk: string;
};

function parseCsvLine(line: string): string[] {
  // CSV semplice con virgolette doppie, sufficiente per questo file.
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  out.push(cur);
  return out;
}

const csvRaw = readSafe("docs/USDA_CHECKLIST.csv").split("\n").filter((l) => l.length > 0);
const header = parseCsvLine(csvRaw[0]);
const idx = {
  fdc_id: header.indexOf("fdc_id"),
  tipo_dato: header.indexOf("tipo_dato"),
  ndb_number: header.indexOf("ndb_number"),
  categoria_usda: header.indexOf("categoria_usda"),
  priorita: header.indexOf("priorita"),
  descrizione_usda: header.indexOf("descrizione_usda"),
  crosswalk: header.indexOf("stesso_alimento_in_SR_Legacy_fdc_id"),
};
const rows: Row[] = csvRaw.slice(1).map((line) => {
  const cols = parseCsvLine(line);
  return {
    fdc_id: cols[idx.fdc_id] ?? "",
    tipo_dato: cols[idx.tipo_dato] ?? "",
    ndb_number: cols[idx.ndb_number] ?? "",
    categoria_usda: cols[idx.categoria_usda] ?? "",
    priorita: cols[idx.priorita] ?? "",
    descrizione_usda: cols[idx.descrizione_usda] ?? "",
    crosswalk: cols[idx.crosswalk] ?? "",
  };
});

function isDone(r: Row): "fdc" | "crosswalk" | "keyword" | null {
  if (fdcCovered.has(r.fdc_id)) return "fdc";
  if (r.crosswalk && fdcCovered.has(r.crosswalk)) return "crosswalk";
  if (keywordHit(r.descrizione_usda)) return "keyword";
  return null;
}

const results = rows.map((r) => ({ r, done: isDone(r) }));
const totalDone = results.filter((x) => x.done !== null).length;
const byFdcOnly = results.filter((x) => x.done === "fdc" || x.done === "crosswalk").length;
const byKeywordOnly = results.filter((x) => x.done === "keyword").length;

console.log(`COPERTURA totale: ${totalDone}/${rows.length}  (per FDC/crosswalk: ${byFdcOnly}, SOLO per parola chiave: ${byKeywordOnly})`);

const todo = results.filter((x) => x.done === null).map((x) => x.r);
for (const p of ["A", "B", "C"]) {
  console.log(`da fare priorita ${p}: ${todo.filter((r) => r.priorita === p).length}`);
}

const priority = FORCE_PRIORITY || (todo.some((r) => r.priorita === "A") ? "A" : todo.some((r) => r.priorita === "B") ? "B" : "C");
const byCategory = new Map<string, Row[]>();
for (const r of todo) {
  if (r.priorita !== priority) continue;
  if (!byCategory.has(r.categoria_usda)) byCategory.set(r.categoria_usda, []);
  byCategory.get(r.categoria_usda)!.push(r);
}
const out: Row[] = [];
while (out.length < LIMIT && Array.from(byCategory.values()).some((arr) => arr.length > 0)) {
  for (const cat of Array.from(byCategory.keys())) {
    const arr = byCategory.get(cat)!;
    if (arr.length > 0) out.push(arr.shift()!);
    if (out.length >= LIMIT) break;
  }
}
for (const r of out) {
  console.log(`${r.fdc_id} ${r.tipo_dato.slice(0, 3)} ${r.categoria_usda.slice(0, 14)} | ${r.descrizione_usda.slice(0, 90)}`);
}
