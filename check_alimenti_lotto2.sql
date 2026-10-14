-- check_alimenti_lotto2.sql (2026-10-14 sera)
--
-- SOLO LETTURA: non modifica nulla. Controlla i 98 alimenti preparati dal task orario
-- il 14 ottobre (docs/GOLDEN_SET_READY_TO_RUN.md, sezione "Pronti"): se sono nel database
-- e se sono come previsto. Si usa DOPO aver applicato i lotti.
--
-- COME SI USA. Apri questo file, seleziona tutto (Ctrl+A), copia (Ctrl+C), incolla
-- nell'editor SQL di Supabase e premi Run. Compare una tabella:
--   * la prima riga e' un RIEPILOGO (quanti OK / da controllare / non presenti);
--   * poi una riga per alimento, con i problemi in cima.
-- Manda uno screenshot (o due, se serve scorrere) a Claude.
--
-- COSA SIGNIFICA LA COLONNA "esito":
--   OK                 presente, draft, nutrienti >= attesi, dieta come prevista,
--                      stato carotenoidi come previsto, numero FDC e descrizione FDC
--                      come previsti
--   DA CONTROLLARE     presente ma qualcosa non torna (guarda la colonna "problema")
--   NON PRESENTE       non e' (ancora) nel database: normale per i lotti non ancora applicati
-- "nutrienti_attesi" e' il MINIMO previsto dal file dei comandi pronti (17 per la maggior
-- parte; alcuni alimenti hanno un gap dichiarato, es. 13/17 o 14/17).
-- "fdc_name" e' la descrizione del record USDA salvata nel database; deve coincidere (o
-- contenere / essere contenuta) con quella attesa. Per 3 alimenti (datteri Medjool, semi di
-- lino, quinoa) la descrizione attesa e' solo una parola chiave (confermata dalla prova del 14/10).
-- Gap dichiarati dopo la prova: rucola 11 e radicchio 12 nutrienti (senza energy_kcal), castagne 12 (senza fibra).
-- Dieta: formato vegetariano/vegano/fruttariano con t = true, f = false.

WITH expected(ord, food_id, nutrienti_attesi, dieta_attesa, carot_atteso, fdc_atteso, fdc_desc_attesa) AS (VALUES
  (1, 'food_edamame_raw', 13, 't/t/f', NULL, '168410', 'Edamame, frozen, unprepared'),
  (2, 'food_verza_raw', 17, 't/t/f', 'raw_intact', '170388', 'Cabbage, savoy, raw'),
  (3, 'food_rucola_raw', 11, 't/t/f', NULL, '2710822', 'Arugula, baby, raw'),
  (4, 'food_porri_raw', 17, 't/t/f', 'raw_intact', '169246', 'Leeks, (bulb and lower leaf-portion), raw'),
  (5, 'food_barbabietola_rossa_raw', 17, 't/t/f', 'raw_intact', '169145', 'Beets, raw'),
  (6, 'food_radicchio_raw', 12, 't/t/f', NULL, '2747664', 'Radicchio, raw'),
  (7, 'food_anguria_raw', 17, 't/t/t', 'raw_intact', '167765', 'Watermelon, raw'),
  (8, 'food_albicocche_raw', 17, 't/t/t', 'raw_intact', '171697', 'Apricots, raw'),
  (9, 'food_ciliegie_raw', 17, 't/t/t', 'raw_intact', '171719', 'Cherries, sweet, raw'),
  (10, 'food_pistacchi_raw', 16, 't/t/f', NULL, '170184', 'Nuts, pistachio nuts, raw'),
  (11, 'food_couscous_raw', 13, 't/t/f', NULL, '169699', 'Couscous, dry'),
  (12, 'food_quinoa_dry_raw', 16, 't/t/f', 'raw_intact', '168874', 'Quinoa'),
  (13, 'food_soia_secca_raw', 17, 't/t/f', 'raw_intact', '174270', 'Soybeans, mature seeds, raw'),
  (14, 'food_tofu_raw', 14, 't/t/f', NULL, '172475', 'Tofu, raw, firm, prepared with calcium sulfate'),
  (15, 'food_cetrioli_raw', 17, 't/t/f', 'raw_intact', '168409', 'Cucumber, with peel, raw'),
  (16, 'food_fagiolini_raw', 17, 't/t/f', 'raw_intact', '169961', 'Beans, snap, green, raw'),
  (17, 'food_carciofi_raw', 17, 't/t/f', 'raw_intact', '169205', 'Artichokes, (globe or french), raw'),
  (18, 'food_pepper_yellow_raw', 15, 't/t/f', 'raw_intact', '169383', 'Peppers, sweet, yellow, raw'),
  (19, 'food_pepper_green_raw', 17, 't/t/f', 'raw_intact', '170427', 'Peppers, sweet, green, raw'),
  (20, 'food_sedano_rapa_raw', 17, 't/t/f', NULL, '170400', 'Celeriac, raw'),
  (21, 'food_mirtilli_raw', 17, 't/t/t', 'raw_intact', '171711', 'Blueberries, raw'),
  (22, 'food_prugne_raw', 17, 't/t/t', 'raw_intact', '169949', 'Plums, raw'),
  (23, 'food_melograno_raw', 17, 't/t/t', NULL, '169134', 'Pomegranates, raw'),
  (24, 'food_cachi_raw', 17, 't/t/t', 'raw_intact', '169941', 'Persimmons, japanese, raw'),
  (25, 'food_mandarini_raw', 17, 't/t/t', 'raw_intact', '169105', 'Tangerines, (mandarin oranges), raw'),
  (26, 'food_anacardi_raw', 17, 't/t/f', NULL, '170162', 'Nuts, cashew nuts, raw'),
  (27, 'food_arachidi_raw', 17, 't/t/f', NULL, '172430', 'Peanuts, all types, raw'),
  (28, 'food_semi_di_zucca_raw', 17, 't/t/f', 'raw_intact', '170556', 'Seeds, pumpkin and squash seed kernels, dried'),
  (29, 'food_semi_di_sesamo_raw', 17, 't/t/f', 'raw_intact', '170150', 'Seeds, sesame seeds, whole, dried'),
  (30, 'food_semi_di_lino_interi_raw', 17, 't/t/f', NULL, '169414', 'flaxseed'),
  (31, 'food_vitello_raw', 14, 'f/f/f', NULL, '173817', 'Veal, composite of trimmed retail cuts, separable lean only, raw'),
  (32, 'food_agnello_raw', 14, 'f/f/f', NULL, '174338', 'Lamb, New Zealand, imported, frozen, composite of trimmed retail cuts, separable lean only, raw'),
  (33, 'food_coniglio_raw', 14, 'f/f/f', NULL, '172521', 'Game meat, rabbit, domesticated, composite of cuts, raw'),
  (34, 'food_anatra_raw', 17, 'f/f/f', NULL, '172410', 'Duck, domesticated, meat only, raw'),
  (35, 'food_branzino_raw', 17, 'f/f/f', NULL, '175142', 'Fish, sea bass, mixed species, raw'),
  (36, 'food_feta', 17, 't/f/f', NULL, '173420', 'Cheese, feta'),
  (37, 'food_polpo_raw', 17, 'f/f/f', NULL, '174218', 'Mollusks, octopus, common, raw'),
  (38, 'food_calamari_raw', 17, 'f/f/f', NULL, '174223', 'Mollusks, squid, mixed species, raw'),
  (39, 'food_gorgonzola', 17, 't/f/f', NULL, '172175', 'Cheese, blue'),
  (40, 'food_olio_di_girasole_raw', 17, 't/t/f', NULL, '171025', 'Oil, sunflower, linoleic, (approx. 65%)'),
  (41, 'food_olio_di_cocco_raw', 17, 't/t/f', NULL, '171412', 'Oil, coconut'),
  (42, 'food_cacao_amaro_raw', 17, 't/t/f', NULL, '169593', 'Cocoa, dry powder, unsweetened'),
  (43, 'food_castagne_raw', 12, 't/t/f', NULL, '170575', 'Nuts, chestnuts, european, raw, peeled'),
  (44, 'food_fegato_di_pollo_raw', 17, 'f/f/f', NULL, '171060', 'Chicken, liver, all classes, raw'),
  (45, 'food_miglio_raw', 15, 't/t/f', NULL, '169702', 'Millet, raw'),
  (46, 'food_segale_raw', 17, 't/t/f', 'raw_intact', '168884', 'Rye grain'),
  (47, 'food_amaranto_raw', 17, 't/t/f', 'raw_intact', '170682', 'Amaranth grain, uncooked'),
  (48, 'food_topinambur_raw', 17, 't/t/f', 'raw_intact', '169236', 'Jerusalem-artichokes, raw'),
  (49, 'food_piselli_secchi_spezzati_raw', 17, 't/t/f', 'raw_intact', '172428', 'Peas, green, split, mature seeds, raw'),
  (50, 'food_lenticchie_rosse_raw', 16, 't/t/f', 'raw_intact', '174284', 'Lentils, pink or red, raw'),
  (51, 'food_cavolo_cappuccio_raw', 17, 't/t/f', 'raw_intact', '169975', 'Cabbage, raw'),
  (52, 'food_bietole_da_costa_raw', 17, 't/t/f', 'raw_intact', '169991', 'Chard, swiss, raw'),
  (53, 'food_cime_di_rapa_raw', 17, 't/t/f', 'raw_intact', '170381', 'Broccoli raab, raw'),
  (54, 'food_lime_raw', 17, 't/t/t', 'raw_intact', '168155', 'Limes, raw'),
  (55, 'food_nespole_raw', 14, 't/t/t', NULL, '169908', 'Loquats, raw'),
  (56, 'food_pompelmo_rosa_raw', 17, 't/t/t', 'raw_intact', '174673', 'Grapefruit, raw, pink and red, all areas'),
  (57, 'food_peperoncino_piccante_raw', 17, 't/t/f', 'raw_intact', '170106', 'Peppers, hot chili, red, raw'),
  (58, 'food_rapa_raw', 17, 't/t/f', NULL, '170465', 'Turnips, raw'),
  (59, 'food_scarola_raw', 17, 't/t/f', 'raw_intact', '168412', 'Endive, raw'),
  (60, 'food_indivia_belga_raw', 14, 't/t/f', NULL, '170404', 'Chicory, witloof, raw'),
  (61, 'food_ravanelli_raw', 17, 't/t/f', 'raw_intact', '169276', 'Radishes, raw'),
  (62, 'food_scalogno_raw', 17, 't/t/f', 'raw_intact', '170499', 'Shallots, raw'),
  (63, 'food_semi_di_canapa_raw', 13, 't/t/f', 'raw_intact', '170148', 'Seeds, hemp seed, hulled'),
  (64, 'food_datteri_medjool_raw', 15, 't/t/f', 'raw_intact', '168191', 'Dates, medjool'),
  (65, 'food_uva_passa_raw', 17, 't/t/f', NULL, '168165', 'Raisins, dark, seedless (Includes foods for USDA''s Food Distribution Program)'),
  (66, 'food_albicocche_secche_raw', 17, 't/t/f', 'raw_intact', '173941', 'Apricots, dried, sulfured, uncooked'),
  (67, 'food_prugne_secche_raw', 17, 't/t/f', 'raw_intact', '168162', 'Plums, dried (prunes), uncooked'),
  (68, 'food_fichi_secchi_raw', 17, 't/t/f', 'raw_intact', '174665', 'Figs, dried, uncooked'),
  (69, 'food_seppia_raw', 14, 'f/f/f', NULL, '174215', 'Mollusks, cuttlefish, mixed species, raw'),
  (70, 'food_pesce_spada_raw', 17, 'f/f/f', NULL, '173703', 'Fish, swordfish, raw'),
  (71, 'food_sogliola_raw', 17, 'f/f/f', NULL, '174196', 'Fish, flatfish (flounder and sole species), raw'),
  (72, 'food_provolone', 17, 't/f/f', NULL, '170850', 'Cheese, provolone'),
  (73, 'food_olio_di_mais_raw', 17, 't/t/f', NULL, '171029', 'Oil, corn, industrial and retail, all purpose salad or cooking'),
  (74, 'food_farina_di_riso_raw', 17, 't/t/f', NULL, '169714', 'Rice flour, white, unenriched'),
  (75, 'food_farina_di_ceci_raw', 17, 't/t/f', NULL, '174288', 'Chickpea flour (besan)'),
  (76, 'food_noci_del_brasile_raw', 17, 't/t/f', NULL, '170569', 'Nuts, brazilnuts, dried, unblanched'),
  (77, 'food_noci_macadamia_raw', 14, 't/t/f', NULL, '170178', 'Nuts, macadamia nuts, raw'),
  (78, 'food_latte_di_capra_raw', 17, 't/f/f', NULL, '171278', 'Milk, goat, fluid, with added vitamin D'),
  (79, 'food_sciroppo_di_acero_raw', 17, 't/t/f', NULL, '169661', 'Syrups, maple'),
  (80, 'food_mango_raw', 17, 't/t/t', 'raw_intact', '169910', 'Mangos, raw'),
  (81, 'food_papaya_raw', 17, 't/t/t', 'raw_intact', '169926', 'Papayas, raw'),
  (82, 'food_litchi_raw', 17, 't/t/t', 'raw_intact', '169086', 'Litchis, raw'),
  (83, 'food_aringa_raw', 17, 'f/f/f', NULL, '175116', 'Fish, herring, Atlantic, raw'),
  (84, 'food_strutto', 17, 'f/f/f', NULL, '171401', 'Lard'),
  (85, 'food_fagioli_neri_raw', 17, 't/t/f', NULL, '175186', 'Beans, black turtle, mature seeds, raw'),
  (86, 'food_lupini_raw', 16, 't/t/f', NULL, '172423', 'Lupins, mature seeds, raw'),
  (87, 'food_crusca_di_frumento_raw', 17, 't/t/f', NULL, '169722', 'Wheat bran, crude'),
  (88, 'food_germe_di_grano_raw', 13, 't/t/f', NULL, '168892', 'Wheat germ, crude'),
  (89, 'food_farina_di_frumento_integrale_raw', 17, 't/t/f', NULL, '168893', 'Wheat flour, whole-grain (Includes foods for USDA''s Food Distribution Program)'),
  (90, 'food_cardi_raw', 14, 't/t/f', NULL, '169981', 'Cardoon, raw'),
  (91, 'food_fichi_dindia_raw', 16, 't/t/t', 'raw_intact', '167750', 'Prickly pears, raw'),
  (92, 'food_caprino_fresco', 17, 't/f/f', NULL, '173435', 'Cheese, goat, soft type'),
  (93, 'food_zucchero_di_canna_raw', 17, 't/t/f', NULL, '168833', 'Sugars, brown'),
  (94, 'food_cavolo_rapa_raw', 17, 't/t/f', 'raw_intact', '168424', 'Kohlrabi, raw'),
  (95, 'food_fegato_di_vitello_raw', 17, 'f/f/f', NULL, '172534', 'Veal, variety meats and by-products, liver, raw'),
  (96, 'food_pinoli_raw', 17, 't/t/f', NULL, '170591', 'Nuts, pine nuts, dried'),
  (97, 'food_ananas_raw', 17, 't/t/t', 'raw_intact', '169124', 'Pineapple, raw, all varieties'),
  (98, 'food_semi_di_chia_raw', 14, 't/t/f', NULL, '170554', 'Seeds, chia seeds, dried')
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
