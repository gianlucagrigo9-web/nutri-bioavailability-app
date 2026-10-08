'use client';

import { useFormState, useFormStatus } from 'react-dom';
// Nota: su Next.js 15 / React 19, useFormState è stato rinominato
// useActionState e si importa da 'react' invece che da 'react-dom'.
// Se il progetto è su quella versione, cambia questa riga in:
//   import { useActionState } from 'react';
//   import { useFormStatus } from 'react-dom';
// e sostituisci useFormState con useActionState sotto.

import { login, FormState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Verifica…' : 'Entra'}
    </button>
  );
}

export default function LoginForm() {
  const initialState: FormState = { error: null };
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <form action={formAction} className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Data Entry — Area Admin</h1>
        <p className="text-sm text-slate-500 mb-6">Accesso riservato al Human-in-the-Loop review.</p>

        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm mb-4
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {state.error && (
          <p className="text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
