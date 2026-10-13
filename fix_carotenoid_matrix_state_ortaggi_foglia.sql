-- fix_carotenoid_matrix_state_ortaggi_foglia.sql (PROPOSTA 2026-10-13 notte)
--
-- >>> PROPOSTA -- NON ESEGUITO. Non incollare questo file in Supabase finche'
-- >>> l'utente non ha scelto l'opzione A in docs/PENDING_HUMAN_ACTIONS.md
-- >>> (analisi completa: docs/INDAGINE_CAROTENOID_MATRIX_STATE.md).
--
-- Da eseguire UNA VOLTA nell'editor SQL di Supabase (seleziona tutto, Run).
--
-- PERCHE'. calculateVitaminARAE usa il fattore "crudo" (9.44:1) solo se
-- foods_raw.carotenoid_matrix_state = 'raw_intact'; per NULL (e per
-- 'cooked_or_disrupted') usa il fattore "cotto" (6:1). Spinaci, kale e cavoletti
-- di Bruxelles crudi avevano lo stato NULL (impostato nel Golden Set solo per
-- carote, broccoli e arance), quindi mostrano la vitamina A ~57% piu' alta del
-- fattore crudo sulla parte da beta-carotene -- un default silenzioso.
--
-- COSA FA (opzione A):
--   * food_spinach_raw, food_kale_raw, food_brussels_sprouts_raw  -> 'raw_intact'
--   * food_spinach_boiled -> 'cooked_or_disrupted' (stesso numero di prima,
--     perche' NULL gia' si comportava da "cotto": serve solo a rendere esplicito
--     lo stato invece di affidarsi a un default)
--
-- SICUREZZA.
--  * Agisce SOLO sulle righe con carotenoid_matrix_state ancora NULL: non
--    sovrascrive mai uno stato gia' impostato.
--  * Se un alimento ha gia' uno stato DIVERSO da quello atteso, il file si ferma
--    con un errore che lo nomina (non modifica nulla di quell'alimento: scrivere
--    a Claude). Un alimento non presente viene segnalato e saltato.
--  * Rieseguirlo e' innocuo (la seconda volta aggiorna 0 righe).
--  * Reversibile: UPDATE foods_raw SET carotenoid_matrix_state = NULL
--    WHERE food_id IN (...); riporta al comportamento precedente.
--
-- COLLAUDO. Provato (2026-10-13) su un PostgreSQL 16 locale con tabelle fittizie:
-- caso normale, riesecuzione, stato diverso gia' presente (errore atteso), alimento
-- mancante (saltato). NON provato sul DB reale.
--
-- ULTIMA ISTRUZIONE (la tabella che l'editor mostra): tutti gli alimenti con
-- beta-carotene > 0 e stato ancora NULL, cosi' si vede cos'altro resta con il
-- default silenzioso. Attesi: pochi alimenti con beta-carotene trascurabile
-- (patata, fegato, melanzana). Qualunque alimento crudo di verdura/frutta con
-- valori alti comparso qui va classificato.

UPDATE foods_raw
SET carotenoid_matrix_state = 'raw_intact'
WHERE food_id IN ('food_spinach_raw', 'food_kale_raw', 'food_brussels_sprouts_raw')
  AND carotenoid_matrix_state IS NULL;

UPDATE foods_raw
SET carotenoid_matrix_state = 'cooked_or_disrupted'
WHERE food_id = 'food_spinach_boiled'
  AND carotenoid_matrix_state IS NULL;

-- Verifica difensiva (stesso stile degli altri fix_*.sql): mai assumere che
-- gli UPDATE abbiano fatto quello che ci aspettiamo.
DO $$
DECLARE
  expected text[][] := ARRAY[
    ARRAY['food_spinach_raw', 'raw_intact'],
    ARRAY['food_kale_raw', 'raw_intact'],
    ARRAY['food_brussels_sprouts_raw', 'raw_intact'],
    ARRAY['food_spinach_boiled', 'cooked_or_disrupted']
  ];
  i integer;
  fid text;
  want text;
  got text;
  n_ok integer := 0;
  n_missing integer := 0;
BEGIN
  FOR i IN 1 .. array_length(expected, 1) LOOP
    fid := expected[i][1];
    want := expected[i][2];

    IF NOT EXISTS (SELECT 1 FROM foods_raw WHERE food_id = fid) THEN
      n_missing := n_missing + 1;
      RAISE NOTICE '% non e'' presente in foods_raw: saltato.', fid;
    ELSE
      SELECT carotenoid_matrix_state INTO got FROM foods_raw WHERE food_id = fid;
      IF got IS DISTINCT FROM want THEN
        RAISE EXCEPTION '% ha carotenoid_matrix_state = % (atteso %). Non sovrascritto -- controllare a mano.', fid, COALESCE(got, 'NULL'), want;
      END IF;
      n_ok := n_ok + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'OK: % alimenti con lo stato atteso; % non presenti in foods_raw (saltati).', n_ok, n_missing;
END $$;

-- Controllo di insieme (ultima istruzione: e' quella che l'SQL editor mostra
-- come tabella).
SELECT f.food_id, f.name_it, f.verification_status, n.value AS beta_carotene_mcg_per_100g
  FROM foods_raw f
  JOIN nutrient_values n
    ON n.food_id = f.food_id AND n.nutrient_code = 'beta_carotene_mcg'
 WHERE n.value > 0
   AND f.carotenoid_matrix_state IS NULL
 ORDER BY n.value DESC;
