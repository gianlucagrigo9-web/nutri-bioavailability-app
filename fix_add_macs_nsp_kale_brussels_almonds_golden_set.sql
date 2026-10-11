-- ============================================================================
-- MACs (NSP, sottoinsieme PIU' GREZZO -- esplicitamente dichiarato):
-- kale crudo, cavoletti di Bruxelles (crudi e bolliti), mandorle
-- (food_kale_raw, food_brussels_sprouts_raw, food_brussels_sprouts_boiled,
--  food_almonds)
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b, problema 4. Dopo ricerca estesa in
-- piu' sessioni (vedi PRD per il resoconto completo dei tentativi falliti:
-- CoFID bloccato da rete sandboxata, letteratura dedicata non trovata per
-- questi alimenti specifici, USDA FDC "Fiber, soluble" assente o bloccato
-- da rate-limit), NON e' stato possibile trovare per questi 4 alimenti un
-- dato sul sottoinsieme specifico "pectina" o "fibra solubile" (AOAC) usato
-- per gli altri alimenti di questo progetto (vedi
-- fix_add_macs_carote_spinaci_golden_set.sql,
-- fix_add_macs_broccoli_orange_golden_set.sql).
--
-- DECISIONE ESPLICITA DELL'UTENTE (chat, 2026-10-11): usare NSP (Non-Starch
-- Polysaccharide, metodo Englyst) come TERZO sottoinsieme MACs, dichiarato
-- esplicitamente come PIU' GREZZO degli altri due gia' usati nel progetto
-- -- confermata solo dopo aver verificato che non esiste, negli strumenti
-- disponibili in questa sessione, un dato che fraziona NSP in
-- cellulosa/polisaccaridi-non-cellulosici (che avrebbe permesso di
-- sottrarre la quota non fermentabile) per questi alimenti specifici
-- (trovato solo per un ortaggio diverso, il cavolo cappuccio, non nel
-- Golden Set, e solo come valore derivato NDF-ADF, non una misura diretta
-- -- fonte scartata).
--
-- LIMITE METODOLOGICO CENTRALE (non silenziato): NSP (Englyst) esclude la
-- lignina (a differenza della "fibra totale AOAC") ma INCLUDE cellulosa,
-- emicellulosa e pectine tutte insieme -- la cellulosa e' in gran parte
-- NON accessibile al microbiota umano. Questo valore SOVRASTIMA quindi la
-- quota realmente fermentabile/MACs rispetto ai valori "pectina"/"fibra
-- solubile"/"amido resistente" usati altrove in questo stesso progetto per
-- altri alimenti -- non e' lo stesso standard di rigore, e va trattato
-- come tale in qualsiasi analisi comparativa fra alimenti.
--
-- FONTE: Public Health England / McCance and Widdowson's Composition of
-- Foods Integrated Dataset (CoFID), 2021 edition. File ufficiale
-- "McCance_Widdowson's_Composition_of_Foods_Integrated_Dataset_2021.xlsx"
-- (gov.uk, Open Government Licence), scheda "1.3 Proximates", colonna
-- "NSP (g)" (codice dataset "ENGFIB" -- Englyst fibre). File scaricato
-- direttamente dall'utente dal proprio browser (non dall'ambiente
-- sandboxato di questa sessione, che non riusciva ad accedervi per
-- restrizioni di rete proprie, non del dataset) e fornito in chat. Letto
-- qui con openpyxl, valori verificati riga per riga sul nome alimento
-- esatto.
--
-- Valori letti (g/100g alimento come consumato -- convenzione standard
-- McCance & Widdowson, nessuna conversione sostanza-secca necessaria):
--   Curly kale, raw:                    NSP 3.1
--   Brussels sprouts, raw:              NSP 4.1
--   Brussels sprouts, boiled in unsalted water: NSP 3.1
--   Almonds, flaked and ground:         NSP 7.4  (vedi limite mandorle sotto)
--
--   macs_mg = g/100g * 1000
--   Kale crudo:              3.1 * 1000 = 3100
--   Cavoletti crudi:         4.1 * 1000 = 4100
--   Cavoletti bolliti:       3.1 * 1000 = 3100
--   Mandorle:                7.4 * 1000 = 7400
--
-- LIMITE SPECIFICO DICHIARATO (mandorle, forma del campione): il food_id
-- del Golden Set (food_almonds, fdc_id 170567 "Nuts, almonds") corrisponde
-- alla voce CoFID "Almonds, whole kernels" -- ma per QUELLA riga esatta il
-- campo NSP e' "N" (non quantificato nel dataset), mentre e' quantificato
-- invece per "Almonds, flaked and ground" (NSP 7.4, stesso dataset, codice
-- alimento diverso). Usato qui il valore della forma macinata/a scaglie
-- come migliore approssimazione disponibile, sull'assunzione che la
-- macinazione sia un processo MECCANICO (non chimico/enzimatico) che non
-- altera la composizione in polisaccaridi di parete cellulare -- assunzione
-- ragionevole ma non verificata direttamente da questa fonte, dichiarata
-- non nascosta. Controllo di plausibilita' indipendente: la fibra TOTALE
-- AOAC riportata da CoFID per "Almonds, whole kernels" (12.5 g/100g) e'
-- IDENTICA al valore fiber_g gia' presente nel Golden Set per
-- food_almonds (12.5 g/100g, fonte USDA FDC indipendente) -- le due fonti
-- concordano sulla fibra totale, buon segno di qualita' del dato anche se
-- non elimina il limite sulla forma del campione per NSP specificamente.
--
-- verification_status='draft' per tutte le righe.
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('COFID_2021_PHE',
   'Public Health England. McCance and Widdowson''s Composition of Foods Integrated Dataset (CoFID), 2021. Scheda "1.3 Proximates", colonna NSP (Non-Starch Polysaccharide, metodo Englyst), g/100g come consumato: Curly kale, raw 3.1; Brussels sprouts, raw 4.1; Brussels sprouts, boiled in unsalted water 3.1; Almonds, flaked and ground 7.4 (per food_almonds, fdc_id 170567 "Nuts, almonds" -- "Almonds, whole kernels" ha NSP non quantificato nel dataset, usata la voce "flaked and ground" come approssimazione dichiarata). NSP e'' un sottoinsieme PIU'' GREZZO dei MACs rispetto a "pectina"/"fibra solubile" usati altrove in questo progetto (include cellulosa, in gran parte non fermentabile) -- vedi commento in fix_add_macs_nsp_kale_brussels_almonds_golden_set.sql per il limite completo e per il perche'' di questa scelta.',
   'https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid',
   'official_database')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_kale_raw',              'macs_mg', 3100, NULL, NULL, 'COFID_2021_PHE', 'draft'),
  ('food_brussels_sprouts_raw',  'macs_mg', 4100, NULL, NULL, 'COFID_2021_PHE', 'draft'),
  ('food_brussels_sprouts_boiled','macs_mg', 3100, NULL, NULL, 'COFID_2021_PHE', 'draft'),
  ('food_almonds',               'macs_mg', 7400, NULL, NULL, 'COFID_2021_PHE', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva.
DO $$
DECLARE
  missing TEXT;
BEGIN
  SELECT string_agg(expected.food_id, ', ') INTO missing
  FROM (VALUES ('food_kale_raw'), ('food_brussels_sprouts_raw'),
               ('food_brussels_sprouts_boiled'), ('food_almonds')) AS expected(food_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrient_values nv
    WHERE nv.food_id = expected.food_id
      AND nv.nutrient_code = 'macs_mg'
      AND nv.source_id = 'COFID_2021_PHE'
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'macs_mg mancante per: %', missing;
  END IF;
END $$;
