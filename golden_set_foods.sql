-- ============================================================================
-- Golden Set: primi alimenti reali, sourced riga per riga (2026-10-09)
-- ============================================================================
--
-- 30 alimenti, ciascuno con composizione letta DIRETTAMENTE da USDA
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
  ('salmon_fish', 'Salmone'),
  ('pasta_enriched_wheat', 'Pasta di grano, arricchita (enriched)'),
  ('leafy_greens', 'Verdure a foglia verde'),
  ('legumes', 'Legumi secchi (fagioli, lenticchie, piselli, ceci)'),
  ('tubers', 'Tuberi (patate)'),
  ('crucifere_cavoletti_bruxelles', 'Cavoletti di Bruxelles')
ON CONFLICT (matrix_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Nuove fonti di letteratura (ossalati/fitati; USDA_FDC e' gia' un placeholder
-- generico usato dall'engine per magnesio/rame/selenio/iodio/vit.K, vedi
-- docs/PRD.md §4.5 -- qui lo aggiungiamo anche alla tabella sources se non c'era)
-- ----------------------------------------------------------------------------
INSERT INTO sources (id, citation, url_or_doi) VALUES
  ('USDA_FDC', 'USDA FoodData Central (fdc.nal.usda.gov), U.S. Department of Agriculture, Agricultural Research Service.', 'https://fdc.nal.usda.gov'),
  ('NOONAN_SAVAGE_1999_APJCN', 'Noonan SC, Savage GP. Oxalate content of foods and its effect on humans. Asia Pac J Clin Nutr. 1999;8(1):64-74. [spinaci crude: range 320-1260 mg/100g, media 970 mg/100g peso fresco, ossalato totale]', 'https://apjcn.qdu.edu.cn/8_1_5.pdf'),
  ('ERDOGAN_ONAR_2012_JFDA', 'Erdogan BY, Onar AN. Determination of nitrates, nitrites and oxalates in kale and sultana pea by capillary electrophoresis. J Food Drug Anal. 2012;20(2):14. [kale: 2970+/-672 mg/kg = 297+/-67.2 mg/100g, conversione aritmetica kg->100g]', 'https://doi.org/10.6227/jfda.2012200215'),
  ('ZIA_UR_REHMAN_2002_PJSIR', 'Zia-ur-Rehman, Salariya AM, Zafar SI. Effect of different soaking and cooking methods on physical characteristics, phytic acid content and protein digestibility of red kidney beans. Pak J Sci Ind Res. 2002;45(1):41-45. [fagioli rossi: crudo 1084 mg/100g, bollito (cottura ordinaria) 805 mg/100g]', 'https://v2.pjsir.org/index.php/biological-sciences/article/download/1741/1075/2257'),
  ('USDA_RETN06', 'USDA Table of Nutrient Retention Factors, Release 6 (2007). Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034', 'https://www.ars.usda.gov/ARSUserFiles/80400535/Data/retn/retn06.pdf'),
  ('DONIEC_2022_MOLECULES', 'Doniec J, Florkiewicz A, Duliński R, Filipiak-Florkiewicz A. Impact of Hydrothermal Treatments on Nutritional Value and Mineral Bioaccessibility of Brussels Sprouts (Brassica oleracea var. gemmifera). Molecules. 2022;27(6):1861.', 'https://doi.org/10.3390/molecules27061861'),
  ('SIENER_2006_FOODCHEM', 'Siener R, Hönow R, Seidler A, Voss S, Hesse A. Oxalate contents of species of the Polygonaceae, Amaranthaceae and Chenopodiaceae families. Food Chemistry. 2006;98(2):220-224. [spinaci: ossalato totale 1959 mg/100g, solubile 1029 mg/100g -- citazione di seconda mano, testo completo non letto direttamente per paywall]', 'https://doi.org/10.1016/j.foodchem.2005.05.079'),
  ('DERIVED_FDC_RAW_COOKED_RATIO', 'Metodo interno (non letteratura): fattore di ritenzione = valore_cotto_per_100g / valore_crudo_per_100g, da coppie di alimenti Golden Set misurati indipendentemente da USDA FoodData Central con lo stesso metodo di cottura. Coppie usate finora: broccoli (FDC 170379 crudo / 169967 bolliti), carote (FDC 170393 crude / 170394 bollite). Non copre beta-carotene/altri carotenoidi provitaminici A (vedi carotenoid_matrix_state).', NULL)
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi;

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
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_spinach_raw', 'Spinaci, crudi', 'leafy_greens', 'raw', false, 'high_oxalate', 'Amaranthaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_spinach_raw', 'energy_kcal', 23.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'protein_g', 2.86, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'fat_g', 0.39, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'carbohydrates_g', 3.63, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'fiber_g', 2.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_raw', 'oxalates_mg', 1959, NULL, NULL, 'SIENER_2006_FOODCHEM', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Spinaci, bolliti e scolati  |  FDC: Spinach, cooked, boiled, drained, without salt (FDC ID 168463)
-- https://fdc.nal.usda.gov/food-details/168463/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_spinach_boiled', 'Spinaci, bolliti e scolati', 'leafy_greens', 'boiled', false, 'high_oxalate', 'Amaranthaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_spinach_boiled', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'energy_kcal', 23.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'protein_g', 2.97, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'fat_g', 0.26, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'carbohydrates_g', 3.75, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_spinach_boiled', 'fiber_g', 2.4, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavolo kale, crudo  |  FDC: Kale, raw (FDC ID 323505)
-- https://fdc.nal.usda.gov/food-details/323505/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kale_raw', 'Cavolo kale, crudo', 'leafy_greens', 'raw', false, 'low_oxalate', 'Brassicaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_kale_raw', 'energy_kcal', 35.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'protein_g', 2.92, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'fat_g', 1.49, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'carbohydrates_g', 4.42, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'fiber_g', 4.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kale_raw', 'oxalates_mg', 297, 229.8, 364.2, 'ERDOGAN_ONAR_2012_JFDA', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Latte vaccino intero (3.25% grassi, vitamina D aggiunta)  |  FDC: Milk, whole, 3.25% milkfat, with added vitamin D (FDC ID 322892)
-- https://fdc.nal.usda.gov/food-details/322892/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_milk_whole', 'Latte vaccino intero (3.25% grassi, vitamina D aggiunta)', 'dairy_milk', 'raw', false, 'medium_oxalate', NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_milk_whole', 'calcium_mg', 123, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_milk_whole', 'energy_kcal', 60.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_milk_whole', 'protein_g', 3.28, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_milk_whole', 'fat_g', 3.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_milk_whole', 'carbohydrates_g', 4.67, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fagioli rossi (kidney), bolliti  |  FDC: Beans, kidney, red, mature seeds, cooked, boiled, without salt (FDC ID 175194)
-- https://fdc.nal.usda.gov/food-details/175194/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kidney_beans_boiled', 'Fagioli rossi (kidney), bolliti', 'legumes', 'boiled', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_kidney_beans_boiled', 'energy_kcal', 127, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'protein_g', 8.67, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'fat_g', 0.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'carbohydrates_g', 22.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'fiber_g', 7.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_boiled', 'phytates_mg', 805, NULL, NULL, 'ZIA_UR_REHMAN_2002_PJSIR', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Lenticchie, bollite  |  FDC: Lentils, mature seeds, cooked, boiled, without salt (FDC ID 172421)
-- https://fdc.nal.usda.gov/food-details/172421/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_lentils_boiled', 'Lenticchie, bollite', 'legumes', 'boiled', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_lentils_boiled', 'folate_mcg', 181, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'energy_kcal', 116, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'protein_g', 9.02, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'fat_g', 0.38, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'carbohydrates_g', 20.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_boiled', 'fiber_g', 7.9, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Patate, bollite con la buccia  |  FDC: Potatoes, boiled, cooked in skin, flesh, without salt (FDC ID 170438)
-- https://fdc.nal.usda.gov/food-details/170438/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_potato_boiled_in_skin', 'Patate, bollite con la buccia', 'tubers', 'boiled_in_skin', false, NULL, 'Solanaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_potato_boiled_in_skin', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'energy_kcal', 87.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'protein_g', 1.87, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'fat_g', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'carbohydrates_g', 20.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_boiled_in_skin', 'fiber_g', 1.8, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Carote, crude  |  FDC: Carrots, raw (FDC ID 170393)
-- https://fdc.nal.usda.gov/food-details/170393/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_carrots_raw', 'Carote, crude', 'carrots', 'raw', false, NULL, 'Apiaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_carrots_raw', 'other_provitamin_a_carotenoids_mcg', 3480, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'energy_kcal', 41.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'protein_g', 0.93, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'fat_g', 0.24, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'carbohydrates_g', 9.58, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_raw', 'fiber_g', 2.8, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Carote, bollite e scolate  |  FDC: Carrots, cooked, boiled, drained, without salt (FDC ID 170394)
-- https://fdc.nal.usda.gov/food-details/170394/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_carrots_boiled', 'Carote, bollite e scolate', 'carrots', 'boiled', false, NULL, 'Apiaceae', 'draft', 'cooked_or_disrupted')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_carrots_boiled', 'other_provitamin_a_carotenoids_mcg', 3780, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'energy_kcal', 35.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'protein_g', 0.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'fat_g', 0.18, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'carbohydrates_g', 8.22, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_carrots_boiled', 'fiber_g', 3.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavoletti di Bruxelles, crudi  |  FDC: Brussels sprouts, raw (FDC ID 170383)
-- https://fdc.nal.usda.gov/food-details/170383/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, zinc_bioaccessibility_bucket) VALUES
  ('food_brussels_sprouts_raw', 'Cavoletti di Bruxelles, crudi', 'crucifere_cavoletti_bruxelles', 'raw', false, NULL, 'Brassicaceae', 'draft', 'none')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_brussels_sprouts_raw', 'other_provitamin_a_carotenoids_mcg', 6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'energy_kcal', 43.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'protein_g', 3.38, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'fat_g', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'carbohydrates_g', 8.95, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_raw', 'fiber_g', 3.8, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Cavoletti di Bruxelles, bolliti e scolati  |  FDC: Brussels sprouts, cooked, boiled, drained, without salt (FDC ID 169971)
-- https://fdc.nal.usda.gov/food-details/169971/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, zinc_bioaccessibility_bucket) VALUES
  ('food_brussels_sprouts_boiled', 'Cavoletti di Bruxelles, bolliti e scolati', 'crucifere_cavoletti_bruxelles', 'boiled', false, NULL, 'Brassicaceae', 'draft', 'brussels_sprouts_boiled')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_brussels_sprouts_boiled', 'folate_mcg', 60, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'energy_kcal', 36.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'protein_g', 2.55, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'fat_g', 0.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'carbohydrates_g', 7.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_brussels_sprouts_boiled', 'fiber_g', 2.6, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fegato di manzo, cotto (brasato)  |  FDC: Beef, variety meats and by-products, liver, cooked, braised (FDC ID 168626)
-- https://fdc.nal.usda.gov/food-details/168626/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_liver_cooked', 'Fegato di manzo, cotto (brasato)', 'beef_liver', 'braised', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_beef_liver_cooked', 'beta_carotene_mcg', 162, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'energy_kcal', 191, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'protein_g', 29.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'fat_g', 5.26, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'carbohydrates_g', 5.13, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_cooked', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Manzo macinato (85% magro), cotto alla griglia  |  FDC: Beef, ground, 85% lean meat / 15% fat, patty, cooked, broiled (FDC ID 174032)
-- https://fdc.nal.usda.gov/food-details/174032/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_ground_cooked', 'Manzo macinato (85% magro), cotto alla griglia', 'beef_ground_meat', 'grilled', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_beef_ground_cooked', 'folate_mcg', 9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'energy_kcal', 250, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'protein_g', 25.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'fat_g', 15.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_cooked', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Broccoli, crudi  |  FDC: Broccoli, raw (FDC ID 170379)
-- https://fdc.nal.usda.gov/food-details/170379/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_broccoli_raw', 'Broccoli, crudi', 'broccoli', 'raw', false, NULL, 'Brassicaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_broccoli_raw', 'other_provitamin_a_carotenoids_mcg', 26, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'energy_kcal', 34.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'protein_g', 2.82, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'fat_g', 0.37, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'carbohydrates_g', 6.64, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_raw', 'fiber_g', 2.6, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Broccoli, bolliti e scolati  |  FDC: Broccoli, cooked, boiled, drained, without salt (FDC ID 169967)
-- https://fdc.nal.usda.gov/food-details/169967/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_broccoli_boiled', 'Broccoli, bolliti e scolati', 'broccoli', 'boiled', false, NULL, 'Brassicaceae', 'draft', 'cooked_or_disrupted')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  carotenoid_matrix_state = EXCLUDED.carotenoid_matrix_state;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_broccoli_boiled', 'iron_mg', 0.67, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'zinc_mg', 0.45, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'calcium_mg', 40, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'vitamin_c_mg', 64.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'magnesium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'copper_mg', 0.061, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'selenium_mcg', 1.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'vitamin_k_mcg', 141, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'folate_mcg', 108, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'beta_carotene_mcg', 929, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'energy_kcal', 35.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'protein_g', 2.38, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'fat_g', 0.41, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'carbohydrates_g', 7.18, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_broccoli_boiled', 'fiber_g', 3.3, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Mandorle, secche, non salate  |  FDC: Nuts, almonds (FDC ID 170567)
-- https://fdc.nal.usda.gov/food-details/170567/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_almonds', 'Mandorle, secche, non salate', 'nuts_almonds', 'raw', false, NULL, 'Rosaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_almonds', 'folate_mcg', 44, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'energy_kcal', 579, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'protein_g', 21.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'fat_g', 49.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'carbohydrates_g', 21.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_almonds', 'fiber_g', 12.5, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Arance, crude, tutte le varieta' commerciali  |  FDC: Oranges, raw, all commercial varieties (FDC ID 169097)
-- https://fdc.nal.usda.gov/food-details/169097/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, carotenoid_matrix_state) VALUES
  ('food_oranges_raw', 'Arance, crude, tutte le varieta'' commerciali', 'citrus_oranges', 'raw', false, NULL, 'Rutaceae', 'draft', 'raw_intact')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_oranges_raw', 'other_provitamin_a_carotenoids_mcg', 127, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'energy_kcal', 47.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'protein_g', 0.94, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'fat_g', 0.12, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'carbohydrates_g', 11.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_oranges_raw', 'fiber_g', 2.4, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Uovo, intero, cotto (sodo)  |  FDC: Egg, whole, cooked, hard-boiled (FDC ID 173424)
-- https://fdc.nal.usda.gov/food-details/173424/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_egg_hard_boiled', 'Uovo, intero, cotto (sodo)', 'eggs', 'hard_boiled', false, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_egg_hard_boiled', 'folate_mcg', 44, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'energy_kcal', 155, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'protein_g', 12.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'fat_g', 10.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'carbohydrates_g', 1.12, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_hard_boiled', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Salmone atlantico, allevato, cotto (calore secco)  |  FDC: Fish, salmon, Atlantic, farmed, cooked, dry heat (FDC ID 175168)
-- https://fdc.nal.usda.gov/food-details/175168/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_salmon_cooked', 'Salmone atlantico, allevato, cotto (calore secco)', 'salmon_fish', 'dry_heat_cooked', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_salmon_cooked', 'folate_mcg', 34, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'energy_kcal', 206, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'protein_g', 22.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'fat_g', 12.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_cooked', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Ceci, semi maturi, bolliti, senza sale  |  FDC: Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt (FDC ID 173757)
-- https://fdc.nal.usda.gov/food-details/173757/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_chickpeas_boiled', 'Ceci, semi maturi, bolliti, senza sale', 'legumes', 'boiled', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
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
  ('food_chickpeas_boiled', 'folate_mcg', 172, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'energy_kcal', 164, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'protein_g', 8.86, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'fat_g', 2.59, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'carbohydrates_g', 27.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_boiled', 'fiber_g', 7.6, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Pasta, cotta, arricchita (enriched), senza sale aggiunto  |  FDC: Pasta, cooked, enriched, without added salt (FDC ID 169737)
-- https://fdc.nal.usda.gov/food-details/169737/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, is_fortified_folate) VALUES
  ('food_pasta_enriched_cooked', 'Pasta, cotta, arricchita (enriched), senza sale aggiunto', 'pasta_enriched_wheat', 'boiled', false, NULL, 'Poaceae', 'draft', true)
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  is_fortified_folate = EXCLUDED.is_fortified_folate;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_pasta_enriched_cooked', 'iron_mg', 1.28, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'zinc_mg', 0.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'calcium_mg', 7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'magnesium_mg', 18.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'copper_mg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'selenium_mcg', 26.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'vitamin_k_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'folate_mcg', 66, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'beta_carotene_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'other_provitamin_a_carotenoids_mcg', 0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'energy_kcal', 158, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'protein_g', 5.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'fat_g', 0.93, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'carbohydrates_g', 30.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_cooked', 'fiber_g', 1.8, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Patate, crude, con la buccia  |  FDC: Potatoes, flesh and skin, raw (FDC ID 170026)
-- https://fdc.nal.usda.gov/food-details/170026/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_potato_raw', 'Patate, crude, con la buccia', 'tubers', 'raw', false, NULL, 'Solanaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_potato_raw', 'iron_mg', 0.81, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'zinc_mg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'calcium_mg', 12, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'vitamin_c_mg', 19.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'magnesium_mg', 23.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'copper_mg', 0.11, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'selenium_mcg', 0.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'vitamin_k_mcg', 2.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'folate_mcg', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'energy_kcal', 77.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'protein_g', 2.05, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'fat_g', 0.09, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'carbohydrates_g', 17.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_potato_raw', 'fiber_g', 2.1, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fagioli rossi (kidney), crudi, secchi  |  FDC: Beans, kidney, all types, mature seeds, raw (FDC ID 175193)
-- https://fdc.nal.usda.gov/food-details/175193/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_kidney_beans_raw', 'Fagioli rossi (kidney), crudi, secchi', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_kidney_beans_raw', 'iron_mg', 8.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'zinc_mg', 2.79, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'calcium_mg', 143, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_c_mg', 4.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'magnesium_mg', 140, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'copper_mg', 0.96, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'selenium_mcg', 3.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_k_mcg', 19.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'folate_mcg', 394, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'energy_kcal', 333, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'protein_g', 23.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'fat_g', 0.83, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'carbohydrates_g', 60.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_kidney_beans_raw', 'fiber_g', 24.9, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Lenticchie, crude, secche  |  FDC: Lentils, raw (FDC ID 172420)
-- https://fdc.nal.usda.gov/food-details/172420/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_lentils_raw', 'Lenticchie, crude, secche', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_lentils_raw', 'iron_mg', 6.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'zinc_mg', 3.27, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'calcium_mg', 35.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_c_mg', 4.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'magnesium_mg', 47.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'copper_mg', 0.75, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'selenium_mcg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_k_mcg', 5.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'folate_mcg', 479, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'energy_kcal', 352, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'protein_g', 24.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'fat_g', 1.06, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'carbohydrates_g', 63.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_lentils_raw', 'fiber_g', 10.7, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Ceci, crudi, secchi  |  FDC: Chickpeas (garbanzo beans, bengal gram), mature seeds, raw (FDC ID 173756)
-- https://fdc.nal.usda.gov/food-details/173756/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_chickpeas_raw', 'Ceci, crudi, secchi', 'legumes', 'raw', false, NULL, 'Fabaceae', 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_chickpeas_raw', 'iron_mg', 4.31, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'zinc_mg', 2.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'calcium_mg', 57.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_c_mg', 4.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'magnesium_mg', 79.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'copper_mg', 0.66, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_k_mcg', 9.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'folate_mcg', 557, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'energy_kcal', 378, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'protein_g', 20.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'fat_g', 6.04, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'carbohydrates_g', 63.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_chickpeas_raw', 'fiber_g', 12.2, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fegato di manzo, crudo  |  FDC: Beef, variety meats and by-products, liver, raw (FDC ID 169451)
-- https://fdc.nal.usda.gov/food-details/169451/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_liver_raw', 'Fegato di manzo, crudo', 'beef_liver', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_liver_raw', 'iron_mg', 4.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'zinc_mg', 4.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'calcium_mg', 5.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'vitamin_c_mg', 1.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'magnesium_mg', 18.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'copper_mg', 9.76, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'selenium_mcg', 39.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'vitamin_k_mcg', 3.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'vitamin_b12_mcg', 59.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'folate_mcg', 290, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'energy_kcal', 135, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'protein_g', 20.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'fat_g', 3.63, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'carbohydrates_g', 3.89, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_liver_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Manzo macinato (85% magro), crudo  |  FDC: Beef, ground, 85% lean meat / 15% fat, raw (FDC ID 171796)
-- https://fdc.nal.usda.gov/food-details/171796/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_beef_ground_raw', 'Manzo macinato (85% magro), crudo', 'beef_ground_meat', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_beef_ground_raw', 'iron_mg', 2.09, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'zinc_mg', 4.48, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'calcium_mg', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'magnesium_mg', 18.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'copper_mg', 0.067, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'selenium_mcg', 15.8, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'vitamin_k_mcg', 1.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'vitamin_b12_mcg', 2.17, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'folate_mcg', 6.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'energy_kcal', 215, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'protein_g', 18.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'fat_g', 15.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_beef_ground_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Uovo, intero, crudo  |  FDC: Egg, whole, raw, fresh (FDC ID 171287)
-- https://fdc.nal.usda.gov/food-details/171287/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_egg_raw', 'Uovo, intero, crudo', 'eggs', 'raw', false, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_egg_raw', 'iron_mg', 1.75, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'zinc_mg', 1.29, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'calcium_mg', 56.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'magnesium_mg', 12.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'copper_mg', 0.072, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'selenium_mcg', 30.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'vitamin_k_mcg', 0.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'vitamin_b12_mcg', 0.89, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'folate_mcg', 47.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'energy_kcal', 143, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'protein_g', 12.6, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'fat_g', 9.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'carbohydrates_g', 0.72, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_egg_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Salmone atlantico, allevato, crudo  |  FDC: Fish, salmon, Atlantic, farmed, raw (FDC ID 175167)
-- https://fdc.nal.usda.gov/food-details/175167/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status) VALUES
  ('food_salmon_raw', 'Salmone atlantico, allevato, crudo', 'salmon_fish', 'raw', true, NULL, NULL, 'draft')
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_salmon_raw', 'iron_mg', 0.34, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'zinc_mg', 0.36, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'calcium_mg', 9.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_c_mg', 3.9, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'magnesium_mg', 27.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'copper_mg', 0.045, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'selenium_mcg', 24.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_k_mcg', 0.5, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'vitamin_b12_mcg', 3.23, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'energy_kcal', 208, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'protein_g', 20.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'fat_g', 13.4, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'carbohydrates_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_salmon_raw', 'fiber_g', 0.0, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Pasta, secca, arricchita (enriched), non cotta  |  FDC: Pasta, dry, enriched (FDC ID 169736)
-- https://fdc.nal.usda.gov/food-details/169736/nutrients
INSERT INTO foods_raw (food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium, botanical_family, verification_status, is_fortified_folate) VALUES
  ('food_pasta_enriched_dry', 'Pasta, secca, arricchita (enriched), non cotta', 'pasta_enriched_wheat', 'raw', false, NULL, 'Poaceae', 'draft', true)
ON CONFLICT (food_id) DO UPDATE SET
  name_it = EXCLUDED.name_it, matrix_id = EXCLUDED.matrix_id,
  baseline_cooking_state = EXCLUDED.baseline_cooking_state,
  is_heme_iron = EXCLUDED.is_heme_iron,
  matrix_category_calcium = EXCLUDED.matrix_category_calcium,
  botanical_family = EXCLUDED.botanical_family,
  is_fortified_folate = EXCLUDED.is_fortified_folate;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_pasta_enriched_dry', 'iron_mg', 3.3, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'zinc_mg', 1.41, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'calcium_mg', 21.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_c_mg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'magnesium_mg', 53.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'copper_mg', 0.29, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'selenium_mcg', 63.2, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_k_mcg', 0.1, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'vitamin_b12_mcg', 0.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'folate_mcg', 237, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'energy_kcal', 371, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'protein_g', 13.0, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'fat_g', 1.51, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'carbohydrates_g', 74.7, NULL, NULL, 'USDA_FDC', 'draft'),
  ('food_pasta_enriched_dry', 'fiber_g', 3.2, NULL, NULL, 'USDA_FDC', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- ----------------------------------------------------------------------------
-- Fattori di ritenzione di cottura (retention_factors)
--
-- Fusi qui 2026-10-10 da 4 file sparsi (retention_factors_legumi_tuberi.sql,
-- retention_factors_crucifere.sql, retention_factors_padella.sql,
-- fix_sources_e_retention_factors.sql) + il fattore latte di
-- golden_set_raw_baselines.sql -- stessi valori, stesse fonti, stesso
-- verification_status di quei file, nessun numero nuovo. L'ON CONFLICT DO
-- UPDATE qui sotto corregge anche una riga live che un controllo incrociato
-- ha trovato senza fonte (leafy_greens/boiled/vitamin_c = 0.50/NULL invece
-- di 0.58/USDA_RETN06 -- vedi commento su RETENTION_FACTORS in questo script
-- per il dettaglio completo). Altre 3 righe trovate live senza fonte in
-- quello stesso controllo (leafy_greens/steamed/vitamin_c,
-- legumes/boiled/phytates, pome_fruits/steamed/polyphenols) NON hanno un
-- sostituto sourced e vanno rimosse a parte (DELETE, non INSERT con un
-- valore indovinato) -- non presenti qui.
-- ----------------------------------------------------------------------------
INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('crucifere_cavoletti_bruxelles', 'boiled', 'iron', 1.0, NULL, NULL, 'DONIEC_2022_MOLECULES', 'verified'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'zinc', 0.78, NULL, NULL, 'DONIEC_2022_MOLECULES', 'verified'),
  ('crucifere_cavoletti_bruxelles', 'steamed', 'iron', 1.0, NULL, NULL, 'DONIEC_2022_MOLECULES', 'verified'),
  ('crucifere_cavoletti_bruxelles', 'steamed', 'zinc', 0.81, NULL, NULL, 'DONIEC_2022_MOLECULES', 'verified'),
  ('dairy_milk', 'boiled', 'iron', 1.0, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('dairy_milk', 'boiled', 'zinc', 1.0, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('dairy_milk', 'boiled', 'calcium', 1.0, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('leafy_greens', 'boiled', 'vitamin_c', 0.58, 0.55, 0.6, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled', 'iron', 0.8, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled', 'zinc', 0.85, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled', 'vitamin_c', 0.65, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled_quick_15_20min', 'iron', 0.85, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled_quick_15_20min', 'zinc', 0.85, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'boiled_quick_15_20min', 'vitamin_c', 0.65, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'fried', 'iron', 0.8, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'fried', 'zinc', 0.85, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('legumes', 'fried', 'vitamin_c', 0.6, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'boiled_in_skin', 'iron', 0.95, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'boiled_in_skin', 'zinc', 0.95, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'boiled_in_skin', 'vitamin_c', 0.75, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'fried', 'iron', 1.0, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'fried', 'zinc', 1.0, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('tubers', 'fried', 'vitamin_c', 0.8, NULL, NULL, 'USDA_RETN06', 'draft'),
  ('broccoli', 'boiled', 'iron', 0.92, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'zinc', 1.1, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'calcium', 0.85, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'vitamin_c', 0.73, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'magnesium', 1.0, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'copper', 1.24, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'selenium', 0.64, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'vitamin_k', 1.38, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'energy', 1.03, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'protein', 0.84, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'fat', 1.11, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'carbohydrates', 1.08, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('broccoli', 'boiled', 'fiber', 1.27, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'iron', 1.13, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'zinc', 0.83, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'calcium', 0.91, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'vitamin_c', 0.61, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'magnesium', 0.83, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'copper', 0.38, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'vitamin_k', 1.04, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'folate', 0.74, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'energy', 0.85, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'protein', 0.82, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'fat', 0.75, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'carbohydrates', 0.86, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('carrots', 'boiled', 'fiber', 1.07, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft')
ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET
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
-- - food_spinach_raw.oxalates_mg: RISOLTO 2026-10-10 (vedi
--   fix_literature_sources_recheck.sql). Due fonti discordanti --
--   Noonan & Savage 1999 (review, 970 mg/100g) vs Siener et al. 2006
--   (studio primario dedicato, 1959 mg/100g) -- l'utente ha scelto
--   esplicitamente Siener (piu' recente, studio primario vs review).
--   Resta 'draft': il testo completo di Siener e' a pagamento, non letto
--   direttamente da Claude (citazione di seconda mano).
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
--   dichiarato in docs/PRD.md §4.0/§4.5.
-- - food_broccoli_boiled: RISOLTO 2026-10-10 -- trovato FDC ID 169967
--   (confermato fresco, non surgelato: il nome del record non contiene
--   'frozen', a differenza delle voci surgelate che lo dichiarano
--   esplicitamente). Vedi la scheda FOODS sopra.
-- - food_chickpeas_boiled.vitamin_b12_mcg: il record FDC segnala esplicitamente
--   0 data points per questo campo (diverso dal B12=0.00 con dati reali a
--   supporto degli altri alimenti vegetali di questo set) -- inserito comunque
--   come 0.00/USDA_FDC per coerenza biologica (i legumi non contengono B12),
--   ma il limite metodologico specifico di questo record resta dichiarato qui.
-- - food_milk_whole.fiber_g: fonte verificata per lo stesso FDC ID 322892
--   internamente contraddittoria sulla fibra (etichetta "not declared" / riquadro
--   "0g" / nessuna riga "Fiber" nella tabella nutrienti completa) -- non inserito,
--   anche se biologicamente il latte ha fibra ~0. Aggiunto 2026-10-10 insieme
--   agli altri macronutrienti (energy_kcal/protein_g/fat_g/carbohydrates_g),
--   verificati via getfoodfacts.com (mirror USDA FDC con stesso FDC ID citato
--   esplicitamente in pagina) perché fdc.nal.usda.gov non era raggiungibile
--   direttamente in questa sessione.
-- - food_pasta_enriched_cooked.folate_mcg: contiene SOLO la quota di acido
--   folico sintetico (66 µg), non il folato totale (73 µg) né la quota di
--   folato alimentare naturale (7 µg) riportati entrambi dal record FDC --
--   coerente con la semantica a singolo-campo di calculateFolateDFE (vedi
--   commento Python in FOODS), ma la quota naturale resta cosi' non
--   rappresentata in questa riga. Primo alimento reale a rendere visibile
--   questo limite preesistente dello schema (prima solo su dati sintetici).
--
-- Gap dichiarati aggiunti 2026-10-10 (secondo giro, i 9 nuovi baseline crudi):
-- - food_potato_raw, food_kidney_beans_raw, food_lentils_raw,
--   food_chickpeas_raw: phytates_mg, oxalates_mg non nel profilo SR Legacy
--   standard consultato per questi FDC ID -- non ricercati da fonti di
--   letteratura dedicate in questo giro (diversamente da spinaci/kale/fagioli
--   rossi bolliti sopra), da fare in una sessione futura se servono.
-- - food_chickpeas_raw.selenium_mcg: la fonte mostra 0 µg ma il subagent non
--   e' riuscito a confermarlo come zero dichiarato con dati a supporto
--   piuttosto che campo assente -- per cautela NON inserito (diversamente dal
--   B12, dove food_chickpeas_boiled accetta gia' questa stessa ambiguita' per
--   coerenza biologica).
-- - food_salmon_raw.folate_mcg: non riportato dalla fonte (FDC 175167) per
--   questo FDC ID.
-- - carote, broccoli: RISOLTO 2026-10-10 (quarto giro). Nessuna riga
--   food-specifica in USDA Retention Factors Release 6 ne' in letteratura
--   dedicata (vedi ricerca precedente, Masrizal 1997/Viroli 2023 non
--   utilizzabili). Decisione esplicita dell'utente (chat, 2026-10-10): dove
--   manca un fattore pubblicato ma esistono due alimenti Golden Set misurati
--   indipendentemente da USDA FDC per la stessa matrice (crudo + gia' cotto),
--   il fattore di ritenzione si DERIVA come rapporto fra le due misure reali
--   (vedi DERIVED_FDC_RAW_COOKED_RATIO in SOURCES_NEW e le righe 'broccoli'/
--   'carrots' in RETENTION_FACTORS) invece di lasciare solo 'Crudo' nel
--   selettore di cottura. food_carrots_boiled e food_broccoli_boiled restano
--   nel Golden Set (draft, non promossi, non mostrati nella Dispensa) solo
--   come base di calcolo tracciabile di questi rapporti. Non copre
--   beta-carotene/altri carotenoidi provitaminici A (gestiti da
--   carotenoid_matrix_state, vedi fix nel motore -- applicarci sopra anche
--   questo rapporto conterebbe due volte lo stesso effetto). Le mandorle
--   restano senza controparte cotta per scelta (non e' un alimento
--   tipicamente bollito) -- nessun gap da risolvere per quella matrice.
