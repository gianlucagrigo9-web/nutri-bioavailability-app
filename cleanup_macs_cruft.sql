-- ============================================================================
-- Pulizia: ultime 2 righe macs_mg cruft non sourced sul Golden Set attuale
-- ============================================================================
--
-- SCOPERTO durante il primo collaudo end-to-end dell'app (2026-10-10):
-- l'utente ha notato che il punteggio MACs (Asse Microbiota) nel Meal
-- Builder cambia solo per pochissimi alimenti aggiunti al piatto.
--
-- Verifica: nel DB esistono 18 righe nutrient_code='macs_mg' in totale,
-- ma SOLO 2 corrispondono a food_id realmente presenti nel Golden Set
-- attuale (29 alimenti, vedi scripts/generate_golden_set_foods.py):
--
--   food_id            | value   | source_id | verification_status
--   food_broccoli_raw  | 2600.0  | NULL      | draft
--   food_spinach_raw   | 2200.0  | NULL      | draft
--
-- Le altre 16 righe sono residuo del vecchio seed demo pre-Golden-Set, su
-- food_id che non esistono affatto in foods_raw per il Golden Set attuale
-- (food_apple_raw, food_walnuts_raw, food_quinoa_raw, food_oats_raw,
-- food_beans_kidney_raw, food_buckwheat_raw, food_dates_raw,
-- food_flaxseed_raw, food_garlic_raw, food_lemon_raw, food_potatoes_raw,
-- food_rice_brown_raw, food_spelt_raw, food_strawberries_raw,
-- food_almonds_raw [nota: diverso da food_almonds, quello vero nel
-- Golden Set], food_beef_raw) -- innocue, non raggiungibili da nessuna
-- query dell'app perché quei food_id non hanno una riga foods_raw
-- corrispondente nel Golden Set, quindi non richiedono pulizia.
--
-- Le 2 righe sopra invece SONO raggiungibili (il food_id esiste davvero
-- nel Golden Set) e hanno un impatto reale sul calcolo MACs mostrato in
-- UI -- ma source_id è NULL: stesso identico schema già trovato e pulito
-- per food_chickpeas_raw in questa sessione (cleanup_chickpeas_raw_cruft.sql).
-- Confermato con l'utente: rimuovere.
--
-- EFFETTO NETTO: dopo questa pulizia, NESSUNO dei 29 alimenti del Golden
-- Set ha più un valore macs_mg sourced -- il punteggio MACs nel Meal
-- Builder torna onestamente a 0/assente per qualunque combinazione di
-- alimenti, finché non viene aggiunta una fonte vera (USDA / letteratura
-- su fibra fermentabile, amido resistente, inulina per alimento). Questo
-- è un gap di dati dichiarato, non un difetto del motore: documentato in
-- docs/PRD.md §9 Fase 1.
--
-- Eseguito e verificato contro il DB live (2026-10-10): 0 righe
-- nutrient_code='macs_mg' rimaste per food_broccoli_raw/food_spinach_raw.
-- ============================================================================

DELETE FROM nutrient_values
WHERE nutrient_code = 'macs_mg'
  AND source_id IS NULL
  AND food_id IN ('food_broccoli_raw', 'food_spinach_raw');
