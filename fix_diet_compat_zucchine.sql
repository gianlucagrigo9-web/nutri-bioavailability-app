-- fix_diet_compat_zucchine.sql (2026-10-12) -- SOSTITUITO il 2026-10-13.
--
-- Questo file NON fa piu' nulla. Era la correzione per la sola zucchina; dopo il
-- merge si e' visto che altri 7 alimenti erano gia' stati inseriti con la
-- versione vecchia di `add-food`. Usa invece fix_diet_compat_pipeline_foods.sql
-- (stessa regola, copre tutti e 8 + la zucchina).
--
-- Tenuto solo per non cancellare un file gia' nella storia di git senza
-- necessita'; si puo' rimuovere con `git rm fix_diet_compat_zucchine.sql`.

SELECT 'Questo file non fa nulla: esegui fix_diet_compat_pipeline_foods.sql' AS nota;
