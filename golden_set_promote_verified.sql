-- ============================================================================
-- Golden Set: promozione draft -> verified per i 20 alimenti popolati
-- in golden_set_foods.sql (2026-10-09, dopo cross-check meccanico indipendente)
-- ============================================================================
--
-- CONTESTO (non ripetere questa decisione senza leggerlo): il pannello admin
-- (app/admin/data-entry/actions.ts) forza sempre verification_status='draft'
-- su qualunque inserimento, per disegno: 'verified' e' volutamente una
-- promozione umana esplicita, mai un default -- la filosofia
-- "Human-in-the-Loop" di questo progetto (vedi PRD.md §4.6 e il commento
-- storico in DataEntryDashboard.tsx). Questo file e' quella promozione
-- esplicita, richiesta direttamente dall'utente il 2026-10-09 dopo aver
-- ricevuto il risultato di un cross-check meccanico indipendente: ogni
-- FDC ID dei 20 alimenti e' stato ri-scaricato da zero (fetch nuovi, non
-- riusati) e confrontato cifra per cifra con golden_set_foods.sql --
-- 0 discrepanze su 20/20 (nessun errore di trascrizione, nessuno stato di
-- cottura sbagliato).
--
-- COSA NON E' questa promozione: un cross-check meccanico (ho letto bene
-- la fonte) non e' lo stesso di un giudizio di esperto di dominio sulla
-- fonte stessa (e' la fonte giusta per il modello? il metodo analitico e'
-- comparabile?). L'utente ha deciso esplicitamente di accettare il
-- cross-check meccanico come base sufficiente per la promozione ora,
-- con l'intesa dichiarata che un controllo piu' approfondito (e correzioni
-- se emergono errori) avverra' in futuro -- vedi "Da fare" in fondo.
--
-- COSA VIENE PROMOSSO:
--   - foods_raw: le 20 righe elencate sotto (nomi/matrici/attributi
--     categorici confermati corretti dal cross-check).
--   - nutrient_values: SOLO le righe con source_id = 'USDA_FDC' per questi
--     20 food_id (sono le righe effettivamente cross-checkate oggi).
--
-- COSA RESTA 'draft' DI PROPOSITO (non promosso qui):
--   - Le 3 righe nutrient_values da letteratura specifica (ossalati
--     spinaci crudi, ossalati kale, fitati fagioli rossi bolliti -- fonti
--     NOONAN_SAVAGE_1999_APJCN, ERDOGAN_ONAR_2012_JFDA,
--     ZIA_UR_REHMAN_2002_PJSIR). Sono state lette direttamente dai paper
--     citati in una sessione precedente, ma NON sono state ri-verificate
--     nel cross-check di oggi (che ha riguardato solo l'endpoint FDC) --
--     promuoverle ora sarebbe dichiarare "verificato" qualcosa che non e'
--     stato ri-controllato in questo giro. Restano quindi draft fino a un
--     cross-check dedicato sulle 3 citazioni.
--
-- ============================================================================

UPDATE foods_raw
SET verification_status = 'verified'
WHERE food_id IN (
  'food_spinach_raw', 'food_spinach_boiled', 'food_kale_raw', 'food_milk_whole',
  'food_kidney_beans_boiled', 'food_lentils_boiled', 'food_potato_boiled_in_skin',
  'food_carrots_raw', 'food_carrots_boiled',
  'food_brussels_sprouts_raw', 'food_brussels_sprouts_boiled',
  'food_beef_liver_cooked', 'food_beef_ground_cooked',
  'food_broccoli_raw', 'food_almonds', 'food_oranges_raw',
  'food_egg_hard_boiled', 'food_salmon_cooked', 'food_chickpeas_boiled',
  'food_pasta_enriched_cooked'
);

UPDATE nutrient_values
SET verification_status = 'verified'
WHERE source_id = 'USDA_FDC'
  AND food_id IN (
    'food_spinach_raw', 'food_spinach_boiled', 'food_kale_raw', 'food_milk_whole',
    'food_kidney_beans_boiled', 'food_lentils_boiled', 'food_potato_boiled_in_skin',
    'food_carrots_raw', 'food_carrots_boiled',
    'food_brussels_sprouts_raw', 'food_brussels_sprouts_boiled',
    'food_beef_liver_cooked', 'food_beef_ground_cooked',
    'food_broccoli_raw', 'food_almonds', 'food_oranges_raw',
    'food_egg_hard_boiled', 'food_salmon_cooked', 'food_chickpeas_boiled',
    'food_pasta_enriched_cooked'
  );

-- Verifica rapida del risultato (da eseguire a mano dopo le UPDATE sopra,
-- non parte del commit automatico):
--
-- SELECT verification_status, count(*) FROM foods_raw GROUP BY 1;
-- SELECT verification_status, source_id, count(*) FROM nutrient_values GROUP BY 1, 2 ORDER BY 1, 2;
--
-- Atteso dopo l'esecuzione: 20 righe foods_raw 'verified' (+ eventuali
-- altri alimenti pre-esistenti nel DB rimangono al loro stato attuale,
-- questo script non li tocca); nutrient_values 'verified' solo per
-- source_id='USDA_FDC'; le 3 righe con source_id nelle fonti di
-- letteratura restano 'draft'.
--
-- DA FARE in futuro (non ora, per esplicita scelta dell'utente): un
-- controllo piu' approfondito periodico su tutto il Golden Set (compresi
-- questi 20 alimenti, nel caso emergano aggiornamenti USDA, e le 3 righe
-- da letteratura rimaste draft), correggendo eventuali errori trovati e
-- promuovendo di conseguenza -- non e' pensato come un controllo
-- one-shot definitivo.
