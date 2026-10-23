// scripts/verify_golden_set_batch.ts
//
// Fase 4 punto 15 (docs/PRD.md §9): processo di verifica A BATCH (non più
// un alimento alla volta a mano), con un criterio esplicito e ripetibile
// di cosa rende una riga promuovibile a 'verified'.
//
// ============================================================================
// PERCHE' SOLO USDA_FDC (source_type='official_database', source_id=
// 'USDA_FDC') E NON ANCHE CoFID O LE FONTI DI LETTERATURA
// ============================================================================
// Il criterio approvato dall'utente ("Sì, procedi a scrivere lo script")
// e' esplicitamente a TRE livelli, coerenti col precedente umano già
// registrato in golden_set_promote_verified.sql (cross-check meccanico
// per USDA_FDC, checklist umana fissa per la letteratura):
//
//   1. source_id = 'USDA_FDC' (ha un endpoint live pubblico + ora anche
//      foods_raw.fdc_id persistito) -> QUESTO SCRIPT: ri-scarica il
//      record FDC e confronta meccanicamente, cifra per cifra (con
//      tolleranza dichiarata per il solo arrotondamento, vedi
//      lib/fdc/nutrientMapping.ts). Promozione automatica SOLO se
//      combacia esattamente entro quella tolleranza.
//   2. source_type = 'official_database' ma source_id != 'USDA_FDC'
//      (es. COFID_2021_PHE -- nessuna API live, solo il file xlsx che
//      l'utente ha caricato una volta) -> FUORI SCOPE qui per design.
//      Deferred esplicitamente (vedi PRD §9): andrebbe gestito con un
//      confronto contro una copia locale del file, non una fetch live.
//   3. source_type = 'peer_reviewed_study' -> MAI automatizzabile: serve
//      un giudizio umano di dominio sulla fonte stessa (il metodo
//      analitico è comparabile? è la fonte giusta per il modello?), non
//      solo "ho letto bene il numero" -- stessa logica già applicata
//      manualmente nel 2026-10-09.
//
// Questo script quindi elabora SOLO righe nutrient_values con
// source_id='USDA_FDC' E verification_status='draft'. Le altre vengono
// contate e riportate nel report finale come "fuori scope", non
// ignorate in silenzio.
//
// ============================================================================
// REQUISITI AMBIENTE -- QUESTO SCRIPT NON PUO' ESSERE ESEGUITO NEL
// SANDBOX DELL'AGENTE (nessun accesso di rete diretto confermato verso
// api.nal.usda.gov né verso Supabase -- vedi docs/PRD.md §9 Fase 4).
// Va eseguito sulla MACCHINA DELL'UTENTE con:
//   - .env.local con SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (già
//     presenti per il pannello admin) E una nuova variabile
//     USDA_FDC_API_KEY (chiave personale gratuita, non la DEMO_KEY --
//     vedi fdc.nal.usda.gov/api-key-signup.html; la DEMO_KEY è troppo
//     rate-limited per un batch).
//   - npm run verify:golden-set            (dry-run di default, vedi sotto)
//   - npm run verify:golden-set -- --apply (scrive davvero le UPDATE)
// ============================================================================
//
// ARCHITETTURA DIFENSIVA:
//   - Default DRY RUN: senza --apply, il script classifica e stampa il
//     report ma non scrive NESSUNA UPDATE sul DB. Bisogna passare
//     esplicitamente --apply per promuovere davvero.
//   - Un alimento che fallisce (rete, 404, rate limit) non blocca gli
//     altri: ogni alimento è try/catch indipendente.
//   - Le UPDATE sono sempre per singola riga (food_id + nutrient_code),
//     mai una UPDATE "a tappeto" su tutta la tabella.
//   - foods_raw viene promossa a 'verified' SOLO se TUTTE le sue righe
//     nutrient_values con source_id=USDA_FDC sono risultate MATCH (stessa
//     filosofia di golden_set_promote_verified.sql: altre righe draft da
//     fonti diverse per lo stesso alimento possono restare draft senza
//     bloccare questa promozione, esattamente come allora).
//   - Nessuna riga viene MAI promossa sulla base di "non trovato" o
//     "non mappato" -- solo MATCH esplicito promuove.
//
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import {
  FDC_NUTRIENT_MAP,
  getMappedFdcValue,
  compareWithTolerance,
  type FdcFoodDetail,
} from "../lib/fdc/nutrientMapping";
import { loadEnvLocal, requireEnv } from "../lib/loadEnvLocal";
import { evaluatePromotionGate } from "../lib/fdc/promotionGates";

loadEnvLocal();

const APPLY = process.argv.includes("--apply");
const FOOD_ID_FILTER = process.argv.find((a) => a.startsWith("--food-id="))?.split("=")[1] ?? null;
const DELAY_MS_BETWEEN_FOODS = 1100; // margine prudente, anche con chiave personale (limite USDA: 1000 req/ora)

const SUPABASE_URL = requireEnv("SUPABASE_URL", "stessa variabile già usata da lib/supabaseAdmin.ts per il pannello admin");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY", "stessa variabile già usata da lib/supabaseAdmin.ts per il pannello admin");
const USDA_FDC_API_KEY = requireEnv(
  "USDA_FDC_API_KEY",
  "chiave personale gratuita: fdc.nal.usda.gov/api-key-signup.html -- la DEMO_KEY non basta per un batch, va in 429 quasi subito"
);

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface DraftRow {
  food_id: string;
  nutrient_code: string;
  value: number;
  fdc_id: number | null;
  fdc_name: string | null;
  food_verification_status: string;
  name_it: string | null;
  diet_compat_vegetarian: boolean | null;
  diet_compat_vegan: boolean | null;
  diet_compat_fruitarian: boolean | null;
}

type RowOutcome =
  | { kind: "MATCH"; detail: string }
  | { kind: "MISMATCH"; detail: string }
  | { kind: "NOT_FOUND_IN_FDC"; detail: string }
  | { kind: "UNIT_MISMATCH"; detail: string }
  | { kind: "NOT_MAPPED"; detail: string }
  | { kind: "BLOCKED_NO_FDC_ID"; detail: string }
  | { kind: "BLOCKED_GATE"; detail: string }
  | { kind: "FOOD_UNREACHABLE"; detail: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFdcFood(fdcId: number, retried = false): Promise<FdcFoodDetail> {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${encodeURIComponent(USDA_FDC_API_KEY)}`;
  const res = await fetch(url);
  if (res.status === 429) {
    if (retried) throw new Error(`HTTP 429 (rate limit) persistente per FDC ID ${fdcId} anche dopo un retry`);
    await sleep(10_000);
    return fetchFdcFood(fdcId, true);
  }
  if (res.status === 404) {
    throw new Error(`HTTP 404 -- FDC ID ${fdcId} non esiste (più) su FoodData Central`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} da FDC per FDC ID ${fdcId}`);
  }
  const json = (await res.json()) as FdcFoodDetail;
  if (!Array.isArray(json.foodNutrients)) {
    throw new Error(
      `Risposta FDC per ${fdcId} senza array foodNutrients valido -- schema inatteso, non proseguo a interpretarla a caso`
    );
  }
  return json;
}

async function main() {
  console.log("=== Verifica batch Golden Set (Fase 4 punto 15) ===");
  console.log(`Modalità: ${APPLY ? "APPLY (scrive sul DB)" : "DRY RUN (nessuna scrittura -- passa --apply per promuovere davvero)"}`);
  if (FOOD_ID_FILTER) console.log(`Filtro: solo food_id = ${FOOD_ID_FILTER}`);
  console.log("Scope: solo nutrient_values.source_id = 'USDA_FDC' AND verification_status = 'draft'.");
  console.log("Le righe CoFID/letteratura sono fuori scope per design (vedi header del file) e vengono solo contate.\n");

  // --- 1. Contesto: quante righe sono fuori scope, solo per il report ---
  const { count: outOfScopeCount, error: outOfScopeErr } = await supabaseAdmin
    .from("nutrient_values")
    .select("food_id", { count: "exact", head: true })
    .eq("verification_status", "draft")
    .neq("source_id", "USDA_FDC");
  if (outOfScopeErr) throw new Error(`Query conteggio fuori-scope fallita: ${outOfScopeErr.message}`);

  // --- 2. Le righe davvero in scope ---
  // Deliberatamente DUE query separate + join fatto qui in JS, invece di
  // una sola query con l'embedding PostgREST (`foods_raw!inner(...)`):
  // quell'embedding richiede che la relazione FK fra nutrient_values.food_id
  // e foods_raw.food_id sia registrata nella schema cache di PostgREST, e
  // questo script non può verificarlo da questo sandbox (nessun accesso di
  // rete a Supabase -- vedi header del file). Due select piatte sono
  // garantite a funzionare indipendentemente da quel dettaglio.
  // PAGINAZIONE (aggiunta 2026-10-23, Regola 4): PostgREST/Supabase
  // restituisce al massimo 1000 righe per query SENZA segnalare che ha
  // troncato -- con i 428 alimenti della pipeline (~15 righe nutrienti
  // ciascuno) le righe in scope sono migliaia, e la versione precedente
  // avrebbe elaborato in silenzio solo le prime 1000. Si legge a pagine da
  // 1000 con un ordinamento stabile finche' una pagina non e' incompleta.
  const PAGE = 1000;
  const nvData: any[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabaseAdmin
      .from("nutrient_values")
      .select("food_id, nutrient_code, value")
      .eq("source_id", "USDA_FDC")
      .eq("verification_status", "draft")
      .order("food_id", { ascending: true })
      .order("nutrient_code", { ascending: true })
      .range(from, from + PAGE - 1);
    if (FOOD_ID_FILTER) q = q.eq("food_id", FOOD_ID_FILTER);
    const { data, error } = await q;
    if (error) throw new Error(`Query righe in scope fallita (pagina da ${from}): ${error.message}`);
    nvData.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }

  const distinctFoodIds = Array.from(new Set(nvData.map((r: any) => r.food_id as string)));

  // foods_raw a blocchi da 50 id: una sola .in() con centinaia di id
  // supera il limite di lunghezza dell'URL di PostgREST.
  const frData: any[] = [];
  for (let i = 0; i < distinctFoodIds.length; i += 50) {
    const chunk = distinctFoodIds.slice(i, i + 50);
    const { data, error } = await supabaseAdmin
      .from("foods_raw")
      .select("food_id, name_it, fdc_id, fdc_name, verification_status, diet_compat_vegetarian, diet_compat_vegan, diet_compat_fruitarian")
      .in("food_id", chunk);
    if (error) throw new Error(`Query foods_raw (per il join manuale) fallita: ${error.message}`);
    frData.push(...(data ?? []));
  }

  const foodsById = new Map<
    string,
    {
      fdc_id: number | null;
      fdc_name: string | null;
      verification_status: string;
      name_it: string | null;
      diet_compat_vegetarian: boolean | null;
      diet_compat_vegan: boolean | null;
      diet_compat_fruitarian: boolean | null;
    }
  >();
  for (const f of frData) {
    foodsById.set(f.food_id, {
      fdc_id: f.fdc_id ?? null,
      fdc_name: f.fdc_name ?? null,
      verification_status: f.verification_status ?? "draft",
      name_it: f.name_it ?? null,
      diet_compat_vegetarian: f.diet_compat_vegetarian ?? null,
      diet_compat_vegan: f.diet_compat_vegan ?? null,
      diet_compat_fruitarian: f.diet_compat_fruitarian ?? null,
    });
  }

  const rows: DraftRow[] = (nvData ?? []).map((r: any) => {
    const fr = foodsById.get(r.food_id);
    if (!fr) {
      // Non dovrebbe accadere (ogni nutrient_values.food_id dovrebbe avere
      // una riga foods_raw corrispondente) -- non lo ignoriamo in silenzio:
      // lo segnaliamo chiaramente invece di far crashare tutto il batch.
      console.error(`ATTENZIONE: nessuna riga foods_raw trovata per food_id=${r.food_id} (orfano?) -- trattato come fdc_id assente.`);
    }
    return {
      food_id: r.food_id,
      nutrient_code: r.nutrient_code,
      value: Number(r.value),
      fdc_id: fr?.fdc_id ?? null,
      fdc_name: fr?.fdc_name ?? null,
      food_verification_status: fr?.verification_status ?? "draft",
      name_it: fr?.name_it ?? null,
      diet_compat_vegetarian: fr?.diet_compat_vegetarian ?? null,
      diet_compat_vegan: fr?.diet_compat_vegan ?? null,
      diet_compat_fruitarian: fr?.diet_compat_fruitarian ?? null,
    };
  });

  console.log(`Righe draft fuori scope (non USDA_FDC, non toccate da questo script): ${outOfScopeCount ?? "?"}`);
  console.log(`Righe draft in scope (USDA_FDC): ${rows.length}\n`);

  if (rows.length === 0) {
    console.log("Nessuna riga da elaborare. Fine.");
    return;
  }

  // Raggruppa per food_id così facciamo UNA fetch FDC per alimento, non una per nutriente.
  const byFood = new Map<string, DraftRow[]>();
  for (const r of rows) {
    if (!byFood.has(r.food_id)) byFood.set(r.food_id, []);
    byFood.get(r.food_id)!.push(r);
  }

  const outcomes: Array<{ food_id: string; nutrient_code: string; outcome: RowOutcome }> = [];
  const promotedRows: string[] = [];
  const promotedFoods: string[] = [];

  let isFirst = true;
  for (const [foodId, foodRows] of byFood) {
    if (!isFirst) await sleep(DELAY_MS_BETWEEN_FOODS);
    isFirst = false;

    const fdcId = foodRows[0].fdc_id;
    if (!fdcId) {
      for (const r of foodRows) {
        outcomes.push({
          food_id: foodId,
          nutrient_code: r.nutrient_code,
          outcome: { kind: "BLOCKED_NO_FDC_ID", detail: "foods_raw.fdc_id è NULL -- impossibile ri-scaricare, da indagare (vedi add_fdc_id_to_foods_raw.sql)" },
        });
      }
      continue;
    }

    let fdcFood: FdcFoodDetail;
    try {
      fdcFood = await fetchFdcFood(fdcId);
    } catch (e: any) {
      for (const r of foodRows) {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "FOOD_UNREACHABLE", detail: e.message } });
      }
      continue;
    }

    // Controlli automatici aggiuntivi (lib/fdc/promotionGates.ts), solo per
    // gli alimenti ancora 'draft' in foods_raw (quelli che stiamo per
    // promuovere): descrizione FDC invariata, classificazione dieta
    // completa e coerente, nome presente. Un alimento gia' 'verified' (es.
    // Golden Set con righe macro successive ancora draft) mantiene il
    // comportamento precedente: il confronto numerico riga per riga.
    if (foodRows[0].food_verification_status === "draft") {
      const gate = evaluatePromotionGate({
        nameIt: foodRows[0].name_it,
        fdcNameStored: foodRows[0].fdc_name,
        fdcDescriptionLive: fdcFood.description,
        dietVegetarian: foodRows[0].diet_compat_vegetarian,
        dietVegan: foodRows[0].diet_compat_vegan,
        dietFruitarian: foodRows[0].diet_compat_fruitarian,
      });
      if (!gate.ok) {
        for (const r of foodRows) {
          outcomes.push({
            food_id: foodId,
            nutrient_code: r.nutrient_code,
            outcome: { kind: "BLOCKED_GATE", detail: gate.reasons.join("; ") },
          });
        }
        continue;
      }
    }

    let allMatchForThisFood = true;

    for (const r of foodRows) {
      const mapped = getMappedFdcValue(fdcFood.foodNutrients, r.nutrient_code);

      if (mapped.status === "NOT_MAPPED") {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "NOT_MAPPED", detail: "nessuna mappatura FDC definita per questo nutrient_code (vedi lib/fdc/nutrientMapping.ts)" } });
        allMatchForThisFood = false;
        continue;
      }
      if (mapped.status === "NOT_FOUND_IN_FDC") {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "NOT_FOUND_IN_FDC", detail: `componenti assenti nella risposta FDC: ${mapped.missingComponents.join(", ")}` } });
        allMatchForThisFood = false;
        continue;
      }
      if (mapped.status === "UNIT_MISMATCH") {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "UNIT_MISMATCH", detail: mapped.details } });
        allMatchForThisFood = false;
        continue;
      }

      const cmp = compareWithTolerance(r.value, mapped.value);
      if (cmp.classification === "MATCH") {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "MATCH", detail: `DB=${cmp.dbValue} FDC=${cmp.fdcValue} (diff=${cmp.diff.toFixed(4)}, tolleranza=${cmp.toleranceUsed.toFixed(4)})` } });
        if (APPLY) {
          const { error: updErr } = await supabaseAdmin
            .from("nutrient_values")
            .update({ verification_status: "verified" })
            .eq("food_id", foodId)
            .eq("nutrient_code", r.nutrient_code)
            .eq("source_id", "USDA_FDC");
          if (updErr) {
            console.error(`ATTENZIONE: UPDATE verified fallita per ${foodId}.${r.nutrient_code}: ${updErr.message}`);
          } else {
            promotedRows.push(`${foodId}.${r.nutrient_code}`);
          }
        }
      } else {
        outcomes.push({ food_id: foodId, nutrient_code: r.nutrient_code, outcome: { kind: "MISMATCH", detail: `DB=${cmp.dbValue} FDC=${cmp.fdcValue} (diff=${cmp.diff.toFixed(4)}, tolleranza=${cmp.toleranceUsed.toFixed(4)})` } });
        allMatchForThisFood = false;
      }
    }

    if (allMatchForThisFood && foodRows[0].food_verification_status === "draft") {
      if (APPLY) {
        const { error: updFoodErr } = await supabaseAdmin
          .from("foods_raw")
          .update({ verification_status: "verified" })
          .eq("food_id", foodId);
        if (updFoodErr) {
          console.error(`ATTENZIONE: UPDATE verified fallita per foods_raw.${foodId}: ${updFoodErr.message}`);
        } else {
          promotedFoods.push(foodId);
        }
      } else {
        promotedFoods.push(`${foodId} (dry-run, non scritto)`);
      }
    }
  }

  // --- Report finale ---
  console.log("\n=== Dettaglio per riga ===");
  for (const o of outcomes) {
    const icon = o.outcome.kind === "MATCH" ? "✓" : "✗";
    console.log(`${icon} [${o.outcome.kind}] ${o.food_id}.${o.nutrient_code} -- ${o.outcome.detail}`);
  }

  const counts: Record<string, number> = {};
  for (const o of outcomes) counts[o.outcome.kind] = (counts[o.outcome.kind] ?? 0) + 1;

  console.log("\n=== Riepilogo ===");
  for (const [kind, n] of Object.entries(counts)) console.log(`  ${kind}: ${n}`);
  console.log(`\nRighe nutrient_values promosse a 'verified'${APPLY ? "" : " (sarebbero, in dry-run)"}: ${APPLY ? promotedRows.length : outcomes.filter((o) => o.outcome.kind === "MATCH").length}`);
  console.log(`Alimenti (foods_raw) promossi a 'verified': ${promotedFoods.length}`);
  for (const f of promotedFoods) console.log(`  - ${f}`);

  if (!APPLY) {
    console.log("\nQuesto era un DRY RUN -- nessuna scrittura è avvenuta. Rilancia con --apply per promuovere davvero le righe MATCH.");
  }

  const needsHuman = outcomes.filter((o) => o.outcome.kind !== "MATCH");
  if (needsHuman.length > 0) {
    console.log(`\n${needsHuman.length} righe richiedono attenzione umana (MISMATCH, non trovate, non mappate, o alimento irraggiungibile) -- elencate sopra, nessuna è stata promossa.`);
  }
}

main().catch((e) => {
  console.error("Errore fatale nello script batch:", e);
  process.exit(1);
});
