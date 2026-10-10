-- ============================================================================
-- Pulizia: 4 righe cruft non sourced ereditate da food_chickpeas_raw
-- ============================================================================
--
-- SCOPERTO durante la verifica di golden_set_raw_baselines.sql (2026-10-10):
-- food_chickpeas_raw era GIA' un food_id esistente -- uno dei 19 alimenti
-- demo/seed pre-Golden-Set documentati in fix_baseline_cooking_state.sql
-- (lista esplicita: "...food_chickpeas_raw..."), con verification_status
-- già 'draft' (quindi mai stato visibile in UI, a differenza dei 4 "fantasmi"
-- verified già gestiti in quel file).
--
-- golden_set_raw_baselines.sql ha riusato questo stesso food_id per inserire
-- dati crudi nuovi e rigorosamente sourced (USDA FDC 173756), ma tramite
-- ON CONFLICT (food_id, nutrient_code) DO UPDATE -- che aggiorna solo le
-- righe nutrient_values con nutrient_code già presenti nell'INSERT. 4 righe
-- del vecchio seed non facevano parte dell'elenco e sono sopravvissute
-- invariate, agganciate allo stesso food_id ora "verificato come sourced":
--
--   nutrient_code    | value  | source_id
--   macs_mg           | 7600.0 | NULL
--   oxalates_mg        | 30.0   | NULL
--   phytates_mg        | 960.0  | NULL
--   polyphenols_mg      | 100.0  | NULL
--
-- macs_mg è un campo realmente usato da calculateMicrobiotaImpactScore
-- (lib/engine/microbiotaEngine.ts) -- non è un residuo innocuo come
-- is_heme_iron (vedi cleanup_is_heme_iron_cruft.sql): se mai promosso a
-- 'verified' insieme al resto, un valore di MACs/antinutrienti senza fonte
-- citata violerebbe silenziosamente "zero dati inventati", mescolato a dati
-- altrimenti ben documentati (FDC 173756).
--
-- STESSO SCHEMA già applicato a food_lentils_raw in golden_set_raw_baselines.sql
-- (DELETE del vecchio cruft prima dell'INSERT nuovo) -- qui la pulizia arriva
-- a posteriori perché la natura "legacy" di questo food_id non era stata
-- riconosciuta durante la stesura del file principale.
--
-- Eseguito e verificato contro il DB live (2026-10-10): 0 righe a fonte NULL
-- rimaste su uno qualsiasi dei 9 nuovi alimenti raw-baseline dopo il DELETE.
-- ============================================================================

DELETE FROM nutrient_values
WHERE food_id = 'food_chickpeas_raw'
  AND nutrient_code IN ('macs_mg', 'oxalates_mg', 'phytates_mg', 'polyphenols_mg')
  AND source_id IS NULL;
