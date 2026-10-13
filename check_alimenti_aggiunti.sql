-- check_alimenti_aggiunti.sql (versione 2026-10-14, con controllo della descrizione FDC)
--
-- SOLO LETTURA: non modifica nulla. Controlla, per i 46 alimenti di
-- docs/GOLDEN_SET_READY_TO_RUN.md (i 28 gia' eseguiti + il lotto da 18),
-- se sono nel database e se sono come previsto.
--
-- COME SI USA. Apri questo file, seleziona tutto (Ctrl+A), copia (Ctrl+C),
-- incolla nell'editor SQL di Supabase e premi Run. Compare una tabella:
--   * la prima riga e' un RIEPILOGO (quanti OK / da controllare / non presenti);
--   * poi una riga per alimento, con i problemi in cima.
-- Manda uno screenshot (o due, se serve scorrere) a Claude.
--
-- ORDINE DELLE RIGHE: riepilogo, poi DA CONTROLLARE, poi OK, poi NON PRESENTE.
--
-- COSA SIGNIFICA LA COLONNA "esito":
--   OK                 presente, draft, nutrienti >= attesi, dieta come prevista,
--                      stato carotenoidi come previsto, numero FDC e descrizione FDC
--                      come previsti
--   DA CONTROLLARE     presente ma qualcosa non torna (guarda la colonna "problema")
--   NON PRESENTE       non e' (ancora) nel database: normale per gli alimenti
--                      che non hai ancora eseguito
-- "nutrienti_attesi" e' il MINIMO previsto dal file dei comandi pronti (17 per
-- quasi tutti; avena 13 e borlotti 14 hanno un gap dichiarato).
-- "fdc_name" e' la descrizione del record USDA salvata nel database; deve
-- coincidere (o contenere / essere contenuta) con quella attesa dal file dei
-- comandi pronti. Se una riga e' "DA CONTROLLARE" solo per questo motivo e la
-- differenza e' di scrittura (es. singolare/plurale: "broiler" / "broilers"),
-- non e' un errore: manda lo screenshot e Claude la valuta.
--
-- Dieta: formato vegetariano/vegano/fruttariano con t = true, f = false.

WITH expected(ord, food_id, nutrienti_attesi, dieta_attesa, carot_atteso, fdc_atteso, fdc_desc_attesa) AS (VALUES
  (1, 'food_melone_cantalupo_raw', 17, 't/t/t', 'raw_intact', '169092', 'Melons, cantaloupe, raw'),
  (2, 'food_nocciole_raw', 17, 't/t/f', 'raw_intact', '170581', 'Nuts, hazelnuts or filberts'),
  (3, 'food_sedano_raw', 17, 't/t/f', 'raw_intact', '169988', 'Celery, raw'),
  (4, 'food_patata_dolce_raw', 17, 't/t/f', 'raw_intact', '168482', 'Sweet potato, raw, unprepared (Includes foods for USDA''s Food Distribution Program)'),
  (5, 'food_asparagi_raw', 17, 't/t/f', 'raw_intact', '168389', 'Asparagus, raw'),
  (6, 'food_avena_cruda', 13, 't/t/f', NULL, '169705', 'Oats (Includes foods for USDA''s Food Distribution Program)'),
  (7, 'food_sgombro_raw', 17, 'f/f/f', NULL, '175119', 'Fish, mackerel, Atlantic, raw'),
  (8, 'food_noci_raw', 17, 't/t/f', 'raw_intact', '170187', 'Nuts, walnuts, english'),
  (9, 'food_zucchero_bianco', 17, 't/t/f', NULL, '169655', 'Sugars, granulated'),
  (10, 'food_miele', 17, 't/f/f', NULL, '169640', 'Honey'),
  (11, 'food_burro', 17, 't/f/f', NULL, '173430', 'Butter, without salt'),
  (12, 'food_yogurt_greco', 17, 't/f/f', NULL, '171304', 'Yogurt, Greek, plain, whole milk'),
  (13, 'food_yogurt_bianco_intero', 17, 't/f/f', NULL, '171284', 'Yogurt, plain, whole milk'),
  (14, 'food_ricotta', 17, 't/f/f', NULL, '170851', 'Cheese, ricotta, whole milk'),
  (15, 'food_mozzarella', 17, 't/f/f', NULL, '170845', 'Cheese, mozzarella, whole milk'),
  (16, 'food_parmigiano_reggiano', 17, 't/f/f', NULL, '170848', 'Cheese, parmesan, hard'),
  (17, 'food_vongole_raw', 17, 'f/f/f', NULL, '174214', 'Mollusks, clam, mixed species, raw'),
  (18, 'food_cozze_raw', 17, 'f/f/f', NULL, '174216', 'Mollusks, mussel, blue, raw'),
  (19, 'food_acciughe_raw', 17, 'f/f/f', NULL, '174182', 'Fish, anchovy, european, raw'),
  (20, 'food_merluzzo_raw', 17, 'f/f/f', NULL, '171955', 'Fish, cod, Atlantic, raw'),
  (21, 'food_tonno_fresco_raw', 17, 'f/f/f', NULL, '175159', 'Fish, tuna, fresh, yellowfin, raw'),
  (22, 'food_prosciutto_cotto', 17, 'f/f/f', NULL, '167872', 'Pork, cured, ham, boneless, regular (approximately 11% fat), roasted'),
  (23, 'food_petto_di_pollo_raw', 17, 'f/f/f', NULL, '171077', 'Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw'),
  (24, 'food_coscia_di_pollo_raw', 17, 'f/f/f', NULL, '173627', 'Chicken, broilers or fryers, dark meat, thigh, meat only, raw'),
  (25, 'food_lonza_di_maiale_raw', 17, 'f/f/f', NULL, '168230', 'Pork, fresh, loin, whole, separable lean only, raw'),
  (26, 'food_petto_di_tacchino_raw', 17, 'f/f/f', NULL, '174515', 'Turkey, retail parts, breast, meat only, raw'),
  (27, 'food_fagioli_cannellini_bolliti', 17, 't/t/f', NULL, '175203', 'Beans, white, mature seeds, cooked, boiled, without salt'),
  (28, 'food_fagioli_borlotti_bolliti', 14, 't/t/f', NULL, '173736', 'Beans, cranberry (roman), mature seeds, cooked, boiled, without salt'),
  (29, 'food_tomato_raw', 17, 't/t/f', 'raw_intact', '170457', 'Tomatoes, red, ripe, raw, year round average'),
  (30, 'food_onion_raw', 17, 't/t/f', 'raw_intact', '170000', 'Onions, raw'),
  (31, 'food_garlic_fresh_raw', 17, 't/t/f', 'raw_intact', '169230', 'Garlic, raw'),
  (32, 'food_pepper_red_raw', 17, 't/t/f', 'raw_intact', '170108', 'Peppers, sweet, red, raw'),
  (33, 'food_lettuce_romaine_raw', 17, 't/t/f', 'raw_intact', '169247', 'Lettuce, cos or romaine, raw'),
  (34, 'food_pumpkin_raw', 17, 't/t/f', 'raw_intact', '168448', 'Pumpkin, raw'),
  (35, 'food_fennel_raw', 17, 't/t/f', 'raw_intact', '169385', 'Fennel, bulb, raw'),
  (36, 'food_mushroom_white_raw', 17, 't/t/f', NULL, '169251', 'Mushrooms, white, raw'),
  (37, 'food_apple_with_skin_raw', 17, 't/t/t', 'raw_intact', '171688', 'Apples, raw, with skin (Includes foods for USDA''s Food Distribution Program)'),
  (38, 'food_banana_raw', 17, 't/t/t', 'raw_intact', '173944', 'Bananas, raw'),
  (39, 'food_pear_raw', 17, 't/t/t', 'raw_intact', '169118', 'Pears, raw'),
  (40, 'food_grapes_european_raw', 17, 't/t/t', 'raw_intact', '174683', 'Grapes, red or green (European type, such as Thompson seedless), raw'),
  (41, 'food_lemon_peeled_raw', 17, 't/t/t', 'raw_intact', '167746', 'Lemons, raw, without peel'),
  (42, 'food_strawberry_raw', 17, 't/t/t', 'raw_intact', '167762', 'Strawberries, raw'),
  (43, 'food_peach_yellow_raw', 17, 't/t/t', 'raw_intact', '169928', 'Peaches, yellow, raw'),
  (44, 'food_kiwi_green_raw', 17, 't/t/t', 'raw_intact', '168153', 'Kiwifruit, green, raw'),
  (45, 'food_fig_raw', 17, 't/t/t', 'raw_intact', '173021', 'Figs, raw'),
  (46, 'food_peas_green_raw', 17, 't/t/f', 'raw_intact', '170419', 'Peas, green, raw')
),
n AS (
  SELECT food_id, count(*) AS n_nutrienti
    FROM nutrient_values
   GROUP BY food_id
),
chk AS (
  SELECT e.ord, e.food_id,
         e.nutrienti_attesi,
         f.food_id IS NOT NULL AS presente,
         f.verification_status::text AS verification_status,   -- ::text perche' nel DB reale e' un tipo enum
         COALESCE(n.n_nutrienti, 0) AS nutrienti,
         CASE WHEN f.food_id IS NULL THEN NULL
              ELSE (CASE WHEN f.diet_compat_vegetarian THEN 't' WHEN f.diet_compat_vegetarian = false THEN 'f' ELSE '?' END) || '/' ||
                   (CASE WHEN f.diet_compat_vegan THEN 't' WHEN f.diet_compat_vegan = false THEN 'f' ELSE '?' END) || '/' ||
                   (CASE WHEN f.diet_compat_fruitarian THEN 't' WHEN f.diet_compat_fruitarian = false THEN 'f' ELSE '?' END)
         END AS dieta,
         e.dieta_attesa,
         f.carotenoid_matrix_state AS carotenoidi,
         e.carot_atteso,
         f.fdc_id::text AS fdc_id_db,
         e.fdc_atteso,
         f.fdc_name AS fdc_name,
         e.fdc_desc_attesa,
         (f.fdc_name IS NOT NULL AND (
            position(lower(e.fdc_desc_attesa) in lower(f.fdc_name)) > 0
            OR position(lower(f.fdc_name) in lower(e.fdc_desc_attesa)) > 0)) AS fdc_descr_ok
    FROM expected e
    LEFT JOIN foods_raw f ON f.food_id = e.food_id
    LEFT JOIN n ON n.food_id = e.food_id
),
chk2 AS (
  SELECT chk.*,
         CASE
           WHEN NOT presente THEN 'NON PRESENTE'
           WHEN verification_status IS DISTINCT FROM 'draft'
             OR nutrienti < nutrienti_attesi
             OR dieta <> dieta_attesa
             OR (carot_atteso IS NOT NULL AND carotenoidi IS DISTINCT FROM carot_atteso)
             OR fdc_id_db IS DISTINCT FROM fdc_atteso
             OR NOT fdc_descr_ok
           THEN 'DA CONTROLLARE'
           ELSE 'OK'
         END AS esito
    FROM chk
)
SELECT ord, food_id, esito, problema, nutrienti, nutrienti_attesi, dieta, dieta_attesa, carotenoidi, stato, fdc_name
  FROM (
    SELECT 0 AS grp, 0 AS ord, 'RIEPILOGO' AS food_id,
           'OK=' || count(*) FILTER (WHERE esito = 'OK') ||
           '  DA CONTROLLARE=' || count(*) FILTER (WHERE esito = 'DA CONTROLLARE') ||
           '  NON PRESENTE=' || count(*) FILTER (WHERE esito = 'NON PRESENTE') AS esito,
           NULL::text AS problema, NULL::bigint AS nutrienti, NULL::int AS nutrienti_attesi,
           NULL::text AS dieta, NULL::text AS dieta_attesa, NULL::text AS carotenoidi, NULL::text AS stato,
           NULL::text AS fdc_name
      FROM chk2
    UNION ALL
    SELECT CASE esito WHEN 'DA CONTROLLARE' THEN 1 WHEN 'OK' THEN 2 ELSE 3 END AS grp,
           ord, food_id, esito,
           CASE WHEN esito = 'DA CONTROLLARE' THEN
             concat_ws('; ',
               CASE WHEN verification_status IS DISTINCT FROM 'draft' THEN 'stato=' || COALESCE(verification_status, 'NULL') END,
               CASE WHEN nutrienti < nutrienti_attesi THEN 'nutrienti ' || nutrienti || ' < ' || nutrienti_attesi END,
               CASE WHEN dieta <> dieta_attesa THEN 'dieta ' || dieta || ' invece di ' || dieta_attesa END,
               CASE WHEN carot_atteso IS NOT NULL AND carotenoidi IS DISTINCT FROM carot_atteso THEN 'carotenoidi ' || COALESCE(carotenoidi, 'NULL') || ' invece di ' || carot_atteso END,
               CASE WHEN fdc_id_db IS DISTINCT FROM fdc_atteso THEN 'FDC ' || COALESCE(fdc_id_db, 'NULL') || ' invece di ' || fdc_atteso END,
               CASE WHEN NOT fdc_descr_ok THEN 'descrizione FDC attesa: ' || fdc_desc_attesa END)
           END,
           nutrienti, nutrienti_attesi, dieta, dieta_attesa, carotenoidi, verification_status, fdc_name
      FROM chk2
  ) s
 ORDER BY grp, ord;
