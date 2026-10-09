-- ============================================================================
-- retention_factors: Legumi, Tuberi (solo Bollitura — vedi nota sotto)
-- Fonte: USDA Table of Nutrient Retention Factors, Release 6 (2007).
-- Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034.
-- PDF: https://www.ars.usda.gov/ARSUserFiles/80400535/Data/retn/retn06.pdf
-- (verificato anche su mirror corpora.tika.apache.org/base/docs/govdocs1/672/672061.pdf)
--
-- Metodologia USDA (p.1-2 del documento): i fattori sono "True Retention"
-- (%TR = Nc*Gc / Nr*Gr * 100) o "Apparent Retention" se i pesi prima/dopo
-- non sono disponibili. Arrotondati al 5% più vicino (p.2, ultimo paragrafo
-- della sezione "Methods"): per questo i valori sono tutti multipli di 5.
--
-- NON INCLUSO, perché non trovato in nessuna delle due fonti richieste:
-- - FITATI: ne' la tabella USDA Release 6 (26 fattori tracciati: Ca, Fe,
--   Mg, P, K, Na, Zn, Cu, VitC, Thiamin, Riboflavin, Niacin, B6, Folato,
--   Colina, B12, VitA, Alcol, Caroteni, Criptoxantina, Licopene,
--   Luteina+zeaxantina — nessuna voce fitati) ne' le tabelle di Bognár
--   (Bognár A. "Tables on weight yield of food and retention factors of
--   food constituents", BFE-R--02-03, Karlsruhe 2002, Parte 2 — elenco
--   costituenti: Proteine, Grassi, Carboidrati, Fibra, Minerali, Sale,
--   Na, K, Ca, Mg, P, Fe, Cu, Zn, Retinolo, Caroteni, vitamine D/E/K/
--   B1/B2/Niacina/B6/B12, Folati, Acido pantotenico, Biotina, VitC,
--   Aminoacidi, Acidi organici, Steroli, Purine — nessuna voce fitati)
--   contengono un fattore di ritenzione per l'acido fitico. Non inserito.
-- - CRUCIFERE: nessuna categoria dedicata in USDA Release 6 (la tabella
--   raggruppa tutto in ~16 categorie larghe; broccoli/cavolfiore/cavolo
--   non hanno una riga propria e non ho un documento di mappatura
--   food-code -> categoria per assegnarli con certezza a "VEG,OTHER").
--   Non inserito.
-- - COTTURA AL VAPORE (steamed) per legumi e tuberi: nessuna riga
--   "STEAMED" esiste per le categorie POTATOES o LEGUMES nella tabella
--   USDA Release 6 (esistono solo boiled in varianti, baked, fried,
--   reheated, canned/frozen). Non inserito.
-- ============================================================================

INSERT INTO sources (id, citation) VALUES
  ('USDA_RETN06', 'USDA Table of Nutrient Retention Factors, Release 6 (2007). Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation;

INSERT INTO food_matrices_master (matrix_id, description_it) VALUES
  ('legumes', 'Legumi secchi (fagioli, lenticchie, piselli)'),
  ('tubers', 'Tuberi (patate)')
ON CONFLICT (matrix_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- LEGUMI — Ferro, Zinco, Vitamina C — BOLLITURA, scolati
-- USDA Release 6, pagina 14, codice tabella "16 LEGUMES"
--
-- La tabella USDA distingue per TEMPO di cottura (i legumi secchi variano
-- molto: lenticchie 15-20min, fagioli 45-90min+). Riporto entrambe le
-- righe disponibili invece di sceglierne una a caso:
--
-- Riga "0501  LEGUMES,CKD 15/20MIN,BOILED,DRAINED" (pagina 14):
--   colonne Ca Fe Mg P K Na Zn Cu VitC ... = 85 85 80 90 75 90 85 70 65 ...
--   -> Ferro = 85%, Zinco = 85%, Vitamina C = 65%
-- Riga "0521  LEGUMES,CKD 45/75MIN,BOILED,DRND" (pagina 14):
--   colonne = 85 80 75 85 70 90 85 65 65 ...
--   -> Ferro = 80%, Zinco = 85%, Vitamina C = 65%
-- ----------------------------------------------------------------------------

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, source_id)
VALUES
  -- lenticchie / legumi a cottura rapida (15-20 min)
  ('legumes', 'boiled_quick_15_20min', 'iron',       0.85, 'USDA_RETN06'), -- Release 6, p.14, riga 0501, colonna Fe
  ('legumes', 'boiled_quick_15_20min', 'zinc',       0.85, 'USDA_RETN06'), -- Release 6, p.14, riga 0501, colonna Zn
  ('legumes', 'boiled_quick_15_20min', 'vitamin_c',  0.65, 'USDA_RETN06'), -- Release 6, p.14, riga 0501, colonna VitC

  -- fagioli / legumi a cottura lunga (45-75 min)
  ('legumes', 'boiled', 'iron',       0.80, 'USDA_RETN06'), -- Release 6, p.14, riga 0521, colonna Fe
  ('legumes', 'boiled', 'zinc',       0.85, 'USDA_RETN06'), -- Release 6, p.14, riga 0521, colonna Zn
  ('legumes', 'boiled', 'vitamin_c',  0.65, 'USDA_RETN06')  -- Release 6, p.14, riga 0521, colonna VitC
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- TUBERI (patate) — Ferro, Zinco, Vitamina C — BOLLITURA
-- USDA Release 6, pagina 8, codice tabella "11 POTATOES"
--
-- Riga "3307  POTATOES,BOILED IN SKIN" (pagina 8):
--   colonne Ca Fe Mg P K Na Zn Cu VitC ... = 95 95 95 95 90 95 95 95 75 ...
--   -> Ferro = 95%, Zinco = 95%, Vitamina C = 75%
-- Riga "3308  POTATOES,BOILED(PARED)DRAIN" (pagina 8, sbucciate prima di
--   bollire, acqua scolata): valori IDENTICI (Fe/Zn/VitC = 95/95/75) alla
--   riga 3307 -- quindi NON creiamo una riga/valore enum separato
--   'boiled_pared': non ci sarebbe nessun dato realmente diverso da
--   rappresentare, solo un'etichetta duplicata. La distinzione resta
--   documentata qui nel commento della fonte.
-- ----------------------------------------------------------------------------

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, source_id)
VALUES
  ('tubers', 'boiled_in_skin', 'iron',      0.95, 'USDA_RETN06'), -- Release 6, p.8, righe 3307 e 3308 (identiche), colonna Fe
  ('tubers', 'boiled_in_skin', 'zinc',      0.95, 'USDA_RETN06'), -- Release 6, p.8, righe 3307 e 3308 (identiche), colonna Zn
  ('tubers', 'boiled_in_skin', 'vitamin_c', 0.75, 'USDA_RETN06')  -- Release 6, p.8, righe 3307 e 3308 (identiche), colonna VitC
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIX (2026-10-09, prima esecuzione reale contro il DB live): questo file non
-- era mai stato eseguito contro Supabase prima d'ora. L'esecuzione e' fallita
-- con "ERROR: 22P02: invalid input value for enum cooking_method_enum:
-- boiled_quick_15_20min" -- rollback completo e pulito, 0 righe toccate.
--
-- cooking_method_enum dal vivo conteneva solo: raw, boiled, steamed,
-- roasted, fried, microwaved, baked -- nessuno dei tre valori granulari
-- originali di questo file ('boiled_quick_15_20min', 'boiled_in_skin',
-- 'boiled_pared') esisteva.
--
-- Decisione (confermata dall'utente): preservare la distinzione dove il
-- dato USDA e' realmente diverso, non dove e' solo un'etichetta diversa:
--   - 'boiled_quick_15_20min' (legumi, cottura rapida): AGGIUNTO
--     all'enum via extend_cooking_method_enum.sql, perche' Fe 85% vs 80%
--     della cottura lunga ('boiled' generico, gia' valido) e' una
--     differenza reale, non rumore.
--   - 'boiled_in_skin' (patate): AGGIUNTO all'enum, perche' e' il valore
--     usato per rappresentare la riga USDA 3307.
--   - 'boiled_pared': NON aggiunto. La riga USDA 3308 (patate sbucciate
--     prima di bollire) riporta valori Fe/Zn/VitC IDENTICI alla riga 3307
--     -- quindi non esiste un dato distinto da rappresentare, e creare un
--     valore enum separato sarebbe stato un'etichetta vuota. Le tre righe
--     'boiled_pared' sono state rimosse dal blocco tuberi sopra (erano
--     duplicati esatti delle righe 'boiled_in_skin').
--
-- extend_cooking_method_enum.sql deve essere eseguito PRIMA di questo file,
-- in una query separata (limite Postgres: un valore enum appena aggiunto
-- non e' utilizzabile nella stessa transazione/batch in cui viene creato).
-- ============================================================================
