-- ============================================================================
-- Estensione cooking_method_enum: aggiunge i due valori granulari richiesti
-- da retention_factors_legumi_tuberi.sql, scoperti mancanti alla prima
-- esecuzione reale contro il DB live (2026-10-09). Valori validi precedenti:
-- raw, boiled, steamed, roasted, fried, microwaved, baked.
--
-- DA ESEGUIRE IN UNA QUERY SEPARATA rispetto a qualunque INSERT che usi i
-- nuovi valori: Postgres non permette di usare un valore enum appena
-- aggiunto nella stessa transazione in cui e' stato aggiunto (ALTER TYPE ...
-- ADD VALUE e' transazionale da PG12 in poi, ma il nuovo valore resta
-- "invisibile" al resto della stessa transazione/batch).
--
-- boiled_quick_15_20min: legumi a cottura rapida (lenticchie, piselli) --
--   USDA Release 6, p.14, riga 0501 -- ferro 85% vs 80% della cottura lunga
--   (riga 0521, gia' mappata sul valore generico 'boiled'): differenza
--   reale (non rumore statistico), quindi la distinzione va preservata
--   nello schema.
--
-- boiled_in_skin: patate bollite in buccia -- USDA Release 6, p.8, riga
--   3307. NOTA: la riga 3308 "BOILED(PARED)DRAIN" (patate sbucciate prima
--   di bollire) riporta valori IDENTICI (Fe/Zn/VitC = 95/95/75) -- quindi
--   NON creiamo un valore enum separato 'boiled_pared': la distinzione resta
--   documentata nel commento della fonte, non nello schema, per non
--   introdurre un'etichetta che non corrisponde a nessun dato realmente
--   diverso (vedi retention_factors_legumi_tuberi.sql).
-- ============================================================================

ALTER TYPE cooking_method_enum ADD VALUE IF NOT EXISTS 'boiled_quick_15_20min';
ALTER TYPE cooking_method_enum ADD VALUE IF NOT EXISTS 'boiled_in_skin';
