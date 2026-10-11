-- ============================================================================
-- Righe `sources` mancanti per LARN_2024_SINU, EFSA_DRV_SUMMARY_2017,
-- LARN_2024_SINU_PORZIONI_STANDARD
-- ============================================================================
--
-- Chiude 2 delle 4 voci in docs/PENDING_HUMAN_ACTIONS.md (sessione
-- interattiva, 2026-10-11). Questi sourceIds sono già referenziati da
-- lib/engine/nutrientTargets.ts (LARN_2024_SINU, EFSA_DRV_SUMMARY_2017,
-- 12 target numerici LARN/EFSA per micronutrienti, docs/PRD.md §4.9) e da
-- lib/engine/standardPortions.ts (LARN_2024_SINU_PORZIONI_STANDARD,
-- porzioni standard LARN per 28/30 food_id del Golden Set, docs/PRD.md
-- §4.8/§4.9) -- questo file dà loro finalmente una riga reale nella
-- tabella `sources`, nessun dato nutrizionale nuovo viene scritto qui.
--
-- Gap di provenienza dichiarato (Regola 6, non un fallimento silenzioso):
-- nessuna delle due citazioni LARN è stata consultata sul PDF ufficiale
-- SINU (sinu.it/larn/, non raggiunto in questa sessione per assenza di
-- accesso di rete diretto, vedi CLAUDE.md) -- sono consultate tramite le
-- pubblicazioni secondarie indicate di seguito nella citation stessa.
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, publisher, source_type) VALUES
  ('LARN_2024_SINU',
   'LARN V Revisione (2024), SINU -- Livelli di Assunzione di Riferimento di Nutrienti ed energia per la popolazione italiana. Consultata tramite le tabelle di sintesi SmartFood/IEO (non il PDF ufficiale SINU -- gap dichiarato): smartfood.ieo.it/media/ad5l2acl/smartfood_tabella_larn_minerali_2025.pdf, smartfood.ieo.it/media/wefj2kxp/smartfood_tabella_larn_vitamine_idrosolubili_2025.pdf, smartfood.ieo.it/media/swie5abw/smartfood_tabella_larn_vitamine_liposolubili_2025.pdf.',
   'https://smartfood.ieo.it/media/ad5l2acl/smartfood_tabella_larn_minerali_2025.pdf',
   'SINU (consultata via SmartFood/IEO)',
   'institutional_report'),
  ('EFSA_DRV_SUMMARY_2017',
   'EFSA (European Food Safety Authority), "Dietary Reference Values for nutrients: Summary report". EFSA Supporting Publication 2017:e15121. Usata come cross-check indipendente dei valori LARN 2024 per i micronutrienti numerici di lib/engine/nutrientTargets.ts, non come fonte primaria sostitutiva.',
   'https://doi.org/10.2903/sp.efsa.2017.e15121',
   'EFSA',
   'institutional_report'),
  ('LARN_2024_SINU_PORZIONI_STANDARD',
   'LARN V Revisione (2024), SINU -- "Standard quantitativi delle porzioni" (stessa edizione di LARN_2024_SINU, sezione porzioni). Consultata tramite la pubblicazione secondaria SSD IAN ATS Brescia, "Porzioni standard degli alimenti per la popolazione adulta" (ats-brescia.it, datata 27/03/2025) -- NON il PDF ufficiale SINU originale, stesso gap di provenienza dichiarato per LARN_2024_SINU. Pesi riferiti all''alimento crudo, al netto degli scarti (per i surgelati, anche della glassatura) -- dichiarato esplicitamente dalla fonte stessa.',
   'https://www.ats-brescia.it/',
   'SINU (consultata via SSD IAN ATS Brescia)',
   'institutional_report')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation,
  url_or_doi = EXCLUDED.url_or_doi,
  publisher = EXCLUDED.publisher,
  source_type = EXCLUDED.source_type;

-- ============================================================================
-- Verifica difensiva (Regola 4): le 3 righe devono esistere con id e
-- source_type attesi -- se manca anche una sola, RAISE EXCEPTION.
-- ============================================================================
DO $$
DECLARE
  trovate int;
BEGIN
  SELECT count(*) INTO trovate
  FROM sources
  WHERE id IN ('LARN_2024_SINU', 'EFSA_DRV_SUMMARY_2017', 'LARN_2024_SINU_PORZIONI_STANDARD')
    AND source_type = 'institutional_report'
    AND citation IS NOT NULL;

  IF trovate <> 3 THEN
    RAISE EXCEPTION 'Attese 3 righe sources con source_type institutional_report e citation non nulla, trovate %', trovate;
  END IF;

  RAISE NOTICE 'OK: % righe sources scritte correttamente (LARN_2024_SINU, EFSA_DRV_SUMMARY_2017, LARN_2024_SINU_PORZIONI_STANDARD).', trovate;
END $$;
