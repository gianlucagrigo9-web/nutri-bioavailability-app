-- ============================================================================
-- MACs (amido resistente, RS): pasta cotta arricchita (food_pasta_enriched_cooked)
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b, problema 4 (gap sui 9 alimenti
-- vegetali oltre ai legumi/patata -- vedi fix_add_macs_legumi_golden_set.sql
-- e fix_add_macs_potato_golden_set.sql per i casi gia' risolti).
--
-- FONTE: Cervini M, Gabrielli M, Spigno G, Giuberti G. Characterization of
-- Durum-Wheat Pasta Containing Resistant Starch from Debranched Waxy Rice
-- Starch. Foods. 2023;12(2):327. DOI: 10.3390/foods12020327. PMID: 36673419.
-- Full-text letto direttamente (PMC9857741, pagina HTML, non PDF). Il
-- campione "Control" (CTR) e' spaghetti 100% semola di grano duro, SENZA
-- alcuna aggiunta di amido resistente -- esattamente l'alimento semplice
-- del Golden Set (food_pasta_enriched_cooked), non uno dei campioni
-- arricchiti studiati come oggetto principale del paper.
--
-- Tabella 1 ("Chemical composition, g/100 g dry matter"), riga CTR:
--   RS (campione NON cotto):  1.9 ± 0.11 g/100g DM
--   RS (campione COTTO):      0.2 ± 0.01 g/100g DM
-- Usato il valore COTTO (coerente con food_pasta_enriched_cooked, non con
-- la pasta secca non cotta). Testo dei Risultati conferma esplicitamente:
-- "After cooking, the RS content of CTR decreased to 0.2 g/100 g DM, with
-- a calculated RS loss value > 90%" -- la cottura distrugge quasi tutto
-- l'amido resistente nativo della semola, un risultato noto in letteratura
-- (gelatinizzazione dell'amido durante la bollitura), non un'anomalia del
-- dato.
--
-- CONVERSIONE: stessa catena di fix_add_macs_legumi_golden_set.sql --
-- frazione di sostanza secca della pasta COTTA letta dall'API ufficiale
-- USDA FDC per l'FDC ID gia' usato da questo food_id nel generatore
-- (fdc_id 169737, "Pasta, cooked, enriched, without added salt"): acqua
-- 62.13% -> DM 37.87%.
--
--   macs_mg = 0.2 * 0.3787 * 1000 = 75.7 -> 76
--
-- Valore molto piu' basso dei legumi (1422-1910) e della patata (414)
-- bolliti -- atteso e coerente con la Discussione del paper stesso: la
-- pasta di grano duro (amido prevalentemente di tipo A, povero di RS
-- nativo anche da crudo: 1.9% dwb) perde la quasi totalita' del poco RS
-- residuo durante la cottura in acqua bollente.
--
-- LIMITE DICHIARATO (stessa natura di quello gia' segnalato per i legumi):
-- la Tabella 1 del paper etichetta l'intera tabella come "g/100 g dry
-- matter" ma non specifica esplicitamente se, per la riga "RS (cooked
-- sample)", la base secca sia quella del campione COTTO (misurato dopo
-- cottura, essiccato e macinato per il saggio enzimatico -- interpretazione
-- usata qui, coerente col metodo standard del kit Megazyme K-RSTAR citato)
-- oppure quella dell'impasto/pasta secca ORIGINALE prima della cottura
-- (convenzione talvolta usata in studi di perdita di cottura per permettere
-- confronti diretti prima/dopo sulla stessa base). Se fosse la seconda,
-- la frazione di sostanza secca da usare sarebbe quella della pasta SECCA
-- (~89.6% DM, da Table 1 "Humidity" ~10.4%) invece che della pasta cotta
-- (37.87% DM), dando un valore molto piu' alto (~179 mg/100g pasta cotta
-- equivalente, ricalcolato sul peso di pasta secca di partenza) -- non e'
-- stato possibile dal testo recuperato dirimere con certezza quale delle
-- due convenzioni sia stata usata. Scelta la prima (DM del campione cotto)
-- per coerenza metodologica con tutti gli altri valori macs_mg di questo
-- progetto (sempre normalizzati sulla sostanza secca dell'alimento COSI'
-- COME CONSUMATO, non dell'ingrediente di partenza).
--
-- verification_status='draft'.
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('CERVINI_2023_FOODS',
   'Cervini M, Gabrielli M, Spigno G, Giuberti G. Characterization of Durum-Wheat Pasta Containing Resistant Starch from Debranched Waxy Rice Starch. Foods. 2023;12(2):327. Tabella 1, riga Control (spaghetti 100% semola, nessun additivo): RS campione cotto 0.2±0.01 g/100g DM (RS crudo 1.9±0.11 g/100g DM). Valore macs_mg qui derivato convertendo il dato cotto in g/100g come consumato tramite la frazione di sostanza secca della pasta cotta (USDA FDC, campo Water) -- vedi commento in fix_add_macs_pasta_golden_set.sql per la catena di conversione completa e il limite dichiarato sulla base di riferimento del dato "dry matter" del campione cotto.',
   'https://doi.org/10.3390/foods12020327',
   'peer_reviewed_study')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_pasta_enriched_cooked', 'macs_mg', 76, NULL, NULL, 'CERVINI_2023_FOODS', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM nutrient_values
    WHERE food_id = 'food_pasta_enriched_cooked'
      AND nutrient_code = 'macs_mg'
      AND source_id = 'CERVINI_2023_FOODS'
      AND value = 76
  ) THEN
    RAISE EXCEPTION 'macs_mg pasta non scritto come atteso';
  END IF;
END $$;
