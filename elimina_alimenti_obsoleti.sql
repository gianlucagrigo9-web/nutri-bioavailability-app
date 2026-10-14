-- elimina_alimenti_obsoleti.sql (2026-10-14)
--
-- CANCELLA le righe VECCHIE di foods_raw (residui del primo seed demo) che hanno
-- una versione nuova e completa. E' il passo 2 dopo check_alimenti_obsoleti.sql.
--
-- COME SI USA. Apri questo file, seleziona tutto (Ctrl+A), copia (Ctrl+C), incolla
-- nell'editor SQL di Supabase e premi Run. Una sola volta basta: se lo rilanci non
-- succede niente di nuovo (le righe gia' cancellate risultano ASSENTE).
--
-- COSA FA, riga per riga, da solo. Una riga vecchia viene cancellata SOLO se
-- TUTTE queste condizioni sono vere (altrimenti viene TENUTA e lo script scrive
-- il motivo):
--   1. ha un sostituto previsto, e il sostituto e' davvero nel database;
--   2. la riga vecchia e' draft (mai verified = mai visibile nell'app);
--   3. nessun valore della riga vecchia ha una fonte citata (sono valori demo,
--      non dati sourced: non si perde nessuna informazione vera);
--   4. la riga vecchia non e' usata in nessun piatto composto;
--   5. il sostituto e' completo: almeno 13 nutrienti con fonte (e' il minimo
--      di un'estrazione FDC completa, es. avena) e ha le kcal (energy_kcal).
-- Non tocca MAI gli alimenti del Golden Set (arance, lenticchie, ceci ecc.): la
-- lista qui sotto contiene solo i 16 id vecchi, nessuno dei quali e' del Golden Set.
--
-- RISULTATO. Una tabella con una riga per alimento: CANCELLATO oppure TENUTO (con
-- motivo) oppure ASSENTE. La colonna copia_valori_cancellati conserva a testo i
-- valori demo cancellati, cosi' esiste un registro di cio' che e' stato tolto.
-- Tutto avviene in un'unica istruzione SQL: o riesce per intero o non cambia nulla.

WITH legacy(legacy_id, sostituto_id) AS (VALUES
  ('food_garlic_raw', 'food_garlic_fresh_raw'),
  ('food_apple_raw', 'food_apple_with_skin_raw'),
  ('food_walnuts_raw', 'food_noci_raw'),
  ('food_oats_raw', 'food_avena_cruda'),
  ('food_rice_brown_raw', 'food_riso_integrale_raw'),
  ('food_strawberries_raw', 'food_strawberry_raw'),
  ('food_potatoes_raw', 'food_potato_raw'),
  ('food_beans_kidney_raw', 'food_kidney_beans_raw'),
  ('food_almonds_raw', 'food_almonds'),
  ('food_spelt_raw', 'food_farro_raw'),
  ('food_lemon_raw', 'food_lemon_peeled_raw'),
  ('food_beef_raw', NULL),
  ('food_quinoa_raw', NULL),
  ('food_buckwheat_raw', NULL),
  ('food_dates_raw', NULL),
  ('food_flaxseed_raw', NULL)
),
stato AS (
  SELECT l.legacy_id, l.sostituto_id,
         f.food_id IS NOT NULL AS presente,
         f.name_it,
         f.verification_status::text AS stato_vecchio,
         (SELECT count(*) FROM nutrient_values v WHERE v.food_id = l.legacy_id AND v.source_id IS NOT NULL) AS n_vecchio_fonte,
         (SELECT count(*) FROM dish_components d WHERE d.food_id = l.legacy_id) AS n_piatti,
         (SELECT count(*) FROM foods_raw s WHERE s.food_id = l.sostituto_id) AS n_sost_presente,
         (SELECT count(*) FROM nutrient_values v WHERE v.food_id = l.sostituto_id AND v.source_id IS NOT NULL) AS n_sost_fonte,
         EXISTS (SELECT 1 FROM nutrient_values v
                  WHERE v.food_id = l.sostituto_id AND v.nutrient_code = 'energy_kcal'
                    AND v.value IS NOT NULL AND v.source_id IS NOT NULL) AS sost_energia
    FROM legacy l
    LEFT JOIN foods_raw f ON f.food_id = l.legacy_id
),
verdetto AS (
  SELECT s.*,
         CASE
           WHEN NOT presente THEN 'ASSENTE'
           WHEN sostituto_id IS NULL THEN 'TENUTO: nessun sostituto previsto'
           WHEN n_sost_presente = 0 THEN 'TENUTO: il sostituto non e presente nel database'
           WHEN stato_vecchio <> 'draft' THEN 'TENUTO: la riga vecchia non e draft'
           WHEN n_vecchio_fonte > 0 THEN 'TENUTO: la riga vecchia ha valori con fonte'
           WHEN n_piatti > 0 THEN 'TENUTO: usata in ' || n_piatti || ' piatti'
           WHEN n_sost_fonte < 13 THEN 'TENUTO: sostituto incompleto (' || n_sost_fonte || ' nutrienti con fonte, ne servono 13)'
           WHEN NOT sost_energia THEN 'TENUTO: il sostituto non ha le kcal'
           ELSE 'CANCELLA'
         END AS verdetto
    FROM stato s
),
del_nv AS (
  DELETE FROM nutrient_values
   WHERE food_id IN (SELECT legacy_id FROM verdetto WHERE verdetto = 'CANCELLA')
  RETURNING food_id, nutrient_code, value
),
del_f AS (
  DELETE FROM foods_raw
   WHERE food_id IN (SELECT legacy_id FROM verdetto WHERE verdetto = 'CANCELLA')
  RETURNING food_id
)
SELECT v.legacy_id AS food_id,
       v.name_it,
       CASE WHEN v.verdetto = 'CANCELLA' THEN 'CANCELLATO' ELSE v.verdetto END AS esito,
       EXISTS (SELECT 1 FROM del_f x WHERE x.food_id = v.legacy_id) AS riga_cancellata,
       v.sostituto_id AS sostituto,
       v.n_sost_fonte AS sostituto_nutrienti_con_fonte,
       (SELECT count(*) FROM del_nv d WHERE d.food_id = v.legacy_id) AS valori_cancellati,
       (SELECT string_agg(d.nutrient_code || '=' || d.value, ', ' ORDER BY d.nutrient_code)
          FROM del_nv d WHERE d.food_id = v.legacy_id) AS copia_valori_cancellati
  FROM verdetto v
 ORDER BY (v.verdetto = 'CANCELLA') DESC, v.legacy_id;
