-- ============================================================================
-- FIX 1: tabella sources, allineata ESATTAMENTE agli ID usati nei 4 motori
-- TypeScript aggiornati. Nota: HEANEY_WEAVER_1988 e HEANEY_WEAVER_1990
-- erano scambiati nel seed precedente (il 1988 e' lo studio sugli SPINACI,
-- non sul kale).
-- ============================================================================

INSERT INTO sources (id, citation) VALUES
  ('MILLER_2007_JNUTR', 'Miller LV, Krebs NF, Hambidge KM. A mathematical model of zinc absorption in humans as a function of dietary zinc and phytate. J Nutr 2007;137(1):135-141. DOI 10.1093/jn/137.1.135'),
  ('HEANEY_WEAVER_RECKER_1988_AJCN', 'Heaney RP, Weaver CM, Recker RR. Calcium absorbability from spinach. Am J Clin Nutr 1988;47:707-9. [assorbimento ~5%, alto ossalato]'),
  ('HEANEY_WEAVER_1990_AJCN', 'Heaney RP, Weaver CM. Calcium absorption from kale. Am J Clin Nutr 1990;51:656-7. [assorbimento 40.9% +/- 10.1pp, basso ossalato]'),
  ('HALLBERG_2000_SCANDJNUTR', 'Hallberg L. New tools in studies on iron nutrition. Scand J Nutr 2000;44:150-154 (riporta la correzione dell''Equazione 2 di Hallberg L, Hulthen L. Prediction of dietary iron absorption. Am J Clin Nutr 2000;71:1147-60)'),
  ('YOUNG_2007_JNUTR', 'Young MF et al. Iron absorption prediction equations lack agreement and underestimate iron absorption. J Nutr 2007;137(7):1741-1746'),
  ('DEFRA_FREIGHT_2023', 'DEFRA UK, 2023 - Greenhouse Gas Reporting: Conversion Factors (fattore trasporto aereo merci, da verificare contro la tabella dell''anno in uso)'),
  ('WULCA_AWARE_2018', 'WULCA AWARE method, 2018 - Water scarcity footprint'),
  ('AGRIBALYSE_3.1.1', 'ADEME/INRAE. Agribalyse 3.1.1 - base dati LCA agroalimentare francese'),
  ('SONNENBURG_2016_CELL', 'Sonnenburg ED, Sonnenburg JL et al. Diet-induced extinctions in the gut microbiota compound over generations. Nature/Cell Press, 2016'),
  ('MCDONALD_2018_MSYSTEMS', 'McDonald D et al. American Gut: an Open Platform for Citizen Science Microbiome Research. mSystems 2018'),
  ('GRABITSKE_SLAVIN_2008_CRFSN', 'Grabitske HA, Slavin JL. Gastrointestinal effects of low-digestible carbohydrates. Crit Rev Food Sci Nutr 2008'),
  ('USDA_RETN06', 'USDA Table of Nutrient Retention Factors, Release 6 (2007). Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation;

-- ============================================================================
-- FIX 2: RLS. La sessione precedente ha disabilitato del tutto la RLS su
-- retention_factors e nutrient_values per sbloccare un debug. Corretto:
-- si riattiva e si usa la stessa policy di sola lettura pubblica gia'
-- applicata correttamente a foods_raw/sources/food_matrices_master. Questi
-- dati sono di riferimento, non personali, quindi la lettura pubblica va
-- bene -- cio' che non va bene e' lasciare la tabella senza RLS, che
-- permetterebbe anche scritture non autorizzate.
-- ============================================================================

ALTER TABLE retention_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read retention_factors" ON retention_factors;
CREATE POLICY "public read retention_factors" ON retention_factors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read nutrient_values" ON nutrient_values;
CREATE POLICY "public read nutrient_values" ON nutrient_values
  FOR SELECT USING (true);

-- ============================================================================
-- FIX 3: retention_factors -- SOLO il dato che ho verificato io stesso
-- contro la fonte primaria in questa sessione. Tutto il resto (gli altri
-- ~20 fattori del blocco CSV proposto in precedenza) va ricercato riga per
-- riga prima di essere inserito: non e' stato davvero "incrociato con le
-- tabelle USDA", come dichiarato -- quei numeri erano inventati. Meglio
-- una tabella quasi vuota e onesta che una piena e falsa.
--
-- Nota di matrice: la tabella USDA Release 6 usa "verdure a foglia,
-- bollite" come categoria, non "spinaci" nello specifico -- e distingue
-- "poca acqua, scolata" (60%) da "molta acqua, scolata" (55%) da "acqua
-- consumata, es. zuppa" (70%). Qui usiamo il valore centrale per bollitura
-- standard con acqua scolata, con il range reale come confidence bounds.
-- ============================================================================

INSERT INTO food_matrices_master (matrix_id, description_it)
VALUES ('leafy_greens', 'Verdure a foglia verde')
ON CONFLICT (matrix_id) DO NOTHING;

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id)
VALUES
  ('leafy_greens', 'boiled', 'vitamin_c', 0.58, 0.55, 0.60, 'USDA_RETN06')
ON CONFLICT DO NOTHING;

-- TODO (prossimi dati da cercare e verificare uno per uno, NON da inventare
-- in blocco): leafy_greens/steamed/vitamin_c; legumes/boiled/phytates;
-- pome_fruits/steamed/polyphenols; qualunque fattore per la matrice "meat".
