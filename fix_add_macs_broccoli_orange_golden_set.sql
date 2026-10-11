-- ============================================================================
-- MACs (fibra solubile, AOAC 991.43): broccoli crudo, arance crude
-- (food_broccoli_raw, food_oranges_raw)
-- ============================================================================
--
-- CONTESTO: PRD.md §9 Fase 1 punto 8b, problema 4 (gap sui 9 alimenti
-- vegetali). Terzo sottoinsieme MACs usato in questo progetto dopo "amido
-- resistente" (legumi/patata/pasta) e "pectina" (carote/spinaci) --
-- "fibra solubile" (soluble dietary fiber, metodo AOAC 991.43), anch'esso
-- esplicitamente elencato come componente dei MACs in Sonnenburg &
-- Sonnenburg 2016 (vedi PRD §9, decisione di scope originale). E' lo
-- stesso campo concettuale che si tentava di leggere da USDA FDC
-- ("Fiber, soluble") in questa sessione per kale/cavoletti/broccoli/
-- mandorle/arance, risultato assente o bloccato da rate-limit per questi
-- alimenti -- qui trovato invece direttamente da una fonte primaria.
--
-- FONTE: Li BW, Andrews KW, Pehrsson PR. Individual sugars, soluble, and
-- insoluble dietary fiber contents of 70 high consumption foods. J Food
-- Compos Anal. 2002;15(6):715-723. DOI: 10.1006/jfca.2002.1096. Metodo
-- AOAC 991.43 (enzimatico-gravimetrico), campioni acquistati freschi da
-- due catene di supermercati USA e compositati. Full-text letto
-- direttamente (non di seconda mano) via WebFetch sul PDF ufficiale
-- ARS-USDA (ars.usda.gov/arsuserfiles/80400525/articles/jfca15_715-723.pdf),
-- Tabella 1, verificata contro l'elenco completo dei 70 alimenti per
-- escludere errori di trascrizione.
--
-- Valori letti (g/100g COME CONSUMATO -- il paper dichiara esplicitamente
-- "as eaten", nessuna conversione sostanza-secca necessaria, a differenza
-- delle fonti dwb usate per legumi/patata/pasta/carote/spinaci):
--   Broccoli, raw:            fibra solubile 0.44 g/100g
--   Oranges (Navel), raw, ripe: fibra solubile 1.37 g/100g
--
--   macs_mg = g/100g * 1000
--   Broccoli: 0.44 * 1000 = 440
--   Arance:   1.37 * 1000 = 1370
--
-- Il paper non riporta deviazione standard né numero di campioni (n) per
-- queste due righe (nessuna nota "mean of duplicate analyses" associata,
-- a differenza di una singola voce di pane nella stessa tabella) -- punto
-- stimato singolo, non una media statistica, dichiarato non nascosto.
--
-- LIMITE DICHIARATO (arance, cultivar): il paper usa specificamente
-- "Oranges (Navel)", mentre il food_id del Golden Set (fdc_id 169097)
-- e' mappato su "Oranges, raw, all commercial varieties" (USDA FDC) --
-- una media generica, non la sola cultivar Navel. Stesso tipo di caveat
-- gia' accettato in questo progetto per il fagiolo kidney (Yadav 2010 vs
-- USDA FDC 175194) -- dichiarato, non un errore nuovo di metodo.
--
-- LIMITE DI SCOPE (broccoli, stato cotto): food_broccoli_boiled NON
-- riceve macs_mg qui. Il paper riporta un valore cotto ("Broccoli, fresh,
-- microwaved": 1.85 g/100g) ma e' un METODO DI COTTURA DIVERSO dal
-- "bollito e scolato" del Golden Set -- la bollitura in acqua causa
-- lisciviazione della fibra solubile nell'acqua di cottura in modo
-- sostanzialmente diverso dalla cottura a microonde (poca/nessuna acqua
-- di immersione), quindi usare il valore a microonde per lo stato bollito
-- introdurrebbe un bias sistematico non quantificabile, non lo eviterebbe.
-- Gap dichiarato, non forzato. (Nota: food_broccoli_boiled resta
-- comunque una riga 'draft'/non promossa nel Golden Set, usata solo come
-- base di calcolo del fattore di ritenzione per altri nutrienti -- non
-- visibile come alimento separato in UI, quindi l'impatto pratico di
-- questo gap specifico e' basso.)
--
-- verification_status='draft'.
-- ============================================================================

INSERT INTO sources (id, citation, url_or_doi, source_type) VALUES
  ('LI_ANDREWS_PEHRSSON_2002_JFCA',
   'Li BW, Andrews KW, Pehrsson PR. Individual sugars, soluble, and insoluble dietary fiber contents of 70 high consumption foods. J Food Compos Anal. 2002;15(6):715-723. Tabella 1 (metodo AOAC 991.43, g/100g come consumato): Broccoli, raw -- fibra solubile 0.44; Oranges (Navel), raw, ripe -- fibra solubile 1.37. Valori macs_mg qui usati direttamente senza conversione (il paper e'' gia'' su base "as eaten"). Vedi commento in fix_add_macs_broccoli_orange_golden_set.sql per i limiti dichiarati (cultivar arance: Navel vs "all commercial varieties"; nessun valore per lo stato bollito del broccoli, solo "microwaved", metodo di cottura diverso non usato).',
   'https://doi.org/10.1006/jfca.2002.1096',
   'peer_reviewed_study')
ON CONFLICT (id) DO UPDATE SET
  citation = EXCLUDED.citation, url_or_doi = EXCLUDED.url_or_doi, source_type = EXCLUDED.source_type;

INSERT INTO nutrient_values (food_id, nutrient_code, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('food_broccoli_raw', 'macs_mg', 440,  NULL, NULL, 'LI_ANDREWS_PEHRSSON_2002_JFCA', 'draft'),
  ('food_oranges_raw',  'macs_mg', 1370, NULL, NULL, 'LI_ANDREWS_PEHRSSON_2002_JFCA', 'draft')
ON CONFLICT (food_id, nutrient_code) DO UPDATE SET
  value = EXCLUDED.value, source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- Verifica difensiva.
DO $$
DECLARE
  missing TEXT;
BEGIN
  SELECT string_agg(expected.food_id, ', ') INTO missing
  FROM (VALUES ('food_broccoli_raw'), ('food_oranges_raw')) AS expected(food_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM nutrient_values nv
    WHERE nv.food_id = expected.food_id
      AND nv.nutrient_code = 'macs_mg'
      AND nv.source_id = 'LI_ANDREWS_PEHRSSON_2002_JFCA'
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'macs_mg mancante per: %', missing;
  END IF;
END $$;
