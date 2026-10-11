-- ============================================================================
-- Completamento del gap scoperto durante fix_backfill_source_type.sql
-- (vedi docs/PRD.md §4.7, addendum 2026-10-11): 6 source_id citati dal
-- motore (B12, folati, vitamina A) non avevano NESSUNA riga in sources --
-- non NULL, proprio assenti. Qui si inseriscono, con la citazione reale
-- verificata quando disponibile, e un limite dichiarato esplicitamente
-- quando non lo e' (stesso standard di trasparenza gia' usato per
-- SIENER_2006_FOODCHEM: citazione di seconda mano dichiarata come tale,
-- mai presentata come se fosse stata letta per intero).
--
-- Fonti verificate direttamente in questa sessione (fetch diretto, non a
-- memoria):
-- - IOM_1998_DRI_B_VITAMINS: Institute of Medicine (US) Standing Committee
--   on the Scientific Evaluation of Dietary Reference Intakes and its Panel
--   on Folate, Other B Vitamins, and Choline. Dietary Reference Intakes for
--   Thiamin, Riboflavin, Niacin, Vitamin B6, Folate, Vitamin B12,
--   Pantothenic Acid, Biotin, and Choline. Washington (DC): National
--   Academies Press (US); 1998. Capitolo 9 (Vitamin B12), NCBI Bookshelf
--   NBK114302. Letto direttamente (fetch NBK114302).
-- - NIH_ODS_FOLATE_FACT_SHEET: NIH Office of Dietary Supplements. Folate:
--   Fact Sheet for Health Professionals. URL verificata attiva in questa
--   sessione.
-- - LIVNY_2003_EURJNUTR / NNR2023_OLSEN_LERNER_FNR: citazioni complete
--   gia' presenti e verificate in docs/PRD.md §4.2 (sessione precedente).
--
-- NON pienamente verificati (dichiarato, non nascosto): ADAMS_1971 e
-- HEYSSEL_1966 sono citati nel testo del capitolo 9 del report IOM 1998
-- (confermato con un fetch diretto di NBK114302: "Adams and colleagues
-- (1971)" ancora #ch9.r4; "Heyssel et al., 1966" ancora #ch9.r68, per
-- esattamente le stesse affermazioni gia' descritte nei commenti di
-- computationalNutritionEngine.ts), ma la lista bibliografica completa
-- del capitolo (rivista, volume, pagine) non e' stata raggiungibile in
-- questa sessione (il fetch si tronca prima della sezione References).
-- Citazione quindi limitata a quanto verificato di persona: autore/anno
-- + il report IOM come fonte secondaria che li cita, SENZA inventare
-- rivista/volume/pagine.
-- ============================================================================

BEGIN;

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('IOM_1998_DRI_B_VITAMINS',
   'Institute of Medicine (US) Standing Committee on the Scientific Evaluation of Dietary Reference Intakes and its Panel on Folate, Other B Vitamins, and Choline. Dietary Reference Intakes for Thiamin, Riboflavin, Niacin, Vitamin B6, Folate, Vitamin B12, Pantothenic Acid, Biotin, and Choline. Washington (DC): National Academies Press (US); 1998. Capitolo 9, Vitamin B12.',
   'https://www.ncbi.nlm.nih.gov/books/NBK114302/', 'institutional_report'),
  ('NIH_ODS_FOLATE_FACT_SHEET',
   'NIH Office of Dietary Supplements. Folate: Fact Sheet for Health Professionals.',
   'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/', 'institutional_report'),
  ('LIVNY_2003_EURJNUTR',
   'Livny O, Reifen R, Levy I, Madar Z, Faulks R, Southon S, Schwartz B. Beta-carotene bioavailability from differently processed carrot meals in human ileostomy volunteers. Eur J Nutr. 2003;42(6):338-345.',
   'https://doi.org/10.1007/s00394-003-0421-8', 'peer_reviewed_study'),
  ('NNR2023_OLSEN_LERNER_FNR',
   'Olsen T, Lerner UH. Vitamin A - a scoping review for Nordic Nutrition Recommendations 2023. Food Nutr Res. 2023;67:10229.',
   'https://doi.org/10.29219/fnr.v67.10229', 'peer_reviewed_study'),
  ('ADAMS_1971',
   'Citato come "Adams and colleagues (1971)" nel capitolo 9 (Vitamin B12) di IOM 1998 (vedi IOM_1998_DRI_B_VITAMINS), per la misura dell''assorbimento frazionale di cianocobalamina radiomarcata a dosi diverse. Citazione bibliografica completa (rivista/volume/pagine) NON verificata direttamente in questa sessione -- il fetch del capitolo IOM si e'' troncato prima della sezione References. Da completare prima di considerare questa riga allo stesso livello di affidabilita'' delle altre peer_reviewed_study del progetto.',
   NULL, 'peer_reviewed_study'),
  ('HEYSSEL_1966',
   'Citato come "Heyssel et al., 1966" nel capitolo 9 (Vitamin B12) di IOM 1998 (vedi IOM_1998_DRI_B_VITAMINS), per l''assorbimento da una pasta di fegato contenente 38 ug di B12. Citazione bibliografica completa (rivista/volume/pagine) NON verificata direttamente in questa sessione -- il fetch del capitolo IOM si e'' troncato prima della sezione References; un autore omonimo (Heyssel RM) compare come co-autore di Bozian et al. 1963, Am J Clin Nutr 12:117-129, ma non e'' lo stesso paper del 1966 citato qui. Da completare prima di considerare questa riga allo stesso livello di affidabilita'' delle altre peer_reviewed_study del progetto.',
   NULL, 'peer_reviewed_study')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

-- Verifica: tutti e 6 ora devono esistere con source_type non-NULL.
SELECT id, source_type, (citation IS NOT NULL) AS ha_citazione
FROM sources
WHERE id IN ('IOM_1998_DRI_B_VITAMINS','NIH_ODS_FOLATE_FACT_SHEET','LIVNY_2003_EURJNUTR','NNR2023_OLSEN_LERNER_FNR','ADAMS_1971','HEYSSEL_1966')
ORDER BY id;

COMMIT;
