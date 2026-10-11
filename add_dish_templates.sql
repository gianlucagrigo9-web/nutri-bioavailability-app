-- ============================================================================
-- Piatti compositi/tradizionali: dish_templates + dish_components
-- ============================================================================
--
-- Implementa il design approvato in docs/PRD.md §4.8 (approvato dall'utente
-- il 2026-10-11: "mi piace più il concetto di due tabelle leggere per
-- mantenere dinamicità all'interno di una ricetta classica perché ognuno
-- possa aggiungere o togliere qualcosa senza sfanculare tutto").
--
-- NESSUN numero nutrizionale viene scritto qui. Queste due tabelle
-- contengono solo grammi e riferimenti a food_id/source_id già esistenti --
-- il profilo nutrizionale di un piatto si calcola SEMPRE a runtime
-- (lib/engine/dishComposition.ts), mai come riga statica in nutrient_values,
-- per non violare la Regola 1 il giorno in cui si corregge un ingrediente
-- componente (vedi §4.8 per il ragionamento completo).
--
-- Convenzione RLS: stessa delle altre 5 tabelle verificata in §9 Fase 2
-- punto 9 (RLS abilitata, SELECT pubblica senza filtro su
-- verification_status, nessuna policy INSERT/UPDATE/DELETE per anon --
-- le scritture passano solo dalla service_role key lato server).
-- ============================================================================

CREATE TABLE IF NOT EXISTS dish_templates (
  dish_id             text PRIMARY KEY,
  name_it             text NOT NULL,
  description_it      text,
  source_id           text NOT NULL REFERENCES sources(id),
  verification_status text NOT NULL DEFAULT 'draft' CHECK (verification_status IN ('draft', 'verified')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dish_components (
  id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dish_id                text NOT NULL REFERENCES dish_templates(dish_id) ON DELETE CASCADE,
  food_id                text NOT NULL REFERENCES foods_raw(food_id),
  grams_per_serving      numeric NOT NULL CHECK (grams_per_serving > 0),
  -- 'raw' o 'cooked_as_in_food_id': NON un cooking_method_enum completo --
  -- la riga punta direttamente al food_id già nello stato giusto (es.
  -- food_broccoli_boiled), quindi questo campo è solo una nota di
  -- leggibilità/audit, non un input per il motore di cottura.
  cooking_state_assumed text NOT NULL CHECK (cooking_state_assumed IN ('raw', 'cooked_as_in_food_id')),
  notes                  text,
  UNIQUE (dish_id, food_id)
);

ALTER TABLE dish_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dish_templates_public_select ON dish_templates;
CREATE POLICY dish_templates_public_select ON dish_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS dish_components_public_select ON dish_components;
CREATE POLICY dish_components_public_select ON dish_components FOR SELECT USING (true);

-- ============================================================================
-- Verifica difensiva (da leggere dopo l'esecuzione -- se una riga torna qui
-- sotto, qualcosa non è andato come previsto, non va ignorato):
-- ============================================================================
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'dish_templates') AS dish_templates_esiste,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'dish_components') AS dish_components_esiste,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'dish_templates') AS dish_templates_rls_on,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'dish_components') AS dish_components_rls_on;
-- Atteso: 1, 1, true, true. Qualunque altro valore -- fermarsi e segnalare,
-- non procedere a inserire piatti di prova.
