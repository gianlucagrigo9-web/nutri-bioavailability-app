-- ============================================================================
-- Golden Set: primi alimenti reali, sourced riga per riga (2026-10-09)
-- ============================================================================
--
-- 19 alimenti, ciascuno con composizione letta DIRETTAMENTE da USDA
-- FoodData Central (endpoint fdc.nal.usda.gov/portal-data/external/<FDC_ID>,
-- stesso dataset della pagina food-details ufficiale, usato perche' la SPA
-- Angular delle pagine food-details non e' fetchable direttamente da questo
-- ambiente) in questa sessione, con l'FDC ID citato per ogni riga cosi' da
-- poter essere riverificato in qualunque momento.
--
-- Ossalati e fitati (assenti da USDA FDC) aggiunti per 3 alimenti specifici
-- da fonti di letteratura dedicate (vedi sources sotto); dove la fonte non
-- coincideva per stato di cottura (es. fitati lenticchie: trovato solo per
-- crude, non per bollite) o era discordante tra piu' fonti senza una scelta
-- ovvia (ossalati spinaci: Noonan&Savage 1999 vs Siener 2006), il dato NON
-- e' stato inserito -- resta un gap dichiarato, non un numero indovinato.
--
-- verification_status = 'draft' per TUTTO (coerente con la convenzione del
-- pannello admin: 'draft' finche' un revisore umano non promuove a
-- 'verified' dopo un controllo a campione -- anche se i valori sono stati
-- letti da una fonte ufficiale, non e' stato ancora fatto quel secondo
-- controllo da parte dell'utente/esperto di dominio).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Nuove matrici (food_matrices_master) necessarie per i nuovi alimenti
-- ----------------------------------------------------------------------------
INSERT INTO food_matrices_master (matrix_id, description_it) VALUES
  ('dairy_milk', 'Latte e derivati, latte vaccino'),
  ('carrots', 'Carote'),
  ('beef_liver', 'Fegato di manzo'),
  ('beef_ground_meat', 'Manzo macinato'),
  ('broccoli', 'Broccoli'),
  ('nuts_almonds', 'Mandorle'),
  ('citrus_oranges', 'Arance'),
  ('eggs', 'Uova'),
  ('salmon_fish', 'Salmone')
ON CONFLICT (matrix_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Nuove fonti di letteratura (ossalati/fitati; USDA_FDC e' gia' un placeholder
-- generico usato dall'engine per magnesio/rame/selenio/iodio/vit.K, vedi
-- PRD.md §4.5 -- qui lo aggiungiamo anche alla tabella sources se non c'era)
-- ----------------------------------------------------------------------------
INSERT INTO sources (id, citation, url) VALUES
  ('USDA_FDC', 'USDA FoodData Central (fdc.nal.usda.gov), U.S. Department of Agriculture, Agricultural Research Service.', 'https://fdc.nal.usda.gov'),
  ('NOONAN_SAVAGE_1999_APJCN', 'Noonan SC, Savage GP. Oxalate content of foods and its effect on humans. Asia Pac J Clin Nutr. 1999;8(1):64-74. [spinaci crude: range 320-1260 mg/100g, media 970 mg/100g peso fresco, ossalato totale]', 'https://apjcn.qdu.edu.cn/8_1_5.pdf'),
  ('ERDOGAN_ONAR_2012_JFDA', 'Erdogan BY, Onar AN. Determination of nitrates, nitrites and oxalates in kale and sultana pea by capillary electrophoresis. J Food Drug Anal. 2012;20(2):14. [kale: 2970+/-672 mg/kg = 297+/-67.2 mg/100g, conversione aritmetica kg->100g]', 'https://doi.org/10.6227/jfda.2012200215'),
  ('ZIA_UR_REHMAN_2002_PJSIR', 'Zia-ur-Rehman, Salariya AM, Zafar SI. Effect of different soaking and cooking methods on physical characteristics, phytic acid content and protein digestibility of red kidney beans. Pak J Sci Ind Res. 2002;45(1):41-45. [fagioli rossi: crudo 1084 mg/100g, bollito (cottura ordinaria) 805 mg/100g]', 'https://v2.pjsir.org/index.php/biological-sciences/article/download/1741/1075/2257')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url = EXCLUDED.url;

-- ----------------------------------------------------------------------------
-- ALTER TABLE: colonne categoriche aggiunte al modello dati dopo la prima
-- stesura di foods_raw (carotenoid_matrix_state, zinc_bioaccessibility_bucket,
-- is_fortified_folate) -- vedi types.ts. Con CHECK, non un semplice text
-- libero: regola 'architettura difensiva', niente valori fuori enum scritti
-- per errore di digitazione nel pannello admin o in un futuro script.
-- ----------------------------------------------------------------------------
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS carotenoid_matrix_state text;
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS zinc_bioaccessibility_bucket text DEFAULT 'none';
ALTER TABLE foods_raw ADD COLUMN IF NOT EXISTS is_fortified_folate boolean DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'foods_raw_carotenoid_matrix_state_check') THEN
    ALTER TABLE foods_raw ADD CONSTRAINT foods_raw_carotenoid_matrix_state_check
      CHECK (carotenoid_matrix_state IS NULL OR carotenoid_matrix_state IN ('raw_intact', 'cooked_or_disrupted'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'foods_raw_zinc_bioaccessibility_bucket_check') THEN
    ALTER TABLE foods_raw ADD CONSTRAINT foods_raw_zinc_bioaccessibility_bucket_check
      CHECK (zinc_bioaccessibility_bucket IN ('none', 'brussels_sprouts_boiled', 'brussels_sprouts_steamed'));
  END IF;
END $$;

-- NOTA ARCHITETTURALE (dichiarata, non implementata qui): queste tre colonne
-- sono attributi per-alimento-CONGELATI-nello-stato-di-cottura (come
-- is_heme_iron/matrix_category_calcium), non numeri che CookingTransformationEngine
-- possa derivare da un retention factor. Per questo i cavoletti di Bruxelles
-- 'al vapore' NON hanno una riga propria in questo Golden Set: nessuna misura
-- FDC diretta esiste per quello stato (FDC non ha una voce 'steamed' per i
-- cavoletti), e derivare una riga finta applicando il retention factor di
-- Doniec 2022 al solo ferro/zinco crudo, lasciando tutto il resto nullo,
-- mischierebbe dato misurato e dato simulato nella stessa riga foods_raw --
-- disonesto secondo la regola 'zero dati inventati'. Resta quindi un gap
-- dichiarato: il layer di bioaccessibilita' per i cavoletti al vapore e'
-- oggi testato solo su dati sintetici (tests/engines.test.ts), non ancora
-- su un alimento reale del Golden Set.

-- ----------------------------------------------------------------------------
-- Alimenti (foods_raw) + valori nutrizionali (nutrient_values)
-- ----------------------------------------------------------------------------
-- Spinaci, crudi  |  FDC: Spinach, raw (FDC ID 168462)
-- https://fdc.nal.usda.gov/food-details/168462/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_spinach_raw', 'Spinaci, crudi', 'leafy_greens', false, 'high_oxalate', 'Amaranthaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_spinach_raw', 'iron_mg', 2.71, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'zinc_mg', 0.53, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'calcium_mg', 99, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'vitamin_c_mg', 28.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'magnesium_mg', 79.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'copper_mg', 0.13, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'selenium_mcg', 1.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'vitamin_k_mcg', 483, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'folate_mcg', 194, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'beta_carotene_mcg', 5630, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'oxalates_mg', 970, 320, 1260, 'NOONAN_SAVAGE_1999_APJCN', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Spinaci, bolliti e scolati  |  FDC: Spinach, cooked, boiled, drained, without salt (FDC ID 168463)
-- https://fdc.nal.usda.gov/food-details/168463/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_spinach_boiled', 'Spinaci, bolliti e scolati', 'leafy_greens', false, 'high_oxalate', 'Amaranthaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_spinach_boiled', 'iron_mg', 3.57, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'zinc_mg', 0.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'calcium_mg', 136, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'vitamin_c_mg', 9.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'magnesium_mg', 87.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'copper_mg', 0.174, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'selenium_mcg', 1.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'vitamin_k_mcg', 494, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'folate_mcg', 146, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'beta_carotene_mcg', 6290, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavolo kale, crudo  |  FDC: Kale, raw (FDC ID 323505)
-- https://fdc.nal.usda.gov/food-details/323505/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kale_raw', 'Cavolo kale, crudo', 'leafy_greens', false, 'low_oxalate', 'Brassicaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_kale_raw', 'iron_mg', 1.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'zinc_mg', 0.39, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'calcium_mg', 254, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'vitamin_c_mg', 93.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'magnesium_mg', 32.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'copper_mg', 0.053, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'folate_mcg', 62, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'beta_carotene_mcg', 2870, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'other_provitamin_a_carotenoids_mcg', 27, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'oxalates_mg', 297, 229.8, 364.2, 'ERDOGAN_ONAR_2012_JFDA', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Latte vaccino intero (3.25% grassi, vitamina D aggiunta)  |  FDC: Milk, whole, 3.25% milkfat, with added vitamin D (FDC ID 322892)
-- https://fdc.nal.usda.gov/food-details/322892/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_milk_whole', 'Latte vaccino intero (3.25% grassi, vitamina D aggiunta)', 'dairy_milk', false, 'medium_oxalate', NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_milk_whole', 'calcium_mg', 123, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fagioli rossi (kidney), bolliti  |  FDC: Beans, kidney, red, mature seeds, cooked, boiled, without salt (FDC ID 175194)
-- https://fdc.nal.usda.gov/food-details/175194/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kidney_beans_boiled', 'Fagioli rossi (kidney), bolliti', 'legumes', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_kidney_beans_boiled', 'iron_mg', 2.94, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'zinc_mg', 1.07, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'calcium_mg', 28, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'vitamin_c_mg', 1.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'magnesium_mg', 45.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'copper_mg', 0.242, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'selenium_mcg', 1.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'vitamin_k_mcg', 8.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'folate_mcg', 130, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'phytates_mg', 805, NULL, NULL, 'ZIA_UR_REHMAN_2002_PJSIR', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Lenticchie, bollite  |  FDC: Lentils, mature seeds, cooked, boiled, without salt (FDC ID 172421)
-- https://fdc.nal.usda.gov/food-details/172421/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_lentils_boiled', 'Lenticchie, bollite', 'legumes', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_lentils_boiled', 'iron_mg', 3.33, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'zinc_mg', 1.27, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'calcium_mg', 19, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'vitamin_c_mg', 1.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'magnesium_mg', 36.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'copper_mg', 0.251, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'selenium_mcg', 2.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'vitamin_k_mcg', 1.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'folate_mcg', 181, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Patate, bollite con la buccia  |  FDC: Potatoes, boiled, cooked in skin, flesh, without salt (FDC ID 170438)
-- https://fdc.nal.usda.gov/food-details/170438/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_potato_boiled_in_skin', 'Patate, bollite con la buccia', 'tubers', false, NULL, 'Solanaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_potato_boiled_in_skin', 'iron_mg', 0.31, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'zinc_mg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'calcium_mg', 5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'vitamin_c_mg', 13.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'magnesium_mg', 22.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'copper_mg', 0.188, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'selenium_mcg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'vitamin_k_mcg', 2.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'folate_mcg', 10, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'beta_carotene_mcg', 2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Carote, crude  |  FDC: Carrots, raw (FDC ID 170393)
-- https://fdc.nal.usda.gov/food-details/170393/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_carrots_raw', 'Carote, crude', 'carrots', false, NULL, 'Apiaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_carrots_raw', 'iron_mg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'zinc_mg', 0.24, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'calcium_mg', 33, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'vitamin_c_mg', 5.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'magnesium_mg', 12.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'copper_mg', 0.045, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'selenium_mcg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'vitamin_k_mcg', 13.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'folate_mcg', 19, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'beta_carotene_mcg', 8280, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'other_provitamin_a_carotenoids_mcg', 3480, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Carote, bollite e scolate  |  FDC: Carrots, cooked, boiled, drained, without salt (FDC ID 170394)
-- https://fdc.nal.usda.gov/food-details/170394/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_carrots_boiled', 'Carote, bollite e scolate', 'carrots', false, NULL, 'Apiaceae', 'draft', 'cooked_or_disrupted')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_carrots_boiled', 'iron_mg', 0.34, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'zinc_mg', 0.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'calcium_mg', 30, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'vitamin_c_mg', 3.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'magnesium_mg', 10.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'copper_mg', 0.017, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'selenium_mcg', 0.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'vitamin_k_mcg', 13.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'folate_mcg', 14, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'beta_carotene_mcg', 8330, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'other_provitamin_a_carotenoids_mcg', 3780, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavoletti di Bruxelles, crudi  |  FDC: Brussels sprouts, raw (FDC ID 170383)
-- https://fdc.nal.usda.gov/food-details/170383/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, zinc_bioaccessibility_bucket) VALUES
  ('food_brussels_sprouts_raw', 'Cavoletti di Bruxelles, crudi', 'crucifere_cavoletti_bruxelles', false, NULL, 'Brassicaceae', 'draft', 'none')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  zinc_bioaccessibility_bucket = EXCLUDED.zinc_bioaccessibility_bucket;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_brussels_sprouts_raw', 'iron_mg', 1.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'zinc_mg', 0.42, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'calcium_mg', 42, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'vitamin_c_mg', 85.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'magnesium_mg', 23.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'copper_mg', 0.07, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'selenium_mcg', 1.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'vitamin_k_mcg', 177, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'folate_mcg', 61, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'beta_carotene_mcg', 450, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'other_provitamin_a_carotenoids_mcg', 6, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavoletti di Bruxelles, bolliti e scolati  |  FDC: Brussels sprouts, cooked, boiled, drained, without salt (FDC ID 169971)
-- https://fdc.nal.usda.gov/food-details/169971/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, zinc_bioaccessibility_bucket) VALUES
  ('food_brussels_sprouts_boiled', 'Cavoletti di Bruxelles, bolliti e scolati', 'crucifere_cavoletti_bruxelles', false, NULL, 'Brassicaceae', 'draft', 'brussels_sprouts_boiled')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  zinc_bioaccessibility_bucket = EXCLUDED.zinc_bioaccessibility_bucket;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_brussels_sprouts_boiled', 'iron_mg', 1.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'zinc_mg', 0.33, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'calcium_mg', 36, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'vitamin_c_mg', 62.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'magnesium_mg', 20.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'copper_mg', 0.083, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'selenium_mcg', 1.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'vitamin_k_mcg', 140, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'folate_mcg', 60, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fegato di manzo, cotto (brasato)  |  FDC: Beef, variety meats and by-products, liver, cooked, braised (FDC ID 168626)
-- https://fdc.nal.usda.gov/food-details/168626/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_liver_cooked', 'Fegato di manzo, cotto (brasato)', 'beef_liver', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_liver_cooked', 'iron_mg', 6.54, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'zinc_mg', 5.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'calcium_mg', 6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'vitamin_c_mg', 1.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'magnesium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'copper_mg', 14.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'selenium_mcg', 36.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'vitamin_k_mcg', 3.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'vitamin_b12_mcg', 70.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'folate_mcg', 253, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'beta_carotene_mcg', 162, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Manzo macinato (85% magro), cotto alla griglia  |  FDC: Beef, ground, 85% lean meat / 15% fat, patty, cooked, broiled (FDC ID 174032)
-- https://fdc.nal.usda.gov/food-details/174032/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_ground_cooked', 'Manzo macinato (85% magro), cotto alla griglia', 'beef_ground_meat', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_ground_cooked', 'iron_mg', 2.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'zinc_mg', 6.31, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'calcium_mg', 18, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'magnesium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'copper_mg', 0.085, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'selenium_mcg', 21.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'vitamin_k_mcg', 1.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'vitamin_b12_mcg', 2.64, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'folate_mcg', 9, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Broccoli, crudi  |  FDC: Broccoli, raw (FDC ID 170379)
-- https://fdc.nal.usda.gov/food-details/170379/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_broccoli_raw', 'Broccoli, crudi', 'broccoli', false, NULL, 'Brassicaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_broccoli_raw', 'iron_mg', 0.73, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'zinc_mg', 0.41, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'calcium_mg', 47, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'vitamin_c_mg', 89.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'magnesium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'copper_mg', 0.049, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'selenium_mcg', 2.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'vitamin_k_mcg', 102, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'folate_mcg', 63, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'beta_carotene_mcg', 361, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'other_provitamin_a_carotenoids_mcg', 26, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Mandorle, secche, non salate  |  FDC: Nuts, almonds (FDC ID 170567)
-- https://fdc.nal.usda.gov/food-details/170567/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_almonds', 'Mandorle, secche, non salate', 'nuts_almonds', false, NULL, 'Rosaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_almonds', 'iron_mg', 3.71, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'zinc_mg', 3.12, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'calcium_mg', 269, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'magnesium_mg', 270.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'copper_mg', 1.03, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'selenium_mcg', 4.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'vitamin_k_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'folate_mcg', 44, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Arance, crude, tutte le varieta' commerciali  |  FDC: Oranges, raw, all commercial varieties (FDC ID 169097)
-- https://fdc.nal.usda.gov/food-details/169097/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_oranges_raw', 'Arance, crude, tutte le varieta'' commerciali', 'citrus_oranges', false, NULL, 'Rutaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_oranges_raw', 'iron_mg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'zinc_mg', 0.07, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'calcium_mg', 40, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'vitamin_c_mg', 53.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'magnesium_mg', 10.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'copper_mg', 0.045, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'selenium_mcg', 0.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'vitamin_k_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'folate_mcg', 30, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'beta_carotene_mcg', 71, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'other_provitamin_a_carotenoids_mcg', 127, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Uovo, intero, cotto (sodo)  |  FDC: Egg, whole, cooked, hard-boiled (FDC ID 173424)
-- https://fdc.nal.usda.gov/food-details/173424/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_egg_hard_boiled', 'Uovo, intero, cotto (sodo)', 'eggs', false, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_egg_hard_boiled', 'iron_mg', 1.19, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'zinc_mg', 1.05, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'calcium_mg', 50, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'magnesium_mg', 10.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'copper_mg', 0.013, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'selenium_mcg', 30.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'vitamin_k_mcg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'vitamin_b12_mcg', 1.11, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'folate_mcg', 44, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Salmone atlantico, allevato, cotto (calore secco)  |  FDC: Fish, salmon, Atlantic, farmed, cooked, dry heat (FDC ID 175168)
-- https://fdc.nal.usda.gov/food-details/175168/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_salmon_cooked', 'Salmone atlantico, allevato, cotto (calore secco)', 'salmon_fish', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_salmon_cooked', 'iron_mg', 0.34, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'zinc_mg', 0.43, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'calcium_mg', 15, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'vitamin_c_mg', 3.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'magnesium_mg', 30.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'copper_mg', 0.049, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'selenium_mcg', 41.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'vitamin_k_mcg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'vitamin_b12_mcg', 2.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'folate_mcg', 34, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Ceci, semi maturi, bolliti, senza sale  |  FDC: Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt (FDC ID 173757)
-- https://fdc.nal.usda.gov/food-details/173757/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_chickpeas_boiled', 'Ceci, semi maturi, bolliti, senza sale', 'legumes', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_chickpeas_boiled', 'iron_mg', 2.89, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'zinc_mg', 1.53, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'calcium_mg', 49, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'vitamin_c_mg', 1.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'magnesium_mg', 48.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'copper_mg', 0.352, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'selenium_mcg', 3.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'vitamin_k_mcg', 4.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'folate_mcg', 172, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- ----------------------------------------------------------------------------
-- Gap dichiarati in questo giro di popolamento (NON inseriti, per onesta'):
-- ----------------------------------------------------------------------------
-- - food_lentils_boiled.phytates_mg: trovato un valore SOLO per lenticchie
--   CRUDE/secche (233.04 mg/100g, Fouad AA, Rehab FMA. Acta Sci Pol Technol
--   Aliment. 2015;14(3):233-246), non per bollite -- stato di cottura non
--   corrispondente al food_id di questa riga. Non inserito.
-- - food_spinach_raw.oxalates_mg: Siener R et al. Food Chemistry 2006;98:220-224
--   riporta un valore discordante (totale 1959 mg/100g, solubile 1029 mg/100g)
--   rispetto a Noonan & Savage 1999 (970 mg/100g, usato qui). Non e' stata
--   fatta una scelta tra le due: il vincolo UNIQUE(food_id,nutrient_code) non
--   permette di inserire entrambe come righe separate. Decisione rimandata a
--   un controllo umano (es. verificare quale metodica analitica e' piu'
--   comparabile al resto del Golden Set).
-- - food_kale_raw: selenium_mcg, vitamin_k_mcg, vitamin_b12_mcg non recuperati
--   (fetch troncato in questa sessione, non necessariamente assenti dalla
--   fonte) -- da ri-tentare in una sessione futura.
-- - food_milk_whole: solo calcium_mg confermato (stesso motivo: fetch troncato
--   su un record molto verboso) -- iron/zinc/vitC/magnesium/copper/selenium/
--   vitamin_k/vitamin_b12/folate da ri-tentare.
-- - Nessun alimento fortificato con acido folico (es. cereali da colazione)
--   e' stato inserito in questo giro: le pagine FDC dei candidati individuati
--   (Kellogg's Corn Flakes, NDB 08020) non sono state raggiungibili in questa
--   sessione -- is_fortified_folate resta quindi non esercitato da un alimento
--   reale nel Golden Set (solo da test sintetici).
-- - macs_mg, polyphenols_mg: non ricercati in questo giro per nessuno dei 13
--   alimenti (richiederebbero rispettivamente dati tipo Sonnenburg 2016 o un
--   database come Phenol-Explorer, non ancora consultati per questi alimenti
--   specifici) -- gap preesistente, non introdotto ora.
-- - iodine_mcg: non trovato per NESSUNO dei 19 alimenti (USDA FDC non riporta
--   lo iodio per la maggior parte delle voci standard) -- confirma il gap gia'
--   dichiarato in PRD.md §4.0/§4.5.
-- - food_broccoli_raw: manca la controparte 'cotta' (Broccoli, cooked, boiled,
--   drained, without salt, FRESCO non surgelato). Due FDC ID tentati in questa
--   sessione erano sbagliati (170380 = la versione SURGELATA dello stesso
--   piatto, non quella fresca; 170378 = Broadbeans/fave, un alimento diverso).
--   L'NDB legacy 11091 (citato su recipal.com) non e' stato mappato a un FDC ID
--   verificabile via web search in questa sessione -- da ri-tentare.
-- - food_chickpeas_boiled.vitamin_b12_mcg: il record FDC segnala esplicitamente
--   0 data points per questo campo (diverso dal B12=0.00 con dati reali a
--   supporto degli altri alimenti vegetali di questo set) -- inserito comunque
--   come 0.00/USDA_FDC per coerenza biologica (i legumi non contengono B12),
--   ma il limite metodologico specifico di questo record resta dichiarato qui.
