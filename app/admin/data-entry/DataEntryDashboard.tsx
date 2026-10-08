'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
// Vedi nota su useFormState/useActionState in LoginForm.tsx se sei su
// Next.js 15 / React 19.

import { createFood, createRetentionFactor, logout, FormState } from './actions';

export interface Matrix { matrix_id: string; description_it: string | null }
export interface SourceRow { id: string; citation: string }

interface Props {
  matrices: Matrix[];
  cookingMethods: string[];
  sources: SourceRow[];
}

const NUTRIENT_OPTIONS = [
  { code: 'iron', label: 'Ferro' },
  { code: 'zinc', label: 'Zinco' },
  { code: 'calcium', label: 'Calcio' },
  { code: 'vitamin_c', label: 'Vitamina C' },
  { code: 'phytates', label: 'Fitati' },
  { code: 'oxalates', label: 'Ossalati' },
  { code: 'polyphenols', label: 'Polifenoli' },
  { code: 'macs', label: 'MACs' },
] as const;
// Questi codici DEVONO coincidere con le chiavi di NUTRIENT_FIELD_MAP in
// lib/engine/cookingTransformationEngine.ts. Se aggiungi un nutriente qui,
// aggiungilo anche là -- è esattamente il tipo di disallineamento che ha
// causato un bug reale in questo progetto in una sessione precedente.

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white
                 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Salvataggio…' : label}
    </button>
  );
}

function FeedbackBanner({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-5">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5">
        ✓ {state.success}
      </p>
    );
  }
  return null;
}

function SourcePicker({ sources }: { sources: SourceRow[] }) {
  const [mode, setMode] = useState<'existing' | 'new'>(sources.length > 0 ? 'existing' : 'new');

  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio" name="source_mode" value="existing"
            checked={mode === 'existing'} onChange={() => setMode('existing')}
            disabled={sources.length === 0}
          />
          Fonte già inserita
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio" name="source_mode" value="new"
            checked={mode === 'new'} onChange={() => setMode('new')}
          />
          Nuova fonte (DOI/citazione)
        </label>
      </div>

      {mode === 'existing' ? (
        <select
          name="existing_source_id"
          required={mode === 'existing'}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          <option value="">— seleziona —</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>{s.id} — {s.citation.slice(0, 70)}{s.citation.length > 70 ? '…' : ''}</option>
          ))}
        </select>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            name="new_source_id" placeholder="SIGLA_BREVE_2024" required={mode === 'new'}
            className="md:col-span-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
          />
          <textarea
            name="new_source_citation" placeholder="Citazione completa o DOI, es. Alea & Noel 2007, J Res Sci Comput Eng 4(2):..."
            required={mode === 'new'} rows={2}
            className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function FoodForm({ matrices, sources }: { matrices: Matrix[]; sources: SourceRow[] }) {
  const [state, formAction] = useFormState<FormState, FormData>(createFood, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <FeedbackBanner state={state} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">food_id</label>
          <input name="food_id" required placeholder="food_broccoli_raw"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Nome (IT)</label>
          <input name="name_it" required placeholder="Broccoli crudi"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Matrice</label>
          <select name="matrix_id" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">— seleziona —</option>
            {matrices.map((m) => (
              <option key={m.matrix_id} value={m.matrix_id}>{m.matrix_id}{m.description_it ? ` — ${m.description_it}` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Categoria ossalati (calcio)</label>
          <select name="matrix_category_calcium" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">— non applicabile —</option>
            <option value="high_oxalate">Alto ossalato (es. spinaci)</option>
            <option value="medium_oxalate">Medio ossalato</option>
            <option value="low_oxalate">Basso ossalato (es. kale)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Famiglia botanica</label>
          <input name="botanical_family" placeholder="Brassicaceae"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="is_heme_iron" className="rounded border-slate-300" />
        Il ferro di questo alimento è eme (matrice animale)
      </label>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Valori per 100g (lascia vuoto ciò che non hai — non viene inventato nulla)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['iron_mg', 'Ferro (mg)'], ['zinc_mg', 'Zinco (mg)'],
            ['calcium_mg', 'Calcio (mg)'], ['vitamin_c_mg', 'Vitamina C (mg)'],
            ['phytates_mg', 'Fitati (mg)'], ['oxalates_mg', 'Ossalati (mg)'],
            ['polyphenols_mg', 'Polifenoli (mg)'], ['macs_mg', 'MACs (mg)'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs text-slate-500 mb-1">{label}</label>
              <input name={field} type="number" step="any" min="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Fonte di tutti i valori sopra</h3>
        <SourcePicker sources={sources} />
      </div>

      <div className="pt-2 flex items-center gap-3">
        <SubmitButton label="Salva alimento come draft" />
        <span className="text-xs text-slate-400">verification_status è sempre "draft" da questo form</span>
      </div>
    </form>
  );
}

function RetentionFactorForm({ matrices, cookingMethods, sources }: Props) {
  const [state, formAction] = useFormState<FormState, FormData>(createRetentionFactor, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <FeedbackBanner state={state} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Matrice</label>
          <select name="matrix_id" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">— seleziona —</option>
            {matrices.map((m) => (
              <option key={m.matrix_id} value={m.matrix_id}>{m.matrix_id}{m.description_it ? ` — ${m.description_it}` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Metodo di cottura</label>
          <select name="cooking_method" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">— seleziona —</option>
            {cookingMethods.map((cm) => <option key={cm} value={cm}>{cm}</option>)}
          </select>
          {cookingMethods.length === 0 && (
            <p className="text-xs text-rose-500 mt-1">
              Nessun metodo trovato — verifica la funzione get_enum_values in admin_data_entry_setup.sql.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Nutriente</label>
          <select name="nutrient" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">— seleziona —</option>
            {NUTRIENT_OPTIONS.map((n) => <option key={n.code} value={n.code}>{n.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Valore (0–1, es. 0.85 = 85% ritenuto)
          </label>
          <input name="value" type="number" step="any" min="0" required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confidenza bassa (opz.)</label>
          <input name="confidence_low" type="number" step="any" min="0"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confidenza alta (opz.)</label>
          <input name="confidence_high" type="number" step="any" min="0"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Fonte (con pagina/riga nella citazione, se disponibile)</h3>
        <SourcePicker sources={sources} />
      </div>

      <div className="pt-2 flex items-center gap-3">
        <SubmitButton label="Salva retention factor come draft" />
        <span className="text-xs text-slate-400">verification_status è sempre "draft" da questo form</span>
      </div>
    </form>
  );
}

export default function DataEntryDashboard({ matrices, cookingMethods, sources }: Props) {
  const [tab, setTab] = useState<'food' | 'retention'>('food');

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Human-in-the-Loop Data Entry</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ogni riga salvata qui entra come <code className="font-mono">draft</code>: resta da promuovere a "verified" in un passaggio di revisione separato.
            </p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-400 hover:text-slate-600 underline">Esci</button>
          </form>
        </header>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('food')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'food' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Nuovo alimento
          </button>
          <button
            onClick={() => setTab('retention')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'retention' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Nuovo retention factor
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          {tab === 'food'
            ? <FoodForm matrices={matrices} sources={sources} />
            : <RetentionFactorForm matrices={matrices} cookingMethods={cookingMethods} sources={sources} />}
        </div>
      </div>
    </div>
  );
}
