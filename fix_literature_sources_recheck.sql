-- ============================================================================
-- Ri-verifica delle 3 righe nutrient_values rimaste 'draft' da letteratura
-- specifica (PRD.md Fase 1, punto 6) -- 2026-10-10.
-- ============================================================================
--
-- CONTESTO: golden_set_promote_verified.sql (2026-10-09) ha promosso a
-- 'verified' solo le righe source_id='USDA_FDC', lasciando esplicitamente
-- 'draft' le 3 righe da fonti di letteratura specifica (ossalati spinaci
-- crudi, ossalati kale, fitati fagioli rossi bolliti) perche' non erano
-- state ri-controllate in quel giro. Oggi ho letto io stesso (fetch diretto
-- del testo, non ri-uso di una citazione gia' nel repo) le tre fonti
-- primarie per confrontare cifra per cifra:
--
-- 1. KALE / oxalates_mg -- Erdogan & Onar 2012, J Food Drug Anal 20(2).
--    Abstract: "Oxalate concentration was lower in kale (2970 +/- 672 mg/kg)
--    than in spinach and chard." 2970/10 = 297 mg/100g -- CONFERMATO,
--    corrisponde esattamente al valore gia' salvato (ERDOGAN_ONAR_2012_JFDA).
--    -> promosso a 'verified' sotto.
--
-- 2. FAGIOLI ROSSI BOLLITI / phytates_mg -- Zia-ur-Rehman et al. 2002,
--    Pak J Sci Ind Res 45(1). Tabella 4, colonna "Ordinary cooking", riga
--    "Unsoaked": 8.05 g/kg +/- 0.26 = 805 mg/100g -- CONFERMATO, corrisponde
--    esattamente al valore gia' salvato (ZIA_UR_REHMAN_2002_PJSIR). Il
--    valore crudo nella stessa tabella (10.84 g/kg = 1084 mg/100g) e'
--    coerente con la riduzione per cottura dichiarata (25.73%).
--    -> promosso a 'verified' sotto.
--
-- 3. SPINACI CRUDI / oxalates_mg -- qui la ri-verifica ha portato a un
--    CAMBIO di fonte, non solo a una conferma. Il valore gia' salvato
--    (970 mg/100g, Noonan & Savage 1999) viene da una REVIEW che sintetizza
--    una media di altre 3 fonti citate (rif. 3, 21, 44), non da una singola
--    misura diretta -- il range 320-1260 riflette proprio quella variabilita'
--    tra fonti diverse. Il PRD segnalava gia' una fonte discordante, Siener
--    et al. 2006 (Food Chemistry 98:220-224), che riporta un valore quasi
--    doppio (1959 mg/100g totale). Chiesto all'utente come risolvere la
--    discrepanza: ha scelto esplicitamente di preferire la fonte piu'
--    recente E piu' "di prima mano" (approvazione 2026-10-10, chat).
--    Siener 2006 e' uno studio primario dedicato (misura sistematica su
--    piu' specie delle famiglie Chenopodiaceae/Amaranthaceae, la famiglia
--    botanica degli spinaci), mentre Noonan & Savage e' una review di
--    sintesi -- quindi coerente col criterio dato.
--    LIMITE DICHIARATO: non sono riuscito ad accedere al testo completo di
--    Siener 2006 (paywall ScienceDirect, nessuna copia libera trovata) per
--    confermare io stesso il numero 1959 mg/100g -- l'ho solo di seconda
--    mano dalla nota gia' presente nel PRD/nel commento SQL precedente, non
--    letto direttamente dal paper. Per questo il valore CAMBIA ma la riga
--    RESTA 'draft', non viene promossa a 'verified' -- promuoverla ora
--    significherebbe dichiarare "verificato" un numero che non ho
--    controllato di persona. Nessun confidence_low/high impostato: nessuna
--    delle due fonti secondarie disponibili riporta un range per questo
--    singolo valore (a differenza della review di Noonan, che aggregava un
--    range da piu' studi).
--
-- ============================================================================

-- Nuova fonte: Siener et al. 2006 (sostituisce Noonan & Savage come fonte
-- primaria per questo valore specifico; Noonan & Savage resta nella tabella
-- sources, non viene rimossa, perche' resta la fonte corretta per kale e
-- per il resto del contesto storico del progetto).
INSERT INTO sources (id, citation, url_or_doi) VALUES
  ('SIENER_2006_FOODCHEM',
   'Siener R, Hönow R, Seidler A, Voss S, Hesse A. Oxalate contents of species of the Polygonaceae, Amaranthaceae and Chenopodiaceae families. Food Chemistry. 2006;98(2):220-224. [spinaci: ossalato totale 1959 mg/100g, solubile 1029 mg/100g -- citazione di seconda mano, testo completo non letto direttamente per paywall, vedi commento sopra]',
   'https://doi.org/10.1016/j.foodchem.2005.05.079')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi;

-- Spinaci crudi: cambio fonte e valore (resta 'draft', vedi nota sopra).
UPDATE nutrient_values
SET value = 1959,
    confidence_low = NULL,
    confidence_high = NULL,
    source_id = 'SIENER_2006_FOODCHEM',
    verification_status = 'draft'
WHERE food_id = 'food_spinach_raw'
  AND nutrient_code = 'oxalates_mg';

-- Kale e fagioli rossi bolliti: confermati contro la fonte primaria,
-- promossi a 'verified'.
UPDATE nutrient_values
SET verification_status = 'verified'
WHERE source_id IN ('ERDOGAN_ONAR_2012_JFDA', 'ZIA_UR_REHMAN_2002_PJSIR');

-- Verifica rapida (da eseguire a mano dopo le UPDATE sopra):
--
-- SELECT food_id, nutrient_code, value, source_id, verification_status
-- FROM nutrient_values
-- WHERE source_id IN ('SIENER_2006_FOODCHEM', 'ERDOGAN_ONAR_2012_JFDA', 'ZIA_UR_REHMAN_2002_PJSIR');
--
-- Atteso: food_spinach_raw/oxalates_mg = 1959, SIENER_2006_FOODCHEM, draft;
-- food_kale_raw/oxalates_mg = 297, ERDOGAN_ONAR_2012_JFDA, verified;
-- food_kidney_beans_boiled/phytates_mg = 805, ZIA_UR_REHMAN_2002_PJSIR, verified.
