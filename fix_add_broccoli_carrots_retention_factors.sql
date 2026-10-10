-- fix_add_broccoli_carrots_retention_factors.sql
--
-- Aggiunge il fattore di ritenzione DERIVATO (non da letteratura) per
-- broccoli/carote bolliti, decisione esplicita dell'utente (chat,
-- 2026-10-10): dove manca un fattore di ritenzione pubblicato ma esistono
-- due alimenti Golden Set misurati indipendentemente da USDA FDC per la
-- stessa matrice (crudo + gia' cotto), il fattore si deriva come
-- valore_cotto_per_100g / valore_crudo_per_100g invece di lasciare "solo
-- crudo" nel selettore di cottura in UI. Vedi il commento di testa di
-- DERIVED_FDC_RAW_COOKED_RATIO sotto e in scripts/generate_golden_set_foods.py
-- per il metodo completo, incluso perche' beta-carotene e selenio-carote/
-- folato-broccoli sono esclusi.
--
-- Estratto verbatim da golden_set_foods.sql (rigenerato da
-- scripts/generate_golden_set_foods.py) -- eseguito come file a parte,
-- come fatto per fix_literature_sources_recheck.sql, per non rieseguire
-- l'intero golden_set_foods.sql e rischiare di resettare verification_status
-- gia' promossi a 'verified' su altre righe (quel file ha un ON CONFLICT
-- DO UPDATE che riscriverebbe anche quelle).

INSERT INTO sources (id, citation, url_or_doi) VALUES
  ('DERIVED_FDC_RAW_COOKED_RATIO', 'Metodo interno (non letteratura): fattore di ritenzione = valore_cotto_per_100g / valore_crudo_per_100g, da coppie di alimenti Golden Set misurati indipendentemente da USDA FoodData Central con lo stesso metodo di cottura. Coppie usate finora: broccoli (FDC 170379 crudo / 169967 bolliti), carote (FDC 170393 crude / 170394 bollite). Non copre beta-carotene/altri carotenoidi provitaminici A (vedi carotenoid_matrix_state).', NULL)
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi;

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
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
