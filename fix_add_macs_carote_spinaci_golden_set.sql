-- ============================================================================
-- MACs (pectina, non amido resistente): carote crude e spinaci crudi
-- (food_carrots_raw, food_spinach_raw)
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b, problema 4. Primi due alimenti del
-- gap "9 alimenti vegetali oltre ai legumi/patata/pasta" risolti con una
-- fonte sul sottoinsieme PECTINA dei MACs (non amido resistente -- carote e
-- spinaci non sono fonti significative di RS). Pectina e' esplicitamente
-- elencata come componente dei MACs in Sonnenburg & Sonnenburg 2016 (vedi
-- PRD §9, decisione di scope). macs_mg per questi due alimenti va quindi
-- documentato come "pectina sourced", non "amido resistente sourced" come
-- per legumi/patata/pasta -- sottoinsiemi diversi dello stesso campo.
--
-- FONTE: Bailoni L, Schiavon S, Pagnin G, Tagliapietra F, Bonsembiante M.
-- Quanti-qualitative evaluation of pectins in the dietary fibre of 24
-- foods. Ital J Anim Sci. 2005;4(1):49-58. DOI: 10.4081/ijas.2005.49.
-- Full-text letto per intero direttamente dal PDF (tandfonline.com, accesso
-- libero) via pdf.js, stesso metodo esatto gia' usato per le altre fonti di
-- questa sessione -- non una sintesi di seconda mano.
--
-- Nota di dominio: lo studio e' pubblicato su una rivista di zootecnia e
-- copre sia alimenti per uso umano (carote, spinaci, lattuga, cicoria,
-- mele, pere, legumi) sia mangimi zootecnici (farina d'orzo, crusca,
-- polpe di bietola essiccate, ecc.) -- i due alimenti qui usati (carote,
-- spinaci) sono descritti in modo identico a come comparirebbero in uno
-- studio di scienza dell'alimentazione umana (stesso metodo AOAC
-- standard), quindi la provenienza editoriale non ne inficia la validita'.
--
-- Tabella 4 (pectine totali, TP, g/kg sostanza secca) e Tabella 2 (sostanza
-- secca, %), stesso campione per ciascun alimento:
--   Carote, crude e sbucciate:  TP 31.76 ± 1.57 g/kg DM; DM 9.6%
--   Spinaci (crudi):            TP 33.48 ± 0.26 g/kg DM; DM 11.4%
--
--   macs_mg = TP(g/kg DM)/10 * DM_fraction * 1000
--   Carote:   3.176 * 0.096 * 1000 = 304.9 -> 305
--   Spinaci:  3.348 * 0.114 * 1000 = 381.7 -> 382
--
-- LIMITE DICHIARATO (sostanza secca): la sostanza secca riportata dal paper
-- per questi campioni (carote 9.6%, spinaci 11.4%) e' significativamente
-- diversa da quella dell'alimento FDC gia' usato nel Golden Set per questi
-- due food_id (USDA FDC: carote crude 11.71% DM [acqua 88.29%], spinaci
-- crudi 8.6% DM [acqua 91.4%] -- valori quasi INVERTITI rispetto al paper,
-- verificato indipendentemente via API ufficiale USDA FDC lo stesso
-- giorno). Scelta consapevole: usata la sostanza secca DEL PAPER STESSO
-- (non quella USDA) perche' e' stata misurata sullo stesso campione fisico
-- di cui e' stata misurata la pectina (Tabella 2 e Tabella 4 condividono
-- gli stessi campioni) -- mescolare il rapporto pectina/sostanza-secca di
-- un campione con la sostanza secca media di un campione USDA diverso
-- avrebbe introdotto un errore sistematico, non lo avrebbe evitato. La
-- discrepanza stessa (probabile differenza di cultivar/stagione/paese fra
-- i campioni italiani del 2005 e quelli USDA) resta dichiarata qui, non
-- nascosta -- se si trovasse un'altra fonte con DM piu' vicina al Golden
-- Set, i valori andrebbero ricalcolati.
--
-- LIMITE DI SCOPE: solo lo stato CRUDO e' coperto qui. food_carrots_boiled
-- e food_spinach_boiled (merged via retention factor per gli altri
-- nutrienti, vedi fix_add_spinach_brussels_retention_factors.sql) restano
-- SENZA macs_mg: la pectina si modifica (in parte si solubilizza
-- nell'acqua di cottura) durante la bollitura, un effetto reale non
-- quantificato da questa fonte ne' da alcun retention_factor esistente per
-- il nutriente "macs" -- gap dichiarato, non forzato con una stima.
--
-- verification_status='draft'.
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('BAILONI_2005_ITALJANIMSCI',
   'Bailoni L, Schiavon S, Pagnin G, Tagliapietra F, Bonsembiante M. Quanti-qualitative evaluation of pectins in the dietary fibre of 24 foods. Ital J Anim Sci. 2005;4(1):49-58. Tabella 4 (pectine totali) e Tabella 2 (sostanza secca), stesso campione: Carote crude e sbucciate TP 31.76±1.57 g/kg DM, DM 9.6%; Spinaci TP 33.48±0.26 g/kg DM, DM 11.4%. Valori macs_mg qui derivati come g/100g come consumato usando la sostanza secca DELLO STESSO CAMPIONE del paper (non quella USDA FDC, significativamente diversa per questi due alimenti) -- vedi commento in fix_add_macs_carote_spinaci_golden_set.sql per il limite dichiarato su questa scelta e sulla copertura limitata allo stato crudo.',
   'https://doi.org/10.4081/ijas.2005.49',
   'peer_reviewed_study')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_carrots_raw', 'macs_mg', 305, NULL, NULL, 'BAILONI_2005_ITALJANIMSCI', 'draft'),
  ('food_spinach_raw', 'macs_mg', 382, NULL, NULL, 'BAILONI_2005_ITALJANIMSCI', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva.
DO $$
DECLARE
  missing TEXT;
BEGIN
  SELECT string_agg(expected.food_id, ', ') INTO missing
  FROM (VALUES ('food_carrots_raw'), ('food_spinach_raw')) AS expected(food_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrient_values nv
    WHERE nv.food_id = expected.food_id
      AND nv.nutrient_code = 'macs_mg'
      AND nv.source_id = 'BAILONI_2005_ITALJANIMSCI'
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'macs_mg mancante per: %', missing;
  END IF;
END $$;
