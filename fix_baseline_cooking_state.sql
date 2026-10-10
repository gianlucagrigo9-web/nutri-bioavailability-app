-- ============================================================================
-- Fix architetturale: foods_raw.baseline_cooking_state
-- ============================================================================
--
-- BUG TROVATO (2026-10-10, segnalato dall'utente mentre guardava la UI
-- appena unita): cookingTransformationEngine.applyCookingTransformation
-- presuppone che i valori salvati in nutrient_values per un food_id siano
-- lo stato CRUDO dell'alimento -- se cookingMethod='raw' (default di ogni
-- nuovo elemento nel meal builder, vedi app/page.tsx) restituisce i valori
-- invariati; se si seleziona un altro metodo, moltiplica per il fattore di
-- ritenzione corrispondente.
--
-- Il menu "metodo di cottura" nella UI (availableCookingMethods()) però è
-- indicizzato solo per matrix_id, non per il singolo food_id. Risultato:
-- per 7 alimenti del Golden Set i valori salvati sono in realtà GIA' di
-- uno stato cotto (bollito/brasato/alla griglia/sodo), ma: (a) la UI li
-- mostra come "Crudo" di default, etichetta falsa; (b) se l'utente
-- seleziona un metodo di cottura disponibile per quella matrice (es.
-- "Fritto" per le patate, "Bollitura" per i legumi -- entrambi hanno dati
-- reali in retention_factors), il fattore di ritenzione viene applicato
-- una SECONDA volta su un valore già scontato dalla cottura reale,
-- producendo un numero sbagliato per difetto.
--
-- Per i legumi e le patate questo bug è GIA' LIVE oggi (dati 'boiled',
-- 'boiled_quick_15_20min', 'fried' tutti presenti in retention_factors per
-- le matrici 'legumes'/'tubers'). Per spinaci bolliti e cavoletti di
-- Bruxelles bolliti il bug è anch'esso live (matrici 'leafy_greens' e
-- 'crucifere_cavoletti_bruxelles' hanno dati 'boiled'/'steamed'). Per
-- fegato/manzo macinato/uova/salmone/pasta il bug non è ancora
-- "innescato" (zero righe retention_factors per quelle matrici finora) ma
-- lo stesso errore di etichetta ("Crudo" su un cibo già cotto) esiste già.
--
-- FIX: nuova colonna foods_raw.baseline_cooking_state, che registra lo
-- stato REALE del valore salvato. Default difensivo 'unknown' (non 'raw'):
-- qualunque food_id futuro che non la imposta esplicitamente viene trattato
-- dalla UI come "non sicuro per trasformazioni di cottura" finché un
-- umano non lo backfilla -- fail-safe, mai il contrario.
--
-- Valori usati qui:
--   'raw'            -> stato genuinamente crudo/di riferimento, sicuro
--                        come base per availableCookingMethods()
--   'boiled' / 'boiled_in_skin'
--                     -> matchano cooking_method_enum (stesso significato)
--   'braised', 'grilled', 'dry_heat_cooked', 'hard_boiled'
--                     -> stati reali ma SENZA una riga cooking_method_enum
--                        corrispondente (nessun fattore di ritenzione
--                        "da crudo a qui" è stato cercato/trovato) --
--                        valori liberi, solo documentativi
-- In tutti i casi non-'raw', la UI (vedi task collegato in app/page.tsx)
-- deve bloccare il selettore di cottura e mostrare lo stato reale invece
-- di "Crudo".
-- ============================================================================

ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS baseline_cooking_state text NOT NULL DEFAULT 'unknown';

COMMENT ON COLUMN foods_raw.baseline_cooking_state IS
  'Stato di cottura REALE dei valori salvati in nutrient_values per questo food_id. ''raw'' = sicuro come base per i fattori di ritenzione di cottura (matrix-wide); qualsiasi altro valore = la UI deve bloccare il selettore di metodo di cottura (il dato è già di uno stato specifico, applicare un fattore di ritenzione lo sconterebbe due volte). Default ''unknown'' = non ancora classificato, trattato come non-raw per sicurezza.';

UPDATE foods_raw SET baseline_cooking_state = v.state
FROM (VALUES
  ('food_spinach_raw',             'raw'),
  ('food_spinach_boiled',          'boiled'),
  ('food_kale_raw',                'raw'),
  ('food_milk_whole',              'raw'),
  ('food_kidney_beans_boiled',     'boiled'),
  ('food_lentils_boiled',          'boiled'),
  ('food_chickpeas_boiled',        'boiled'),
  ('food_potato_boiled_in_skin',   'boiled_in_skin'),
  ('food_carrots_raw',             'raw'),
  ('food_carrots_boiled',          'boiled'),
  ('food_brussels_sprouts_raw',    'raw'),
  ('food_brussels_sprouts_boiled', 'boiled'),
  ('food_beef_liver_cooked',       'braised'),
  ('food_beef_ground_cooked',      'grilled'),
  ('food_broccoli_raw',            'raw'),
  ('food_almonds',                 'raw'),
  ('food_egg_hard_boiled',         'hard_boiled'),
  ('food_salmon_cooked',           'dry_heat_cooked'),
  ('food_pasta_enriched_cooked',   'boiled')
) AS v(food_id, state)
WHERE foods_raw.food_id = v.food_id;

-- ============================================================================
-- Verifica attesa dopo l'esecuzione: dei 19 alimenti del Golden Set attuale,
-- 0 righe restano con baseline_cooking_state = 'unknown'.
-- ============================================================================

-- ============================================================================
-- Scoperta collaterale durante la verifica di questo fix: foods_raw contiene
-- in realtà 38 righe, non 19 -- le altre 19 sono un vecchio seed/demo
-- PRE-Golden-Set (food_apple_raw, food_beef_raw, food_buckwheat_raw,
-- food_chickpeas_raw, food_dates_raw, food_flaxseed_raw, food_garlic_raw,
-- food_lemon_raw, food_lentils_raw, food_oranges_raw, ecc. -- matrici
-- diverse: 'meat', 'pome_fruits', 'citrus_oranges', 'cereals', 'seeds',
-- 'allium', 'citrus', non presenti in golden_set_foods.sql).
--
-- La UI (app/page.tsx) mostra solo foods_raw.verification_status='verified'.
-- Di questi 19 alimenti fantasma, 15 sono 'draft' (quindi già invisibili),
-- ma 4 erano 'verified' e comparivano nella UI MESCOLATI al vero Golden
-- Set: food_apple_raw ("Mela"), food_beef_raw ("Manzo, girello, crudo"),
-- food_lentils_raw ("Lenticchie, crude"), food_oranges_raw ("Arance").
--
-- Controllando i loro nutrient_values: molti hanno source_id = NULL
-- (nessuna fonte citata) pur essendo sotto un food_id marcato 'verified'
-- -- una violazione diretta di "zero dati inventati" rimasta nascosta
-- perché il filtro UI guarda solo foods_raw.verification_status, non lo
-- stato dei singoli nutrient_values. "Lenticchie, crude" in particolare
-- comparve accanto a "Lenticchie, bollite" (il vero alimento Golden Set),
-- due voci dall'aspetto simile ma di rigore completamente diverso.
--
-- Segnalato all'utente, che ha scelto di declassarli a 'draft' (reversibile,
-- nessuna perdita di dati) invece di cancellarli:
-- ============================================================================

UPDATE foods_raw SET verification_status = 'draft'
WHERE food_id IN ('food_apple_raw', 'food_beef_raw', 'food_lentils_raw', 'food_oranges_raw');

-- Verificato: tutti e 4 ora 'draft', quindi esclusi dalla query .eq('verification_status','verified')
-- di app/page.tsx -- spariscono dalla UI senza essere cancellati dal DB.
