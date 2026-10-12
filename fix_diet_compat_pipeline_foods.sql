-- fix_diet_compat_pipeline_foods.sql (2026-10-13)
--
-- Da eseguire UNA VOLTA nell'editor SQL di Supabase (incolla tutto il file,
-- selezionandolo con "seleziona tutto", e premi Run).
--
-- PERCHE'. Fino al 2026-10-12 sera lo script `npm run add-food` non scriveva
-- le tre colonne foods_raw.diet_compat_vegetarian / diet_compat_vegan /
-- diet_compat_fruitarian: ogni alimento inserito restava NULL ("non
-- classificato") e lib/engine/dietTypeFilter.ts lo esclude da qualunque dieta
-- diversa da "onnivora" (scelta difensiva: mai assumere compatibile cio' che
-- non e' classificato). Lo script ora richiede --diet-category (PRD §9 Fase
-- 4.16), ma gli alimenti GIA' inseriti prima della correzione vanno sistemati
-- qui, una volta sola.
--
-- COSA FA. Classifica questi alimenti come "plant_non_fruit" (vegetariano=true,
-- vegano=true, fruttariano=false: stessa regola del PRD §4.9 e di
-- add_diet_compatibility_golden_set.sql per verdure, legumi e cereali; gli
-- ortaggi botanicamente "frutto" come melanzana e zucchina non sono frutta
-- fresca nella definizione restrittiva usata per "fruttariano"):
--   cereali : food_riso_bianco_raw, food_riso_integrale_raw,
--             food_farina_di_mais_raw, food_orzo_perlato_raw, food_farro_raw
--   legumi  : food_fave_bollite, food_piselli_bolliti
--   ortaggi : food_melanzane_raw, food_zucchine_raw
--
-- SICUREZZA.
--  * Non sovrascrive MAI una classificazione gia' presente: agisce solo sulle
--    righe in cui tutte e tre le colonne sono ancora NULL.
--  * Un alimento non ancora inserito (es. food_zucchine_raw se non hai ancora
--    lanciato --apply) viene saltato e segnalato con un messaggio, non e' un
--    errore: puoi rieseguire questo file dopo averlo inserito (ma con lo script
--    nuovo non serve, perche' scrive gia' la classificazione).
--  * Se un alimento ha una classificazione diversa da true/true/false (anche
--    solo parziale), il file si ferma con un errore che lo nomina: in quel caso
--    non toccare nulla e scrivi a Claude.
--  * Rieseguirlo e' innocuo: la seconda volta aggiorna 0 righe.

UPDATE foods_raw
SET diet_compat_vegetarian = true,
    diet_compat_vegan = true,
    diet_compat_fruitarian = false
WHERE food_id IN (
        'food_riso_bianco_raw',
        'food_riso_integrale_raw',
        'food_farina_di_mais_raw',
        'food_orzo_perlato_raw',
        'food_farro_raw',
        'food_fave_bollite',
        'food_piselli_bolliti',
        'food_melanzane_raw',
        'food_zucchine_raw'
      )
  AND diet_compat_vegetarian IS NULL
  AND diet_compat_vegan IS NULL
  AND diet_compat_fruitarian IS NULL;

-- Verifica difensiva (stesso stile degli altri fix_*.sql): mai assumere che lo
-- UPDATE abbia fatto quello che ci aspettiamo.
DO $$
DECLARE
  expected text[] := ARRAY[
    'food_riso_bianco_raw',
    'food_riso_integrale_raw',
    'food_farina_di_mais_raw',
    'food_orzo_perlato_raw',
    'food_farro_raw',
    'food_fave_bollite',
    'food_piselli_bolliti',
    'food_melanzane_raw',
    'food_zucchine_raw'
  ];
  fid text;
  r record;
  n_ok integer := 0;
  n_missing integer := 0;
BEGIN
  FOREACH fid IN ARRAY expected LOOP
    SELECT diet_compat_vegetarian AS v, diet_compat_vegan AS g, diet_compat_fruitarian AS f
      INTO r
      FROM foods_raw
     WHERE food_id = fid;

    IF NOT FOUND THEN
      n_missing := n_missing + 1;
      RAISE NOTICE '% non e'' presente in foods_raw: saltato.', fid;
    ELSIF r.v IS DISTINCT FROM true OR r.g IS DISTINCT FROM true OR r.f IS DISTINCT FROM false THEN
      RAISE EXCEPTION '% ha una classificazione dieta inattesa (vegetarian=%, vegan=%, fruitarian=%): atteso true/true/false. Non sovrascritta -- controllare a mano.', fid, r.v, r.g, r.f;
    ELSE
      n_ok := n_ok + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'OK: % alimenti con vegetarian=true, vegan=true, fruitarian=false; % non presenti in foods_raw (saltati).', n_ok, n_missing;
END $$;

-- Controllo di insieme (ultima istruzione: e' quella che l'SQL editor mostra
-- come tabella). Elenca gli alimenti di foods_raw ANCORA non classificati su
-- almeno un asse dieta. Attesi: solo eventuali righe legacy fuori dal Golden
-- Set (es. food_apple_raw / food_beef_raw del vecchio seed demo). Qualunque
-- altro alimento comparso qui e' stato aggiunto senza --diet-category e va
-- classificato prima di essere visibile a vegetariani/vegani/fruttariani.
SELECT food_id, name_it, verification_status,
       diet_compat_vegetarian, diet_compat_vegan, diet_compat_fruitarian
  FROM foods_raw
 WHERE diet_compat_vegetarian IS NULL
    OR diet_compat_vegan IS NULL
    OR diet_compat_fruitarian IS NULL
 ORDER BY food_id;
