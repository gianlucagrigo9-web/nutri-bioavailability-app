-- fix_add_spinach_brussels_retention_factors.sql
--
-- Stessa decisione/metodo di fix_add_broccoli_carrots_retention_factors.sql,
-- estesa a spinaci e cavoletti di Bruxelles (chat, 2026-10-10): l'utente ha
-- segnalato che carote crude/bollite comparivano ancora come due voci
-- separate in Dispensa (il fix precedente aveva aggiunto solo il fattore di
-- ritenzione, non la demozione di verification_status sulle righe gia'
-- 'verified' da prima di questa sessione) e ha reso la fusione crudo/cotto
-- una policy permanente ("d'ora in avanti voglio che tu accorpi sempre i
-- cibi quando sono lo stesso... lo si deduce matematicamente").
--
-- Questo file fa TRE cose:
--   1) aggiorna la citazione di DERIVED_FDC_RAW_COOKED_RATIO con le nuove
--      coppie FDC (spinaci, cavoletti di Bruxelles);
--   2) inserisce i fattori di ritenzione derivati per leafy_greens/boiled e
--      crucifere_cavoletti_bruxelles/boiled (vedi scripts/generate_golden_set_foods.py
--      per il calcolo completo e le esclusioni motivate: vitamin_c spinaci,
--      iron/zinc/fat cavoletti);
--   3) CORREGGE il bug residuo del fix precedente: demuove a 'draft'
--      food_carrots_boiled, food_brussels_sprouts_boiled e
--      food_spinach_boiled, che restavano 'verified' da prima di questa
--      sessione e quindi continuavano a comparire come voci Dispensa
--      separate nonostante il fattore di ritenzione aggiunto. food_broccoli_boiled
--      non e' nella lista: era già 'draft' dal fix precedente.
--
-- Eseguito come file a parte (stesso motivo di fix_add_broccoli_carrots_retention_factors.sql:
-- non rieseguire l'intero golden_set_foods.sql e rischiare di sovrascrivere
-- verification_status già promossi a 'verified' su altre righe legittime).

INSERT INTO sources (id, citation, url_or_doi) VALUES
  ('DERIVED_FDC_RAW_COOKED_RATIO', 'Metodo interno (non letteratura): fattore di ritenzione = valore_cotto_per_100g / valore_crudo_per_100g, da coppie di alimenti Golden Set misurati indipendentemente da USDA FoodData Central con lo stesso metodo di cottura. Coppie usate finora: broccoli (FDC 170379 crudo / 169967 bolliti), carote (FDC 170393 crude / 170394 bollite), spinaci (FDC 168462 crudi / 168463 bolliti), cavoletti di Bruxelles (FDC 170383 crudi / 169971 bolliti). Non copre beta-carotene/altri carotenoidi provitaminici A (vedi carotenoid_matrix_state).', NULL)
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi;

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('leafy_greens', 'boiled', 'iron', 1.32, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'zinc', 1.43, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'calcium', 1.37, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'magnesium', 1.10, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'copper', 1.34, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'selenium', 1.50, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'vitamin_k', 1.02, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'folate', 0.75, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'energy', 1.00, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'protein', 1.04, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'fat', 0.67, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'carbohydrates', 1.03, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('leafy_greens', 'boiled', 'fiber', 1.09, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'calcium', 0.86, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'vitamin_c', 0.73, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'magnesium', 0.87, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'copper', 1.19, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'selenium', 0.94, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'vitamin_k', 0.79, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'folate', 0.98, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'energy', 0.84, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'protein', 0.75, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'carbohydrates', 0.79, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft'),
  ('crucifere_cavoletti_bruxelles', 'boiled', 'fiber', 0.68, NULL, NULL, 'DERIVED_FDC_RAW_COOKED_RATIO', 'draft')
ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low,
  confidence_high = EXCLUDED.confidence_high, source_id = EXCLUDED.source_id,
  verification_status = EXCLUDED.verification_status;

-- Fix critico (il vero motivo per cui carote/cavoletti/spinaci bolliti
-- comparivano ancora come voci Dispensa separate): questi tre erano parte
-- del Golden Set ORIGINALE, promossi a 'verified' ben prima di questa
-- sessione -- a differenza di food_broccoli_boiled, aggiunto in questa
-- sessione e già correttamente 'draft'. Il generatore NON puo' correggere
-- questo (scripts/generate_golden_set_foods.py hardcoda SEMPRE 'draft' per
-- ogni cibo che genera, quindi rigenerare/rieseguire golden_set_foods.sql
-- non toccherebbe comunque righe già 'verified' nel DB live). Va fatto qui,
-- esplicitamente.
UPDATE foods_raw SET verification_status = 'draft'
WHERE food_id IN ('food_carrots_boiled', 'food_brussels_sprouts_boiled', 'food_spinach_boiled');
