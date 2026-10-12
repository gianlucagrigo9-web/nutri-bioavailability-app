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

> **Nota (2026-10-13) sulla classificazione dieta degli alimenti qui sotto.** Furono inseriti con la versione di `add-food` precedente alla correzione `--diet-category`, quindi con le tre colonne `diet_compat_*` a NULL ("non classificato": esclusi dai filtri vegetariano/vegano/fruttariano). Il 2026-10-13 `fix_diet_compat_pipeline_foods.sql` e' stato eseguito sul DB reale: per la zucchina l'esito e' **verificato direttamente** (query su Supabase: vegetarian=true, vegan=true, fruitarian=false); per gli altri alimenti l'esecuzione e il controllo finale sono **confermati a voce dall'utente** ("per supabase conferma io"), senza uno screenshot rivisto da questa sessione — stesso livello di confidenza gia' dichiarato per i piselli. Per gli alimenti eseguiti da qui in poi non serve nessun fix: lo script scrive la classificazione da solo.

### Zucchine, crude (con buccia) — ✅ gia' presente nel DB reale (rilevato 2026-10-13)

- **food_id**: `food_zucchine_raw`. FDC ID 169291 (SR Legacy, "Squash, summer, zucchini, includes skin, raw").
- **Come e' emerso**: il dry-run del 2026-10-13 (con `--diet-category`) si e' fermato con l'errore dello script "food_id esiste gia' in foods_raw" — il controllo anti-doppioni ha funzionato. L'alimento era quindi stato applicato prima, con ogni probabilita' con la versione vecchia di `add-food`. **Data ed esito di quell'`--apply` non sono documentati qui** (il log non e' stato rivisto in chat): c'e' solo lo stato risultante, verificato sotto.
- **Stato verificato sul DB reale** (query su Supabase eseguita dall'utente, screenshot del 2026-10-13): `fdc_id`=169291, `verification_status`=draft, `carotenoid_matrix_state`=raw_intact, 17 righe `nutrient_values` (source USDA_FDC), classificazione dieta vegetarian=true / vegan=true / fruitarian=false (scritta da `fix_diet_compat_pipeline_foods.sql`). Analogia (`food_carrots_raw`) e famiglia botanica (Cucurbitaceae) sono quelle del comando preparato; non sono state rilette dal DB in quella query.
- Resta `verification_status='draft'` finche' una revisione umana o meccanica non lo promuove esplicitamente — non ancora fatto.

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
