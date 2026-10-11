-- Classificazione dietCompatibility per il Golden Set (docs/PRD.md §4.9,
-- "ovviamente prima cosa che si offre a cliente è selezionare se vuole
-- dieta onnivora, carnivora, vegana, fruttariana"). Lavoro editoriale
-- dichiarato (Regola 6), non derivabile automaticamente da un singolo
-- campo esistente (is_heme_iron/botanical_family non bastano: un
-- alimento non-heme può comunque essere di origine animale, es. latticini).
--
-- Regole di classificazione usate (identiche a quelle già scritte nel
-- PRD, non reinventate qui):
--   vegetarian = false SOLO per carne/pesce/pollame.
--   vegan      = false per carne/pesce/pollame/uova/latticini/miele.
--   fruitarian = true SOLO per frutta fresca (definizione più restrittiva
--                dichiarata nel PRD -- non estesa a semi/noci/ortaggi
--                botanicamente "frutto" come pomodoro).
--
-- NULL (non 'false' di default) per un alimento non ancora classificato
-- su un asse -- in questo file ogni riga del Golden Set attuale (30
-- alimenti, verificati leggendo i file *.sql già committati, non assunti
-- a memoria) viene classificata esplicitamente su tutti e tre gli assi,
-- quindi dopo questa migrazione non dovrebbero restare NULL. Se ne resta
-- uno, il blocco di verifica in fondo lo segnala (mai un'assunzione
-- silenziosa "NULL = compatibile").
--
-- Nota per il wiring futuro (non fatto in questa sessione, dichiarato):
-- app/page.tsx dovrà leggere questi 3 campi e costruire
-- FoodItem.dietCompatibility SOLO quando tutti e tre sono non-NULL per
-- quella riga, altrimenti lasciare il campo assente (mai costruire un
-- oggetto dietCompatibility con un valore indovinato per il campo mancante).

ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS diet_compat_vegetarian boolean;
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS diet_compat_vegan boolean;
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS diet_compat_fruitarian boolean;

-- Carne/pesce/pollame: false su tutti e tre gli assi.
UPDATE foods_raw SET diet_compat_vegetarian = false, diet_compat_vegan = false, diet_compat_fruitarian = false
WHERE food_id IN (
  'food_beef_ground_cooked', 'food_beef_ground_raw',
  'food_beef_liver_cooked', 'food_beef_liver_raw',
  'food_salmon_cooked', 'food_salmon_raw'
);

-- Uova e latticini: vegetariano sì, vegano no, fruttariano no.
UPDATE foods_raw SET diet_compat_vegetarian = true, diet_compat_vegan = false, diet_compat_fruitarian = false
WHERE food_id IN (
  'food_egg_hard_boiled', 'food_egg_raw', 'food_milk_whole'
);

-- Frutta fresca: compatibile con tutti e tre, incluso fruttariano.
UPDATE foods_raw SET diet_compat_vegetarian = true, diet_compat_vegan = true, diet_compat_fruitarian = true
WHERE food_id IN (
  'food_oranges_raw'
);

-- Tutto il resto del Golden Set (verdure, legumi, frutta secca, pasta di
-- semola): vegetariano e vegano sì, fruttariano no (nella definizione
-- restrittiva dichiarata: non frutta fresca).
UPDATE foods_raw SET diet_compat_vegetarian = true, diet_compat_vegan = true, diet_compat_fruitarian = false
WHERE food_id IN (
  'food_almonds',
  'food_broccoli_boiled', 'food_broccoli_raw',
  'food_brussels_sprouts_boiled', 'food_brussels_sprouts_raw',
  'food_carrots_boiled', 'food_carrots_raw',
  'food_chickpeas_boiled', 'food_chickpeas_raw',
  'food_kale_raw',
  'food_kidney_beans_boiled', 'food_kidney_beans_raw',
  'food_lentils_boiled', 'food_lentils_raw',
  'food_pasta_enriched_cooked', 'food_pasta_enriched_dry',
  'food_potato_boiled_in_skin', 'food_potato_raw',
  'food_spinach_boiled', 'food_spinach_raw'
);

-- ============================================================================
-- Verifica difensiva (leggere dopo l'esecuzione -- un'eccezione qui sotto
-- significa che qualcosa non è andato come previsto, non va ignorata):
-- ============================================================================
DO $$
DECLARE
  -- Lista esplicita dei 30 food_id che questo file intende classificare
  -- (estratta leggendo gli INSERT di foods_raw già committati in questo
  -- repo -- non assunta a memoria). Verificata contro la tabella reale,
  -- non contro verification_status (il filtro dietCompatibility in
  -- lib/engine/dietTypeFilter.ts non guarda verification_status, quindi
  -- anche un alimento 'draft' deve risultare classificato qui).
  food_ids_attesi text[] := ARRAY[
    'food_almonds', 'food_beef_ground_cooked', 'food_beef_ground_raw',
    'food_beef_liver_cooked', 'food_beef_liver_raw',
    'food_broccoli_boiled', 'food_broccoli_raw',
    'food_brussels_sprouts_boiled', 'food_brussels_sprouts_raw',
    'food_carrots_boiled', 'food_carrots_raw',
    'food_chickpeas_boiled', 'food_chickpeas_raw',
    'food_egg_hard_boiled', 'food_egg_raw', 'food_kale_raw',
    'food_kidney_beans_boiled', 'food_kidney_beans_raw',
    'food_lentils_boiled', 'food_lentils_raw', 'food_milk_whole',
    'food_oranges_raw', 'food_pasta_enriched_cooked', 'food_pasta_enriched_dry',
    'food_potato_boiled_in_skin', 'food_potato_raw',
    'food_salmon_cooked', 'food_salmon_raw',
    'food_spinach_boiled', 'food_spinach_raw'
  ];
  trovati int;
  classificati int;
  non_classificati int;
  vegan_ma_non_vegetariano int;
  fruttariano_ma_non_vegano int;
BEGIN
  SELECT count(*) INTO trovati FROM foods_raw WHERE food_id = ANY(food_ids_attesi);

  SELECT count(*) INTO classificati FROM foods_raw
    WHERE food_id = ANY(food_ids_attesi)
      AND diet_compat_vegetarian IS NOT NULL
      AND diet_compat_vegan IS NOT NULL
      AND diet_compat_fruitarian IS NOT NULL;

  SELECT count(*) INTO non_classificati FROM foods_raw
    WHERE food_id = ANY(food_ids_attesi)
      AND (diet_compat_vegetarian IS NULL OR diet_compat_vegan IS NULL OR diet_compat_fruitarian IS NULL);

  -- Coerenza logica fra gli assi (vegano implica vegetariano; fruttariano
  -- implica vegano) -- se una riga viola questo, è un errore di
  -- classificazione, non un caso valido da accettare in silenzio.
  SELECT count(*) INTO vegan_ma_non_vegetariano FROM foods_raw
    WHERE diet_compat_vegan = true AND diet_compat_vegetarian = false;

  SELECT count(*) INTO fruttariano_ma_non_vegano FROM foods_raw
    WHERE diet_compat_fruitarian = true AND diet_compat_vegan = false;

  RAISE NOTICE 'food_id attesi: %, trovati in foods_raw: %, classificati su tutti e 3 gli assi: %, NON classificati: %',
    array_length(food_ids_attesi, 1), trovati, classificati, non_classificati;

  IF trovati < array_length(food_ids_attesi, 1) THEN
    RAISE EXCEPTION 'Solo %/% food_id attesi esistono in foods_raw -- probabile food_id scritto male in questo file o alimento rimosso dal Golden Set, verificare prima di procedere.', trovati, array_length(food_ids_attesi, 1);
  END IF;

  IF non_classificati > 0 THEN
    RAISE EXCEPTION 'Trovati % alimenti attesi senza classificazione dietCompatibility completa -- aggiungerli a questo file prima di considerarlo fatto, mai lasciare NULL per un alimento che dovrebbe essere classificato.', non_classificati;
  END IF;

  IF vegan_ma_non_vegetariano > 0 THEN
    RAISE EXCEPTION 'Trovate % righe con diet_compat_vegan=true e diet_compat_vegetarian=false -- incoerente (vegano implica vegetariano), correggere la classificazione.', vegan_ma_non_vegetariano;
  END IF;

  IF fruttariano_ma_non_vegano > 0 THEN
    RAISE EXCEPTION 'Trovate % righe con diet_compat_fruitarian=true e diet_compat_vegan=false -- incoerente (fruttariano implica vegano), correggere la classificazione.', fruttariano_ma_non_vegano;
  END IF;
END $$;

-- Atteso: NOTICE con "food_id attesi: 30, trovati in foods_raw: 30,
-- classificati su tutti e 3 gli assi: 30, NON classificati: 0". Se un
-- alimento è stato aggiunto al Golden Set dopo il 2026-10-11 da un'altra
-- sessione, questo file NON lo copre -- va esteso con una nuova UPDATE
-- per quell'alimento, non ignorato.
