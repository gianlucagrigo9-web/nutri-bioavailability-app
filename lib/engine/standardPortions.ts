// lib/engine/standardPortions.ts
//
// Porzioni standard LARN (V Revisione, 2024) per gli alimenti del Golden
// Set -- colma due gap dichiarati contemporaneamente, STESSA fonte:
// - docs/PRD.md §4.9: `maxGramsPerFood` in dietGenerator.ts e' oggi un
//   placeholder non sourced (300g fisso per qualunque alimento candidato,
//   uguale per spinaci e carne).
// - docs/PRD.md §4.8 (piatti tradizionali/dish_templates): "Come
//   scegliere le grammature standard per porzione... fonte: una ricetta
//   di riferimento dichiarata esplicitamente -- es. CREA/LARN per le
//   porzioni standard italiane, se disponibile."
//
// QUESTO FILE FORNISCE SOLO IL DATO SOURCED (grammi per porzione standard
// LARN, per categoria, mappati ai 30 food_id del Golden Set attuale) --
// NON decide ancora COME va usato. Se usarlo come maxGramsPerFood diretto,
// come base moltiplicata per un fattore (es. "max 3x la porzione
// standard"), o come grammatura di default di un dish_component e' una
// scelta di design con un vero margine di giudizio (quale moltiplicatore?
// quale comportamento se un food_id non e' mappato?) -- la Regola 5
// riserva quel tipo di scelta a una proposta esplicita approvata PRIMA
// del codice di produzione, non a questo file. Vedi la PROPOSTA in
// docs/PRD.md §4.9 per i criteri concreti sottoposti.
//
// FONTE: LARN, V Revisione (2024), SINU -- "Standard quantitativi delle
// porzioni" (stessa edizione gia' usata in nutrientTargets.ts). Consultata
// tramite la pubblicazione secondaria SSD IAN ATS Brescia, "Porzioni
// standard degli alimenti per la popolazione adulta" (ats-brescia.it,
// datata 27/03/2025) -- NON il PDF ufficiale SINU originale (stesso gap
// di provenienza gia' dichiarato per nutrientTargets.ts: sinu.it/larn/
// non raggiunto in questa sessione). I pesi si riferiscono all'alimento
// CRUDO, al netto degli scarti (per i surgelati, anche della glassatura) --
// dichiarato esplicitamente dalla fonte stessa, non un'assunzione nostra.

export type StandardPortionCategory =
  | "cereali_primo_asciutto"
  | "pasta_fresca"
  | "legumi_secchi"
  | "legumi_freschi_reidratati"
  | "pesce_fresco_surgelato"
  | "carne_fresca_surgelata"
  | "latte"
  | "formaggio_fresco"
  | "uova"
  | "verdura"
  | "frutta_fresca"
  | "frutta_secca_oleosa"
  | "tuberi";

export interface StandardPortionReference {
  category: StandardPortionCategory;
  grams: number;
  evidenceLevel: 5;
  sourceIds: string[];
  note?: string;
}

const LARN_PORZIONI_SOURCE = ["LARN_2024_SINU_PORZIONI_STANDARD"];

/**
 * Porzioni standard per categoria LARN (non ancora per singolo food_id --
 * vedi GOLDEN_SET_STANDARD_PORTIONS sotto per la mappatura editoriale).
 */
export const LARN_STANDARD_PORTIONS: Record<StandardPortionCategory, StandardPortionReference> = {
  cereali_primo_asciutto: {
    category: "cereali_primo_asciutto",
    grams: 80,
    evidenceLevel: 5,
    sourceIds: LARN_PORZIONI_SOURCE,
    note: "Pasta/riso/farro/orzo/quinoa SECCHI, per un primo piatto asciutto.",
  },
  pasta_fresca: { category: "pasta_fresca", grams: 100, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  legumi_secchi: { category: "legumi_secchi", grams: 50, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  legumi_freschi_reidratati: {
    category: "legumi_freschi_reidratati",
    grams: 150,
    evidenceLevel: 5,
    sourceIds: LARN_PORZIONI_SOURCE,
    note: "La fonte dice 'freschi/congelati/reidratati', non letteralmente 'bolliti' -- categoria piu' vicina per i legumi cotti del Golden Set, approssimazione dichiarata (non una misura separata per 'bollito').",
  },
  pesce_fresco_surgelato: { category: "pesce_fresco_surgelato", grams: 150, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  carne_fresca_surgelata: { category: "carne_fresca_surgelata", grams: 100, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  latte: {
    category: "latte",
    grams: 128.75,
    evidenceLevel: 5,
    sourceIds: LARN_PORZIONI_SOURCE,
    note: "Fonte: 125 mL. Convertito in grammi con densita' 1.03 g/mL (valore tipico del latte intero, NON dalla fonte LARN stessa -- approssimazione dichiarata, non una misura diretta in grammi).",
  },
  formaggio_fresco: { category: "formaggio_fresco", grams: 100, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  uova: { category: "uova", grams: 50, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  verdura: {
    category: "verdura",
    grams: 200,
    evidenceLevel: 5,
    sourceIds: LARN_PORZIONI_SOURCE,
    note: "La fonte non separa cruda/cotta per questa voce -- stesso valore, gli esempi in tabella includono sia pomodori crudi sia verdure cotte (spinaci/bietole/broccoli).",
  },
  frutta_fresca: { category: "frutta_fresca", grams: 150, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  frutta_secca_oleosa: { category: "frutta_secca_oleosa", grams: 30, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
  tuberi: { category: "tuberi", grams: 200, evidenceLevel: 5, sourceIds: LARN_PORZIONI_SOURCE },
};

export interface FoodStandardPortion {
  category: StandardPortionCategory;
  grams: number; // per questo food_id specifico -- puo' differire dal valore di categoria (vedi pasta cotta, derivata)
  derived?: { method: string; note: string }; // presente SOLO se il valore non e' preso 1:1 dalla tabella di categoria sopra
}

// Mappatura ai 30 food_id del Golden Set attuale -- stesso tipo di lavoro
// editoriale di goldenSetDietCompatibility.ts (non derivabile
// automaticamente da nessuna fonte, classificazione dichiarata qui).
// DELIBERATAMENTE ASSENTI: food_beef_liver_raw/cooked (vedi commento sotto
// -- mai un default indovinato per un food_id non classificabile con una
// base reale, Regola 1).
export const GOLDEN_SET_STANDARD_PORTIONS: Readonly<Record<string, FoodStandardPortion>> = {
  food_almonds: { category: "frutta_secca_oleosa", grams: 30 },
  food_beef_ground_cooked: { category: "carne_fresca_surgelata", grams: 100 },
  food_beef_ground_raw: { category: "carne_fresca_surgelata", grams: 100 },
  // food_beef_liver_raw/cooked: ASSENTE DI PROPOSITO. Le frattaglie non
  // compaiono come categoria propria nella fonte LARN 2024 consultata;
  // forzarle sulla porzione "carne" generica (100g) sarebbe un valore
  // plausibile ma non sourced per questo tipo specifico di alimento (linee
  // guida piu' vecchie, es. INRAN, davano tipicamente porzioni piu' piccole
  // per il fegato, ~50-80g, per l'alta densita' di micronutrienti) --
  // Regola 1, resta un gap dichiarato, non forzato.
  food_broccoli_boiled: { category: "verdura", grams: 200 },
  food_broccoli_raw: { category: "verdura", grams: 200 },
  food_brussels_sprouts_boiled: { category: "verdura", grams: 200 },
  food_brussels_sprouts_raw: { category: "verdura", grams: 200 },
  food_carrots_boiled: { category: "verdura", grams: 200 },
  food_carrots_raw: { category: "verdura", grams: 200 },
  food_chickpeas_boiled: { category: "legumi_freschi_reidratati", grams: 150 },
  food_chickpeas_raw: { category: "legumi_secchi", grams: 50 },
  food_egg_hard_boiled: { category: "uova", grams: 50 },
  food_egg_raw: { category: "uova", grams: 50 },
  food_kale_raw: { category: "verdura", grams: 200 },
  food_kidney_beans_boiled: { category: "legumi_freschi_reidratati", grams: 150 },
  food_kidney_beans_raw: { category: "legumi_secchi", grams: 50 },
  food_lentils_boiled: { category: "legumi_freschi_reidratati", grams: 150 },
  food_lentils_raw: { category: "legumi_secchi", grams: 50 },
  food_milk_whole: { category: "latte", grams: 128.75 },
  food_oranges_raw: { category: "frutta_fresca", grams: 150 },
  food_pasta_enriched_dry: { category: "cereali_primo_asciutto", grams: 80 },
  food_pasta_enriched_cooked: {
    category: "cereali_primo_asciutto",
    grams: 187.8, // vedi derived.note
    derived: {
      method: "energy_conservation_ratio",
      note:
        "80g di pasta secca (371 kcal/100g, Golden Set, USDA FDC) contengono ~296.8 kcal totali. Assumendo conservazione dell'energia durante la bollitura in acqua (nessuna perdita calorica significativa, a differenza della frittura), la stessa quantita' di pasta -- ora cotta (158 kcal/100g, Golden Set, USDA FDC) -- pesa ~187.8g (296.8/1.58). Derivato dai nostri stessi dati USDA FDC gia' nel DB, non una misura diretta separata: stesso tipo di approssimazione gia' usato nel progetto per DERIVED_FDC_RAW_COOKED_RATIO (fattori di ritenzione nutriente), qui applicato a un peso di porzione invece che a un nutriente.",
    },
  },
  food_potato_boiled_in_skin: { category: "tuberi", grams: 200 },
  food_potato_raw: { category: "tuberi", grams: 200 },
  food_salmon_cooked: { category: "pesce_fresco_surgelato", grams: 150 },
  food_salmon_raw: { category: "pesce_fresco_surgelato", grams: 150 },
  food_spinach_boiled: { category: "verdura", grams: 200 },
  food_spinach_raw: { category: "verdura", grams: 200 },
};

/**
 * Porzione standard in grammi per un food_id del Golden Set.
 * Difensivo: `undefined`/food_id non mappato (incluse le frattaglie,
 * dichiarate sopra) -> `null`, MAI un default indovinato.
 */
export function getStandardPortionGrams(foodId: string): number | null {
  const entry = GOLDEN_SET_STANDARD_PORTIONS[foodId];
  return entry ? entry.grams : null;
}
