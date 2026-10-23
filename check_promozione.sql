-- check_promozione.sql (2026-10-23)
--
-- SOLO LETTURA: non modifica nulla. Si usa DOPO la promozione (lotti_alimenti/promozione_2_applica.txt).
-- Mostra quanti alimenti con numero FDC (cioe' quelli aggiunti dalla pipeline e dal Golden Set)
-- sono "verified" e quali sono rimasti "draft", con il motivo piu' probabile.
--
-- COME SI USA. Apri questo file, seleziona tutto (Ctrl+A), copia (Ctrl+C), incolla nell'editor SQL di
-- Supabase e premi Run. Compare una tabella: la prima riga e' il RIEPILOGO, poi un alimento per riga
-- (solo quelli ancora draft, con il motivo). Manda uno screenshot a Claude.

WITH f AS (
  SELECT food_id, name_it, verification_status, fdc_id, fdc_name,
         diet_compat_vegetarian, diet_compat_vegan, diet_compat_fruitarian
  FROM foods_raw
  WHERE fdc_id IS NOT NULL
),
nv AS (
  SELECT food_id,
         count(*)                                              AS righe,
         count(*) FILTER (WHERE verification_status = 'draft') AS righe_draft
  FROM nutrient_values
  GROUP BY food_id
)
SELECT 0 AS ord,
       'RIEPILOGO'::text AS food_id,
       ('verified=' || count(*) FILTER (WHERE f.verification_status = 'verified')
        || '  draft=' || count(*) FILTER (WHERE f.verification_status = 'draft')
        || '  totale=' || count(*)) AS esito,
       NULL::text AS motivo
FROM f
UNION ALL
SELECT 1, f.food_id, 'ANCORA DRAFT',
       concat_ws('; ',
         CASE WHEN f.fdc_name IS NULL OR btrim(f.fdc_name) = '' THEN 'descrizione FDC salvata assente' END,
         CASE WHEN f.diet_compat_vegetarian IS NULL OR f.diet_compat_vegan IS NULL OR f.diet_compat_fruitarian IS NULL THEN 'dieta non classificata' END,
         CASE WHEN coalesce(nv.righe, 0) = 0 THEN 'nessun nutriente' END,
         CASE WHEN coalesce(nv.righe_draft, 0) > 0 THEN nv.righe_draft || ' righe nutrienti ancora draft (guarda il log: MISMATCH / BLOCKED / UNREACHABLE)' END
       )
FROM f
LEFT JOIN nv ON nv.food_id = f.food_id
WHERE f.verification_status = 'draft'
ORDER BY ord, food_id;
