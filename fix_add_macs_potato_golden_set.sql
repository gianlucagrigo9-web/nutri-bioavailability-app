-- ============================================================================
-- MACs (amido resistente, RS): patata bollita con la buccia
-- (food_potato_boiled_in_skin) -- stessa fonte di fix_add_macs_legumi_golden_set.sql
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b, problema 4 (gap sui 9 alimenti
-- vegetali oltre ai legumi). La Tabella 3 di Yadav, Sharma & Yadav (2010) --
-- gia' letta per intero per i legumi -- include ANCHE patata e patata
-- dolce, con lo stesso metodo H1 (bollitura) descritto nei Materiali e
-- Metodi come "tuberi bolliti interi con la buccia in pentola scoperta" --
-- corrispondenza diretta col food_id del Golden Set (`boiled_in_skin`, non
-- "sbucciata poi bollita"). Patata dolce NON inserita qui: non esiste un
-- food_id corrispondente nel Golden Set attuale.
--
-- Tabella 3, riga H1, Potato: 1.8 ± 0.15 (% RS, dry weight basis) --
-- stessa estrazione esatta dal layer di testo del PDF via pdf.js gia'
-- usata per i legumi, stesso giorno, stessa sessione browser.
--
-- CONVERSIONE: frazione di sostanza secca letta dall'API ufficiale USDA FDC
-- per l'FDC ID gia' usato da questo food_id nel generatore
-- (scripts/generate_golden_set_foods.py: fdc_id 170438, "Potatoes, boiled,
-- cooked in skin, flesh, without salt"): acqua 76.98% -> DM 23.02%.
--
--   macs_mg = 1.8 * 0.2302 * 1000 = 414.4 -> 414
--
-- Ordine di grandezza coerente con la Discussione dello stesso paper: i
-- tuberi hanno RS sistematicamente piu' basso di legumi e cereali (gia'
-- osservato per i legumi: 1422-1910 mg/100g vs 414 mg/100g qui), attribuito
-- dagli autori al minor contenuto di amilosio dei tuberi e al maggior
-- contenuto d'acqua che favorisce una gelatinizzazione piu' uniforme.
--
-- LIMITE DICHIARATO (eredita lo stesso di fix_add_macs_legumi_golden_set.sql
-- per i legumi, non ripetuto per intero qui): l'ambiguita' dwb/as-is nel
-- testo Materiali e Metodi del paper si applica identicamente qui. Se
-- smentita in futuro, il valore andrebbe ricalcolato a 1800 mg/100g
-- (~4.3x piu' alto). Nessun limite di cultivar qui (specie unica, nessuna
-- ambiguita' come per il fagiolo kidney).
--
-- LIMITE SECONDARIO: FDC 170438 e' "flesh" (sola polpa, buccia rimossa
-- prima dell'analisi nutrizionale) anche se il tubero e' stato bollito CON
-- la buccia -- stessa pratica descritta nel metodo di Yadav 2010 per
-- l'acqua usata nella conversione, ma non e' confermato se il valore RS
-- del paper sia stato misurato su tubero intero (buccia inclusa) o sulla
-- sola polpa dopo la bollitura. Dichiarato, non verificabile da questo
-- ambiente (il paper non lo specifica esplicitamente).
--
-- verification_status='draft', stesso standard delle righe macs_mg legumi.
-- ============================================================================

-- Aggiorna la citazione della fonte gia' inserita per i legumi, estendendola
-- esplicitamente alla riga Potato di Tabella 3 (stesso source_id, stessa
-- fonte, nessuna nuova riga in sources necessaria).
UPDATE sources
SET citation = 'Yadav BS, Sharma A, Yadav RB. Resistant starch content of conventionally boiled and pressure-cooked cereals, legumes and tubers. J Food Sci Technol. 2010;47(1):84-88. Tabella 3, riga H1 (bollitura convenzionale): Bengal gram (cece) 4.8±0.10, Kidney bean 4.3±0.15, Lentils 5.0±0.11, Potato 1.8±0.15 (% RS, dry weight basis). Valori macs_mg qui derivati convertendo in g/100g come consumato tramite la frazione di sostanza secca dello stesso alimento bollito (USDA FDC, campo Water) -- vedi commenti in fix_add_macs_legumi_golden_set.sql e fix_add_macs_potato_golden_set.sql per la catena di conversione completa e i limiti dichiarati (ambiguita dwb/as-is nel testo del paper; cultivar del fagiolo kidney non specificata; patata "flesh" vs tubero intero).'
WHERE id = 'YADAV_SHARMA_YADAV_2010_JFST';

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_potato_boiled_in_skin', 'macs_mg', 414, NULL, NULL, 'YADAV_SHARMA_YADAV_2010_JFST', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM nutrient_values
    WHERE food_id = 'food_potato_boiled_in_skin'
      AND nutrient_code = 'macs_mg'
      AND source_id = 'YADAV_SHARMA_YADAV_2010_JFST'
      AND value = 414
  ) THEN
    RAISE EXCEPTION 'macs_mg patata non scritto come atteso';
  END IF;
END $$;
