// scripts/add_food_from_fdc.ts
//
// Fase 4 punto 16 (docs/PRD.md §9): aggiunge un alimento NUOVO al Golden
// Set a partire da un record USDA FDC già scelto. A differenza di
// scripts/verify_golden_set_batch.ts (che confronta righe GIÀ esistenti),
// questo script CREA righe nuove -- quindi più delicato, con più controlli
// difensivi prima di scrivere.
//
// ============================================================================
// COSA QUESTO SCRIPT NON DECIDE (per design -- "zero dati inventati")
// ============================================================================
// La scelta di QUALE alimento aggiungere, QUALE record FDC rappresenta
// meglio quell'alimento (ricerca per nome, scelta fra più risultati), e
// gli attributi categorici (is_heme_iron, matrix_category_calcium, ecc.)
// NON sono decisi da questo script -- sono tutti argomenti a riga di
// comando che chi lo lancia (sessione umana o agente con ragionamento,
// MAI uno script rigido) deve aver già deciso, idealmente per analogia
// esplicita con un alimento già presente e classificato (--analogy-food-id,
// verificato esistere, solo a scopo di documentazione/audit nel commento
// SQL generato -- non usato per calcolare nulla).
//
// Questo script si occupa SOLO della parte meccanica e verificabile:
//   - ri-scarica il record FDC per l'fdc-id dato
//   - estrae i nutrienti mappati in lib/fdc/nutrientMapping.ts (stessa
//     mappatura, stesso codice, già testato in tests/fdcVerification.test.ts)
//   - genera/esegue l'INSERT in food_matrices_master (se la matrice è
//     nuova) + foods_raw (SEMPRE verification_status='draft', mai
//     'verified' -- coerente con la convenzione del pannello admin: la
//     promozione è sempre un atto umano/meccanico separato, vedi
//     scripts/verify_golden_set_batch.ts per quella parte) + nutrient_values
//     (una riga per ogni nutrient_code trovato per intero in FDC -- MAI un
//     nutriente con componenti mancanti o unità inattesa, MAI un valore a
//     zero per un'assenza).
//
// ARCHITETTURA DIFENSIVA:
//   - Default DRY RUN: senza --apply, stampa cosa farebbe senza scrivere.
//   - Idempotente in modo esplicito: se food_id esiste già in foods_raw,
//     si ferma con un errore (questo script è solo per CREARE, non per
//     aggiornare un alimento esistente -- un rerun accidentale sullo
//     stesso food_id non sovrascrive nulla in silenzio).
//   - matrix_id: se non esiste già in food_matrices_master, richiede
//     esplicitamente --matrix-description-it (mai una matrice creata con
//     una descrizione indovinata/vuota).
//   - Validazione rigida degli enum (matrix_category_calcium,
//     carotenoid_matrix_state, zinc_bioaccessibility_bucket) contro
//     l'elenco esatto usato da app/admin/data-entry/DataEntryDashboard.tsx
//     -- un valore fuori enum fa fallire lo script PRIMA di scrivere,
//     mai inserito così com'è (non c'è garanzia che il DB abbia un CHECK
//     constraint a bloccarlo).
//   - Verifica difensiva dopo la scrittura: ri-legge foods_raw e conta le
//     nutrient_values appena inserite, confrontando con quanto atteso.
//
// USO:
//   npm run add-food -- --fdc-id=170457 --food-id=food_zucchine_raw \
//     --name-it="Zucchine, crude" --matrix-id=zucchine \
//     --matrix-description-it="Zucchine" --baseline-cooking-state=raw \
//     --analogy-food-id=food_carrots_raw --zinc-bioaccessibility-bucket=none
//   (dry-run di default; aggiungere --apply per scrivere davvero)
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { extractAllMappedNutrients, type FdcFoodDetail } from "../lib/fdc/nutrientMapping";
import { loadEnvLocal, requireEnv } from "../lib/loadEnvLocal";

loadEnvLocal();

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const USDA_FDC_API_KEY = requireEnv("USDA_FDC_API_KEY");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const APPLY = process.argv.includes("--apply");

function argValue(name: string): string | null {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}
function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const VALID_CALCIUM = ["high_oxalate", "medium_oxalate", "low_oxalate"] as const;
const VALID_CAROTENOID = ["raw_intact", "cooked_or_disrupted"] as const;
const VALID_ZINC_BUCKET = ["none", "brussels_sprouts_boiled", "brussels_sprouts_steamed"] as const;

function fail(msg: string): never {
  console.error(`ERRORE: ${msg}`);
  process.exit(1);
}

async function main() {
  const fdcIdRaw = argValue("fdc-id");
  const foodId = argValue("food-id");
  const nameIt = argValue("name-it");
  const matrixId = argValue("matrix-id");
  const analogyFoodId = argValue("analogy-food-id");
  const baselineCookingState = argValue("baseline-cooking-state");

  if (!fdcIdRaw) fail("--fdc-id obbligatorio");
  if (!foodId) fail("--food-id obbligatorio (es. food_zucchine_raw)");
  if (!nameIt) fail("--name-it obbligatorio (es. 'Zucchine, crude')");
  if (!matrixId) fail("--matrix-id obbligatorio");
  if (!analogyFoodId) fail("--analogy-food-id obbligatorio -- documenta a quale alimento già classificato ti sei ispirato per gli attributi categorici (richiesto anche solo per audit, non usato per calcolare nulla)");
  if (!baselineCookingState) fail("--baseline-cooking-state obbligatorio (es. raw, boiled, roasted -- descrive lo stato a cui si riferiscono questi valori nutrizionali)");

  const fdcId = Number(fdcIdRaw);
  if (!Number.isInteger(fdcId) || fdcId <= 0) fail(`--fdc-id non valido: ${fdcIdRaw}`);

  const isHemeIron = argFlag("is-heme-iron");
  const isFortifiedFolate = argFlag("is-fortified-folate");
  const matrixCategoryCalcium = argValue("matrix-category-calcium");
  const carotenoidMatrixState = argValue("carotenoid-matrix-state");
  const zincBioaccessibilityBucket = argValue("zinc-bioaccessibility-bucket") ?? "none";
  const botanicalFamily = argValue("botanical-family");
  const matrixDescriptionIt = argValue("matrix-description-it");

  if (matrixCategoryCalcium && !VALID_CALCIUM.includes(matrixCategoryCalcium as any)) {
    fail(`--matrix-category-calcium non valido: "${matrixCategoryCalcium}" -- atteso uno fra ${VALID_CALCIUM.join(", ")} (o omesso per NULL)`);
  }
  if (carotenoidMatrixState && !VALID_CAROTENOID.includes(carotenoidMatrixState as any)) {
    fail(`--carotenoid-matrix-state non valido: "${carotenoidMatrixState}" -- atteso uno fra ${VALID_CAROTENOID.join(", ")} (o omesso per NULL)`);
  }
  if (!VALID_ZINC_BUCKET.includes(zincBioaccessibilityBucket as any)) {
    fail(`--zinc-bioaccessibility-bucket non valido: "${zincBioaccessibilityBucket}" -- atteso uno fra ${VALID_ZINC_BUCKET.join(", ")}`);
  }

  console.log("=== Aggiunta alimento da FDC (Fase 4 punto 16) ===");
  console.log(`Modalità: ${APPLY ? "APPLY (scrive sul DB)" : "DRY RUN (nessuna scrittura -- passa --apply per scrivere davvero)"}`);
  console.log(`food_id=${foodId}  fdc_id=${fdcId}  matrix_id=${matrixId}  analogia dichiarata=${analogyFoodId}\n`);

  // --- 1. Controlli difensivi preliminari (prima di qualunque fetch) ---
  const { data: existingFood, error: existingFoodErr } = await supabaseAdmin
    .from("foods_raw")
    .select("food_id")
    .eq("food_id", foodId)
    .maybeSingle();
  if (existingFoodErr) fail(`Query foods_raw fallita: ${existingFoodErr.message}`);
  if (existingFood) fail(`food_id "${foodId}" esiste già in foods_raw -- questo script crea solo alimenti NUOVI, non aggiorna esistenti. Se vuoi correggere un alimento esistente, serve un fix_*.sql dedicato, non questo script.`);

  const { data: analogyFood, error: analogyErr } = await supabaseAdmin
    .from("foods_raw")
    .select("food_id")
    .eq("food_id", analogyFoodId)
    .maybeSingle();
  if (analogyErr) fail(`Query foods_raw (analogia) fallita: ${analogyErr.message}`);
  if (!analogyFood) fail(`--analogy-food-id "${analogyFoodId}" non esiste in foods_raw -- l'analogia dichiarata deve riferirsi a un alimento reale già presente, per audit.`);

  const { data: existingMatrix, error: matrixErr } = await supabaseAdmin
    .from("food_matrices_master")
    .select("matrix_id")
    .eq("matrix_id", matrixId)
    .maybeSingle();
  if (matrixErr) fail(`Query food_matrices_master fallita: ${matrixErr.message}`);
  const matrixNeedsInsert = !existingMatrix;
  if (matrixNeedsInsert && !matrixDescriptionIt) {
    fail(`matrix_id "${matrixId}" non esiste ancora -- serve --matrix-description-it per crearla (mai una descrizione indovinata/vuota).`);
  }

  const { data: sourceRow, error: sourceErr } = await supabaseAdmin
    .from("sources")
    .select("source_id")
    .eq("source_id", "USDA_FDC")
    .maybeSingle();
  if (sourceErr) fail(`Query sources fallita: ${sourceErr.message}`);
  if (!sourceRow) fail(`source_id "USDA_FDC" non esiste in sources -- non dovrebbe succedere, da indagare prima di proseguire (non lo creo qui, non è compito di questo script).`);

  // --- 2. Fetch FDC reale ---
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${encodeURIComponent(USDA_FDC_API_KEY)}`;
  const res = await fetch(url);
  if (!res.ok) fail(`HTTP ${res.status} da FDC per FDC ID ${fdcId}`);
  const fdcFood = (await res.json()) as FdcFoodDetail;
  if (!Array.isArray(fdcFood.foodNutrients)) fail(`Risposta FDC per ${fdcId} senza array foodNutrients valido -- schema inatteso.`);

  console.log(`FDC description: "${fdcFood.description ?? "N/D"}"`);

  // --- 3. Estrazione nutrienti (pura, stesso codice testato) ---
  const extracted = extractAllMappedNutrients(fdcFood.foodNutrients);
  const nutrientCodes = Object.keys(extracted.values);
  if (nutrientCodes.length === 0) {
    fail("Nessun nutriente mappato trovato per intero in questo record FDC -- probabile fdc-id sbagliato o record incompleto. Non proseguo con un alimento senza nutrienti.");
  }

  console.log(`Nutrienti estratti (${nutrientCodes.length}/17): ${nutrientCodes.join(", ")}`);
  if (extracted.notFoundInFdc.length > 0) {
    console.log(`Nutrienti NON trovati in FDC per questo alimento (non inseriti, non assunti zero): ${extracted.notFoundInFdc.join(", ")}`);
  }
  if (extracted.unitMismatch.length > 0) {
    console.log(`Nutrienti con unità FDC inattesa (non inseriti, da indagare): ${extracted.unitMismatch.join(", ")}`);
  }

  console.log("\n=== Riepilogo scrittura prevista ===");
  if (matrixNeedsInsert) console.log(`+ food_matrices_master: ${matrixId} ("${matrixDescriptionIt}")`);
  console.log(`+ foods_raw: ${foodId} ("${nameIt}", matrix=${matrixId}, cooking_state=${baselineCookingState}, is_heme_iron=${isHemeIron}, matrix_category_calcium=${matrixCategoryCalcium ?? "NULL"}, carotenoid_matrix_state=${carotenoidMatrixState ?? "NULL"}, zinc_bioaccessibility_bucket=${zincBioaccessibilityBucket}, is_fortified_folate=${isFortifiedFolate}, botanical_family=${botanicalFamily ?? "NULL"}, fdc_id=${fdcId}, fdc_name="${fdcFood.description}", verification_status=draft) -- attributi categorici per analogia dichiarata con ${analogyFoodId}`);
  console.log(`+ nutrient_values: ${nutrientCodes.length} righe (source_id=USDA_FDC, verification_status=draft)`);

  if (!APPLY) {
    console.log("\nQuesto era un DRY RUN -- nessuna scrittura è avvenuta. Rilancia con --apply per scrivere davvero.");
    return;
  }

  // --- 4. Scrittura reale (ordine: matrice -> alimento -> nutrienti, ciascuno verificato) ---
  if (matrixNeedsInsert) {
    const { error } = await supabaseAdmin.from("food_matrices_master").insert({ matrix_id: matrixId, description_it: matrixDescriptionIt });
    if (error) fail(`INSERT food_matrices_master fallita: ${error.message}`);
    console.log(`✓ food_matrices_master "${matrixId}" creata.`);
  }

  const { error: foodInsertErr } = await supabaseAdmin.from("foods_raw").insert({
    food_id: foodId,
    name_it: nameIt,
    matrix_id: matrixId,
    baseline_cooking_state: baselineCookingState,
    is_heme_iron: isHemeIron,
    matrix_category_calcium: matrixCategoryCalcium,
    carotenoid_matrix_state: carotenoidMatrixState,
    zinc_bioaccessibility_bucket: zincBioaccessibilityBucket,
    is_fortified_folate: isFortifiedFolate,
    botanical_family: botanicalFamily,
    fdc_id: fdcId,
    fdc_name: fdcFood.description ?? null,
    verification_status: "draft",
  });
  if (foodInsertErr) fail(`INSERT foods_raw fallita: ${foodInsertErr.message}`);
  console.log(`✓ foods_raw "${foodId}" creato (draft).`);

  const nutrientRows = nutrientCodes.map((code) => ({
    food_id: foodId,
    nutrient_code: code,
    value: extracted.values[code],
    confidence_low: null,
    confidence_high: null,
    source_id: "USDA_FDC",
    verification_status: "draft",
  }));
  const { error: nvInsertErr } = await supabaseAdmin.from("nutrient_values").insert(nutrientRows);
  if (nvInsertErr) fail(`INSERT nutrient_values fallita: ${nvInsertErr.message}`);
  console.log(`✓ nutrient_values: ${nutrientRows.length} righe inserite (draft).`);

  // --- 5. Verifica difensiva finale: ri-leggi e confronta ---
  const { data: verifyFood, error: verifyFoodErr } = await supabaseAdmin
    .from("foods_raw")
    .select("food_id, fdc_id, verification_status")
    .eq("food_id", foodId)
    .maybeSingle();
  if (verifyFoodErr || !verifyFood) fail(`Verifica post-scrittura fallita: foods_raw non rilegge "${foodId}" (${verifyFoodErr?.message ?? "nessuna riga"})`);
  if (verifyFood.fdc_id !== fdcId || verifyFood.verification_status !== "draft") {
    fail(`Verifica post-scrittura: foods_raw per "${foodId}" ha valori inattesi (fdc_id=${verifyFood.fdc_id}, status=${verifyFood.verification_status})`);
  }

  const { count: verifyCount, error: verifyNvErr } = await supabaseAdmin
    .from("nutrient_values")
    .select("food_id", { count: "exact", head: true })
    .eq("food_id", foodId)
    .eq("source_id", "USDA_FDC");
  if (verifyNvErr) fail(`Verifica post-scrittura nutrient_values fallita: ${verifyNvErr.message}`);
  if (verifyCount !== nutrientRows.length) {
    fail(`Verifica post-scrittura: attese ${nutrientRows.length} righe nutrient_values per "${foodId}", trovate ${verifyCount}.`);
  }

  console.log(`\n✓ Verifica difensiva passata: "${foodId}" presente con ${verifyCount} righe nutrient_values, tutto draft come atteso.`);
  console.log("Ricorda: resta 'draft' finché scripts/verify_golden_set_batch.ts (o una revisione umana) non lo promuove esplicitamente.");
}

main().catch((e) => {
  console.error("Errore fatale:", e);
  process.exit(1);
});
