# Comandi pronti per l'espansione Golden Set — in attesa di esecuzione umana

**Perché questo file esiste (2026-10-12).** Nessuna sessione automatica disponibile oggi può eseguire realmente `npm run add-food -- --apply`: le sessioni collegate al PC (device-link) non hanno una shell vera per le app Terminale/IDE (accesso solo "click", confermato da un collaudo reale lo stesso giorno — vedi `docs/PRD.md` §9 Fase 4 punto 16), e le sessioni cloud non collegate al PC non hanno rete diretta verso Supabase né verso `api.nal.usda.gov` (confermato più volte, vedi `docs/PENDING_HUMAN_ACTIONS.md`). La parte di **ricerca** (trovare un match FDC solido, decidere gli attributi categorici per analogia) non richiede invece né shell né rete verso Supabase/FDC diretta — solo `git` e ricerca web — quindi **può** girare da sola in un task pianificato cloud. Questo file è la coda di output di quel task: alimenti già ricercati e valutati, con i comandi pronti da incollare sul tuo PC quando hai un momento.

**Convenzione:**
- Una voce per alimento, più recenti in cima.
- Ogni voce ha: alimento, FDC ID + dataType, quanti nutrienti su 17 trovati, l'analogia dichiarata, i due comandi (dry-run e apply).
- Quando esegui un comando da qui e confermi l'esito (dal log reale, non a sensazione), la voce va spostata in "Eseguiti" con la data ed eventualmente la riga nella coda di `docs/PRD.md` va marcata `✅` — questo lavoro di chiusura lo fa una sessione interattiva (questa chat), non il task pianificato stesso (che prepara soltanto, non segue mai l'esito di un comando che non ha eseguito lui).
- **Dal 2026-10-12 sera ogni comando richiede `--diet-category` (meat_fish | egg_dairy | fresh_fruit | plant_non_fruit)**: senza, lo script si ferma prima di scrivere. Motivo: gli alimenti senza classificazione dieta venivano esclusi in silenzio dai filtri vegetariano/vegano/fruttariano (vedi `lib/fdc/dietCategory.ts` e `docs/PRD.md` §9 Fase 4.16).
- Se un comando qui elencato fallisce o dà un riepilogo diverso da quanto previsto, dimmelo in chat: la voce resta qui finché non si chiarisce, non va rimossa automaticamente.

**Per l'uso quotidiano (2026-10-12)**: l'utente non programma e trova questo file troppo denso da seguire ogni volta. Esiste quindi `docs/PROSSIMO_COMANDO.txt` — solo il comando (dry-run + apply) del PRIMO alimento in "Pronti" sotto, senza spiegazioni, mantenuto aggiornato da una sessione interattiva (non dal task pianificato, che non sa quale comando l'utente ha già in mano) ogni volta che una voce viene eseguita o aggiunta. Questo file resta la fonte di verità con tutto il ragionamento; quello è solo una vista semplificata del primo elemento della coda.

---

## Pronti

### Burro, senza sale (2026-10-13)

- **FDC ID**: 173430, dataType **SR Legacy** — "Butter, without salt".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 717kcal, proteine 0,85g, grassi 81,1g, carboidrati 0,060g, fibra 0g, calcio 24,0mg, ferro 0,020mg, zinco 0,090mg, magnesio 2,00mg, rame 0,016mg, selenio 1,00µg, vitamina C 0mg, vitamina K 7,00µg, vitamina B12 0,17µg, folato totale (food) 3,00µg, beta-carotene 158µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento, atteso per un latticino grasso non trattato.
- **Perché questo record rappresenta bene il burro comune italiano**: "without salt" (senza sale aggiunto) — sodio 11,0mg/100g, coerente con la sola traccia naturale del latte, non con un burro salato (che avrebbe centinaia di mg di sodio); nessuna menzione di "whipped" (montato, aerato, densità diversa) né di margarina o prodotto misto.
- **Analogia dichiarata**: `food_milk_whole` — stessa categoria "latticino" (`matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`, `is_heme_iron=false`): il burro ha un contenuto di calcio basso in assoluto (24mg/100g) ma nessun inibitore di assorbimento (ossalati/fitati) presente, stessa categoria del latte da cui deriva; matrice propria (`burro`, non riusa `dairy_milk`: composizione nutrizionale molto diversa, quasi tutto grasso).
- **Categoria dieta**: `egg_dairy` — esplicitamente uno degli esempi citati nella definizione stessa della categoria (uova, latte, latticini e formaggi, burro, miele): vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=173430 --food-id=food_burro --name-it="Burro, senza sale" --matrix-id=burro --matrix-description-it="Burro" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=173430 --food-id=food_burro --name-it="Burro, senza sale" --matrix-id=burro --matrix-description-it="Burro" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: non necessario, il record FDC 173430 è pulito e completo (17/17); una variante "burro salato" (altro FDC ID, non usato) resterebbe disponibile come voce separata se mai richiesta in futuro.

### Yogurt greco (plain, latte intero) (2026-10-13)

- **FDC ID**: 171304, dataType **SR Legacy** — "Yogurt, Greek, plain, whole milk".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 97,0kcal (vedi nota), proteine 9,00g, grassi 5,00g, carboidrati 3,98g, fibra 0g, calcio 100mg, ferro 0mg, zinco 0,52mg, magnesio 11,0mg, rame 0,017mg, selenio 9,70µg, vitamina C 0mg, vitamina K 0µg, vitamina B12 0,75µg, folato totale (food) 5,00µg, beta-carotene 7,00µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento.
- **Nota su una piccola discrepanza interna nella pagina aggregatore consultata**: l'etichetta nutrizionale mostrata sulla stessa pagina riporta 100kcal (arrotondato) invece di 97,0kcal di tabella dettagliata — riportato qui il valore di tabella, più granulare; stessa origine per una micro-differenza analoga su B12 (0,8 vs 0,75µg). Scarti di arrotondamento, non una discrepanza sui dati sostanziali — il dry-run reale dello script (fetch diretto dal record FDC) è comunque l'unica verifica che conta prima dell'apply.
- **Perché questo record rappresenta bene lo yogurt greco comune italiano**: esplicitamente "whole milk" (latte intero) — non la variante nonfat/lowfat (magro), che non rappresenterebbe bene un "yogurt greco intero" comune.
- **Analogia dichiarata**: `food_milk_whole` — stessa categoria "latticino" (`matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`, `is_heme_iron=false`), matrice propria (`yogurt_greco`, non riusa `dairy_milk`: composizione nutrizionale diversa dal latte, es. proteine quasi triple per la concentrazione tipica dello yogurt greco).
- **Categoria dieta**: `egg_dairy` — latticino: vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=171304 --food-id=food_yogurt_greco --name-it="Yogurt greco (plain, latte intero)" --matrix-id=yogurt_greco --matrix-description-it="Yogurt greco" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=171304 --food-id=food_yogurt_greco --name-it="Yogurt greco (plain, latte intero)" --matrix-id=yogurt_greco --matrix-description-it="Yogurt greco" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: FDC 2259794 (Foundation Foods, stessa descrizione "Yogurt, Greek, plain, whole milk") scartato a priori — pagina consultata mostra selenio/vitamina C/B12/folato/carotenoidi tutti "non riportati" e un'energia incoerente su tre punti della stessa pagina (90/94,5/95kcal): molto meno completo e meno coerente del record SR Legacy scelto.

### Yogurt bianco intero (plain, latte intero) (2026-10-13)

- **FDC ID**: 171284, dataType **SR Legacy** — "Yogurt, plain, whole milk".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 61,0kcal, proteine 3,47g, grassi 3,25g, carboidrati 4,66g, fibra 0g, calcio 121mg, ferro 0,050mg, zinco 0,59mg, magnesio 12,0mg, rame 0,0090mg, selenio 2,20µg, vitamina C 0,50mg, vitamina K 0,20µg, vitamina B12 0,37µg, folato totale (food) 7,00µg, beta-carotene 5,00µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare (folato totale = folato alimentare = 7µg) — nessun segnale di arricchimento.
- **Perché questo record rappresenta bene lo yogurt bianco comune italiano**: esplicitamente "whole milk" (latte intero), non la variante greca (più concentrata/proteica) né magra/nonfat — distinto correttamente dallo yogurt greco qui sopra (proteine 3,47g vs 9,00g/100g, differenza coerente con la concentrazione tipica dello yogurt greco).
- **Analogia dichiarata**: `food_milk_whole` — stessa categoria "latticino" (`matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`, `is_heme_iron=false`), matrice propria (`yogurt_bianco_intero`).
- **Categoria dieta**: `egg_dairy` — latticino: vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=171284 --food-id=food_yogurt_bianco_intero --name-it="Yogurt bianco intero (plain, latte intero)" --matrix-id=yogurt_bianco_intero --matrix-description-it="Yogurt bianco intero" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=171284 --food-id=food_yogurt_bianco_intero --name-it="Yogurt bianco intero (plain, latte intero)" --matrix-id=yogurt_bianco_intero --matrix-description-it="Yogurt bianco intero" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: FDC 2259793 (Foundation Foods, stessa descrizione "Yogurt, plain, whole milk") scartato a priori — pagina consultata mostra selenio/vitamina C/B12/folato/carotenoidi tutti "non riportati" (~9/17) e una discrepanza interna fra l'energia in tabella (77,3kcal) e quella in etichetta (80kcal): molto meno completo e meno coerente del record SR Legacy scelto.

### Ricotta (latte intero) (2026-10-13)

- **FDC ID**: 170851, dataType **SR Legacy** — "Cheese, ricotta, whole milk".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 150kcal, proteine 7,54g, grassi 10,2g, carboidrati 7,27g, fibra 0g, calcio 206mg, ferro 0,13mg, zinco 0,53mg, magnesio 20,0mg, rame 0,018mg, selenio 5,90µg, vitamina C 0mg, vitamina K 1,10µg, vitamina B12 0,85µg, folato totale (food) 4,00µg, beta-carotene 33,0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento stile USA, atteso per un latticino fresco non trattato.
- **Perché questo record rappresenta bene la ricotta comune italiana**: "whole milk" (latte intero), senza indicazioni di prodotto magro/scremato o lavorato industrialmente; nessuna anomalia di sodio (110mg/100g, nella norma per un latticino fresco non salato pesantemente). Esiste anche una riga Foundation Foods per lo stesso nome (FDC 323444) con valori leggermente diversi (energia 157kcal, proteine 7,8g) — non usata come primaria: il record SR Legacy scelto è quello con tutti i 17 nutrienti confermati dalla fonte consultata.
- **Analogia dichiarata**: `food_milk_whole` — unico latticino già presente nel Golden Set (`dairy_milk`, `matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`): stessa categoria di assorbimento del calcio (alta biodisponibilità, nessuna interferenza da ossalati/fitati, a differenza di spinaci/kale), nessuna famiglia botanica (prodotto animale), matrice propria (`ricotta`, non riusa `dairy_milk`: composizione nutrizionale molto diversa dal latte).
- **Categoria dieta**: `egg_dairy` — latticino: vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=170851 --food-id=food_ricotta --name-it="Ricotta (latte intero)" --matrix-id=ricotta --matrix-description-it="Ricotta" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=170851 --food-id=food_ricotta --name-it="Ricotta (latte intero)" --matrix-id=ricotta --matrix-description-it="Ricotta" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: FDC 323444 (Foundation Foods, stesso alimento concettuale) se il dry-run reale di 170851 risultasse incompleto — non necessario a priori, il record scelto è già 17/17.

### Mozzarella (latte intero) (2026-10-13)

- **FDC ID**: 170845, dataType **SR Legacy** — "Cheese, mozzarella, whole milk".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record; corroborato su carboidrati, vitamina K, acido folico e beta-criptoxantina da triagemethod.com, che etichetta esplicitamente queste voci come SR Legacy — le altre voci di quella stessa pagina sono etichettate AFCD, database australiano diverso, non usate). Valori per 100g: energia 299kcal, proteine 22,2g, grassi 22,1g, carboidrati 2,40g, fibra 0g, calcio 505mg, ferro 0,44mg, zinco 2,92mg, magnesio 20,0mg, rame 0,011mg, selenio 17,0µg, vitamina C 0mg, vitamina K 2,30µg, vitamina B12 2,28µg, folato totale (food) 7,00µg, beta-carotene 57,0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento.
- **Nota sulla rappresentatività**: scelta la variante "whole milk" (latte intero) **senza** la dicitura "low moisture" (quest'ultima è il blocco stagionato/essiccato tipico della mozzarella da pizza USA, non la mozzarella fresca italiana) — la variante qui usata è quindi la più vicina fra le opzioni FDC a una mozzarella fresca comune, pur restando un prodotto generico USDA e non una mozzarella di bufala/fior di latte specifica.
- **Analogia dichiarata**: `food_milk_whole` — stessa categoria "latticino" (`matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`, `is_heme_iron=false`), matrice propria (`mozzarella`).
- **Categoria dieta**: `egg_dairy` — latticino: vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=170845 --food-id=food_mozzarella --name-it="Mozzarella (latte intero)" --matrix-id=mozzarella --matrix-description-it="Mozzarella" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=170845 --food-id=food_mozzarella --name-it="Mozzarella (latte intero)" --matrix-id=mozzarella --matrix-description-it="Mozzarella" --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: non necessario, il record FDC 170845 è pulito e completo (17/17); la variante "low moisture" (altro FDC ID, non usato) resterebbe disponibile come voce separata per la mozzarella da forno/pizza, se mai richiesta in futuro.

### Parmigiano Reggiano (formaggio grana stagionato) (2026-10-13)

- **FDC ID**: 170848, dataType **SR Legacy** — "Cheese, parmesan, hard".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 392kcal, proteine 35,8g, grassi 25,0g, carboidrati 3,22g, fibra 0g, calcio 1184mg, ferro 0,82mg, zinco 2,75mg, magnesio 44,0mg, rame 0,032mg, selenio 22,5µg, vitamina C 0mg, vitamina K 1,70µg, vitamina B12 1,20µg, folato totale (food) 7,00µg, beta-carotene 66,0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento.
- **Nota sulla rappresentatività (proxy dichiarato, non un prodotto DOP specifico)**: il record FDC "Cheese, parmesan, hard" è una voce generica USDA per formaggio grana stagionato, non uno specifico "Parmigiano Reggiano DOP" — ma i valori (proteine 35,8g, grassi 25,0g, calcio 1184mg/100g) sono nell'ordine di grandezza tipico riportato per il Parmigiano Reggiano reale (tipicamente calcio ~1150-1200mg/100g, proteine ~33-35g/100g), senza alcuna anomalia da arricchimento o trattamento industriale — trattamento diverso dai casi prosciutto crudo/bresaola di questa stessa coda, dove la differenza di prodotto era sostanziale (affumicatura, taglio diverso), qui è un'approssimazione di categoria dichiarata, non uno scarto di qualità. Tentata una corroborazione incrociata su triagemethod.com: la pagina per questo alimento mescola fonti SR Legacy e AFCD (database australiano) senza etichettarle voce per voce in modo utilizzabile (es. calcio mostrato a 130mg, incompatibile con un formaggio stagionato) — scartata come fonte di corroborazione per questo alimento, non usata.
- **Analogia dichiarata**: `food_milk_whole` — stessa categoria "latticino" (`matrix_category_calcium='medium_oxalate'`, `botanical_family=NULL`, `is_heme_iron=false`), matrice propria (`parmigiano_reggiano`).
- **Categoria dieta**: `egg_dairy` — latticino: vegetariano SÌ, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=170848 --food-id=food_parmigiano_reggiano --name-it="Parmigiano Reggiano (formaggio grana stagionato, generico tipo parmesan USDA)" --matrix-id=parmigiano_reggiano --matrix-description-it="Parmigiano Reggiano" --baseline-cooking-state=aged --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=170848 --food-id=food_parmigiano_reggiano --name-it="Parmigiano Reggiano (formaggio grana stagionato, generico tipo parmesan USDA)" --matrix-id=parmigiano_reggiano --matrix-description-it="Parmigiano Reggiano" --baseline-cooking-state=aged --analogy-food-id=food_milk_whole --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
  ```
- **Piano B**: FDC 171247 ("Cheese, parmesan, grated", SR Legacy) o FDC 173431 ("Cheese, parmesan, shredded", SR Legacy) se il dry-run reale di 170848 risultasse incompleto o con un'anomalia non prevista qui — non tentati a priori, nessuna ragione per preferirli al record "hard" scelto.

### Vongole, crude (2026-10-13)

- **FDC ID**: 174214, dataType **SR Legacy** — "Mollusks, clam, mixed species, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 86,0kcal, proteine 14,7g, grassi 0,96g, carboidrati 3,57g, fibra 0g, calcio 39,0mg, ferro 1,62mg, zinco 0,51mg, magnesio 19,0mg, rame 0,053mg, selenio 30,6µg, vitamina C 0mg, vitamina K 0,20µg, vitamina B12 11,3µg, folato totale (food) 5,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento, atteso per un mollusco fresco non trattato.
- **Nota sui carboidrati non-zero (3,57g/100g)**: a differenza del pesce (sempre 0g in questo Golden Set), le vongole — come i molluschi bivalvi in genere — riportano un contenuto di glicogeno non trascurabile; non è un'anomalia né segno di trattamento industriale, è una caratteristica nota di questa categoria (vedi anche le cozze sotto, 3,69g/100g, stesso ordine di grandezza).
- **Analogia dichiarata**: `food_salmon_raw` — stessa categoria concettuale "alimento animale acquatico con ferro eme" (`is_heme_iron=true`; i molluschi bivalvi sono una fonte nota di ferro eme pur non essendo muscolo come il pesce), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — frutti di mare (mollusco): vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=174214 --food-id=food_vongole_raw --name-it="Vongole, crude" --matrix-id=vongole --matrix-description-it="Vongole" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=174214 --food-id=food_vongole_raw --name-it="Vongole, crude" --matrix-id=vongole --matrix-description-it="Vongole" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario, il record FDC 174214 è pulito e completo (17/17), letto direttamente dalla pagina con FDC ID e dataType citati.

### Cozze, crude (2026-10-13)

- **FDC ID**: 174216, dataType **SR Legacy** — "Mollusks, mussel, blue, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 86,0kcal, proteine 11,9g, grassi 2,24g, carboidrati 3,69g, fibra 0g, calcio 26,0mg, ferro 3,95mg, zinco 1,60mg, magnesio 34,0mg, rame 0,094mg, selenio 44,8µg, vitamina C 8,00mg, vitamina K 0,10µg, vitamina B12 12,0µg, folato totale (food) 42,0µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento.
- **Nota sui carboidrati non-zero (3,69g/100g)**: vedi nota identica sotto "Vongole" sopra — caratteristica nota dei molluschi bivalvi (glicogeno), non un'anomalia.
- **Analogia dichiarata**: `food_salmon_raw` — stessa categoria concettuale "alimento animale acquatico con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — frutti di mare (mollusco): vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=174216 --food-id=food_cozze_raw --name-it="Cozze, crude" --matrix-id=cozze --matrix-description-it="Cozze" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=174216 --food-id=food_cozze_raw --name-it="Cozze, crude" --matrix-id=cozze --matrix-description-it="Cozze" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario, il record FDC 174216 è pulito e completo (17/17), letto direttamente dalla pagina con FDC ID e dataType citati.

### Acciughe (alici), crude (2026-10-13)

- **FDC ID**: 174182 (identificato indirettamente — vedi nota sotto sul livello di confidenza), dataType **SR Legacy** — "Fish, anchovy, european, raw" (NDB legacy 15001).
- **Nota sulla fonte (diversa dagli altri 3 alimenti di questo lotto, confidenza più bassa)**: il fetch diretto della pagina getfoodfacts.com per questo FDC ID non è riuscito in questa sessione (l'URL non era apparso di per sé in un risultato di ricerca — solo incluso dentro l'URL di una pagina di confronto getfoodfacts.com/compare, dove compare letteralmente lo slug "fish-anchovy-european-raw-174182"). I valori per 100g sono stati quindi ricostruiti da due aggregatori indipendenti letti con successo, scalati alla loro rispettiva porzione: **recipal.com** (porzione 85g: proteine 20,35g, grassi 4,84g, calcio 141,2mg, ferro 3,29mg, zinco 1,76mg, magnesio 41,2mg, selenio 36,5µg, B12 0,588µg, folato 11,76µg) e **bodbot.com** (porzione 1oz=28,35g: energia 130,5kcal, proteine 20,35g, grassi 4,83g, calcio 146,9mg, ferro 3,25mg, zinco 1,73mg, magnesio 41,0mg, rame 0,212mg, selenio 36,5µg, vitamina K 0,106µg, B12 0,635µg, folato 9,0µg, acido folico 0). Le due fonti, scalate indipendentemente l'una dall'altra, combaciano entro ~5% su quasi tutti i valori (proteine identiche, grassi/selenio quasi identici) — corroborate anche da **triagemethod.com**, che etichetta esplicitamente come SR Legacy un sottoinsieme di valori (grassi 4,8g, rame 0,21mg, vitamina K 0,10µg, acido folico 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg), tutti coerenti con le due fonti scalate. Carboidrati 0g, fibra 0g, vitamina C 0mg, beta-carotene 0µg coerenti su tutte le fonti.
- **Scartati esplicitamente**: triagemethod.com riporta anche, sotto lo stesso nome alimento, un secondo gruppo di valori (calcio 20,0mg, ferro 0,50mg, zinco 1,6mg, selenio 6,5µg, B12 3,0µg, folato 15,0µg) etichettati **AFCD** (Australian Food Composition Database) — non sono USDA, non corroborano né contraddicono il record FDC: sono una banca dati nazionale diversa per un prodotto non necessariamente identico, non usata.
- **Nessuna firma di arricchimento**: acido folico 0µg riportato esplicitamente separato dal folato alimentare (fonte: triagemethod SR + bodbot) — atteso per un pesce fresco non trattato.
- **Attenzione in fase di esecuzione reale (confidenza FDC ID più bassa degli altri 3)**: l'FDC ID 174182 non è stato confermato aprendo direttamente la pagina del record — solo dedotto dalla URL di una pagina di confronto e dalla numerazione sequenziale con il prodotto "in scatola" FDC 174183 (quest'ultimo confermato direttamente in fase di ricerca). Il dry-run dello script è quindi l'unica verifica reale per questo alimento: **se la descrizione FDC stampata non è esattamente "Fish, anchovy, european, raw" o i nutrienti estratti sono sensibilmente diversi dai valori sopra, fermarsi e segnalarlo invece di procedere con l'apply.**
- **Analogia dichiarata**: `food_salmon_raw` — stessa categoria concettuale "pesce crudo con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — pesce: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=174182 --food-id=food_acciughe_raw --name-it="Acciughe (alici), crude" --matrix-id=acciughe --matrix-description-it="Acciughe" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run — vedi attenzione sopra):
  ```
  npm run add-food -- --fdc-id=174182 --food-id=food_acciughe_raw --name-it="Acciughe (alici), crude" --matrix-id=acciughe --matrix-description-it="Acciughe" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: nessuno individuato in fase di ricerca; se il dry-run reale mostra una descrizione FDC diversa da "Fish, anchovy, european, raw" o un numero di nutrienti sensibilmente inferiore a 17, fermarsi prima di procedere con l'apply.

### Merluzzo, crudo (2026-10-13)

- **FDC ID**: 171955, dataType **SR Legacy** — "Fish, cod, Atlantic, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com, che cita esplicitamente FDC ID e dataType dalla pagina del record). Valori per 100g: energia 82,0kcal, proteine 17,8g, grassi 0,67g, carboidrati 0g, fibra 0g, calcio 16,0mg, ferro 0,38mg, zinco 0,45mg, magnesio 32,0mg, rame 0,028mg, selenio 33,1µg, vitamina C 1,00mg, vitamina K 0,10µg, vitamina B12 0,91µg, folato totale (food) 7,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento, atteso per un pesce fresco non trattato.
- **Nota di trasparenza (copertura PARZIALE della voce "merluzzo/nasello" della coda)**: questo record rappresenta il merluzzo nordico/atlantico (*Gadus morhua*), corrispondenza letterale della parola italiana "merluzzo". Il **nasello** (*Merluccius merluccius* — lo stesso pesce che al banco pesce italiano viene spesso venduto chiamandolo colloquialmente "merluzzo") è una specie diversa (famiglia Merlucciidae, non Gadidae): FDC non ha per questa specie un record generico pulito, solo un prodotto Branded "Pacific hake steaks" (nasello del Pacifico, porzionato/congelato, non rappresentativo di un nasello fresco intero). Non generalizzato per non forzare un match fra specie diverse (stesso standard già applicato a prosciutto crudo/bresaola in questa coda): **questa voce copre solo la parte "merluzzo" (vero, *Gadus morhua*) della coda; il nasello resta un gap dichiarato, non coperto**, da ricercare separatamente se in futuro emerge un record FDC dedicato.
- **Fonte scartata per questo stesso nome**: triagemethod.com mostra per "Fish, cod, Atlantic, raw" un secondo gruppo di valori (calcio 20,0mg, ferro 0,20mg, zinco 0,30mg, rame 0,01mg, selenio 27µg, B12 0,30µg, folato 0µg) etichettati esplicitamente **AFCD** (Australian Food Composition Database), non USDA — scartati, stesso trattamento già dato alla fonte AFCD per le acciughe qui sotto.
- **Analogia dichiarata**: `food_salmon_raw` — stessa categoria concettuale "pesce crudo con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — pesce: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=171955 --food-id=food_merluzzo_raw --name-it="Merluzzo, crudo" --matrix-id=merluzzo --matrix-description-it="Merluzzo" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=171955 --food-id=food_merluzzo_raw --name-it="Merluzzo, crudo" --matrix-id=merluzzo --matrix-description-it="Merluzzo" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: nessuno trovato per il "nasello" vero (vedi nota sopra) — se in futuro emerge un record FDC dedicato per *Merluccius merluccius*, va aggiunto come voce separata, non in sostituzione di questa.

### Tonno fresco (pinna gialla), crudo (2026-10-13)

- **FDC ID**: 175159, dataType **SR Legacy** — "Fish, tuna, fresh, yellowfin, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: pagine aggregatore che riportano il record SR Legacy letteralmente — accurateclinic.com — corroborate su grassi e vitamina K da una seconda fonte indipendente, triagemethod.com; fetch diretto su api.nal.usda.gov non tentato da questa sessione, nessuna rete diretta disponibile — vedi CLAUDE.md). Valori per 100g: energia 109kcal, proteine 24,4g, grassi 0,49g, carboidrati 0g, fibra 0g, calcio 4,0mg, ferro 0,77mg, zinco 0,37mg, magnesio 35,0mg, rame 0,036mg, selenio 90,6µg, vitamina C 0mg, vitamina K 0,1µg, vitamina B12 2,08µg, folato totale (food) 2,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento, atteso per un pesce fresco non trattato.
- **Perché questo record rappresenta bene il tonno fresco comune italiano**: pinna gialla (yellowfin/ahi) è la specie di tonno fresco più diffusa in pescheria, a differenza del pinna blu (di nicchia/pregiato, FDC 173706, scartato per rappresentatività) o dello skipjack (più tipico del tonno in scatola che del filetto fresco, FDC 175156, copertura nutrienti inferiore nella fonte consultata, ~15/17). Record "raw" semplice, nessun segno di marinatura/trattamento.
- **Analogia dichiarata**: `food_salmon_raw` — stessa categoria concettuale "pesce crudo con ferro eme" (`is_heme_iron=true`, stesso attributo già usato per il salmone nel Golden Set), nessuna famiglia botanica (alimento animale), matrice propria.
- **Categoria dieta**: `meat_fish` — pesce: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=175159 --food-id=food_tonno_fresco_raw --name-it="Tonno fresco (pinna gialla), crudo" --matrix-id=tonno --matrix-description-it="Tonno" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=175159 --food-id=food_tonno_fresco_raw --name-it="Tonno fresco (pinna gialla), crudo" --matrix-id=tonno --matrix-description-it="Tonno" --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: FDC 173706 ("Fish, tuna, fresh, bluefin, raw", SR Legacy, 17/17 anch'esso) se il dry-run reale di 175159 risultasse incompleto — non necessario a priori, nessun'altra alternativa generica migliore trovata per "tonno fresco comune".
- **Nota sulla coda**: questa voce completa solo la parte "fresco" dell'item "tonno (fresco e in scatola sott'olio)" di `docs/PRD.md` — il tonno in scatola sott'olio è un prodotto composito (olio aggiunto) e resta da ricercare separatamente, non lavorato in questo run.

### Prosciutto cotto (2026-10-13)

- **FDC ID**: 167872, dataType **SR Legacy** — "Pork, cured, ham, boneless, regular (approximately 11% fat), roasted".
- **Nutrienti attesi**: 17/17, nessun componente mancante (fonte: getfoodfacts.com/recipal.com, mirror dei dati SR Legacy; fetch diretto su api.nal.usda.gov non tentato da questa sessione — la prova resta il dry-run dello script). Valori per 100g: energia 178kcal, proteine 22,6g, grassi 9,02g, carboidrati 0g, fibra 0g, calcio 8,00mg, ferro 1,34mg, zinco 2,47mg, magnesio 22,0mg, rame 0,14mg, selenio 19,8µg, vitamina C 0mg, vitamina K non riportata come totale (solo fillochinone=0µg — normale per SR Legacy su questi tagli, non una lacuna specifica di questo record), vitamina B12 0,70µg, folato totale (food) 3,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessun segnale di arricchimento stile USA.
- **Nota di trasparenza (sodio, non uno dei 17 nutrienti mappati da questo progetto ma rilevante per onestà sulla rappresentatività)**: il record riporta 1.500mg sodio/100g, più alto del range tipico di un prosciutto cotto italiano (circa 1000-1200mg/100g) — segno di una salagione in stile USA più salata. Non blocca l'inserimento (il sodio non è tra i 17 nutrienti tracciati da `lib/fdc/nutrientMapping.ts`), ma va dichiarato qui per trasparenza; un dato sodio più fedele andrebbe eventualmente integrato da una fonte italiana (CREA), non stimato.
- **Perché questo record rappresenta bene il prosciutto cotto comune italiano**: "boneless, regular (~11% fat), roasted" — prodotto cotto, non affumicato, non "water added" (scartata la variante FDC 168349 "Pork, cured, ham -- water added..." per lo stesso motivo per cui si scartano le carni fresche con soluzione iniettata già viste in questo file), non "extra lean" irrealistico. Candidato alternativo valutato: FDC 168359 "Pork, cured, ham, slice, bone-in, separable lean and fat, heated, pan-broil" (17/17, sodio 852mg — sotto il range italiano invece che sopra) — profilo nutrizionale molto simile, non usato come primario solo perché la preparazione "bone-in, slice, pan-broil" rappresenta meno bene un prosciutto cotto intero affettato.
- **Analogia dichiarata**: `food_beef_ground_cooked` — stessa categoria concettuale "carne muscolare COTTA con ferro eme" (`is_heme_iron=true`; scelta la variante cotta, a differenza delle carni fresche crude già in coda, perché il prosciutto cotto è un prodotto già cotto), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — carne di maiale lavorata: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=167872 --food-id=food_prosciutto_cotto --name-it="Prosciutto cotto" --matrix-id=prosciutto_cotto --matrix-description-it="Prosciutto cotto" --baseline-cooking-state=cooked --analogy-food-id=food_beef_ground_cooked --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=167872 --food-id=food_prosciutto_cotto --name-it="Prosciutto cotto" --matrix-id=prosciutto_cotto --matrix-description-it="Prosciutto cotto" --baseline-cooking-state=cooked --analogy-food-id=food_beef_ground_cooked --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: FDC 168359 (sopra) se il dry-run reale di 167872 risultasse sotto 17/17 o mostrasse un'anomalia non prevista qui.

### Petto di pollo, crudo (senza pelle, senza osso) (2026-10-13)

- **FDC ID**: 171077, dataType **SR Legacy** — "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g: energia 120kcal, proteine 22,5g, grassi 2,6g, carboidrati 0g, fibra 0g, calcio 5,1mg, ferro 0,36mg, zinco 0,68mg, magnesio 28,0mg, rame 0,04mg, selenio 22,8µg, vitamina C 0mg, vitamina K 0µg, vitamina B12 0,21µg, folato totale 9,1µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** — nessun segno di arricchimento stile USA, atteso per carne non trattata.
- **Nota di trasparenza sulla fonte (diversa dagli altri 3 alimenti di questo lotto)**: il fetch diretto su fdc.nal.usda.gov/food-details/171077 non è riuscito in questa sessione (bloccato da un controllo di provenienza). I valori sopra vengono da **tre aggregatori secondari indipendenti e concordanti** (myfooddata.com, recipal.com — che riporta anche lo stesso NDB ID legacy 5062 —, nutrifox.com), non dalla pagina ufficiale FDC. Stesso trattamento già usato altrove in questo file per dati letti da riepilogo automatico: vale come controllo di plausibilità, non come prova — la prova resta il dry-run dello script, che ri-scarica il record vero.
- **Perché questo record rappresenta bene il petto di pollo comune italiano**: descrizione esplicita "skinless, boneless, meat only, raw" — carne cruda non trattata, non marinata, non impanata. Esistono varianti FDC "with added solution" (marinate/iniettate con soluzione salina) viste in fase di ricerca e scartate perché non rappresentano un petto di pollo semplice.
- **Analogia dichiarata**: `food_beef_ground_raw` — stessa categoria concettuale "carne muscolare cruda con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica (alimento animale, come la carne bovina già nel Golden Set), matrice propria (non riusa `beef_ground_meat`: composizione nutrizionale diversa).
- **Categoria dieta**: `meat_fish` — carne di pollame: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=171077 --food-id=food_petto_di_pollo_raw --name-it="Petto di pollo, crudo (senza pelle, senza osso)" --matrix-id=petto_di_pollo --matrix-description-it="Petto di pollo" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=171077 --food-id=food_petto_di_pollo_raw --name-it="Petto di pollo, crudo (senza pelle, senza osso)" --matrix-id=petto_di_pollo --matrix-description-it="Petto di pollo" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario per la scelta del record (nessuna alternativa migliore trovata), ma data la verifica non diretta sulla pagina FDC ufficiale (vedi nota sopra): se il dry-run reale trova meno di 17/17 nutrienti, fermarsi e segnalarlo prima di procedere con l'apply, invece di considerare l'alimento comunque pronto.

### Coscia di pollo, cruda (carne scura, senza pelle, senza osso) (2026-10-13)

- **FDC ID**: 173627, dataType **SR Legacy** — "Chicken, broilers or fryers, dark meat, thigh, meat only, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (confermato da getfoodfacts.com, che riporta esplicitamente FDC ID 173627 come SR Legacy). Valori per 100g: energia 121kcal, proteine 19,7g, grassi 4,12g, carboidrati 0g, fibra 0g, calcio 7,00mg, ferro 0,81mg, zinco 1,58mg, magnesio 23,0mg, rame 0,062mg, selenio 22,9µg, vitamina C 0mg, vitamina K 2,90µg, vitamina B12 0,61µg, folato totale 4,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessuna firma di arricchimento.
- **Perché questo record rappresenta bene la coscia di pollo comune italiana**: "dark meat, thigh, meat only, raw" — senza pelle, senza marinatura/soluzione aggiunta, senza impanatura. Distinto correttamente dal record FDC 172859 "Chicken, dark meat, thigh, meat only, with added solution, raw" (variante marinata/trattata, scartata in fase di ricerca).
- **Analogia dichiarata**: `food_beef_ground_raw` — stessa categoria concettuale "carne muscolare cruda con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — carne di pollame: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=173627 --food-id=food_coscia_di_pollo_raw --name-it="Coscia di pollo, cruda (carne scura, senza pelle, senza osso)" --matrix-id=coscia_di_pollo --matrix-description-it="Coscia di pollo" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=173627 --food-id=food_coscia_di_pollo_raw --name-it="Coscia di pollo, cruda (carne scura, senza pelle, senza osso)" --matrix-id=coscia_di_pollo --matrix-description-it="Coscia di pollo" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario, il record FDC 173627 è pulito e completo (17/17), descrizione inequivocabile.

### Lonza di maiale, cruda, magra (2026-10-13)

- **FDC ID**: 168230, dataType **SR Legacy** — "Pork, fresh, loin, whole, separable lean only, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (confermato da getfoodfacts.com, che riporta esplicitamente FDC ID 168230 come SR Legacy). Valori per 100g: energia 143kcal, proteine 21,4g, grassi 5,66g, carboidrati 0g, fibra 0g, calcio 17,0mg, ferro 0,84mg, zinco 1,84mg, magnesio 23,0mg, rame 0,062mg, selenio 36,1µg, vitamina C 0,60mg, vitamina K 0µg, vitamina B12 0,63µg, folato totale 5,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg. **Acido folico 0µg** riportato esplicitamente separato dal folato alimentare — nessuna firma di arricchimento.
- **Perché questo record rappresenta bene la lonza di maiale comune italiana**: "fresh, loin, whole, separable lean only, raw" — carne fresca magra, non trattata/marinata/affumicata (niente "with added solution" come in altre varianti viste in fase di ricerca, es. FDC 169181). Scelta la variante "lean only" (magra) invece di "lean and fat" (FDC 167818, che includerebbe anche il grasso visibile) per rappresentare la lonza magra comunemente intesa.
- **Analogia dichiarata**: `food_beef_ground_raw` — stessa categoria concettuale "carne muscolare cruda con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — carne di maiale: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=168230 --food-id=food_lonza_di_maiale_raw --name-it="Lonza di maiale, cruda, magra" --matrix-id=lonza_di_maiale --matrix-description-it="Lonza di maiale" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=168230 --food-id=food_lonza_di_maiale_raw --name-it="Lonza di maiale, cruda, magra" --matrix-id=lonza_di_maiale --matrix-description-it="Lonza di maiale" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario, il record FDC 168230 è pulito e completo (17/17); scartata la variante "lean and fat" (167818) perché includerebbe grasso visibile non rappresentativo della "lonza magra".

### Petto di tacchino, crudo (senza pelle) (2026-10-13)

- **FDC ID**: 174515, dataType **SR Legacy** — "Turkey, retail parts, breast, meat only, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante (confermato da due fonti indipendenti concordanti: getfoodfacts.com, che riporta esplicitamente FDC ID 174515, e triagemethod.com/Human Nutrition Explorer). Valori per 100g: energia 114kcal, proteine 23,3g, grassi 2,33g, carboidrati 0g, fibra 0g, calcio 9,00mg, ferro 0,76mg, zinco 1,16mg, magnesio 27,0mg, rame 0,054mg, selenio 22,1µg, vitamina C 0mg, vitamina K 0µg, vitamina B12 1,35µg, folato totale (food) 7,00µg, beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg.
- **Nota sull'acido folico**: a differenza degli altri 3 alimenti di questo lotto, le fonti consultate per questo record non riportano una voce "acido folico" separata e distinta dal folato alimentare — solo "Folate, food" = 7,00µg. Non è un segnale di arricchimento mancato da verificare: è semplicemente l'assenza di quella voce specifica nell'aggregatore consultato; nessun valore anomalo (calcio, folato) che faccia sospettare arricchimento stile USA. Il dry-run dello script (che legge direttamente il record FDC) chiarirà se quella voce compare o no.
- **Perché questo record rappresenta bene il petto di tacchino comune italiano**: "retail parts, breast, meat only, raw" — categoria generica/non trattata, distinta dalla variante "enhanced" (marinata/iniettata con soluzione salina) vista nei risultati di ricerca e scartata.
- **Analogia dichiarata**: `food_beef_ground_raw` — stessa categoria concettuale "carne muscolare cruda con ferro eme" (`is_heme_iron=true`), nessuna famiglia botanica, matrice propria.
- **Categoria dieta**: `meat_fish` — carne di tacchino: vegetariano NO, vegano NO, fruttariano NO.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=174515 --food-id=food_petto_di_tacchino_raw --name-it="Petto di tacchino, crudo (senza pelle)" --matrix-id=petto_di_tacchino --matrix-description-it="Petto di tacchino" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=174515 --food-id=food_petto_di_tacchino_raw --name-it="Petto di tacchino, crudo (senza pelle)" --matrix-id=petto_di_tacchino --matrix-description-it="Petto di tacchino" --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw --is-heme-iron --diet-category=meat_fish --apply
  ```
- **Piano B**: non necessario per la scelta del record (nessuna alternativa migliore trovata), ma verificare nel dry-run reale se compare una voce "acido folico" distinta (vedi nota sopra) — se compare non-zero, fermarsi e segnalarlo invece di procedere con l'apply.

### Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale (2026-10-12)

- **FDC ID**: 175203, dataType **SR Legacy** — "Beans, white, mature seeds, cooked, boiled, without salt".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g (confermati da getfoodfacts.com, tabella nutrienti completa per FDC ID 175203, SR Legacy): energia 139kcal, proteine 9,73g, grassi 0,35g, carboidrati 25,1g, fibra 6,30g, calcio 90,0mg, ferro 3,70mg, zinco 1,38mg, magnesio 63,0mg, rame 0,29mg, selenio 1,30µg, vitamina C 0mg, vitamina K 3,50µg, vitamina B12 0µg, folato totale 81,0µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione), beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg.
- **Nota sulla scelta del record**: FDC non ha una voce "cannellini" dedicata (solo prodotti Branded di marca, troppo generici/incompleti per questo uso) — "Beans, white, mature seeds" (fagioli bianchi) è la voce generica SR Legacy più diretta per rappresentare i fagioli cannellini (varietà a seme bianco di Phaseolus vulgaris), stesso approccio già usato per fave/piselli in questo file (preferenza per il record generico SR Legacy sulla variante branded specifica).
- **Perché questo record rappresenta bene i cannellini comuni italiani**: nessuna firma di arricchimento (acido folico 0µg esplicito, separato dal folato totale). Il calcio (90mg/100g) è più alto dei fagioli rossi kidney già nel Golden Set (28mg/100g), ma è una differenza varietale nota fra legumi comuni (i fagioli bianchi riportano tipicamente più calcio dei fagioli rossi nelle tabelle di composizione), non un segnale di arricchimento — quest'ultimo richiederebbe acido folico non-zero, qui assente.
- **Analogia dichiarata**: `food_kidney_beans_boiled` — stessa specie botanica *Phaseolus vulgaris* (famiglia Fabaceae), stesso matrix_id `legumes` (già esistente in `food_matrices_master`, non serve quindi `--matrix-description-it`), stesso stato "semi maturi, bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=175203 --food-id=food_fagioli_cannellini_bolliti --name-it="Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --diet-category=plant_non_fruit
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=175203 --food-id=food_fagioli_cannellini_bolliti --name-it="Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
  ```
- **Piano B**: non necessario, il record FDC 175203 è pulito e completo (17/17).

### Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale (2026-10-12)

- **FDC ID**: 173736, dataType **SR Legacy** — "Beans, cranberry (roman), mature seeds, cooked, boiled, without salt".
- **Nutrienti attesi**: almeno 14/17 confermati dalla pagina aggregatore consultata (getfoodfacts.com, che riporta esplicitamente FDC ID 173736 come SR Legacy): energia 136kcal, proteine 9,34g, grassi 0,46g, carboidrati 24,5g, fibra 8,60g, calcio 50,0mg, ferro 2,09mg, zinco 1,14mg, magnesio 50,0mg, rame 0,23mg, selenio 1,30µg, vitamina C 0mg, vitamina B12 0µg, folato totale 207µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione). **Non riportati dalla pagina aggregatore consultata** (ma non necessariamente assenti dal record FDC reale — lo script, al momento dell'esecuzione, farà un fetch diretto che potrà trovarne un numero diverso): vitamina K, beta-carotene, alfa-carotene, beta-criptoxantina.
- **Perché questo record rappresenta bene i fagioli borlotti comuni italiani**: nessuna firma di arricchimento (acido folico 0µg esplicito), valori coerenti con un legume bollito senza trattamenti industriali. Record generico SR Legacy, non Branded. FDC non ha una voce "borlotti" dedicata, ma "cranberry (roman) beans" è il nome USDA standard per la stessa varietà screziata di *Phaseolus vulgaris* nota in Italia come borlotto — stesso alimento, nome diverso, non un prodotto diverso.
- **Analogia dichiarata**: `food_kidney_beans_boiled` — stessa specie botanica *Phaseolus vulgaris* (famiglia Fabaceae), stesso matrix_id `legumes` (già esistente, non serve `--matrix-description-it`), stesso stato "semi maturi, bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=173736 --food-id=food_fagioli_borlotti_bolliti --name-it="Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --diet-category=plant_non_fruit
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=173736 --food-id=food_fagioli_borlotti_bolliti --name-it="Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
  ```
- **Piano B**: non necessario per la scelta del record (nessuna alternativa migliore trovata). Attenzione in fase di esecuzione reale: se il fetch diretto dello script trova meno di ~10/17 nutrienti effettivi (molto sotto i 14/17 già confermati qui da fonte aggregata), il match risulterebbe più debole di quanto stimato in questa ricerca — in quel caso fermarsi e segnalarlo invece di considerare l'alimento comunque pronto per la promozione futura a `verified`.

### Lotto 18 alimenti vegetali — verdura e frutta (2026-10-12, sera, sessione interattiva; riallineato 2026-10-13)

**Come e' stato preparato.** Ogni FDC ID e' stato verificato aprendo il record `fdc.nal.usda.gov/portal-data/external/<id>` (WebFetch, che il 2026-10-12 sera risulta raggiungibile da questo ambiente — la nota precedente sul blocco riguardava `api.nal.usda.gov`) e controllando che la descrizione coincida con l'alimento voluto. Due ID che avevo in mente a memoria erano sbagliati e sono stati scartati dopo il controllo (uva americana invece di europea; ananas invece di fichi). Per tutti i 18 i valori letti mostrano 17/17 nutrienti presenti e acido folico = 0 (nessuna firma di arricchimento tipo USA). **Questi valori sono stati letti tramite un riepilogo automatico della pagina: valgono come controllo di plausibilita', non come prova. La prova e' il dry-run dello script, che ri-scarica il record vero.**

**Riallineamento al merge (2026-10-13).** La prima stesura di questo lotto aveva 19 alimenti. La **melanzana e' stata tolta**: `food_melanzane_raw` (stessa FDC 169228) e' gia' stata eseguita dall'utente il 2026-10-12 (vedi "Eseguiti" qui sotto); rilanciarla con un altro food_id avrebbe creato un duplicato nel DB. Anche i **piselli freschi crudi** qui sotto sono un alimento diverso dai piselli bolliti gia' eseguiti (`food_piselli_bolliti`): record FDC 170419 contro 170420, matrice propria `piselli` contro `legumes`. **Nota sui nomi:** i food_id di questo lotto sono in inglese (come il Golden Set originale), mentre le sessioni del 2026-10-12 hanno usato nomi italiani (`food_riso_bianco_raw`, `food_melanzane_raw`, `food_zucchine_raw`...). E' solo un'etichetta, nessun vincolo tecnico; se preferisci uniformarli prima di applicare, dillo e rigenero i comandi.

**Cosa guardare nel dry-run**: (1) la riga `FDC description:` deve coincidere con la descrizione attesa in tabella; (2) `Nutrienti estratti (17/17)` — se e' meno di 17, NON applicare quell'alimento e dimmelo; (3) nessuna riga `ERRORE`.

**Attributi comuni (decisi per analogia, tutti dichiarati, nessuno indovinato):** `is_heme_iron=false` (omesso = false), `matrix_category_calcium` NULL (stesso trattamento di carote/broccoli/patate: le categorie ossalati esistono solo per spinaci/kale/latte), `--carotenoid-matrix-state=raw_intact` per tutti i crudi vegetali (se non lo si passa, il motore tratta il beta-carotene come "cotto" e lo sovrastima del ~57%, vedi `docs/PENDING_HUMAN_ACTIONS.md`), `is_fortified_folate=false`, `zinc_bioaccessibility_bucket=none`. Ogni alimento ha una **matrice propria** (non riusa `leafy_greens`/`legumes`): cosi' non eredita i fattori di ritenzione derivati da spinaci/legumi, che sarebbero sbagliati per lui. Contropartita: nessun fattore di ritenzione finche' non si aggiunge la riga cotta — oggi questi 18 compaiono solo "Crudo".

| # | food_id | FDC ID | Descrizione FDC attesa (la stampa il dry-run) | Dieta |
|---|---|---|---|---|
| 1 | `food_tomato_raw` | 170457 | Tomatoes, red, ripe, raw, year round average | plant_non_fruit |
| 2 | `food_onion_raw` | 170000 | Onions, raw | plant_non_fruit |
| 3 | `food_garlic_raw` | 169230 | Garlic, raw | plant_non_fruit |
| 4 | `food_pepper_red_raw` | 170108 | Peppers, sweet, red, raw | plant_non_fruit |
| 5 | `food_lettuce_romaine_raw` | 169247 | Lettuce, cos or romaine, raw | plant_non_fruit |
| 6 | `food_pumpkin_raw` | 168448 | Pumpkin, raw | plant_non_fruit |
| 7 | `food_fennel_raw` | 169385 | Fennel, bulb, raw | plant_non_fruit |
| 8 | `food_mushroom_white_raw` | 169251 | Mushrooms, white, raw | plant_non_fruit |
| 9 | `food_apple_with_skin_raw` | 171688 | Apples, raw, with skin (Includes foods for USDA's Food Distribution Program) | fresh_fruit |
| 10 | `food_banana_raw` | 173944 | Bananas, raw | fresh_fruit |
| 11 | `food_pear_raw` | 169118 | Pears, raw | fresh_fruit |
| 12 | `food_grapes_european_raw` | 174683 | Grapes, red or green (European type, such as Thompson seedless), raw | fresh_fruit |
| 13 | `food_lemon_peeled_raw` | 167746 | Lemons, raw, without peel | fresh_fruit |
| 14 | `food_strawberry_raw` | 167762 | Strawberries, raw | fresh_fruit |
| 15 | `food_peach_yellow_raw` | 169928 | Peaches, yellow, raw | fresh_fruit |
| 16 | `food_kiwi_green_raw` | 168153 | Kiwifruit, green, raw | fresh_fruit |
| 17 | `food_fig_raw` | 173021 | Figs, raw | fresh_fruit |
| 18 | `food_peas_green_raw` | 170419 | Peas, green, raw | plant_non_fruit |

**Note per alimento (solo dove serve):**
- **Pomodori rossi, crudi** (`food_tomato_raw`): Ortaggio botanicamente frutto: per il PRD resta plant_non_fruit (non fruttariano).
- **Aglio, crudo** (`food_garlic_raw`): Condimento: i valori per 100g sono molto diversi da un'abituale porzione (pochi grammi).
- **Peperoni rossi, crudi** (`food_pepper_red_raw`): Solo il rosso: verde e giallo hanno composizione diversa (non ancora in coda).
- **Lattuga romana, cruda** (`food_lettuce_romaine_raw`): Scelta mia fra le varianti di lattuga FDC (romaine, green leaf, iceberg, butterhead): nome esplicito 'romana' per non spacciarla per 'lattuga' generica. Se preferisci un'altra variante, dimmelo prima di applicare.
- **Zucca, cruda** (`food_pumpkin_raw`): Il record FDC non ha il campo dataType (c'e' foodType SR Legacy): non e' un problema, solo una stranezza di formato. Alfa-carotene 4020 ug/100g finisce in other_provitamin_a_carotenoids_mcg.
- **Funghi champignon, crudi** (`food_mushroom_white_raw`): Funghi: non piante, quindi nessuna famiglia botanica (stesso trattamento dei cibi animali nel contatore di diversita'); nessun --carotenoid-matrix-state perche' beta-carotene = 0.
- **Mele, crude (con buccia)** (`food_apple_with_skin_raw`): Id diverso da food_apple_raw: quell'id esiste gia' nel DB (riga demo legacy fuori dal Golden Set) e lo script si fermerebbe.
- **Uva (tipo europeo), cruda** (`food_grapes_european_raw`): ATTENZIONE: l'ID 174682 e' l'uva AMERICANA (slip skin), non quella italiana: usare 174683.
- **Limoni, crudi (senza buccia)** (`food_lemon_peeled_raw`): Senza buccia: non rappresenta il limone intero ne' la scorza.
- **Pesche gialle, crude** (`food_peach_yellow_raw`): Solo pesca gialla (la bianca e' un record FDC diverso, non in coda).
- **Fichi, crudi** (`food_fig_raw`): Fichi freschi (non secchi).
- **Piselli freschi, crudi** (`food_peas_green_raw`): Piselli freschi crudi: non coprono surgelati ne' in scatola (record diversi). Zinco/fitati: i fitati non sono in FDC (gap gia' noto per i legumi).

**1) Dry-run di tutti e 18** (incolla l'intero blocco in PowerShell dalla cartella del progetto; il filtro mostra solo le righe che servono, 2-3 per alimento):
```
npm run add-food -- --fdc-id=170457 --food-id=food_tomato_raw --name-it="Pomodori rossi, crudi" --matrix-id=pomodori --matrix-description-it="Pomodori" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=170000 --food-id=food_onion_raw --name-it="Cipolle, crude" --matrix-id=cipolle --matrix-description-it="Cipolle" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Amaryllidaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169230 --food-id=food_garlic_raw --name-it="Aglio, crudo" --matrix-id=aglio --matrix-description-it="Aglio" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Amaryllidaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=170108 --food-id=food_pepper_red_raw --name-it="Peperoni rossi, crudi" --matrix-id=peperoni_rossi --matrix-description-it="Peperoni rossi" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169247 --food-id=food_lettuce_romaine_raw --name-it="Lattuga romana, cruda" --matrix-id=lattuga_romana --matrix-description-it="Lattuga romana" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Asteraceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=168448 --food-id=food_pumpkin_raw --name-it="Zucca, cruda" --matrix-id=zucca --matrix-description-it="Zucca" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Cucurbitaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169385 --food-id=food_fennel_raw --name-it="Finocchi, crudi (bulbo)" --matrix-id=finocchi --matrix-description-it="Finocchi (bulbo)" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Apiaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169251 --food-id=food_mushroom_white_raw --name-it="Funghi champignon, crudi" --matrix-id=funghi_champignon --matrix-description-it="Funghi champignon" --baseline-cooking-state=raw --analogy-food-id=food_potato_raw --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=171688 --food-id=food_apple_with_skin_raw --name-it="Mele, crude (con buccia)" --matrix-id=mele --matrix-description-it="Mele" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=173944 --food-id=food_banana_raw --name-it="Banane, crude" --matrix-id=banane --matrix-description-it="Banane" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Musaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169118 --food-id=food_pear_raw --name-it="Pere, crude" --matrix-id=pere --matrix-description-it="Pere" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=174683 --food-id=food_grapes_european_raw --name-it="Uva (tipo europeo), cruda" --matrix-id=uva --matrix-description-it="Uva" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Vitaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=167746 --food-id=food_lemon_peeled_raw --name-it="Limoni, crudi (senza buccia)" --matrix-id=limoni --matrix-description-it="Limoni (senza buccia)" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rutaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=167762 --food-id=food_strawberry_raw --name-it="Fragole, crude" --matrix-id=fragole --matrix-description-it="Fragole" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=169928 --food-id=food_peach_yellow_raw --name-it="Pesche gialle, crude" --matrix-id=pesche --matrix-description-it="Pesche gialle" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=168153 --food-id=food_kiwi_green_raw --name-it="Kiwi verde, crudo" --matrix-id=kiwi --matrix-description-it="Kiwi verde" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Actinidiaceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=173021 --food-id=food_fig_raw --name-it="Fichi, crudi" --matrix-id=fichi --matrix-description-it="Fichi" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Moraceae --diet-category=fresh_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
npm run add-food -- --fdc-id=170419 --food-id=food_peas_green_raw --name-it="Piselli freschi, crudi" --matrix-id=piselli --matrix-description-it="Piselli freschi" --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae --diet-category=plant_non_fruit 2>&1 | Select-String -Pattern "FDC description|Nutrienti estratti|NON trovati|inattesa|ERRORE|Errore"
```

**2) Apply** (solo per gli alimenti il cui dry-run e' pulito; per applicarli tutti, incolla l'intero blocco — lo script si ferma da solo e senza scrivere se un food_id esiste gia'):
```
npm run add-food -- --fdc-id=170457 --food-id=food_tomato_raw --name-it="Pomodori rossi, crudi" --matrix-id=pomodori --matrix-description-it="Pomodori" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=170000 --food-id=food_onion_raw --name-it="Cipolle, crude" --matrix-id=cipolle --matrix-description-it="Cipolle" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Amaryllidaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=169230 --food-id=food_garlic_raw --name-it="Aglio, crudo" --matrix-id=aglio --matrix-description-it="Aglio" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Amaryllidaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=170108 --food-id=food_pepper_red_raw --name-it="Peperoni rossi, crudi" --matrix-id=peperoni_rossi --matrix-description-it="Peperoni rossi" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=169247 --food-id=food_lettuce_romaine_raw --name-it="Lattuga romana, cruda" --matrix-id=lattuga_romana --matrix-description-it="Lattuga romana" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Asteraceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=168448 --food-id=food_pumpkin_raw --name-it="Zucca, cruda" --matrix-id=zucca --matrix-description-it="Zucca" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Cucurbitaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=169385 --food-id=food_fennel_raw --name-it="Finocchi, crudi (bulbo)" --matrix-id=finocchi --matrix-description-it="Finocchi (bulbo)" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Apiaceae --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=169251 --food-id=food_mushroom_white_raw --name-it="Funghi champignon, crudi" --matrix-id=funghi_champignon --matrix-description-it="Funghi champignon" --baseline-cooking-state=raw --analogy-food-id=food_potato_raw --diet-category=plant_non_fruit --apply
npm run add-food -- --fdc-id=171688 --food-id=food_apple_with_skin_raw --name-it="Mele, crude (con buccia)" --matrix-id=mele --matrix-description-it="Mele" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=173944 --food-id=food_banana_raw --name-it="Banane, crude" --matrix-id=banane --matrix-description-it="Banane" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Musaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=169118 --food-id=food_pear_raw --name-it="Pere, crude" --matrix-id=pere --matrix-description-it="Pere" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=174683 --food-id=food_grapes_european_raw --name-it="Uva (tipo europeo), cruda" --matrix-id=uva --matrix-description-it="Uva" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Vitaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=167746 --food-id=food_lemon_peeled_raw --name-it="Limoni, crudi (senza buccia)" --matrix-id=limoni --matrix-description-it="Limoni (senza buccia)" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rutaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=167762 --food-id=food_strawberry_raw --name-it="Fragole, crude" --matrix-id=fragole --matrix-description-it="Fragole" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=169928 --food-id=food_peach_yellow_raw --name-it="Pesche gialle, crude" --matrix-id=pesche --matrix-description-it="Pesche gialle" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Rosaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=168153 --food-id=food_kiwi_green_raw --name-it="Kiwi verde, crudo" --matrix-id=kiwi --matrix-description-it="Kiwi verde" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Actinidiaceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=173021 --food-id=food_fig_raw --name-it="Fichi, crudi" --matrix-id=fichi --matrix-description-it="Fichi" --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw --carotenoid-matrix-state=raw_intact --botanical-family=Moraceae --diet-category=fresh_fruit --apply
npm run add-food -- --fdc-id=170419 --food-id=food_peas_green_raw --name-it="Piselli freschi, crudi" --matrix-id=piselli --matrix-description-it="Piselli freschi" --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

## Eseguiti (archivio, ultimi 10)

> **Nota (2026-10-13) sulla classificazione dieta degli alimenti qui sotto.** Dalla melanzana in giù in questa lista, sono stati inseriti con la versione di `add-food` precedente alla correzione `--diet-category`: le loro tre colonne `diet_compat_*` risultavano quindi NULL ("non classificato", escluse dai filtri vegetariano/vegano/fruttariano) finche' non e' stato eseguito `fix_diet_compat_pipeline_foods.sql` (**eseguito il 2026-10-13**: l'utente ha confermato a voce che la query di controllo non mostra piu' nessuno di loro come non classificato, senza screenshot rivisto da questa sessione). **Le zucchine, appena sotto, sono il primo alimento eseguito già con `--diet-category` incluso dall'inizio** (diet=plant_non_fruit scritto direttamente, verificato nel riepilogo di scrittura): non serve alcun fix per loro.

### Zucchine, crude (con buccia) — ✅ eseguito 2026-10-13

- **food_id**: `food_zucchine_raw`. FDC ID 169291 (SR Legacy, "Squash, summer, zucchini, includes skin, raw").
- **Esito reale** (dal log dell'utente, dry-run poi `--apply --diet-category=plant_non_fruit` sul suo PC): dry-run 17/17 nutrienti, FDC description combaciante. Riepilogo scrittura `--apply` mostrato e confermato: `food_matrices_master "zucchine" creata`, `foods_raw "food_zucchine_raw" creato (draft, diet=plant_non_fruit → vegetarian=true, vegan=true, fruitarian=false)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata.
- **Analogia usata**: `food_carrots_raw` (per funzione del campo beta-carotene, non parentela botanica — famiglia reale Cucurbitaceae dichiarata separatamente), `carotenoid_matrix_state=raw_intact`.
- Resta `verification_status='draft'` finché una revisione umana o meccanica non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): il record FDC 169291 era pulito e completo (17/17).

### Melanzane, crude — ✅ eseguito 2026-10-12

- **food_id**: `food_melanzane_raw`. FDC ID 169228 (SR Legacy, "Eggplant, raw").
- **Esito reale** (dal log dell'utente, dry-run poi `--apply` sul suo PC): dry-run 17/17 nutrienti estratti, FDC description "Eggplant, raw" combaciante con quanto previsto in fase di ricerca, nessun gap. Riepilogo scrittura prevista mostrato: `food_matrices_master` nuova riga `melanzane`, `foods_raw` nuova riga `food_melanzane_raw` (draft), `nutrient_values` 17 righe (draft, source_id=USDA_FDC). Utente ha poi confermato il comando `--apply`.
- **Analogia usata**: `food_potato_boiled_in_skin` (stessa famiglia botanica Solanaceae), `carotenoid_matrix_state` lasciato NULL per coerenza con l'analogia (beta-carotene trascurabile, 14µg/100g).
- Resta `verification_status='draft'` finché una revisione umana o meccanica non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): il record FDC 169228 era pulito e completo (17/17), lo scarto del secondo candidato Foundation Foods era già deciso in fase di ricerca.

### Piselli, verdi, cotti, bolliti, scolati, senza sale — ✅ eseguito 2026-10-12

- **food_id**: `food_piselli_bolliti`. FDC ID 170420 (SR Legacy, "Peas, green, cooked, boiled, drained, without salt").
- **Dry-run verificato per screenshot** (17/17 nutrienti, descrizione FDC combaciante) prima dell'`--apply`. **L'esito dell'`--apply` stesso è confermato dall'utente a voce in chat** ("piselli andato"), non da un log/screenshot rivisto riga per riga come per gli altri alimenti di oggi — livello di confidenza leggermente diverso, dichiarato qui per trasparenza, non un dato nascosto o inventato.
- **Analogia usata**: `food_chickpeas_boiled` (stessa famiglia botanica Fabaceae, stesso matrix_id `legumes`), con `is_fortified_folate=false`.
- **Piano B non usato** (scartato, non serviva): il record FDC 170420 era pulito e completo (17/17). Se in futuro si vuole anche una variante "surgelati" distinta, FDC 170105 (senza sale, frozen) è già stato individuato e può essere proposto come voce separata.

### Fave, semi maturi, bollite, senza sale — ✅ eseguito 2026-10-12

- **food_id**: `food_fave_bollite`. FDC ID 173753 (SR Legacy, "Broadbeans (fava beans), mature seeds, cooked, boiled, without salt").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `foods_raw "food_fave_bollite" creato (draft)` (nessuna nuova `food_matrices_master`, la matrice `legumes` esisteva già), `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto draft come atteso). FDC description confermata al momento della scrittura reale: "Broadbeans (fava beans), mature seeds, cooked, boiled, without salt" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_chickpeas_boiled` (stessa famiglia botanica Fabaceae, stesso matrix_id `legumes`), con `is_fortified_folate=false` — nessuna firma di arricchimento nel record.
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): il record FDC 173753 era pulito e completo (17/17), corroborato da due fonti indipendenti in fase di ricerca.

### Farro perlato, secco, crudo — ✅ eseguito 2026-10-12, con gap dichiarato (manca l'energia)

- **food_id**: `food_farro_raw`. FDC ID 2710828 (Foundation Foods, "Farro, pearled, dry, raw").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "farro" creata`, `foods_raw "food_farro_raw" creato (draft)`, `nutrient_values: 9 righe inserite (draft)` — NON 17 come gli altri alimenti, e NON i 10 stimati in fase di ricerca. Il fetch reale dall'endpoint FDC ha trovato solo 9 nutrienti: protein_g, fat_g, carbohydrates_g, fiber_g, calcium_mg, iron_mg, magnesium_mg, zinc_mg, copper_mg. **Mancano, confermati `NULL` e non stimati**: `energy_kcal`, `selenium_mcg`, `beta_carotene_mcg`, `vitamin_c_mg`, `folate_mcg`, `vitamin_b12_mcg`, `vitamin_k_mcg`, `other_provitamin_a_carotenoids_mcg`. Verifica difensiva post-scrittura passata (9/9 righe effettivamente inserite rilette, tutto draft come atteso — coerente con quanto scritto, solo un numero di righe più basso del solito).
- **Perché solo 9 e non 10 come previsto in ricerca**: la ricerca preparatoria aveva letto l'energia (340kcal) da un'etichetta su una pagina aggregatore, non dal dato strutturato FDC — il fetch diretto dal record FDC ufficiale (fatto dallo script al momento dell'esecuzione, non dalla ricerca) non riporta `energy_kcal` come campo per questo record specifico. Discrepanza reale tra ricerca preparatoria e dato vero, non un errore dello script.
- **Decisione (utente, 2026-10-12)**: inserire comunque come draft con i campi mancanti `NULL`, invece di scartare l'alimento. **Attenzione per chiunque lavori sul motore dieta**: `food_farro_raw` non va usato per calcolare diete reali finché `energy_kcal` non viene integrato da un'altra fonte — vedi `docs/PRD.md` §4.6 per il dettaglio completo di questo gap.
- **Analogia usata**: `food_riso_integrale_raw` (stessa famiglia botanica Poaceae), `is_fortified_folate=false` (nessun segnale di fortificazione nei campi presenti, anche se il campo folato stesso è assente quindi non direttamente verificabile su questo record).
- Resta `verification_status='draft'` — non promuovibile a `verified` con questo gap, in ogni caso.

### Orzo perlato, crudo, non arricchito — ✅ eseguito 2026-10-12

- **food_id**: `food_orzo_perlato_raw`. FDC ID 170284 (SR Legacy, "Barley, pearled, raw").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "orzo_perlato" creata`, `foods_raw "food_orzo_perlato_raw" creato (draft)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto draft come atteso). FDC description confermata al momento della scrittura reale: "Barley, pearled, raw" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_riso_integrale_raw` (stessa famiglia botanica Poaceae, già reale nel DB), con `is_fortified_folate=false` — nessuna firma di arricchimento USA nel record (acido folico 0µg riportato esplicitamente separato dal folato alimentare, calcio 29mg/100g nella norma per l'orzo).
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Piano B**: non serviva, il record FDC 170284 era pulito e completo (17/17).

### Farina di mais (per polenta), integrale, gialla, cruda, non arricchita — ✅ eseguito 2026-10-12

- **food_id**: `food_farina_di_mais_raw`. FDC ID 169697 (SR Legacy, "Cornmeal, whole-grain, yellow").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "farina_di_mais" creata`, `foods_raw "food_farina_di_mais_raw" creato (draft)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto draft come atteso). FDC description confermata al momento della scrittura reale: "Cornmeal, whole-grain, yellow" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_pasta_enriched_dry` (stessa famiglia botanica Poaceae), con `is_fortified_folate=false` — nessuna firma di arricchimento USA nel record (acido folico 0µg riportato esplicitamente separato dal folato alimentare, calcio 6mg/100g molto basso, coerente con un cereale integrale non trattato).
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): "Cornmeal, degermed, unenriched, yellow" — nessun FDC ID verificato trovato in ricerca, non era comunque eseguibile. Nessuna azione necessaria su di esso.

### Riso integrale, crudo, non arricchito — ✅ eseguito 2026-10-12

- **food_id**: `food_riso_integrale_raw`. FDC ID 169703 (SR Legacy, "Rice, brown, long-grain, raw (Includes foods for USDA's Food Distribution Program)").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "riso_integrale" creata`, `foods_raw "food_riso_integrale_raw" creato (draft)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto draft come atteso). FDC description confermata al momento della scrittura reale: "Rice, brown, long-grain, raw (Includes foods for USDA's Food Distribution Program)" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_pasta_enriched_dry` (stessa famiglia botanica Poaceae), con `is_fortified_folate=false` — nessuna firma di arricchimento USA nel record (acido folico 0µg riportato esplicitamente separato dal folato alimentare, calcio 9mg/100g nella norma per un cereale non trattato).
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Nota di percorso (non riguarda i dati scritti)**: primi due tentativi di dry-run falliti per un problema di rete sul PC dell'utente (`EAI_AGAIN`, poi `ConnectTimeoutError` nel raggiungere `api.nal.usda.gov` — confermato bloccato anche da browser normale, quindi rete/filtro locale, non un bug dello script); nessuna scrittura avvenuta in nessuno dei tentativi falliti (lo script controlla tutto prima della fetch FDC, e la fetch prima di qualunque INSERT). Al tentativo successivo la rete ha risposto correttamente e l'esecuzione è andata a buon fine come sopra.
- **Piano B non usato** (scartato, non serviva): FDC 2512380 (Foundation Foods, stesso alimento concettuale, 13/17 nutrienti confermati nella pagina consultata) — era pronto come riserva ma il piano A ha dato 17/17 pulito, quindi non è mai stato lanciato. Nessuna azione necessaria su di esso.

### Riso bianco, crudo, non arricchito — ✅ eseguito 2026-10-12

- **food_id**: `food_riso_bianco_raw`. FDC ID 169756 (SR Legacy, "Rice, white, long-grain, regular, raw, unenriched").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "riso_bianco" creata`, `foods_raw "food_riso_bianco_raw" creato (draft)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto coerente). FDC description confermata al momento della scrittura reale: "Rice, white, long-grain, regular, raw, unenriched" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_pasta_enriched_dry` (stessa famiglia botanica Poaceae), con `is_fortified_folate=false` perché questo record è esplicitamente non arricchito.
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): FDC 2512381 (Foundation Foods, stesso alimento concettuale, 11/17 nutrienti) — era pronto come riserva ma il piano A ha dato 17/17 pulito, quindi non è mai stato lanciato. Nessuna azione necessaria su di esso.
