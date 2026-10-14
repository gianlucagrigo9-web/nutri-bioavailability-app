-- check_alimenti_obsoleti.sql (2026-10-14)
--
-- SOLO LETTURA: non modifica nulla. Serve a decidere quali righe VECCHIE di
-- foods_raw (residui del primo seed demo, mai entrate nel Golden Set vero) si
-- possono cancellare perche' esiste gia' una versione nuova e completa.
-- NON cancella niente: dopo aver visto il risultato, Claude prepara un file di
-- cancellazione separato, con controlli di sicurezza.
--
-- COME SI USA. Apri questo file, seleziona tutto (Ctrl+A), copia (Ctrl+C),
-- incolla nell'editor SQL di Supabase e premi Run. Manda lo screenshot della
-- tabella (se le righe sono tante, due screenshot).
--
-- COSA MOSTRA. Una riga per ogni alimento "non riconosciuto" presente nel
-- database (cioe' che non e' tra i 30 del Golden Set, i 9 eseguiti il 12-13
-- ottobre e i 46 eseguiti il 13-14 ottobre), piu' una riga per ogni alimento
-- vecchio che ci aspettavamo e che invece non c'e' (ASSENTE).
--   stato                 draft o verified (verified = visibile nell'app)
--   nutrienti / con_fonte quanti nutrienti ha e quanti hanno una fonte citata
--   usato_in_piatti       in quanti piatti composti e' usato (se > 0 NON si cancella)
--   sostituto*            l'alimento nuovo che lo rimpiazza, con il suo numero di nutrienti
--   cancellabile          SI solo se: il sostituto esiste, ha almeno 17 nutrienti,
--                         e' lo stesso alimento, e il vecchio non e' usato in piatti

WITH legacy(legacy_id, sostituto_id, equivalente, nota) AS (VALUES
  ('food_garlic_raw', 'food_garlic_fresh_raw', true, ''),
  ('food_apple_raw', 'food_apple_with_skin_raw', true, ''),
  ('food_walnuts_raw', 'food_noci_raw', true, ''),
  ('food_oats_raw', 'food_avena_cruda', true, ''),
  ('food_rice_brown_raw', 'food_riso_integrale_raw', true, ''),
  ('food_strawberries_raw', 'food_strawberry_raw', true, ''),
  ('food_potatoes_raw', 'food_potato_raw', true, ''),
  ('food_beans_kidney_raw', 'food_kidney_beans_raw', true, ''),
  ('food_almonds_raw', 'food_almonds', true, ''),
  ('food_spelt_raw', 'food_farro_raw', true, ''),
  ('food_lemon_raw', 'food_lemon_peeled_raw', false, 'il sostituto e'' SENZA buccia: non e'' lo stesso alimento'),
  ('food_beef_raw', NULL, false, ''),
  ('food_quinoa_raw', NULL, false, ''),
  ('food_buckwheat_raw', NULL, false, ''),
  ('food_dates_raw', NULL, false, ''),
  ('food_flaxseed_raw', NULL, false, '')
),
known(food_id) AS (VALUES
  ('food_almonds'),
  ('food_beef_ground_cooked'),
  ('food_beef_ground_raw'),
  ('food_beef_liver_cooked'),
  ('food_beef_liver_raw'),
  ('food_broccoli_boiled'),
  ('food_broccoli_raw'),
  ('food_brussels_sprouts_boiled'),
  ('food_brussels_sprouts_raw'),
  ('food_carrots_boiled'),
  ('food_carrots_raw'),
  ('food_chickpeas_boiled'),
  ('food_chickpeas_raw'),
  ('food_egg_hard_boiled'),
  ('food_egg_raw'),
  ('food_kale_raw'),
  ('food_kidney_beans_boiled'),
  ('food_kidney_beans_raw'),
  ('food_lentils_boiled'),
  ('food_lentils_raw'),
  ('food_milk_whole'),
  ('food_oranges_raw'),
  ('food_pasta_enriched_cooked'),
  ('food_pasta_enriched_dry'),
  ('food_potato_boiled_in_skin'),
  ('food_potato_raw'),
  ('food_salmon_cooked'),
  ('food_salmon_raw'),
  ('food_spinach_boiled'),
  ('food_spinach_raw'),
  ('food_zucchine_raw'),
  ('food_melanzane_raw'),
  ('food_piselli_bolliti'),
  ('food_fave_bollite'),
  ('food_farro_raw'),
  ('food_orzo_perlato_raw'),
  ('food_farina_di_mais_raw'),
  ('food_riso_integrale_raw'),
  ('food_riso_bianco_raw'),
  ('food_melone_cantalupo_raw'),
  ('food_nocciole_raw'),
  ('food_sedano_raw'),
  ('food_patata_dolce_raw'),
  ('food_asparagi_raw'),
  ('food_avena_cruda'),
  ('food_sgombro_raw'),
  ('food_noci_raw'),
  ('food_zucchero_bianco'),
  ('food_miele'),
  ('food_burro'),
  ('food_yogurt_greco'),
  ('food_yogurt_bianco_intero'),
  ('food_ricotta'),
  ('food_mozzarella'),
  ('food_parmigiano_reggiano'),
  ('food_vongole_raw'),
  ('food_cozze_raw'),
  ('food_acciughe_raw'),
  ('food_merluzzo_raw'),
  ('food_tonno_fresco_raw'),
  ('food_prosciutto_cotto'),
  ('food_petto_di_pollo_raw'),
  ('food_coscia_di_pollo_raw'),
  ('food_lonza_di_maiale_raw'),
  ('food_petto_di_tacchino_raw'),
  ('food_fagioli_cannellini_bolliti'),
  ('food_fagioli_borlotti_bolliti'),
  ('food_tomato_raw'),
  ('food_onion_raw'),
  ('food_garlic_fresh_raw'),
  ('food_pepper_red_raw'),
  ('food_lettuce_romaine_raw'),
  ('food_pumpkin_raw'),
  ('food_fennel_raw'),
  ('food_mushroom_white_raw'),
  ('food_apple_with_skin_raw'),
  ('food_banana_raw'),
  ('food_pear_raw'),
  ('food_grapes_european_raw'),
  ('food_lemon_peeled_raw'),
  ('food_strawberry_raw'),
  ('food_peach_yellow_raw'),
  ('food_kiwi_green_raw'),
  ('food_fig_raw'),
  ('food_peas_green_raw')
),
n AS (
  SELECT food_id, count(*) AS n_nutrienti, count(*) FILTER (WHERE source_id IS NOT NULL) AS n_fonte
    FROM nutrient_values
   GROUP BY food_id
),
piatti AS (
  SELECT food_id, count(*) AS k FROM dish_components GROUP BY food_id
),
presenti AS (
  SELECT f.food_id, f.name_it, f.verification_status::text AS stato, f.matrix_id,
         COALESCE(n.n_nutrienti, 0) AS nutrienti, COALESCE(n.n_fonte, 0) AS con_fonte,
         COALESCE(p.k, 0) AS usato_in_piatti
    FROM foods_raw f
    LEFT JOIN n ON n.food_id = f.food_id
    LEFT JOIN piatti p ON p.food_id = f.food_id
   WHERE f.food_id NOT IN (SELECT food_id FROM known)
),
righe AS (
  SELECT pr.food_id, pr.name_it, pr.stato, pr.matrix_id, pr.nutrienti, pr.con_fonte, pr.usato_in_piatti,
         l.sostituto_id, l.equivalente, l.nota,
         s.food_id IS NOT NULL AS sostituto_presente,
         s.verification_status::text AS sostituto_stato,
         COALESCE(ns.n_nutrienti, 0) AS sostituto_nutrienti
    FROM presenti pr
    LEFT JOIN legacy l ON l.legacy_id = pr.food_id
    LEFT JOIN foods_raw s ON s.food_id = l.sostituto_id
    LEFT JOIN n ns ON ns.food_id = l.sostituto_id
  UNION ALL
  SELECT l.legacy_id, NULL, 'ASSENTE', NULL, NULL, NULL, NULL,
         l.sostituto_id, l.equivalente, l.nota, NULL, NULL, NULL
    FROM legacy l
   WHERE NOT EXISTS (SELECT 1 FROM foods_raw f WHERE f.food_id = l.legacy_id)
)
SELECT food_id, name_it, stato, matrix_id, nutrienti, con_fonte, usato_in_piatti,
       sostituto_id AS sostituto, sostituto_stato, sostituto_nutrienti,
       CASE
         WHEN stato = 'ASSENTE' THEN 'ASSENTE (non presente nel database)'
         WHEN sostituto_id IS NULL THEN 'NO: nessun sostituto previsto' || CASE WHEN nota = '' OR nota IS NULL THEN '' ELSE ' (' || nota || ')' END
         WHEN NOT COALESCE(sostituto_presente, false) THEN 'NO: il sostituto non e presente nel database'
         WHEN usato_in_piatti > 0 THEN 'NO: usato in ' || usato_in_piatti || ' piatti'
         WHEN NOT equivalente THEN 'NO: ' || nota
         WHEN sostituto_nutrienti < 17 THEN 'NO: sostituto con solo ' || sostituto_nutrienti || ' nutrienti'
         ELSE 'SI'
       END AS cancellabile
  FROM righe
 ORDER BY (CASE WHEN stato = 'ASSENTE' THEN 3
                WHEN sostituto_id IS NOT NULL AND sostituto_presente AND usato_in_piatti = 0 AND equivalente AND sostituto_nutrienti >= 17 THEN 0
                WHEN sostituto_id IS NOT NULL THEN 1
                ELSE 2 END), food_id;
