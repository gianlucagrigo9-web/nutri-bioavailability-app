-- ============================================================================
-- MACs (amido resistente, RS): primo dato sourced per il Golden Set
-- (food_chickpeas_boiled, food_kidney_beans_boiled, food_lentils_boiled)
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b -- macs_mg era 0/assente per tutti i
-- 30 alimenti del Golden Set dal 2026-10-10 (le uniche 18 righe macs_mg nel
-- DB erano cruft non sourced, rimosse in cleanup_macs_cruft.sql e
-- cleanup_chickpeas_raw_cruft.sql). Scope deliberatamente ristretto
-- all'amido resistente (RS), un sottoinsieme dichiarato dei MACs (concetto-
-- ombrello Sonnenburg & Sonnenburg 2016 che include anche inulina/FOS/
-- pectina/beta-glucano, NON coperti qui) -- vedi PRD §9 Fase 1 punto 8b per
-- il ragionamento completo su perche' fiber_g non e' un proxy valido.
--
-- FONTE: Yadav BS, Sharma A, Yadav RB. Resistant starch content of
-- conventionally boiled and pressure-cooked cereals, legumes and tubers.
-- J Food Sci Technol. 2010;47(1):84-88. DOI: 10.1007/s13197-010-0020-6.
-- PMID: 23572606. Testo integrale letto direttamente (PMC3550986, non
-- citazione di seconda mano): valori Tabella 3 estratti dal layer di testo
-- del PDF via pdf.js (window.__pdfDoc.getPage(4).getTextContent() nel
-- browser, posizioni x/y delle celle verificate manualmente contro le
-- intestazioni di colonna) -- precisione esatta, non lettura a occhio di
-- uno screenshot ingrandito come nei tentativi precedenti falliti in questa
-- stessa sessione.
--
-- Tabella 3, riga H1 (bollitura convenzionale, la stessa voce "bollito" del
-- Golden Set; H2=pentola a pressione NON usato), "% dwb" (dry weight basis,
-- dichiarato esplicitamente nella didascalia della tabella):
--   Bengal gram (cece)  4.8 ± 0.10
--   Kidney bean         4.3 ± 0.15
--   Lentils             5.0 ± 0.11
--
-- CONVERSIONE dwb -> g/100g come consumato (formato richiesto da macs_mg,
-- PRD §9 Fase 1 punto 8b problema 1): moltiplicato per la frazione di
-- sostanza secca (DM) dello stesso alimento BOLLITO, letta direttamente
-- dall'API ufficiale USDA FDC (api.nal.usda.gov/fdc/v1/food/<id>, campo
-- "Water", stesso giorno, fetch diretto non mirror -- i valori confermano
-- esattamente, alla seconda cifra decimale, quelli gia' ottenuti in questa
-- sessione da una fonte mirror indipendente):
--   food_chickpeas_boiled    FDC 173757  acqua 60.21% -> DM 39.79%
--   food_kidney_beans_boiled FDC 175194  acqua 66.94% -> DM 33.06%
--   food_lentils_boiled      FDC 172421  acqua 69.64% -> DM 30.36%
--
--   macs_mg (per 100g come consumato) = %RS_dwb(H1) * DM_fraction * 10
--   Cece:    4.8 * 0.3979 * 10 = 1909.9 -> 1910
--   Kidney:  4.3 * 0.3306 * 10 = 1421.6 -> 1422
--   Lentil:  5.0 * 0.3036 * 10 = 1518.0 -> 1518
--
-- Ordine di grandezza plausibile: 1.4-1.9 g RS/100g come consumato rientra
-- nel range tipico riportato in letteratura per legumi cotti (es. revisione
-- Hughes et al. 2007, ~1.4-4.5 g/100g peso fresco per fagioli/lenticchie/
-- ceci cotti) -- citato come controllo di plausibilita', non come fonte del
-- dato stesso.
--
-- LIMITE METODOLOGICO DICHIARATO (non silenziato): la sezione Materiali e
-- Metodi del paper descrive la formula grezza del saggio enzimatico come
-- "RS (% of the sample as is)" (= % sul campione bollito TAL QUALE, non su
-- base secca), ma la didascalia della Tabella 3 etichetta esplicitamente i
-- valori pubblicati come "(% dwb)". I due testi sembrano in tensione; non e'
-- stato possibile dal full-text recuperato chiarire il passaggio intermedio
-- che converte l'uno nell'altro. Scelta fatta: fidarsi dell'etichetta
-- esplicita della tabella (dwb), sia perche' e' la dichiarazione piu'
-- specifica e diretta su CIO' CHE E' TABULATO, sia perche' e' convenzione
-- standard in letteratura di scienza degli alimenti riportare RS/amido/
-- fibra su base secca per confrontabilita' tra campioni, sia per il
-- controllo di plausibilita' sopra. Se in futuro si trova una fonte che
-- chiarisce il contrario, questi valori andranno ricalcolati (sarebbero
-- ~2.5x piu' alti se i valori di Tabella 3 fossero gia' su base "as is":
-- cece 4800, kidney 4300, lentil 5000 mg/100g).
--
-- LIMITE SECONDARIO DICHIARATO (cultivar): il paper identifica il fagiolo
-- solo come "kidney beans (Phaseolus vulgaris)", senza specificare la
-- cultivar/colore. USDA FDC 175194 usato per la conversione DM e' invece
-- esplicitamente "Beans, kidney, red" (fagioli rossi, la cultivar del
-- Golden Set). Rischio basso ma non nullo di mismatch cultivar: "kidney
-- bean" come nome comune denota quasi sempre la cultivar rossa (a
-- differenza del caso gia' dichiarato per Fabbri 2016 in PRD §9, dove gli
-- autori nominavano esplicitamente fagioli NERI/BORLOTTI, una cultivar
-- diversa) -- comunque dichiarato esplicitamente, non nascosto.
--
-- verification_status='draft' per tutte e tre le righe (prima stima da
-- letteratura con passaggio di conversione, coerente con lo standard del
-- progetto per dati non ancora promossi dopo cross-check indipendente).
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('YADAV_SHARMA_YADAV_2010_JFST',
   'Yadav BS, Sharma A, Yadav RB. Resistant starch content of conventionally boiled and pressure-cooked cereals, legumes and tubers. J Food Sci Technol. 2010;47(1):84-88. Tabella 3, riga H1 (bollitura convenzionale): Bengal gram (cece) 4.8±0.10, Kidney bean 4.3±0.15, Lentils 5.0±0.11 (% RS, dry weight basis). Valore macs_mg qui derivato convertendo in g/100g come consumato tramite la frazione di sostanza secca dello stesso alimento bollito (USDA FDC, campo Water) -- vedi commento in fix_add_macs_legumi_golden_set.sql per la catena di conversione completa e i limiti dichiarati (ambiguita dwb/as-is nel testo del paper; cultivar del fagiolo kidney non specificata).',
   'https://doi.org/10.1007/s13197-010-0020-6',
   'peer_reviewed_study')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_chickpeas_boiled',    'macs_mg', 1910, NULL, NULL, 'YADAV_SHARMA_YADAV_2010_JFST', 'draft'),
  ('food_kidney_beans_boiled', 'macs_mg', 1422, NULL, NULL, 'YADAV_SHARMA_YADAV_2010_JFST', 'draft'),
  ('food_lentils_boiled',      'macs_mg', 1518, NULL, NULL, 'YADAV_SHARMA_YADAV_2010_JFST', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva: segnala (non assume silenziosamente) se una delle tre
-- righe non risulta presente con il source_id atteso dopo l'esecuzione.
DO $$
DECLARE
  missing TEXT;
BEGIN
  SELECT string_agg(expected.food_id, ', ') INTO missing
  FROM (VALUES ('food_chickpeas_boiled'), ('food_kidney_beans_boiled'), ('food_lentils_boiled')) AS expected(food_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrient_values nv
    WHERE nv.food_id = expected.food_id
      AND nv.nutrient_code = 'macs_mg'
      AND nv.source_id = 'YADAV_SHARMA_YADAV_2010_JFST'
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'macs_mg mancante o con source_id inatteso per: %', missing;
  END IF;
END $$;
