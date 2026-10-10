-- ============================================================================
-- retention_factors: "Padella" (fritto/saltato senza acqua aggiunta) — tuberi
-- e legumi. Richiesta esplicita dell'utente ("sarebbe bello avere anche
-- padella (classica scottata senza acqua)").
--
-- Fonte: USDA Table of Nutrient Retention Factors, Release 6 (2007).
-- Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034.
-- PDF: https://www.ars.usda.gov/ARSUserFiles/80400535/Data/retn/retn06.pdf
-- (stessa fonte di retention_factors_legumi_tuberi.sql — qui si usa il
-- cooking_method_enum 'fried', che esiste già nello schema dal vivo e non
-- richiede nessuna ALTER TYPE).
--
-- Processo di ricerca: ricerca delegata a un subagent dedicato (compito:
-- trovare dati REALI per 'fried' su 6 matrici: tubers, legumes, carrots,
-- crucifere_cavoletti_bruxelles, broccoli, leafy_greens — ferro/zinco/
-- vitamina C). Risultato: 2 matrici con dato reale (sotto), 4 gap espliciti
-- (vedi blocco "NON INCLUSO" a fondo file). Nessun valore stimato o
-- interpolato per le matrici senza fonte — in pieno rispetto della regola
-- "zero dati inventati".
--
-- STATUS: tutte le righe sotto sono inserite con verification_status='draft'
-- (non 'verified'), perché entrambe portano una riserva interpretativa non
-- banale (vedi commenti puntuali) che un revisore umano dovrebbe confermare
-- prima della promozione a 'verified', secondo il workflow draft/verified
-- già in uso nel progetto.
-- ============================================================================

INSERT INTO sources (id, citation) VALUES
  ('USDA_RETN06', 'USDA Table of Nutrient Retention Factors, Release 6 (2007). Pubblico dominio (CC0). DOI 10.15482/USDA.ADC/1409034')
ON CONFLICT (id) DO UPDATE SET citation = EXCLUDED.citation;

-- ----------------------------------------------------------------------------
-- TUBERI (patate) — Ferro, Zinco, Vitamina C — FRITTO/PADELLA
-- USDA Release 6, pagina 8-9, codice tabella "11 POTATOES"
--
-- Riga "3315  POTATOES,FRIED": Fe = 100%, Zn = 100%, Vit C = 80%.
--
-- RISERVA INTERPRETATIVA (da confermare prima di passare a 'verified'):
-- il documento USDA Release 6 NON definisce esplicitamente, né
-- nell'introduzione né nelle note metodologiche, se "FRIED" significhi
-- frittura in padella (poco grasso) o frittura ad immersione (deep-fry).
-- Indizio strutturale: il "French fry" (frittura ad immersione) ha un
-- codice SEPARATO, 3381 "CKD FROM FRZN,FRENCH FRY" (Fe100/Zn100/VitC80),
-- distinto dal generico 3315 "POTATOES,FRIED" usato qui. Questo suggerisce
-- che 3315 corrisponda a preparazioni da padella (es. patate saltate con
-- poco grasso) piuttosto che a frittura ad immersione — ma è un'INFERENZA
-- dalla struttura della tabella, NON un'affermazione esplicita della fonte.
-- Se in futuro emerge una fonte che la contraddice, questo dato va rivisto.
-- ----------------------------------------------------------------------------

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('tubers', 'fried', 'iron',      1.00, NULL, NULL, 'USDA_RETN06', 'draft'), -- Release 6, p.8-9, riga 3315, colonna Fe
  ('tubers', 'fried', 'zinc',      1.00, NULL, NULL, 'USDA_RETN06', 'draft'), -- Release 6, p.8-9, riga 3315, colonna Zn
  ('tubers', 'fried', 'vitamin_c', 0.80, NULL, NULL, 'USDA_RETN06', 'draft')  -- Release 6, p.8-9, riga 3315, colonna VitC
ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low, confidence_high = EXCLUDED.confidence_high,
  source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ----------------------------------------------------------------------------
-- LEGUMI (fagioli, lenticchie, ceci) — Ferro, Zinco, Vitamina C — FRITTO/PADELLA
-- USDA Release 6, pagina 14-15, codice tabella "16 LEGUMES"
--
-- La tabella USDA organizza i legumi per TEMPO di cottura (15/20min,
-- 45/75min, 2/2.5h) e, per ciascuna fascia, distingue due varianti "fried":
--   0505/0506  CKD 15/20MIN  — BLD,DRND,FRIED / BOILED+FRIED
--   0525/0526  CKD 45/75MIN  — BLD,DRND,FRIED / BOILED+FRIED
--   0545/0546  CKD 2/2.5HRS  — BLD,DRND,FRIED / BOILED+FRIED
-- Nessuna di queste è una frittura diretta dal secco/dall'ammollo: TUTTE
-- sono un fattore COMBINATO bollitura+frittura in due fasi (coerente con
-- come si cucinano davvero i legumi secchi: prima si bollono, poi si
-- saltano in padella). Non esiste nella fonte un fattore "solo padella"
-- isolato da applicare a un legume già bollito a parte.
--
-- DECISIONE DEL TEAM (non specificata dalla fonte, documentata qui come
-- richiesto): la tabella USDA non mappa esplicitamente quale fascia di
-- tempo corrisponda a lenticchie/fagioli/ceci, e nel nostro schema
-- matrix_id='legumes' è condiviso da tutti i legumi del Golden Set
-- (food_lentils_boiled, food_kidney_beans_boiled, food_chickpeas_boiled) —
-- esattamente come 'boiled' è già oggi un unico valore condiviso per questa
-- stessa matrice. Per 'fried' adottiamo la stessa semplificazione:
--   - Fascia scelta: 45/75min (riga 0525), per COERENZA con il valore
--     'boiled' già esistente per questa matrice (retention_factors_legumi_
--     tuberi.sql usa la riga 0521 "CKD 45/75MIN,BOILED,DRND" come baseline
--     'boiled' di 'legumes") — usiamo la stessa fascia anche per 'fried',
--     invece di introdurre una granularità per-legume che l'enum
--     cooking_method_enum non supporta ancora (richiederebbe nuovi valori
--     come 'fried_quick_15_20min', non implementati qui).
--   - Variante scelta entro la fascia: "BLD,DRND,FRIED" (0525, bollito e
--     SCOLATO, poi fritto) invece di "BOILED+FRIED" (0526, bollito e
--     fritto senza la scolatura esplicita) — per COERENZA con la
--     convenzione "boiled, drained" già usata per il valore 'boiled'
--     baseline di questa matrice.
--   - Valori riga 0525: Fe = 80%, Zn = 85%, Vit C = 60%.
--
-- LIMITE DICHIARATO (per trasparenza, non implementato): questa è una
-- semplificazione nota, non un dato perfetto — lenticchie (cottura rapida,
-- 15/20min) e ceci (cottura lunga, 2/2.5h) userebbero in teoria righe
-- diverse (Fe 85%/60% vs Fe 75%/60% circa) ma il nostro schema attuale
-- forza lo stesso fattore 'fried' su tutti e tre. Se in futuro si vuole
-- la granularità già esistente per 'boiled' (vedi 'boiled_quick_15_20min'),
-- la stessa estensione andrebbe fatta per 'fried' con una decisione e
-- un'ALTER TYPE separate.
-- ----------------------------------------------------------------------------

INSERT INTO retention_factors (matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id, verification_status) VALUES
  ('legumes', 'fried', 'iron',      0.80, NULL, NULL, 'USDA_RETN06', 'draft'), -- Release 6, p.14-15, riga 0525, colonna Fe
  ('legumes', 'fried', 'zinc',      0.85, NULL, NULL, 'USDA_RETN06', 'draft'), -- Release 6, p.14-15, riga 0525, colonna Zn
  ('legumes', 'fried', 'vitamin_c', 0.60, NULL, NULL, 'USDA_RETN06', 'draft')  -- Release 6, p.14-15, riga 0525, colonna VitC
ON CONFLICT (matrix_id, cooking_method, nutrient) DO UPDATE SET
  value = EXCLUDED.value, confidence_low = EXCLUDED.confidence_low, confidence_high = EXCLUDED.confidence_high,
  source_id = EXCLUDED.source_id, verification_status = EXCLUDED.verification_status;

-- ============================================================================
-- NON INCLUSO — gap espliciti dichiarati dal subagent di ricerca, nessun
-- valore stimato o inventato per nessuna delle 4 matrici seguenti:
--
-- - CARROTS (carote): nessuna fonte reale trovata per frittura/padella +
--   ferro/zinco/vitamina C. Verificati: Masrizal et al. 1997 (J Food Qual
--   20(5):403-418, stir-fry — testo pieno non accessibile per confermare
--   se le carote fossero incluse); Pigoli, Vieites & Daiuto 2014 (Energy
--   in Agriculture 29(2):121-127, DOI 10.17224/EnergAgric.2014v29n2p121-127
--   — misura Fe/Zn/VitC su carota ma SOLO pressione/immersione/microonde/
--   vapore, frittura esplicitamente non testata).
--
-- - CRUCIFERE_CAVOLETTI_BRUXELLES: nessuna fonte reale trovata per
--   frittura/padella + ferro/zinco. Doniec et al. 2022 (già fonte di
--   retention_factors_crucifere.sql) misura Fe/Zn ma solo bollitura/vapore/
--   sous-vide, nessuna frittura. Nugrahedi et al. 2017 (Plant Foods Hum
--   Nutr 72(4):439-444) studia lo stir-frying ma su Brassica rapa (cavolo
--   cinese), non su Brassica oleracea var. gemmifera, e misura solo
--   glucosinolati, non Fe/Zn/VitC.
--
-- - BROCCOLI: GAP OPERATIVO — fonte reale e molto pertinente IDENTIFICATA
--   ma valori numerici NON estraibili dall'abstract pubblico. Moreno DA,
--   López-Berenguer C, García-Viguera C. "Effects of Stir-Fry Cooking with
--   Different Edible Oils on the Phytochemical Composition of Broccoli."
--   J Food Sci. 2007;72(1). DOI 10.1111/j.1750-3841.2006.00213.x — misura
--   ESPLICITAMENTE ferro, zinco e vitamina C su broccoli stir-fry (metodo
--   concettualmente molto vicino a "padella senza acqua"). Accesso al testo
--   completo bloccato per il subagent (DOI diretto: errore client;
--   ResearchGate: errore; repository CSIC: bloccato da anti-bot "Anubis";
--   PMC/review citante: bloccato da reCAPTCHA). L'utente, come studente di
--   magistrale, potrebbe avere accesso istituzionale (Wiley Online Library
--   o biblioteca universitaria) che risolverebbe questo gap con un dato
--   reale — segnalato come la pista più promettente delle 4 matrici
--   vegetali rimaste. Nessun numero inventato in sua assenza.
--
-- - LEAFY_GREENS (spinaci/kale): nessuna fonte reale trovata per
--   frittura/padella + ferro/zinco/vitamina C. Verificati: Nursal &
--   Yucecan 2000 (Nahrung-Food 44(6):451-453, solo bollitura/VitC, no Fe/
--   Zn); Wang et al. 2019 (Food Sci Biotechnol 27(2):333-342, DOI
--   10.1007/s10068-017-0281-1, blanching/bollitura/microonde/vapore, no
--   frittura, no Fe/Zn); Storcksdieck genannt Bonsmann et al. 2008 (Eur J
--   Clin Nutr 62:336-341, assorbimento in vivo, non è uno studio di
--   cottura/ritenzione); Wang et al. 2019 (Food Sci Technol Res
--   25(6):801-807, solo bollitura, no Fe/Zn/frittura).
-- ============================================================================

-- ============================================================================
-- NOTA DI VERIFICABILITÀ (per trasparenza): il download diretto via curl del
-- PDF USDA è stato bloccato dal proxy di rete durante la ricerca (403 su
-- www.ars.usda.gov e su api.nal.usda.gov); i dati sopra sono stati estratti
-- tramite un tool di web-fetch che accede e riassume il contenuto del PDF,
-- non tramite estrazione testuale diretta verificabile byte-per-byte. La
-- lettura è stata incrociata con due letture indipendenti dello stesso PDF
-- (una per i dati, una per metodologia/definizioni), risultate coerenti tra
-- loro — ma questo limite di verificabilità resta dichiarato qui.
-- ============================================================================
