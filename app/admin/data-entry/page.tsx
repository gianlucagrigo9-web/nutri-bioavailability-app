import { isAuthenticated } from './actions';
import LoginForm from './LoginForm';
import DataEntryDashboard, { Matrix, SourceRow } from './DataEntryDashboard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Pagina sempre dinamica: legge un cookie e fa query fresche ad ogni
// visita, non va mai messa in cache statica.
export const dynamic = 'force-dynamic';

export default async function DataEntryPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    return <LoginForm />;
  }

  const [{ data: matrices, error: matricesError }, { data: sources, error: sourcesError }, { data: cookingMethodsRaw, error: cmError }] =
    await Promise.all([
      supabaseAdmin.from('food_matrices_master').select('matrix_id, description_it').order('matrix_id'),
      supabaseAdmin.from('sources').select('id, citation').order('id'),
      // Richiede la funzione get_enum_values definita in
      // admin_data_entry_setup.sql. Il nome esatto del tipo enum
      // ('cooking_method_enum') va confermato contro quello che Supabase
      // mostra in Table Editor per la colonna retention_factors.cooking_method.
      supabaseAdmin.rpc('get_enum_values', { enum_name: 'cooking_method_enum' }),
    ]);

  if (matricesError || sourcesError) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 font-sans text-rose-600">
        Errore nel caricare matrici o fonti da Supabase: {matricesError?.message || sourcesError?.message}
      </div>
    );
  }

  return (
    <DataEntryDashboard
      matrices={(matrices ?? []) as Matrix[]}
      sources={(sources ?? []) as SourceRow[]}
      cookingMethods={cmError ? [] : ((cookingMethodsRaw as string[] | null) ?? [])}
    />
  );
}
