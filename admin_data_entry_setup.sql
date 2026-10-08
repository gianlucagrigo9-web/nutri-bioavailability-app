-- ============================================================================
-- Prerequisiti SQL per /app/admin/data-entry
-- ============================================================================

-- 1) Funzione per leggere i valori di un ENUM Postgres da supabase-js.
--    supabase-js non ha un modo diretto per introspezionare un tipo enum,
--    quindi serve questa funzione helper. %I previene SQL injection sul
--    nome del tipo (identifier quoting), quindi è sicura da esporre anche
--    con un argomento testuale proveniente dal client.
create or replace function get_enum_values(enum_name text)
returns text[]
language plpgsql
security definer
as $$
declare
  result text[];
begin
  execute format('select enum_range(null::%I)::text[]', enum_name) into result;
  return result;
end;
$$;

-- Verifica il nome ESATTO del tipo enum della colonna cooking_method:
--   select udt_name from information_schema.columns
--   where table_name = 'retention_factors' and column_name = 'cooking_method';
-- Se il risultato non è 'cooking_method_enum', aggiorna la stringa passata
-- a supabase.rpc('get_enum_values', { enum_name: '...' }) in page.tsx.

-- ----------------------------------------------------------------------------
-- 2) Colonne che il pannello di data-entry assume esistano. Se una di
--    queste manca (controllalo con \d nutrient_values in psql o dal Table
--    Editor di Supabase), aggiungila prima di usare il pannello:
-- ----------------------------------------------------------------------------

-- nutrient_values.verification_status (usata per forzare 'draft')
alter table nutrient_values
  add column if not exists verification_status text default 'draft';

-- Vincolo necessario perché l'upsert con onConflict: 'food_id,nutrient_code'
-- funzioni (altrimenti Postgres non sa su quale chiave fare l'upsert):
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'nutrient_values_food_nutrient_unique'
  ) then
    alter table nutrient_values
      add constraint nutrient_values_food_nutrient_unique unique (food_id, nutrient_code);
  end if;
end $$;

-- retention_factors.confidence_low / confidence_high (se non già presenti)
alter table retention_factors add column if not exists confidence_low numeric;
alter table retention_factors add column if not exists confidence_high numeric;
alter table retention_factors add column if not exists verification_status text default 'draft';

-- foods_raw.matrix_category_calcium e botanical_family (se non già presenti)
alter table foods_raw add column if not exists matrix_category_calcium text;
alter table foods_raw add column if not exists botanical_family text;
alter table foods_raw add column if not exists verification_status text default 'draft';

-- ----------------------------------------------------------------------------
-- 3) Variabili d'ambiente da aggiungere (es. in .env.local, MAI committate):
--    ADMIN_PASSWORD=scegli-una-password
--    SUPABASE_URL=...                     (stesso progetto di sempre)
--    SUPABASE_SERVICE_ROLE_KEY=...        (da Project Settings > API,
--                                           sezione "service_role" — NON
--                                           la chiave "anon" già in uso
--                                           per la dashboard pubblica)
-- ----------------------------------------------------------------------------
