-- ============================================================================
-- Baseline CRUDI reali per 9 alimenti del Golden Set + fattore di ritenzione
-- latte bollito
-- ============================================================================
--
-- CONTESTO: fix_baseline_cooking_state.sql ha scoperto che 7 matrici del
-- Golden Set (tubers, legumes, beef_liver, beef_ground_meat, eggs,
-- salmon_fish, pasta_enriched_wheat) avevano SOLO una riga già cotta come
-- valore salvato, nessun vero baseline crudo -- impedendo di applicare
-- correttamente qualunque fattore di ritenzione di cottura. Questo file
-- aggiunge il baseline crudo reale, sourced USDA FDC, per ciascuno dei 9
-- alimenti coinvolti (tubers=1, legumes=3, gli altri 5=1 ciascuno).
--
-- Metodologia di ricerca: delegata a 3 subagent paralleli (2026-10-10),
-- ciascuno con l'istruzione esplicita "zero dati inventati" e di dichiarare
-- gap invece di stimare. fdc.nal.usda.gov non raggiungibile direttamente in
-- questo ambiente -> dati estratti via getfoodfacts.com (mirror che cita
-- esplicitamente l'FDC ID in pagina, incrociato con foodstruct.com dove
-- indicato) e verificati contro l'FDC ID citato.
--
-- NON ancora integrato nello script Python (scripts/generate_golden_set_foods.py,
-- la fonte di verità dichiarata per golden_set_foods.sql) -- stessa scelta
-- già fatta per add_macronutrients_golden_set.sql: migrazione mirata
-- separata per velocità, da fondere nel generatore in un secondo momento se
-- si vuole mantenere l'invariante "un solo generatore".
--
-- Tutte le righe sotto: verification_status='draft' (nuovi dati, non ancora
-- promossi dal workflow draft/verified), baseline_cooking_state='raw'.
-- ============================================================================

INSERT INTO sources (id, citation) VALUES
  ('USDA_FDC', 'USDA FoodData Central, SR Legacy')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Pulizia preliminare: food_lentils_raw esisteva già come riga cruft di un
-- vecchio seed pre-Golden-Set (vedi fix_baseline_cooking_state.sql, dove è
-- stata declassata a 'draft' insieme ad altre 3). Qui viene SOSTITUITA con
-- una versione rigorosamente sourced (FDC 172420) sotto lo stesso food_id,
-- invece di convivere come duplicato ambiguo. I suoi vecchi nutrient_values
-- (fonti NULL in più campi) vengono rimossi prima dell'inserimento nuovo.
-- ----------------------------------------------------------------------------
DELETE FROM nutrient_values WHERE food_id = 'food_lentils_raw';
DELETE FROM foods_raw WHERE food_id = 'food_lentils_raw';

-- ============================================================================
-- 1) PATATE, CRUDE, CON LA BUCCIA -- FDC 170026 "Potatoes, flesh and skin, raw"
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_potato_raw', 'Patate, crude, con la buccia', 'tubers', 'raw', false, NULL, 'Solanaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, botanical_family = EXCLUDED.botanical_family, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_potato_raw', 'iron_mg', 0.81, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'zinc_mg', 0.30, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'calcium_mg', 12, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'vitamin_c_mg', 19.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'magnesium_mg', 23.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'copper_mg', 0.11, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'selenium_mcg', 0.40, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'vitamin_k_mcg', 2.00, NULL, NULL, 'USDA_FDC', 'draft'), -- fillochinone
  ('food_potato_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'), -- coerenza biologica (vegetale); zero non confermato come "zero con dati" nel record originale, stesso limite già accettato per food_chickpeas_boiled
  ('food_potato_raw', 'folate_mcg', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'energy_kcal', 77.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'protein_g', 2.05, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'fat_g', 0.090, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'carbohydrates_g', 17.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'fiber_g', 2.10, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;
-- Gap dichiarati: phytates_mg, oxalates_mg (non nel profilo SR Legacy standard consultato).

-- ============================================================================
-- 2) FAGIOLI ROSSI (KIDNEY), CRUDI, SECCHI -- FDC 175193 "Beans, kidney, all
--    types, mature seeds, raw"
-- ============================================================================
-- NOTA: esiste anche una voce più specifica "red kidney beans" (NDB 16032)
-- con valori leggermente diversi, ma il subagent non ha potuto confermarne
-- l'FDC ID da una fonte che lo citi esplicitamente -- usata la voce "all
-- types" il cui FDC ID 175193 è confermato su 2 fonti indipendenti.
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kidney_beans_raw', 'Fagioli rossi (kidney), crudi, secchi', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, botanical_family = EXCLUDED.botanical_family, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_kidney_beans_raw', 'iron_mg', 8.20, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'zinc_mg', 2.79, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'calcium_mg', 143, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_c_mg', 4.50, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'magnesium_mg', 140, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'copper_mg', 0.96, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'selenium_mcg', 3.20, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_k_mcg', 19.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'), -- stesso limite dichiarato sopra
  ('food_kidney_beans_raw', 'folate_mcg', 394, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'energy_kcal', 333, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'protein_g', 23.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'fat_g', 0.83, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'carbohydrates_g', 60.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'fiber_g', 24.9, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;
-- Gap dichiarati: phytates_mg, oxalates_mg.

-- ============================================================================
-- 3) LENTICCHIE, CRUDE, SECCHE -- FDC 172420 "Lentils, raw"
--    (sostituisce la vecchia riga cruft food_lentils_raw, vedi pulizia sopra)
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_lentils_raw', 'Lenticchie, crude, secche', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft');

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_lentils_raw', 'iron_mg', 6.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'zinc_mg', 3.27, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'calcium_mg', 35.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_c_mg', 4.50, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'magnesium_mg', 47.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'copper_mg', 0.75, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'selenium_mcg', 0.10, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_k_mcg', 5.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'), -- stesso limite dichiarato sopra
  ('food_lentils_raw', 'folate_mcg', 479, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'energy_kcal', 352, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'protein_g', 24.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'fat_g', 1.06, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'carbohydrates_g', 63.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'fiber_g', 10.7, NULL, NULL, 'USDA_FDC', 'draft');
-- Gap dichiarati: phytates_mg, oxalates_mg.

-- ============================================================================
-- 4) CECI, CRUDI, SECCHI -- FDC 173756 "Chickpeas (garbanzo beans, bengal
--    gram), mature seeds, raw"
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_chickpeas_raw', 'Ceci, crudi, secchi', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, botanical_family = EXCLUDED.botanical_family, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_chickpeas_raw', 'iron_mg', 4.31, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'zinc_mg', 2.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'calcium_mg', 57.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_c_mg', 4.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'magnesium_mg', 79.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'copper_mg', 0.66, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_k_mcg', 9.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'), -- stesso limite dichiarato sopra
  ('food_chickpeas_raw', 'folate_mcg', 557, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'energy_kcal', 378, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'protein_g', 20.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'fat_g', 6.04, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'carbohydrates_g', 63.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'fiber_g', 12.2, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;
-- Gap dichiarati: phytates_mg, oxalates_mg, selenium_mcg (fonte mostra 0 µg
-- ma il subagent non è riuscito a confermarlo come zero dichiarato con dati
-- a supporto piuttosto che campo assente -- per cautela NON inserito,
-- diversamente dal B12 dove il precedente food_chickpeas_boiled già accetta
-- questa stessa ambiguità per coerenza biologica).

-- ============================================================================
-- 5) FEGATO DI MANZO, CRUDO -- FDC 169451 "Beef, variety meats and
--    by-products, liver, raw"
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_liver_raw', 'Fegato di manzo, crudo', 'beef_liver', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_liver_raw', 'iron_mg', 4.90, NULL, NULL, 'USDA_FDC', 'draft'), -- ferro totale, la fonte SR Legacy non scompone eme/non-eme
  ('food_beef_liver_raw', 'zinc_mg', 4.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'calcium_mg', 5.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'vitamin_c_mg', 1.30, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'magnesium_mg', 18.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'copper_mg', 9.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'selenium_mcg', 39.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'vitamin_k_mcg', 3.10, NULL, NULL, 'USDA_FDC', 'draft'), -- fillochinone, non "vitamina K totale" aggregata
  ('food_beef_liver_raw', 'vitamin_b12_mcg', 59.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'folate_mcg', 290, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'energy_kcal', 135, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'protein_g', 20.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'fat_g', 3.63, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'carbohydrates_g', 3.89, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ============================================================================
-- 6) MANZO MACINATO (85% MAGRO), CRUDO -- FDC 171796 "Beef, ground, 85% lean
--    meat / 15% fat, raw"
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_ground_raw', 'Manzo macinato (85% magro), crudo', 'beef_ground_meat', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_ground_raw', 'iron_mg', 2.09, NULL, NULL, 'USDA_FDC', 'draft'), -- ferro totale, fonte non scompone eme/non-eme
  ('food_beef_ground_raw', 'zinc_mg', 4.48, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'calcium_mg', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'magnesium_mg', 18.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'copper_mg', 0.067, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'selenium_mcg', 15.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'vitamin_k_mcg', 1.30, NULL, NULL, 'USDA_FDC', 'draft'), -- fillochinone
  ('food_beef_ground_raw', 'vitamin_b12_mcg', 2.17, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'folate_mcg', 6.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'energy_kcal', 215, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'protein_g', 18.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'fat_g', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ============================================================================
-- 7) UOVO INTERO, CRUDO -- FDC 171287 "Egg, whole, raw, fresh"
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_egg_raw', 'Uovo, intero, crudo', 'eggs', 'raw', false, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_egg_raw', 'iron_mg', 1.75, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'zinc_mg', 1.29, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'calcium_mg', 56.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'magnesium_mg', 12.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'copper_mg', 0.072, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'selenium_mcg', 30.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'vitamin_k_mcg', 0.30, NULL, NULL, 'USDA_FDC', 'draft'), -- fillochinone
  ('food_egg_raw', 'vitamin_b12_mcg', 0.89, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'folate_mcg', 47.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'energy_kcal', 143, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'protein_g', 12.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'fat_g', 9.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'carbohydrates_g', 0.72, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ============================================================================
-- 8) SALMONE ATLANTICO, ALLEVATO, CRUDO -- FDC 175167 "Fish, salmon,
--    Atlantic, farmed, raw" (SR Legacy, stessa serie/metodologia della voce
--    cotta già in DB, FDC 175168 -- scelta deliberata per coerenza nel
--    calcolo di ritenzione, invece della voce Foundation Foods più recente
--    ma metodologicamente diversa e meno completa, FDC 2684441)
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_salmon_raw', 'Salmone atlantico, allevato, crudo', 'salmon_fish', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, verification_status = EXCLUDED.verification_status;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_salmon_raw', 'iron_mg', 0.34, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'zinc_mg', 0.36, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'calcium_mg', 9.00, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_c_mg', 3.90, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'magnesium_mg', 27.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'copper_mg', 0.045, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'selenium_mcg', 24.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_k_mcg', 0.50, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_b12_mcg', 3.23, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'energy_kcal', 208, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'protein_g', 20.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'fat_g', 13.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;
-- Gap dichiarato: folate_mcg non riportato dalla fonte per questa voce.

-- ============================================================================
-- 9) PASTA, SECCA, ARRICCHITA (ENRICHED), NON COTTA -- FDC 169736 "Pasta,
--    dry, enriched" (stessa serie della voce cotta già in DB, FDC 169737)
-- ============================================================================
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, is_fortified_folate) VALUES
  ('food_pasta_enriched_dry', 'Pasta, secca, arricchita (enriched), non cotta', 'pasta_enriched_wheat', 'raw', false, NULL, 'Poaceae', 'draft', true)
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id, baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron, botanical_family = EXCLUDED.botanical_family, verification_status = EXCLUDED.verification_status,
  is_fortified_folate = EXCLUDED.is_fortified_folate;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_pasta_enriched_dry', 'iron_mg', 3.30, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'zinc_mg', 1.41, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'calcium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'magnesium_mg', 53.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'copper_mg', 0.29, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'selenium_mcg', 63.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_k_mcg', 0.10, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  -- Folato totale 237 µg, di cui 219 µg acido folico SINTETICO aggiunto e
  -- solo 18 µg folato alimentare naturale -- stesso problema già
  -- documentato per la versione cotta (food_pasta_enriched_cooked, righe
  -- 781-786 di golden_set_foods.sql): la quota sintetica domina anche nella
  -- versione secca, non è un effetto della cottura. Qui si usa "total" per
  -- coerenza con calculateFolateDFE a singolo campo, stesso limite.
  ('food_pasta_enriched_dry', 'folate_mcg', 237, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'energy_kcal', 371, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'protein_g', 13.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'fat_g', 1.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'carbohydrates_g', 74.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'fiber_g', 3.20, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ============================================================================
-- RETENTION FACTOR: latte, bollitura -- unico risultato "solido" del giro di
-- ricerca sulle 4 categorie sane (latte/carote/broccoli/mandorle, vedi
-- discussione con l'utente). USDA Release 6, Food Group 01 "Dairy and Egg
-- Products", p. 5.
--
-- AMBIGUITA' DICHIARATA: non esiste una riga "boiled/bollito" per il latte,
-- solo voci per DURATA di riscaldamento (10min/30min/1h/reheated), senza che
-- il testo le equipari esplicitamente a "bollitura". Calcio/ferro/zinco
-- sono però IDENTICI (100%) in tutte e 4 le varianti di durata -- quindi la
-- scelta della durata non cambia questi 3 valori, a differenza di B12/
-- folato/vitamina C (che variano molto per durata e NON vengono inseriti
-- qui per questo motivo: la scelta sarebbe troppo arbitraria).
-- ============================================================================
INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('dairy_milk', 'boiled', 'iron',    1.00, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('dairy_milk', 'boiled', 'zinc',    1.00, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('dairy_milk', 'boiled', 'calcium', 1.00, NULL, NULL, 'USDA_RETN06', 'draft')
ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;
-- Gap dichiarati (non inseriti, dipendenti dalla durata di bollitura non
-- specificata dalla fonte come "boiling" vero e proprio): vitamin_b12_mcg,
-- folate_mcg, vitamin_c_mg per dairy_milk+boiled.

-- ============================================================================
-- GAP DICHIARATI, NON INSERITI (ricerca fatta, nessuna fonte food-specifica
-- trovata con rigore sufficiente -- vedi report completo del subagent):
--
-- - CARROTS (boiled/steamed/roasted): nessuna riga USDA Release 6 dedicata
--   alle carote -- solo una categoria generica cross-alimento "VEG,ROOTS,ETC"
--   (include anche rape/barbabietole/pastinaca). Nessun dato "roasted"
--   trovato in nessuna fonte. Un paper potenzialmente utile (Masrizal et al.
--   1997) non è verificabile (full-text non accessibile, non conferma se le
--   carote fossero tra le verdure testate).
-- - BROCCOLI (boiled/steamed): stessa situazione -- nessuna riga USDA
--   dedicata, solo categoria generica "VEG,OTHER". Un paper broccoli-
--   specifico trovato (Viroli et al. 2023) è stato ESCLUSO: valori assoluti
--   di ferro/zinco ~100x il range noto, metodi analitici citati originati
--   per analisi del suolo, non validati per alimenti -- segnale di errore
--   metodologico o di unità, non attendibile.
-- - NUTS_ALMONDS (roasted): nessuna riga USDA almond-specifica (la parola
--   "almond" non compare nel documento Release 6) -- solo categoria
--   generica "NUTS,ROASTED". Una corroborazione qualitativa (Almond Board,
--   confronto SR Legacy crude vs tostate) non è un vero studio di
--   ritenzione (voci indipendenti del DB, non un esperimento before/after
--   sullo stesso lotto, nessuna correzione per variazione di umidità/peso).
--
-- In tutti e 3 i casi esiste un dato USDA Release 6 generico (categoria di
-- verdure/noci più ampia, non specifico per l'alimento) che il team può
-- scegliere di adottare come inferenza dichiarata -- non inserito qui senza
-- una decisione esplicita, per coerenza con lo standard di rigore già
-- applicato alle altre matrici di questo progetto (dove si è sempre usata
-- una fonte food-specifica, mai una categoria generica cross-alimento).
-- ============================================================================
