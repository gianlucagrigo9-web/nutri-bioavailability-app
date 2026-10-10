-- ============================================================================
-- Backfill di sources.source_type sulle righe GIA' live in produzione.
--
-- Contesto (vedi docs/PRD.md §4.7, 2026-10-11): la colonna sources.source_type
-- (enum source_type_enum: official_database, peer_reviewed_study, preprint,
-- institutional_report, internal_estimate) esiste nello schema live da
-- tempo (gia' documentata nell'ER diagram originale del PRD §5) ma non era
-- mai stata popolata da nessuno script -- ogni riga restava NULL, nessun
-- modo interrogabile per distinguere "misurato/da letteratura primaria" da
-- "stimato con un metodo interno nostro, non una misura diretta". Questo
-- file e' il backfill per le righe ATTUALMENTE in uso (citate da un motore
-- in lib/engine/*.ts o dal generatore scripts/generate_golden_set_foods.py)
-- che oggi hanno source_type NULL.
--
-- NON tocca le righe 'sources' duplicate/di cruft gia' identificate e
-- deliberatamente lasciate stare questa sessione (es. USDA_FDC_SR,
-- SONNENBURG_2016 senza suffisso, le varianti HEANEY_WEAVER_* non usate):
-- quella e' manutenzione separata, fuori scope qui.
--
-- Scritto per essere ri-eseguibile senza danni: ogni UPDATE tocca solo
-- source_type, mai citation/url_or_doi, e il blocco di verifica finale
-- segnala (non silenzia) qualunque id atteso che risultasse assente dalla
-- tabella o ancora NULL dopo l'esecuzione -- "zero dati inventati" vale
-- anche qui: se un id non esiste, va investigato, non ignorato.
-- ============================================================================

BEGIN;

-- --- Fonti del generatore Golden Set (SOURCES_NEW in generate_golden_set_foods.py) ---
-- Live oggi con source_type NULL perche' golden_set_foods.sql non e' stato
-- ri-eseguito contro il DB live in questa sessione (solo il generatore
-- Python e' stato rilanciato, che scrive il file ma non lo esegue).

UPDATE sources SET source_type = 'official_database' WHERE id = 'USDA_FDC';
UPDATE sources SET source_type = 'official_database' WHERE id = 'USDA_RETN06';
UPDATE sources SET source_type = 'peer_reviewed_study' WHERE id = 'NOONAN_SAVAGE_1999_APJCN';
UPDATE sources SET source_type = 'peer_reviewed_study' WHERE id = 'ERDOGAN_ONAR_2012_JFDA';
UPDATE sources SET source_type = 'peer_reviewed_study' WHERE id = 'ZIA_UR_REHMAN_2002_PJSIR';
UPDATE sources SET source_type = 'peer_reviewed_study' WHERE id = 'DONIEC_2022_MOLECULES';
UPDATE sources SET source_type = 'peer_reviewed_study' WHERE id = 'SIENER_2006_FOODCHEM';
UPDATE sources SET source_type = 'internal_estimate'   WHERE id = 'DERIVED_FDC_RAW_COOKED_RATIO';

-- --- Fonti citate SOLO dai motori (sourceIds hardcoded nei calcoli, mai nel
-- generatore Golden Set) -- tutte peer_reviewed_study tranne le quattro
-- institutional_report (rapporti/standard di un ente, non articoli su
-- rivista con peer review in senso stretto: DEFRA, IOM, NIH ODS, WULCA) e
-- AGRIBALYSE_3.1.1 (official_database: base dati LCA ADEME/INRAE, non uno
-- studio) ---

UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'ADAMS_1971';
UPDATE sources SET source_type = 'official_database'    WHERE id = 'AGRIBALYSE_3.1.1';
UPDATE sources SET source_type = 'institutional_report' WHERE id = 'DEFRA_FREIGHT_2023';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'GRABITSKE_SLAVIN_2008_CRFSN';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'HALLBERG_2000_SCANDJNUTR';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'HEANEY_WEAVER_1990_AJCN';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'HEANEY_WEAVER_RECKER_1988_AJCN';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'HEYSSEL_1966';
UPDATE sources SET source_type = 'institutional_report' WHERE id = 'IOM_1998_DRI_B_VITAMINS';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'LIVNY_2003_EURJNUTR';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'MCDONALD_2018_MSYSTEMS';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'MILLER_2007_JNUTR';
UPDATE sources SET source_type = 'institutional_report' WHERE id = 'NIH_ODS_FOLATE_FACT_SHEET';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'NNR2023_OLSEN_LERNER_FNR';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'SONNENBURG_2016_CELL';
UPDATE sources SET source_type = 'institutional_report' WHERE id = 'WULCA_AWARE_2018';
UPDATE sources SET source_type = 'peer_reviewed_study'  WHERE id = 'YOUNG_2007_JNUTR';

-- ============================================================================
-- Verifica difensiva: ogni id che il codice usa davvero deve esistere in
-- sources E avere source_type non-NULL dopo questo file. Se la query sotto
-- restituisce righe, qualcosa non e' andato come previsto (id scritto
-- male, riga non ancora inserita in produzione, ecc.) -- NON va ignorato.
-- ============================================================================

WITH expected_ids(id) AS (
  VALUES
    ('USDA_FDC'), ('USDA_RETN06'), ('NOONAN_SAVAGE_1999_APJCN'),
    ('ERDOGAN_ONAR_2012_JFDA'), ('ZIA_UR_REHMAN_2002_PJSIR'),
    ('DONIEC_2022_MOLECULES'), ('SIENER_2006_FOODCHEM'),
    ('DERIVED_FDC_RAW_COOKED_RATIO'), ('ADAMS_1971'), ('AGRIBALYSE_3.1.1'),
    ('DEFRA_FREIGHT_2023'), ('GRABITSKE_SLAVIN_2008_CRFSN'),
    ('HALLBERG_2000_SCANDJNUTR'), ('HEANEY_WEAVER_1990_AJCN'),
    ('HEANEY_WEAVER_RECKER_1988_AJCN'), ('HEYSSEL_1966'),
    ('IOM_1998_DRI_B_VITAMINS'), ('LIVNY_2003_EURJNUTR'),
    ('MCDONALD_2018_MSYSTEMS'), ('MILLER_2007_JNUTR'),
    ('NIH_ODS_FOLATE_FACT_SHEET'), ('NNR2023_OLSEN_LERNER_FNR'),
    ('SONNENBURG_2016_CELL'), ('WULCA_AWARE_2018'), ('YOUNG_2007_JNUTR')
)
SELECT e.id AS id_attesa,
       s.id AS trovata_in_sources,
       s.source_type
FROM expected_ids e
LEFT JOIN sources s ON s.id = e.id
WHERE s.id IS NULL OR s.source_type IS NULL;

COMMIT;

-- Se la SELECT sopra ha restituito 0 righe, il backfill ha coperto tutti i
-- 25 id attesi. Se ne ha restituite, NON correggere a mano in produzione:
-- riportare qui quali id manca(no) e perche' (id scritto in modo diverso
-- nel codice vs in sources? riga mai inserita? altro?) prima di procedere.
