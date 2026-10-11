-- ============================================================================
-- Aggiunge fdc_id/fdc_name a foods_raw e li popola per i 30 alimenti del
-- Golden Set, come prerequisito del punto 15 (Fase 4: processo di verifica
-- batch ripetibile) -- PRD.md §9.
-- ============================================================================
--
-- PERCHE': scoperto mentre si progettava lo script batch di verifica
-- (`scripts/verify_golden_set_batch.ts`) che `foods_raw` NON ha mai avuto
-- una colonna fdc_id -- l'unico posto dove questa informazione esisteva
-- era il dizionario Python `scripts/generate_golden_set_foods.py`, usato
-- una tantum per generare l'INSERT iniziale e mai più consultato a runtime.
-- Senza fdc_id persistito nel DB, un batch di verifica non puo' sapere
-- programmaticamente quale record USDA FDC ri-scaricare per un dato
-- food_id -- dovrebbe rileggere un file esterno fragile (rischio di
-- disallineamento fra script e DB), esattamente il tipo di problema che
-- "zero dati inventati / architettura difensiva" impone di evitare.
--
-- Questa migrazione rende il DB stesso autosufficiente per la
-- tracciabilita' della fonte USDA, invece di dipendere da uno script
-- esterno non più aggiornato dopo la generazione iniziale.
--
-- Colonne aggiunte (entrambe NULLABLE -- un alimento senza fonte USDA FDC,
-- es. uno sourced solo da letteratura, legittimamente non ha un fdc_id):
--   fdc_id   INTEGER  -- l'FDC ID numerico ufficiale (fdc.nal.usda.gov)
--   fdc_name TEXT     -- il "description" esatto del record FDC, per
--                         leggibilita' umana nei report e nei log
--
-- Valori di backfill: estratti meccanicamente (regex, non trascritti a
-- mano) da scripts/generate_golden_set_foods.py il 2026-10-11 -- 30
-- coppie food_id/fdc_id/fdc_name trovate nel file. Alcuni di questi
-- food_id (es. food_potato_raw, food_kidney_beans_raw, ...) sono righe
-- "crude" usate SOLO come base di calcolo per i fattori di ritenzione
-- (non promosse/non visibili come alimenti separati in UI, stesso
-- pattern di food_broccoli_boiled) -- l'UPDATE qui sotto e' comunque
-- sicuro: se una di queste righe non esiste in foods_raw, l'UPDATE
-- semplicemente non tocca nulla per quel food_id (nessun errore), e la
-- verifica difensiva alla fine conta esplicitamente quante righe sono
-- state aggiornate per davvero, senza assumere che tutte e 30 esistano.
-- ============================================================================

ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS fdc_id INTEGER;
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS fdc_name TEXT;

UPDATE foods_raw SET fdc_id = v.fdc_id, fdc_name = v.fdc_name
FROM (VALUES
  ('food_spinach_raw', 168462, 'Spinach, raw'),
  ('food_spinach_boiled', 168463, 'Spinach, cooked, boiled, drained, without salt'),
  ('food_kale_raw', 323505, 'Kale, raw'),
  ('food_milk_whole', 322892, 'Milk, whole, 3.25% milkfat, with added vitamin D'),
  ('food_kidney_beans_boiled', 175194, 'Beans, kidney, red, mature seeds, cooked, boiled, without salt'),
  ('food_lentils_boiled', 172421, 'Lentils, mature seeds, cooked, boiled, without salt'),
  ('food_potato_boiled_in_skin', 170438, 'Potatoes, boiled, cooked in skin, flesh, without salt'),
  ('food_carrots_raw', 170393, 'Carrots, raw'),
  ('food_carrots_boiled', 170394, 'Carrots, cooked, boiled, drained, without salt'),
  ('food_brussels_sprouts_raw', 170383, 'Brussels sprouts, raw'),
  ('food_brussels_sprouts_boiled', 169971, 'Brussels sprouts, cooked, boiled, drained, without salt'),
  ('food_beef_liver_cooked', 168626, 'Beef, variety meats and by-products, liver, cooked, braised'),
  ('food_beef_ground_cooked', 174032, 'Beef, ground, 85% lean meat / 15% fat, patty, cooked, broiled'),
  ('food_broccoli_raw', 170379, 'Broccoli, raw'),
  ('food_broccoli_boiled', 169967, 'Broccoli, cooked, boiled, drained, without salt'),
  ('food_almonds', 170567, 'Nuts, almonds'),
  ('food_oranges_raw', 169097, 'Oranges, raw, all commercial varieties'),
  ('food_egg_hard_boiled', 173424, 'Egg, whole, cooked, hard-boiled'),
  ('food_salmon_cooked', 175168, 'Fish, salmon, Atlantic, farmed, cooked, dry heat'),
  ('food_chickpeas_boiled', 173757, 'Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt'),
  ('food_pasta_enriched_cooked', 169737, 'Pasta, cooked, enriched, without added salt'),
  ('food_potato_raw', 170026, 'Potatoes, flesh and skin, raw'),
  ('food_kidney_beans_raw', 175193, 'Beans, kidney, all types, mature seeds, raw'),
  ('food_lentils_raw', 172420, 'Lentils, raw'),
  ('food_chickpeas_raw', 173756, 'Chickpeas (garbanzo beans, bengal gram), mature seeds, raw'),
  ('food_beef_liver_raw', 169451, 'Beef, variety meats and by-products, liver, raw'),
  ('food_beef_ground_raw', 171796, 'Beef, ground, 85% lean meat / 15% fat, raw'),
  ('food_egg_raw', 171287, 'Egg, whole, raw, fresh'),
  ('food_salmon_raw', 175167, 'Fish, salmon, Atlantic, farmed, raw'),
  ('food_pasta_enriched_dry', 169736, 'Pasta, dry, enriched')
) AS v(food_id, fdc_id, fdc_name)
WHERE foods_raw.food_id = v.food_id;

-- Verifica difensiva: NON assume che tutte e 30 le righe esistano in
-- foods_raw (alcune sono note per essere solo basi di calcolo interne) --
-- conta e riporta esplicitamente quante sono state trovate/aggiornate,
-- e segnala se foods_raw ha righe CON source USDA_FDC note ma che sono
-- rimaste senza fdc_id dopo il backfill (sintomo di un food_id scritto
-- diversamente fra DB e generatore Python -- da indagare, non da
-- ignorare).
DO $$
DECLARE
  updated_count INTEGER;
  still_missing TEXT;
BEGIN
  SELECT count(*) INTO updated_count FROM foods_raw WHERE fdc_id IS NOT NULL;
  RAISE NOTICE 'Righe foods_raw con fdc_id popolato dopo il backfill: %', updated_count;

  SELECT string_agg(DISTINCT nv.food_id, ', ') INTO still_missing
  FROM nutrient_values nv
  JOIN foods_raw fr ON fr.food_id = nv.food_id
  WHERE nv.source_id = 'USDA_FDC' AND fr.fdc_id IS NULL;

  IF still_missing IS NOT NULL THEN
    RAISE NOTICE 'ATTENZIONE -- alimenti con righe nutrient_values source_id=USDA_FDC ma SENZA fdc_id dopo il backfill: %', still_missing;
  END IF;
END $$;
