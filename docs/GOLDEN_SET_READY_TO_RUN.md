# Comandi pronti per l'espansione Golden Set — in attesa di esecuzione umana

**Perché questo file esiste (2026-10-12).** Nessuna sessione automatica disponibile oggi può eseguire realmente `npm run add-food -- --apply`: le sessioni collegate al PC (device-link) non hanno una shell vera per le app Terminale/IDE (accesso solo "click", confermato da un collaudo reale lo stesso giorno — vedi `docs/PRD.md` §9 Fase 4 punto 16), e le sessioni cloud non collegate al PC non hanno rete diretta verso Supabase né verso `api.nal.usda.gov` (confermato più volte, vedi `docs/PENDING_HUMAN_ACTIONS.md`). La parte di **ricerca** (trovare un match FDC solido, decidere gli attributi categorici per analogia) non richiede invece né shell né rete verso Supabase/FDC diretta — solo `git` e ricerca web — quindi **può** girare da sola in un task pianificato cloud. Questo file è la coda di output di quel task: alimenti già ricercati e valutati, con i comandi pronti da incollare sul tuo PC quando hai un momento.

**Convenzione:**
- Una voce per alimento, più recenti in cima.
- Ogni voce ha: alimento, FDC ID + dataType, quanti nutrienti su 17 trovati, l'analogia dichiarata, i due comandi (dry-run e apply).
- Quando esegui un comando da qui e confermi l'esito (dal log reale, non a sensazione), la voce va spostata in "Eseguiti" con la data ed eventualmente la riga nella coda di `docs/PRD.md` va marcata `✅` — questo lavoro di chiusura lo fa una sessione interattiva (questa chat), non il task pianificato stesso (che prepara soltanto, non segue mai l'esito di un comando che non ha eseguito lui).
- **Dal 2026-10-12 sera ogni comando richiede `--diet-category` (meat_fish | egg_dairy | fresh_fruit | plant_non_fruit)**: senza, lo script si ferma prima di scrivere. Motivo: gli alimenti senza classificazione dieta venivano esclusi in silenzio dai filtri vegetariano/vegano/fruttariano (vedi `lib/fdc/dietCategory.ts` e `docs/PRD.md` §9 Fase 4.16).
- **Esecuzione a lotti (dal 2026-10-14 sera).** Con decine di voci al giorno eseguire un comando alla volta non è praticabile: una sessione interattiva raggruppa le voci "Pronti" in lotti da ~20 e prepara una cartella `lotti_alimenti/` (file `lotto_NN_prova.txt` = solo dry-run, `lotto_NN_applica.txt` = scrittura, `LEGGIMI.txt` con i passi; i log reali vanno in `esito_lotto_NN_*.txt`). Dopo l'apply si lancia una query di sola lettura che controlla tutti gli alimenti del giro (es. `check_alimenti_lotto2.sql`), e solo con "DA CONTROLLARE=0, NON PRESENTE=0" le voci passano in "Eseguiti" (in forma compatta: una riga per alimento).
- Se un comando qui elencato fallisce o dà un riepilogo diverso da quanto previsto, dimmelo in chat: la voce resta qui finché non si chiarisce, non va rimossa automaticamente.

**Per l'uso quotidiano (2026-10-12)**: l'utente non programma e trova questo file troppo denso da seguire ogni volta. Esiste quindi `docs/PROSSIMO_COMANDO.txt` — solo il comando (dry-run + apply) del PRIMO alimento in "Pronti" sotto, senza spiegazioni, mantenuto aggiornato da una sessione interattiva (non dal task pianificato, che non sa quale comando l'utente ha già in mano) ogni volta che una voce viene eseguita o aggiunta. Questo file resta la fonte di verità con tutto il ragionamento; quello è solo una vista semplificata del primo elemento della coda.

---

## Pronti

### Salsa di soia (shoyu) — preparato 2026-10-23 dal task (ventottesimo lotto, bonus)

- **food_id**: `food_salsa_di_soia`. FDC ID 174277 (SR Legacy, "Soy sauce made from soy and wheat (shoyu)" — pagina getfoodfacts.com dedicata e pulita).
- **Nutrienti**: **17/17**. Per 100g: energia 53,0kcal, proteine 8,14g, grassi 0,57g, carboidrati 4,93g, fibra 0,80g, calcio 33,0mg, ferro 1,45mg, zinco 0,87mg, magnesio 74,0mg, rame 0,043mg, selenio 0,50µg, vitamina C 0mg esplicito, vitamina B12 0µg esplicito, folato totale 14,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Sodio 5.493mg/100g — molto alto ma coerente con un condimento fermentato concentrato (stesso ordine di grandezza della salatura già vista per capperi/olive/colza in questa pipeline). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174277 e dataType SR Legacy.
- **Analogia usata**: `food_soia_secca_cotta` (soia secca cotta/bollita, già eseguita sul DB reale — stesso legume di base, prodotto fermentato/trasformato invece del seme bollito). Nota di trasparenza: il nome FDC stesso dichiara esplicitamente la composizione "made from soy and wheat" (soia+frumento), quindi — a differenza del miso scartato ⚠ nel ventisettesimo lotto per mancanza di conferma sulla composizione — qui la composizione è dichiarata direttamente sul record, non serve una fonte esterna per confermarla.
- **Categoria dieta**: `plant_non_fruit` (soia+frumento, nessun ingrediente animale).
- **Matrice**: nuova `salsa_di_soia` ("Salsa di soia (shoyu)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile, condimento trasformato), `carotenoid_matrix_state` omesso (NULL — tutti i carotenoidi 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto misto soia (Fabaceae) + frumento (Poaceae), nessuna famiglia botanica singola applicabile), `baseline_cooking_state=fermented` (prodotto fermentato), `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=174277 --food-id=food_salsa_di_soia \
  --name-it="Salsa di soia (shoyu)" \
  --matrix-id=salsa_di_soia --matrix-description-it="Salsa di soia (shoyu)" \
  --baseline-cooking-state=fermented --analogy-food-id=food_soia_secca_cotta \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=174277 --food-id=food_salsa_di_soia \
  --name-it="Salsa di soia (shoyu)" \
  --matrix-id=salsa_di_soia --matrix-description-it="Salsa di soia (shoyu)" \
  --baseline-cooking-state=fermented --analogy-food-id=food_soia_secca_cotta \
  --diet-category=plant_non_fruit --apply
```

### Taccole, cotte (congelate, bollite, senza sale) — preparato 2026-10-23 dal task (ventottesimo lotto, bonus)

- **food_id**: `food_taccole_cotte`. FDC ID 170418 (SR Legacy, "Peas, edible-podded, frozen, cooked, boiled, drained, without salt" — pagina getfoodfacts.com dedicata e pulita). **Deviazione dichiarata**: nessun record FDC generico trovato per la variante fresca (non congelata) cotta — l'unica fonte con valori per la variante fresca (recipal.com #3088) cita solo un NDB legacy ID (11301), non un FDC ID verificabile. Usata quindi la variante congelata/cotta, stesso precedente già accettato per edamame cotto (FDC "Edamame, frozen, prepared" usato come proxy del bollito).
- **Nutrienti**: **17/17**. Per 100g: energia 52,0kcal, proteine 3,50g, grassi 0,38g, carboidrati 9,02g, fibra 3,10g, calcio 59,0mg, ferro 2,40mg, zinco 0,49mg, magnesio 28,0mg, rame 0,090mg, selenio 0,80µg, vitamina C 22,0mg (reale), vitamina B12 0µg esplicito, folato totale 35,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 30,2µg, beta-carotene 760µg (reale e alto, coerente con una verdura verde cotta), alfa-carotene 53,0µg (usato come "altro carotenoide provitaminico A"), beta-criptoxantina 0µg. Sodio 5,00mg/100g (basso, coerente con "without salt"). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170418 e dataType SR Legacy.
- **Analogia usata**: `food_taccole_raw` (taccole crude, stesso alimento, già eseguito sul DB reale — differisce solo per stato di cottura; stessa famiglia botanica Fabaceae).
- **Categoria dieta**: `plant_non_fruit` (legume/ortaggio, nessun ingrediente animale).
- **Matrice**: riusa `taccole` (già esistente nel DB reale da `food_taccole_raw`, già eseguito).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione del crudo), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene reale e alto, matrice disgregata dalla cottura — più alto del crudo, 760µg vs valore del crudo non riletto qui ma coerente con l'effetto noto della cottura sulla biodisponibilità), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=170418 --food-id=food_taccole_cotte \
  --name-it="Taccole, cotte (congelate, bollite, senza sale)" \
  --matrix-id=taccole --matrix-description-it="Taccole" \
  --baseline-cooking-state=boiled --analogy-food-id=food_taccole_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170418 --food-id=food_taccole_cotte \
  --name-it="Taccole, cotte (congelate, bollite, senza sale)" \
  --matrix-id=taccole --matrix-description-it="Taccole" \
  --baseline-cooking-state=boiled --analogy-food-id=food_taccole_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Caviale (uova di storione, in granuli) — preparato 2026-10-23 dal task (ventottesimo lotto)

- **food_id**: `food_caviale_raw`. FDC ID 174188 (SR Legacy, "Fish, caviar, black and red, granular" — pagina getfoodfacts.com dedicata e pulita).
- **Nutrienti**: **17/17**. Per 100g: energia 264kcal, proteine 24,6g, grassi 17,9g, carboidrati 4,00g, fibra 0g, calcio 275mg, ferro 11,9mg (alto, coerente con un uovo ricco di riserve), zinco 0,95mg, magnesio 300mg (alto, plausibile per un uovo concentrato), rame 0,11mg, selenio 65,5µg (alto, coerente con un prodotto ittico), vitamina C 0mg esplicito, vitamina B12 20,0µg (molto alto, coerente con un prodotto ittico/uovo), folato totale 50,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 0,60µg, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Sodio 1.500mg/100g (alto, coerente con la salagione tipica del caviale). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174188 e dataType SR Legacy.
- **Analogia usata**: `food_egg_hard_boiled` (uovo di gallina, Golden Set originale, già eseguito) — scelta specificamente per l'attributo `is_heme_iron`: il caviale è un uovo (roe), non tessuto muscolare, quindi il ferro non proviene da mioglobina/emoglobina come nella carne/pesce muscolare, ma ha lo stesso profilo "ferro d'uovo, non-eme" già classificato per le uova di gallina/quaglia/anatra in questa pipeline — nonostante la specie sia un pesce (storione), la struttura biologica rilevante per questo attributo è l'uovo, non il muscolo. **Nota di trasparenza**: la categoria dieta resta `meat_fish` (non `egg_dairy`) perché il caviale è un prodotto ittico/di mare per convenzione comune (un vegetariano che mangia uova di gallina tipicamente non mangia caviale) — nessuna analogia già eseguita in questa pipeline copre esattamente questo caso (uovo di pesce), quindi la decisione per `is_heme_iron` e quella per `diet-category` usano due ragionamenti distinti e dichiarati separatamente, non una singola analogia automatica.
- **Categoria dieta**: `meat_fish` (prodotto ittico/di mare, non vegetariano per convenzione comune).
- **Matrice**: nuova `caviale` ("Caviale (uova di storione)").
- **Attributi**: `is_heme_iron=false` (per il ragionamento "uovo, non muscolo" sopra), `matrix_category_calcium` omesso (NULL — non applicabile, prodotto animale), `carotenoid_matrix_state` omesso (NULL — tutti i carotenoidi 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto animale), `baseline_cooking_state=raw` (non cotto, solo salato), `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=174188 --food-id=food_caviale_raw \
  --name-it="Caviale (uova di storione, in granuli)" \
  --matrix-id=caviale --matrix-description-it="Caviale (uova di storione)" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_hard_boiled \
  --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174188 --food-id=food_caviale_raw \
  --name-it="Caviale (uova di storione, in granuli)" \
  --matrix-id=caviale --matrix-description-it="Caviale (uova di storione)" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_hard_boiled \
  --diet-category=meat_fish --apply
```

### Funghi pleurotus (ostrica), crudi — preparato 2026-10-23 dal task (ventottesimo lotto)

- **food_id**: `food_funghi_pleurotus_raw`. FDC ID 168580 (SR Legacy, "Mushrooms, oyster, raw" — pagina getfoodfacts.com dedicata e pulita).
- **Nutrienti**: **17/17**. Per 100g: energia 33,0kcal, proteine 3,31g, grassi 0,41g, carboidrati 6,09g, fibra 2,30g, calcio 3,00mg, ferro 1,33mg, zinco 0,77mg, magnesio 18,0mg, rame 0,24mg, selenio 2,60µg, vitamina C 0mg esplicito, vitamina B12 0µg esplicito, folato totale 38,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 0µg esplicito, beta-carotene 29,0µg (basso ma reale, non assunto zero), altro carotenoide provitaminico A (alfa-carotene+beta-criptoxantina) 0µg. Sodio 18,0mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168580 e dataType SR Legacy.
- **Analogia usata**: `food_mushroom_white_raw` (funghi champignon crudi, Golden Set originale, già eseguito — stessa categoria "fungo crudo", non pianta, nessuna famiglia botanica applicabile, stessa convenzione già usata per shiitake/lievito di birra in questa pipeline).
- **Categoria dieta**: `plant_non_fruit` (fungo, nessun ingrediente animale).
- **Matrice**: nuova `funghi_pleurotus` ("Funghi pleurotus (ostrica)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile, fungo), `carotenoid_matrix_state=raw_intact` (beta-carotene basso ma reale e non nullo, fungo crudo non disgregato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — i funghi non sono piante, nessuna famiglia botanica, stessa convenzione già usata per champignon/shiitake in questa pipeline), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=168580 --food-id=food_funghi_pleurotus_raw \
  --name-it="Funghi pleurotus (ostrica), crudi" \
  --matrix-id=funghi_pleurotus --matrix-description-it="Funghi pleurotus (ostrica)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mushroom_white_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168580 --food-id=food_funghi_pleurotus_raw \
  --name-it="Funghi pleurotus (ostrica), crudi" \
  --matrix-id=funghi_pleurotus --matrix-description-it="Funghi pleurotus (ostrica)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mushroom_white_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit --apply
```

### Ketchup (salsa di pomodoro) — preparato 2026-10-23 dal task (ventottesimo lotto)

- **food_id**: `food_ketchup`. FDC ID 168556 (SR Legacy, "Catsup" — pagina getfoodfacts.com dedicata e pulita, titolo "Catsup (SR Legacy)").
- **Nutrienti**: **17/17**. Per 100g (valori dalla tabella nutrienti completa, non dal pannello etichetta arrotondato — pannello 100kcal/910mg sodio, tabella 101kcal/907mg): energia 101kcal, proteine 1,04g, grassi 0,10g, carboidrati 27,4g, fibra 0,30g, calcio 15,0mg, ferro 0,35mg, zinco 0,17mg, magnesio 13,0mg, rame 0,085mg, selenio 0,70µg, vitamina C 4,10mg (reale, coerente col pomodoro), vitamina B12 0µg esplicito, folato totale 9,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 3,00µg, beta-carotene 316µg (reale e alto, coerente col pomodoro concentrato), alfa-carotene/beta-criptoxantina 0µg (usati come "altro carotenoide provitaminico A" = 0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168556 e dataType SR Legacy.
- **Analogia usata**: `food_pomodori_secchi_raw` (pomodori secchi, già eseguito sul DB reale — stessa pianta *Solanum lycopersicum*, famiglia botanica reale Solanaceae; prodotto di pomodoro concentrato/trasformato come il ketchup, non il pomodoro fresco).
- **Categoria dieta**: `plant_non_fruit` (prodotto di pomodoro, ortaggio botanicamente "frutto" ma classificato come verdura per convenzione del PRD §4.9; nessun ingrediente animale).
- **Matrice**: nuova `ketchup` ("Ketchup (salsa di pomodoro)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile, prodotto trasformato non classificato per ossalati), `carotenoid_matrix_state=cooked_or_disrupted` (il pomodoro è cotto/concentrato nella produzione del ketchup, matrice carotenoide disgregata dal calore — beta-carotene reale e alto lo confirma), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae` (famiglia reale del pomodoro, come per l'analogia), `baseline_cooking_state=cooked` (il pomodoro è cotto/concentrato), `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=168556 --food-id=food_ketchup \
  --name-it="Ketchup (salsa di pomodoro)" \
  --matrix-id=ketchup --matrix-description-it="Ketchup (salsa di pomodoro)" \
  --baseline-cooking-state=cooked --analogy-food-id=food_pomodori_secchi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168556 --food-id=food_ketchup \
  --name-it="Ketchup (salsa di pomodoro)" \
  --matrix-id=ketchup --matrix-description-it="Ketchup (salsa di pomodoro)" \
  --baseline-cooking-state=cooked --analogy-food-id=food_pomodori_secchi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Maionese — preparato 2026-10-23 dal task (ventottesimo lotto)

- **food_id**: `food_maionese`. FDC ID 171009 (SR Legacy, "Salad dressing, mayonnaise, regular" — pagina getfoodfacts.com dedicata e pulita).
- **Nutrienti**: **17/17**. Per 100g: energia 680kcal, proteine 0,96g, grassi 74,8g, carboidrati 0,57g, fibra 0g, calcio 8,00mg, ferro 0,21mg, zinco 0,15mg, magnesio 1,00mg, rame 0,019mg, selenio 2,30µg, vitamina C 0mg esplicito, vitamina B12 0,12µg, folato totale 5,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 163µg (alta, coerente con l'olio vegetale usato come base), beta-carotene 6,00µg, beta-criptoxantina 4,00µg (usata come "altro carotenoide provitaminico A"). Sodio 635mg/100g (riferimento, non tracciato). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171009 e dataType SR Legacy.
- **Analogia usata**: `food_egg_hard_boiled` (uovo intero cotto, Golden Set originale, già eseguito) — non per il tipo di alimento (maionese è soprattutto olio, non uovo), ma specificamente per l'attributo `is_heme_iron`: la maionese contiene tuorlo d'uovo come unico ingrediente animale, e il ferro dell'uovo è non-eme (stessa convenzione già usata per uova di gallina/quaglia/anatra in questa pipeline) — nessun'altra voce già eseguita rappresenta un prodotto "a base di uovo non muscolare" meglio di questa. Categoria dieta decisa separatamente per analogia di contenuto (contiene uovo, non vegetale puro): `egg_dairy` (vegetariano sì, vegano no), coerente con la definizione del PRD §4.9 ("uova, latticini, miele").
- **Categoria dieta**: `egg_dairy` (contiene tuorlo d'uovo; nessun ingrediente di carne/pesce).
- **Matrice**: nuova `maionese` ("Maionese").
- **Attributi**: `is_heme_iron=false` (per analogia con l'uovo, non con carne/pesce), `matrix_category_calcium` omesso (NULL — non applicabile, prodotto condimento non a base vegetale/lattiero-casearia classificabile per ossalati), `carotenoid_matrix_state` omesso (NULL — beta-carotene/beta-criptoxantina presenti ma in tracce, residuo dell'olio vegetale, non un alimento la cui classificazione dipenda dalla matrice carotenoide), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto misto uovo+olio vegetale, nessuna famiglia botanica singola applicabile), `baseline_cooking_state=raw` (emulsione non cotta), `is_fortified_folate` omesso (false — acido folico 0µg esplicito, nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=171009 --food-id=food_maionese \
  --name-it="Maionese" \
  --matrix-id=maionese --matrix-description-it="Maionese" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_hard_boiled \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171009 --food-id=food_maionese \
  --name-it="Maionese" \
  --matrix-id=maionese --matrix-description-it="Maionese" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_hard_boiled \
  --diet-category=egg_dairy --apply
```

*(Le voci nuove del task orario si aggiungono in cima a questa sezione; quelle già eseguite stanno in "Eseguiti" in fondo.)*

*(Questa sezione contiene solo voci non ancora eseguite: se in essa non c'è nessuna voce "###", non c'è nulla da eseguire. Le voci eseguite vengono riassunte in "Eseguiti"; il testo completo di quelle del 2026-10-14 è nella cronologia git, `git show 7460196:docs/GOLDEN_SET_READY_TO_RUN.md`, e quello delle 275 eseguite il 2026-10-22 con `git show cacb1e5:docs/GOLDEN_SET_READY_TO_RUN.md`.)*

### Farina di farro, cruda — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_farina_di_farro_raw`. FDC ID 2003587 (Foundation Foods, "Flour, spelt, whole grain" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). Distinta dal chicco perlato già eseguito (`food_farro_raw`): farina integrale di farro macinata, non il chicco intero.
- **Nutrienti**: **12/17**. Per 100g (valori esatti dalla tabella nutrienti della pagina, non dal pannello etichetta arrotondato — la pagina mostra 340kcal sul pannello etichetta ma 341kcal nel box statistico/tabella, usato quest'ultimo): energia 341kcal, proteine 14,5g, grassi 2,54g, carboidrati 70,7g, fibra 9,34g, calcio 30,0mg, ferro 3,77mg, zinco 3,59mg, magnesio 124mg, rame 0,53mg, selenio 9,48µg, folato totale 38,4µg. Sodio 0mg/100g esplicito (riferimento). **Mancano** (non riportati sulla pagina, non assunti zero): vitamina C, acido folico separato, vitamina B12, vitamina K, beta-carotene, altro carotenoide provitaminico A (alfa-carotene + beta-criptoxantina) — nessuna firma di arricchimento nei campi presenti (folato totale 38,4µg senza una componente "acido folico" separata). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 2003587 e dataType Foundation.
- **Analogia usata**: `food_farro_raw` (farro perlato, secco, crudo, già eseguito sul DB reale — stessa pianta *Triticum spelta*, farina invece di chicco perlato; nota di trasparenza: anche `food_farro_raw` ha un gap dichiarato sull'energia per lo stesso tipo di record Foundation Foods, quindi non è garantito che il fetch reale dallo script riproduca esattamente i 12 nutrienti letti qui dalla pagina — stesso limite già documentato per quell'alimento, l'estrazione reale avviene al momento dell'`--apply`).
- **Categoria dieta**: `plant_non_fruit` (farina di cereale).
- **Matrice**: nuova `farina_di_farro` ("Farina di farro").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile a una farina di cereale, stessa convenzione delle altre farine già eseguite), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato sulla pagina, non assunto zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (famiglia reale del farro, come per l'analogia), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento, folato totale presente senza componente acido folico separata).

```
npm run add-food -- --fdc-id=2003587 --food-id=food_farina_di_farro_raw \
  --name-it="Farina di farro, cruda" \
  --matrix-id=farina_di_farro --matrix-description-it="Farina di farro" \
  --baseline-cooking-state=raw --analogy-food-id=food_farro_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=2003587 --food-id=food_farina_di_farro_raw \
  --name-it="Farina di farro, cruda" \
  --matrix-id=farina_di_farro --matrix-description-it="Farina di farro" \
  --baseline-cooking-state=raw --analogy-food-id=food_farro_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Farina di sorgo, cruda — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_farina_di_sorgo_raw`. FDC ID 168943 (SR Legacy, "Sorghum flour, whole-grain" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30; la pagina segnala che esistono 2 descrizioni USDA di farina di sorgo, questa è la "whole-grain" scelta come più rappresentativa di un prodotto semplice non raffinato). Distinta dal chicco intero già eseguito (`food_sorgo_raw`).
- **Nutrienti**: **14/17**. Per 100g: energia 359kcal, proteine 8,43g, grassi 3,34g, carboidrati 76,6g, fibra 6,60g, calcio 12,0mg, ferro 3,14mg, zinco 1,63mg, magnesio 123mg, rame 0,25mg, selenio 12,2µg, vitamina C 0,80mg, folato totale 25,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina K 6,40µg (fogliata — la pagina riporta separatamente anche menaquinone-4 0,20µg e diidrofillochinone 0µg, non sommati qui, solo la fillochinone standard usata dalla mappatura). Sodio 3,00mg/100g (riferimento). **Mancano** (non riportati sulla pagina, non assunti zero): vitamina B12, beta-carotene, altro carotenoide provitaminico A (alfa-carotene + beta-criptoxantina). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168943 e dataType SR Legacy.
- **Analogia usata**: `food_sorgo_raw` (sorgo integrale crudo, già eseguito sul DB reale — stessa pianta *Sorghum bicolor*, farina invece di chicco intero).
- **Categoria dieta**: `plant_non_fruit` (farina di cereale).
- **Matrice**: nuova `farina_di_sorgo` ("Farina di sorgo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile a una farina di cereale, stessa convenzione delle altre farine), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato sulla pagina, non assunto zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (famiglia reale del sorgo, come per l'analogia), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168943 --food-id=food_farina_di_sorgo_raw \
  --name-it="Farina di sorgo, cruda" \
  --matrix-id=farina_di_sorgo --matrix-description-it="Farina di sorgo" \
  --baseline-cooking-state=raw --analogy-food-id=food_sorgo_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168943 --food-id=food_farina_di_sorgo_raw \
  --name-it="Farina di sorgo, cruda" \
  --matrix-id=farina_di_sorgo --matrix-description-it="Farina di sorgo" \
  --baseline-cooking-state=raw --analogy-food-id=food_sorgo_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Farina di quinoa, cruda — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_farina_di_quinoa_raw`. FDC ID 2512372 (Foundation Foods, "Flour, quinoa" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). Distinta dalla quinoa secca intera già eseguita (`food_quinoa_dry_raw`).
- **Nutrienti**: **11/17** (record Foundation con 30 nutrienti totali elencati in pagina, ma solo questi 11 fra i 17 tracciati da questo progetto). Per 100g: energia 378kcal, proteine 11,9g, grassi 6,60g, carboidrati 69,5g, fibra 6,29g, calcio 37,6mg, ferro 4,53mg, zinco 2,77mg, magnesio 164mg, rame 0,48mg, selenio 4,10µg. Sodio 6,32mg/100g (riferimento). **Mancano** (il record Foundation elenca esplicitamente "ogni nutriente presente", 30 in totale — questi non ci sono, non assunti zero): vitamina C, folato totale, acido folico, vitamina B12, vitamina K, beta-carotene, altro carotenoide provitaminico A. Gap dichiarato, coerente con lo stesso schema già visto per altre farine Foundation Foods prive di alcuni micronutrienti (farina di orzo, farina di cocco). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 2512372 e dataType Foundation.
- **Analogia usata**: `food_quinoa_dry_raw` (quinoa secca, cruda, già eseguita sul DB reale — stessa pianta *Chenopodium quinoa*, farina invece di seme intero).
- **Categoria dieta**: `plant_non_fruit` (farina di pseudocereale).
- **Matrice**: nuova `farina_di_quinoa` ("Farina di quinoa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — non applicabile a una farina, stessa convenzione delle altre farine), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato sulla pagina, non assunto zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaranthaceae` (famiglia reale della quinoa, stessa usata per `food_quinoa_dry_raw`/`food_quinoa_cotta`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessun dato di folato/acido folico sul record, nessun segnale di arricchimento).

```
npm run add-food -- --fdc-id=2512372 --food-id=food_farina_di_quinoa_raw \
  --name-it="Farina di quinoa, cruda" \
  --matrix-id=farina_di_quinoa --matrix-description-it="Farina di quinoa" \
  --baseline-cooking-state=raw --analogy-food-id=food_quinoa_dry_raw \
  --botanical-family=Amaranthaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=2512372 --food-id=food_farina_di_quinoa_raw \
  --name-it="Farina di quinoa, cruda" \
  --matrix-id=farina_di_quinoa --matrix-description-it="Farina di quinoa" \
  --baseline-cooking-state=raw --analogy-food-id=food_quinoa_dry_raw \
  --botanical-family=Amaranthaceae --diet-category=plant_non_fruit --apply
```

### Farina di patate, cruda — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_farina_di_patate_raw`. FDC ID 168446 (SR Legacy, "Potato flour" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). **Nota di trasparenza importante**: questo NON è l'amido/fecola di patate (starch puro, quasi solo carboidrato, proteine/fibra trascurabili) originariamente previsto dalla voce di coda — nessun record FDC SR Legacy/Foundation per "Starch, potato" è stato trovato in nessuna fonte consultata (solo riferimenti enciclopedici, nessun FDC ID verificabile). "Potato flour" è invece patata intera disidratata e macinata (proteine 6,90g/100g, fibra 5,90g/100g — valori incompatibili con uno starch puro), un prodotto diverso e distinto sia dall'amido di patate sia dalle patate crude già nel Golden Set originale (`food_potato_raw`) — non una sostituzione dell'alimento richiesto, ma un alimento nuovo e genuino nel suo diritto, scelto al posto dell'amido per non forzare un match sbagliato (stesso principio già applicato per pangasio/catfish e orata/porgy in questa coda).
- **Nutrienti**: **17/17** (completo). Per 100g: energia 357kcal, proteine 6,90g, grassi 0,34g, carboidrati 83,1g, fibra 5,90g, calcio 65,0mg, ferro 1,38mg, zinco 0,54mg, magnesio 65,0mg, rame 0,20mg, selenio 1,10µg, vitamina C 3,80mg, folato totale 25,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti (coerente con un tubero bianco privo di pigmento, stessa convenzione già usata per patate/rafano/pastinaca). Sodio 55,0mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168446 e dataType SR Legacy.
- **Analogia usata**: `food_potato_raw` (patate crude con buccia, Golden Set originale — stesso tubero *Solanum tuberosum*, farina/disidratato invece di crudo fresco).
- **Categoria dieta**: `plant_non_fruit` (tubero/derivato di tubero).
- **Matrice**: nuova `farina_di_patate` ("Farina di patate").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione di `food_potato_raw`), `carotenoid_matrix_state=raw_intact` (beta-carotene 0µg esplicito, matrice non alterata da cottura — stessa convenzione di rafano/daikon), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae` (famiglia reale della patata, come per l'analogia), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168446 --food-id=food_farina_di_patate_raw \
  --name-it="Farina di patate, cruda" \
  --matrix-id=farina_di_patate --matrix-description-it="Farina di patate" \
  --baseline-cooking-state=raw --analogy-food-id=food_potato_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168446 --food-id=food_farina_di_patate_raw \
  --name-it="Farina di patate, cruda" \
  --matrix-id=farina_di_patate --matrix-description-it="Farina di patate" \
  --baseline-cooking-state=raw --analogy-food-id=food_potato_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Taro, crudo — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_taro_raw`. FDC ID 169308 (SR Legacy, "Taro, raw" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). Primo tubero tropicale di questa pipeline (distinto dalla patata/patata dolce già nel Golden Set).
- **Nutrienti**: **17/17** (completo). Per 100g: energia 112kcal, proteine 1,50g, grassi 0,20g, carboidrati 26,5g, fibra 4,10g, calcio 43,0mg, ferro 0,55mg, zinco 0,23mg, magnesio 33,0mg, rame 0,17mg, selenio 0,70µg, vitamina C 4,50mg, folato totale 22,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 1,00µg, beta-carotene 35,0µg (reale e non nullo, coerente con la polpa leggermente pigmentata del taro), alfa-carotene 0µg esplicito, beta-criptoxantina 20,0µg (reale e non nullo). Sodio 11,0mg/100g (riferimento). Nota di precisione: la pagina presenta i valori per 100g come derivati per scala dalla porzione da 1 cup/104g — stessa minima imprecisione di arrotondamento già accettata altrove in questa coda, non un gap di fonte. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169308 e dataType SR Legacy.
- **Analogia usata**: `food_patata_dolce_raw` (patata dolce cruda, Golden Set — stessa categoria "tubero tropicale crudo con carotenoidi reali non nulli", a differenza della patata comune che non ne ha; nessuna parentela botanica reale, stessa convenzione già usata per patata dolce/patata comune).
- **Categoria dieta**: `plant_non_fruit` (tubero).
- **Matrice**: nuova `taro` ("Taro").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione dei tuberi già eseguiti), `carotenoid_matrix_state=raw_intact` (beta-carotene e beta-criptoxantina reali e non nulli, tubero crudo non alterato da cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Araceae` (famiglia botanica reale del taro, *Colocasia esculenta* — diversa sia da quella della patata dolce, Convolvulaceae, sia da quella della patata comune, Solanaceae), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169308 --food-id=food_taro_raw \
  --name-it="Taro, crudo" \
  --matrix-id=taro --matrix-description-it="Taro" \
  --baseline-cooking-state=raw --analogy-food-id=food_patata_dolce_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Araceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169308 --food-id=food_taro_raw \
  --name-it="Taro, crudo" \
  --matrix-id=taro --matrix-description-it="Taro" \
  --baseline-cooking-state=raw --analogy-food-id=food_patata_dolce_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Araceae \
  --diet-category=plant_non_fruit --apply
```

### Igname, crudo — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_igname_raw`. FDC ID 170071 (SR Legacy, "Yam, raw" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). Secondo tubero tropicale di questa pipeline (distinto da taro, genere *Dioscorea* vs *Colocasia*, famiglie botaniche diverse).
- **Nutrienti**: **17/17** (completo). Per 100g: energia 118kcal, proteine 1,53g, grassi 0,17g, carboidrati 27,9g, fibra 4,10g, calcio 17,0mg, ferro 0,54mg, zinco 0,24mg, magnesio 21,0mg, rame 0,18mg, selenio 0,70µg, vitamina C 17,1mg, folato totale 23,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 2,30µg, beta-carotene 83,0µg (reale e non nullo), alfa-carotene/beta-criptoxantina entrambi 0µg espliciti. Sodio 9,00mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170071 e dataType SR Legacy.
- **Analogia usata**: `food_patata_dolce_raw` (patata dolce cruda, Golden Set, già eseguita sul DB reale — stessa categoria "tubero tropicale crudo con carotenoidi reali non nulli"; **non** usato `food_taro_raw` appena preparato sopra, perché ancora solo "pronto" e non eseguito sul DB reale — l'analogia deve riferirsi a un alimento che esiste davvero nel DB).
- **Categoria dieta**: `plant_non_fruit` (tubero).
- **Matrice**: nuova `igname` ("Igname").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione dei tuberi già eseguiti), `carotenoid_matrix_state=raw_intact` (beta-carotene reale e non nullo, tubero crudo non alterato da cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Dioscoreaceae` (famiglia botanica reale dell'igname, genere *Dioscorea* — diversa da taro/Araceae, patata dolce/Convolvulaceae e patata/Solanaceae), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170071 --food-id=food_igname_raw \
  --name-it="Igname, crudo" \
  --matrix-id=igname --matrix-description-it="Igname" \
  --baseline-cooking-state=raw --analogy-food-id=food_patata_dolce_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Dioscoreaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170071 --food-id=food_igname_raw \
  --name-it="Igname, crudo" \
  --matrix-id=igname --matrix-description-it="Igname" \
  --baseline-cooking-state=raw --analogy-food-id=food_patata_dolce_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Dioscoreaceae \
  --diet-category=plant_non_fruit --apply
```

### Patate, cotte (bollite, con sale) — preparato 2026-10-23 dal task (ventisettesimo lotto), deviazione dichiarata

- **food_id**: `food_patate_bollite`. FDC ID 170114 (SR Legacy, "Potatoes, boiled, cooked in skin, flesh, with salt" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). **Deviazione dichiarata**: la voce di coda chiedeva "senza sale" — nessuna pagina getfoodfacts.com trovata per la variante corrispondente ("Potatoes, boiled, cooked in skin, flesh, without salt"), solo fonti che mescolano standard diversi (triagemethod.com) senza FDC ID/dataType espliciti sulla stessa pagina; usata la variante "con sale", stessa deviazione già validata più volte in questa coda (frutta a guscio tostata con sale, riso bianco cotto con sale) — sodio 240mg/100g, molto più alto del crudo (`food_potato_raw`, non ancora misurato per il sodio in questo progetto ma atteso <10mg), coerente con l'aggiunta di sale in cottura, non con un'anomalia del dato. Prima coppia crudo/cotto per questo tubero (il crudo è nel Golden Set originale).
- **Nutrienti**: **17/17** (completo). Per 100g: energia 87,0kcal, proteine 1,87g, grassi 0,10g, carboidrati 20,1g, fibra 2,00g, calcio 5,00mg, ferro 0,31mg, zinco 0,30mg, magnesio 22,0mg, rame 0,19mg, selenio 0,30µg, vitamina C 13,0mg, folato totale 10,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 2,20µg, beta-carotene 2,00µg (piccolo ma reale e non nullo), alfa-carotene/beta-criptoxantina entrambi 0µg espliciti. Sodio 240mg/100g (atteso per la variante "con sale", vedi deviazione sopra). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170114 e dataType SR Legacy.
- **Analogia usata**: `food_potato_raw` (patate crude con buccia, Golden Set originale, già eseguita — stesso alimento, coppia cotta per il crudo, stesso schema già usato per carote/broccoli/spinaci/manzo/salmone/merluzzo).
- **Categoria dieta**: `plant_non_fruit` (tubero).
- **Matrice**: riuso `tubers` (stessa matrice del crudo `food_potato_raw`, nessuna nuova matrice necessaria).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione del crudo), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene reale e non nullo, matrice alterata dalla cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae` (stessa dell'analogia/crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170114 --food-id=food_patate_bollite \
  --name-it="Patate, cotte (bollite, con sale)" \
  --matrix-id=tubers --matrix-description-it="Tuberi" \
  --baseline-cooking-state=boiled --analogy-food-id=food_potato_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170114 --food-id=food_patate_bollite \
  --name-it="Patate, cotte (bollite, con sale)" \
  --matrix-id=tubers --matrix-description-it="Tuberi" \
  --baseline-cooking-state=boiled --analogy-food-id=food_potato_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Germogli di fagiolo mungo, crudi — preparato 2026-10-23 dal task (ventisettesimo lotto)

- **food_id**: `food_germogli_fagiolo_mungo_raw`. FDC ID 169957 (SR Legacy, "Mung beans, mature seeds, sprouted, raw" — pagina getfoodfacts.com dedicata e pulita, release USDA 2026-04-30). **Nota terminologica**: nome scelto deliberatamente preciso ("fagiolo mungo", *Vigna radiata*) e non "germogli di soia" come spesso chiamati genericamente al dettaglio in Italia — i germogli comunemente venduti come "germogli di soia" sono quasi sempre germogli di fagiolo mungo, botanicamente distinti dalla soia vera (*Glycine max*, già coperta come semi secchi/tofu/edamame in questa coda); nessun record FDC per germogli di soia vera (*Glycine max* germogliata) trovato in questa ricerca, quindi questa voce rappresenta solo il fagiolo mungo, non un sinonimo della soia.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 30,0kcal, proteine 3,04g, grassi 0,18g, carboidrati 5,94g, fibra 1,80g, calcio 13,0mg, ferro 0,91mg, zinco 0,41mg, magnesio 21,0mg, rame 0,16mg, selenio 0,60µg, vitamina C 13,2mg, folato totale 61,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 33,0µg, beta-carotene 6,00µg, alfa-carotene 6,00µg, beta-criptoxantina 6,00µg (tutti piccoli ma reali e non nulli, coerenti con un germoglio verde). Sodio 6,00mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169957 e dataType SR Legacy.
- **Analogia usata**: `food_chickpeas_boiled` (ceci bolliti, Golden Set originale, già eseguito sul DB reale — stessa famiglia botanica reale Fabaceae, stesso gruppo "legume").
- **Categoria dieta**: `plant_non_fruit` (legume germogliato).
- **Matrice**: nuova `germogli_fagiolo_mungo` ("Germogli di fagiolo mungo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione dell'analogia), `carotenoid_matrix_state=raw_intact` (beta-carotene reale e non nullo, germoglio crudo non alterato da cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae` (famiglia reale del fagiolo mungo, *Vigna radiata* — stessa dell'analogia), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169957 --food-id=food_germogli_fagiolo_mungo_raw \
  --name-it="Germogli di fagiolo mungo, crudi" \
  --matrix-id=germogli_fagiolo_mungo --matrix-description-it="Germogli di fagiolo mungo" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_boiled \
  --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169957 --food-id=food_germogli_fagiolo_mungo_raw \
  --name-it="Germogli di fagiolo mungo, crudi" \
  --matrix-id=germogli_fagiolo_mungo --matrix-description-it="Germogli di fagiolo mungo" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_boiled \
  --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Alga spirulina, secca — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_alga_spirulina_raw`. FDC ID 170495 (SR Legacy, "Seaweed, spirulina, dried" — pagina getfoodfacts.com dedicata e pulita). Terza alga di questa pipeline dopo nori e wakame (quest'ultima preparata nello stesso turno, vedi sopra).
- **Nutrienti**: **17/17** (completo). Per 100g: energia 290kcal, proteine 57,5g (molto alta, coerente con la spirulina, nota fonte proteica concentrata), grassi 7,72g, carboidrati 23,9g, fibra 3,60g, calcio 120mg, ferro 28,5mg (alto), zinco 2,00mg, magnesio 195mg, rame 6,10mg (alto), selenio 7,20µg, vitamina C 10,1mg, folato totale 94,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 25,5µg, beta-carotene 342µg (reale e non nullo, coerente col pigmento dell'alga), alfa-carotene/beta-criptoxantina entrambi 0µg espliciti. Sodio 1048mg/100g (alto, coerente con un'alga secca — riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170495 e dataType SR Legacy.
- **Analogia usata**: `food_alga_nori_raw` (alga nori, Golden Set pipeline, già eseguita sul DB reale — stessa categoria "alga marina cruda/secca").
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `alga_spirulina` ("Alga spirulina").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (alga secca con beta-carotene reale non nullo, stessa convenzione di wakame appena preparata), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` NULL (nessuna vera famiglia botanica per un'alga/cianobatterio, stessa convenzione di nori/wakame), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170495 --food-id=food_alga_spirulina_raw \
  --name-it="Alga spirulina, secca" \
  --matrix-id=alga_spirulina --matrix-description-it="Alga spirulina" \
  --baseline-cooking-state=raw --analogy-food-id=food_alga_nori_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170495 --food-id=food_alga_spirulina_raw \
  --name-it="Alga spirulina, secca" \
  --matrix-id=alga_spirulina --matrix-description-it="Alga spirulina" \
  --baseline-cooking-state=raw --analogy-food-id=food_alga_nori_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit --apply
```

### Alga wakame, cruda — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_alga_wakame_raw`. FDC ID 170496 (SR Legacy, "Seaweed, wakame, raw" — pagina getfoodfacts.com dedicata e pulita). Seconda alga di questa pipeline dopo la nori, già eseguita.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 45,0kcal, proteine 3,03g, grassi 0,64g, carboidrati 9,14g, fibra 0,50g, calcio 150mg, ferro 2,18mg, zinco 0,38mg, magnesio 107mg, rame 0,28mg, selenio 0,70µg, vitamina C 3,00mg, folato totale 196µg (alto, coerente con un'alga), acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 5,30µg, beta-carotene 216µg (reale e non nullo, coerente col pigmento dell'alga), alfa-carotene/beta-criptoxantina entrambi 0µg espliciti. Sodio 872mg/100g (alto, coerente con un'alga marina — riferimento, non uno dei 17 tracciati). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170496 e dataType SR Legacy.
- **Analogia usata**: `food_alga_nori_raw` (alga nori, Golden Set pipeline, già eseguita sul DB reale — stessa categoria "alga marina cruda/secca"; prima volta in questa pipeline che un'alga ha un'altra alga, non una verdura generica, come analogia diretta).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `alga_wakame` ("Alga wakame").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (alga cruda/secca con beta-carotene reale non nullo, matrice non alterata da cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` NULL (nessuna vera famiglia botanica per un'alga, stessa convenzione di `food_alga_nori_raw`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170496 --food-id=food_alga_wakame_raw \
  --name-it="Alga wakame, cruda" \
  --matrix-id=alga_wakame --matrix-description-it="Alga wakame" \
  --baseline-cooking-state=raw --analogy-food-id=food_alga_nori_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170496 --food-id=food_alga_wakame_raw \
  --name-it="Alga wakame, cruda" \
  --matrix-id=alga_wakame --matrix-description-it="Alga wakame" \
  --baseline-cooking-state=raw --analogy-food-id=food_alga_nori_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit --apply
```

### Latticello (buttermilk), intero — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_latticello_raw`. FDC ID 172225 (SR Legacy, "Milk, buttermilk, fluid, whole" — pagina getfoodfacts.com dedicata e pulita). Distinto dal siero di latte dolce/acido già eseguiti: il latticello è il liquido residuo della burrificazione (sbattitura della panna), non della caseificazione — sottoprodotto diverso, non un duplicato.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 62,0kcal, proteine 3,21g, grassi 3,31g, carboidrati 4,88g, fibra 0g esplicito, calcio 115mg, ferro 0,030mg, zinco 0,38mg, magnesio 10,0mg, rame 0,025mg, selenio 3,70µg, vitamina C 0mg esplicito, folato totale 5,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0,46µg, vitamina K 0,30µg, beta-carotene 7,00µg, alfa-carotene/beta-criptoxantina entrambi 0µg espliciti. Sodio 105mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172225 e dataType SR Legacy.
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, Golden Set originale, già eseguito sul DB reale — stessa categoria "latte liquido animale", stessa convenzione già usata per latte di pecora/capra/bufala e siero dolce/acido in questa pipeline).
- **Categoria dieta**: `egg_dairy` (latte/derivato del latte).
- **Matrice**: nuova `latticello` ("Latticello (buttermilk)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium=medium_oxalate` (per analogia diretta con `food_milk_whole`), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172225 --food-id=food_latticello_raw \
  --name-it="Latticello (buttermilk), intero" \
  --matrix-id=latticello --matrix-description-it="Latticello (buttermilk)" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172225 --food-id=food_latticello_raw \
  --name-it="Latticello (buttermilk), intero" \
  --matrix-id=latticello --matrix-description-it="Latticello (buttermilk)" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
```

### Olio di avocado — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_olio_di_avocado_raw`. FDC ID 173573 (SR Legacy, "Oil, avocado" — pagina getfoodfacts.com dedicata e pulita). **Nota di trasparenza su categoria dieta**: distinto dall'avocado intero (`⚠` in coda, lotto 19, per ambiguità fresh_fruit/plant_non_fruit — avocado botanicamente un frutto ma nutrizionalmente/culinariamente un grasso). L'olio NON eredita quell'ambiguità: è un grasso vegetale puro (0g carboidrati, 0g proteine, 100g grassi/100g), rientra senza dubbio nella definizione di "oli vegetali" della categoria `plant_non_fruit` usata per ogni altro olio di questa pipeline (palma, cocco, girasole, colza), indipendentemente da come si classifichi il frutto intero da cui proviene.
- **Nutrienti**: **14/17** — mancano vitamina K, beta-carotene e l'altro carotenoide provitaminico A (alfa-carotene/beta-criptoxantina; nessuno riportato nel record, nessuno assunto zero). Per 100g (valori presenti): energia 884kcal, proteine 0g esplicito, grassi 100g esplicito, carboidrati 0g esplicito, fibra 0g esplicito, calcio 0mg esplicito, ferro 0mg esplicito, zinco 0mg esplicito, magnesio 0mg esplicito, rame 0mg esplicito, selenio 0µg esplicito, vitamina C 0mg esplicito, folato totale 0µg esplicito, acido folico 0µg esplicito, vitamina B12 0µg esplicito. Sodio 0mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173573 e dataType SR Legacy.
- **Analogia usata**: `food_olio_di_palma_raw` (olio di palma, Golden Set pipeline, già eseguito sul DB reale — analogia **funzionale**, "olio vegetale puro raffinato", non botanica: la palma è Arecaceae, l'avocado è Lauraceae).
- **Categoria dieta**: `plant_non_fruit` (olio vegetale — vedi nota di trasparenza sopra).
- **Matrice**: nuova `olio_di_avocado` ("Olio di avocado").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lauraceae` (famiglia botanica REALE dell'avocado, *Persea americana*, per riferimento tassonomico — non usata per la categoria dieta), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=173573 --food-id=food_olio_di_avocado_raw \
  --name-it="Olio di avocado" \
  --matrix-id=olio_di_avocado --matrix-description-it="Olio di avocado" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_palma_raw \
  --botanical-family=Lauraceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173573 --food-id=food_olio_di_avocado_raw \
  --name-it="Olio di avocado" \
  --matrix-id=olio_di_avocado --matrix-description-it="Olio di avocado" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_palma_raw \
  --botanical-family=Lauraceae --diet-category=plant_non_fruit --apply
```

### Olio di nocciola — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_olio_di_nocciola_raw`. FDC ID 171427 (SR Legacy, "Oil, hazelnut" — pagina getfoodfacts.com dedicata e pulita). Distinto da `food_nocciole_raw`/`food_nocciole_tostate` (seme intero, già eseguiti): l'olio è il grasso estratto, un prodotto distinto con un proprio record FDC, stessa convenzione già usata per olio di cocco/palma rispetto al seme/frutto intero.
- **Nutrienti**: **15/17** — mancano rame e vitamina K (non riportati nel record, non assunti zero). Per 100g (valori presenti): energia 884kcal, proteine 0g esplicito, grassi 100g esplicito, carboidrati 0g esplicito, fibra 0g esplicito, calcio 0mg esplicito, ferro 0mg esplicito, zinco 0mg esplicito, magnesio 0mg esplicito, selenio 0µg esplicito, vitamina C 0mg esplicito, folato totale 0µg esplicito, acido folico 0µg esplicito, vitamina B12 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti (coerente con un grasso puro raffinato). Sodio 0mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171427 e dataType SR Legacy.
- **Analogia usata**: `food_nocciole_raw` (nocciole secche, Golden Set pipeline, già eseguite sul DB reale — stessa pianta *Corylus avellana*, stessa famiglia botanica reale Betulaceae, prodotto derivato diverso: olio estratto vs seme intero).
- **Categoria dieta**: `plant_non_fruit` (olio vegetale).
- **Matrice**: nuova `olio_di_nocciola` ("Olio di nocciola").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi tutti 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Betulaceae` (stessa di `food_nocciole_raw`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171427 --food-id=food_olio_di_nocciola_raw \
  --name-it="Olio di nocciola" \
  --matrix-id=olio_di_nocciola --matrix-description-it="Olio di nocciola" \
  --baseline-cooking-state=raw --analogy-food-id=food_nocciole_raw \
  --botanical-family=Betulaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=171427 --food-id=food_olio_di_nocciola_raw \
  --name-it="Olio di nocciola" \
  --matrix-id=olio_di_nocciola --matrix-description-it="Olio di nocciola" \
  --baseline-cooking-state=raw --analogy-food-id=food_nocciole_raw \
  --botanical-family=Betulaceae --diet-category=plant_non_fruit --apply
```

### Tapioca, perle secche — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_tapioca_perle_raw`. FDC ID 169717 (SR Legacy, "Tapioca, pearl, dry" — pagina getfoodfacts.com dedicata e pulita). Amido estratto dalla radice di manioca (*Manihot esculenta*), nessun alimento a base di manioca già presente in questa pipeline.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 358kcal, proteine 0,19g, grassi 0,020g, carboidrati 88,7g, fibra 0,90g, calcio 20,0mg, ferro 1,58mg, zinco 0,12mg, magnesio 1,00mg, rame 0,020mg, selenio 0,80µg, vitamina C 0mg esplicito, folato totale 4,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti (coerente con un amido puro). Sodio 1,00mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169717 e dataType SR Legacy.
- **Analogia usata**: `food_riso_bianco_raw` (riso bianco crudo, Golden Set pipeline, già eseguito sul DB reale — analogia **funzionale** di categoria, "carboidrato raffinato puro con pochi micronutrienti", non botanica: il riso è Poaceae, la manioca è Euphorbiaceae, nessuna parentela reale, come già per patata dolce/patata comune in un lotto precedente).
- **Categoria dieta**: `plant_non_fruit` (amido vegetale).
- **Matrice**: nuova `tapioca_perle` ("Tapioca, perle secche").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi tutti 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Euphorbiaceae` (famiglia botanica REALE della manioca, non quella dell'analogia funzionale), `baseline_cooking_state=raw` (perle secche, non cotte), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169717 --food-id=food_tapioca_perle_raw \
  --name-it="Tapioca, perle secche" \
  --matrix-id=tapioca_perle --matrix-description-it="Tapioca, perle secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_bianco_raw \
  --botanical-family=Euphorbiaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169717 --food-id=food_tapioca_perle_raw \
  --name-it="Tapioca, perle secche" \
  --matrix-id=tapioca_perle --matrix-description-it="Tapioca, perle secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_bianco_raw \
  --botanical-family=Euphorbiaceae --diet-category=plant_non_fruit --apply
```

### Crusca di riso, cruda — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_crusca_di_riso_raw`. FDC ID 169713 (SR Legacy, "Rice bran, crude" — pagina getfoodfacts.com dedicata e pulita). Distinta da `food_riso_integrale_raw`/`food_riso_bianco_raw` (chicco intero, già eseguiti): la crusca è lo strato esterno separato, un sottoprodotto distinto con un proprio record FDC, stessa convenzione già usata per crusca d'avena/frumento in un lotto precedente.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 316kcal, proteine 13,3g, grassi 20,9g, carboidrati 49,7g, fibra 21,0g (molto alta, coerente con una crusca concentrata), calcio 57,0mg, ferro 18,5mg, zinco 6,04mg, magnesio 781mg (alto, coerente con una crusca di cereale), rame 0,73mg, selenio 15,6µg, vitamina C 0mg esplicito, folato totale 63,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 1,90µg, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Sodio 5,00mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169713 e dataType SR Legacy.
- **Analogia usata**: `food_riso_integrale_raw` (riso integrale crudo, Golden Set pipeline, già eseguito sul DB reale — stessa pianta *Oryza sativa*, stessa famiglia botanica reale Poaceae, parte diversa della stessa pianta: crusca invece di chicco integrale).
- **Categoria dieta**: `plant_non_fruit` (derivato di cereale).
- **Matrice**: nuova `crusca_di_riso` ("Crusca di riso").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi tutti 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (stessa di `food_riso_integrale_raw`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169713 --food-id=food_crusca_di_riso_raw \
  --name-it="Crusca di riso, cruda" \
  --matrix-id=crusca_di_riso --matrix-description-it="Crusca di riso" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169713 --food-id=food_crusca_di_riso_raw \
  --name-it="Crusca di riso, cruda" \
  --matrix-id=crusca_di_riso --matrix-description-it="Crusca di riso" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Farina di orzo, cruda — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_farina_di_orzo_raw`. FDC ID 2512376 (Foundation Foods, "Flour, barley" — pagina getfoodfacts.com dedicata e pulita). Distinta da `food_orzo_perlato_raw`/`food_orzo_perlato_cotto` (chicco perlato, già eseguiti): la farina è il prodotto macinato, un alimento distinto con un proprio record FDC.
- **Nutrienti**: **10/17** — mancano energy (il record Foundation non riporta una riga diretta per il nutriente "Energy" in kcal: la pagina mostra solo cifre di pannello/etichetta derivate e fra loro discordanti, 360 vs 357 — stesso schema già visto per `food_farina_di_cocco_raw`, altra farina Foundation Foods priva di energy fra i 17), vitamin_c, folate, vitamin_b12, vitamin_k, beta_carotene, other_provitamin_a_carotenoids (nessuno di questi riportato nel record, nessuno assunto zero). Per 100g (valori presenti): proteine 8,72g, grassi 2,45g, carboidrati 77,4g, fibra 12,8g, calcio 35,6mg, ferro 3,30mg, zinco 2,14mg, magnesio 88,0mg, rame 0,39mg, selenio 13,1µg. Sodio 20,3mg/100g (riferimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 2512376 e dataType Foundation Foods.
- **Analogia usata**: `food_orzo_perlato_raw` (orzo perlato crudo, Golden Set pipeline, già eseguito sul DB reale — stessa pianta *Hordeum vulgare*, stessa famiglia botanica reale Poaceae, prodotto derivato diverso: farina macinata vs chicco perlato).
- **Categoria dieta**: `plant_non_fruit` (derivato di cereale).
- **Matrice**: nuova `farina_di_orzo` ("Farina di orzo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna base per una categoria ossalati), `carotenoid_matrix_state` omesso (NULL — non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (stessa di `food_orzo_perlato_raw`), `baseline_cooking_state=raw` (farina cruda, non cotta), `is_fortified_folate` omesso (false — nessuna dicitura "enriched" nel nome, nessun segnale di arricchimento).

```
npm run add-food -- --fdc-id=2512376 --food-id=food_farina_di_orzo_raw \
  --name-it="Farina di orzo, cruda" \
  --matrix-id=farina_di_orzo --matrix-description-it="Farina di orzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=2512376 --food-id=food_farina_di_orzo_raw \
  --name-it="Farina di orzo, cruda" \
  --matrix-id=farina_di_orzo --matrix-description-it="Farina di orzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Amido di mais (maizena), crudo — preparato 2026-10-23 dal task orario (ventiseiesimo lotto)

- **food_id**: `food_amido_di_mais_raw`. FDC ID 169698 (SR Legacy, "Cornstarch" — pagina getfoodfacts.com dedicata e pulita). Distinto da `food_farina_di_mais_raw` (farina di mais integrale per polenta, già eseguita): l'amido è l'estratto puro di carboidrato, privo di crusca/germe, un prodotto distinto con un proprio record FDC, non un duplicato.
- **Nutrienti**: **17/17** (completo). Per 100g: energia 381kcal, proteine 0,26g, grassi 0,050g, carboidrati 91,3g, fibra 0,90g, calcio 2,00mg, ferro 0,47mg, zinco 0,060mg, magnesio 3,00mg, rame 0,050mg, selenio 2,80µg, vitamina C 0mg esplicito, folato totale 0µg esplicito, acido folico 0µg esplicito (nessuna firma di arricchimento), vitamina B12 0µg esplicito, vitamina K 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti (coerente con un amido puro, privo di pigmenti). Sodio 9,00mg/100g (riferimento, non uno dei 17 tracciati). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169698 e dataType SR Legacy.
- **Analogia usata**: `food_farina_di_mais_raw` (farina di mais integrale, Golden Set pipeline, già eseguita sul DB reale — stessa pianta *Zea mays*, stessa famiglia botanica reale Poaceae, prodotto derivato diverso: amido puro estratto vs farina integrale macinata).
- **Categoria dieta**: `plant_non_fruit` (derivato di cereale).
- **Matrice**: nuova `amido_di_mais` ("Amido di mais (maizena)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — calcio quasi nullo, nessuna base per una categoria ossalati), `carotenoid_matrix_state` omesso (NULL — carotenoidi tutti 0µg espliciti), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (stessa di `food_farina_di_mais_raw`), `baseline_cooking_state=raw` (polvere cruda, non cotta), `is_fortified_folate` omesso (false — acido folico 0µg esplicito, nessuna dicitura "enriched").

```
npm run add-food -- --fdc-id=169698 --food-id=food_amido_di_mais_raw \
  --name-it="Amido di mais (maizena), crudo" \
  --matrix-id=amido_di_mais --matrix-description-it="Amido di mais (maizena)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169698 --food-id=food_amido_di_mais_raw \
  --name-it="Amido di mais (maizena), crudo" \
  --matrix-id=amido_di_mais --matrix-description-it="Amido di mais (maizena)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

## Eseguiti (archivio, ultimi 10)

> **Nota (2026-10-13) sulla classificazione dieta degli alimenti qui sotto.** Dalla melanzana in giù in questa lista, sono stati inseriti con la versione di `add-food` precedente alla correzione `--diet-category`: le loro tre colonne `diet_compat_*` risultavano quindi NULL ("non classificato", escluse dai filtri vegetariano/vegano/fruttariano) finche' non e' stato eseguito `fix_diet_compat_pipeline_foods.sql` (**eseguito il 2026-10-13**: l'utente ha confermato a voce che la query di controllo non mostra piu' nessuno di loro come non classificato, senza screenshot rivisto da questa sessione). **Le zucchine, appena sotto, sono il primo alimento eseguito già con `--diet-category` incluso dall'inizio** (diet=plant_non_fruit scritto direttamente, verificato nel riepilogo di scrittura): non serve alcun fix per loro.

### 275 alimenti in dieci lotti (06–15, più una riprova) — ✅ eseguiti la sera 2026-10-22 (verificato: 275/275 presenti)

**Esito.** Preparati dal task orario tra il 2026-10-15 e il 2026-10-22 (voci "Pronti" di quei giorni), eseguiti dall'utente la sera del 2026-10-22 sul suo PC (PowerShell) a **dieci lotti da 27–28 alimenti**: cartella `lotti_alimenti/`, file `lotto_06_applica.txt` … `lotto_15_applica.txt` (con `--apply`), più `lotto_16_riprova.txt` (un solo alimento). I log reali sono `esito_lotto_NN_applica.txt` e `esito_lotto_16_riprova.txt` nella stessa cartella. **Questa volta senza dry-run** (decisione presa con l'utente per risparmiare tempo): lo script si ferma da solo prima di scrivere se qualcosa non va, gli alimenti entrano come `draft` (l'app mostra solo i `verified`) e il controllo finale confronta ogni riga con quanto atteso. Ordine: dalla voce "Pronti" più vecchia alla più recente. Il primo tentativo del lotto 06 è fallito per intero con `fetch failed` (il progetto Supabase era in pausa per inattività: dopo il ripristino nulla era stato scritto); al secondo tentativo **274 su 275 sono entrati**, la noce di cocco ha avuto un timeout di rete ed è stata rifatta con `lotto_16_riprova.txt` (17/17, verifica difensiva passata).

**Verifica indipendente** con `check_alimenti_serie2.sql` (sola lettura, nel repo): RIEPILOGO **OK=273, DA CONTROLLARE=2, NON PRESENTE=0**. I 2 "DA CONTROLLARE" (`food_bistecca_di_manzo_raw` e `food_bistecca_di_manzo_cotta`) sono un **falso allarme**: il database contiene i record FDC giusti (174055 e 168634, nomi interi letti dai log: "…trimmed to 1/8\" fat, all grades, raw" e "…trimmed to 0\" fat, all grades, cooked, broiled"); il testo atteso nel controllo era stato troncato dal parser al segno `\"` del pollice. Tutti i 275 restano `draft`; con i 153 delle notti precedenti gli alimenti inseriti dalla pipeline sono ora **428**, tutti `draft`.

**Numeri.** Nutrienti trovati su 17: 17/17 → 180; 16/17 → 2; 15/17 → 3; 14/17 → 72; 13/17 → 9; 12/17 → 6; 11/17 → 1; 10/17 → 1; 9/17 → 1. Categoria dieta: plant_non_fruit 137, meat_fish 98, egg_dairy 26, fresh_fruit 14.

**Alimenti con meno di 13/17 nutrienti** (inseriti lo stesso, per decisione dell'utente del 2026-10-22): `food_funghi_shiitake_raw` 12/17 (mancano: beta_carotene, vitamin_c, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids); `food_farina_di_cocco_raw` 10/17 (mancano: energy, beta_carotene, vitamin_c, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids); `food_amaranto_cotto` 12/17 (mancano: beta_carotene, vitamin_c, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids); `food_semi_di_finocchio_raw` 12/17 (mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids); `food_aneto_raw` 12/17 (mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids); `food_cardamomo_raw` 12/17 (mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids); `food_succo_di_pompelmo_rosa_raw` 12/17 (mancano: fiber, selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids); `food_farina_di_castagne_raw` 11/17 (mancano: energy, beta_carotene, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids); `food_riso_venere_raw` 9/17 (mancano: energy, selenium, beta_carotene, vitamin_c, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids). Altri alimenti hanno 13 o più nutrienti: i mancanti sono quasi sempre vitamina K, beta-carotene e altri carotenoidi, elencati nella colonna Note della tabella. **Politica sui nutrienti mancanti (decisione dell'utente, 2026-10-22):** devono essere riconoscibili come "dato non disponibile in letteratura", non come "vale zero". Nel database questo è già garantito: lo script non scrive nessuna riga per un nutriente non trovato (mai uno zero finto). **Lacuna nell'app, ancora da correggere**: `nutrientValue()` in `app/page.tsx` restituisce 0 quando la riga manca e l'interfaccia non segnala che il dato manca; va corretta (segnalazione "dato non disponibile" e nessun conteggio come zero nei calcoli) **prima** di promuovere a `verified` gli alimenti con nutrienti mancanti.

**Da sapere.** Le 5 voci con un nutriente in meno rispetto alla scheda del task (farina di cocco 10 invece di 11, semi di sesamo tostati 14 invece di 15, farina di castagne 11 invece di 12, fegato di agnello 14 invece di 15, riso venere 9 invece di 10) sono state accettate: il numero reale è quello trovato da FDC. Gli attributi categorici (`carotenoid_matrix_state`, `is_heme_iron`, ecc.) sono nella colonna Note, ricavati dai comandi eseguiti. Le varianti cotte sono tutte incluse (decisione dell'utente: le persone devono poter scegliere il proprio tipo di cottura anche quando i valori cambiano poco).

**Cosa NON è in questa sezione.** Il testo completo delle 275 voci (ragionamento sulla scelta del record FDC, note sull'analogia, comandi dry-run e apply uno per uno) non è stato copiato qui per non appesantire il file; resta nella cronologia git: `git show cacb1e5:docs/GOLDEN_SET_READY_TO_RUN.md`. I comandi eseguiti sono anche nei file `lotti_alimenti/lotto_NN_applica.txt`.

**Elenco dei 275 alimenti.** Lotto = numero del file `lotto_NN_applica.txt` (06→16 = riprovato nel lotto 16); "Nutrienti" = quanti ne ha inseriti lo script (dal log); "Attributi" = flag dei comandi eseguiti.

| Lotto | food_id | FDC — nome nel log | Nutrienti | Dieta | Analogia | Attributi e note |
|---|---|---|---|---|---|---|
| 06 | `food_semolino_di_grano_duro_raw` | 168933 — Semolina, unenriched | 13/17 | plant_non_fruit | `food_farina_di_frumento_integrale_raw` | cottura=raw; bot=Poaceae; matrice=semolino_di_grano_duro; mancano: selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 06 | `food_fagioli_cannellini_secchi_raw` | 175202 — Beans, white, mature seeds, raw | 17/17 | plant_non_fruit | `food_kidney_beans_raw` | cottura=raw; bot=Fabaceae; matrice=legumes |
| 06 | `food_fagioli_azuki_raw` | 173727 — Beans, adzuki, mature seeds, raw | 14/17 | plant_non_fruit | `food_kidney_beans_raw` | cottura=raw; bot=Fabaceae; matrice=legumes; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 06 | `food_taccole_raw` | 170010 — Peas, edible-podded, raw | 17/17 | plant_non_fruit | `food_peas_green_raw` | cottura=raw; carot=raw_intact; bot=Fabaceae; matrice=taccole |
| 06 | `food_cicoria_selvatica_raw` | 169992 — Chicory greens, raw | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Asteraceae; matrice=cicoria_selvatica |
| 06 | `food_cuore_di_pollo_raw` | 171458 — Chicken, heart, all classes, raw | 14/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=cuore_di_pollo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 06 | `food_rognone_di_manzo_raw` | 169449 — Beef, variety meats and by-products, kidneys, raw | 17/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=rognone_di_manzo |
| 06 | `food_pesce_persico_raw` | 173678 — Fish, perch, mixed species, raw | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=pesce_persico |
| 06 | `food_capesante_raw` | 174220 — Mollusks, scallop, mixed species, raw | 17/17 | meat_fish | `food_vongole_raw` | cottura=raw; heme; matrice=capesante |
| 06 | `food_farina_frumento_00_raw` | 169761 — Wheat flour, white, all-purpose, unenriched | 17/17 | plant_non_fruit | `food_farina_di_frumento_integrale_raw` | cottura=raw; bot=Poaceae; matrice=farina_frumento_00 |
| 06 | `food_bulgur_raw` | 170688 — Bulgur, dry | 17/17 | plant_non_fruit | `food_farina_di_frumento_integrale_raw` | cottura=raw; carot=raw_intact; bot=Poaceae; matrice=bulgur |
| 06 | `food_ribes_rosso_raw` | 173964 — Currants, red and white, raw | 17/17 | fresh_fruit | `food_mirtilli_raw` | cottura=raw; carot=raw_intact; bot=Grossulariaceae; matrice=ribes_rosso |
| 06 | `food_mela_cotogna_raw` | 168163 — Quinces, raw | 14/17 | fresh_fruit | `food_pear_raw` | cottura=raw; bot=Rosaceae; matrice=mela_cotogna; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 06 | `food_frutto_della_passione_raw` | 169108 — Passion-fruit, (granadilla), purple, raw | 17/17 | fresh_fruit | `food_mango_raw` | cottura=raw; carot=raw_intact; bot=Passifloraceae; matrice=frutto_della_passione |
| 06 | `food_guava_raw` | 173044 — Guavas, common, raw | 17/17 | fresh_fruit | `food_papaya_raw` | cottura=raw; carot=raw_intact; bot=Myrtaceae; matrice=guava |
| 06→16 | `food_noce_di_cocco_raw` | 170169 — Nuts, coconut meat, raw | 17/17 | plant_non_fruit | `food_noci_raw` | cottura=raw; bot=Arecaceae; matrice=noce_di_cocco |
| 06 | `food_prezzemolo_raw` | 170416 — Parsley, fresh | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Apiaceae; matrice=prezzemolo |
| 06 | `food_basilico_raw` | 172232 — Basil, fresh | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=basilico |
| 06 | `food_panna_da_cucina_raw` | 170857 — Cream, fluid, light (coffee cream or table cream) | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; matrice=panna_da_cucina |
| 06 | `food_latte_scremato_raw` | 171269 — Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim) | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; matrice=dairy_milk |
| 06 | `food_yogurt_magro_raw` | 170887 — Yogurt, plain, skim milk | 17/17 | egg_dairy | `food_yogurt_bianco_intero` | cottura=raw; matrice=yogurt_magro |
| 06 | `food_olio_di_colza_raw` | 172336 — Oil, canola | 17/17 | plant_non_fruit | `food_burro` | cottura=raw; matrice=olio_di_colza |
| 06 | `food_farina_di_segale_integrale_raw` | 168885 — Rye flour, dark | 17/17 | plant_non_fruit | `food_segale_raw` | cottura=raw; carot=raw_intact; bot=Poaceae; matrice=farina_di_segale_integrale |
| 06 | `food_farina_di_avena_raw` | 169741 — Oat flour, partially debranned | 17/17 | plant_non_fruit | `food_avena_cruda` | cottura=raw; bot=Poaceae; matrice=farina_di_avena |
| 06 | `food_farina_di_riso_integrale_raw` | 168898 — Rice flour, brown | 13/17 | plant_non_fruit | `food_riso_integrale_raw` | cottura=raw; bot=Poaceae; matrice=farina_di_riso_integrale; mancano: selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 06 | `food_crusca_di_avena_raw` | 168872 — Oat bran, raw | 17/17 | plant_non_fruit | `food_avena_cruda` | cottura=raw; bot=Poaceae; matrice=crusca_di_avena |
| 06 | `food_merluzzo_cotto` | 171956 — Fish, cod, Atlantic, cooked, dry heat | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=dry_heat_cooked; heme; matrice=merluzzo |
| 06 | `food_nettarine_raw` | 169914 — Nectarines, raw | 17/17 | fresh_fruit | `food_peach_yellow_raw` | cottura=raw; carot=raw_intact; bot=Rosaceae; matrice=nettarine |
| 07 | `food_mirtilli_rossi_raw` | 171722 — Cranberries, raw | 17/17 | fresh_fruit | `food_mirtilli_raw` | cottura=raw; carot=raw_intact; bot=Ericaceae; matrice=mirtilli_rossi |
| 07 | `food_zenzero_raw` | 169231 — Ginger root, raw | 17/17 | plant_non_fruit | `food_carrots_raw` | cottura=raw; bot=Zingiberaceae; matrice=zenzero |
| 07 | `food_zucca_butternut_raw` | 169295 — Squash, winter, butternut, raw | 17/17 | plant_non_fruit | `food_pumpkin_raw` | cottura=raw; carot=raw_intact; bot=Cucurbitaceae; matrice=zucca_butternut |
| 07 | `food_astice_raw` | 174208 — Crustaceans, lobster, northern, raw | 17/17 | meat_fish | `food_vongole_raw` | cottura=raw; heme; matrice=astice |
| 07 | `food_granchio_raw` | 174204 — Crustaceans, crab, blue, raw | 14/17 | meat_fish | `food_vongole_raw` | cottura=raw; heme; matrice=granchio; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_ostriche_raw` | 175172 — Mollusks, oyster, eastern, farmed, raw | 14/17 | meat_fish | `food_vongole_raw` | cottura=raw; heme; matrice=ostriche; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_formaggio_svizzero_raw` | 171251 — Cheese, swiss | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=formaggio_svizzero |
| 07 | `food_semi_di_papavero_raw` | 171330 — Spices, poppy seed | 17/17 | plant_non_fruit | `food_semi_di_sesamo_raw` | cottura=raw; bot=Papaveraceae; matrice=semi_di_papavero |
| 07 | `food_funghi_shiitake_raw` | 169242 — Mushrooms, shiitake, raw | 12/17 | plant_non_fruit | `food_mushroom_white_raw` | cottura=raw; matrice=funghi_shiitake; mancano: beta_carotene, vitamin_c, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_pasta_integrale_raw` | 169738 — Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program) | 14/17 | plant_non_fruit | `food_pasta_enriched_dry` | cottura=raw; bot=Poaceae; matrice=pasta_integrale_non_arricchita; mancano: beta_carotene, vitamin_c, other_provitamin_a_carotenoids |
| 07 | `food_fagioli_borlotti_secchi_raw` | 175189 — Beans, cranberry (roman), mature seeds, raw | 14/17 | plant_non_fruit | `food_fagioli_borlotti_bolliti` | cottura=raw; bot=Fabaceae; matrice=fagioli_borlotti_secchi; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_farina_di_carruba_raw` | 173755 — Carob flour | 17/17 | plant_non_fruit | `food_farina_di_ceci_raw` | cottura=raw; carot=raw_intact; bot=Fabaceae; matrice=farina_di_carruba |
| 07 | `food_crescione_raw` | 170068 — Watercress, raw | 17/17 | plant_non_fruit | `food_kale_raw` | cottura=raw; carot=raw_intact; ca=low_oxalate; bot=Brassicaceae; matrice=crescione |
| 07 | `food_menta_raw` | 173475 — Spearmint, fresh | 13/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Lamiaceae; matrice=menta; mancano: selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_peperoncino_verde_raw` | 170497 — Peppers, hot chili, green, raw | 17/17 | plant_non_fruit | `food_pepper_green_raw` | cottura=raw; carot=raw_intact; bot=Solanaceae; matrice=peperoncino_verde |
| 07 | `food_erba_cipollina_raw` | 169994 — Chives, raw | 17/17 | plant_non_fruit | `food_onion_raw` | cottura=raw; carot=raw_intact; bot=Amaryllidaceae; matrice=erba_cipollina |
| 07 | `food_farina_di_cocco_raw` | 2515382 — Flour, coconut | 10/17 | plant_non_fruit | `food_farina_di_mais_raw` | cottura=raw; bot=Arecaceae; matrice=farina_di_cocco; mancano: energy, beta_carotene, vitamin_c, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_bistecca_di_manzo_raw` | 174055 — Beef, top sirloin, steak, separable lean only, trimmed to 1/8" fat, all grades, raw | 17/17 | meat_fish | `food_beef_ground_raw` | cottura=raw; heme; matrice=bistecca_di_manzo |
| 07 | `food_olio_di_semi_di_lino_raw` | 167702 — Oil, flaxseed, cold pressed | 17/17 | plant_non_fruit | `food_olio_di_girasole_raw` | cottura=raw; bot=Linaceae; matrice=olio_di_semi_di_lino |
| 07 | `food_melassa` | 168820 — Molasses | 17/17 | plant_non_fruit | `food_zucchero_di_canna_raw` | cottura=raw; matrice=melassa |
| 07 | `food_origano_secco_raw` | 171328 — Spices, oregano, dried | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=origano_secco |
| 07 | `food_rosmarino_secco_raw` | 171333 — Spices, rosemary, dried | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Lamiaceae; matrice=rosmarino_secco; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_cannella_raw` | 171320 — Spices, cinnamon, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lauraceae; matrice=cannella |
| 07 | `food_timo_secco_raw` | 170938 — Spices, thyme, dried | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=timo_secco |
| 07 | `food_salvia_raw` | 170935 — Spices, sage, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=salvia_secca |
| 07 | `food_pepe_nero_raw` | 170931 — Spices, pepper, black | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Piperaceae; matrice=pepe_nero |
| 07 | `food_zafferano_raw` | 170934 — Spices, saffron | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Iridaceae; matrice=zafferano; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 07 | `food_curcuma_raw` | 172231 — Spices, turmeric, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Zingiberaceae; matrice=curcuma |
| 08 | `food_petto_di_tacchino_cotto` | 174516 — Turkey, retail parts, breast, meat only, cooked, roasted | 17/17 | meat_fish | `food_petto_di_tacchino_raw` | cottura=roasted; heme; matrice=petto_di_tacchino_cotto |
| 08 | `food_lonza_di_maiale_cotta` | 168233 — Pork, fresh, loin, whole, separable lean only, cooked, roasted | 17/17 | meat_fish | `food_lonza_di_maiale_raw` | cottura=roasted; heme; matrice=lonza_di_maiale_cotta |
| 08 | `food_vitello_cotto` | 175265 — Veal, composite of trimmed retail cuts, separable lean only, cooked | 17/17 | meat_fish | `food_vitello_raw` | cottura=cooked; heme; matrice=vitello_cotto |
| 08 | `food_polpo_cotto` | 174249 — Mollusks, octopus, common, cooked, moist heat | 17/17 | meat_fish | `food_polpo_raw` | cottura=boiled; heme; matrice=polpo_cotto |
| 08 | `food_pesce_spada_cotto` | 173704 — Fish, swordfish, cooked, dry heat | 17/17 | meat_fish | `food_pesce_spada_raw` | cottura=dry_heat_cooked; heme; matrice=pesce_spada_cotto |
| 08 | `food_vongole_cotte` | 171975 — Mollusks, clam, mixed species, cooked, moist heat | 14/17 | meat_fish | `food_vongole_raw` | cottura=boiled; heme; matrice=vongole_cotte; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 08 | `food_cozze_cotte` | 174217 — Mollusks, mussel, blue, cooked, moist heat | 14/17 | meat_fish | `food_cozze_raw` | cottura=boiled; heme; matrice=cozze_cotte; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 08 | `food_quinoa_cotta` | 168917 — Quinoa, cooked | 17/17 | plant_non_fruit | `food_quinoa_dry_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Amaranthaceae; matrice=quinoa_cotta |
| 08 | `food_riso_integrale_cotto` | 169704 — Rice, brown, long-grain, cooked (Includes foods for USDA's Food Distribution Program) | 17/17 | plant_non_fruit | `food_riso_integrale_raw` | cottura=boiled; bot=Poaceae; matrice=riso_integrale_cotto |
| 08 | `food_orzo_perlato_cotto` | 170285 — Barley, pearled, cooked | 17/17 | plant_non_fruit | `food_orzo_perlato_raw` | cottura=boiled; bot=Poaceae; matrice=orzo_perlato_cotto |
| 08 | `food_zucchine_cotte` | 169292 — Squash, summer, zucchini, includes skin, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_zucchine_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Cucurbitaceae; matrice=zucchine_cotte |
| 08 | `food_asparagi_cotti` | 168390 — Asparagus, cooked, boiled, drained | 17/17 | plant_non_fruit | `food_asparagi_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Asparagaceae; matrice=asparagi_cotti |
| 08 | `food_fagiolini_cotti` | 169141 — Beans, snap, green, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_fagiolini_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Fabaceae; matrice=fagiolini_cotti |
| 08 | `food_porri_cotti` | 168426 — Leeks, (bulb and lower leaf-portion), cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_porri_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Amaryllidaceae; matrice=porri_cotti |
| 08 | `food_sedano_cotto` | 169989 — Celery, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_sedano_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Apiaceae; matrice=sedano_cotto |
| 08 | `food_funghi_champignon_cotti` | 169252 — Mushrooms, white, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_mushroom_white_raw` | cottura=boiled; matrice=funghi_champignon_cotti |
| 08 | `food_pasta_integrale_cotta` | 168910 — Pasta, whole-wheat, cooked (Includes foods for USDA's Food Distribution Program) | 17/17 | plant_non_fruit | `food_pasta_enriched_cooked` | cottura=boiled; bot=Poaceae; matrice=pasta_integrale_cotta |
| 08 | `food_melanzane_cotte` | 169229 — Eggplant, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_melanzane_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Solanaceae; matrice=melanzane_cotte |
| 08 | `food_peperoni_rossi_cotti` | 170515 — Peppers, sweet, red, cooked, boiled, drained, with salt | 17/17 | plant_non_fruit | `food_pepper_red_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Solanaceae; matrice=peperoni_rossi_cotti |
| 08 | `food_cipolle_cotte` | 170001 — Onions, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_onion_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Amaryllidaceae; matrice=cipolle_cotte |
| 08 | `food_cavolfiore_cotto` | 170397 — Cauliflower, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_broccoli_boiled` | cottura=boiled; carot=cooked_or_disrupted; bot=Brassicaceae; matrice=cavolfiore_cotto |
| 08 | `food_patata_dolce_cotta` | 170134 — Sweet potato, cooked, baked in skin, flesh, with salt | 15/17 | plant_non_fruit | `food_patata_dolce_raw` | cottura=baked; bot=Convolvulaceae; matrice=patata_dolce_cotta; mancano: beta_carotene, other_provitamin_a_carotenoids |
| 08 | `food_carciofi_cotti` | 168386 — Artichokes, (globe or french), cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_carciofi_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Asteraceae; matrice=carciofi_cotti |
| 08 | `food_bietole_da_costa_cotte` | 169343 — Chard, swiss, cooked, boiled, drained, with salt | 17/17 | plant_non_fruit | `food_bietole_da_costa_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Amaranthaceae; matrice=bietole_da_costa_cotte |
| 08 | `food_verza_cotta` | 168516 — Cabbage, savoy, cooked, boiled, drained, with salt | 14/17 | plant_non_fruit | `food_verza_raw` | cottura=boiled; bot=Brassicaceae; matrice=verza_cotta; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 08 | `food_agnello_cotto` | 174339 — Lamb, New Zealand, imported, frozen, composite of trimmed retail cuts, separable lean only, cooked | 14/17 | meat_fish | `food_agnello_raw` | cottura=cooked; heme; matrice=agnello_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 08 | `food_coniglio_cotto` | 172522 — Game meat, rabbit, domesticated, composite of cuts, cooked, roasted | 14/17 | meat_fish | `food_coniglio_raw` | cottura=roasted; heme; matrice=coniglio_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 08 | `food_anatra_cotta` | 172411 — Duck, domesticated, meat only, cooked, roasted | 17/17 | meat_fish | `food_anatra_raw` | cottura=roasted; heme; matrice=anatra_cotta |
| 09 | `food_coscia_di_pollo_cotta` | 172853 — Chicken, broilers or fryers, dark meat, thigh, meat only, cooked, braised | 17/17 | meat_fish | `food_coscia_di_pollo_raw` | cottura=braised; heme; matrice=coscia_di_pollo_cotta |
| 09 | `food_bistecca_di_manzo_cotta` | 168634 — Beef, top sirloin, steak, separable lean only, trimmed to 0" fat, all grades, cooked, broiled | 17/17 | meat_fish | `food_beef_ground_cooked` | cottura=grilled; heme; matrice=bistecca_di_manzo_cotta |
| 09 | `food_branzino_cotto` | 173694 — Fish, sea bass, mixed species, cooked, dry heat | 14/17 | meat_fish | `food_branzino_raw` | cottura=dry_heat_cooked; heme; matrice=branzino_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_sogliola_cotta` | 174197 — Fish, flatfish (flounder and sole species), cooked, dry heat | 17/17 | meat_fish | `food_sogliola_raw` | cottura=dry_heat_cooked; heme; matrice=sogliola_cotta |
| 09 | `food_fagioli_neri_cotti` | 175239 — Beans, black turtle, mature seeds, cooked, boiled, with salt | 17/17 | plant_non_fruit | `food_fagioli_borlotti_bolliti` | cottura=boiled; bot=Fabaceae; matrice=fagioli_neri_cotti |
| 09 | `food_lupini_cotti` | 172424 — Lupins, mature seeds, cooked, boiled, without salt | 14/17 | plant_non_fruit | `food_lupini_raw` | cottura=boiled; bot=Fabaceae; matrice=lupini_cotti; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_latte_di_cocco_raw` | 170172 — Nuts, coconut milk, raw (liquid expressed from grated meat and water) | 17/17 | plant_non_fruit | `food_olio_di_cocco_raw` | cottura=raw; bot=Arecaceae; matrice=latte_di_cocco_raw |
| 09 | `food_cime_di_rapa_cotte` | 170382 — Broccoli raab, cooked | 17/17 | plant_non_fruit | `food_cime_di_rapa_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Brassicaceae; matrice=cime_di_rapa_cotte |
| 09 | `food_fegato_di_pollo_cotto` | 171061 — Chicken, liver, all classes, cooked, simmered | 17/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=simmered; heme; matrice=fegato_di_pollo_cotto |
| 09 | `food_soia_secca_cotta` | 174271 — Soybeans, mature cooked, boiled, without salt | 17/17 | plant_non_fruit | `food_soia_secca_raw` | cottura=boiled; bot=Fabaceae; matrice=soia_secca_cotta |
| 09 | `food_zucca_cotta` | 168449 — Pumpkin, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_pumpkin_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Cucurbitaceae; matrice=zucca_cotta |
| 09 | `food_piselli_secchi_spezzati_cotti` | 172429 — Peas, split, mature seeds, cooked, boiled, without salt | 17/17 | plant_non_fruit | `food_piselli_secchi_spezzati_raw` | cottura=boiled; bot=Fabaceae; matrice=piselli_secchi_spezzati_cotti |
| 09 | `food_miglio_cotto` | 168871 — Millet, cooked | 17/17 | plant_non_fruit | `food_miglio_raw` | cottura=boiled; bot=Poaceae; matrice=miglio_cotto |
| 09 | `food_peperoni_verdi_cotti` | 170109 — Peppers, sweet, green, cooked, boiled, drained, with salt | 17/17 | plant_non_fruit | `food_pepper_green_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Solanaceae; matrice=peperoni_verdi_cotti |
| 09 | `food_couscous_cotto` | 169700 — Couscous, cooked | 17/17 | plant_non_fruit | `food_couscous_raw` | cottura=boiled; bot=Poaceae; matrice=couscous_cotto |
| 09 | `food_amaranto_cotto` | 170683 — Amaranth grain, cooked | 12/17 | plant_non_fruit | `food_amaranto_raw` | cottura=boiled; bot=Amaranthaceae; matrice=amaranto_cotto; mancano: beta_carotene, vitamin_c, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_edamame_cotto` | 168411 — Edamame, frozen, prepared | 17/17 | plant_non_fruit | `food_edamame_raw` | cottura=boiled; bot=Fabaceae; matrice=edamame_cotto |
| 09 | `food_scarola_cotta` | 168413 — Escarole, cooked, boiled, drained, no salt added | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Asteraceae; matrice=scarola_cotta |
| 09 | `food_sedano_rapa_cotto` | 169341 — Celeriac, cooked, boiled, drained, with salt | 13/17 | plant_non_fruit | `food_sedano_rapa_raw` | cottura=boiled; bot=Apiaceae; matrice=sedano_rapa_cotto; mancano: fiber, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_cavolo_rapa_cotto` | 169357 — Kohlrabi, cooked, boiled, drained, with salt | 17/17 | plant_non_fruit | `food_cavolo_rapa_raw` | cottura=boiled; carot=cooked_or_disrupted; bot=Brassicaceae; matrice=cavolo_rapa_cotto |
| 09 | `food_fegato_di_vitello_cotto` | 172535 — Veal, variety meats and by-products, liver, cooked, braised | 17/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=braised; heme; matrice=fegato_di_vitello_cotto |
| 09 | `food_sgombro_cotto` | 175120 — Fish, mackerel, Atlantic, cooked, dry heat | 14/17 | meat_fish | `food_sgombro_raw` | cottura=dry_heat_cooked; heme; matrice=sgombro_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_noce_moscata_raw` | 171326 — Spices, nutmeg, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Myristicaceae; matrice=noce_moscata |
| 09 | `food_chiodi_di_garofano_raw` | 171321 — Spices, cloves, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Myrtaceae; matrice=chiodi_di_garofano |
| 09 | `food_cumino_raw` | 170923 — Spices, cumin seed | 17/17 | plant_non_fruit | `food_sedano_raw` | cottura=raw; carot=raw_intact; bot=Apiaceae; matrice=cumino |
| 09 | `food_semi_di_finocchio_raw` | 171323 — Spices, fennel seed | 12/17 | plant_non_fruit | `food_fennel_raw` | cottura=raw; bot=Apiaceae; matrice=semi_di_finocchio; mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids |
| 09 | `food_paprika_raw` | 171329 — Spices, paprika | 17/17 | plant_non_fruit | `food_pepper_red_raw` | cottura=raw; carot=raw_intact; bot=Solanaceae; matrice=paprika |
| 09 | `food_alloro_raw` | 170917 — Spices, bay leaf | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Lauraceae; matrice=alloro; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_maggiorana_raw` | 170928 — Spices, marjoram, dried | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=maggiorana |
| 10 | `food_dragoncello_raw` | 170937 — Spices, tarragon, dried | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Asteraceae; matrice=dragoncello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_aneto_raw` | 171322 — Spices, dill weed, dried | 12/17 | plant_non_fruit | `food_sedano_raw` | cottura=raw; bot=Apiaceae; matrice=aneto; mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_cardamomo_raw` | 170919 — Spices, cardamom | 12/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Zingiberaceae; matrice=cardamomo; mancano: selenium, beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_coriandolo_raw` | 170922 — Spices, coriander seed | 14/17 | plant_non_fruit | `food_sedano_raw` | cottura=raw; bot=Apiaceae; matrice=coriandolo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_senape_raw` | 170929 — Spices, mustard seed, ground | 17/17 | plant_non_fruit | `food_brussels_sprouts_raw` | cottura=raw; bot=Brassicaceae; matrice=senape |
| 10 | `food_aglio_polvere_raw` | 171325 — Spices, garlic powder | 17/17 | plant_non_fruit | `food_garlic_fresh_raw` | cottura=raw; bot=Amaryllidaceae; matrice=aglio_polvere |
| 10 | `food_zenzero_polvere_raw` | 170926 — Spices, ginger, ground | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Zingiberaceae; matrice=zenzero_polvere |
| 10 | `food_pepe_bianco_raw` | 170933 — Spices, pepper, white | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; bot=Piperaceae; matrice=pepe_bianco; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_semi_di_girasole_tostati` | 170563 — Seeds, sunflower seed kernels, dry roasted, without salt | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=roasted; carot=cooked_or_disrupted; bot=Asteraceae; matrice=semi_di_girasole_tostati |
| 10 | `food_cardi_cotti` | 169982 — Cardoon, cooked, boiled, drained, without salt | 13/17 | plant_non_fruit | `food_cardi_raw` | cottura=boiled; bot=Asteraceae; matrice=cardi_cotti; mancano: copper, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_carambola_raw` | 171715 — Carambola, (starfruit), raw | 17/17 | fresh_fruit | `food_kiwi_green_raw` | cottura=raw; carot=raw_intact; bot=Oxalidaceae; matrice=carambola |
| 10 | `food_kumquat_raw` | 168154 — Kumquats, raw | 17/17 | fresh_fruit | `food_mandarini_raw` | cottura=raw; carot=raw_intact; bot=Rutaceae; matrice=kumquat |
| 10 | `food_capesante_cotte` | 167742 — Mollusks, scallop, (bay and sea), cooked, steamed | 17/17 | meat_fish | `food_vongole_raw` | cottura=steamed; heme; matrice=capesante |
| 10 | `food_granchio_cotto` | 174205 — Crustaceans, crab, blue, cooked, moist heat | 17/17 | meat_fish | `food_vongole_raw` | cottura=moist_heat_cooked; heme; matrice=granchio |
| 10 | `food_astice_cotto` | 174209 — Crustaceans, lobster, northern, cooked, moist heat | 17/17 | meat_fish | `food_vongole_raw` | cottura=moist_heat_cooked; heme; matrice=astice |
| 10 | `food_ostriche_cotte` | 175173 — Mollusks, oyster, eastern, farmed, cooked, dry heat | 14/17 | meat_fish | `food_vongole_raw` | cottura=dry_heat_cooked; heme; matrice=ostriche; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_fagioli_azuki_bolliti` | 173728 — Beans, adzuki, mature seeds, cooked, boiled, without salt | 14/17 | plant_non_fruit | `food_fagioli_cannellini_bolliti` | cottura=boiled; bot=Fabaceae; matrice=legumes; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_olive_verdi` | 169096 — Olives, pickled, canned or bottled, green | 17/17 | plant_non_fruit | `food_albicocche_secche_raw` | cottura=pickled; carot=cooked_or_disrupted; bot=Oleaceae; matrice=olive_verdi |
| 10 | `food_olive_nere` | 169094 — Olives, ripe, canned (small-extra large) | 17/17 | plant_non_fruit | `food_albicocche_secche_raw` | cottura=pickled; carot=cooked_or_disrupted; bot=Oleaceae; matrice=olive_nere |
| 10 | `food_aceto_di_mele` | 173469 — Vinegar, cider | 17/17 | plant_non_fruit | `food_zucchero_bianco` | cottura=fermented; matrice=aceto_di_mele |
| 10 | `food_fontina` | 170843 — Cheese, fontina | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=fontina |
| 10 | `food_succo_di_limone_raw` | 167747 — Lemon juice, raw | 17/17 | plant_non_fruit | `food_lemon_peeled_raw` | cottura=raw; carot=cooked_or_disrupted; bot=Rutaceae; matrice=succo_di_limone |
| 10 | `food_succo_di_arancia_raw` | 169098 — Orange juice, raw (Includes foods for USDA's Food Distribution Program) | 17/17 | plant_non_fruit | `food_oranges_raw` | cottura=raw; carot=cooked_or_disrupted; bot=Rutaceae; matrice=succo_di_arancia |
| 10 | `food_tonno_in_scatola_olio_raw` | 174227 — Fish, tuna, light, canned in oil, without salt, drained solids | 14/17 | meat_fish | `food_tonno_fresco_raw` | cottura=canned_in_oil; heme; matrice=tonno_in_scatola_olio; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_fegato_di_maiale_raw` | 167862 — Pork, fresh, variety meats and by-products, liver, raw | 14/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=raw; heme; matrice=fegato_di_maiale; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 10 | `food_farina_di_grano_saraceno_raw` | 170687 — Buckwheat flour, whole-groat | 17/17 | plant_non_fruit | `food_farina_di_frumento_integrale_raw` | cottura=raw; bot=Polygonaceae; matrice=farina_di_grano_saraceno |
| 10 | `food_uva_spina_raw` | 173030 — Gooseberries, raw | 14/17 | fresh_fruit | `food_mirtilli_raw` | cottura=raw; carot=raw_intact; bot=Grossulariaceae; matrice=uva_spina; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 11 | `food_cuore_di_manzo_raw` | 168625 — Beef, variety meats and by-products, heart, raw | 17/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=cuore_di_manzo |
| 11 | `food_more_raw` | 173946 — Blackberries, raw | 17/17 | fresh_fruit | `food_mirtilli_raw` | cottura=raw; carot=raw_intact; bot=Rosaceae; matrice=more |
| 11 | `food_lamponi_raw` | 167755 — Raspberries, raw | 17/17 | fresh_fruit | `food_mirtilli_raw` | cottura=raw; carot=raw_intact; bot=Rosaceae; matrice=lamponi |
| 11 | `food_melone_verde_raw` | 169911 — Melons, honeydew, raw | 17/17 | fresh_fruit | `food_melone_cantalupo_raw` | cottura=raw; carot=raw_intact; bot=Cucurbitaceae; matrice=melone_verde |
| 11 | `food_pompelmo_bianco_raw` | 174676 — Grapefruit, raw, white, all areas | 17/17 | fresh_fruit | `food_pompelmo_rosa_raw` | cottura=raw; carot=raw_intact; bot=Rutaceae; matrice=pompelmo_bianco |
| 11 | `food_nasello_raw` | 173713 — Fish, whiting, mixed species, raw | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=nasello |
| 11 | `food_pomodori_secchi_raw` | 168567 — Tomatoes, sun-dried | 17/17 | plant_non_fruit | `food_tomato_raw` | cottura=raw; carot=raw_intact; bot=Solanaceae; matrice=pomodori_secchi |
| 11 | `food_uova_di_quaglia_raw` | 172191 — Egg, quail, whole, fresh, raw | 17/17 | egg_dairy | `food_egg_raw` | cottura=raw; matrice=uova_di_quaglia |
| 11 | `food_uova_danatra_raw` | 172189 — Egg, duck, whole, fresh, raw | 17/17 | egg_dairy | `food_egg_raw` | cottura=raw; matrice=uova_danatra |
| 11 | `food_trippa_di_manzo_raw` | 170599 — Beef, variety meats and by-products, tripe, raw | 17/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=trippa_di_manzo |
| 11 | `food_lingua_di_manzo_raw` | 170196 — Beef, variety meats and by-products, tongue, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=lingua_di_manzo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 11 | `food_quaglia_carne_raw` | 172419 — Quail, meat only, raw | 14/17 | meat_fish | `food_petto_di_pollo_raw` | cottura=raw; heme; matrice=quaglia_carne; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 11 | `food_succo_di_melograno_raw` | 167787 — Pomegranate juice, bottled | 17/17 | plant_non_fruit | `food_melograno_raw` | cottura=raw; bot=Lythraceae; matrice=succo_di_melograno |
| 11 | `food_capperi_in_salamoia` | 172238 — Capers, canned | 17/17 | plant_non_fruit | `food_onion_raw` | cottura=pickled; carot=cooked_or_disrupted; bot=Capparaceae; matrice=capperi |
| 11 | `food_succo_di_mela_raw` | 173933 — Apple juice, canned or bottled, unsweetened, without added ascorbic acid | 17/17 | plant_non_fruit | `food_apple_with_skin_raw` | cottura=raw; bot=Rosaceae; matrice=succo_di_mela |
| 11 | `food_grano_saraceno_tostato_raw` | 170685 — Buckwheat groats, roasted, dry | 14/17 | plant_non_fruit | `food_quinoa_dry_raw` | cottura=raw; bot=Polygonaceae; matrice=grano_saraceno_tostato; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 11 | `food_formaggio_cheddar_raw` | 173414 — Cheese, cheddar (Includes foods for USDA's Food Distribution Program) | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=formaggio_cheddar |
| 11 | `food_formaggio_gruyere_raw` | 171242 — Cheese, gruyere | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=formaggio_gruyere |
| 11 | `food_kefir_raw` | 170904 — Kefir, lowfat, plain, LIFEWAY | 17/17 | egg_dairy | `food_yogurt_bianco_intero` | cottura=raw; matrice=kefir |
| 11 | `food_pepe_di_cayenna_raw` | 170932 — Spices, pepper, red or cayenne | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Solanaceae; matrice=pepe_di_cayenna |
| 11 | `food_lievito_di_birra_secco` | 175043 — Leavening agents, yeast, baker's, active dry | 17/17 | plant_non_fruit | `food_mushroom_white_raw` | cottura=dried; matrice=lievito_di_birra |
| 11 | `food_tahina` | 170189 — Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type) | 17/17 | plant_non_fruit | `food_semi_di_sesamo_raw` | cottura=roasted; carot=cooked_or_disrupted; bot=Pedaliaceae; matrice=tahina |
| 11 | `food_acqua_di_cocco_raw` | 170174 — Nuts, coconut water (liquid from coconuts) | 17/17 | plant_non_fruit | `food_olio_di_cocco_raw` | cottura=raw; bot=Arecaceae; matrice=acqua_di_cocco |
| 11 | `food_baccala_salato_secco` | 174190 — Fish, cod, Atlantic, dried and salted | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=dried_salted; heme; matrice=baccala |
| 11 | `food_salmone_in_scatola` | 175135 — Fish, salmon, chum, canned, drained solids with bone | 17/17 | meat_fish | `food_salmon_cooked` | cottura=canned; heme; matrice=salmone_in_scatola |
| 11 | `food_fagioli_lima_raw` | 174252 — Lima beans, large, mature seeds, raw | 17/17 | plant_non_fruit | `food_kidney_beans_raw` | cottura=raw; bot=Fabaceae; matrice=fagioli_lima |
| 11 | `food_yogurt_greco_magro` | 170894 — Yogurt, Greek, plain, nonfat (Includes foods for USDA's Food Distribution Program) | 17/17 | egg_dairy | `food_yogurt_greco` | cottura=raw; matrice=yogurt_greco_magro |
| 12 | `food_tonno_in_scatola_acqua` | 171986 — Fish, tuna, light, canned in water, without salt, drained solids | 14/17 | meat_fish | `food_tonno_fresco_raw` | cottura=canned; heme; matrice=tonno_in_scatola_acqua; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_fave_secche_raw` | 175205 — Broadbeans (fava beans), mature seeds, raw | 17/17 | plant_non_fruit | `food_fave_bollite` | cottura=raw; carot=raw_intact; bot=Fabaceae; matrice=fave_secche |
| 12 | `food_cocco_disidratato_raw` | 170170 — Nuts, coconut meat, dried (desiccated), not sweetened | 17/17 | plant_non_fruit | `food_olio_di_cocco_raw` | cottura=dried; bot=Arecaceae; matrice=cocco_disidratato |
| 12 | `food_ceci_in_scatola` | 173800 — Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids | 17/17 | plant_non_fruit | `food_chickpeas_raw` | cottura=canned; carot=cooked_or_disrupted; bot=Fabaceae; matrice=ceci_in_scatola |
| 12 | `food_fagioli_lima_bolliti` | 173802 — Lima beans, large, mature seeds, cooked, boiled, with salt | 17/17 | plant_non_fruit | `food_kidney_beans_boiled` | cottura=boiled; bot=Fabaceae; matrice=fagioli_lima_bolliti |
| 12 | `food_latte_parzialmente_scremato_raw` | 172205 — Milk, reduced fat, fluid, 2% milkfat, without added vitamin A and vitamin D | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; matrice=latte_parzialmente_scremato |
| 12 | `food_panna_densa_raw` | 170859 — Cream, fluid, heavy whipping | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; matrice=panna_densa |
| 12 | `food_brie` | 172177 — Cheese, brie | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=brie |
| 12 | `food_camembert` | 172178 — Cheese, camembert | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=camembert |
| 12 | `food_pane_azzimo` | 172740 — Crackers, matzo, plain | 17/17 | plant_non_fruit | `food_farina_di_frumento_integrale_raw` | cottura=baked; bot=Poaceae; matrice=pane_azzimo |
| 12 | `food_succo_di_pompelmo_rosa_raw` | 167774 — Grapefruit juice, pink, raw | 12/17 | plant_non_fruit | `food_pompelmo_rosa_raw` | cottura=raw; bot=Rutaceae; matrice=succo_di_pompelmo_rosa; mancano: fiber, selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_timo_fresco_raw` | 173470 — Thyme, fresh | 14/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=timo_fresco; mancano: selenium, vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_basilico_secco_raw` | 171317 — Spices, basil, dried | 17/17 | plant_non_fruit | `food_scarola_raw` | cottura=raw; carot=raw_intact; bot=Lamiaceae; matrice=basilico_secco |
| 12 | `food_mandorle_tostate` | 168596 — Nuts, almonds, dry roasted, with salt added | 17/17 | plant_non_fruit | `food_almonds` | cottura=roasted; carot=cooked_or_disrupted; bot=Rosaceae; matrice=mandorle_tostate |
| 12 | `food_nocciole_tostate` | 170583 — Nuts, hazelnuts or filberts, dry roasted, without salt added | 15/17 | plant_non_fruit | `food_nocciole_raw` | cottura=roasted; carot=cooked_or_disrupted; bot=Betulaceae; matrice=nocciole_tostate; mancano: vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_pistacchi_tostati` | 169426 — Nuts, pistachio nuts, dry roasted, with salt added | 17/17 | plant_non_fruit | `food_pistacchi_raw` | cottura=roasted; carot=cooked_or_disrupted; bot=Anacardiaceae; matrice=pistacchi_tostati |
| 12 | `food_anacardi_tostati` | 169421 — Nuts, cashew nuts, dry roasted, with salt added | 17/17 | plant_non_fruit | `food_anacardi_raw` | cottura=roasted; bot=Anacardiaceae; matrice=anacardi_tostati |
| 12 | `food_semi_di_zucca_tostati` | 170557 — Seeds, pumpkin and squash seed kernels, roasted, without salt | 17/17 | plant_non_fruit | `food_semi_di_zucca_raw` | cottura=roasted; carot=cooked_or_disrupted; bot=Cucurbitaceae; matrice=semi_di_zucca_tostati |
| 12 | `food_formaggio_edam` | 173419 — Cheese, edam | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=formaggio_edam |
| 12 | `food_cavolo_cappuccio_rosso_raw` | 169977 — Cabbage, red, raw | 17/17 | plant_non_fruit | `food_cavolo_cappuccio_raw` | cottura=raw; carot=raw_intact; bot=Brassicaceae; matrice=cavolo_cappuccio_rosso |
| 12 | `food_succo_di_carota_raw` | 170491 — Carrot juice, canned | 17/17 | plant_non_fruit | `food_carrots_raw` | cottura=raw; bot=Apiaceae; matrice=succo_di_carota |
| 12 | `food_riso_bianco_cotto` | 168935 — Rice, white, long-grain, regular, cooked, unenriched, with salt | 17/17 | plant_non_fruit | `food_riso_bianco_raw` | cottura=boiled; bot=Poaceae; matrice=riso_bianco_cotto |
| 12 | `food_semi_di_sesamo_tostati` | 170151 — Seeds, sesame seeds, whole, roasted and toasted | 14/17 | plant_non_fruit | `food_semi_di_sesamo_raw` | cottura=roasted; bot=Pedaliaceae; matrice=semi_di_sesamo_tostati; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_farina_di_soia_raw` | 174273 — Soy flour, full-fat, raw | 17/17 | plant_non_fruit | `food_farina_di_ceci_raw` | cottura=raw; carot=cooked_or_disrupted; bot=Fabaceae; matrice=farina_di_soia |
| 12 | `food_panna_acida_raw` | 171257 — Cream, sour, cultured | 17/17 | egg_dairy | `food_yogurt_bianco_intero` | cottura=raw; matrice=panna_acida |
| 12 | `food_farina_di_castagne_raw` | 2515377 — Flour, chestnut | 11/17 | plant_non_fruit | `food_castagne_raw` | cottura=raw; bot=Fagaceae; matrice=farina_di_castagne; mancano: energy, beta_carotene, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 12 | `food_salmone_affumicato_raw` | 171985 — Fish, salmon, chinook, smoked, (lox), regular | 14/17 | meat_fish | `food_salmon_cooked` | cottura=smoked; heme; matrice=salmone_affumicato; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_gouda` | 171241 — Cheese, gouda | 17/17 | egg_dairy | `food_parmigiano_reggiano` | cottura=raw; matrice=gouda |
| 13 | `food_zucca_butternut_cotta` | 170130 — Squash, winter, butternut, cooked, baked, with salt | 17/17 | plant_non_fruit | `food_pumpkin_raw` | cottura=baked; carot=cooked_or_disrupted; bot=Cucurbitaceae; matrice=zucca_butternut_cotta |
| 13 | `food_quaglia_carne_cotta` | 169902 — Quail, cooked, total edible | 17/17 | meat_fish | `food_beef_liver_cooked` | cottura=cooked; heme; matrice=quaglia_cotta |
| 13 | `food_milza_di_manzo_cotta` | 170597 — Beef, variety meats and by-products, spleen, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=milza_di_manzo_cotta; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_cuore_di_pollo_cotto` | 171059 — Chicken, heart, all classes, cooked, simmered | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=simmered; heme; matrice=cuore_di_pollo_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_cuore_di_manzo_cotto` | 169448 — Beef, variety meats and by-products, heart, cooked, simmered | 17/17 | meat_fish | `food_beef_liver_cooked` | cottura=simmered; heme; matrice=cuore_di_manzo_cotto |
| 13 | `food_rognone_di_manzo_cotto` | 169450 — Beef, variety meats and by-products, kidneys, cooked, simmered | 17/17 | meat_fish | `food_beef_liver_cooked` | cottura=simmered; heme; matrice=rognone_di_manzo_cotto |
| 13 | `food_lingua_di_manzo_cotta` | 170598 — Beef, variety meats and by-products, tongue, cooked, simmered | 17/17 | meat_fish | `food_beef_liver_cooked` | cottura=simmered; heme; matrice=lingua_di_manzo_cotta |
| 13 | `food_trippa_di_manzo_cotta` | 174769 — Beef, variety meats and by-products, tripe, cooked, simmered | 17/17 | meat_fish | `food_beef_liver_cooked` | cottura=simmered; heme; matrice=trippa_di_manzo_cotta |
| 13 | `food_fegato_di_maiale_cotto` | 167863 — Pork, fresh, variety meats and by-products, liver, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=fegato_di_maiale_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_ventriglio_di_pollo_raw` | 171456 — Chicken, gizzard, all classes, raw | 17/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=ventriglio_di_pollo_raw |
| 13 | `food_cuore_di_agnello_cotto` | 172528 — Lamb, variety meats and by-products, heart, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=cuore_di_agnello_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_rognone_di_agnello_cotto` | 174355 — Lamb, variety meats and by-products, kidneys, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=rognone_di_agnello_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_fegato_di_agnello_cotto` | 172532 — Lamb, variety meats and by-products, liver, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=fegato_di_agnello_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_lingua_di_maiale_cotta` | 168276 — Pork, fresh, variety meats and by-products, tongue, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=lingua_di_maiale_cotta; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_rognone_di_maiale_cotto` | 167860 — Pork, fresh, variety meats and by-products, kidneys, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=rognone_di_maiale_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_rognone_di_maiale_raw` | 168270 — Pork, fresh, variety meats and by-products, kidneys, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=rognone_di_maiale_raw; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_cuore_di_maiale_cotto` | 168268 — Pork, fresh, variety meats and by-products, heart, cooked, braised | 14/17 | meat_fish | `food_beef_liver_cooked` | cottura=braised; heme; matrice=cuore_di_maiale_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_cuore_di_maiale_raw` | 168267 — Pork, fresh, variety meats and by-products, heart, raw | 16/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=cuore_di_maiale_raw; mancano: vitamin_k |
| 13 | `food_noci_pecan_raw` | 170182 — Nuts, pecans | 17/17 | plant_non_fruit | `food_almonds` | cottura=raw; carot=raw_intact; bot=Juglandaceae; matrice=noci_pecan_raw |
| 13 | `food_aringa_affumicata_raw` | 173668 — Fish, herring, Atlantic, kippered | 17/17 | meat_fish | `food_salmon_cooked` | cottura=smoked; heme; matrice=aringa_affumicata |
| 13 | `food_seppia_cotta` | 172010 — Mollusks, cuttlefish, mixed species, cooked, moist heat | 14/17 | meat_fish | `food_vongole_raw` | cottura=boiled; heme; matrice=seppia_cotta; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_pancetta_raw` | 168277 — Pork, cured, bacon, unprepared | 17/17 | meat_fish | `food_beef_ground_cooked` | cottura=raw; heme; matrice=pancetta_raw |
| 13 | `food_songino_raw` | 169219 — Cornsalad, raw | 13/17 | plant_non_fruit | `food_lettuce_romaine_raw` | cottura=raw; carot=raw_intact; bot=Valerianaceae; matrice=songino_raw; mancano: fiber, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 13 | `food_pastinaca_raw` | 170417 — Parsnips, raw | 17/17 | plant_non_fruit | `food_carrots_raw` | cottura=raw; carot=raw_intact; bot=Apiaceae; matrice=pastinaca_raw |
| 13 | `food_fiocchi_di_avena_raw` | 173904 — Cereals, oats, regular and quick, not fortified, dry | 17/17 | plant_non_fruit | `food_avena_cruda` | cottura=raw; bot=Poaceae; matrice=fiocchi_di_avena_raw |
| 13 | `food_tuorlo_uovo_raw` | 172184 — Egg, yolk, raw, fresh | 17/17 | egg_dairy | `food_egg_raw` | cottura=raw; matrice=tuorlo_uovo_raw |
| 14 | `food_albume_uovo_raw` | 172183 — Egg, white, raw, fresh | 17/17 | egg_dairy | `food_egg_raw` | cottura=raw; matrice=albume_uovo_raw |
| 14 | `food_oca_raw` | 172413 — Goose, domesticated, meat only, raw | 14/17 | meat_fish | `food_anatra_raw` | cottura=raw; heme; matrice=oca; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_oca_cotta` | 172414 — Goose, domesticated, meat only, cooked, roasted | 14/17 | meat_fish | `food_anatra_raw` | cottura=roasted; heme; matrice=oca_cotta; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_faraona_raw` | 174471 — Guinea hen, meat only, raw | 14/17 | meat_fish | `food_petto_di_pollo_raw` | cottura=raw; heme; matrice=faraona; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_capra_raw` | 175303 — Game meat, goat, raw | 13/17 | meat_fish | `food_agnello_raw` | cottura=raw; heme; matrice=capra; mancano: magnesium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_capra_cotta` | 175304 — Game meat, goat, cooked, roasted | 17/17 | meat_fish | `food_beef_ground_cooked` | cottura=roasted; heme; matrice=capra_cotta |
| 14 | `food_cavallo_raw` | 175086 — Game meat, horse, raw | 13/17 | meat_fish | `food_beef_ground_raw` | cottura=raw; heme; matrice=cavallo; mancano: beta_carotene, folate, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_milza_di_maiale_raw` | 167865 — Pork, fresh, variety meats and by-products, spleen, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=milza_di_maiale; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_nespola_raw` | 169908 — Loquats, raw | 14/17 | fresh_fruit | `food_peach_yellow_raw` | cottura=raw; bot=Rosaceae; matrice=nespola; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_latte_di_pecora_raw` | 170882 — Milk, sheep, fluid | 14/17 | egg_dairy | `food_milk_whole` | cottura=raw; ca=medium_oxalate; matrice=latte_di_pecora; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_fegato_di_agnello_raw` | 172531 — Lamb, variety meats and by-products, liver, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=fegato_di_agnello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_rognone_di_agnello_raw` | 174354 — Lamb, variety meats and by-products, kidneys, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=rognone_di_agnello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_cuore_di_agnello_raw` | 172527 — Lamb, variety meats and by-products, heart, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=cuore_di_agnello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_milza_di_agnello_raw` | 174364 — Lamb, variety meats and by-products, spleen, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=milza_di_agnello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_animelle_di_agnello_raw` | 172538 — Lamb, variety meats and by-products, pancreas, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=animelle_di_agnello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_piccione_raw` | 171079 — Squab, (pigeon), meat only, raw | 14/17 | meat_fish | `food_petto_di_pollo_raw` | cottura=raw; heme; matrice=piccione; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_sorgo_raw` | 169716 — Sorghum grain | 14/17 | plant_non_fruit | `food_riso_integrale_raw` | cottura=raw; bot=Poaceae; matrice=sorgo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_polmone_di_manzo_raw` | 168628 — Beef, variety meats and by-products, lungs, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=polmone_di_manzo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_cervella_di_manzo_raw` | 168622 — Beef, variety meats and by-products, brain, raw | 17/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=cervella_di_manzo |
| 14 | `food_polmone_di_vitello_raw` | 174361 — Veal, variety meats and by-products, lungs, raw | 14/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=raw; heme; matrice=polmone_di_vitello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_animelle_di_vitello_raw` | 174362 — Veal, variety meats and by-products, pancreas, raw | 14/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=raw; heme; matrice=animelle_di_vitello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_milza_di_vitello_raw` | 172540 — Veal, variety meats and by-products, spleen, raw | 14/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=raw; heme; matrice=milza_di_vitello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_polmone_di_maiale_raw` | 167864 — Pork, fresh, variety meats and by-products, lungs, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=polmone_di_maiale; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_cervella_di_maiale_raw` | 168264 — Pork, fresh, variety meats and by-products, brain, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=cervella_di_maiale; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_animelle_di_maiale_raw` | 168273 — Pork, fresh, variety meats and by-products, pancreas, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=animelle_di_maiale; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_animelle_di_manzo_raw` | 169452 — Beef, variety meats and by-products, pancreas, raw | 14/17 | meat_fish | `food_beef_liver_raw` | cottura=raw; heme; matrice=animelle_di_manzo; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 14 | `food_fegato_di_anatra_raw` | 174467 — Duck, domesticated, liver, raw | 14/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=fegato_di_anatra; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_fegato_di_oca_raw` | 172415 — Goose, liver, raw | 14/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=fegato_di_oca; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_lingua_di_vitello_raw` | 174368 — Veal, variety meats and by-products, tongue, raw | 14/17 | meat_fish | `food_fegato_di_vitello_raw` | cottura=raw; heme; matrice=lingua_di_vitello; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_fegato_di_tacchino_raw` | 171486 — Turkey, all classes, liver, raw | 17/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=fegato_di_tacchino |
| 15 | `food_cuore_di_tacchino_raw` | 171484 — Turkey, all classes, heart, raw | 16/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=cuore_di_tacchino; mancano: folate |
| 15 | `food_ventriglio_di_tacchino_raw` | 171085 — Turkey, gizzard, all classes, raw | 17/17 | meat_fish | `food_fegato_di_pollo_raw` | cottura=raw; heme; matrice=ventriglio_di_tacchino |
| 15 | `food_latte_condensato_raw` | 171275 — Milk, canned, condensed, sweetened | 17/17 | egg_dairy | `food_milk_whole` | cottura=condensed; ca=medium_oxalate; matrice=latte_condensato |
| 15 | `food_curry_in_polvere_raw` | 170924 — Spices, curry powder | 17/17 | plant_non_fruit | `food_cacao_amaro_raw` | cottura=raw; matrice=curry_in_polvere |
| 15 | `food_salsiccia_di_maiale_raw` | 171631 — Sausage, Italian, pork, mild, raw | 15/17 | meat_fish | `food_lonza_di_maiale_raw` | cottura=raw; heme; matrice=salsiccia_di_maiale; mancano: folate, vitamin_k |
| 15 | `food_riso_venere_raw` | 2710825 — Rice, black, unenriched, raw | 9/17 | plant_non_fruit | `food_riso_integrale_raw` | cottura=raw; bot=Poaceae; matrice=riso_venere; mancano: energy, selenium, beta_carotene, vitamin_c, folate, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_formaggio_cremoso_raw` | 173418 — Cheese, cream | 17/17 | egg_dairy | `food_ricotta` | cottura=raw; matrice=formaggio_cremoso |
| 15 | `food_mais_dolce_cotto` | 169999 — Corn, sweet, yellow, cooked, boiled, drained, without salt | 17/17 | plant_non_fruit | `food_carrots_boiled` | cottura=boiled; carot=cooked_or_disrupted; bot=Poaceae; matrice=mais_dolce_cotto |
| 15 | `food_rafano_raw` | 168451 — Radishes, oriental, raw | 17/17 | plant_non_fruit | `food_ravanelli_raw` | cottura=raw; bot=Brassicaceae; matrice=rafano |
| 15 | `food_luccio_cotto` | 175127 — Fish, pike, northern, cooked, dry heat | 14/17 | meat_fish | `food_salmon_cooked` | cottura=dry_heat_cooked; heme; matrice=luccio_cotto; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_tilapia_raw` | 175176 — Fish, tilapia, raw | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=tilapia |
| 15 | `food_halibut_raw` | 174200 — Fish, halibut, Atlantic and Pacific, raw | 17/17 | meat_fish | `food_sogliola_raw` | cottura=raw; heme; matrice=halibut |
| 15 | `food_alga_nori_raw` | 168458 — Seaweed, laver, raw | 17/17 | plant_non_fruit | `food_kale_raw` | cottura=raw; carot=raw_intact; matrice=alga_nori |
| 15 | `food_pesce_gatto_americano_raw` | 175165 — Fish, catfish, channel, farmed, raw | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=pesce_gatto_americano |
| 15 | `food_siero_di_latte_dolce_raw` | 171282 — Whey, sweet, fluid | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; ca=medium_oxalate; matrice=siero_di_latte_dolce |
| 15 | `food_salame_raw` | 172938 — Salami, dry or hard, pork | 14/17 | meat_fish | `food_beef_ground_cooked` | cottura=raw; heme; matrice=salame_raw; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_anguilla_raw` | 174193 — Fish, eel, mixed species, raw | 17/17 | meat_fish | `food_salmon_raw` | cottura=raw; heme; matrice=anguilla |
| 15 | `food_rana_pescatrice_raw` | 173676 — Fish, monkfish, raw | 14/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=rana_pescatrice; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_olio_di_palma_raw` | 171015 — Oil, palm | 17/17 | plant_non_fruit | `food_olio_di_cocco_raw` | cottura=raw; bot=Arecaceae; matrice=olio_di_palma |
| 15 | `food_siero_di_latte_acido_raw` | 170885 — Whey, acid, fluid | 17/17 | egg_dairy | `food_milk_whole` | cottura=raw; ca=medium_oxalate; matrice=siero_di_latte_acido |
| 15 | `food_anice_semi_raw` | 171316 — Spices, anise seed | 14/17 | plant_non_fruit | `food_cacao_amaro_raw` | cottura=raw; bot=Apiaceae; matrice=anice_semi; mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_latte_di_bufala_raw` | 171280 — Milk, indian buffalo, fluid | 13/17 | egg_dairy | `food_milk_whole` | cottura=raw; ca=medium_oxalate; matrice=latte_di_bufala; mancano: selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 15 | `food_carpa_raw` | 171952 — Fish, carp, raw | 17/17 | meat_fish | `food_merluzzo_raw` | cottura=raw; heme; matrice=carpa |
| 15 | `food_avena_cotta` | 173905 — Cereals, oats, regular and quick, unenriched, cooked with water (includes boiling and microwaving), without salt | 17/17 | plant_non_fruit | `food_avena_cruda` | cottura=boiled; bot=Poaceae; matrice=avena_cotta |

### 98 alimenti in cinque lotti (20 + 20 + 20 + 19 + 19) — ✅ eseguiti la sera 2026-10-14 (verificato: 98/98 OK)

**Esito.** Preparati dal task orario nel corso del 2026-10-14 (voci "Pronti" di quel giorno, dal secondo al sesto lotto della coda del PRD), eseguiti dall'utente la sera stessa sul suo PC (PowerShell) a **lotti**: la cartella `lotti_alimenti/` contiene 5 file `lotto_NN_prova.txt` (dry-run), 5 `lotto_NN_applica.txt` (con `--apply`) e il `LEGGIMI.txt`; i log reali delle esecuzioni sono `esito_lotto_NN_prova.txt` ed `esito_lotto_NN_applica.txt` nella stessa cartella. Ordine: dalla voce "Pronti" più vecchia alla più recente. Per ogni lotto prima il dry-run (letto da questa sessione: descrizione FDC e numero di nutrienti confrontati con quanto atteso, nessuna discrepanza bloccante), poi l'apply. **Apply: 98 su 98 "foods_raw … creato"**, nessuna riga di errore nei log, verifica difensiva dello script passata per tutti.

**Verifica indipendente** con `check_alimenti_lotto2.sql` (sola lettura, nel repo): RIEPILOGO **OK=98, DA CONTROLLARE=0, NON PRESENTE=0** (riga presente, `draft`, nutrienti >= minimo atteso, dieta e carotenoidi come previsti, FDC e descrizione FDC salvati). Le soglie minime erano abbassate solo per i gap dichiarati sotto (rucola 11, castagne 12). Tutti i 98 restano `draft`; con i 46 delle notti precedenti e i 9 del 12–13 ottobre gli alimenti inseriti dalla pipeline sono ora **153**, tutti inseriti come `draft`.

**Numeri.** Nutrienti trovati su 17: 17/17 → 73; 16/17 → 5; 15/17 → 3; 14/17 → 11; 13/17 → 3; 12/17 → 2; 11/17 → 1. Categoria dieta: plant_non_fruit 63, fresh_fruit 16, meat_fish 14, egg_dairy 5.

**Gap dichiarati (alimenti con meno di 17 nutrienti).** Quasi tutti sono vitamina K, beta-carotene e altri carotenoidi non riportati nel record FDC (non assunti zero). I tre più rilevanti: **rucola 11/17** e **radicchio 12/17** non hanno l'energia (`energy_kcal`), **castagne 12/17** non hanno la fibra. Il germe di grano ha 14 nutrienti invece dei 13 attesi (uno in più, nessun problema). Elenco completo nella tabella (colonna Note). Sono righe `draft` e quindi cancellabili o completabili senza conseguenze per l'app.

**Da sapere sui carotenoidi.** `carotenoid_matrix_state=raw_intact` è impostato su 44 alimenti, compresi alcuni essiccati (albicocche secche, prugne secche, fichi secchi, datteri Medjool). Per la frutta essiccata è una scelta discutibile (l'essiccazione modifica la matrice), ma prudente: usa il fattore "crudo" (meno generoso, 9.44:1) e quindi **abbassa** la stima di vitamina A invece di alzarla. Da rivedere se la vitamina A di questi alimenti diventerà rilevante (oggi compare solo nel Meal Builder).

**Cosa NON è in questa sezione.** Il testo completo delle 98 voci (ragionamento sulla scelta del record FDC, note sull'analogia, comandi dry-run e apply uno per uno) non è stato copiato qui per non appesantire il file; resta nella cronologia git: `git show 7460196:docs/GOLDEN_SET_READY_TO_RUN.md`. I comandi sono anche, già assemblati, in `lotti_alimenti/`.

**Elenco dei 98 alimenti.** Lotto = numero del file `lotto_NN_*.txt`; "Nutrienti" = quanti ne ha inseriti lo script (letto dal log dell'apply).

| Lotto | food_id | FDC (descrizione nel log) | Nutrienti | Dieta | Analogia | Note |
|---|---|---|---|---|---|---|
| 1 | `food_edamame_raw` | 168410 — Edamame, frozen, unprepared | 13/17 | plant_non_fruit | `food_chickpeas_raw` | mancano: selenium, beta_carotene, vitamin_b12, other_provitamin_a_carotenoids |
| 1 | `food_verza_raw` | 170388 — Cabbage, savoy, raw | 17/17 | plant_non_fruit | `food_kale_raw` | carotenoidi raw_intact |
| 1 | `food_rucola_raw` | 2710822 — Arugula, baby, raw | 11/17 | plant_non_fruit | `food_kale_raw` | mancano: energy, selenium, beta_carotene, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids |
| 1 | `food_porri_raw` | 169246 — Leeks, (bulb and lower leaf-portion), raw | 17/17 | plant_non_fruit | `food_onion_raw` | carotenoidi raw_intact |
| 1 | `food_barbabietola_rossa_raw` | 169145 — Beets, raw | 17/17 | plant_non_fruit | `food_spinach_raw` | carotenoidi raw_intact |
| 1 | `food_radicchio_raw` | 2747664 — Radicchio, raw | 12/17 | plant_non_fruit | `food_lettuce_romaine_raw` | mancano: energy, selenium, beta_carotene, vitamin_b12, other_provitamin_a_carotenoids |
| 1 | `food_anguria_raw` | 167765 — Watermelon, raw | 17/17 | fresh_fruit | `food_melone_cantalupo_raw` | carotenoidi raw_intact |
| 1 | `food_albicocche_raw` | 171697 — Apricots, raw | 17/17 | fresh_fruit | `food_peach_yellow_raw` | carotenoidi raw_intact |
| 1 | `food_ciliegie_raw` | 171719 — Cherries, sweet, raw | 17/17 | fresh_fruit | `food_peach_yellow_raw` | carotenoidi raw_intact |
| 1 | `food_pistacchi_raw` | 170184 — Nuts, pistachio nuts, raw | 16/17 | plant_non_fruit | `food_almonds` | mancano: vitamin_k |
| 1 | `food_couscous_raw` | 169699 — Couscous, dry | 13/17 | plant_non_fruit | `food_riso_bianco_raw` | mancano: selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 1 | `food_quinoa_dry_raw` | 168874 — Quinoa, uncooked | 16/17 | plant_non_fruit | `food_orzo_perlato_raw` | mancano: vitamin_c; carotenoidi raw_intact |
| 1 | `food_soia_secca_raw` | 174270 — Soybeans, mature seeds, raw | 17/17 | plant_non_fruit | `food_chickpeas_raw` | carotenoidi raw_intact |
| 1 | `food_tofu_raw` | 172475 — Tofu, raw, firm, prepared with calcium sulfate | 14/17 | plant_non_fruit | `food_chickpeas_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 1 | `food_cetrioli_raw` | 168409 — Cucumber, with peel, raw | 17/17 | plant_non_fruit | `food_zucchine_raw` | carotenoidi raw_intact |
| 1 | `food_fagiolini_raw` | 169961 — Beans, snap, green, raw | 17/17 | plant_non_fruit | `food_chickpeas_raw` | carotenoidi raw_intact |
| 1 | `food_carciofi_raw` | 169205 — Artichokes, (globe or french), raw | 17/17 | plant_non_fruit | `food_lettuce_romaine_raw` | carotenoidi raw_intact |
| 1 | `food_pepper_yellow_raw` | 169383 — Peppers, sweet, yellow, raw | 15/17 | plant_non_fruit | `food_pepper_red_raw` | mancano: vitamin_k, other_provitamin_a_carotenoids; carotenoidi raw_intact |
| 1 | `food_pepper_green_raw` | 170427 — Peppers, sweet, green, raw | 17/17 | plant_non_fruit | `food_pepper_red_raw` | carotenoidi raw_intact |
| 1 | `food_sedano_rapa_raw` | 170400 — Celeriac, raw | 17/17 | plant_non_fruit | `food_sedano_raw` |  |
| 2 | `food_mirtilli_raw` | 171711 — Blueberries, raw | 17/17 | fresh_fruit | `food_strawberry_raw` | carotenoidi raw_intact |
| 2 | `food_prugne_raw` | 169949 — Plums, raw | 17/17 | fresh_fruit | `food_peach_yellow_raw` | carotenoidi raw_intact |
| 2 | `food_melograno_raw` | 169134 — Pomegranates, raw | 17/17 | fresh_fruit | `food_grapes_european_raw` |  |
| 2 | `food_cachi_raw` | 169941 — Persimmons, japanese, raw | 17/17 | fresh_fruit | `food_melone_cantalupo_raw` | carotenoidi raw_intact |
| 2 | `food_mandarini_raw` | 169105 — Tangerines, (mandarin oranges), raw | 17/17 | fresh_fruit | `food_oranges_raw` | carotenoidi raw_intact |
| 2 | `food_anacardi_raw` | 170162 — Nuts, cashew nuts, raw | 17/17 | plant_non_fruit | `food_almonds` |  |
| 2 | `food_arachidi_raw` | 172430 — Peanuts, all types, raw | 17/17 | plant_non_fruit | `food_chickpeas_raw` |  |
| 2 | `food_semi_di_zucca_raw` | 170556 — Seeds, pumpkin and squash seed kernels, dried | 17/17 | plant_non_fruit | `food_pumpkin_raw` | carotenoidi raw_intact |
| 2 | `food_semi_di_sesamo_raw` | 170150 — Seeds, sesame seeds, whole, dried | 17/17 | plant_non_fruit | `food_almonds` | carotenoidi raw_intact |
| 2 | `food_semi_di_lino_interi_raw` | 169414 — Seeds, flaxseed | 17/17 | plant_non_fruit | `food_almonds` |  |
| 2 | `food_vitello_raw` | 173817 — Veal, composite of trimmed retail cuts, separable lean only, raw | 14/17 | meat_fish | `food_beef_ground_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 2 | `food_agnello_raw` | 174338 — Lamb, New Zealand, imported, frozen, composite of trimmed retail cuts, separable lean only, raw | 14/17 | meat_fish | `food_beef_ground_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 2 | `food_coniglio_raw` | 172521 — Game meat, rabbit, domesticated, composite of cuts, raw | 14/17 | meat_fish | `food_beef_ground_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 2 | `food_anatra_raw` | 172410 — Duck, domesticated, meat only, raw | 17/17 | meat_fish | `food_petto_di_pollo_raw` |  |
| 2 | `food_branzino_raw` | 175142 — Fish, sea bass, mixed species, raw | 17/17 | meat_fish | `food_merluzzo_raw` |  |
| 2 | `food_feta` | 173420 — Cheese, feta | 17/17 | egg_dairy | `food_milk_whole` |  |
| 2 | `food_polpo_raw` | 174218 — Mollusks, octopus, common, raw | 17/17 | meat_fish | `food_vongole_raw` |  |
| 2 | `food_calamari_raw` | 174223 — Mollusks, squid, mixed species, raw | 17/17 | meat_fish | `food_vongole_raw` |  |
| 2 | `food_gorgonzola` | 172175 — Cheese, blue | 17/17 | egg_dairy | `food_mozzarella` |  |
| 2 | `food_olio_di_girasole_raw` | 171025 — Oil, sunflower, linoleic, (approx. 65%) | 17/17 | plant_non_fruit | `food_burro` |  |
| 3 | `food_olio_di_cocco_raw` | 171412 — Oil, coconut | 17/17 | plant_non_fruit | `food_burro` |  |
| 3 | `food_cacao_amaro_raw` | 169593 — Cocoa, dry powder, unsweetened | 17/17 | plant_non_fruit | `food_farina_di_mais_raw` |  |
| 3 | `food_castagne_raw` | 170575 — Nuts, chestnuts, european, raw, peeled | 12/17 | plant_non_fruit | `food_almonds` | mancano: fiber, selenium, beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 3 | `food_fegato_di_pollo_raw` | 171060 — Chicken, liver, all classes, raw | 17/17 | meat_fish | `food_beef_liver_raw` |  |
| 3 | `food_miglio_raw` | 169702 — Millet, raw | 15/17 | plant_non_fruit | `food_orzo_perlato_raw` | mancano: beta_carotene, other_provitamin_a_carotenoids |
| 3 | `food_segale_raw` | 168884 — Rye grain | 17/17 | plant_non_fruit | `food_orzo_perlato_raw` | carotenoidi raw_intact |
| 3 | `food_amaranto_raw` | 170682 — Amaranth grain, uncooked | 17/17 | plant_non_fruit | `food_orzo_perlato_raw` | carotenoidi raw_intact |
| 3 | `food_topinambur_raw` | 169236 — Jerusalem-artichokes, raw | 17/17 | plant_non_fruit | `food_potato_raw` | carotenoidi raw_intact |
| 3 | `food_piselli_secchi_spezzati_raw` | 172428 — Peas, green, split, mature seeds, raw | 17/17 | plant_non_fruit | `food_lentils_raw` | carotenoidi raw_intact |
| 3 | `food_lenticchie_rosse_raw` | 174284 — Lentils, pink or red, raw | 16/17 | plant_non_fruit | `food_lentils_raw` | mancano: vitamin_k; carotenoidi raw_intact |
| 3 | `food_cavolo_cappuccio_raw` | 169975 — Cabbage, raw | 17/17 | plant_non_fruit | `food_kale_raw` | carotenoidi raw_intact |
| 3 | `food_bietole_da_costa_raw` | 169991 — Chard, swiss, raw | 17/17 | plant_non_fruit | `food_spinach_raw` | carotenoidi raw_intact |
| 3 | `food_cime_di_rapa_raw` | 170381 — Broccoli raab, raw | 17/17 | plant_non_fruit | `food_broccoli_raw` | carotenoidi raw_intact |
| 3 | `food_lime_raw` | 168155 — Limes, raw | 17/17 | fresh_fruit | `food_lemon_peeled_raw` | carotenoidi raw_intact |
| 3 | `food_nespole_raw` | 169908 — Loquats, raw | 14/17 | fresh_fruit | `food_pear_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 3 | `food_pompelmo_rosa_raw` | 174673 — Grapefruit, raw, pink and red, all areas | 17/17 | fresh_fruit | `food_oranges_raw` | carotenoidi raw_intact |
| 3 | `food_peperoncino_piccante_raw` | 170106 — Peppers, hot chili, red, raw | 17/17 | plant_non_fruit | `food_pepper_red_raw` | carotenoidi raw_intact |
| 3 | `food_rapa_raw` | 170465 — Turnips, raw | 17/17 | plant_non_fruit | `food_broccoli_raw` |  |
| 3 | `food_scarola_raw` | 168412 — Endive, raw | 17/17 | plant_non_fruit | `food_lettuce_romaine_raw` | carotenoidi raw_intact |
| 3 | `food_indivia_belga_raw` | 170404 — Chicory, witloof, raw | 14/17 | plant_non_fruit | `food_lettuce_romaine_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 4 | `food_ravanelli_raw` | 169276 — Radishes, raw | 17/17 | plant_non_fruit | `food_broccoli_raw` | carotenoidi raw_intact |
| 4 | `food_scalogno_raw` | 170499 — Shallots, raw | 17/17 | plant_non_fruit | `food_onion_raw` | carotenoidi raw_intact |
| 4 | `food_semi_di_canapa_raw` | 170148 — Seeds, hemp seed, hulled | 13/17 | plant_non_fruit | `food_almonds` | mancano: selenium, vitamin_b12, vitamin_k, other_provitamin_a_carotenoids; carotenoidi raw_intact |
| 4 | `food_datteri_medjool_raw` | 168191 — Dates, medjool | 15/17 | plant_non_fruit | `food_fig_raw` | mancano: selenium, vitamin_b12; carotenoidi raw_intact |
| 4 | `food_uva_passa_raw` | 168165 — Raisins, dark, seedless (Includes foods for USDA's Food Distribution Program) | 17/17 | plant_non_fruit | `food_grapes_european_raw` |  |
| 4 | `food_albicocche_secche_raw` | 173941 — Apricots, dried, sulfured, uncooked | 17/17 | plant_non_fruit | `food_peach_yellow_raw` | carotenoidi raw_intact |
| 4 | `food_prugne_secche_raw` | 168162 — Plums, dried (prunes), uncooked | 17/17 | plant_non_fruit | `food_peach_yellow_raw` | carotenoidi raw_intact |
| 4 | `food_fichi_secchi_raw` | 174665 — Figs, dried, uncooked | 17/17 | plant_non_fruit | `food_fig_raw` | carotenoidi raw_intact |
| 4 | `food_seppia_raw` | 174215 — Mollusks, cuttlefish, mixed species, raw | 14/17 | meat_fish | `food_vongole_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 4 | `food_pesce_spada_raw` | 173703 — Fish, swordfish, raw | 17/17 | meat_fish | `food_salmon_raw` |  |
| 4 | `food_sogliola_raw` | 174196 — Fish, flatfish (flounder and sole species), raw | 17/17 | meat_fish | `food_salmon_raw` |  |
| 4 | `food_provolone` | 170850 — Cheese, provolone | 17/17 | egg_dairy | `food_parmigiano_reggiano` |  |
| 4 | `food_olio_di_mais_raw` | 171029 — Oil, corn, industrial and retail, all purpose salad or cooking | 17/17 | plant_non_fruit | `food_burro` |  |
| 4 | `food_farina_di_riso_raw` | 169714 — Rice flour, white, unenriched | 17/17 | plant_non_fruit | `food_riso_bianco_raw` |  |
| 4 | `food_farina_di_ceci_raw` | 174288 — Chickpea flour (besan) | 17/17 | plant_non_fruit | `food_chickpeas_raw` |  |
| 4 | `food_noci_del_brasile_raw` | 170569 — Nuts, brazilnuts, dried, unblanched | 17/17 | plant_non_fruit | `food_noci_raw` |  |
| 4 | `food_noci_macadamia_raw` | 170178 — Nuts, macadamia nuts, raw | 14/17 | plant_non_fruit | `food_noci_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 4 | `food_latte_di_capra_raw` | 171278 — Milk, goat, fluid, with added vitamin D | 17/17 | egg_dairy | `food_milk_whole` |  |
| 4 | `food_sciroppo_di_acero_raw` | 169661 — Syrups, maple | 17/17 | plant_non_fruit | `food_zucchero_bianco` |  |
| 5 | `food_mango_raw` | 169910 — Mangos, raw | 17/17 | fresh_fruit | `food_oranges_raw` | carotenoidi raw_intact |
| 5 | `food_papaya_raw` | 169926 — Papayas, raw | 17/17 | fresh_fruit | `food_melone_cantalupo_raw` | carotenoidi raw_intact |
| 5 | `food_litchi_raw` | 169086 — Litchis, raw | 17/17 | fresh_fruit | `food_grapes_european_raw` | carotenoidi raw_intact |
| 5 | `food_aringa_raw` | 175116 — Fish, herring, Atlantic, raw | 17/17 | meat_fish | `food_sgombro_raw` |  |
| 5 | `food_strutto` | 171401 — Lard | 17/17 | meat_fish | `food_burro` |  |
| 5 | `food_fagioli_neri_raw` | 175186 — Beans, black turtle, mature seeds, raw | 17/17 | plant_non_fruit | `food_kidney_beans_raw` |  |
| 5 | `food_lupini_raw` | 172423 — Lupins, mature seeds, raw | 16/17 | plant_non_fruit | `food_chickpeas_raw` | mancano: vitamin_k |
| 5 | `food_crusca_di_frumento_raw` | 169722 — Wheat bran, crude | 17/17 | plant_non_fruit | `food_orzo_perlato_raw` |  |
| 5 | `food_germe_di_grano_raw` | 168892 — Wheat germ, crude | 14/17 | plant_non_fruit | `food_orzo_perlato_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids; 1 in piu' dei 13 attesi |
| 5 | `food_farina_di_frumento_integrale_raw` | 168893 — Wheat flour, whole-grain (Includes foods for USDA's Food Distribution Program) | 17/17 | plant_non_fruit | `food_orzo_perlato_raw` |  |
| 5 | `food_cardi_raw` | 169981 — Cardoon, raw | 14/17 | plant_non_fruit | `food_lettuce_romaine_raw` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |
| 5 | `food_fichi_dindia_raw` | 167750 — Prickly pears, raw | 16/17 | fresh_fruit | `food_oranges_raw` | mancano: vitamin_k; carotenoidi raw_intact |
| 5 | `food_caprino_fresco` | 173435 — Cheese, goat, soft type | 17/17 | egg_dairy | `food_milk_whole` |  |
| 5 | `food_zucchero_di_canna_raw` | 168833 — Sugars, brown | 17/17 | plant_non_fruit | `food_zucchero_bianco` |  |
| 5 | `food_cavolo_rapa_raw` | 168424 — Kohlrabi, raw | 17/17 | plant_non_fruit | `food_broccoli_raw` | carotenoidi raw_intact |
| 5 | `food_fegato_di_vitello_raw` | 172534 — Veal, variety meats and by-products, liver, raw | 17/17 | meat_fish | `food_beef_liver_raw` |  |
| 5 | `food_pinoli_raw` | 170591 — Nuts, pine nuts, dried | 17/17 | plant_non_fruit | `food_noci_raw` |  |
| 5 | `food_ananas_raw` | 169124 — Pineapple, raw, all varieties | 17/17 | fresh_fruit | `food_oranges_raw` | carotenoidi raw_intact |
| 5 | `food_semi_di_chia_raw` | 170554 — Seeds, chia seeds, dried | 14/17 | plant_non_fruit | `food_almonds` | mancano: beta_carotene, vitamin_k, other_provitamin_a_carotenoids |

### Lotto 18 alimenti vegetali — verdura e frutta — ✅ eseguito la notte 2026-10-14 (verificato: 46/46 OK)

**Esito (2026-10-14, ore 01).** L'utente ha lanciato il dry-run dei 18 e poi `--apply` dei 18 sul suo PC (PowerShell): nessun errore riferito. Dry-run: questa sessione ha visto gli screenshot di 8 alimenti su 18 (pomodori, cipolle, aglio, peperoni rossi, pesche, kiwi, fichi, piselli: descrizione FDC giusta, 17/17 nutrienti, nessun ERRORE); per gli altri 10 l'utente ha riferito a voce che erano a posto. **Verifica indipendente dopo l'apply** con `check_alimenti_aggiunti.sql` (versione che controlla anche numero FDC e descrizione FDC salvata): RIEPILOGO **OK=46, DA CONTROLLARE=0, NON PRESENTE=0** (28 alimenti del 2026-10-13/14 + questi 18): per ogni riga presente, `draft`, 17 nutrienti, dieta e stato carotenoidi come previsti, numero FDC e descrizione FDC come attesi. **Aglio**: eseguito con il nuovo food_id `food_garlic_fresh_raw` (il nome originale `food_garlic_raw` esiste gia' come riga demo legacy nel DB e non e' stato toccato). Tutti i 18 restano `draft`: nessuna promozione a `verified`. I comandi dry-run/apply di questo lotto restano nella cronologia git (commit `76d6719`).

**Come e' stato preparato.** Ogni FDC ID e' stato verificato aprendo il record `fdc.nal.usda.gov/portal-data/external/<id>` (WebFetch, che il 2026-10-12 sera risulta raggiungibile da questo ambiente — la nota precedente sul blocco riguardava `api.nal.usda.gov`) e controllando che la descrizione coincida con l'alimento voluto. Due ID che avevo in mente a memoria erano sbagliati e sono stati scartati dopo il controllo (uva americana invece di europea; ananas invece di fichi). Per tutti i 18 i valori letti mostrano 17/17 nutrienti presenti e acido folico = 0 (nessuna firma di arricchimento tipo USA). **Questi valori sono stati letti tramite un riepilogo automatico della pagina: valgono come controllo di plausibilita', non come prova. La prova e' il dry-run dello script, che ri-scarica il record vero.**

**Riallineamento al merge (2026-10-13).** La prima stesura di questo lotto aveva 19 alimenti. La **melanzana e' stata tolta**: `food_melanzane_raw` (stessa FDC 169228) e' gia' stata eseguita dall'utente il 2026-10-12 (vedi "Eseguiti" qui sotto); rilanciarla con un altro food_id avrebbe creato un duplicato nel DB. Anche i **piselli freschi crudi** qui sotto sono un alimento diverso dai piselli bolliti gia' eseguiti (`food_piselli_bolliti`): record FDC 170419 contro 170420, matrice propria `piselli` contro `legumes`. **Nota sui nomi:** i food_id di questo lotto sono in inglese (come il Golden Set originale), mentre le sessioni del 2026-10-12 hanno usato nomi italiani (`food_riso_bianco_raw`, `food_melanzane_raw`, `food_zucchine_raw`...). E' solo un'etichetta, nessun vincolo tecnico; se preferisci uniformarli prima di applicare, dillo e rigenero i comandi.

**Cosa guardare nel dry-run**: (1) la riga `FDC description:` deve coincidere con la descrizione attesa in tabella; (2) `Nutrienti estratti (17/17)` — se e' meno di 17, NON applicare quell'alimento e dimmelo; (3) nessuna riga `ERRORE`.

**Attributi comuni (decisi per analogia, tutti dichiarati, nessuno indovinato):** `is_heme_iron=false` (omesso = false), `matrix_category_calcium` NULL (stesso trattamento di carote/broccoli/patate: le categorie ossalati esistono solo per spinaci/kale/latte), `--carotenoid-matrix-state=raw_intact` per tutti i crudi vegetali (se non lo si passa, il motore tratta il beta-carotene come "cotto" e lo sovrastima del ~57%, vedi `docs/PENDING_HUMAN_ACTIONS.md`), `is_fortified_folate=false`, `zinc_bioaccessibility_bucket=none`. Ogni alimento ha una **matrice propria** (non riusa `leafy_greens`/`legumes`): cosi' non eredita i fattori di ritenzione derivati da spinaci/legumi, che sarebbero sbagliati per lui. Contropartita: nessun fattore di ritenzione finche' non si aggiunge la riga cotta — oggi questi 18 compaiono solo "Crudo".

| # | food_id | FDC ID | Descrizione FDC attesa (la stampa il dry-run) | Dieta |
|---|---|---|---|---|
| 1 | `food_tomato_raw` | 170457 | Tomatoes, red, ripe, raw, year round average | plant_non_fruit |
| 2 | `food_onion_raw` | 170000 | Onions, raw | plant_non_fruit |
| 3 | `food_garlic_fresh_raw` | 169230 | Garlic, raw | plant_non_fruit |
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
- **Aglio, crudo** (`food_garlic_fresh_raw`): Condimento: i valori per 100g sono molto diversi da un'abituale porzione (pochi grammi). **Nome cambiato il 2026-10-14**: il nome originale `food_garlic_raw` esiste gia' nel database come riga legacy del primo seed demo (draft, 8 nutrienti senza fonte, fuori dal Golden Set; stesso gruppo di `food_apple_raw`, `food_beef_raw`... descritto in `fix_baseline_cooking_state.sql`), quindi lo script si sarebbe fermato su quell'alimento. Scoperto dalla query di controllo. La riga legacy NON e' stata toccata (politica: nessuna cancellazione).
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

**Matrice e analogia dichiarata di ciascuno** (dai comandi eseguiti):

| food_id | matrice | analogia |
|---|---|---|
| `food_tomato_raw` | `pomodori` | `food_carrots_raw` |
| `food_onion_raw` | `cipolle` | `food_carrots_raw` |
| `food_garlic_fresh_raw` | `aglio` | `food_carrots_raw` |
| `food_pepper_red_raw` | `peperoni_rossi` | `food_carrots_raw` |
| `food_lettuce_romaine_raw` | `lattuga_romana` | `food_carrots_raw` |
| `food_pumpkin_raw` | `zucca` | `food_carrots_raw` |
| `food_fennel_raw` | `finocchi` | `food_carrots_raw` |
| `food_mushroom_white_raw` | `funghi_champignon` | `food_potato_raw` |
| `food_apple_with_skin_raw` | `mele` | `food_oranges_raw` |
| `food_banana_raw` | `banane` | `food_oranges_raw` |
| `food_pear_raw` | `pere` | `food_oranges_raw` |
| `food_grapes_european_raw` | `uva` | `food_oranges_raw` |
| `food_lemon_peeled_raw` | `limoni` | `food_oranges_raw` |
| `food_strawberry_raw` | `fragole` | `food_oranges_raw` |
| `food_peach_yellow_raw` | `pesche` | `food_oranges_raw` |
| `food_kiwi_green_raw` | `kiwi` | `food_oranges_raw` |
| `food_fig_raw` | `fichi` | `food_oranges_raw` |
| `food_peas_green_raw` | `piselli` | `food_kidney_beans_raw` |

### Ventotto alimenti — ✅ eseguiti dall'utente la notte 2026-10-13/14 (verificati con query di controllo)

- **Esito**: per tutti e 28 l'utente ha lanciato `--apply` sul suo PC (PowerShell) e ha riferito che i comandi sono riusciti senza errori. **Verifica indipendente** con `check_alimenti_aggiunti.sql` (sola lettura, nel repo; eseguita nell'editor SQL di Supabase il 2026-10-14): RIEPILOGO **OK=28**, DA CONTROLLARE=1 (l'aglio, vedi sotto: era un problema del lotto da 18, non di queste esecuzioni), NON PRESENTE=17 (il resto del lotto da 18, non ancora eseguito). "OK" significa: riga presente in `foods_raw`, `verification_status='draft'`, numero di nutrienti in `nutrient_values` >= atteso, dieta (vegetariano/vegano/fruttariano) e stato carotenoidi come previsti dal comando.
- **Cosa quella prima query NON controllava**: la descrizione FDC salvata (`foods_raw.fdc_name`) e il numero FDC. La versione del 2026-10-14, che li controlla, e' stata poi eseguita dopo il lotto da 18 ed e' risultata OK per tutti e 46 (anche per questi 28). Tutti restano `draft`: nessuna promozione a `verified` fatta.

| # | food_id | FDC ID | Record FDC | Dieta (veg/vegan/frutt) | Nutrienti | Analogia dichiarata |
|---|---|---|---|---|---|---|
| 1 | `food_melone_cantalupo_raw` | 169092 | Melons, cantaloupe, raw | t/t/t | 17/17 | `food_oranges_raw` |
| 2 | `food_nocciole_raw` | 170581 | Nuts, hazelnuts or filberts | t/t/f | 17/17 | `food_almonds` |
| 3 | `food_sedano_raw` | 169988 | Celery, raw | t/t/f | 17/17 | `food_carrots_raw` |
| 4 | `food_patata_dolce_raw` | 168482 | Sweet potato, raw, unprepared (Includes foods for USDA's Food Distribution Program) | t/t/f | 17/17 | `food_potato_raw` |
| 5 | `food_asparagi_raw` | 168389 | Asparagus, raw | t/t/f | 17/17 | `food_carrots_raw` |
| 6 | `food_avena_cruda` | 169705 | Oats (Includes foods for USDA's Food Distribution Program) | t/t/f | >=13 | `food_orzo_perlato_raw` |
| 7 | `food_sgombro_raw` | 175119 | Fish, mackerel, Atlantic, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 8 | `food_noci_raw` | 170187 | Nuts, walnuts, english | t/t/f | 17/17 | `food_almonds` |
| 9 | `food_zucchero_bianco` | 169655 | Sugars, granulated | t/t/f | 17/17 | `food_farina_di_mais_raw` |
| 10 | `food_miele` | 169640 | Honey | t/f/f | 17/17 | `food_egg_raw` |
| 11 | `food_burro` | 173430 | Butter, without salt | t/f/f | 17/17 | `food_milk_whole` |
| 12 | `food_yogurt_greco` | 171304 | Yogurt, Greek, plain, whole milk | t/f/f | 17/17 | `food_milk_whole` |
| 13 | `food_yogurt_bianco_intero` | 171284 | Yogurt, plain, whole milk | t/f/f | 17/17 | `food_milk_whole` |
| 14 | `food_ricotta` | 170851 | Cheese, ricotta, whole milk | t/f/f | 17/17 | `food_milk_whole` |
| 15 | `food_mozzarella` | 170845 | Cheese, mozzarella, whole milk | t/f/f | 17/17 | `food_milk_whole` |
| 16 | `food_parmigiano_reggiano` | 170848 | Cheese, parmesan, hard | t/f/f | 17/17 | `food_milk_whole` |
| 17 | `food_vongole_raw` | 174214 | Mollusks, clam, mixed species, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 18 | `food_cozze_raw` | 174216 | Mollusks, mussel, blue, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 19 | `food_acciughe_raw` | 174182 | Fish, anchovy, european, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 20 | `food_merluzzo_raw` | 171955 | Fish, cod, Atlantic, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 21 | `food_tonno_fresco_raw` | 175159 | Fish, tuna, fresh, yellowfin, raw | f/f/f | 17/17 | `food_salmon_raw` |
| 22 | `food_prosciutto_cotto` | 167872 | Pork, cured, ham, boneless, regular (approximately 11% fat), roasted | f/f/f | 17/17 | `food_beef_ground_cooked` |
| 23 | `food_petto_di_pollo_raw` | 171077 | Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw | f/f/f | 17/17 | `food_beef_ground_raw` |
| 24 | `food_coscia_di_pollo_raw` | 173627 | Chicken, broilers or fryers, dark meat, thigh, meat only, raw | f/f/f | 17/17 | `food_beef_ground_raw` |
| 25 | `food_lonza_di_maiale_raw` | 168230 | Pork, fresh, loin, whole, separable lean only, raw | f/f/f | 17/17 | `food_beef_ground_raw` |
| 26 | `food_petto_di_tacchino_raw` | 174515 | Turkey, retail parts, breast, meat only, raw | f/f/f | 17/17 | `food_beef_ground_raw` |
| 27 | `food_fagioli_cannellini_bolliti` | 175203 | Beans, white, mature seeds, cooked, boiled, without salt | t/t/f | 17/17 | `food_kidney_beans_boiled` |
| 28 | `food_fagioli_borlotti_bolliti` | 173736 | Beans, cranberry (roman), mature seeds, cooked, boiled, without salt | t/t/f | >=14 | `food_kidney_beans_boiled` |

**Note per alimento (solo dove serve):**
- `food_avena_cruda`: 13 attesi (mancano selenio, vitamina K, beta-carotene, altri carotenoidi: gap dichiarato, non stimato).
- `food_fagioli_borlotti_bolliti`: almeno 14 attesi (vitamina K e carotenoidi non letti dall'aggregatore in fase di ricerca).
- `food_zucchero_bianco`: 17 righe, di cui 10 con valore 0 esplicito nel record (non assenti); botanical_family lasciata NULL di proposito.
- `food_patata_dolce_raw`: botanical_family Convolvulaceae (NON quella della patata comune).
- `food_nocciole_raw`: analogia `food_almonds`; botanical_family Betulaceae.
- `food_noci_raw`: analogia `food_almonds`; botanical_family Juglandaceae.
- `food_miele`: dieta egg_dairy (vegetariano SI, vegano NO).
- `food_burro`: dieta egg_dairy (vegetariano SI, vegano NO).
- **Acciughe** (`food_acciughe_raw`): l'FDC ID 174182 era stato dedotto in modo indiretto in fase di ricerca (pagina di confronto + numerazione), non aprendo il record. **Verificato il 2026-10-14**: la nuova `check_alimenti_aggiunti.sql` confronta la descrizione FDC salvata con "Fish, anchovy, european, raw" ed e' OK (OK=46, DA CONTROLLARE=0): il record FDC 174182 e' quello giusto.
- Le voci complete di questi 28 (comandi, valori letti, fonti consultate, piani B) restano nella cronologia git di questo file, fino al commit `db38419` compreso.

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
