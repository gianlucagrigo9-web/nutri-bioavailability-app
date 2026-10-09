'use server';

// app/admin/data-entry/actions.ts
//
// Nota sulla password: e' volutamente "semplice" come richiesto (un solo
// amministratore, nessun sistema multi-utente). Il cookie NON contiene la
// password in chiaro, ma un hash fisso di ADMIN_PASSWORD -- comunque non
// e' un meccanismo pensato per un pannello multi-utente in produzione,
// solo per tenere fuori i visitatori casuali da un tool interno.
//
// Variabile d'ambiente richiesta (server-only): ADMIN_PASSWORD=...

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COOKIE_NAME = 'admin_session';

function expectedToken(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error('ADMIN_PASSWORD non impostata nelle variabili d\'ambiente');
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export type FormState = { error: string | null; success?: string | null };

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const input = formData.get('password') as string | null;
  if (!input || input !== process.env.ADMIN_PASSWORD) {
    return { error: 'Password errata.' };
  }
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 ore
    path: '/admin',
  });
  return { error: null };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  if (!c) return false;
  try {
    return c.value === expectedToken();
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Risoluzione della fonte: o scegli una sources.id esistente, o ne crei una
// al volo incollando sigla breve + citazione/DOI. In entrambi i casi il
// valore restituito e' sempre un id che esiste davvero in `sources` --
// cosi' non si ripete il bug delle sourceIds citate nel codice ma assenti
// dal database, trovato in questo stesso progetto qualche sessione fa.
// ----------------------------------------------------------------------------

async function resolveSourceId(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const mode = formData.get('source_mode');

  if (mode === 'existing') {
    const id = formData.get('existing_source_id') as string | null;
    if (!id) return { ok: false, error: 'Seleziona una fonte esistente, oppure passa a "Nuova fonte".' };
    return { ok: true, id };
  }

  const newId = (formData.get('new_source_id') as string | null)?.trim();
  const citation = (formData.get('new_source_citation') as string | null)?.trim();
  if (!newId || !citation) {
    return { ok: false, error: 'Per una nuova fonte servono sia la sigla breve (es. ALEA_NOEL_2007) sia la citazione/DOI completa.' };
  }
  if (!/^[A-Z0-9_]+$/.test(newId)) {
    return { ok: false, error: 'La sigla della fonte può contenere solo lettere maiuscole, numeri e underscore (es. ALEA_NOEL_2007).' };
  }

  const { error } = await supabaseAdmin.from('sources').upsert({ id: newId, citation }, { onConflict: 'id' });
  if (error) return { ok: false, error: `Errore nel salvare la fonte: ${error.message}` };
  return { ok: true, id: newId };
}

// ----------------------------------------------------------------------------
// Form 1: nuovo alimento (foods_raw + nutrient_values)
// ----------------------------------------------------------------------------

const NUTRIENT_FIELDS = [
  'iron_mg', 'zinc_mg', 'calcium_mg', 'vitamin_c_mg',
  'phytates_mg', 'oxalates_mg', 'polyphenols_mg', 'macs_mg',
  // Aggiunti 2026-10-09 (vedi docs/PRD.md §4.1/§4.2/§4.5 e types.ts): questa
  // lista DEVE restare sincronizzata con NUTRIENT_OPTIONS in
  // DataEntryDashboard.tsx (per i codici brevi usati da retention_factors)
  // e con NUTRIENT_FIELD_MAP in lib/engine/cookingTransformationEngine.ts
  // -- lo stesso disallineamento gia' successo una volta in questo
  // progetto (vedi commento in DataEntryDashboard.tsx).
  'vitamin_b12_mcg', 'folate_mcg',
  'beta_carotene_mcg', 'other_provitamin_a_carotenoids_mcg',
  'magnesium_mg', 'copper_mg', 'selenium_mcg', 'iodine_mcg', 'vitamin_k_mcg',
] as const;

export async function createFood(_prevState: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAuthenticated())) return { error: 'Sessione scaduta, rientra con la password.' };

  const foodId = (formData.get('food_id') as string)?.trim();
  const nameIt = (formData.get('name_it') as string)?.trim();
  const matrixId = formData.get('matrix_id') as string;
  const isHemeIron = formData.get('is_heme_iron') === 'on';
  const calciumCategory = (formData.get('matrix_category_calcium') as string) || null;
  const botanicalFamily = (formData.get('botanical_family') as string)?.trim() || null;
  // Aggiunti 2026-10-09 (vedi docs/PRD.md §4.2/§4.4/§4.5, types.ts): attributi
  // categorici per-alimento-nello-stato-di-cottura, non nutrient_values
  // (coerenti con is_heme_iron/matrix_category_calcium/botanical_family
  // sopra, non con i campi numerici in NUTRIENT_FIELDS).
  const carotenoidMatrixState = (formData.get('carotenoid_matrix_state') as string) || null;
  const zincBioaccessibilityBucket = (formData.get('zinc_bioaccessibility_bucket') as string) || 'none';
  const isFortifiedFolate = formData.get('is_fortified_folate') === 'on';

  if (!foodId || !nameIt || !matrixId) {
    return { error: 'food_id, nome e matrice sono obbligatori.' };
  }

  const source = await resolveSourceId(formData);
  if (!source.ok) return { error: source.error };

  // verification_status è SEMPRE 'draft' per qualunque cosa inserita da
  // questo form: non c'è un override nell'interfaccia, di proposito.
  const { error: foodError } = await supabaseAdmin.from('foods_raw').upsert({
    food_id: foodId,
    name_it: nameIt,
    matrix_id: matrixId,
    is_heme_iron: isHemeIron,
    matrix_category_calcium: calciumCategory,
    botanical_family: botanicalFamily,
    carotenoid_matrix_state: carotenoidMatrixState,
    zinc_bioaccessibility_bucket: zincBioaccessibilityBucket,
    is_fortified_folate: isFortifiedFolate,
    verification_status: 'draft',
  });
  if (foodError) return { error: `Errore foods_raw: ${foodError.message}` };

  const rows = NUTRIENT_FIELDS
    .map((code) => ({ code, raw: formData.get(code) as string | null }))
    .filter((f) => f.raw !== null && f.raw !== '')
    .map((f) => ({
      food_id: foodId,
      nutrient_code: f.code,
      value: Number(f.raw),
      source_id: source.id,
      verification_status: 'draft',
    }));

  if (rows.length > 0) {
    const { error: nvError } = await supabaseAdmin
      .from('nutrient_values')
      .upsert(rows, { onConflict: 'food_id,nutrient_code' });
    if (nvError) {
      return {
        error: `Alimento salvato, ma errore sui valori nutrienti: ${nvError.message}. ` +
          `Se l'errore parla di "verification_status" o del vincolo onConflict, vedi il commento in fondo a admin_data_entry_setup.sql.`,
      };
    }
  }

  return { error: null, success: `"${nameIt}" salvato come draft (${rows.length} valori nutrienti, fonte ${source.id}).` };
}

// ----------------------------------------------------------------------------
// Form 2: nuovo retention factor
// ----------------------------------------------------------------------------

export async function createRetentionFactor(_prevState: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAuthenticated())) return { error: 'Sessione scaduta, rientra con la password.' };

  const matrixId = formData.get('matrix_id') as string;
  const cookingMethod = formData.get('cooking_method') as string;
  const nutrient = formData.get('nutrient') as string;
  const value = formData.get('value') as string;
  const confidenceLow = formData.get('confidence_low') as string;
  const confidenceHigh = formData.get('confidence_high') as string;

  if (!matrixId || !cookingMethod || !nutrient || !value) {
    return { error: 'Matrice, metodo di cottura, nutriente e valore sono obbligatori.' };
  }

  const source = await resolveSourceId(formData);
  if (!source.ok) return { error: source.error };

  const { error } = await supabaseAdmin.from('retention_factors').insert({
    matrix_id: matrixId,
    cooking_method: cookingMethod,
    nutrient,
    value: Number(value),
    confidence_low: confidenceLow ? Number(confidenceLow) : null,
    confidence_high: confidenceHigh ? Number(confidenceHigh) : null,
    source_id: source.id,
    verification_status: 'draft',
  });
  if (error) return { error: `Errore retention_factors: ${error.message}` };

  return {
    error: null,
    success: `Retention factor salvato come draft: ${matrixId} / ${cookingMethod} / ${nutrient} = ${value} (fonte ${source.id}).`,
  };
}
