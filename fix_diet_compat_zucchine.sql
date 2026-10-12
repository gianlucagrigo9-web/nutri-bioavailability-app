-- fix_diet_compat_zucchine.sql (2026-10-12)
--
-- Da eseguire SOLO SE food_zucchine_raw e' gia' stato inserito con
-- `npm run add-food ... --apply` PRIMA che lo script richiedesse
-- --diet-category: in quel caso le 3 colonne diet_compat_* sono rimaste NULL
-- e il filtro per tipo di dieta (lib/engine/dietTypeFilter.ts) esclude la
-- zucchina da vegetariana/vegana/fruttariana.
--
-- Se la zucchina NON e' ancora stata inserita, non serve eseguire nulla qui:
-- il nuovo comando add-food (con --diet-category=plant_non_fruit) scrive gia'
-- tutto. Eseguirlo comunque e' innocuo: lo UPDATE tocca 0 righe e il blocco
-- finale lo dice esplicitamente.
--
-- Classificazione (stessa regola del PRD §4.9 / add_diet_compatibility_golden_set.sql):
-- zucchina = ortaggio, non frutta fresca nella definizione restrittiva usata
-- per "fruttariano" (come il pomodoro, citato nel PRD) -> vegetariano=true,
-- vegano=true, fruttariano=false (categoria plant_non_fruit).
--
-- Non sovrascrive MAI una classificazione gia' presente: agisce solo se tutte
-- e tre le colonne sono ancora NULL.

UPDATE foods_raw
SET diet_compat_vegetarian = true,
    diet_compat_vegan = true,
    diet_compat_fruitarian = false
WHERE food_id = 'food_zucchine_raw'
  AND diet_compat_vegetarian IS NULL
  AND diet_compat_vegan IS NULL
  AND diet_compat_fruitarian IS NULL;

-- Verifica difensiva (stesso stile degli altri fix_*.sql): mai assumere che
-- lo UPDATE abbia fatto quello che ci aspettiamo.
DO $$
DECLARE
  r record;
BEGIN
  SELECT diet_compat_vegetarian AS v, diet_compat_vegan AS g, diet_compat_fruitarian AS f
    INTO r
    FROM foods_raw
   WHERE food_id = 'food_zucchine_raw';

  IF NOT FOUND THEN
    RAISE NOTICE 'food_zucchine_raw non e'' ancora in foods_raw: nulla da fare qui. Usa il comando add-food con --diet-category=plant_non_fruit.';
  ELSIF r.v IS DISTINCT FROM true OR r.g IS DISTINCT FROM true OR r.f IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'food_zucchine_raw ha una classificazione dieta inattesa (vegetarian=%, vegan=%, fruitarian=%): atteso true/true/false. Non sovrascritta -- controllare a mano.', r.v, r.g, r.f;
  ELSE
    RAISE NOTICE 'OK: food_zucchine_raw classificata vegetarian=true, vegan=true, fruitarian=false.';
  END IF;
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
