# Indagine: `carotenoid_matrix_state` NULL su spinaci, kale e cavoletti di Bruxelles crudi

**Data**: 2026-10-13 (notte). **Sessione**: interattiva collegata al PC. **Richiesta dell'utente**: "indaga su questo carotenoid matrix state … e cerca di proporre soluzioni".
**Stato**: indagine conclusa, **nessun codice dell'app modificato, nessuna scrittura sul DB**. Resta una decisione che spetta all'utente (sezione 5). Voce corrispondente in `docs/PENDING_HUMAN_ACTIONS.md`.

---

## In breve

1. **Il problema è reale.** Per spinaci, kale e cavoletti di Bruxelles *crudi* l'app calcola la vitamina A col fattore "cotto" (6:1) invece di quello "crudo" (9,44:1). Risultato: la parte di vitamina A che viene dal beta-carotene è mostrata **~57% più alta** di quanto darebbe il fattore crudo (spinaci crudi, 100 g: 938 µg invece di 597). Succede in silenzio: nessun avviso.
2. **L'impatto oggi è piccolo.** La vitamina A compare solo nel *Meal Builder* (la pagina dove si compone un pasto). **Non** entra nel generatore di diete: è esplicitamente esclusa (`buildDietNutrientTargets`, test in `tests/dietEngine.test.ts`). Nessuna dieta generata è quindi influenzata da questo problema.
3. **Scoperta più importante del problema iniziale: l'etichetta "RAE" è sbagliata.** I fattori che l'app usa (6:1 e 12:1) e i valori di riferimento che usa (750 / 650 µg, LARN/EFSA) appartengono al sistema **RE** (retinolo equivalenti, usato in Europa e nei paesi nordici). Il sistema **RAE** è quello americano ed è un'altra cosa (nel RAE il beta-carotene vale la metà). I numeri non sono sbagliati — fattori e target sono coerenti tra loro — ma il nome mostrato all'utente ("Vitamina A (RAE)") sì.
4. **Il 6:1 è una convenzione di popolazione, non un assorbimento misurato.** Le misure dirette sugli spinaci danno un rapporto di circa 20:1 (14 persone, intervallo 10–46). Quindi anche i 9,44:1 "crudo" sono ottimisti per gli ortaggi a foglia, e il 6:1 lo è ancora di più.
5. **Raccomandazione**: opzione **A** (impostare "crudo" sui tre alimenti — SQL già pronto, *non eseguito*) + opzione **F** (correggere l'etichetta RAE → RE). Le opzioni più strutturali (B, D) conviene farle quando la vitamina A entrerà nel generatore di diete, non prima.

---

## 1. Cosa succede oggi, con i numeri

**Come funziona il meccanismo.** `calculateVitaminARAE` (`lib/engine/computationalNutritionEngine.ts`) guarda il campo `carotenoid_matrix_state` di ogni alimento:
- `raw_intact` ("crudo, cellule intatte") → beta-carotene diviso 9,44 (= 6 × 65,1/41,4, ricavato da Livny 2003);
- qualunque altra cosa (`cooked_or_disrupted`, o NULL) → beta-carotene diviso 6.

**Dove il NULL diventa "cotto" in silenzio.** `app/page.tsx` riga 225: `carotenoid_matrix_state: row.carotenoid_matrix_state ?? 'cooked_or_disrupted'`. (In `lib/openFoodFacts.ts` riga 237 i prodotti confezionati sono sempre "cotto" *per scelta dichiarata* — lì va bene.)

**Alimenti toccati** (valori per 100 g; ricalcolati da me con la formula del motore):

| Alimento (stato oggi) | Beta-carotene µg/100 g | Vit. A oggi (6:1) | Se fosse "crudo" (9,44:1) | Differenza |
|---|---|---|---|---|
| Spinaci crudi (NULL) | 5630 | 938 | 597 | −36% |
| Kale crudo (NULL) | 2870 (+27 altri) | 481 | 306 | −36% |
| Cavoletti di Bruxelles crudi (NULL) | 450 (+6 altri) | 76 | 48 | −36% |
| *Per confronto:* carote crude (già `raw_intact`) | 8280 (+3480 altri) | 1168 (usa già il fattore crudo; a 6:1 sarebbero 1670) | — | — |

Non toccati: spinaci bolliti (NULL ma sono cotti: il 6:1 è proprio il valore giusto), fegato di manzo (162 µg, trascurabile), patata (2 µg). La melanzana ha NULL ma 14 µg/100 g: trascurabile. Lo stato reale nel DB non è verificabile da qui (nessuna rete verso Supabase): la query di controllo è in fondo.

**Effetto su una porzione** (la porzione standard di verdura in `standardPortions.ts` è 200 g; target maschile 750 µg):

| Porzione | Oggi (6:1) | Con "crudo" (9,44:1) |
|---|---|---|
| Spinaci crudi 200 g | 1877 (250% del target) | 1193 (159%) |
| Spinaci crudi 50 g (insalata) | 469 (63%) | 298 (40%) |
| Kale crudo 200 g | 961 (128%) | 613 (82%) |
| Cavoletti crudi 200 g | 151 (20%) | 96 (13%) |

---

## 2. Cosa dicono le fonti (verificate in questa sessione)

| Fonte | Cosa dice | Come l'ho verificato |
|---|---|---|
| **NNR 2023**, capitolo Vitamina A (Consiglio nordico) | Unità **RE**. 6 µg β-carotene alimentare = 1 RE; 12 µg per gli altri carotenoidi provitaminici; 2 µg per il β-carotene da integratore. Tra i "gap": *"Harmonization in estimating the conversion rates of β-carotene to retinol is missing."* Nessuna parola su crudo/cotto/matrice. | Testo del capitolo su pub.norden.org. La review FNR 10229 citata nel codice non era leggibile (PMC blocca con reCAPTCHA): ho letto il capitolo NNR, non la review. |
| **EFSA 2015** (valori di riferimento vitamina A) | Unità **RE**; 6 µg β-carotene e 12 µg altri carotenoidi = 1 RE; riferimento 750 µg (uomini) / 650 µg (donne). | Fonte *secondaria* (articolo NutraIngredients + pagina dell'autorità alimentare finlandese). Non ho letto l'opinione EFSA originale. |
| **LARN** (tabella SmartFood/IEO, la stessa già usata in `nutrientTargets.ts`) | "Vitamina A espressa in µg di **retinolo equivalenti**"; adulti 750 / 650. Nessuna nota sulla conversione. | Il testo estratto era corrotto (caratteri spostati); l'ho decodificato. Resta il gap già dichiarato: non è il PDF ufficiale SINU. |
| **NIH ODS** (sistema USA, IOM 2001) | **RAE**: 1 µg RAE = 12 µg β-carotene alimentare = 24 µg α-carotene o β-criptoxantina = 2 µg β-carotene da integratore. Dai cibi si assorbe "in most cases 10–30%" del β-carotene; "cooking and heat treatment can increase the bioavailability". | Pagina ufficiale ODS. |
| **Livny et al. 2003** (*Eur J Nutr* 42:338-45) | Solo carote: 65,1% assorbito da cotte/pureed vs 41,4% da crude tritate. | Dal commento nel codice (non riletto in questa sessione). |
| **Russell et al. 2005** (*Am J Clin Nutr* 82:821-8) | Rapporto di conversione misurato: **spinaci 20,9 ± 9,0 : 1** (intervallo 10,0–46,5), carote 14,8 ± 6,5 : 1 (7,7–24,5); 14 persone; verdure *pureed* (quindi già disgregate). | Dall'abstract, nella sessione precedente. |
| **Castenmiller et al. 1999** (*J Nutr* 129:349-55), via tesi Wageningen 2000 | Biodisponibilità del β-carotene degli spinaci **5,1–9,5%** rispetto a un integratore sciolto in olio; la risposta nel sangue differisce tra foglia intera/tritata e liquefatta (la direzione non era nell'estratto letto). | Riassunto della tesi; non il paper originale. |

---

## 3. Le scoperte

### 3a. "RAE" nell'etichetta ma "RE" nei numeri
- **RE** (sistema EFSA / nordico / LARN): 1 µg RE = 6 µg β-carotene.
- **RAE** (sistema USA): 1 µg RAE = **12** µg β-carotene.
- Lo stesso piatto di spinaci (100 g) vale **938 RE** ma solo **469 RAE**.
- L'app usa 6:1 e confronta il risultato con 750/650, entrambi in RE → **internamente coerente**. Ma:
  - `app/page.tsx` righe 193 e 801: etichetta "Vitamina A (RAE)";
  - `lib/engine/nutrientTargets.ts` (due note): "Target in RAE (Retinol Activity Equivalents)";
  - il nome `calculateVitaminARAE` e la chiave `vitamin_a_rae`.
- Un lettore che conosce il sistema USA leggerebbe 938 come "938 RAE" e sovrastimerebbe di un fattore 2.
- **Conseguenza per il nostro problema**: il 6:1 è già una media pensata per una dieta mista (parte cruda, parte cotta). I 9,44:1 per il crudo sono quindi un secondo abbassamento sopra una media che contiene già il crudo. È il "doppio conteggio" che l'utente aveva accettato il 2026-10-09; va solo ricordato che va nella direzione prudente.

### 3b. Per gli ortaggi a foglia la realtà è ancora peggio del 9,44:1
Russell 2005 (spinaci ≈ 21:1) e Castenmiller (5–9,5% di biodisponibilità relativa a un integratore) vanno nella stessa direzione: gli spinaci cedono molto meno vitamina A di quanto il 6:1 suggerisca. Anche passare a 9,44:1 resta ottimista. Il rapporto crudo/cotto di Livny è stato misurato **solo su carote** e applicarlo ai cavoli e alle foglie è una generalizzazione — la stessa già accettata per broccoli, arance, zucchine e per il lotto da 18 alimenti.
→ Il problema originale ("i tre crudi hanno un fattore troppo ottimista") ha quindi una direzione di correzione **sostenuta dalla letteratura**, anche se la grandezza esatta no.

### 3c. Impatto limitato al Meal Builder
`dietGenerator.ts` (righe 38-51) e il test `dietEngine.test.ts` ("omette esplicitamente ferro, zinco, folati e vitamina A") escludono la vitamina A dal punteggio di adeguatezza finché non è collegata in modo corretto. Quindi **oggi** il problema cambia un numero mostrato, non una dieta. Diventerà più importante quando la vitamina A verrà collegata al generatore.

### 3d. Il default silenzioso
Il passaggio NULL → "cotto" è un default non dichiarato (Regola 4: nessun fallimento silenzioso che sembri un successo). Non cambia i numeri rispetto a "non so": 6:1 è comunque il fattore neutro ufficiale. Cambia cosa l'utente *crede* di vedere.

---

## 4. Opzioni

| | Cosa cambia | Vantaggi | Svantaggi | Sforzo / reversibilità |
|---|---|---|---|---|
| **A. Impostare `raw_intact` sui 3 crudi** | 3 righe del DB (+ `cooked_or_disrupted` esplicito per gli spinaci bolliti). Nessun codice. | Coerente con broccoli/arance/zucchine/lotto 18; direzione prudente e sostenuta dalla letteratura; ripristinabile in un secondo | Estende a foglie e cavoli un rapporto misurato solo su carote; resta ottimista per gli spinaci | **SQL pronto**, 1 minuto. Reversibile (riportare a NULL) |
| **B. Togliere il default silenzioso** | Stato "non classificato" esplicito: stesso 6:1 ma con avviso in UI e `bioavailabilityAdjusted: false` | Onestà (Regola 4/6); trova da solo i prossimi alimenti dimenticati | Non cambia i valori; tocca tipi, motore, UI | Codice + test (test prima: vedi sotto). Reversibile |
| **C. Tornare al 6:1 piatto** | Rimuovere la logica crudo/cotto (PRD §4.2 lo consente) | Massima semplicità; nessuna estrapolazione; coincide con la valuta dei target | Scarta una decisione esplicita dell'utente (2026-10-09) e l'unico dato crudo/cotto misurato; **alza** i valori di tutti i crudi, cioè va *contro* la letteratura | Codice + test da riscrivere. Reversibile |
| **D. Mostrare un intervallo, non un punto** | `confidenceLow/High` = 12:1 (convenzione USA) … 6:1 (EFSA/NNR), dichiarato "intervallo tra convenzioni ufficiali, non un intervallo statistico" | Rispetta la Regola 2 (range quando la fonte lo riporta); onesto sull'incertezza vera | Più complesso da mostrare in UI; richiede decidere come comporre l'intervallo su un pasto | Codice + UI + test. Reversibile |
| **E. Fattore specifico per spinaci (20,9:1)** | Un valore solo per gli spinaci | È un dato misurato | 1 studio, 14 persone, intervallo 10–46; non esiste per kale/cavoletti; romperebbe l'uniformità | **Sconsigliata come valore.** Va bene solo come nota nella spiegazione "perché questo numero?" |
| **F. Correggere l'etichetta RAE → RE** | Testi in UI e note (non nomi di funzione) | Elimina un'informazione sbagliata mostrata all'utente; costo minimo | Nessuno | Poche righe, test non coinvolti (da verificare con `npm test`) |

**Test da approvare prima del codice, se si sceglie B** (Regola 5): (1) un alimento con stato NULL/non classificato restituisce lo stesso valore del 6:1 ma con un avviso esplicito nel risultato; (2) il caricamento dal DB non converte più NULL in "cotto" senza lasciare traccia; (3) i test attuali su `raw_intact` e `cooked_or_disrupted` restano invariati.

---

## 5. Raccomandazione

**A + F adesso; B e D quando la vitamina A verrà collegata al generatore di diete; C solo se preferisci la semplicità alla letteratura.**

Perché:
- Vitamina A non guida nessuna dieta oggi → non c'è urgenza per le modifiche strutturali, ma c'è un'incoerenza a costo zero da chiudere (stesso tipo di alimento, trattamento diverso solo per una colonna dimenticata).
- La direzione di A è quella che la letteratura sostiene (le verdure crude a foglia sono assorbite peggio, non meglio).
- C farebbe il contrario: renderebbe *più alti* i valori di tutti i crudi.
- F corregge un'informazione sbagliata mostrata all'utente, senza toccare la logica.

**Cosa serve da te domattina (se dici sì ad A):**
1. `git pull`.
2. Nell'editor SQL di Supabase, incolla ed esegui `fix_carotenoid_matrix_state_ortaggi_foglia.sql` (già nel repo, intestazione "PROPOSTA — NON ESEGUITO"). Non sovrascrive mai uno stato già presente, si ferma con un errore se trova qualcosa di inatteso, e in fondo elenca gli altri alimenti con beta-carotene e stato ancora NULL, così vediamo cos'altro resta.
3. Dimmi com'è andata: allineo `scripts/generate_golden_set_foods.py` (così repo e DB dicono la stessa cosa) e proponiamo F con test.

---

## 6. Limiti di questa indagine (cosa NON è verificato)

- Lo stato **reale** nel DB dei tre alimenti: non raggiungibile da qui (la query di controllo è nel file SQL e nella voce PENDING).
- NNR 2023: letto il capitolo, non la review FNR 10229 citata nel codice. EFSA e LARN: via fonti secondarie. Livny: dal commento nel codice. Russell e Castenmiller: da abstract/riassunto.
- Nessun test eseguito: nessun codice è stato modificato (questa sessione non ha una shell sul PC). L'ultimo risultato noto resta 268 PASS / 0 FAIL.
- Non ho valutato quanto pesi la vitamina A sulla qualità percepita dell'app: è una questione di prodotto, non di calcolo.

## Fonti

- [NNR 2023 — capitolo Vitamina A](https://pub.norden.org/nord2023-003/vitamin-a-.html)
- [Finnish Food Authority — fattori di equivalenza dei carotenoidi, coerenti con EFSA](https://www.ruokavirasto.fi/en/foodstuffs/food-sector/food-information/labelling/nutrition-labelling/vitamin-a-reporting/)
- [NutraIngredients — EFSA: donne 650 µg, uomini 750 µg](https://www.nutraingredients.com/Article/2015/03/06/EFSA-issues-vitamin-A-intake-advice-Women-650-mg-Men-750-mg)
- [SmartFood/IEO — tabella LARN vitamine liposolubili 2025](https://www.smartfood.ieo.it/media/swie5abw/smartfood_tabella_larn_vitamine_liposolubili_2025.pdf)
- [NIH ODS — Vitamin A and Carotenoids](https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/)
- [Castenmiller JJM (2000), tesi: Spinach as a source of carotenoids, folate and antioxidant activity](https://edepot.wur.nl/196581)
- Russell RM et al. 2005, *Am J Clin Nutr* 82:821-8; Livny O et al. 2003, *Eur J Nutr* 42:338-45; Castenmiller JJM et al. 1999, *J Nutr* 129:349-55 (riferimenti bibliografici, senza link verificato in questa sessione).
