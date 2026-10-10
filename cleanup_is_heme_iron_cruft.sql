-- ============================================================================
-- Pulizia: righe residue 'is_heme_iron' in nutrient_values (vecchio seed demo)
-- ============================================================================
--
-- is_heme_iron è una colonna booleana di foods_raw (vedi golden_set_foods.sql,
-- INSERT INTO foods_raw (..., is_heme_iron, ...)) — NON un nutrient_code
-- valido: la lista di nutrient_code reali in uso è iron_mg/zinc_mg/
-- calcium_mg/vitamin_c_mg/... (sempre con suffisso unità). Due righe cruft
-- in nutrient_values duplicavano però questa informazione come se fosse un
-- nutriente, residuo di un vecchio seed demo pre-Golden Set:
--
--   food_id            | nutrient_code  | value | source_id     | verification_status
--   food_beef_raw      | is_heme_iron   | 1.0   | USDA_FDC_SR   | draft
--   food_spinach_raw   | is_heme_iron   | 0.0   | USDA_FDC_SR   | draft
--
-- Innocue (nessun motore legge nutrient_code='is_heme_iron'), ma messe in
-- luce durante il code-review di sessione e segnalate all'utente per
-- trasparenza prima di toccarle. food_beef_raw non è nemmeno nel Golden Set
-- corrente (nessun INSERT in foods_raw per quel food_id in
-- golden_set_foods.sql) — residuo doppiamente orfano. food_spinach_raw è un
-- alimento reale del Golden Set, ma il suo is_heme_iron=false è già
-- correttamente rappresentato come colonna in foods_raw; questa riga era
-- solo un duplicato ridondante.
--
-- Eseguito e verificato contro il DB live (2026-10-10): 0 righe
-- nutrient_code='is_heme_iron' rimaste dopo il DELETE; nutrient_values
-- passato da 464 a 462 righe totali, nessun'altra riga toccata (verificato
-- con SELECT count(*) mirato su food_spinach_raw prima/dopo).
-- ============================================================================

DELETE FROM nutrient_values
WHERE nutrient_code = 'is_heme_iron'
  AND food_id IN ('food_spinach_raw', 'food_beef_raw');
