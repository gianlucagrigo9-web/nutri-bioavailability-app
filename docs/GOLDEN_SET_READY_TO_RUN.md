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

### Animelle d'agnello (pancreas), crude — preparato 2026-10-20 dal task orario (ventesimo lotto)

- **food_id**: `food_animelle_di_agnello_raw`. FDC ID 172538 (SR Legacy, "Lamb, variety meats and by-products, pancreas, raw").
- **Nutrienti**: **14/17**. Energia 152kcal, proteine 14,8g, grassi 9,82g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,30mg, zinco 1,93mg, calcio 8,00mg, rame 0,061mg, magnesio 21,0mg, selenio 34,3µg, vitamina C 18,0mg, vitamina B12 6,00µg, folato totale 13,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record (vitamina A RAE/retinolo riportati esplicitamente a 0µg, non mancanti). Nota terminologica: "animelle" in cucina italiana indica tipicamente il timo (sweetbread), ma FDC traccia solo il pancreas per questa specie/categoria — stesso termine commerciale italiano, organo anatomicamente diverso (il timo non ha un record FDC distinto per l'agnello); scelto comunque il pancreas come il record FDC più vicino al concetto commerciale di "animelle", nessun record alternativo per il timo trovato in nessuna fonte consultata. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172538 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo", `is_heme_iron=true`, stessa convenzione usata per le altre frattaglie d'agnello crude in questo stesso lotto).
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `animelle_di_agnello` ("Animelle di agnello (pancreas)").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172538 --food-id=food_animelle_di_agnello_raw \
  --name-it="Animelle d'agnello (pancreas), crude" \
  --matrix-id=animelle_di_agnello --matrix-description-it="Animelle di agnello (pancreas)" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172538 --food-id=food_animelle_di_agnello_raw \
  --name-it="Animelle d'agnello (pancreas), crude" \
  --matrix-id=animelle_di_agnello --matrix-description-it="Animelle di agnello (pancreas)" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Milza d'agnello, cruda — preparato 2026-10-20 dal task orario (ventesimo lotto)

- **food_id**: `food_milza_di_agnello_raw`. FDC ID 174364 (SR Legacy, "Lamb, variety meats and by-products, spleen, raw").
- **Nutrienti**: **14/17**. Energia 101kcal, proteine 17,2g, grassi 3,10g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 41,9mg, zinco 2,84mg, calcio 9,00mg, rame 0,12mg, magnesio 21,0mg, selenio 32,4µg, vitamina C 23,0mg, vitamina B12 5,34µg, folato totale 4,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile alla carne). Ferro fortemente elevato, coerente con un organo linfoematopoietico ricco di sangue come la milza (stesso tipo di valore già visto per la milza di maiale, 22,3mg/100g, in questa stessa coda). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record (vitamina A RAE/retinolo riportati esplicitamente a 0µg, non mancanti). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174364 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo ricco di ferro", `is_heme_iron=true`; stessa convenzione già usata per la milza di maiale cruda nel diciannovesimo lotto, non riusabile come analogia perché ancora solo "pronta").
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `milza_di_agnello` ("Milza di agnello").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174364 --food-id=food_milza_di_agnello_raw \
  --name-it="Milza d'agnello, cruda" \
  --matrix-id=milza_di_agnello --matrix-description-it="Milza di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174364 --food-id=food_milza_di_agnello_raw \
  --name-it="Milza d'agnello, cruda" \
  --matrix-id=milza_di_agnello --matrix-description-it="Milza di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore d'agnello, crudo — preparato 2026-10-20 dal task orario (ventesimo lotto)

- **food_id**: `food_cuore_di_agnello_raw`. FDC ID 172527 (SR Legacy, "Lamb, variety meats and by-products, heart, raw").
- **Nutrienti**: **14/17**. Energia 122kcal, proteine 16,5g, grassi 5,68g, carboidrati 0,21g, fibra 0g esplicito, ferro 4,60mg, zinco 1,87mg, calcio 6,00mg, rame 0,40mg, magnesio 17,0mg, selenio 32,0µg, vitamina C 5,00mg, vitamina B12 10,3µg, folato totale 2,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record (vitamina A RAE/retinolo riportati esplicitamente a 0µg, non mancanti). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172527 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo ricco di ferro", `is_heme_iron=true`; distinto dal cuore d'agnello COTTO, già 🟡 dal diciassettesimo lotto con FDC 172528, non riusabile come analogia perché non ancora eseguito sul DB reale).
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `cuore_di_agnello` ("Cuore di agnello").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172527 --food-id=food_cuore_di_agnello_raw \
  --name-it="Cuore d'agnello, crudo" \
  --matrix-id=cuore_di_agnello --matrix-description-it="Cuore di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172527 --food-id=food_cuore_di_agnello_raw \
  --name-it="Cuore d'agnello, crudo" \
  --matrix-id=cuore_di_agnello --matrix-description-it="Cuore di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone d'agnello, crudo — preparato 2026-10-20 dal task orario (ventesimo lotto)

- **food_id**: `food_rognone_di_agnello_raw`. FDC ID 174354 (SR Legacy, "Lamb, variety meats and by-products, kidneys, raw").
- **Nutrienti**: **14/17**. Energia 97,0kcal, proteine 15,7g, grassi 2,95g, carboidrati 0,82g, fibra 0g esplicito, ferro 6,38mg, zinco 2,24mg, calcio 13,0mg, rame 0,45mg, magnesio 17,0mg, selenio 127µg, vitamina C 11,0mg, vitamina B12 52,4µg, folato totale 28,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174354 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo ricco di ferro", `is_heme_iron=true`; distinto dal rognone d'agnello COTTO, già 🟡 dal diciassettesimo lotto con FDC 174355, non riusabile come analogia perché non ancora eseguito sul DB reale).
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `rognone_di_agnello` ("Rognone di agnello").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174354 --food-id=food_rognone_di_agnello_raw \
  --name-it="Rognone d'agnello, crudo" \
  --matrix-id=rognone_di_agnello --matrix-description-it="Rognone di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174354 --food-id=food_rognone_di_agnello_raw \
  --name-it="Rognone d'agnello, crudo" \
  --matrix-id=rognone_di_agnello --matrix-description-it="Rognone di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Fegato d'agnello, crudo — preparato 2026-10-20 dal task orario (ventesimo lotto)

- **food_id**: `food_fegato_di_agnello_raw`. FDC ID 172531 (SR Legacy, "Lamb, variety meats and by-products, liver, raw").
- **Nutrienti**: **15/17**. Energia 139kcal, proteine 20,4g, grassi 5,02g, carboidrati 1,78g, fibra 0g esplicito, ferro 7,37mg, zinco 4,66mg, calcio 7,00mg, rame 6,98mg, magnesio 19,0mg, selenio 82,4µg, vitamina C 4,00mg, vitamina B12 90,0µg, folato totale 230µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record (stesso gap tipico già visto su fegato di manzo/vitello/maiale in questa pipeline). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172531 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo ricco di ferro", `is_heme_iron=true`; distinto dal fegato d'agnello COTTO, già 🟡 dal diciassettesimo lotto con FDC 172532, non riusabile come analogia perché non ancora eseguito sul DB reale).
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `fegato_di_agnello` ("Fegato di agnello").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172531 --food-id=food_fegato_di_agnello_raw \
  --name-it="Fegato d'agnello, crudo" \
  --matrix-id=fegato_di_agnello --matrix-description-it="Fegato di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172531 --food-id=food_fegato_di_agnello_raw \
  --name-it="Fegato d'agnello, crudo" \
  --matrix-id=fegato_di_agnello --matrix-description-it="Fegato di agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Latte di pecora, crudo — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_latte_di_pecora_raw`. FDC ID 170882 (SR Legacy, "Milk, sheep, fluid").
- **Nutrienti**: **14/17**. Energia 108kcal, proteine 5,98g, grassi 7,00g, carboidrati 5,36g, fibra 0g esplicito, ferro 0,10mg, zinco 0,54mg, calcio 193mg, rame 0,046mg, magnesio 18,0mg, selenio 1,70µg, vitamina C 4,20mg, vitamina B12 0,71µg, folato totale 7,00µg, acido folico 0µg esplicito separato. **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record. Nessuna firma di arricchimento: la pagina non menziona vitamina D aggiunta (a differenza di `food_milk_whole` vaccino, che la riporta esplicitamente — ma la vitamina D non è un nutriente tracciato da questo motore, quindi la differenza non ha effetto pratico). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170882 e dataType SR Legacy.
- **Analogia usata**: `food_milk_whole` (Golden Set originale, latte vaccino intero — già eseguito sul DB reale. Stessa categoria "latte liquido", `matrix_category_calcium=medium_oxalate`; distinto dal pecorino romano, già ⚠ in questa pipeline per lo stesso motivo del latte non specificato, e da feta/formaggio caprino, che non sono latte liquido).
- **Categoria dieta**: `egg_dairy` (latte).
- **Matrice**: nuova `latte_di_pecora` ("Latte di pecora").
- **Attributi**: `is_heme_iron` omesso (false, come il latte vaccino), `matrix_category_calcium=medium_oxalate` (per analogia diretta con `food_milk_whole`), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170882 --food-id=food_latte_di_pecora_raw \
  --name-it="Latte di pecora, crudo" \
  --matrix-id=latte_di_pecora --matrix-description-it="Latte di pecora" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170882 --food-id=food_latte_di_pecora_raw \
  --name-it="Latte di pecora, crudo" \
  --matrix-id=latte_di_pecora --matrix-description-it="Latte di pecora" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
```

### Nespola, cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_nespola_raw`. FDC ID 169908 (SR Legacy, "Loquats, raw").
- **Nutrienti**: **14/17**. Energia 47,0kcal, proteine 0,43g, grassi 0,20g, carboidrati 12,1g, fibra 1,70g, ferro 0,28mg, zinco 0,050mg, calcio 16,0mg, rame 0,040mg, magnesio 13,0mg, selenio 0,60µg, vitamina C 1,00mg, vitamina B12 0µg esplicito, folato totale 14,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169908 e dataType SR Legacy.
- **Analogia usata**: `food_peach_yellow_raw` (pesche gialle, crude — già eseguite sul DB reale. Stessa famiglia botanica reale Rosaceae della nespola, *Eriobotrya japonica*; frutto fresco a polpa carnosa).
- **Categoria dieta**: `fresh_fruit` (frutta fresca nella definizione restrittiva del PRD §4.9).
- **Matrice**: nuova `nespola` ("Nespola").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — nessun valore di carotenoidi presente nel record a cui applicare il fattore matrice, nessuna stima aggiunta), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169908 --food-id=food_nespola_raw \
  --name-it="Nespola, cruda" \
  --matrix-id=nespola --matrix-description-it="Nespola" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=169908 --food-id=food_nespola_raw \
  --name-it="Nespola, cruda" \
  --matrix-id=nespola --matrix-description-it="Nespola" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### Milza di maiale, cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_milza_di_maiale_raw`. FDC ID 167865 (SR Legacy, "Pork, fresh, variety meats and by-products, spleen, raw").
- **Nutrienti**: **14/17**. Energia 100kcal, proteine 17,9g, grassi 2,6g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 22,3mg, zinco 2,5mg, calcio 10,0mg, rame 0,13mg, magnesio 13,0mg, selenio 32,8µg, vitamina C 28,5mg, vitamina B12 3,3µg, folato totale 4,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record. Ferro molto alto, coerente con un organo linfoematopoietico ricco di sangue come la milza (stesso ordine di grandezza del fegato già nel Golden Set).
- **Nota sulla fonte (FDC ID non aperto direttamente)**: nessuna pagina individuale getfoodfacts.com risulta indicizzata per questo record, ma l'FDC ID 167865 è confermato dallo slug della pagina di confronto getfoodfacts.com stessa (`.../pork-fresh-variety-meats-and-by-products-spleen-raw-167865/...`) e corroborato da due fonti indipendenti concordanti: triagemethod.com (etichetta esplicitamente i valori come "SR (USDA Standard Reference Legacy)") e recipal.com (cita "USDA database, NBD ID: 10117"). I valori numerici coincidono fra le due fonti entro l'arrotondamento (ferro 22,3 vs ~22,5mg/100g, selenio 32,8 vs ~32,1µg/100g, energia 100 vs 100,0kcal, proteine 17,9 vs 17,86g, vitamina C 28,5 vs ~28,6mg/100g) — stesso tipo di verifica indiretta già accettato per `food_petto_di_pollo_raw` in questa pipeline (fetch diretto non riuscito, verifica primaria da 3 fonti concordanti).
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria "frattaglia/organo crudo ricco di ferro", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (carne/frattaglia).
- **Matrice**: nuova `milza_di_maiale` ("Milza di maiale").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167865 --food-id=food_milza_di_maiale_raw \
  --name-it="Milza di maiale, cruda" \
  --matrix-id=milza_di_maiale --matrix-description-it="Milza di maiale" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=167865 --food-id=food_milza_di_maiale_raw \
  --name-it="Milza di maiale, cruda" \
  --matrix-id=milza_di_maiale --matrix-description-it="Milza di maiale" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cavallo, carne cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_cavallo_raw`. FDC ID 175086 (SR Legacy, "Game meat, horse, raw").
- **Nutrienti**: **13/17**. Energia 133kcal, proteine 21,4g, grassi 4,60g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 3,82mg, zinco 2,90mg, calcio 6,00mg, rame 0,14mg, magnesio 24,0mg, selenio 10,1µg, vitamina C 1,00mg, vitamina B12 3,00µg. **Mancano**: vitamina K, folato totale, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record (il gap su folato è più ampio del solito per questa coda, dove la maggior parte delle carni riporta almeno un valore di folato anche piccolo, ma 13/17 resta sopra la soglia minima di match debole già usata in questa coda, ~10/17). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175086 e dataType SR Legacy; valori con precisione realistica (es. rame 0,14mg/100g), nessun segno di valori segnaposto.
- **Analogia usata**: `food_beef_ground_raw` (Golden Set originale, manzo macinato (85% magro), crudo — già eseguito sul DB reale. Stessa convenzione categorica già usata per vitello/agnello/coniglio in questa pipeline: carne rossa magra cruda, specie diversa dal bovino ma trattata in modo equivalente, `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `cavallo` ("Cavallo").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175086 --food-id=food_cavallo_raw \
  --name-it="Cavallo, carne cruda" \
  --matrix-id=cavallo --matrix-description-it="Cavallo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175086 --food-id=food_cavallo_raw \
  --name-it="Cavallo, carne cruda" \
  --matrix-id=cavallo --matrix-description-it="Cavallo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Capra, carne cotta (arrosto) — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_capra_cotta`. FDC ID 175304 (SR Legacy, "Game meat, goat, cooked, roasted").
- **Nutrienti**: **16/17** — il record più completo di questo lotto. Energia 143kcal, proteine 27,1g, grassi 3,03g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 3,73mg, zinco 5,27mg, calcio 17,0mg, rame 0,30mg, magnesio 0mg esplicito, selenio 11,8µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 1,20µg, vitamina B12 1,19µg, folato totale 5,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito. **Manca solo**: il composito `other_provitamin_a_carotenoids_mcg` (alfa-carotene/beta-criptoxantina), non riportato nel record. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175304 e dataType SR Legacy.
- **Analogia usata**: `food_beef_ground_cooked` (Golden Set originale, manzo macinato cotto alla griglia — già eseguito sul DB reale. `food_capra_raw`, pur più precisa per la specie, esiste solo come voce "pronta" in questo stesso lotto, non ancora eseguita — l'analogia deve riferirsi a un alimento già reale nel DB; attributi categorici — `is_heme_iron` — identici fra carne rossa cruda e cotta, indipendenti dallo stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `capra_cotta` ("Capra, cotta").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175304 --food-id=food_capra_cotta \
  --name-it="Capra, carne cotta (arrosto)" \
  --matrix-id=capra_cotta --matrix-description-it="Capra, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175304 --food-id=food_capra_cotta \
  --name-it="Capra, carne cotta (arrosto)" \
  --matrix-id=capra_cotta --matrix-description-it="Capra, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Capra, carne cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_capra_raw`. FDC ID 175303 (SR Legacy, "Game meat, goat, raw").
- **Nutrienti**: **13/17**. Energia 109kcal, proteine 20,6g, grassi 2,31g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,83mg, zinco 4,00mg, calcio 13,0mg, rame 0,26mg, selenio 8,80µg, vitamina C 0mg esplicito, vitamina B12 1,13µg, folato totale 5,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: magnesio, vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175303 e dataType SR Legacy.
- **Analogia usata**: `food_agnello_raw` (agnello, carne cruda — già eseguito sul DB reale. Stessa sottofamiglia zoologica Caprinae (capra e pecora/agnello sono parenti stretti), carne rossa magra cruda, `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `capra` ("Capra").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175303 --food-id=food_capra_raw \
  --name-it="Capra, carne cruda" \
  --matrix-id=capra --matrix-description-it="Capra" \
  --baseline-cooking-state=raw --analogy-food-id=food_agnello_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175303 --food-id=food_capra_raw \
  --name-it="Capra, carne cruda" \
  --matrix-id=capra --matrix-description-it="Capra" \
  --baseline-cooking-state=raw --analogy-food-id=food_agnello_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Faraona, carne senza pelle, cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_faraona_raw`. FDC ID 174471 (SR Legacy, "Guinea hen, meat only, raw").
- **Nutrienti**: **14/17**. Energia 110kcal, proteine 20,6g, grassi 2,47g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 0,77mg, zinco 1,20mg, calcio 11,0mg, rame 0,044mg, magnesio 24,0mg, selenio 17,5µg, vitamina C 1,70mg, vitamina B12 0,37µg, folato totale 6,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento, non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — non riportati nel record, stesso gap tipico già visto per oca/anatra/agnello in questa pipeline. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174471 e dataType SR Legacy. Nessun record "cooked"/cotto trovato per la faraona in nessuna fonte consultata (getfoodfacts.com, triagemethod.com, foodnutrify.com) — solo il crudo è indicizzato.
- **Analogia usata**: `food_petto_di_pollo_raw` (petto di pollo, pollame, carne senza pelle, crudo — già eseguito sul DB reale. Stessa categoria "pollame, carne magra senza pelle, cruda", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `faraona` ("Faraona").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174471 --food-id=food_faraona_raw \
  --name-it="Faraona, carne senza pelle, cruda" \
  --matrix-id=faraona --matrix-description-it="Faraona" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174471 --food-id=food_faraona_raw \
  --name-it="Faraona, carne senza pelle, cruda" \
  --matrix-id=faraona --matrix-description-it="Faraona" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Oca, cotta (arrosto) — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_oca_cotta`. FDC ID 172414 (SR Legacy, "Goose, domesticated, meat only, cooked, roasted").
- **Nutrienti**: **14/17**. Energia 238kcal, proteine 29,0g, grassi 12,7g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,87mg, zinco 3,17mg, calcio 14,0mg, rame 0,28mg, magnesio 25,0mg, selenio 25,5µg, vitamina C 0mg esplicito, vitamina B12 0,49µg, folato totale 12,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap del crudo `food_oca_raw` (solo "pronto" in questo stesso lotto, non ancora eseguito). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172414 e dataType SR Legacy.
- **Analogia usata**: `food_anatra_raw` (anatra, carne senza pelle, cruda — già eseguita sul DB reale. `food_anatra_cotta`, pur più precisa per lo stato di cottura, esiste solo come voce "pronta" non ancora eseguita nel Golden Set, quindi non riusabile come analogia per questa regola; l'analogia riguarda gli attributi categorici — `is_heme_iron` — non il valore nutrizionale, non influenzati dallo stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `oca_cotta` ("Oca, cotta").
- **Attributi**: `is_heme_iron` presente (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172414 --food-id=food_oca_cotta \
  --name-it="Oca, cotta (arrosto)" \
  --matrix-id=oca_cotta --matrix-description-it="Oca, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172414 --food-id=food_oca_cotta \
  --name-it="Oca, cotta (arrosto)" \
  --matrix-id=oca_cotta --matrix-description-it="Oca, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Oca, carne senza pelle, cruda — preparato 2026-10-20 dal task orario (diciannovesimo lotto)

- **food_id**: `food_oca_raw`. FDC ID 172413 (SR Legacy, "Goose, domesticated, meat only, raw").
- **Nutrienti**: **14/17**. Energia 161kcal, proteine 22,8g, grassi 7,13g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,57mg, zinco 2,34mg, calcio 13,0mg, rame 0,31mg, magnesio 24,0mg, selenio 16,8µg, vitamina C 7,20mg, vitamina B12 0,49µg, folato totale 31,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento, comunque non applicabile alla carne). **Mancano**: vitamina K, beta-carotene, altri carotenoidi provitaminici A (`other_provitamin_a_carotenoids_mcg`) — non riportati nel record, non assunti zero; stesso gap tipico già visto per anatra/agnello/coniglio/vitello crudi in questa pipeline. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172413 e dataType SR Legacy.
- **Analogia usata**: `food_anatra_raw` (anatra, carne senza pelle, cruda — già eseguita sul DB reale. Stessa categoria "pollame, carne senza pelle, cruda", `is_heme_iron=true` come la carne di anatra).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `oca` ("Oca").
- **Attributi**: `is_heme_iron` presente (true, come anatra/pollo/tacchino), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172413 --food-id=food_oca_raw \
  --name-it="Oca, carne senza pelle, cruda" \
  --matrix-id=oca --matrix-description-it="Oca" \
  --baseline-cooking-state=raw --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172413 --food-id=food_oca_raw \
  --name-it="Oca, carne senza pelle, cruda" \
  --matrix-id=oca --matrix-description-it="Oca" \
  --baseline-cooking-state=raw --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Albume d'uovo, crudo — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_albume_uovo_raw`. FDC ID 172183 (SR Legacy, "Egg, white, raw, fresh").
- **Nutrienti**: **17/17**, nessun gap. Energia 52,0kcal, proteine 10,9g, grassi 0,17g, carboidrati 0,73g, fibra 0g esplicito, ferro 0,080mg, zinco 0,030mg, calcio 7,00mg, rame 0,023mg, magnesio 11,0mg, selenio 20,0µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0,090µg, folato totale 4,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti — tutti coerenti con un albume privo di tuorlo/pigmenti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172183 e dataType SR Legacy.
- **Analogia usata**: `food_egg_raw` (Golden Set originale, uovo intero crudo — già eseguito sul DB reale. Stessa categoria "uovo crudo", `is_heme_iron=false` come l'uovo intero).
- **Categoria dieta**: `egg_dairy` (uovo).
- **Matrice**: nuova `albume_uovo_raw` ("Albume d'uovo, crudo").
- **Attributi**: `is_heme_iron` omesso (false, come l'uovo intero), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172183 --food-id=food_albume_uovo_raw \
  --name-it="Albume d'uovo, crudo" \
  --matrix-id=albume_uovo_raw --matrix-description-it="Albume d'uovo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172183 --food-id=food_albume_uovo_raw \
  --name-it="Albume d'uovo, crudo" \
  --matrix-id=albume_uovo_raw --matrix-description-it="Albume d'uovo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy --apply
```

### Tuorlo d'uovo, crudo — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_tuorlo_uovo_raw`. FDC ID 172184 (SR Legacy, "Egg, yolk, raw, fresh").
- **Nutrienti**: **17/17**, nessun gap. Energia 322kcal, proteine 15,9g, grassi 26,5g, carboidrati 3,59g, fibra 0g esplicito, ferro 2,73mg, zinco 2,30mg, calcio 129mg, rame 0,077mg, magnesio 5,00mg, selenio 56,0µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 0,70µg, vitamina B12 1,95µg, folato totale 146µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 88,0µg, alfa-carotene 38,0µg, beta-criptoxantina 33,0µg — questi ultimi tre valori reali e non nulli, plausibili per il pigmento del tuorlo. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172184 e dataType SR Legacy.
- **Analogia usata**: `food_egg_raw` (Golden Set originale, uovo intero crudo — già eseguito sul DB reale. Stessa categoria "uovo crudo", `is_heme_iron=false`).
- **Categoria dieta**: `egg_dairy` (uovo).
- **Matrice**: nuova `tuorlo_uovo_raw` ("Tuorlo d'uovo, crudo").
- **Attributi**: `is_heme_iron` omesso (false, come l'uovo intero), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — **nota di trasparenza**: il tuorlo riporta valori reali di carotenoidi, non nulli, ma questo progetto non ha un fattore di bioaccessibilità "matrice" specifico per il tuorlo d'uovo distinto dal valore grezzo FDC; NULL segue la stessa convenzione già usata per `food_egg_raw` e per le uova di quaglia crude, nessuna stima aggiunta, il valore nutriente resta quello riportato da FDC), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172184 --food-id=food_tuorlo_uovo_raw \
  --name-it="Tuorlo d'uovo, crudo" \
  --matrix-id=tuorlo_uovo_raw --matrix-description-it="Tuorlo d'uovo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172184 --food-id=food_tuorlo_uovo_raw \
  --name-it="Tuorlo d'uovo, crudo" \
  --matrix-id=tuorlo_uovo_raw --matrix-description-it="Tuorlo d'uovo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy --apply
```

### Fiocchi d'avena, crudi — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_fiocchi_di_avena_raw`. FDC ID 173904 (SR Legacy, "Cereals, oats, regular and quick, not fortified, dry").
- **Nutrienti**: **17/17**, nessun gap. Energia 379kcal, proteine 13,2g, grassi 6,52g, carboidrati 67,7g, fibra 10,1g, ferro 4,25mg, zinco 3,64mg, calcio 52,0mg, rame 0,39mg, magnesio 138mg, selenio 28,9µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,00µg, vitamina B12 0µg esplicito, folato totale 32,0µg, acido folico 0µg esplicito separato, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Titolo del record esplicito "not fortified"; la pagina riporta anche "Vitamin E, added" e "Vitamin B-12, added" entrambi a 0 — nessuna firma di arricchimento, stesso controllo già fatto per `food_farina_di_avena_raw`. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173904 e dataType SR Legacy. **Distinto** da FDC 169741 "Oat flour, partially debranned" (già usato per `food_farina_di_avena_raw`, eseguito sul DB reale) — fiocchi interi non macinati, non lo stesso prodotto sotto altro nome. Scartato il record Foundation Foods FDC 2346396 "Oats, whole grain, rolled, old fashioned": copertura nutrienti insufficiente (~8-9/17, mancano vitamina C/K/B12/acido folico/tutti i carotenoidi; fibra riportata in modo incoerente fra sezioni della stessa pagina — 0g sul riepilogo, "not declared" sull'etichetta, assente dalla tabella dei 29 nutrienti).
- **Analogia usata**: `food_avena_cruda` (avena cruda in grani, già eseguita sul DB reale — stessa specie *Avena sativa*, famiglia botanica reale Poaceae; differisce solo per il grado di lavorazione — grani interi vs fiocchi).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `fiocchi_di_avena_raw` ("Fiocchi d'avena, crudi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento, titolo "not fortified").

```
npm run add-food -- --fdc-id=173904 --food-id=food_fiocchi_di_avena_raw \
  --name-it="Fiocchi d'avena, crudi" \
  --matrix-id=fiocchi_di_avena_raw --matrix-description-it="Fiocchi d'avena, crudi" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173904 --food-id=food_fiocchi_di_avena_raw \
  --name-it="Fiocchi d'avena, crudi" \
  --matrix-id=fiocchi_di_avena_raw --matrix-description-it="Fiocchi d'avena, crudi" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Pastinaca, cruda — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_pastinaca_raw`. FDC ID 170417 (SR Legacy, "Parsnips, raw").
- **Nutrienti**: **17/17**, nessun gap. Energia 75,0kcal, proteine 1,20g, grassi 0,30g, carboidrati 18,0g, fibra 4,90g, ferro 0,59mg, zinco 0,59mg, calcio 36,0mg, rame 0,12mg, magnesio 29,0mg, selenio 1,80µg, vitamina C 17,0mg, vitamina K (fillochinone) 22,5µg, vitamina B12 0µg esplicito, folato totale 67,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti — coerente con una radice pallida priva di pigmento carotenoide, non un gap di dato. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170417 e dataType SR Legacy.
- **Analogia usata**: `food_carrots_raw` (Golden Set originale, carote crude — già eseguite sul DB reale. Stessa famiglia botanica reale Apiaceae, stesso tipo di radice).
- **Categoria dieta**: `plant_non_fruit` (verdura/radice).
- **Matrice**: nuova `pastinaca_raw` ("Pastinaca, cruda").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, come le carote), `carotenoid_matrix_state=raw_intact` (come le carote, stessa famiglia; beta-carotene comunque 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=170417 --food-id=food_pastinaca_raw \
  --name-it="Pastinaca, cruda" \
  --matrix-id=pastinaca_raw --matrix-description-it="Pastinaca, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Apiaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170417 --food-id=food_pastinaca_raw \
  --name-it="Pastinaca, cruda" \
  --matrix-id=pastinaca_raw --matrix-description-it="Pastinaca, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Apiaceae \
  --diet-category=plant_non_fruit --apply
```

### Songino (valerianella), crudo — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_songino_raw`. FDC ID 169219 (SR Legacy, "Cornsalad, raw" — nome comune inglese del songino/valerianella, *Valerianella locusta*).
- **Nutrienti**: **13/17**. Energia 21,0kcal, proteine 2,00g, grassi 0,40g, carboidrati 3,60g, ferro 2,18mg, zinco 0,59mg, calcio 38,0mg, rame 0,13mg, magnesio 13,0mg, selenio 0,90µg, vitamina C 38,2mg, vitamina B12 0µg esplicito, folato totale 14,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record, non assunti zero): fibra, vitamina K, beta-carotene, l'altro carotenoide provitaminico A (alfa-carotene/beta-criptoxantina) — gap dichiarato, sopra la soglia minima già accettata per altre insalate di questo progetto (indivia belga/cardi 14/17, radicchio 12/17). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169219 e dataType SR Legacy; nota interna sulla fibra, riportata "0g" in un riepilogo ma "non dichiarata"/assente altrove sulla stessa pagina — trattata qui come non riportata, non come zero.
- **Analogia usata**: `food_lettuce_romaine_raw` (lattuga romana, già eseguita sul DB reale — stessa convenzione "insalata a foglia cruda" già usata per scarola/indivia belga/cardi/radicchio in questa coda, pur trattandosi di famiglie botaniche reali diverse: la valerianella è Valerianaceae/Caprifoliaceae, non Asteraceae).
- **Categoria dieta**: `plant_non_fruit` (verdura a foglia).
- **Matrice**: nuova `songino_raw` ("Songino (valerianella), crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, come lattuga/scarola — non un'insalata notoriamente ad alto oxalato come spinaci/bietole), `carotenoid_matrix_state=raw_intact` (crudo, stessa convenzione delle altre insalate crude di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Valerianaceae` (famiglia botanica reale della pianta, oggi inclusa in Caprifoliaceae secondo APG IV; non Asteraceae come l'analogia dichiarata), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169219 --food-id=food_songino_raw \
  --name-it="Songino (valerianella), crudo" \
  --matrix-id=songino_raw --matrix-description-it="Songino (valerianella), crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Valerianaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169219 --food-id=food_songino_raw \
  --name-it="Songino (valerianella), crudo" \
  --matrix-id=songino_raw --matrix-description-it="Songino (valerianella), crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Valerianaceae \
  --diet-category=plant_non_fruit --apply
```

### Pancetta, cruda (non affumicata) — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_pancetta_raw`. FDC ID 168277 (SR Legacy, "Pork, cured, bacon, unprepared").
- **Nutrienti**: **17/17**, nessun gap. Energia 393kcal/100g (444kcal per porzione da 113g), proteine 13,6g/100g, grassi 37,2g/100g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 0,38mg/100g, zinco 1,14mg/100g, calcio 6,00mg/100g, rame 0,046mg/100g, magnesio 13,0mg/100g, selenio 20,1µg/100g, vitamina C 0mg esplicito, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0,50µg/100g, folato totale 0µg esplicito, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Sodio 751mg/100g, atteso per un salume stagionato/salato (curatura), non una firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168277 e dataType SR Legacy.
- **Nota di trasparenza**: il "bacon" USA e la pancetta italiana non sono lo stesso prodotto (il bacon USA è tipicamente più salato e spesso affumicato in pratica, anche se qui non dichiarato — la descrizione FDC non menziona affumicatura né additivi oltre "cured"/"unprepared"), ma è il record FDC generico più vicino trovato — stesso tipo di approssimazione già accettata per il prosciutto cotto in questa coda (record USA per un salume italiano affine).
- **Analogia usata**: `food_beef_ground_cooked` (Golden Set originale, già eseguito sul DB reale — stessa convenzione "carne processata" già usata per `food_prosciutto_cotto`, `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (salume/carne di maiale).
- **Matrice**: nuova `pancetta_raw` ("Pancetta, cruda").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw` (FDC "unprepared" — non cotta/fritta), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168277 --food-id=food_pancetta_raw \
  --name-it="Pancetta, cruda (non affumicata)" \
  --matrix-id=pancetta_raw --matrix-description-it="Pancetta, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168277 --food-id=food_pancetta_raw \
  --name-it="Pancetta, cruda (non affumicata)" \
  --matrix-id=pancetta_raw --matrix-description-it="Pancetta, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Seppia, cotta (bollita) — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_seppia_cotta`. FDC ID 172010 (SR Legacy, "Mollusks, cuttlefish, mixed species, cooked, moist heat").
- **Nutrienti**: **14/17**. Energia 158kcal, proteine 32,5g, grassi 1,40g, carboidrati 1,64g, fibra 0g esplicito, ferro 10,8mg, zinco 3,46mg, calcio 180mg, rame 1,0mg, magnesio 60,0mg, selenio 89,6µg, vitamina C 8,50mg, vitamina B12 5,40µg, folato totale 24,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record, non assunti zero): vitamina K, beta-carotene, l'altro carotenoide provitaminico A — stesso identico gap già presente nella sorella cruda `food_seppia_raw` (FDC 174215, SOLO "pronta" in questa coda, non ancora eseguita sul DB reale). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172010 e dataType SR Legacy.
- **Analogia usata**: `food_vongole_raw` (Golden Set, vongole crude — già eseguite sul DB reale. Stessa categoria "mollusco", stessa convenzione già usata per vongole/cozze cotte in code precedenti — non `food_seppia_raw`, che resta solo "pronta", non eseguita).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `seppia_cotta` ("Seppia, cotta").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per vongole/cozze/capesante/astice in questa coda, analogia `food_vongole_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172010 --food-id=food_seppia_cotta \
  --name-it="Seppia, cotta (bollita)" \
  --matrix-id=seppia_cotta --matrix-description-it="Seppia, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172010 --food-id=food_seppia_cotta \
  --name-it="Seppia, cotta (bollita)" \
  --matrix-id=seppia_cotta --matrix-description-it="Seppia, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Aringa, affumicata (kippered) — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_aringa_affumicata_raw`. FDC ID 173668 (SR Legacy, "Fish, herring, Atlantic, kippered").
- **Nutrienti**: **17/17**, nessun gap. Energia 217kcal, proteine 24,6g, grassi 12,4g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 1,51mg, zinco 1,36mg, calcio 84,0mg, rame 0,14mg, magnesio 46,0mg, selenio 52,6µg, vitamina C 1,00mg, vitamina K (fillochinone) 0,10µg, vitamina B12 18,7µg, folato totale 14,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti. Sodio 918mg/100g, alto ma coerente con un prodotto affumicato/salato reale (stesso tipo di valore già accettato per il salmone affumicato, 819mg/100g), non una firma di arricchimento. "Kippered" è il termine inglese standard per l'aringa affumicata tradizionale (sventrata, salata, affumicata) — rappresenta bene l'aringa affumicata italiana. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173668 e dataType SR Legacy. **Distinta** dall'aringa cruda, già ⚠ in coda precedente per mancanza di un FDC ID verificabile — qui un FDC ID esiste ed è verificato, l'affumicatura è un prodotto a sé.
- **Analogia usata**: `food_salmon_cooked` (Golden Set originale, salmone, già eseguito sul DB reale — stessa convenzione "pesce affumicato" già usata per `food_salmone_affumicato_raw` in coda precedente).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `aringa_affumicata` ("Aringa, affumicata").
- **Attributi**: `--is-heme-iron` (true, carne di pesce, stessa convenzione degli altri pesci), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=smoked` (libero, non un enum validato dallo script), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=173668 --food-id=food_aringa_affumicata_raw \
  --name-it="Aringa, affumicata (kippered)" \
  --matrix-id=aringa_affumicata --matrix-description-it="Aringa, affumicata" \
  --baseline-cooking-state=smoked --analogy-food-id=food_salmon_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=173668 --food-id=food_aringa_affumicata_raw \
  --name-it="Aringa, affumicata (kippered)" \
  --matrix-id=aringa_affumicata --matrix-description-it="Aringa, affumicata" \
  --baseline-cooking-state=smoked --analogy-food-id=food_salmon_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Noci pecan, crude (secche) — preparato 2026-10-20 dal task orario (diciottesimo lotto)

- **food_id**: `food_noci_pecan_raw`. FDC ID 170182 (SR Legacy, "Nuts, pecans" — record generico storico USDA, NDB 12142, nessun termine di tostatura nel nome: rappresenta il seme crudo/secco).
- **Nutrienti**: **17/17**, nessun gap. Energia 691kcal, proteine 9,17g, grassi 72,0g, carboidrati 13,9g, fibra 9,60g, ferro 2,53mg, zinco 4,53mg, calcio 70,0mg, rame 1,20mg, magnesio 121mg, selenio 3,80µg, vitamina C 1,10mg, vitamina K (fillochinone) 3,50µg, vitamina B12 0µg esplicito, folato totale 22,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 29,0µg, alfa-carotene 0µg esplicito, beta-criptoxantina 9,00µg (quindi `other_provitamin_a_carotenoids_mcg=9,00`). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170182 e dataType SR Legacy; identità del record (seme crudo, non tostato) confermata per riscontro incrociato con recipal.com/ingredients/3711, che cita lo stesso alimento come NDB 12142 "Nuts, Pecans" senza termine di tostatura. **Distinto** dai record "dry roasted" (FDC 169424/altri) già scartati in coda precedente per mancanza di un FDC ID verificabile sulla variante tostata — qui la variante cruda/secca ha invece un FDC ID verificato e completo. Scartato a priori il record Foundation Foods FDC 2346395 "Nuts, pecans, halves, raw": copertura nutrienti insufficiente (11/17, mancano selenio, vitamina C, vitamina B12, folato totale, acido folico e tutti i carotenoidi, assenti dalla pagina).
- **Analogia usata**: `food_almonds` (Golden Set originale, mandorle secche non salate — già eseguite sul DB reale. Stessa categoria "frutta a guscio cruda/secca", `is_heme_iron=false`).
- **Categoria dieta**: `plant_non_fruit` (frutta secca).
- **Matrice**: nuova `noci_pecan_raw` ("Noci pecan, crude").
- **Attributi**: `is_heme_iron` omesso (false, come le mandorle), `matrix_category_calcium` omesso (NULL, per analogia con `food_almonds`), `carotenoid_matrix_state=raw_intact` (beta-carotene e beta-criptoxantina presenti e non nulli, seme crudo/secco non tostato — matrice non disgregata dal calore), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Juglandaceae` (famiglia botanica reale del pecan, *Carya illinoinensis* — stessa famiglia del noce comune, diversa da quella delle mandorle usate per l'analogia), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170182 --food-id=food_noci_pecan_raw \
  --name-it="Noci pecan, crude (secche)" \
  --matrix-id=noci_pecan_raw --matrix-description-it="Noci pecan, crude" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --carotenoid-matrix-state=raw_intact --botanical-family=Juglandaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170182 --food-id=food_noci_pecan_raw \
  --name-it="Noci pecan, crude (secche)" \
  --matrix-id=noci_pecan_raw --matrix-description-it="Noci pecan, crude" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --carotenoid-matrix-state=raw_intact --botanical-family=Juglandaceae \
  --diet-category=plant_non_fruit --apply
```

### Cuore di maiale, crudo — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_cuore_di_maiale_raw`. FDC ID 168267 (SR Legacy, "Pork, fresh, variety meats and by-products, heart, raw").
- **Nutrienti**: **16/17**. Energia 118kcal, proteine 17,3g, grassi 4,36g, carboidrati 1,33g, fibra 0g esplicito, ferro 4,68mg, zinco 2,80mg, calcio 5,00mg, rame 0,41mg, magnesio 19,0mg, selenio 10,4µg, vitamina C 5,30mg, vitamina B12 3,79µg, folato totale 4,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg=0`). **Manca** solo vitamina K (non riportata nel record) — gap singolo, il migliore fra le frattaglie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168267 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale. Stessa categoria frattaglia cruda di muscolo/organo rosso, specie diversa — stesso tipo di analogia cross-specie già usata per il fegato di maiale/vitello in questa coda).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_maiale_raw` ("Cuore di maiale, crudo").
- **Attributi**: `--is-heme-iron` (true, tessuto muscolare/organo rosso, coerente con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168267 --food-id=food_cuore_di_maiale_raw \
  --name-it="Cuore di maiale, crudo" \
  --matrix-id=cuore_di_maiale_raw --matrix-description-it="Cuore di maiale, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168267 --food-id=food_cuore_di_maiale_raw \
  --name-it="Cuore di maiale, crudo" \
  --matrix-id=cuore_di_maiale_raw --matrix-description-it="Cuore di maiale, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore di maiale, cotto (brasato) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_cuore_di_maiale_cotto`. FDC ID 168268 (SR Legacy, "Pork, fresh, variety meats and by-products, heart, cooked, braised"). Distinto da `food_cuore_di_maiale_raw` (crudo, FDC 168267, "pronto" in questo file).
- **Nutrienti**: **14/17**. Energia 148kcal, proteine 23,6g, grassi 5,05g, carboidrati 0,40g, fibra 0g esplicito, ferro 5,83mg, zinco 3,09mg, calcio 7,00mg, rame 0,51mg, magnesio 24,0mg, selenio 18,3µg, vitamina C 2,00mg, vitamina B12 3,79µg, folato totale 4,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap già accettato per le altre frattaglie cotte di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168268 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_cuore_di_maiale_raw`, che resta solo "pronto"). Stessa categoria frattaglia cotta, specie/organo diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_maiale_cotto` ("Cuore di maiale, cotto").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168268 --food-id=food_cuore_di_maiale_cotto \
  --name-it="Cuore di maiale, cotto (brasato)" \
  --matrix-id=cuore_di_maiale_cotto --matrix-description-it="Cuore di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168268 --food-id=food_cuore_di_maiale_cotto \
  --name-it="Cuore di maiale, cotto (brasato)" \
  --matrix-id=cuore_di_maiale_cotto --matrix-description-it="Cuore di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone di maiale, crudo — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_rognone_di_maiale_raw`. FDC ID 168270 (SR Legacy, "Pork, fresh, variety meats and by-products, kidneys, raw").
- **Nutrienti**: **14/17**. Energia 100kcal, proteine 16,5g, grassi 3,25g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 4,89mg, zinco 2,75mg, calcio 9,00mg, rame 0,62mg, magnesio 17,0mg, selenio 190µg (molto alto, atteso per un rene), vitamina C 13,3mg, vitamina B12 8,49µg, folato totale 42,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap delle altre frattaglie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168270 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, fegato di manzo crudo — già eseguito sul DB reale). Stessa categoria frattaglia cruda, organo/specie diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `rognone_di_maiale_raw` ("Rognone di maiale, crudo").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168270 --food-id=food_rognone_di_maiale_raw \
  --name-it="Rognone di maiale, crudo" \
  --matrix-id=rognone_di_maiale_raw --matrix-description-it="Rognone di maiale, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168270 --food-id=food_rognone_di_maiale_raw \
  --name-it="Rognone di maiale, crudo" \
  --matrix-id=rognone_di_maiale_raw --matrix-description-it="Rognone di maiale, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone di maiale, cotto (brasato) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_rognone_di_maiale_cotto`. FDC ID 167860 (SR Legacy, "Pork, fresh, variety meats and by-products, kidneys, cooked, braised"). Distinto da `food_rognone_di_maiale_raw` (crudo, FDC 168270, "pronto" in questo file).
- **Nutrienti**: **14/17**. Energia 151kcal, proteine 25,4g, grassi 4,70g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 5,29mg, zinco 4,15mg, calcio 13,0mg, rame 0,68mg, magnesio 18,0mg, selenio 312µg (molto alto, atteso per un rene cotto, concentrazione rispetto al crudo), vitamina C 10,6mg, vitamina B12 7,79µg, folato totale 41,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap delle altre frattaglie cotte di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167860 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_rognone_di_maiale_raw`, che resta solo "pronto"). Stessa categoria frattaglia cotta, organo/specie diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `rognone_di_maiale_cotto` ("Rognone di maiale, cotto").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=167860 --food-id=food_rognone_di_maiale_cotto \
  --name-it="Rognone di maiale, cotto (brasato)" \
  --matrix-id=rognone_di_maiale_cotto --matrix-description-it="Rognone di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=167860 --food-id=food_rognone_di_maiale_cotto \
  --name-it="Rognone di maiale, cotto (brasato)" \
  --matrix-id=rognone_di_maiale_cotto --matrix-description-it="Rognone di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Lingua di maiale, cotta (brasata) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_lingua_di_maiale_cotta`. FDC ID 168276 (SR Legacy, "Pork, fresh, variety meats and by-products, tongue, cooked, braised"). **Nessuna voce cruda corrispondente in questa coda**: nessun record FDC con ID verificabile trovato per "tongue, raw" (vedi nota ⚠ nella coda del PRD) — stesso schema già usato per la milza di manzo nel sedicesimo lotto (solo cotta, senza crudo).
- **Nutrienti**: **14/17**. Energia 271kcal, proteine 24,1g, grassi 18,6g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 4,99mg, zinco 4,53mg, calcio 19,0mg, rame 0,11mg, magnesio 20,0mg, selenio 15,5µg, vitamina C 1,70mg, vitamina B12 2,39µg, folato totale 4,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168276 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale). Stessa categoria frattaglia cotta, organo/specie diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `lingua_di_maiale_cotta` ("Lingua di maiale, cotta").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=168276 --food-id=food_lingua_di_maiale_cotta \
  --name-it="Lingua di maiale, cotta (brasata)" \
  --matrix-id=lingua_di_maiale_cotta --matrix-description-it="Lingua di maiale, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168276 --food-id=food_lingua_di_maiale_cotta \
  --name-it="Lingua di maiale, cotta (brasata)" \
  --matrix-id=lingua_di_maiale_cotta --matrix-description-it="Lingua di maiale, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Fegato d'agnello, cotto (brasato) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_fegato_di_agnello_cotto`. FDC ID 172532 (SR Legacy, "Lamb, variety meats and by-products, liver, cooked, braised").
- **Nutrienti**: **14/17**. Energia 220kcal, proteine 30,6g, grassi 8,81g, carboidrati 2,53g, fibra 0g esplicito, ferro 8,28mg, zinco 7,89mg, calcio 8,00mg, rame 7,07mg (molto alto, atteso per un fegato), magnesio 22,0mg, selenio 111µg, vitamina C 4,00mg, vitamina B12 76,5µg, folato totale 73,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap atteso per un fegato già accettato per fegato di manzo/vitello/maiale cotti in questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172532 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale). Stesso organo, specie diversa — stesso tipo di analogia cross-specie già usata per fegato di maiale/vitello cotti in questa coda.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `fegato_di_agnello_cotto` ("Fegato d'agnello, cotto").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172532 --food-id=food_fegato_di_agnello_cotto \
  --name-it="Fegato d'agnello, cotto (brasato)" \
  --matrix-id=fegato_di_agnello_cotto --matrix-description-it="Fegato d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172532 --food-id=food_fegato_di_agnello_cotto \
  --name-it="Fegato d'agnello, cotto (brasato)" \
  --matrix-id=fegato_di_agnello_cotto --matrix-description-it="Fegato d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone d'agnello, cotto (brasato) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_rognone_di_agnello_cotto`. FDC ID 174355 (SR Legacy, "Lamb, variety meats and by-products, kidneys, cooked, braised").
- **Nutrienti**: **14/17**. Energia 137kcal, proteine 23,6g, grassi 3,62g, carboidrati 0,99g, fibra 0g esplicito, ferro 12,4mg (molto alto, atteso per un rene d'agnello), zinco 3,80mg, calcio 18,0mg, rame 0,37mg, magnesio 20,0mg, selenio 219µg, vitamina C 12,0mg, vitamina B12 78,9µg, folato totale 81,0µg, acido folico 0µg esplicito (riportato come 0, nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174355 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale). Stessa categoria frattaglia cotta, organo/specie diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `rognone_di_agnello_cotto` ("Rognone d'agnello, cotto").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174355 --food-id=food_rognone_di_agnello_cotto \
  --name-it="Rognone d'agnello, cotto (brasato)" \
  --matrix-id=rognone_di_agnello_cotto --matrix-description-it="Rognone d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174355 --food-id=food_rognone_di_agnello_cotto \
  --name-it="Rognone d'agnello, cotto (brasato)" \
  --matrix-id=rognone_di_agnello_cotto --matrix-description-it="Rognone d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore d'agnello, cotto (brasato) — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_cuore_di_agnello_cotto`. FDC ID 172528 (SR Legacy, "Lamb, variety meats and by-products, heart, cooked, braised").
- **Nutrienti**: **14/17**. Energia 185kcal, proteine 25,0g, grassi 7,91g, carboidrati 1,93g, fibra 0g esplicito, ferro 5,52mg, zinco 3,68mg, calcio 14,0mg, rame 0,61mg, magnesio 24,0mg, selenio 47,0µg, vitamina C 7,00mg, vitamina B12 11,2µg, folato totale 2,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A (la pagina riporta "Vitamin A, RAE" a 0µg, ma non i singoli carotenoidi richiesti). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172528 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale). Stessa categoria frattaglia cotta, organo/specie diversi.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_agnello_cotto` ("Cuore d'agnello, cotto").
- **Attributi**: `--is-heme-iron` (true), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172528 --food-id=food_cuore_di_agnello_cotto \
  --name-it="Cuore d'agnello, cotto (brasato)" \
  --matrix-id=cuore_di_agnello_cotto --matrix-description-it="Cuore d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172528 --food-id=food_cuore_di_agnello_cotto \
  --name-it="Cuore d'agnello, cotto (brasato)" \
  --matrix-id=cuore_di_agnello_cotto --matrix-description-it="Cuore d'agnello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Ventriglio di pollo, crudo — preparato 2026-10-20 dal task orario (diciassettesimo lotto)

- **food_id**: `food_ventriglio_di_pollo_raw`. FDC ID 171456 (SR Legacy, "Chicken, gizzard, all classes, raw").
- **Nutrienti**: **17/17** — il record più completo di questa coda: tutti i valori sono espliciti, incluso 0 dove assente. Energia 94,0kcal, proteine 17,7g, grassi 2,06g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,49mg, zinco 2,72mg, calcio 11,0mg, rame 0,12mg, magnesio 15,0mg, selenio 25,5µg, vitamina C 3,70mg, vitamina K (fillochinone) 0µg esplicito, vitamina B12 1,21µg, folato totale 5,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg=0`). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171456 e dataType SR Legacy.
- **Analogia usata**: `food_fegato_di_pollo_raw` (stessa specie *Gallus gallus* — presente nella tabella dei "98 alimenti" eseguiti il 2026-10-14, FDC 171060, già nel DB reale). Frattaglia cruda, organo diverso (ventriglio = muscolo digestivo, non fegato), stesso tipo di analogia cross-organo già usato altrove in questa coda.
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `ventriglio_di_pollo_raw` ("Ventriglio di pollo, crudo").
- **Attributi**: `--is-heme-iron` (true, tessuto muscolare, coerente con le altre frattaglie di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171456 --food-id=food_ventriglio_di_pollo_raw \
  --name-it="Ventriglio di pollo, crudo" \
  --matrix-id=ventriglio_di_pollo_raw --matrix-description-it="Ventriglio di pollo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171456 --food-id=food_ventriglio_di_pollo_raw \
  --name-it="Ventriglio di pollo, crudo" \
  --matrix-id=ventriglio_di_pollo_raw --matrix-description-it="Ventriglio di pollo, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Fegato di maiale, cotto (brasato) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_fegato_di_maiale_cotto`. FDC ID 167863 (SR Legacy, "Pork, fresh, variety meats and by-products, liver, cooked, braised"). Distinto da `food_fegato_di_maiale_raw` (crudo, FDC 167862, solo "pronto" in questo file — non ancora eseguito sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **14/17**. Energia 165kcal, proteine 26,0g, grassi 4,40g, carboidrati 3,76g, fibra 0g esplicito, ferro 17,9mg, zinco 6,72mg, calcio 10,0mg, rame 0,63mg, magnesio 14,0mg, selenio 67,5µg, vitamina C 23,6mg, vitamina B12 18,7µg, folato totale 163µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — gap atteso per un fegato, stesso ordine di grandezza già accettato per fegato di vitello/pollo cotti in questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167863 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_fegato_di_maiale_raw`, che resta solo "pronto" e non è nel DB. Stesso organo/categoria frattaglia cotta, specie diversa — stesso tipo di analogia cross-specie già usato per il crudo del fegato di maiale stesso, che usa `food_fegato_di_vitello_raw`).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `fegato_di_maiale_cotto` ("Fegato di maiale, cotto").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=167863 --food-id=food_fegato_di_maiale_cotto \
  --name-it="Fegato di maiale, cotto (brasato)" \
  --matrix-id=fegato_di_maiale_cotto --matrix-description-it="Fegato di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=167863 --food-id=food_fegato_di_maiale_cotto \
  --name-it="Fegato di maiale, cotto (brasato)" \
  --matrix-id=fegato_di_maiale_cotto --matrix-description-it="Fegato di maiale, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Trippa di manzo, cotta (bollita) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_trippa_di_manzo_cotta`. FDC ID 174769 (SR Legacy, "Beef, variety meats and by-products, tripe, cooked, simmered"). Distinta da `food_trippa_di_manzo_raw` (cruda, FDC 170599, solo "pronto" in questo file — non ancora eseguita sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **17/17** — tutti presenti, diversi espliciti a zero (tipico per questo alimento). Energia 94,0kcal, proteine 11,7g, grassi 4,05g, carboidrati 1,99g, fibra 0g esplicito, ferro 0,66mg, zinco 1,71mg, calcio 81,0mg, rame 0mg esplicito, magnesio 15,0mg, selenio 11,8µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 0,72µg, folato totale 3,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti. Calcio relativamente alto (81mg/100g) ma caratteristica nota della trippa (tessuto di rivestimento gastrico), non un'anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174769 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_trippa_di_manzo_raw`, che resta solo "pronto" e non è nel DB. Stessa specie, categoria frattaglia cotta, organo diverso).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `trippa_di_manzo_cotta` ("Trippa di manzo, cotta").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=174769 --food-id=food_trippa_di_manzo_cotta \
  --name-it="Trippa di manzo, cotta (bollita)" \
  --matrix-id=trippa_di_manzo_cotta --matrix-description-it="Trippa di manzo, cotta" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174769 --food-id=food_trippa_di_manzo_cotta \
  --name-it="Trippa di manzo, cotta (bollita)" \
  --matrix-id=trippa_di_manzo_cotta --matrix-description-it="Trippa di manzo, cotta" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Lingua di manzo, cotta (bollita) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_lingua_di_manzo_cotta`. FDC ID 170598 (SR Legacy, "Beef, variety meats and by-products, tongue, cooked, simmered"). Distinta da `food_lingua_di_manzo_raw` (cruda, FDC 170196, solo "pronto" in questo file — non ancora eseguita sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **17/17** — tutti presenti. Energia 284kcal, proteine 19,3g, grassi 22,3g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 2,61mg, zinco 4,09mg, calcio 5,00mg, rame 0,15mg, magnesio 15,0mg, selenio 13,2µg, vitamina C 1,30mg, vitamina K 1,20µg, vitamina B12 3,13µg, folato totale 7,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170598 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_lingua_di_manzo_raw`, che resta solo "pronto" e non è nel DB. Stessa specie, categoria frattaglia cotta, organo diverso).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `lingua_di_manzo_cotta` ("Lingua di manzo, cotta").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170598 --food-id=food_lingua_di_manzo_cotta \
  --name-it="Lingua di manzo, cotta (bollita)" \
  --matrix-id=lingua_di_manzo_cotta --matrix-description-it="Lingua di manzo, cotta" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=170598 --food-id=food_lingua_di_manzo_cotta \
  --name-it="Lingua di manzo, cotta (bollita)" \
  --matrix-id=lingua_di_manzo_cotta --matrix-description-it="Lingua di manzo, cotta" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone di manzo, cotto (bollito) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_rognone_di_manzo_cotto`. FDC ID 169450 (SR Legacy, "Beef, variety meats and by-products, kidneys, cooked, simmered"). Distinto da `food_rognone_di_manzo_raw` (crudo, FDC 169449, solo "pronto" in questo file — non ancora eseguito sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **17/17** — tutti presenti. Energia 158kcal, proteine 27,3g, grassi 4,65g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 5,80mg, zinco 2,84mg, calcio 19,0mg, rame 0,56mg, magnesio 12,0mg, selenio 168µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 24,9µg, folato totale 83,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti. Selenio molto alto (168µg/100g) ma caratteristica nota del rognone, organo con selenio concentrato. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169450 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_rognone_di_manzo_raw`, che resta solo "pronto" e non è nel DB. Stessa specie, categoria frattaglia cotta, organo diverso).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `rognone_di_manzo_cotto` ("Rognone di manzo, cotto").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169450 --food-id=food_rognone_di_manzo_cotto \
  --name-it="Rognone di manzo, cotto (bollito)" \
  --matrix-id=rognone_di_manzo_cotto --matrix-description-it="Rognone di manzo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=169450 --food-id=food_rognone_di_manzo_cotto \
  --name-it="Rognone di manzo, cotto (bollito)" \
  --matrix-id=rognone_di_manzo_cotto --matrix-description-it="Rognone di manzo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore di manzo, cotto (bollito) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_cuore_di_manzo_cotto`. FDC ID 169448 (SR Legacy, "Beef, variety meats and by-products, heart, cooked, simmered"). Distinto da `food_cuore_di_manzo_raw` (crudo, FDC 168625, solo "pronto" in questo file — non ancora eseguito sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **17/17** — tutti presenti, diversi espliciti a zero. Energia 165kcal, proteine 28,5g, grassi 4,73g, carboidrati 0,15g, fibra 0g esplicito, ferro 6,38mg, zinco 2,87mg, calcio 5,00mg, rame 0,56mg, magnesio 21,0mg, selenio 38,9µg, vitamina C 0mg esplicito, vitamina K 0,50µg, vitamina B12 10,8µg, folato totale 5,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169448 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_cuore_di_manzo_raw`, che resta solo "pronto" e non è nel DB. Stessa specie, categoria frattaglia cotta, organo diverso).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_manzo_cotto` ("Cuore di manzo, cotto").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169448 --food-id=food_cuore_di_manzo_cotto \
  --name-it="Cuore di manzo, cotto (bollito)" \
  --matrix-id=cuore_di_manzo_cotto --matrix-description-it="Cuore di manzo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=169448 --food-id=food_cuore_di_manzo_cotto \
  --name-it="Cuore di manzo, cotto (bollito)" \
  --matrix-id=cuore_di_manzo_cotto --matrix-description-it="Cuore di manzo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore di pollo, cotto (bollito) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_cuore_di_pollo_cotto`. FDC ID 171059 (SR Legacy, "Chicken, heart, all classes, cooked, simmered"). Distinto da `food_cuore_di_pollo_raw` (crudo, FDC 171458, solo "pronto" in questo file — non ancora eseguito sul DB reale, stesso alimento, forma cotta).
- **Nutrienti**: **14/17**. Energia 185kcal, proteine 26,4g, grassi 7,92g, carboidrati 0,10g, fibra 0g esplicito, ferro 9,03mg, zinco 7,30mg, calcio 19,0mg, rame 0,50mg, magnesio 20,0mg, selenio 8,00µg, vitamina C 1,80mg, vitamina B12 7,29µg, folato totale 80,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record — pagina con tabella vitamine più corta, 13 voci contro le 33 del cuore di manzo cotto —, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171059 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non il crudo `food_cuore_di_pollo_raw`, che resta solo "pronto" e non è nel DB. Specie e organo diversi ma stessa categoria frattaglia cotta, ferro eme).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_pollo_cotto` ("Cuore di pollo, cotto").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171059 --food-id=food_cuore_di_pollo_cotto \
  --name-it="Cuore di pollo, cotto (bollito)" \
  --matrix-id=cuore_di_pollo_cotto --matrix-description-it="Cuore di pollo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171059 --food-id=food_cuore_di_pollo_cotto \
  --name-it="Cuore di pollo, cotto (bollito)" \
  --matrix-id=cuore_di_pollo_cotto --matrix-description-it="Cuore di pollo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Milza di manzo, cotta (brasata) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_milza_di_manzo_cotta`. FDC ID 170597 (SR Legacy, "Beef, variety meats and by-products, spleen, cooked, braised"). Alimento tradizionale italiano (es. "pani ca meusa" palermitano). **Nota**: il crudo è stato valutato in parallelo e SCARTATO — nessuna fonte consultata (getfoodfacts.com, triagemethod.com, bodbot.com, recipal.com, uhhospitals.org, chrismasterjohnphd.com) riporta un FDC ID moderno verificabile per "spleen, raw", solo il numero legacy NDB 13333 su più fonti indipendenti (una fonte, chrismasterjohnphd.com, riporta anche un'energia 272kcal in evidente contraddizione con le altre, 105kcal) — quindi questo alimento entra in coda SOLO nella forma cotta, senza una voce "cruda" corrispondente (stesso schema già usato per formaggio Gouda/salmone affumicato: un alimento nuovo non ha sempre un pari crudo/cotto).
- **Nutrienti**: **14/17**. Energia 145kcal, proteine 25,1g, grassi 4,20g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 39,4mg, zinco 2,79mg, calcio 12,0mg, rame 0,92mg, magnesio 19,0mg, selenio 91,4µg, vitamina C 50,3mg, vitamina B12 5,02µg, folato totale 4,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso gap atteso delle altre frattaglie in questa coda. Ferro molto alto (39,4mg/100g) ma caratteristica nota della milza, organo che filtra/ricicla globuli rossi. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170597 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale. Stessa specie, categoria frattaglia cotta, organo diverso — stesso tipo di analogia già usato per trippa/lingua/rognone/cuore di manzo in questo stesso lotto).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `milza_di_manzo_cotta` ("Milza di manzo, cotta").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia e con tutte le frattaglie già in coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170597 --food-id=food_milza_di_manzo_cotta \
  --name-it="Milza di manzo, cotta (brasata)" \
  --matrix-id=milza_di_manzo_cotta --matrix-description-it="Milza di manzo, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=170597 --food-id=food_milza_di_manzo_cotta \
  --name-it="Milza di manzo, cotta (brasata)" \
  --matrix-id=milza_di_manzo_cotta --matrix-description-it="Milza di manzo, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Quaglia, carne, cotta — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_quaglia_carne_cotta`. FDC ID 169902 (SR Legacy, "Quail, cooked, total edible"). Distinta da `food_quaglia_carne_raw` (cruda, FDC 172419, solo "pronto" in questo file — non ancora eseguita sul DB reale, stesso alimento, forma cotta; metodo di cottura non specificato dal nome FDC, "total edible" indica solo che è carne intera edibile, non un taglio specifico).
- **Nutrienti**: **17/17** — tutti presenti. Energia 227kcal, proteine 25,1g, grassi 14,1g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 4,43mg, zinco 3,10mg, calcio 15,0mg, rame 0,59mg, magnesio 22,0mg, selenio 21,8µg, vitamina C 2,30mg, vitamina K 4,20µg, vitamina B12 0,36µg, folato totale 6,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0µg espliciti. **Nota di cautela**: i valori di carboidrati/fibra/acido folico/carotenoidi sono tutti riportati come zero esplicito sulla pagina, ma non è possibile distinguere da qui se si tratti di uno zero realmente misurato o di un default USDA per nutrienti non analizzati — plausibile per un alimento di carne (zero carotenoidi/carboidrati è l'aspettativa fisiologica), quindi non bloccante, ma degno di nota per chi promuoverà questa riga a `verified`. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169902 e dataType SR Legacy.
- **Analogia usata**: `food_beef_liver_cooked` (Golden Set originale, fegato di manzo cotto — già eseguito sul DB reale; non `food_quaglia_carne_raw`/`food_petto_di_pollo_raw`, entrambi solo "pronti" o comunque crudi, non coerenti con lo stato di cottura. Specie e organo diversi ma stessa categoria carne/frattaglia cotta, ferro eme — stesso tipo di analogia già usato per tutte le frattaglie di questo lotto).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `quaglia_cotta` ("Quaglia, carne, cotta").
- **Attributi**: `--is-heme-iron` (true, carne di selvaggina da penna, coerente con `food_petto_di_pollo_raw`/l'analogia dichiarata per il crudo della quaglia stessa), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=cooked` (metodo non specificato dal record FDC), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=169902 --food-id=food_quaglia_carne_cotta \
  --name-it="Quaglia, carne, cotta" \
  --matrix-id=quaglia_cotta --matrix-description-it="Quaglia, carne, cotta" \
  --baseline-cooking-state=cooked --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=169902 --food-id=food_quaglia_carne_cotta \
  --name-it="Quaglia, carne, cotta" \
  --matrix-id=quaglia_cotta --matrix-description-it="Quaglia, carne, cotta" \
  --baseline-cooking-state=cooked --analogy-food-id=food_beef_liver_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Zucca butternut, cotta (al forno, con sale) — preparato 2026-10-20 dal task orario (sedicesimo lotto, turno ore 08)

- **food_id**: `food_zucca_butternut_cotta`. FDC ID 170130 (SR Legacy, "Squash, winter, butternut, cooked, baked, with salt" — unica variante con pagina getfoodfacts.com pulita trovata; esiste anche un FDC ID adiacente 169296 per la variante "without salt", ma nessuna fonte consultata ne cita esplicitamente l'FDC ID in pagina — solo valori identici alla variante con sale tranne il sodio, non confermati come appartenenti a quell'ID specifico — quindi non usato). Distinta da `food_zucca_butternut_raw` (cruda, FDC 169295, solo "pronto" in questo file — non ancora eseguita sul DB reale, stesso alimento, forma cotta). **Deviazione dichiarata**: variante "con sale" (sodio 240mg/100g contro 4mg/100g del crudo), non tracciato dai 17 nutrienti del motore — stessa deviazione già accettata più volte in questa coda (riso bianco cotto, bietole da costa cotte, verza cotta, peperoni rossi/verdi cotti, cavolo rapa cotto, sedano rapa cotto).
- **Nutrienti**: **17/17** — tutti presenti. Energia 40,0kcal, proteine 0,88g, grassi 0,09g, carboidrati 10,5g, fibra 3,22g, ferro 0,59mg, zinco 0,13mg, calcio 41,0mg, rame 0,06mg, magnesio 29,0mg, selenio 0,49µg, vitamina C 15,1mg, vitamina K 1,02µg, vitamina B12 0µg esplicito, folato totale 19,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 4570µg, alfa-carotene 1130µg e beta-criptoxantina 3116µg (somma in `other_provitamin_a_carotenoids_mcg` = 4246µg). Carotenoidi molto alti, coerente con la nota caratteristica della zucca butternut. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170130 e dataType SR Legacy.
- **Analogia usata**: `food_pumpkin_raw` (zucca generica cruda, già eseguita sul DB reale — stessa famiglia botanica Cucurbitaceae, stessa matrice tipo polpa/carotenoidi; non `food_zucca_cotta`/`food_zucca_butternut_raw`, entrambi solo "pronti" e non nel DB).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `zucca_butternut_cotta` ("Zucca butternut, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_pumpkin_raw`), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene molto presente ma matrice disgregata dalla cottura — il crudo sarebbe `raw_intact`, stessa convenzione già usata per le altre verdure cotte in questa coda), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Cucurbitaceae` (stessa famiglia di `food_pumpkin_raw`/`food_zucca_butternut_raw`), `baseline_cooking_state=baked`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170130 --food-id=food_zucca_butternut_cotta \
  --name-it="Zucca butternut, cotta (al forno, con sale)" \
  --matrix-id=zucca_butternut_cotta --matrix-description-it="Zucca butternut, cotta" \
  --baseline-cooking-state=baked --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170130 --food-id=food_zucca_butternut_cotta \
  --name-it="Zucca butternut, cotta (al forno, con sale)" \
  --matrix-id=zucca_butternut_cotta --matrix-description-it="Zucca butternut, cotta" \
  --baseline-cooking-state=baked --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit --apply
```

### Formaggio Gouda — preparato 2026-10-19 dal task orario (quindicesimo lotto, turno ore 19)

- **food_id**: `food_gouda`. FDC ID 171241 (SR Legacy, "Cheese, gouda").
- **Nutrienti**: **17/17** — tutti presenti. Energia 356kcal, proteine 24,9g, grassi 27,4g, carboidrati 2,22g, fibra 0g esplicito, ferro 0,24mg, zinco 3,90mg, calcio 700mg, rame 0,036mg, magnesio 29,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,30µg, vitamina B12 1,54µg, folato totale 21,0µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento), beta-carotene 10,0µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Calcio molto alto (700mg/100g) ma tipico di un formaggio stagionato a pasta dura/semidura, stesso ordine di grandezza già visto per parmigiano/edam. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171241 e dataType SR Legacy (release USDA 30 aprile 2026).
- **Analogia usata**: `food_parmigiano_reggiano` (formaggio stagionato, già eseguito sul DB reale — stessa categoria "formaggio a pasta dura/semidura stagionata"; non `food_edam` perché quest'ultimo è solo "pronto" in questo stesso lotto, non ancora eseguito — l'analogia deve riferirsi a un alimento reale nel DB).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `gouda` ("Formaggio Gouda").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini/formaggi aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale, stessa convenzione di brie/panna densa/panna acida), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw` (prodotto pronto al consumo, stessa convenzione degli altri formaggi), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171241 --food-id=food_gouda \
  --name-it="Formaggio Gouda" \
  --matrix-id=gouda --matrix-description-it="Formaggio Gouda" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171241 --food-id=food_gouda \
  --name-it="Formaggio Gouda" \
  --matrix-id=gouda --matrix-description-it="Formaggio Gouda" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Salmone, affumicato (lox) — preparato 2026-10-19 dal task orario (quindicesimo lotto, turno ore 19)

- **food_id**: `food_salmone_affumicato_raw`. FDC ID 171985 (SR Legacy, "Fish, salmon, chinook, smoked, (lox), regular").
- **Nutrienti**: **14/17**. Energia 117kcal, proteine 18,3g, grassi 4,32g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 0,85mg, zinco 0,31mg, calcio 11,0mg, rame 0,23mg, magnesio 18,0mg, selenio 38,1µg, vitamina C 0mg esplicito, vitamina B12 3,26µg, folato totale 2,00µg, acido folico 0µg esplicito separato (nessuna firma di arricchimento). **Mancano** (non riportati nel record, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — gap atteso per un pesce, stesso ordine di grandezza già accettato per branzino/sogliola/pesce spada cotti in questa coda. Sodio molto alto (819mg/100g, non uno dei 17 nutrienti tracciati) per il sale usato nell'affumicatura/salagione, coerente con un prodotto affumicato reale, non un segnale di anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171985 e dataType SR Legacy (release USDA 30 aprile 2026).
- **Analogia usata**: `food_salmon_cooked` (salmone, Golden Set originale, già eseguito sul DB reale — stessa specie *Oncorhynchus*, forma diversa: affumicato invece di cotto a calore secco).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `salmone_affumicato` ("Salmone, affumicato").
- **Attributi**: `is_heme_iron=true` (carne di pesce, stessa convenzione già usata per gli altri pesci di questa coda), `matrix_category_calcium` omesso (NULL — non applicabile a un prodotto animale), `carotenoid_matrix_state` omesso (NULL — non applicabile), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=smoked` (descrive lo stato reale a cui si riferiscono questi valori, non validato come enum dallo script — libero), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171985 --food-id=food_salmone_affumicato_raw \
  --name-it="Salmone, affumicato (lox)" --is-heme-iron \
  --matrix-id=salmone_affumicato --matrix-description-it="Salmone, affumicato" \
  --baseline-cooking-state=smoked --analogy-food-id=food_salmon_cooked \
  --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171985 --food-id=food_salmone_affumicato_raw \
  --name-it="Salmone, affumicato (lox)" --is-heme-iron \
  --matrix-id=salmone_affumicato --matrix-description-it="Salmone, affumicato" \
  --baseline-cooking-state=smoked --analogy-food-id=food_salmon_cooked \
  --diet-category=meat_fish --apply
```

### Farina di castagne, cruda — preparato 2026-10-19 dal task orario (quindicesimo lotto, turno ore 19)

- **food_id**: `food_farina_di_castagne_raw`. FDC ID 2515377 (Foundation Foods, "Flour, chestnut").
- **Nutrienti**: **12/17**. Energia 385kcal (pagina riporta anche 380kcal nel riepilogo etichetta, scarto di arrotondamento minore, stesso tipo già accettato altrove in questa coda — usato il valore della tabella dettagliata), proteine 5,29g, grassi 4,64g, carboidrati 80,5g, fibra 8,71g, ferro 1,62mg, zinco 1,04mg, calcio 55,8mg, rame 0,58mg, magnesio 68,8mg, selenio 0µg esplicito, vitamina C 4,05mg. **Mancano** (non riportati nel record, non assunti zero): vitamina B12, folato totale, acido folico separato, vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso ordine di grandezza di gap già accettato per farina di cocco (11/17) in questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 2515377 e dataType Foundation Foods (release USDA 30 aprile 2026).
- **Analogia usata**: `food_castagne_raw` (castagne crude sbucciate, già eseguite sul DB reale — stessa specie *Castanea sativa*, forma diversa: farina macinata invece dell'intero).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `farina_di_castagne` ("Farina di castagne").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_castagne_raw`), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, stessa scelta già fatta per farina di cocco), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fagaceae` (*Castanea sativa*, stessa famiglia di `food_castagne_raw`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessun segno di arricchimento nei campi presenti, anche se il folato stesso non è riportato quindi non direttamente verificabile su questo record, stesso trattamento già dato a `food_farro_raw`).

```
npm run add-food -- --fdc-id=2515377 --food-id=food_farina_di_castagne_raw \
  --name-it="Farina di castagne, cruda" \
  --matrix-id=farina_di_castagne --matrix-description-it="Farina di castagne" \
  --baseline-cooking-state=raw --analogy-food-id=food_castagne_raw \
  --botanical-family=Fagaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=2515377 --food-id=food_farina_di_castagne_raw \
  --name-it="Farina di castagne, cruda" \
  --matrix-id=farina_di_castagne --matrix-description-it="Farina di castagne" \
  --baseline-cooking-state=raw --analogy-food-id=food_castagne_raw \
  --botanical-family=Fagaceae --diet-category=plant_non_fruit --apply
```

### Panna acida (sour cream) — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 19)

- **food_id**: `food_panna_acida_raw`. FDC ID 171257 (SR Legacy, "Cream, sour, cultured").
- **Nutrienti**: **17/17** — tutti presenti. Energia 198kcal, proteine 2,44g, grassi 19,4g, carboidrati 4,63g, fibra 0g esplicito, ferro 0,070mg, zinco 0,33mg, calcio 101mg, rame 0,018mg, magnesio 10,0mg, selenio 3,70µg, vitamina C 0,90mg, vitamina K (fillochinone 1,50µg + menachinone-4 6,00µg), vitamina B12 0,21µg, folato totale 6,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento, valori naturali di un latticino), beta-carotene 25,0µg, alfa-carotene 0µg esplicito, beta-criptoxantina 1,00µg. Calcio e grassi coerenti con panna acida intera/regolare, non la variante "reduced fat" (distinta nel record FDC 171256, non usata qui). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171257 e dataType SR Legacy (release USDA 30 aprile 2026).
- **Analogia usata**: `food_yogurt_bianco_intero` (yogurt bianco intero, già eseguito sul DB reale — stessa categoria funzionale "latticino fermentato/colturato", a differenza della panna densa/da cucina che sono panna non colturata e restano solo "pronte" non ancora eseguite nel Golden Set).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `panna_acida` ("Panna acida (sour cream)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale, stessa convenzione già usata per brie/panna densa pur con beta-carotene non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw` (prodotto pronto al consumo, stessa convenzione degli altri latticini), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171257 --food-id=food_panna_acida_raw \
  --name-it="Panna acida (sour cream)" \
  --matrix-id=panna_acida --matrix-description-it="Panna acida (sour cream)" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171257 --food-id=food_panna_acida_raw \
  --name-it="Panna acida (sour cream)" \
  --matrix-id=panna_acida --matrix-description-it="Panna acida (sour cream)" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy --apply
```

### Farina di soia, non arricchita, cruda — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 19)

- **food_id**: `food_farina_di_soia_raw`. FDC ID 174273 (SR Legacy, "Soy flour, full-fat, raw").
- **Nutrienti**: **17/17**. Energia 434kcal, proteine 37,8g, grassi 20,6g, carboidrati 31,9g, fibra 9,60g, ferro 6,37mg, zinco 3,92mg, calcio 206mg, rame 2,92mg, magnesio 429mg, selenio 7,50µg, vitamina C 0mg esplicito, vitamina B12 0µg esplicito, folato totale 345µg con acido folico 0µg esplicito separato (nessuna firma di arricchimento in stile USA, coerente con "full-fat, raw" non trattato), vitamina K 70,0µg, beta-carotene 72,0µg, altri carotenoidi provitaminici A (alfa 0 + cripto 0) = 0µg. Calcio e folato naturalmente alti per un derivato della soia, stessa plausibilità già vista per `food_soia_secca_raw`. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174273 e dataType SR Legacy (release USDA 30 aprile 2026).
- **Analogia usata**: `food_farina_di_ceci_raw` (farina di ceci, già eseguita sul DB reale — stessa categoria "farina da legume", famiglia Fabaceae).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `farina_di_soia` ("Farina di soia, cruda").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_farina_di_ceci_raw`), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene presente e non trascurabile, 72µg/100g — a differenza delle altre farine di questa coda dove il beta-carotene è 0 esplicito o assente; la macinazione dissocia la matrice vegetale, stessa scelta già fatta per la tahina rispetto al seme di sesamo intero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae` (*Glycine max*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito, nessun segno di arricchimento).

```
npm run add-food -- --fdc-id=174273 --food-id=food_farina_di_soia_raw \
  --name-it="Farina di soia, non arricchita, cruda" \
  --matrix-id=farina_di_soia --matrix-description-it="Farina di soia, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_ceci_raw \
  --botanical-family=Fabaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=174273 --food-id=food_farina_di_soia_raw \
  --name-it="Farina di soia, non arricchita, cruda" \
  --matrix-id=farina_di_soia --matrix-description-it="Farina di soia, cruda" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_ceci_raw \
  --botanical-family=Fabaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --apply
```

### Semi di sesamo, tostati — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 18)

- **food_id**: `food_semi_di_sesamo_tostati`. FDC ID 170151 (SR Legacy, "Seeds, sesame seeds, whole, roasted and toasted").
- **Nutrienti**: **15/17**. Presenti: energia 565kcal, proteine 17,0g, grassi 48,0g, carboidrati 25,7g, fibra 14,0g, ferro 14,8mg, zinco 7,16mg, calcio 989mg, rame 2,47mg, magnesio 356mg, selenio 34,4µg, vitamina C 0mg esplicito, vitamina B12 0µg esplicito, folato totale 98,0µg. Mancanti (non assunti zero, non riportati nel record): `vitamin_k_mcg` e `other_provitamin_a_carotenoids_mcg` (alfa-carotene e beta-criptoxantina entrambi non riportati — a differenza del seme crudo, dove erano presenti e avevano dato `carotenoidi raw_intact`). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170151 e dataType SR Legacy (release USDA 30 aprile 2026 indicata in pagina).
- **Analogia usata**: `food_semi_di_sesamo_raw` (semi di sesamo crudi, già eseguiti sul DB reale — stesso alimento, *Sesamum indicum*, forma diversa: tostato invece di crudo; distinto dalla tahina, già eseguita, che è la pasta macinata, non il seme intero).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `semi_di_sesamo_tostati` ("Semi di sesamo, tostati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_semi_di_sesamo_raw`), `carotenoid_matrix_state` omesso (NULL — a differenza del crudo (`raw_intact`) e della tahina (`cooked_or_disrupted`), qui il beta-carotene non è riportato affatto nel record, nessun valore da associare a uno stato di matrice), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Pedaliaceae` (stessa famiglia reale di `food_semi_di_sesamo_raw`/`food_tahina`), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170151 --food-id=food_semi_di_sesamo_tostati \
  --name-it="Semi di sesamo, tostati" \
  --matrix-id=semi_di_sesamo_tostati --matrix-description-it="Semi di sesamo, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_sesamo_raw \
  --botanical-family=Pedaliaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170151 --food-id=food_semi_di_sesamo_tostati \
  --name-it="Semi di sesamo, tostati" \
  --matrix-id=semi_di_sesamo_tostati --matrix-description-it="Semi di sesamo, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_sesamo_raw \
  --botanical-family=Pedaliaceae --diet-category=plant_non_fruit --apply
```

### Riso bianco, cotto, bollito (con sale) — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 18, riapertura dell'undicesimo lotto)

- **food_id**: `food_riso_bianco_cotto`. FDC ID 168935 (riso bianco a chicco lungo, non arricchito, bollito, con sale — dataType non indicato esplicitamente dalla fonte consultata, ma coerente per intervallo numerico con gli altri record SR Legacy di riso già usati in questa coda, 168878-168935).
- **Deviazione dichiarata (variante "con sale" invece di "senza sale")**: la voce di coda era già stata scartata ⚠ nell'undicesimo lotto perché nessuna fonte mostrava un FDC ID numerico per la variante "without salt" richiesta — solo NBD ID interni di aggregatore. Motivo nuovo per riaprirla ora: la variante "with salt" HA un FDC ID verificabile (168935, citato esplicitamente da foodstruct.com con link diretto a `fdc.nal.usda.gov/food-details/168935/nutrients`) — stessa deviazione "con sale" già validata tre volte in questo turno per mandorle/pistacchi/anacardi tostati. Sodio 382mg/100g, non uno dei 17 nutrienti tracciati.
- **Nutrienti**: **15/17**. Presenti: energia 130kcal, proteine 2,7g, grassi 0,28g, carboidrati 28g, fibra 0,4g, ferro 0,2mg, zinco 0,49mg, calcio 10mg, rame 0,07mg, magnesio 12mg, selenio 7,5µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 0µg esplicito, folato totale 3µg. Mancanti (non assunti zero, non riportati nella fonte consultata): `beta_carotene_mcg` e `other_provitamin_a_carotenoids_mcg` (atteso per un cereale raffinato, nessun impatto pratico su vitamina A).
- **Analogia usata**: `food_riso_bianco_raw` (riso bianco crudo, già eseguito sul DB reale — stesso alimento, forma diversa: bollito invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `riso_bianco_cotto` ("Riso bianco, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_riso_bianco_raw`), `carotenoid_matrix_state` omesso (NULL — nessun carotenoide riportato per questo alimento), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (famiglia botanica reale del riso, stessa di altri cereali già nel Golden Set), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento: acido folico non riportato separatamente, folato 3µg basso e coerente con un cereale non arricchito).

```
npm run add-food -- --fdc-id=168935 --food-id=food_riso_bianco_cotto \
  --name-it="Riso bianco, cotto, bollito (con sale)" \
  --matrix-id=riso_bianco_cotto --matrix-description-it="Riso bianco, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_riso_bianco_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168935 --food-id=food_riso_bianco_cotto \
  --name-it="Riso bianco, cotto, bollito (con sale)" \
  --matrix-id=riso_bianco_cotto --matrix-description-it="Riso bianco, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_riso_bianco_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Succo di carota, crudo (in scatola) — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 18)

- **food_id**: `food_succo_di_carota_raw`. FDC ID 170491 (SR Legacy, "Carrot juice, canned").
- **Nutrienti**: **17/17** — tutti presenti. Energia 40,0kcal, proteine 0,95g, grassi 0,15g, carboidrati 9,28g, fibra 0,80g, ferro 0,46mg, zinco 0,18mg, calcio 24,0mg, rame 0,046mg, magnesio 14,0mg, selenio 0,60µg, vitamina C 8,50mg, vitamina K 15,5µg, vitamina B12 0µg esplicito, folato totale 4,00µg, beta-carotene 9.303µg, alfa-carotene 4.342µg, beta-criptoxantina 0µg esplicito (valori di carotenoidi molto alti, coerenti con una verdura notoriamente ricca di provitamina A concentrata in forma di succo). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170491 e dataType SR Legacy.
- **Analogia usata**: `food_carrots_raw` (carote, nel Golden Set originale — stesso alimento, forma diversa: succo spremuto/in scatola invece di radice intera).
- **Categoria dieta**: `plant_non_fruit` (stessa convenzione già usata per succo d'arancia/limone/melograno/mela in questa coda: succo è forma trasformata, non l'ortaggio/frutto intero — non cambia vegetariano/vegano, solo la compatibilità fruttariana, qui comunque irrilevante trattandosi di una radice).
- **Matrice**: nuova `succo_di_carota` ("Succo di carota, crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_carrots_raw`), `carotenoid_matrix_state` omesso (NULL — stessa convenzione già usata per i succhi di frutta in questa coda, nessuno dei quali ha impostato questo campo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (famiglia botanica reale della carota), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170491 --food-id=food_succo_di_carota_raw \
  --name-it="Succo di carota, crudo (in scatola)" \
  --matrix-id=succo_di_carota --matrix-description-it="Succo di carota, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --botanical-family=Apiaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170491 --food-id=food_succo_di_carota_raw \
  --name-it="Succo di carota, crudo (in scatola)" \
  --matrix-id=succo_di_carota --matrix-description-it="Succo di carota, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --botanical-family=Apiaceae --diet-category=plant_non_fruit --apply
```

### Cavolo cappuccio rosso, crudo — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 18)

- **food_id**: `food_cavolo_cappuccio_rosso_raw`. FDC ID 169977 (SR Legacy, "Cabbage, red, raw").
- **Nutrienti**: **17/17** — tutti presenti. Energia 31,0kcal, proteine 1,43g, grassi 0,16g, carboidrati 7,37g, fibra 2,10g, ferro 0,80mg, zinco 0,22mg, calcio 45,0mg, rame 0,017mg, magnesio 16,0mg, selenio 0,60µg, vitamina C 57,0mg, vitamina K 38,2µg, vitamina B12 0µg esplicito, folato totale 18,0µg, beta-carotene 670µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169977 e dataType SR Legacy.
- **Analogia usata**: `food_cavolo_cappuccio_raw` (cavolo cappuccio bianco, già eseguito sul DB reale — stessa specie *Brassica oleracea*, varietà/cultivar diversa: rosso invece che bianco).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `cavolo_cappuccio_rosso` ("Cavolo cappuccio rosso").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_cavolo_cappuccio_raw`), `carotenoid_matrix_state=raw_intact` (beta-carotene 670µg/100g presente, crudo, stessa convenzione del cappuccio bianco), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169977 --food-id=food_cavolo_cappuccio_rosso_raw \
  --name-it="Cavolo cappuccio rosso, crudo" \
  --matrix-id=cavolo_cappuccio_rosso --matrix-description-it="Cavolo cappuccio rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_cavolo_cappuccio_raw \
  --botanical-family=Brassicaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169977 --food-id=food_cavolo_cappuccio_rosso_raw \
  --name-it="Cavolo cappuccio rosso, crudo" \
  --matrix-id=cavolo_cappuccio_rosso --matrix-description-it="Cavolo cappuccio rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_cavolo_cappuccio_raw \
  --botanical-family=Brassicaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --apply
```

### Formaggio Edam — preparato 2026-10-19 dal task orario (quattordicesimo lotto, turno ore 18)

- **food_id**: `food_formaggio_edam`. FDC ID 173419 (SR Legacy, "Cheese, edam").
- **Nutrienti**: **17/17** — tutti presenti. Energia 357kcal, proteine 25,0g, grassi 28,6g, carboidrati 1,43g, fibra 0g esplicito, ferro 0,44mg, zinco 3,75mg, calcio 731mg, rame 0,036mg, magnesio 30,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K 2,30µg, vitamina B12 1,54µg, folato totale 16,0µg, beta-carotene 11,0µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Sodio 973mg/100g, non uno dei 17 nutrienti tracciati. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173419 e dataType SR Legacy.
- **Analogia usata**: `food_parmigiano_reggiano` (formaggio europeo standard, stessa convenzione già usata per gruyère/cheddar/svizzero/provolone in questa coda — nessun formaggio olandese ancora nel Golden Set).
- **Categoria dieta**: `egg_dairy`.
- **Matrice**: nuova `formaggio_edam` ("Formaggio Edam").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_parmigiano_reggiano`), `carotenoid_matrix_state` omesso (NULL — latticino, non un vegetale con matrice a disposizione, stessa scelta degli altri formaggi in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL, prodotto animale), `baseline_cooking_state=raw` (nessuna cottura, stagionatura), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173419 --food-id=food_formaggio_edam \
  --name-it="Formaggio Edam" \
  --matrix-id=formaggio_edam --matrix-description-it="Formaggio Edam" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=173419 --food-id=food_formaggio_edam \
  --name-it="Formaggio Edam" \
  --matrix-id=formaggio_edam --matrix-description-it="Formaggio Edam" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Semi di zucca, tostati (senza sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 18, chiusura del lotto)

- **food_id**: `food_semi_di_zucca_tostati`. FDC ID 170557 (SR Legacy, "Seeds, pumpkin and squash seed kernels, roasted, without salt").
- **Nutrienti**: **17/17** — tutti presenti. Energia 574kcal, proteine 29,8g, grassi 49,0g, carboidrati 14,7g, fibra 6,50g, ferro 8,07mg, zinco 7,64mg, calcio 52,0mg, rame 1,27mg, magnesio 550mg, selenio 9,40µg, vitamina C 1,80mg, vitamina K 4,50µg, vitamina B12 0µg esplicito, folato totale 57,0µg, beta-carotene 5,00µg, alfa-carotene 1,00µg e beta-criptoxantina 0µg esplicito (composito provitamina A = 1,00µg). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170557 e dataType SR Legacy.
- **Analogia usata**: `food_semi_di_zucca_raw` (semi di zucca crudi/essiccati, già eseguiti sul DB reale — stesso alimento, *Cucurbita* spp., forma diversa: tostato invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `semi_di_zucca_tostati` ("Semi di zucca, tostati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_semi_di_zucca_raw`), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 5,00µg/100g presente ma seme tostato, matrice disgregata dal calore — la versione cruda/essiccata era invece `raw_intact`, stessa convenzione già usata per mandorle/nocciole/pistacchi tostati in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae` (stessa famiglia reale di `food_semi_di_zucca_raw`/`food_pumpkin_raw`), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170557 --food-id=food_semi_di_zucca_tostati \
  --name-it="Semi di zucca, tostati (senza sale)" \
  --matrix-id=semi_di_zucca_tostati --matrix-description-it="Semi di zucca, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_zucca_raw \
  --botanical-family=Cucurbitaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170557 --food-id=food_semi_di_zucca_tostati \
  --name-it="Semi di zucca, tostati (senza sale)" \
  --matrix-id=semi_di_zucca_tostati --matrix-description-it="Semi di zucca, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_zucca_raw \
  --botanical-family=Cucurbitaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --apply
```

### Anacardi, tostati (con sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 18)

- **food_id**: `food_anacardi_tostati`. FDC ID 169421 (SR Legacy, "Nuts, cashew nuts, dry roasted, with salt added").
- **Deviazione dichiarata (variante "con sale" invece di "senza sale")**: la voce di coda chiedeva anacardi tostati senza sale. Nessun FDC ID verificabile trovato per la variante "without salt added": l'unica pagina trovata (recipal.com, ingrediente 3676) cita solo un "NBD ID" (12085, non FDC) e i valori per 100g sono ricavati per conversione aritmetica da una porzione di 1 tazza, non valori ufficiali diretti — stesso tipo di gap già usato per scartare altri alimenti in questa coda. L'unica variante con un FDC ID verificato su getfoodfacts.com è "with salt added", FDC 169421 — stessa deviazione già accettata per mandorle/pistacchi tostati in questo stesso turno. Sodio 640mg/100g, non uno dei 17 nutrienti tracciati.
- **Nutrienti**: **17/17** — tutti presenti. Energia 574kcal, proteine 15,3g, grassi 46,4g, carboidrati 32,7g, fibra 3,00g, ferro 6,00mg, zinco 5,60mg, calcio 45,0mg, rame 2,22mg, magnesio 260mg, selenio 11,7µg, vitamina C 0mg esplicito, vitamina K 34,7µg, vitamina B12 0µg esplicito, folato totale 69,0µg, beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti (composito provitamina A = 0, valore riportato non assente). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169421 e dataType SR Legacy.
- **Analogia usata**: `food_anacardi_raw` (anacardi crudi, già eseguiti sul DB reale — stesso alimento, *Anacardium occidentale*, forma diversa: tostato invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `anacardi_tostati` ("Anacardi, tostati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_anacardi_raw`), `carotenoid_matrix_state` omesso/NULL (beta-carotene 0µg/100g per questo alimento — nessun contenuto di carotenoidi da descrivere, stessa scelta già fatta per `food_anacardi_raw` crudo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Anacardiaceae` (famiglia botanica reale dell'anacardio), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169421 --food-id=food_anacardi_tostati \
  --name-it="Anacardi, tostati (con sale)" \
  --matrix-id=anacardi_tostati --matrix-description-it="Anacardi, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anacardi_raw \
  --botanical-family=Anacardiaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169421 --food-id=food_anacardi_tostati \
  --name-it="Anacardi, tostati (con sale)" \
  --matrix-id=anacardi_tostati --matrix-description-it="Anacardi, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anacardi_raw \
  --botanical-family=Anacardiaceae \
  --diet-category=plant_non_fruit --apply
```

### Pistacchi, tostati (con sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 18)

- **food_id**: `food_pistacchi_tostati`. FDC ID 169426 (SR Legacy, "Nuts, pistachio nuts, dry roasted, with salt added").
- **Deviazione dichiarata (variante "con sale" invece di "senza sale")**: la voce di coda chiedeva pistacchi tostati senza sale. Nessun FDC ID verificabile trovato per la variante "without salt added": l'unica pagina trovata (recipal.com, ingrediente 3718) cita solo un "NBD ID" (12152, National Nutrient Database, non FDC) e i valori per 100g sono ricavati per conversione aritmetica da una porzione di 1 cup, non valori ufficiali diretti — stesso tipo di gap già usato per scartare altri alimenti in questa coda (farina di mandorle, succo d'ananas). L'unica variante con un FDC ID verificato su getfoodfacts.com è "with salt added", FDC 169426 — stessa deviazione già accettata per le mandorle tostate in questo stesso turno. Sodio 428mg/100g, non uno dei 17 nutrienti tracciati.
- **Nutrienti**: **17/17** — tutti presenti. Energia 569kcal, proteine 21,1g, grassi 45,8g, carboidrati 27,6g, fibra 10,3g, ferro 4,03mg, zinco 2,34mg, calcio 107mg, rame 1,29mg, magnesio 109mg, selenio 10,0µg, vitamina C 3,00mg, vitamina K 13,2µg, vitamina B12 0µg esplicito, folato totale 51,0µg, beta-carotene 159µg, alfa-carotene e beta-criptoxantina 0µg espliciti (composito provitamina A = 0, valore riportato non assente). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169426 e dataType SR Legacy.
- **Analogia usata**: `food_pistacchi_raw` (pistacchi crudi, già eseguiti sul DB reale — stesso alimento, *Pistacia vera*, forma diversa: tostato invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `pistacchi_tostati` ("Pistacchi, tostati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_pistacchi_raw`), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 159µg/100g presente ma seme tostato, matrice disgregata dal calore, stessa convenzione già usata per mandorle/nocciole tostate in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Anacardiaceae` (famiglia botanica reale del pistacchio), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169426 --food-id=food_pistacchi_tostati \
  --name-it="Pistacchi, tostati (con sale)" \
  --matrix-id=pistacchi_tostati --matrix-description-it="Pistacchi, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_pistacchi_raw \
  --botanical-family=Anacardiaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169426 --food-id=food_pistacchi_tostati \
  --name-it="Pistacchi, tostati (con sale)" \
  --matrix-id=pistacchi_tostati --matrix-description-it="Pistacchi, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_pistacchi_raw \
  --botanical-family=Anacardiaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --apply
```

### Nocciole, tostate (senza sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 18)

- **food_id**: `food_nocciole_tostate`. FDC ID 170583 (SR Legacy, "Nuts, hazelnuts or filberts, dry roasted, without salt added").
- **Nutrienti**: **15/17**. Presenti: energia 646kcal, proteine 15,0g, grassi 62,4g, carboidrati 17,6g, fibra 9,40g, ferro 4,38mg, zinco 2,50mg, calcio 123mg, rame 1,75mg, magnesio 173mg, selenio 4,10µg, vitamina C 3,80mg, vitamina B12 0µg esplicito, folato totale 88,0µg, beta-carotene 36,0µg. Mancanti (non assunti zero): `vitamin_k_mcg` (non riportato nel record) e `other_provitamin_a_carotenoids_mcg` (alfa-carotene 1,00µg presente ma beta-criptoxantina non riportata — per il composito basta un solo componente assente perché l'intero nutriente non venga promosso, vedi `lib/fdc/nutrientMapping.ts`). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170583 e dataType SR Legacy.
- **Analogia usata**: `food_nocciole_raw` (nocciole crude, già eseguite sul DB reale — stesso alimento, *Corylus avellana*, forma diversa: tostato invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `nocciole_tostate` ("Nocciole, tostate").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_nocciole_raw`), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 36,0µg/100g presente ma seme tostato, matrice disgregata dal calore, stessa convenzione già usata per mandorle tostate/semi di girasole tostati/tahina in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Betulaceae` (stessa famiglia reale di `food_nocciole_raw`), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170583 --food-id=food_nocciole_tostate \
  --name-it="Nocciole, tostate (senza sale)" \
  --matrix-id=nocciole_tostate --matrix-description-it="Nocciole, tostate" \
  --baseline-cooking-state=roasted --analogy-food-id=food_nocciole_raw \
  --botanical-family=Betulaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170583 --food-id=food_nocciole_tostate \
  --name-it="Nocciole, tostate (senza sale)" \
  --matrix-id=nocciole_tostate --matrix-description-it="Nocciole, tostate" \
  --baseline-cooking-state=roasted --analogy-food-id=food_nocciole_raw \
  --botanical-family=Betulaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --apply
```

### Mandorle, tostate (con sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_mandorle_tostate`. FDC ID 168596 (SR Legacy, "Nuts, almonds, dry roasted, with salt added").
- **Deviazione dichiarata (variante "con sale" invece di "senza sale")**: la voce di coda chiedeva mandorle tostate senza sale. Nessun FDC ID verificabile trovato per la variante "without salt added" in nessuna fonte consultata (recipal.com la elenca ma cita solo un "NBD ID" legacy, 12063, non un FDC ID; nessuna pagina getfoodfacts.com la indicizza). L'unica variante con un FDC ID verificato su getfoodfacts.com è "with salt added", FDC 168596 — usata qui, stesso tipo di deviazione già accettata altrove in questa coda per prodotti cotti/conservati (es. fagioli lima, cavolo verza). Sodio 234mg/100g, non uno dei 17 nutrienti tracciati.
- **Nutrienti**: **17/17** — tutti presenti. Energia 598kcal, proteine 21,0g, grassi 52,5g, carboidrati 21,0g, fibra 10,9g, ferro 3,73mg, zinco 3,31mg, calcio 268mg, rame 1,10mg, magnesio 279mg, selenio 2,00µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 0µg esplicito, folato totale 55,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 1,00µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168596 e dataType SR Legacy.
- **Analogia usata**: `food_almonds` (mandorle crude, non salate, già eseguite sul DB reale/originali del Golden Set — stesso alimento, *Prunus dulcis*, forma diversa: tostato invece di crudo).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `mandorle_tostate` ("Mandorle, tostate").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, per analogia con `food_almonds`), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 1,00µg/100g presente ma seme tostato, matrice disgregata dal calore, stessa convenzione già usata per i semi di girasole tostati e la tahina in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae` (stessa famiglia reale di `food_almonds`), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168596 --food-id=food_mandorle_tostate \
  --name-it="Mandorle, tostate (con sale)" \
  --matrix-id=mandorle_tostate --matrix-description-it="Mandorle, tostate" \
  --baseline-cooking-state=roasted --analogy-food-id=food_almonds \
  --botanical-family=Rosaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168596 --food-id=food_mandorle_tostate \
  --name-it="Mandorle, tostate (con sale)" \
  --matrix-id=mandorle_tostate --matrix-description-it="Mandorle, tostate" \
  --baseline-cooking-state=roasted --analogy-food-id=food_almonds \
  --botanical-family=Rosaceae --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --apply
```

### Basilico, essiccato — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_basilico_secco_raw`. FDC ID 171317 (SR Legacy, "Spices, basil, dried"). Distinto dal basilico fresco (già "pronto", non ancora eseguito, in una coda precedente): prodotto diverso, record FDC separato e proprio.
- **Nutrienti**: **17/17** — tutti presenti. Energia 233kcal, proteine 23,0g, grassi 4,07g, carboidrati 47,8g, fibra 37,7g, ferro 89,8mg, zinco 7,10mg, calcio 2240mg, rame 2,10mg, magnesio 711mg, selenio 3,00µg, vitamina C 0,80mg, vitamina K (fillochinone) 1715µg, vitamina B12 0µg esplicito, folato totale 310µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 378µg, alfa-carotene 113µg e beta-criptoxantina 24,0µg (entrambi presenti, other_provitamin_a_carotenoids_mcg=137). Ferro/calcio/vitamina K molto alti, ma coerenti con la concentrazione tipica di una spezia essiccata (stesso fenomeno già visto per origano/rosmarino/cannella secchi in questa stessa coda), non un segnale di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171317 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per tutte le altre spezie secche di questa coda; famiglia botanica Lamiaceae dichiarata separatamente, diversa da Asteraceae della scarola).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `basilico_secco` ("Basilico, essiccato").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene/alfa-carotene/beta-criptoxantina tutti espliciti e non nulli, stessa scelta già usata per le altre spezie secche di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Ocimum basilicum*, stessa famiglia di origano/rosmarino/timo/salvia/menta), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171317 --food-id=food_basilico_secco_raw \
  --name-it="Basilico, essiccato" \
  --matrix-id=basilico_secco --matrix-description-it="Basilico, essiccato" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --botanical-family=Lamiaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=171317 --food-id=food_basilico_secco_raw \
  --name-it="Basilico, essiccato" \
  --matrix-id=basilico_secco --matrix-description-it="Basilico, essiccato" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --botanical-family=Lamiaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --apply
```

### Timo, fresco, crudo — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_timo_fresco_raw`. FDC ID 173470 (SR Legacy, "Thyme, fresh"). Distinto da `food_timo_secco_raw` (essiccato, FDC 170938, solo "pronto" non ancora eseguito, già in questa coda): prodotto diverso (fresco vs essiccato), record FDC separato e proprio.
- **Nutrienti**: **14/17** — mancano `selenium_mcg` (assente dalla pagina), `vitamin_k_mcg` (assente) e `other_provitamin_a_carotenoids_mcg` (alfa-carotene e beta-criptoxantina entrambi assenti dalla pagina, servono entrambi per comporre il codice). Presenti: energia 101kcal, proteine 5,56g, grassi 1,68g, carboidrati 24,4g, fibra 14,0g, ferro 17,4mg, zinco 1,81mg, calcio 405mg, rame 0,56mg, magnesio 160mg, vitamina C 160mg, vitamina B12 0µg esplicito, folato totale 45,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 2851µg. Ferro, calcio e vitamina C molto alti, ma coerenti con un'erba fresca a foglia piccola/densa (stesso ordine di grandezza già visto per altre erbe/spezie di questa coda, es. basilico/prezzemolo freschi, origano/rosmarino secchi) — non un segnale di record sbagliato. Gap dichiarato, non stimato; soglia di match ampiamente superata (14/17, stesso livello già accettato per agnello/lupini/cozze cotte in questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173470 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per tutte le altre erbe/spezie di questa coda, "verdura/erba aromatica a foglia"; famiglia botanica Lamiaceae dichiarata separatamente, diversa da Asteraceae della scarola; nessuna pianta della famiglia Lamiaceae ancora eseguita nel Golden Set, tutte — origano/rosmarino/timo secco/salvia/menta/basilico — restano solo "pronte").
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `timo_fresco` ("Timo, fresco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, erba fresca non processata, stessa scelta già usata per le altre erbe/spezie fresche/secche di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Thymus vulgaris*, stessa famiglia di origano/rosmarino/salvia/menta/basilico), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173470 --food-id=food_timo_fresco_raw \
  --name-it="Timo, fresco, crudo" \
  --matrix-id=timo_fresco --matrix-description-it="Timo, fresco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --botanical-family=Lamiaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173470 --food-id=food_timo_fresco_raw \
  --name-it="Timo, fresco, crudo" \
  --matrix-id=timo_fresco --matrix-description-it="Timo, fresco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --botanical-family=Lamiaceae --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --apply
```

### Succo di pompelmo (rosa), crudo (spremuto) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_succo_di_pompelmo_rosa_raw`. FDC ID 167774 (SR Legacy, "Grapefruit juice, pink, raw").
- **Nutrienti**: **12/17** — mancano `fiber_g` (la pagina è incoerente: il riepilogo indica 0g, la tabella dettagliata e il pannello dicono "non dichiarata" — non considerato un valore affidabile, trattato come assente, non assunto zero), `selenium_mcg` (assente dalla pagina), `vitamin_k_mcg` (assente), `beta_carotene_mcg` e `other_provitamin_a_carotenoids_mcg` (la pagina riporta solo la vitamina A aggregata in RAE, 54,3µg/porzione, non i singoli carotenoidi — nessun valore utilizzabile per i codici tracciati). Presenti: energia 39,0kcal, proteine 0,50g, grassi 0,10g, carboidrati 9,20g, ferro 0,20mg, zinco 0,050mg, calcio 9,00mg, rame 0,033mg, magnesio 12,0mg, vitamina C 38,0mg, vitamina B12 0µg esplicito, folato totale 10,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento). Gap dichiarato, non stimato — soglia di match comunque superata (12/17, stesso ordine di grandezza già accettato per radicchio 12/17 e couscous/avena 13/17 in questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167774 e dataType SR Legacy (release 30 aprile 2026).
- **Nota su zucchero aggiunto**: la pagina dichiara "not declared" sia per zucchero totale sia per zucchero aggiunto — non verificabile, ma nessun indizio positivo di zucchero aggiunto (coerente con un succo di pompelmo semplice spremuto, non una bevanda zuccherata).
- **Analogia usata**: `food_pompelmo_rosa_raw` (pompelmo rosa, già eseguito sul DB reale — stessa specie *Citrus × paradisi*, stessa famiglia Rutaceae, forma diversa: succo spremuto invece di polpa intera, stessa convenzione già usata per gli altri succhi di questa coda, es. succo di mela/melograno).
- **Categoria dieta**: `plant_non_fruit` (succo è forma trasformata del frutto, non frutta fresca intera, stessa convenzione già usata per succo d'arancia/limone/mela/melograno in questa coda — non cambia vegetariano/vegano, solo la compatibilità fruttariana).
- **Matrice**: nuova `succo_di_pompelmo_rosa` ("Succo di pompelmo (rosa), crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione degli altri succhi), `carotenoid_matrix_state` omesso (NULL — a differenza del succo di mela/melograno dove i carotenoidi erano 0µg espliciti, qui sono semplicemente assenti dal record: nessuno stato dichiarabile, gap sopra), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae` (famiglia reale degli agrumi, stessa di `food_pompelmo_rosa_raw`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=167774 --food-id=food_succo_di_pompelmo_rosa_raw \
  --name-it="Succo di pompelmo (rosa), crudo (spremuto)" \
  --matrix-id=succo_di_pompelmo_rosa --matrix-description-it="Succo di pompelmo (rosa), crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_pompelmo_rosa_raw \
  --botanical-family=Rutaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=167774 --food-id=food_succo_di_pompelmo_rosa_raw \
  --name-it="Succo di pompelmo (rosa), crudo (spremuto)" \
  --matrix-id=succo_di_pompelmo_rosa --matrix-description-it="Succo di pompelmo (rosa), crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_pompelmo_rosa_raw \
  --botanical-family=Rutaceae --diet-category=plant_non_fruit --apply
```

### Pane azzimo (matzo), semplice — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_pane_azzimo`. FDC ID 172740 (SR Legacy, "Crackers, matzo, plain").
- **Nutrienti**: **17/17** — tutti presenti. Energia 395kcal, proteine 10,0g, grassi 1,40g, carboidrati 83,7g, fibra 3,00g, ferro 3,16mg, zinco 0,68mg, calcio 13,0mg, rame 0,060mg, magnesio 25,0mg, selenio 36,9µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 0,30µg, vitamina B12 0µg esplicito, folato totale 17,0µg, acido folico 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172740 e dataType SR Legacy.
- **Verifica specifica anti-arricchimento (punto 2b del COMPITO)**: a differenza di pane comune/pane integrale/pancarré (tutti ⚠ in questa coda per firma di arricchimento stile USA), il matzo "plain" **evita** il problema: l'acido folico è riportato come voce separata dal folato alimentare ma a **0µg esplicito** (non positivo come nei pane arricchiti già scartati, dove era 18-98µg/100g), e il calcio (13mg/100g) è basso, coerente con un prodotto semplice farina+acqua, non con farina arricchita stile USA (quei record mostravano 86-163mg/100g). Coerente col fatto che il matzo tradizionale (per l'uso rituale ebraico) usa farina non arricchita per ricetta — variante "plain", distinta dalle varianti "egg"/"egg and onion"/"whole-wheat" trovate nella stessa ricerca ma scartate perché prodotti diversi (ingredienti aggiunti o farina integrale non richiesta dalla voce di coda).
- **Analogia usata**: `food_farina_di_frumento_integrale_raw` (farina di frumento integrale, già eseguita sul DB reale — stesso cereale *Triticum*, entrambi prodotti non arricchiti).
- **Categoria dieta**: `plant_non_fruit` (prodotto da forno a base di sola farina e acqua, nessun ingrediente animale nella variante "plain").
- **Matrice**: nuova `pane_azzimo` ("Pane azzimo (matzo), semplice").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, nessuno stato da dichiarare), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (famiglia reale del grano, *Triticum aestivum*), `baseline_cooking_state=baked` (prodotto da forno, non crudo), `is_fortified_folate` omesso (false — acido folico 0µg esplicito, vedi verifica sopra).

```
npm run add-food -- --fdc-id=172740 --food-id=food_pane_azzimo \
  --name-it="Pane azzimo (matzo), semplice" \
  --matrix-id=pane_azzimo --matrix-description-it="Pane azzimo (matzo), semplice" \
  --baseline-cooking-state=baked --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=172740 --food-id=food_pane_azzimo \
  --name-it="Pane azzimo (matzo), semplice" \
  --matrix-id=pane_azzimo --matrix-description-it="Pane azzimo (matzo), semplice" \
  --baseline-cooking-state=baked --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Formaggio Camembert — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_camembert`. FDC ID 172178 (SR Legacy, "Cheese, camembert").
- **Nutrienti**: **17/17** — tutti presenti. Energia 300kcal, proteine 19,8g, grassi 24,3g, carboidrati 0,46g, fibra 0g esplicito, ferro 0,33mg, zinco 2,38mg, calcio 388mg, rame 0,021mg, magnesio 20,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,00µg, vitamina B12 1,30µg, folato totale 62,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 12,0µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172178 e dataType SR Legacy (voce immediatamente successiva al brie nel catalogo SR Legacy). Energia coerente coi macronutrienti; sodio alto (842mg/100g) ma tipico dei formaggi, non tracciato. Stesso esito positivo del brie lavorato in questo stesso turno: a differenza di mascarpone/mozzarella di bufala, esiste un record generico SR Legacy pulito e completo.
- **Analogia usata**: `food_parmigiano_reggiano` (formaggio stagionato, già eseguito sul DB reale — stessa categoria "formaggio a pasta ottenuta per coagulazione e stagionatura"; NON `food_brie`, che in questo stesso turno è solo "pronto", non ancora reale nel DB).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `camembert` ("Formaggio Camembert").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini/formaggi aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw` (stessa convenzione degli altri formaggi pronti al consumo), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172178 --food-id=food_camembert \
  --name-it="Formaggio Camembert" \
  --matrix-id=camembert --matrix-description-it="Formaggio Camembert" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172178 --food-id=food_camembert \
  --name-it="Formaggio Camembert" \
  --matrix-id=camembert --matrix-description-it="Formaggio Camembert" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Formaggio Brie — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_brie`. FDC ID 172177 (SR Legacy, "Cheese, brie").
- **Nutrienti**: **17/17** — tutti presenti. Energia 334kcal, proteine 20,8g, grassi 27,7g, carboidrati 0,45g, fibra 0g esplicito, ferro 0,50mg, zinco 2,38mg, calcio 184mg, rame 0,019mg, magnesio 20,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,30µg, vitamina B12 1,65µg, folato totale 65,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento — i valori di B12/folato sono naturali del formaggio), beta-carotene 9,00µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172177 e dataType SR Legacy. Energia coerente col calcolo dai macronutrienti (~332kcal contro 334 dichiarati); sodio alto (629mg/100g) ma tipico dei formaggi, non uno dei 17 nutrienti tracciati. Contrariamente al precedente già dichiarato per mascarpone/mozzarella di bufala in questa coda (nessun record generico, solo Branded scarsi), per il brie esiste un record SR Legacy generico pulito e completo.
- **Analogia usata**: `food_parmigiano_reggiano` (formaggio stagionato, già eseguito sul DB reale — stessa categoria "formaggio a pasta ottenuta per coagulazione e stagionatura", a differenza di mozzarella/ricotta che sono formaggi freschi non stagionati).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `brie` ("Formaggio Brie").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini/formaggi aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw` (stessa convenzione già usata per gli altri formaggi pronti al consumo, es. parmigiano/mozzarella/ricotta), `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172177 --food-id=food_brie \
  --name-it="Formaggio Brie" \
  --matrix-id=brie --matrix-description-it="Formaggio Brie" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172177 --food-id=food_brie \
  --name-it="Formaggio Brie" \
  --matrix-id=brie --matrix-description-it="Formaggio Brie" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Panna, densa, da montare (heavy whipping cream), cruda — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_panna_densa_raw`. FDC ID 170859 (SR Legacy, "Cream, fluid, heavy whipping").
- **Nutrienti**: **17/17** — tutti presenti. Energia 340kcal, proteine 2,84g, grassi 36,1g, carboidrati 2,84g, fibra 0g esplicito, ferro 0,10mg, zinco 0,24mg, calcio 66,0mg, rame 0,011mg, magnesio 7,00mg, selenio 3,00µg, vitamina C 0,60mg, vitamina K (fillochinone) 3,20µg, vitamina B12 0,16µg, folato totale 4,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 72,0µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170859 e dataType SR Legacy. Piccola incongruenza minore fra carboidrati per differenza (2,84g) e zuccheri totali dichiarati (2,92g) sulla stessa pagina — scarto di arrotondamento, stesso tipo di piccola discrepanza già accettata altrove in questa coda, non bloccante.
- **Distinto da**: `food_panna_da_cucina_raw` (panna fluida leggera/da cucina, FDC 170857, grasso 19,1g/100g, solo "pronto" non ancora eseguito, preparata nel sesto lotto): prodotto diverso (panna da montare vs panna da cucina, quasi il doppio del grasso), non riusabile come analogia perché non ancora reale nel DB.
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, già eseguito sul DB reale — nessun derivato della panna è ancora eseguito nel Golden Set: stessa famiglia di prodotto, latte fluido, differisce per contenuto di grassi).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `panna_densa` ("Panna, densa, da montare").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini/formaggi aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale, stessa convenzione dei latticini), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170859 --food-id=food_panna_densa_raw \
  --name-it="Panna, densa, da montare (heavy whipping cream), cruda" \
  --matrix-id=panna_densa --matrix-description-it="Panna, densa, da montare" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170859 --food-id=food_panna_densa_raw \
  --name-it="Panna, densa, da montare (heavy whipping cream), cruda" \
  --matrix-id=panna_densa --matrix-description-it="Panna, densa, da montare" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy --apply
```

### Latte vaccino, parzialmente scremato (2% grassi, senza vitamine A/D aggiunte) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 17)

- **food_id**: `food_latte_parzialmente_scremato_raw`. FDC ID 172205 (SR Legacy, "Milk, reduced fat, fluid, 2% milkfat, without added vitamin A and vitamin D").
- **Nutrienti**: **17/17** — tutti presenti. Energia 50,0kcal, proteine 3,30g, grassi 1,98g, carboidrati 4,80g, fibra 0g esplicito, ferro 0,020mg, zinco 0,48mg, calcio 120mg, rame 0,0060mg, magnesio 11,0mg, selenio 2,50µg, vitamina C 0,20mg, vitamina K (fillochinone) 0,20µg, vitamina B12 0,53µg, folato totale 5,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento — coerente col nome del record, "without added vitamin A and vitamin D"), beta-carotene 7,00µg, alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172205 e dataType SR Legacy. Calcolo kcal dai macronutrienti (~50) coerente col valore dichiarato — nessuna anomalia.
- **Distinto da**: `food_milk_whole` (latte intero 3,25% grassi, con vitamina D aggiunta, già eseguito) per contenuto di grassi e per l'assenza di vitamine A/D aggiunte — queste ultime non sono fra i 17 nutrienti tracciati, quindi la differenza non incide sui valori salvati. Anche distinto da `food_latte_scremato_raw` (0% grassi, con vitamine A/D aggiunte, solo "pronto" non ancora eseguito in questa stessa coda): prodotto diverso, non riusabile come analogia perché non ancora reale nel DB.
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, già eseguito sul DB reale — stessa famiglia di prodotto, latte fluido, differisce solo per percentuale di grassi).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `latte_parzialmente_scremato` ("Latte vaccino, parzialmente scremato").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per i latticini/formaggi aggiunti dopo i 30 originali, la categoria ossalati del latte intero non è stata sistematicamente estesa ai derivati), `carotenoid_matrix_state` omesso (NULL — non applicabile a un prodotto animale, stessa convenzione già usata per `food_latte_scremato_raw`), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=172205 --food-id=food_latte_parzialmente_scremato_raw \
  --name-it="Latte vaccino, parzialmente scremato (2% grassi, senza vitamine A/D aggiunte)" \
  --matrix-id=latte_parzialmente_scremato --matrix-description-it="Latte vaccino, parzialmente scremato" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172205 --food-id=food_latte_parzialmente_scremato_raw \
  --name-it="Latte vaccino, parzialmente scremato (2% grassi, senza vitamine A/D aggiunte)" \
  --matrix-id=latte_parzialmente_scremato --matrix-description-it="Latte vaccino, parzialmente scremato" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy --apply
```

### Fagioli lima, cotti, bolliti (con sale) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 16)

- **food_id**: `food_fagioli_lima_bolliti`. FDC ID 173802 (SR Legacy, "Lima beans, large, mature seeds, cooked, boiled, with salt").
- **Nutrienti**: **17/17** — tutti presenti. Energia 115kcal, proteine 7,80g, grassi 0,38g, carboidrati 20,9g, fibra 7,00g, ferro 2,39mg, zinco 0,95mg, calcio 17,0mg, rame 0,23mg, magnesio 43,0mg, selenio 4,50µg, vitamina C 0mg esplicito, vitamina K 2,00µg, vitamina B12 0µg esplicito, folato totale 83,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Sodio 238mg/100g: nessuna variante "without salt" con FDC ID verificabile trovata in nessuna fonte consultata (solo un NBD ID legacy su recipal.com, 16072/16075) — stesso tipo di gap già incontrato più volte in questa coda per legumi/verdure cotte (es. cavolfiore cotto, peperoni cotti, cipolle cotte); scelta la variante "with salt", l'unica con FDC ID verificato, sodio non è uno dei 17 nutrienti tracciati.
- **Analogia usata**: `food_kidney_beans_boiled` (fagioli rossi bolliti, Golden Set originale — stesso genere *Phaseolus*, stesso stato di cottura; coerente con l'analogia già usata per il crudo `food_fagioli_lima_raw`, ancora solo "pronto" e quindi non utilizzabile come analogia per punto 2c del COMPITO).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `fagioli_lima_bolliti` ("Fagioli lima, cotti, bolliti") — distinta dalla matrice dei fagioli lima secchi crudi.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173802 --food-id=food_fagioli_lima_bolliti \
  --name-it="Fagioli lima, cotti, bolliti" \
  --matrix-id=fagioli_lima_bolliti --matrix-description-it="Fagioli lima, cotti, bolliti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled \
  --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173802 --food-id=food_fagioli_lima_bolliti \
  --name-it="Fagioli lima, cotti, bolliti" \
  --matrix-id=fagioli_lima_bolliti --matrix-description-it="Fagioli lima, cotti, bolliti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled \
  --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Ceci, in scatola, sgocciolati — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 16)

- **food_id**: `food_ceci_in_scatola`. FDC ID 173800 (SR Legacy, "Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids").
- **Nutrienti**: **17/17** — tutti presenti. Energia 139kcal, proteine 7,05g, grassi 2,77g, carboidrati 22,5g, fibra 6,40g, ferro 1,07mg, zinco 0,63mg, calcio 45,0mg, rame 0,25mg, magnesio 26,0mg, selenio 3,10µg, vitamina C 0,10mg, vitamina K 3,40µg, vitamina B12 0µg esplicito, folato totale 48,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 14,0µg, alfa-carotene/beta-criptoxantina 0µg espliciti. Sodio 246mg/100g (sale di conservazione tipico per un prodotto in scatola, non uno dei 17 nutrienti tracciati, non un segnale di arricchimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 173800 e dataType SR Legacy.
- **Analogia usata**: `food_chickpeas_raw` (ceci crudi secchi, Golden Set originale, già eseguiti sul DB reale — stesso alimento, forma in scatola/già cotta invece di secca).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `ceci_in_scatola` ("Ceci, in scatola, sgocciolati") — distinta dalla matrice dei ceci secchi crudi.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 14,0µg/100g presente, ma matrice disgregata dalla cottura in scatola/processo di inscatolamento), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=canned`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173800 --food-id=food_ceci_in_scatola \
  --name-it="Ceci, in scatola, sgocciolati" \
  --matrix-id=ceci_in_scatola --matrix-description-it="Ceci, in scatola, sgocciolati" \
  --baseline-cooking-state=canned --analogy-food-id=food_chickpeas_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173800 --food-id=food_ceci_in_scatola \
  --name-it="Ceci, in scatola, sgocciolati" \
  --matrix-id=ceci_in_scatola --matrix-description-it="Ceci, in scatola, sgocciolati" \
  --baseline-cooking-state=canned --analogy-food-id=food_chickpeas_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Noce di cocco, disidratata (grattugiata), non zuccherata — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 15)

- **food_id**: `food_cocco_disidratato_raw`. FDC ID 170170 (SR Legacy, "Nuts, coconut meat, dried (desiccated), not sweetened").
- **Nutrienti**: **17/17** — tutti presenti. Energia 660kcal, proteine 6,88g, grassi 64,5g, carboidrati 23,6g, fibra 16,3g, ferro 3,32mg, zinco 2,01mg, calcio 26,0mg, rame 0,80mg, magnesio 90,0mg, selenio 18,5µg, vitamina C 1,50mg, vitamina K 0,30µg, vitamina B12 0µg esplicito, folato totale 9,00µg, acido folico 0µg esplicito (nessuno zucchero aggiunto, "not sweetened" dichiarato nel nome del record stesso), beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 170170 e dataType SR Legacy.
- **Analogia usata**: `food_olio_di_cocco_raw` (olio di cocco, già eseguito sul DB reale — stessa specie *Cocos nucifera*, famiglia Arecaceae; distinto da `food_noce_di_cocco_raw`, polpa fresca, ancora solo "pronta" non eseguita, e da `food_farina_di_cocco_raw`, farina, anch'essa solo "pronta": l'analogia non può riferirsi a nessuna delle due).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `cocco_disidratato` ("Noce di cocco, disidratata, non zuccherata") — distinta dalla polpa fresca e dall'olio.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae`, `baseline_cooking_state=dried` (prodotto disidratato, non crudo fresco né cotto), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170170 --food-id=food_cocco_disidratato_raw \
  --name-it="Noce di cocco, disidratata (grattugiata), non zuccherata" \
  --matrix-id=cocco_disidratato --matrix-description-it="Noce di cocco, disidratata, non zuccherata" \
  --baseline-cooking-state=dried --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170170 --food-id=food_cocco_disidratato_raw \
  --name-it="Noce di cocco, disidratata (grattugiata), non zuccherata" \
  --matrix-id=cocco_disidratato --matrix-description-it="Noce di cocco, disidratata, non zuccherata" \
  --baseline-cooking-state=dried --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae \
  --diet-category=plant_non_fruit --apply
```

### Fave, secche, crude — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 15)

- **food_id**: `food_fave_secche_raw`. FDC ID 175205 (SR Legacy, "Broadbeans (fava beans), mature seeds, raw").
- **Nutrienti**: **17/17** — tutti presenti. Energia 341kcal, proteine 26,1g, grassi 1,53g, carboidrati 58,3g, fibra 25,0g, ferro 6,70mg, zinco 3,14mg, calcio 103mg, rame 0,82mg, magnesio 192mg, selenio 8,20µg, vitamina C 1,40mg, vitamina K 9,00µg, vitamina B12 0µg esplicito, folato totale 423µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 32,0µg (seme crudo, non zero), alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 175205 e dataType SR Legacy.
- **Analogia usata**: `food_fave_bollite` (fave bollite, Golden Set/primo lotto, già eseguite sul DB reale — stesso alimento, forma cruda/secca invece di bollita).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `fave_secche` ("Fave, secche, crude") — distinta dalla matrice usata per le fave bollite.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 32,0µg/100g presente, seme crudo intatto, non disgregato dalla cottura), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175205 --food-id=food_fave_secche_raw \
  --name-it="Fave, secche, crude" \
  --matrix-id=fave_secche --matrix-description-it="Fave, secche, crude" \
  --baseline-cooking-state=raw --analogy-food-id=food_fave_bollite \
  --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=175205 --food-id=food_fave_secche_raw \
  --name-it="Fave, secche, crude" \
  --matrix-id=fave_secche --matrix-description-it="Fave, secche, crude" \
  --baseline-cooking-state=raw --analogy-food-id=food_fave_bollite \
  --carotenoid-matrix-state=raw_intact --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Tonno, in scatola, al naturale (in acqua), sgocciolato — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 15)

- **food_id**: `food_tonno_in_scatola_acqua`. FDC ID 171986 (SR Legacy, "Fish, tuna, light, canned in water, without salt, drained solids").
- **Nutrienti**: **13/17** — mancano vitamina K, beta-carotene, alfa-carotene e beta-criptoxantina (non riportati nel record, gap atteso per un pesce in scatola, stesso tipo di gap già visto per il tonno sott'olio in coda precedente). Energia 116kcal, proteine 25,5g, grassi 0,82g, carboidrati 0g, fibra 0g, ferro 1,53mg, zinco 0,77mg, calcio 11,0mg, rame 0,051mg, magnesio 27,0mg, selenio 80,4µg, vitamina C 0mg esplicito, vitamina B12 2,99µg, folato totale 4,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento; variante "without salt" scelta deliberatamente, nessun sodio aggiunto). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 171986 e dataType SR Legacy.
- **Analogia usata**: `food_tonno_fresco_raw` (tonno fresco, pinna gialla, già eseguito sul DB reale — stesso genere *Thunnus*, prodotto in scatola invece che fresco).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `tonno_in_scatola_acqua` ("Tonno, in scatola, al naturale, sgocciolato") — distinta dal tonno sott'olio (ancora solo "pronto", non eseguito) e dal tonno fresco.
- **Attributi**: `is_heme_iron` (flag `--is-heme-iron`, muscolo di pesce), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL, non pertinente), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (animale, non pertinente), `baseline_cooking_state=canned`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171986 --food-id=food_tonno_in_scatola_acqua \
  --name-it="Tonno, in scatola, al naturale (in acqua), sgocciolato" \
  --matrix-id=tonno_in_scatola_acqua --matrix-description-it="Tonno, in scatola, al naturale, sgocciolato" \
  --baseline-cooking-state=canned --analogy-food-id=food_tonno_fresco_raw \
  --is-heme-iron \
  --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171986 --food-id=food_tonno_in_scatola_acqua \
  --name-it="Tonno, in scatola, al naturale (in acqua), sgocciolato" \
  --matrix-id=tonno_in_scatola_acqua --matrix-description-it="Tonno, in scatola, al naturale, sgocciolato" \
  --baseline-cooking-state=canned --analogy-food-id=food_tonno_fresco_raw \
  --is-heme-iron \
  --diet-category=meat_fish --apply
```

### Yogurt greco, magro (nonfat) — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 15)

- **food_id**: `food_yogurt_greco_magro`. FDC ID 170894 (SR Legacy, "Yogurt, Greek, plain, nonfat (Includes foods for USDA's Food Distribution Program)").
- **Nutrienti**: **17/17** — tutti presenti. Energia 59,0kcal, proteine 10,2g, grassi 0,39g, carboidrati 3,60g, fibra 0g, ferro 0,070mg, zinco 0,52mg, calcio 110mg, rame 0,017mg, magnesio 11,0mg, selenio 9,70µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 0,75µg, folato totale 7,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 170894 e dataType SR Legacy.
- **Analogia usata**: `food_yogurt_greco` (yogurt greco intero, già eseguito sul DB reale — stesso prodotto, variante magra/nonfat invece di intera).
- **Categoria dieta**: `egg_dairy`.
- **Matrice**: nuova `yogurt_greco_magro` ("Yogurt greco, magro") — distinta dallo yogurt greco intero.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (non pertinente), `baseline_cooking_state=raw` (latticino fresco, nessuna cottura), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170894 --food-id=food_yogurt_greco_magro \
  --name-it="Yogurt greco, magro (nonfat)" \
  --matrix-id=yogurt_greco_magro --matrix-description-it="Yogurt greco, magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_greco \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170894 --food-id=food_yogurt_greco_magro \
  --name-it="Yogurt greco, magro (nonfat)" \
  --matrix-id=yogurt_greco_magro --matrix-description-it="Yogurt greco, magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_greco \
  --diet-category=egg_dairy --apply
```

### Fagioli lima (lima beans), secchi, crudi — preparato 2026-10-19 dal task orario (tredicesimo lotto, turno ore 15)

- **food_id**: `food_fagioli_lima_raw`. FDC ID 174252 (SR Legacy, "Lima beans, large, mature seeds, raw").
- **Nutrienti**: **17/17** — tutti presenti. Energia 338kcal, proteine 21,5g, grassi 0,69g, carboidrati 63,4g, fibra 19,0g, ferro 7,51mg, zinco 2,83mg, calcio 81,0mg, rame 0,74mg, magnesio 224mg, selenio 7,20µg, vitamina C 0mg esplicito, vitamina K 6,00µg, vitamina B12 0µg esplicito, folato totale 395µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 174252 e dataType SR Legacy.
- **Analogia usata**: `food_kidney_beans_raw` (fagioli rossi crudi, Golden Set originale — stesso genere *Phaseolus*, specie diversa: *P. lunatus* contro *P. vulgaris*, dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `fagioli_lima` ("Fagioli lima, secchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174252 --food-id=food_fagioli_lima_raw \
  --name-it="Fagioli lima (lima beans), secchi, crudi" \
  --matrix-id=fagioli_lima --matrix-description-it="Fagioli lima, secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=174252 --food-id=food_fagioli_lima_raw \
  --name-it="Fagioli lima (lima beans), secchi, crudi" \
  --matrix-id=fagioli_lima --matrix-description-it="Fagioli lima, secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Salmone, in scatola (con lische, sgocciolato) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 15)

- **food_id**: `food_salmone_in_scatola`. FDC ID 175135 (SR Legacy, "Fish, salmon, chum, canned, drained solids with bone").
- **Nutrienti**: **17/17** — tutti presenti. Energia 141kcal, proteine 21,4g, grassi 5,50g, carboidrati 0g, fibra 0g, ferro 0,70mg, zinco 1,00mg, calcio 249mg (alto per le lische edibili incluse nel prodotto, non arricchimento), rame 0,10mg, magnesio 30,0mg, selenio 43,3µg, vitamina C 0mg esplicito, vitamina K 0,10µg, vitamina B12 4,40µg, folato totale 20,0µg, acido folico 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 175135 e dataType SR Legacy. Specie salmone chum (*Oncorhynchus keta*), non atlantico — nessun record FDC per salmone in scatola di specie atlantica trovato; il chum è comunque un salmone reale, comunemente in scatola, non un pesce diverso sotto nome improprio.
- **Analogia usata**: `food_salmon_cooked` (salmone atlantico cotto, Golden Set originale, già eseguito/verificato — stessa famiglia Salmonidae, specie diversa dichiarata separatamente).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `salmone_in_scatola` ("Salmone, in scatola, con lische, sgocciolato").
- **Attributi**: `is_heme_iron` (flag `--is-heme-iron`), `matrix_category_calcium` omesso (NULL — il calcio alto è dichiarato a parte nel testo, non categorizzato: quella colonna è pensata per matrici vegetali/ossalati, non per pesce), `carotenoid_matrix_state` omesso, `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (non pertinente), `baseline_cooking_state=canned`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175135 --food-id=food_salmone_in_scatola \
  --name-it="Salmone, in scatola (con lische, sgocciolato)" \
  --matrix-id=salmone_in_scatola --matrix-description-it="Salmone, in scatola, con lische, sgocciolato" \
  --baseline-cooking-state=canned --analogy-food-id=food_salmon_cooked \
  --is-heme-iron \
  --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175135 --food-id=food_salmone_in_scatola \
  --name-it="Salmone, in scatola (con lische, sgocciolato)" \
  --matrix-id=salmone_in_scatola --matrix-description-it="Salmone, in scatola, con lische, sgocciolato" \
  --baseline-cooking-state=canned --analogy-food-id=food_salmon_cooked \
  --is-heme-iron \
  --diet-category=meat_fish --apply
```

### Baccalà (merluzzo salato ed essiccato) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 15)

- **food_id**: `food_baccala_salato_secco`. FDC ID 174190 (SR Legacy, "Fish, cod, Atlantic, dried and salted").
- **Nutrienti**: **17/17** — tutti presenti. Energia 290kcal, proteine 62,8g, grassi 2,37g, carboidrati 0g, fibra 0g, ferro 2,50mg, zinco 1,59mg, calcio 160mg, rame 0,18mg, magnesio 133mg, selenio 148µg, vitamina C 3,50mg, vitamina K 0,40µg, vitamina B12 10,0µg, folato totale 25,0µg, acido folico 0µg esplicito, beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 174190 e dataType SR Legacy. Prodotto a lunga conservazione (merluzzo salato ed essiccato) — rappresenta direttamente il "baccalà" italiano, stessa specie *Gadus morhua*, non un alimento diverso sotto nome improprio; sodio non tracciato dal motore ma elevato per natura del prodotto.
- **Analogia usata**: `food_merluzzo_raw` (merluzzo/Atlantic cod, già eseguito sul DB reale — stessa specie *Gadus morhua*, diverso solo per il metodo di conservazione).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `baccala` ("Baccalà, merluzzo salato ed essiccato").
- **Attributi**: `is_heme_iron` (flag `--is-heme-iron`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso, `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (non pertinente), `baseline_cooking_state=dried_salted` (nessun enum fisso per questo campo nello script: descrive correttamente un prodotto conservato, non crudo fresco), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174190 --food-id=food_baccala_salato_secco \
  --name-it="Baccalà (merluzzo salato ed essiccato)" \
  --matrix-id=baccala --matrix-description-it="Baccalà, merluzzo salato ed essiccato" \
  --baseline-cooking-state=dried_salted --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron \
  --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174190 --food-id=food_baccala_salato_secco \
  --name-it="Baccalà (merluzzo salato ed essiccato)" \
  --matrix-id=baccala --matrix-description-it="Baccalà, merluzzo salato ed essiccato" \
  --baseline-cooking-state=dried_salted --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron \
  --diet-category=meat_fish --apply
```

### Acqua di cocco, cruda — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 15 — ricerca FDC già fatta nel turno ore 14, qui completata la scrittura del comando)

- **food_id**: `food_acqua_di_cocco_raw`. FDC ID 170174 (SR Legacy, "Nuts, coconut water (liquid from coconuts)").
- **Nutrienti**: **17/17** — tutti presenti. Energia 19,0kcal, proteine 0,72g, grassi 0,20g, carboidrati 3,71g, fibra 1,10g, ferro 0,29mg, zinco 0,10mg, calcio 24,0mg, rame 0,040mg, magnesio 25,0mg, selenio 1,00µg, vitamina C 2,40mg, vitamina K 0µg esplicito, vitamina B12 0µg esplicito, folato totale 3,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene/alfa-carotene/beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC 170174 e dataType SR Legacy.
- **Analogia usata**: `food_olio_di_cocco_raw` (olio di cocco, già eseguito sul DB reale — stessa specie *Cocos nucifera*, famiglia Arecaceae; liquido naturale, non un "latte" ricostituito/arricchito come le bevande vegetali già scartate in coda precedente).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `acqua_di_cocco` ("Acqua di cocco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa scelta già fatta per polpa/farina di cocco), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170174 --food-id=food_acqua_di_cocco_raw \
  --name-it="Acqua di cocco, cruda" \
  --matrix-id=acqua_di_cocco --matrix-description-it="Acqua di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170174 --food-id=food_acqua_di_cocco_raw \
  --name-it="Acqua di cocco, cruda" \
  --matrix-id=acqua_di_cocco --matrix-description-it="Acqua di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae \
  --diet-category=plant_non_fruit --apply
```

### Tahina (crema di semi di sesamo tostati) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, bonus oltre la quota)

- **food_id**: `food_tahina`. FDC ID 170189 (SR Legacy, "Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type)").
- **Nutrienti**: **17/17** — tutti presenti. Energia 595kcal, proteine 17,0g, grassi 53,8g, carboidrati 21,2g, fibra 9,30g, ferro 8,95mg, zinco 4,62mg, calcio 426mg, rame 1,61mg, magnesio 95,0mg, selenio 34,4µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 0µg esplicito, folato totale 98,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 40,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170189 e dataType SR Legacy.
- **Analogia usata**: `food_semi_di_sesamo_raw` (semi di sesamo, già eseguiti sul DB reale — stessa fonte vegetale, forma diversa: pasta tostata e macinata invece del seme intero).
- **Categoria dieta**: `plant_non_fruit` (derivato vegetale da semi).
- **Matrice**: nuova `tahina` ("Tahina, crema di semi di sesamo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 40,0µg/100g presente, ma matrice disgregata dalla tostatura e macinazione), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Pedaliaceae` (famiglia reale del sesamo, *Sesamum indicum*), `baseline_cooking_state=roasted` (da semi tostati e abbrustoliti), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170189 --food-id=food_tahina \
  --name-it="Tahina (crema di semi di sesamo tostati)" \
  --matrix-id=tahina --matrix-description-it="Tahina, crema di semi di sesamo" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_sesamo_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Pedaliaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170189 --food-id=food_tahina \
  --name-it="Tahina (crema di semi di sesamo tostati)" \
  --matrix-id=tahina --matrix-description-it="Tahina, crema di semi di sesamo" \
  --baseline-cooking-state=roasted --analogy-food-id=food_semi_di_sesamo_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Pedaliaceae \
  --diet-category=plant_non_fruit --apply
```

### Lievito di birra, secco attivo — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, bonus oltre la quota)

- **food_id**: `food_lievito_di_birra_secco`. FDC ID 175043 (SR Legacy, "Leavening agents, yeast, baker's, active dry").
- **Nutrienti**: **17/17** — tutti presenti. Energia 325kcal, proteine 40,4g, grassi 7,61g, carboidrati 41,2g, fibra 26,9g, ferro 2,17mg, zinco 7,94mg, calcio 30,0mg, rame 0,44mg, magnesio 54,0mg, selenio 7,90µg, vitamina C 0,30mg, vitamina K (fillochinone) 0,40µg, vitamina B12 0,070µg, folato totale 2.340µg (molto alto, ma caratteristica nota e naturale del lievito — non un segno di arricchimento: non c'è un acido folico separato diverso da zero e la pagina non menziona additivi), acido folico 0µg esplicito, beta-carotene 0µg esplicito, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175043 e dataType SR Legacy.
- **Distinzione dal "lievito alimentare" già scartato (⚠, lotto precedente)**: questo è lievito di birra/panificazione attivo essiccato (*Saccharomyces cerevisiae* per lievitazione, non disattivato), diverso dal lievito alimentare (nutritional yeast, disattivato, spesso arricchito artificialmente con B12 — da cui il problema di fortificazione già incontrato). Qui la vitamina B12 è bassa (0,070µg/100g) e coerente con un lievito non arricchito, nessun segnale di fortificazione.
- **Analogia usata**: `food_mushroom_white_raw` (funghi champignon, già eseguiti sul DB reale — stessa categoria "fungo, non pianta", nessuna famiglia botanica, stesso trattamento categorico già usato per i funghi in questa coda).
- **Categoria dieta**: `plant_non_fruit` (fungo, non di origine animale; stesso bucket categorico già usato per i funghi).
- **Matrice**: nuova `lievito_di_birra` ("Lievito di birra, secco attivo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — fungo, non pianta, stessa convenzione dei funghi champignon/shiitake già in coda), `baseline_cooking_state=dried`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175043 --food-id=food_lievito_di_birra_secco \
  --name-it="Lievito di birra, secco attivo" \
  --matrix-id=lievito_di_birra --matrix-description-it="Lievito di birra, secco attivo" \
  --baseline-cooking-state=dried --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=175043 --food-id=food_lievito_di_birra_secco \
  --name-it="Lievito di birra, secco attivo" \
  --matrix-id=lievito_di_birra --matrix-description-it="Lievito di birra, secco attivo" \
  --baseline-cooking-state=dried --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit --apply
```

### Pepe di Cayenna, macinato — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, bonus oltre la quota)

- **food_id**: `food_pepe_di_cayenna_raw`. FDC ID 170932 (SR Legacy, "Spices, pepper, red or cayenne").
- **Nutrienti**: **17/17** — tutti presenti. Energia 318kcal, proteine 12,0g, grassi 17,3g, carboidrati 56,6g, fibra 27,2g, ferro 7,80mg, zinco 2,48mg, calcio 148mg, rame 0,37mg, magnesio 152mg, selenio 8,80µg, vitamina C 76,4mg, vitamina K (fillochinone) 80,3µg, vitamina B12 0µg esplicito, folato totale 106µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 21.840µg, alfa-carotene 0µg e beta-criptoxantina 6.252µg (`other_provitamin_a_carotenoids_mcg`=6.252). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170932 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (escarola, già eseguita sul DB reale — stessa convenzione già usata per tutte le spezie secche di questa coda, es. cannella/origano/rosmarino/timo/salvia/pepe nero, analogia funzionale non botanica).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `pepe_di_cayenna` ("Pepe di Cayenna, macinato").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene e beta-criptoxantina presenti e non zero, spezia secca non cotta, stessa convenzione delle altre spezie secche in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae` (genere *Capsicum*, stessa famiglia di peperoni/peperoncini già in coda), `baseline_cooking_state=raw` (secco/macinato, stessa convenzione delle altre spezie), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170932 --food-id=food_pepe_di_cayenna_raw \
  --name-it="Pepe di Cayenna, macinato" \
  --matrix-id=pepe_di_cayenna --matrix-description-it="Pepe di Cayenna, macinato" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170932 --food-id=food_pepe_di_cayenna_raw \
  --name-it="Pepe di Cayenna, macinato" \
  --matrix-id=pepe_di_cayenna --matrix-description-it="Pepe di Cayenna, macinato" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Kefir, magro (low fat), bianco — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14)

- **food_id**: `food_kefir_raw`. FDC ID 170904 (SR Legacy, "Kefir, lowfat, plain, LIFEWAY").
- **Nutrienti**: **17/17** — tutti presenti. Energia 43,0kcal, proteine 3,79g, grassi 1,02g, carboidrati 4,77g, fibra 0g esplicito, ferro 0,040mg, zinco 0,46mg, calcio 130mg, rame 0,0090mg, magnesio 12,0mg, selenio 3,60µg, vitamina C 0,20mg, vitamina K (fillochinone) 0,10µg, vitamina B12 0,29µg, folato totale 13,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170904 e dataType SR Legacy. Il nome del produttore (LIFEWAY) compare nella descrizione FDC stessa — pratica nota di SR Legacy per alcuni latticini fermentati di riferimento, non un prodotto "Branded" nel senso usato da questo progetto per scartare record con pochi nutrienti: qui tutti e 17 sono presenti. Calcio 130mg/100g coerente con un latticino magro liquido (confrontabile con lo yogurt magro già eseguito).
- **Analogia usata**: `food_yogurt_bianco_intero` (yogurt bianco, già eseguito sul DB reale — stessa categoria "latticino fermentato liquido/semiliquido").
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `kefir` ("Kefir, magro").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per gli altri latticini del Golden Set), `carotenoid_matrix_state` omesso (NULL — non applicabile, latticino, beta-carotene presente come 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170904 --food-id=food_kefir_raw \
  --name-it="Kefir, magro (low fat), bianco" \
  --matrix-id=kefir --matrix-description-it="Kefir, magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170904 --food-id=food_kefir_raw \
  --name-it="Kefir, magro (low fat), bianco" \
  --matrix-id=kefir --matrix-description-it="Kefir, magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy --apply
```

### Formaggio gruyère (groviera) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14)

- **food_id**: `food_formaggio_gruyere_raw`. FDC ID 171242 (SR Legacy, "Cheese, gruyere").
- **Nutrienti**: **17/17** — tutti presenti. Energia 413kcal, proteine 29,8g, grassi 32,3g, carboidrati 0,36g, fibra 0g esplicito, ferro 0,17mg, zinco 3,90mg, calcio 1011mg, rame 0,032mg, magnesio 36,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,70µg, vitamina B12 1,60µg, folato totale 10,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 33,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171242 e dataType SR Legacy. Calcio 1011mg/100g alto ma coerente con un formaggio a pasta dura/semidura (confrontabile con parmigiano già nel Golden Set).
- **Analogia usata**: `food_parmigiano_reggiano` (parmigiano, già eseguito sul DB reale — stessa categoria "formaggio a pasta dura/semidura da latte vaccino", calcio concentrato in modo simile, stessa convenzione già usata per il formaggio svizzero in questa coda).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `formaggio_gruyere` ("Formaggio gruyère (groviera)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per gli altri formaggi del Golden Set), `carotenoid_matrix_state` omesso (NULL — non applicabile, latticino, stessa convenzione già usata per formaggio svizzero/burro/latte/yogurt), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171242 --food-id=food_formaggio_gruyere_raw \
  --name-it="Formaggio gruyère (groviera)" \
  --matrix-id=formaggio_gruyere --matrix-description-it="Formaggio gruyère (groviera)" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171242 --food-id=food_formaggio_gruyere_raw \
  --name-it="Formaggio gruyère (groviera)" \
  --matrix-id=formaggio_gruyere --matrix-description-it="Formaggio gruyère (groviera)" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Formaggio cheddar — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, nono "pronto" del turno — quota raggiunta)

- **food_id**: `food_formaggio_cheddar_raw`. FDC ID 173414 (SR Legacy, "Cheese, cheddar (Includes foods for USDA's Food Distribution Program)").
- **Nutrienti**: **17/17** — tutti presenti. Energia 403kcal, proteine 22,9g, grassi 33,3g, carboidrati 3,37g, fibra 0g esplicito, ferro 0,14mg, zinco 3,64mg, calcio 710mg, rame 0,030mg, magnesio 27,0mg, selenio 28,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,40µg (la pagina riporta separatamente anche il menachinone-4 8,60µg, non usato: lo script mappa solo il fillochinone), vitamina B12 1,10µg, folato totale 27,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 85,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173414 e dataType SR Legacy. Calcio 710mg/100g coerente con un formaggio a pasta semidura.
- **Analogia usata**: `food_parmigiano_reggiano` (parmigiano, già eseguito sul DB reale — stessa categoria "formaggio a pasta dura/semidura da latte vaccino", stessa convenzione già usata per formaggio svizzero/gruyère in questa coda).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `formaggio_cheddar` ("Formaggio cheddar").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per gli altri formaggi del Golden Set), `carotenoid_matrix_state` omesso (NULL — non applicabile, latticino, stessa convenzione già usata per formaggio svizzero/gruyère/burro/latte/yogurt), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173414 --food-id=food_formaggio_cheddar_raw \
  --name-it="Formaggio cheddar" \
  --matrix-id=formaggio_cheddar --matrix-description-it="Formaggio cheddar" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=173414 --food-id=food_formaggio_cheddar_raw \
  --name-it="Formaggio cheddar" \
  --matrix-id=formaggio_cheddar --matrix-description-it="Formaggio cheddar" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Grano saraceno, decorticato, tostato (kasha), secco — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14)

- **food_id**: `food_grano_saraceno_tostato_raw`. FDC ID 170685 (SR Legacy, "Buckwheat groats, roasted, dry").
- **Nutrienti**: **13/17**. Energia 346kcal, proteine 11,7g, grassi 2,71g, carboidrati 75,0g, fibra 10,3g, ferro 2,47mg, zinco 2,42mg, calcio 17,0mg, rame 0,62mg, magnesio 221mg, selenio 8,40µg, vitamina C 0mg esplicito, vitamina B12 0µg esplicito, folato totale 42,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento). **Mancano** (non riportati nella pagina fra i 75 nutrienti del record, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso ordine di grandezza di gap già accettato per couscous (13/17) e farina di cocco (11/17) in questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170685 e dataType SR Legacy. Prodotto distinto dai chicchi di grano saraceno crudi non tostati (già scartati ⚠ nel quarto lotto per mancanza di un record pulito) e dalla farina di grano saraceno (già preparata nell'undicesimo lotto, FDC diverso): il kasha è il chicco decorticato e tostato, non macinato, "secco" cioè non ancora cotto in acqua.
- **Analogia usata**: `food_quinoa_dry_raw` (quinoa cruda/secca, già eseguita sul DB reale — stessa categoria "pseudocereale in chicchi crudi/secchi", stesso trattamento "nessun heme iron").
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `grano_saraceno_tostato` ("Grano saraceno tostato (kasha), secco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi non riportati nel record, non zero esplicito: nessuno stato dichiarabile), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Polygonaceae` (famiglia reale del grano saraceno, *Fagopyrum esculentum* — non è un vero cereale/Poaceae, è uno pseudocereale), `baseline_cooking_state=raw` (il kasha "secco" non è ancora cotto in acqua, coerente con la convenzione già usata per quinoa/couscous crudi), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170685 --food-id=food_grano_saraceno_tostato_raw \
  --name-it="Grano saraceno, decorticato, tostato (kasha), secco" \
  --matrix-id=grano_saraceno_tostato --matrix-description-it="Grano saraceno tostato (kasha), secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_quinoa_dry_raw \
  --diet-category=plant_non_fruit --botanical-family=Polygonaceae
```
```
npm run add-food -- --fdc-id=170685 --food-id=food_grano_saraceno_tostato_raw \
  --name-it="Grano saraceno, decorticato, tostato (kasha), secco" \
  --matrix-id=grano_saraceno_tostato --matrix-description-it="Grano saraceno tostato (kasha), secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_quinoa_dry_raw \
  --diet-category=plant_non_fruit --botanical-family=Polygonaceae --apply
```

### Succo di mela, non zuccherato (senza acido ascorbico aggiunto) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14)

- **food_id**: `food_succo_di_mela_raw`. FDC ID 173933 (SR Legacy, "Apple juice, canned or bottled, unsweetened, without added ascorbic acid").
- **Nutrienti**: **17/17** — tutti presenti. Energia 46,0kcal, proteine 0,10g, grassi 0,13g, carboidrati 11,3g, fibra 0,20g, ferro 0,12mg, zinco 0,020mg, calcio 8,00mg, rame 0,012mg, magnesio 5,00mg, selenio 0,10µg, vitamina C 0,90mg, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0µg esplicito (assunto, non misurato — dichiarato così dalla fonte), folato totale 0µg esplicito, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg esplicito (valore calcolato, non analitico, dichiarato così dalla fonte), alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (entrambi calcolati, non analitici). Fonte: fdc.nal.usda.gov/portal-data/external/173933 (JSON ufficiale, comparso in un risultato di ricerca precedente), dataType "SR Legacy" (campo `foodType`).
- **Attenzione specifica all'arricchimento USA (vedi punto 2b del COMPITO)**: esiste anche una variante dello stesso succo "with added ascorbic acid" (FDC 167771), con vitamina C 38,5mg/100g — quasi 43 volte più alta di questo record (0,90mg/100g) per aggiunta diretta di acido ascorbico, un additivo comune nei succhi USA. **Scelta deliberatamente la variante "without added ascorbic acid"**, che rappresenta meglio un succo di mela semplice (0,90mg/100g di vitamina C è coerente con il contenuto naturale basso della mela, vedi `food_apple_with_skin_raw` già eseguito).
- **Analogia usata**: `food_apple_with_skin_raw` (mela, già eseguita sul DB reale — stessa specie *Malus domestica*, forma diversa: succo spremuto/pastorizzato invece di polpa intera).
- **Categoria dieta**: `plant_non_fruit` (non `fresh_fruit`: succo è una forma trasformata del frutto, non frutta fresca intera, stessa convenzione già usata per succo d'arancia/limone/melograno in questa coda — non cambia vegetariano/vegano, solo la compatibilità fruttariana).
- **Matrice**: nuova `succo_di_mela` ("Succo di mela, non zuccherato").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene/alfa-carotene/beta-criptoxantina tutti 0 espliciti nel record — nessuno stato carotenoide da dichiarare, a differenza del succo d'arancia/limone/melograno che avevano almeno un carotenoide non-zero, coerente con la convenzione già usata per `food_trippa_di_manzo_raw`), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173933 --food-id=food_succo_di_mela_raw \
  --name-it="Succo di mela, non zuccherato (senza acido ascorbico aggiunto)" \
  --matrix-id=succo_di_mela --matrix-description-it="Succo di mela, non zuccherato" \
  --baseline-cooking-state=raw --analogy-food-id=food_apple_with_skin_raw \
  --botanical-family=Rosaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173933 --food-id=food_succo_di_mela_raw \
  --name-it="Succo di mela, non zuccherato (senza acido ascorbico aggiunto)" \
  --matrix-id=succo_di_mela --matrix-description-it="Succo di mela, non zuccherato" \
  --baseline-cooking-state=raw --analogy-food-id=food_apple_with_skin_raw \
  --botanical-family=Rosaceae --diet-category=plant_non_fruit --apply
```

### Capperi, in salamoia (sgocciolati) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14)

- **food_id**: `food_capperi_in_salamoia`. FDC ID 172238 (SR Legacy, "Capers, canned").
- **Nutrienti**: **17/17** — tutti presenti. Energia 23,0kcal (l'intestazione della pagina arrotonda a 25kcal, incongruenza minore già vista altrove in questa coda, non bloccante), proteine 2,36g, grassi 0,86g, carboidrati 4,89g, fibra 3,20g, ferro 1,67mg, zinco 0,32mg, calcio 40,0mg, rame 0,37mg, magnesio 33,0mg, selenio 1,20µg, vitamina C 4,30mg, vitamina K (fillochinone) 24,6µg, vitamina B12 0µg esplicito, folato totale 23,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 83,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg esplicito (`other_provitamin_a_carotenoids_mcg`=0). Sodio 2.348mg/100g, molto alto, coerente con la conservazione in salamoia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172238 e dataType SR Legacy.
- **Nota sulla rappresentatività (nome aggiornato rispetto alla voce di coda originale "capperi, sotto sale")**: il record FDC trovato è "canned" (inscatolati, in salamoia/liquido di governo — sodio 2.348mg/100g coerente con una salamoia liquida), NON i capperi italiani tipici conservati "sotto sale" (essiccati, sale a contatto diretto, in genere sciacquati prima dell'uso — composizione diversa, tipicamente meno acqua e un profilo minerale differente). Nessun record FDC a fonte singola trovato specificamente per capperi sotto sale secchi. Nome aggiornato di conseguenza ("in salamoia, sgocciolati") per non spacciare il record per un prodotto che non è — stessa cautela già usata in questa coda per aglio/funghi/melanzane quando il record disponibile rappresentava una forma diversa da quella richiesta.
- **Analogia usata**: `food_onion_raw` (cipolla, già eseguita sul DB reale — stessa categoria funzionale "ortaggio/condimento", nessuna pianta della famiglia reale Capparaceae ancora eseguita nel Golden Set per un'analogia botanica più precisa, famiglia reale dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (boccio di fiore conservato, prodotto vegetale/condimento, non frutta fresca).
- **Matrice**: nuova `capperi` ("Capperi, in salamoia").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 83,0µg/100g presente, ma matrice disgregata dalla conservazione in salamoia, stessa convenzione già usata per le olive in salamoia in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Capparaceae`, `baseline_cooking_state=pickled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172238 --food-id=food_capperi_in_salamoia \
  --name-it="Capperi, in salamoia (sgocciolati)" \
  --matrix-id=capperi --matrix-description-it="Capperi, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Capparaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=172238 --food-id=food_capperi_in_salamoia \
  --name-it="Capperi, in salamoia (sgocciolati)" \
  --matrix-id=capperi --matrix-description-it="Capperi, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Capparaceae \
  --diet-category=plant_non_fruit --apply
```

### Succo di melograno, crudo (spremuto) — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, terzo "pronto" del turno)

- **food_id**: `food_succo_di_melograno_raw`. FDC ID 167787 (SR Legacy, "Pomegranate juice, bottled").
- **Nutrienti**: **17/17** — tutti presenti. Energia 54,0kcal, proteine 0,15g, grassi 0,29g, carboidrati 13,1g, fibra 0,10g, ferro 0,10mg, zinco 0,090mg, calcio 11,0mg, rame 0,021mg, magnesio 7,00mg, selenio 0,30µg, vitamina C 0,10mg, vitamina K (fillochinone) 10,4µg, vitamina B12 0µg esplicito, folato totale 24,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg esplicito (atteso per un succo filtrato, senza polpa). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167787 e dataType SR Legacy.
- **Analogia usata**: `food_melograno_raw` (già eseguito sul DB reale — stessa specie, stesso frutto, forma diversa: succo spremuto/imbottigliato invece di arilli).
- **Categoria dieta**: `plant_non_fruit` (stessa convenzione già usata per succo d'arancia e succo di limone in questo stesso lotto: succo spremuto/imbottigliato è forma trasformata, non frutto intero, secondo la definizione restrittiva del PRD §4.9 — non cambia vegetariano/vegano rispetto a `fresh_fruit`, solo la compatibilità fruttariana).
- **Matrice**: nuova `succo_di_melograno` ("Succo di melograno, crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene/alfa-carotene/beta-criptoxantina tutti 0 espliciti nel record — nessuno stato carotenoide da dichiarare, a differenza del succo d'arancia/limone che li avevano non-zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lythraceae` (famiglia reale del melograno, *Punica granatum*, nella classificazione APG moderna), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167787 --food-id=food_succo_di_melograno_raw \
  --name-it="Succo di melograno, crudo (spremuto)" \
  --matrix-id=succo_di_melograno --matrix-description-it="Succo di melograno, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_melograno_raw \
  --diet-category=plant_non_fruit --botanical-family=Lythraceae
```
```
npm run add-food -- --fdc-id=167787 --food-id=food_succo_di_melograno_raw \
  --name-it="Succo di melograno, crudo (spremuto)" \
  --matrix-id=succo_di_melograno --matrix-description-it="Succo di melograno, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_melograno_raw \
  --diet-category=plant_non_fruit --botanical-family=Lythraceae --apply
```

### Quaglia, carne (senza pelle e ossa), cruda — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, secondo "pronto" del turno)

- **food_id**: `food_quaglia_carne_raw`. FDC ID 172419 (SR Legacy, "Quail, meat only, raw").
- **Nutrienti**: **14/17**. Energia 134kcal, proteine 21,8g, grassi 4,53g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 4,51mg, zinco 2,70mg, calcio 13,0mg, rame 0,59mg, magnesio 25,0mg, selenio 17,4µg, vitamina C 7,20mg, vitamina B12 0,47µg, folato totale 7,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento). **Mancano** (non riportati, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172419 e dataType SR Legacy.
- **Nota sulla rappresentatività**: la voce di coda originale chiedeva "quaglia, carne (petto), cruda". **Nessun record FDC con un FDC ID numerico verificabile è stato trovato specificamente per il solo petto** ("Quail, breast, meat only, raw" compare su recipal.com e triagemethod.com senza FDC ID citato — solo l'etichetta generica "SR (USDA Standard Reference Legacy)"). Usato quindi il record "carne, senza pelle e ossa" (intera, non solo petto), con FDC ID verificabile: rappresenta comunque bene "carne di quaglia" in generale — la quaglia è un uccello piccolo con composizione carne bianca/scura più omogenea di un pollo adulto, quindi la differenza petto/carne intera è minore che per il pollo. Nome scelto di conseguenza ("carne", non "petto"), per non spacciare il record per qualcosa che non è.
- **Analogia usata**: `food_petto_di_pollo_raw` (pollame, già eseguito sul DB reale — stessa categoria "carne di pollame magra cruda", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (carne di origine animale).
- **Matrice**: nuova `quaglia_carne` ("Quaglia, carne").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172419 --food-id=food_quaglia_carne_raw \
  --name-it="Quaglia, carne (senza pelle e ossa), cruda" \
  --matrix-id=quaglia_carne --matrix-description-it="Quaglia, carne" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172419 --food-id=food_quaglia_carne_raw \
  --name-it="Quaglia, carne (senza pelle e ossa), cruda" \
  --matrix-id=quaglia_carne --matrix-description-it="Quaglia, carne" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Lingua di manzo, cruda — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 14, primo "pronto" del turno)

- **food_id**: `food_lingua_di_manzo_raw`. FDC ID 170196 (SR Legacy, "Beef, variety meats and by-products, tongue, raw").
- **Nutrienti**: **14/17**. Energia 224kcal, proteine 14,9g, grassi 16,1g, carboidrati 3,68g, fibra 0g esplicito, ferro 2,95mg, zinco 2,87mg, calcio 6,00mg, rame 0,17mg, magnesio 16,0mg, selenio 9,40µg, vitamina C 3,10mg, vitamina B12 3,79µg, folato totale 7,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento). **Mancano** (non riportati nella pagina, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — stesso identico pattern di gap già visto per vitello/agnello/coniglio crudi in questa coda (14/17, stessi 3 nutrienti mancanti), coerente con una frattaglia/carne magra. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170196 e dataType SR Legacy. Calcio 6mg/100g basso, nessun segno di arricchimento (atteso per una frattaglia non lavorata).
- **Analogia usata**: `food_beef_liver_raw` (Golden Set originale, 30 alimenti reali nel DB — stessa specie, stessa categoria "frattaglia di manzo", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (frattaglia di origine animale).
- **Matrice**: nuova `lingua_di_manzo` ("Lingua di manzo").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene non riportato, non zero esplicito: nessuno stato dichiarabile, coerente con `food_beef_liver_raw` che ha lo stesso campo NULL), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170196 --food-id=food_lingua_di_manzo_raw \
  --name-it="Lingua di manzo, cruda" \
  --matrix-id=lingua_di_manzo --matrix-description-it="Lingua di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=170196 --food-id=food_lingua_di_manzo_raw \
  --name-it="Lingua di manzo, cruda" \
  --matrix-id=lingua_di_manzo --matrix-description-it="Lingua di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Trippa di manzo, cruda — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13, nono "pronto" del turno)

- **food_id**: `food_trippa_di_manzo_raw`. FDC ID 170599 (SR Legacy, "Beef, variety meats and by-products, tripe, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 85,0kcal, proteine 12,1g, grassi 3,69g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 0,59mg, zinco 1,42mg, calcio 69,0mg, rame 0,070mg, magnesio 13,0mg, selenio 12,5µg, vitamina C 0mg esplicito, vitamina K 0µg esplicito, vitamina B12 1,39µg, folato totale 5,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (atteso per una carne/frattaglia). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170599 e dataType SR Legacy. Calcio 69mg/100g più alto del tipico per una carne, ma plausibile per la trippa (tessuto dello stomaco, non muscolo puro); nessun segno di additivi.
- **Analogia usata**: `food_beef_liver_raw` (già nel Golden Set originale — stessa specie, categoria "frattaglia di manzo", `is_heme_iron=true` come ogni carne/frattaglia già in coda).
- **Categoria dieta**: `meat_fish` (frattaglia di origine animale).
- **Matrice**: nuova `trippa_di_manzo` ("Trippa di manzo").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170599 --food-id=food_trippa_di_manzo_raw \
  --name-it="Trippa di manzo, cruda" \
  --matrix-id=trippa_di_manzo --matrix-description-it="Trippa di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=170599 --food-id=food_trippa_di_manzo_raw \
  --name-it="Trippa di manzo, cruda" \
  --matrix-id=trippa_di_manzo --matrix-description-it="Trippa di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Uova d'anatra, crude — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_uova_danatra_raw`. FDC ID 172189 (SR Legacy, "Egg, duck, whole, fresh, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 185kcal, proteine 12,8g, grassi 13,8g, carboidrati 1,45g, fibra 0g esplicito, ferro 3,85mg, zinco 1,41mg, calcio 64,0mg, rame 0,062mg, magnesio 17,0mg, selenio 36,4µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 0,40µg, vitamina B12 5,40µg, folato totale 80,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 14,0µg, alfa-carotene 0µg e beta-criptoxantina 12,0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172189 e dataType SR Legacy. Distinto dall'uovo di gallina e da quello di quaglia appena preparato per specie, con B12 e selenio notevolmente più alti.
- **Analogia usata**: `food_egg_raw` (uovo di gallina, già nel Golden Set originale — stessa categoria "uovo crudo", `is_heme_iron=false` come l'uovo di gallina).
- **Categoria dieta**: `egg_dairy` (uovo).
- **Matrice**: nuova `uova_danatra` ("Uova d'anatra").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (coerente con `food_egg_raw`), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172189 --food-id=food_uova_danatra_raw \
  --name-it="Uova d'anatra, crude" \
  --matrix-id=uova_danatra --matrix-description-it="Uova d'anatra" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172189 --food-id=food_uova_danatra_raw \
  --name-it="Uova d'anatra, crude" \
  --matrix-id=uova_danatra --matrix-description-it="Uova d'anatra" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy --apply
```

### Uova di quaglia, crude — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_uova_di_quaglia_raw`. FDC ID 172191 (SR Legacy, "Egg, quail, whole, fresh, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 158kcal (il riepilogo della pagina arrotonda a 160kcal, incongruenza minore già vista altrove in questa coda, non bloccante), proteine 13,1g, grassi 11,1g, carboidrati 0,41g, fibra 0g esplicito, ferro 3,65mg, zinco 1,47mg, calcio 64,0mg, rame 0,062mg, magnesio 13,0mg, selenio 32,0µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 0,30µg, vitamina B12 1,58µg, folato totale 66,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 11,0µg, alfa-carotene 0µg e beta-criptoxantina 10,0µg (plausibile per il tuorlo pigmentato dell'uovo di quaglia). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172191 e dataType SR Legacy. Distinto dall'uovo di gallina già nel Golden Set per specie, con selenio, ferro e vitamina B12 per 100g notevolmente più alti.
- **Analogia usata**: `food_egg_raw` (uovo di gallina, già nel Golden Set originale — stessa categoria "uovo crudo", `is_heme_iron=false` come l'uovo di gallina).
- **Categoria dieta**: `egg_dairy` (uovo).
- **Matrice**: nuova `uova_di_quaglia` ("Uova di quaglia").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (coerente con `food_egg_raw`, che non lo imposta), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172191 --food-id=food_uova_di_quaglia_raw \
  --name-it="Uova di quaglia, crude" \
  --matrix-id=uova_di_quaglia --matrix-description-it="Uova di quaglia" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172191 --food-id=food_uova_di_quaglia_raw \
  --name-it="Uova di quaglia, crude" \
  --matrix-id=uova_di_quaglia --matrix-description-it="Uova di quaglia" \
  --baseline-cooking-state=raw --analogy-food-id=food_egg_raw \
  --diet-category=egg_dairy --apply
```

### Pomodori secchi, non in olio — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_pomodori_secchi_raw`. FDC ID 168567 (SR Legacy, "Tomatoes, sun-dried").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 258kcal, proteine 14,1g, grassi 2,97g, carboidrati 55,8g, fibra 12,3g, ferro 9,09mg, zinco 1,99mg, calcio 110mg, rame 1,42mg, magnesio 194mg, selenio 5,50µg, vitamina C 39,2mg, vitamina K (fillochinone) 43,0µg, vitamina B12 0µg esplicito, folato totale 68,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 524µg (riga unica "Carotene, beta", non divisa in cis/trans), alfa-carotene 0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168567 e dataType SR Legacy. Valori coerenti con la concentrazione per disidratazione rispetto al pomodoro fresco (ferro/calcio/magnesio circa 5-7x più alti), nessun segno di arricchimento o sale aggiunto nei dati riportati. Record "non in olio" distinto da FDC 169384 "packed in oil, drained" (prodotto diverso, non usato).
- **Analogia usata**: `food_tomato_raw` (pomodoro comune, già eseguito sul DB reale — stessa specie, stessa famiglia Solanaceae, forma disidratata).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `pomodori_secchi` ("Pomodori secchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo; nessuna cottura, solo disidratazione), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae`, `baseline_cooking_state=raw` (coerente con la convenzione già usata per altri alimenti secchi/disidratati in questa coda, es. spezie secche), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168567 --food-id=food_pomodori_secchi_raw \
  --name-it="Pomodori secchi" \
  --matrix-id=pomodori_secchi --matrix-description-it="Pomodori secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_tomato_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae
```
```
npm run add-food -- --fdc-id=168567 --food-id=food_pomodori_secchi_raw \
  --name-it="Pomodori secchi" \
  --matrix-id=pomodori_secchi --matrix-description-it="Pomodori secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_tomato_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae --apply
```

### Nasello, crudo — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_nasello_raw`. FDC ID 173713 (SR Legacy, "Fish, whiting, mixed species, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 90,0kcal, proteine 18,3g, grassi 1,3g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 0,34mg, zinco 0,88mg, calcio 48,0mg, rame 0,03mg, magnesio 21,0mg, selenio 32,1µg, vitamina C 0mg esplicito, vitamina K 0,10µg, vitamina B12 2,28µg, folato totale 13,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (atteso per un pesce). Fonte: due pagine indipendenti concordanti citano esplicitamente FDC ID 173713 (triagemethod.com, con ogni valore etichettato "SR" = SR Legacy; tools.myfooddata.com/nutrition-facts/173713/wt1, FDC ID nell'URL stesso) — stessi valori su entrambe.
- **Nota tassonomica importante (motivo per cui questo alimento è diverso dal "merlano" già scartato ⚠ nell'undicesimo lotto con lo STESSO record FDC)**: questo stesso FDC 173713 era stato valutato e scartato per rappresentare il "merlano" italiano (*Merlangius merlangus*, famiglia Gadidae) perché negli USA "whiting" indica comunemente pesci del genere *Merluccius* (famiglia Merlucciidae) — confermato di nuovo in questa sessione (Wikipedia, voce "Whiting (fish)": "in US commercial use, 'whiting' alone generally refers to various hake of the genus *Merluccius*", mentre il merlano europeo viene distinto come "English whiting"). Il nasello italiano è esattamente *Merluccius merluccius*, STESSO GENERE *Merluccius* del pesce a cui "whiting" si riferisce nel commercio USA (tipicamente *M. bilinearis*, "silver hake"/"Atlantic whiting") — non la stessa specie (*M. merluccius* vs *M. bilinearis*), ma un match di genere, molto più solido del mismatch di famiglia già scartato per il merlano. Resta un proxy dichiarato a livello di genere, non di specie — stesso tipo di cautela già usata per "sogliola" (categoria "sole species" ufficiale USDA) e diverso dal mismatch di famiglia già scartato per orata/porgy e merlano.
- **Analogia usata**: `food_merluzzo_raw` (già eseguito sul DB reale — analogia funzionale di categoria "pesce bianco magro crudo", famiglia reale diversa: Merlucciidae contro Gadidae del merluzzo, dichiarata separatamente; `is_heme_iron=true` come ogni pesce già in coda).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `nasello` ("Nasello").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173713 --food-id=food_nasello_raw \
  --name-it="Nasello, crudo" \
  --matrix-id=nasello --matrix-description-it="Nasello" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=173713 --food-id=food_nasello_raw \
  --name-it="Nasello, crudo" \
  --matrix-id=nasello --matrix-description-it="Nasello" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Pompelmo bianco, crudo — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_pompelmo_bianco_raw`. FDC ID 174676 (SR Legacy, "Grapefruit, raw, white, all areas").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 33,0kcal, proteine 0,69g, grassi 0,10g, carboidrati 8,41g, fibra 1,10g, ferro 0,060mg, zinco 0,070mg, calcio 12,0mg, rame 0,050mg, magnesio 9,00mg, selenio 1,40µg, vitamina C 33,3mg, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0µg esplicito, folato totale 10,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 14,0µg, alfa-carotene 8,00µg e beta-criptoxantina 3,00µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174676 e dataType SR Legacy. Distinto dal pompelmo rosa già eseguito: profilo carotenoidi molto più basso (14+8+3=25µg contro i valori tipicamente più alti del pompelmo rosa/rosso, coerente con l'assenza di licopene/carotenoidi rossi nella polpa bianca), record FDC separato e proprio, non un duplicato funzionale.
- **Analogia usata**: `food_pompelmo_rosa_raw` (già eseguito sul DB reale — stessa specie *Citrus × paradisi*, stessa famiglia Rutaceae, varietà a polpa diversa).
- **Categoria dieta**: `fresh_fruit` (frutto fresco, non trasformato).
- **Matrice**: nuova `pompelmo_bianco` ("Pompelmo bianco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (frutto crudo, matrice intatta, carotenoidi non nulli), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174676 --food-id=food_pompelmo_bianco_raw \
  --name-it="Pompelmo bianco, crudo" \
  --matrix-id=pompelmo_bianco --matrix-description-it="Pompelmo bianco" \
  --baseline-cooking-state=raw --analogy-food-id=food_pompelmo_rosa_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rutaceae
```
```
npm run add-food -- --fdc-id=174676 --food-id=food_pompelmo_bianco_raw \
  --name-it="Pompelmo bianco, crudo" \
  --matrix-id=pompelmo_bianco --matrix-description-it="Pompelmo bianco" \
  --baseline-cooking-state=raw --analogy-food-id=food_pompelmo_rosa_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rutaceae --apply
```

### Melone verde (honeydew), crudo — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_melone_verde_raw`. FDC ID 169911 (SR Legacy, "Melons, honeydew, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 36,0kcal, proteine 0,54g, grassi 0,14g, carboidrati 9,09g, fibra 0,80g, ferro 0,17mg, zinco 0,090mg, calcio 6,00mg, rame 0,024mg, magnesio 10,0mg, selenio 0,70µg, vitamina C 18,0mg, vitamina K (fillochinone) 2,90µg, vitamina B12 0µg esplicito, folato totale 19,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 30,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169911 e dataType SR Legacy. Alimento distinto dal melone cantalupo già eseguito: polpa verde, profilo vitamina A/beta-carotene più basso (30µg contro valori tipicamente più alti del cantalupo), stessa specie botanica ma varietà diversa (*Cucumis melo* var. *inodorus* vs var. *cantalupensis*).
- **Analogia usata**: `food_melone_cantalupo_raw` (già eseguito sul DB reale — stessa specie *Cucumis melo*, stessa famiglia Cucurbitaceae, varietà diversa).
- **Categoria dieta**: `fresh_fruit` (frutto fresco, non trasformato).
- **Matrice**: nuova `melone_verde` ("Melone verde (honeydew)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (frutto crudo, matrice intatta, beta-carotene non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169911 --food-id=food_melone_verde_raw \
  --name-it="Melone verde (honeydew), crudo" \
  --matrix-id=melone_verde --matrix-description-it="Melone verde (honeydew)" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Cucurbitaceae
```
```
npm run add-food -- --fdc-id=169911 --food-id=food_melone_verde_raw \
  --name-it="Melone verde (honeydew), crudo" \
  --matrix-id=melone_verde --matrix-description-it="Melone verde (honeydew)" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Cucurbitaceae --apply
```

### Lamponi, crudi — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_lamponi_raw`. FDC ID 167755 (SR Legacy, "Raspberries, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 52,0kcal, proteine 1,20g, grassi 0,65g, carboidrati 11,9g, fibra 6,50g, ferro 0,69mg, zinco 0,42mg, calcio 25,0mg, rame 0,090mg, magnesio 22,0mg, selenio 0,20µg, vitamina C 26,2mg, vitamina K (fillochinone) 7,80µg, vitamina B12 0µg esplicito, folato totale 21,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 12,0µg, alfa-carotene 16,0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167755 e dataType SR Legacy.
- **Analogia usata**: `food_mirtilli_raw` (già eseguito sul DB reale — analogia funzionale di categoria "piccolo frutto di bosco crudo", famiglia botanica reale diversa: Rosaceae/*Rubus idaeus* — dichiarata separatamente; stesso genere *Rubus* delle more appena preparate sopra, ma specie distinta).
- **Categoria dieta**: `fresh_fruit` (frutto fresco, non trasformato).
- **Matrice**: nuova `lamponi` ("Lamponi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (frutto crudo, matrice intatta, beta-carotene e alfa-carotene non nulli), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167755 --food-id=food_lamponi_raw \
  --name-it="Lamponi, crudi" \
  --matrix-id=lamponi --matrix-description-it="Lamponi" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=167755 --food-id=food_lamponi_raw \
  --name-it="Lamponi, crudi" \
  --matrix-id=lamponi --matrix-description-it="Lamponi" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### More, crude — preparato 2026-10-19 dal task orario (dodicesimo lotto, turno ore 13)

- **food_id**: `food_more_raw`. FDC ID 173946 (SR Legacy, "Blackberries, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 43,0kcal, proteine 1,39g, grassi 0,49g, carboidrati 9,61g, fibra 5,30g, ferro 0,62mg, zinco 0,53mg, calcio 29,0mg, rame 0,17mg, magnesio 20,0mg, selenio 0,40µg, vitamina C 21,0mg, vitamina K (fillochinone) 19,8µg, vitamina B12 0µg esplicito, folato totale 25,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 128µg, alfa-carotene 0µg e beta-criptoxantina 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173946 e dataType SR Legacy. Alimento non ancora coperto nonostante mirtilli/ribes/uva spina già presenti: buco reale, non di nicchia.
- **Analogia usata**: `food_mirtilli_raw` (già eseguito sul DB reale — analogia funzionale di categoria "piccolo frutto di bosco crudo", famiglia botanica reale diversa: Rosaceae/*Rubus fruticosus*, non Ericaceae come il mirtillo — dichiarata separatamente).
- **Categoria dieta**: `fresh_fruit` (frutto fresco, non trasformato).
- **Matrice**: nuova `more` ("More (frutti di rovo)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (frutto crudo, matrice intatta, beta-carotene 128µg non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173946 --food-id=food_more_raw \
  --name-it="More, crude" \
  --matrix-id=more --matrix-description-it="More (frutti di rovo)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=173946 --food-id=food_more_raw \
  --name-it="More, crude" \
  --matrix-id=more --matrix-description-it="More (frutti di rovo)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### Cuore di manzo, crudo — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12, nono alimento "pronto" del turno)

- **food_id**: `food_cuore_di_manzo_raw`. FDC ID 168625 (SR Legacy, "Beef, variety meats and by-products, heart, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 112kcal, proteine 17,7g, grassi 3,94g, carboidrati 0,14g, fibra 0g esplicito, ferro 4,31mg, zinco 1,70mg, calcio 7,00mg, rame 0,40mg, magnesio 21,0mg, selenio 21,8µg, vitamina C 2,00mg, vitamina K 0µg esplicito, vitamina B12 8,55µg, folato totale 3,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (`other_provitamin_a_carotenoids_mcg`=0, atteso per una carne, non un fegato). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168625 e dataType SR Legacy — release FoodData Central 2026-04-30. Distinto dal cuore di pollo (già in coda, non ancora eseguito) per specie.
- **Analogia usata**: `food_beef_liver_raw` (già nel Golden Set originale — stessa specie, stessa categoria "frattaglia", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (frattaglia di origine animale).
- **Matrice**: nuova `cuore_di_manzo` ("Cuore di manzo").
- **Attributi**: `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168625 --food-id=food_cuore_di_manzo_raw \
  --name-it="Cuore di manzo, crudo" \
  --matrix-id=cuore_di_manzo --matrix-description-it="Cuore di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168625 --food-id=food_cuore_di_manzo_raw \
  --name-it="Cuore di manzo, crudo" \
  --matrix-id=cuore_di_manzo --matrix-description-it="Cuore di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Uva spina, cruda — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_uva_spina_raw`. FDC ID 173030 (SR Legacy, "Gooseberries, raw").
- **Nutrienti**: **14/17** — mancano vitamina K, beta-carotene e l'altro carotenoide provitaminico A, non riportati nel record (non assunti zero). Energia 44,0kcal (la pagina mostra anche "70 calorie" nel riepilogo, incongruenza minore di arrotondamento già vista altrove in questa coda, non bloccante — la tabella dettagliata resta la fonte usata), proteine 0,88g, grassi 0,58g, carboidrati 10,2g, fibra 4,30g, ferro 0,31mg, zinco 0,12mg, calcio 25,0mg, rame 0,070mg, magnesio 10,0mg, selenio 0,60µg, vitamina C 27,7mg, vitamina B12 0µg esplicito, folato totale 6,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173030 e dataType SR Legacy — release FoodData Central 2026-04-30.
- **Analogia usata**: `food_mirtilli_raw` (già eseguito sul DB reale — analogia funzionale di categoria "piccolo frutto di bosco", famiglia botanica reale diversa: Grossulariaceae/*Ribes uva-crispa*, dichiarata separatamente; nessuna pianta del genere *Ribes* ancora eseguita sul DB reale).
- **Categoria dieta**: `fresh_fruit` (frutto fresco, non trasformato).
- **Matrice**: nuova `uva_spina` ("Uva spina").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (frutto crudo, matrice intatta — nessun beta-carotene riportato ma lo stato va dichiarato lo stesso per coerenza con gli altri frutti freschi crudi di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Grossulariaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173030 --food-id=food_uva_spina_raw \
  --name-it="Uva spina, cruda" \
  --matrix-id=uva_spina --matrix-description-it="Uva spina" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Grossulariaceae
```
```
npm run add-food -- --fdc-id=173030 --food-id=food_uva_spina_raw \
  --name-it="Uva spina, cruda" \
  --matrix-id=uva_spina --matrix-description-it="Uva spina" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Grossulariaceae --apply
```

### Farina di grano saraceno, cruda — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_farina_di_grano_saraceno_raw`. FDC ID 170687 (SR Legacy, "Buckwheat flour, whole-groat").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 335kcal, proteine 12,6g, grassi 3,10g, carboidrati 70,6g, fibra 10,0g, ferro 4,06mg, zinco 3,12mg, calcio 41,0mg, rame 0,52mg, magnesio 251mg (molto alto, coerente col grano saraceno), selenio 5,70µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 7,00µg, vitamina B12 0µg esplicito, folato totale 54,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (`other_provitamin_a_carotenoids_mcg`=0, atteso per una farina). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170687 e dataType SR Legacy — release FoodData Central 2026-04-30. Prodotto distinto dal grano saraceno in chicchi già scartato ⚠ nel quarto lotto (lì mancava un record pulito per i chicchi crudi non tostati; qui si tratta invece della farina, un prodotto diverso con un record proprio pulito).
- **Analogia usata**: `food_farina_di_frumento_integrale_raw` (già eseguito sul DB reale — analogia solo funzionale di categoria "farina integrale", famiglia botanica reale diversa: Polygonaceae/*Fagopyrum esculentum*, non una vera graminacea, dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `farina_di_grano_saraceno` ("Farina di grano saraceno").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Polygonaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170687 --food-id=food_farina_di_grano_saraceno_raw \
  --name-it="Farina di grano saraceno, cruda" \
  --matrix-id=farina_di_grano_saraceno --matrix-description-it="Farina di grano saraceno" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Polygonaceae
```
```
npm run add-food -- --fdc-id=170687 --food-id=food_farina_di_grano_saraceno_raw \
  --name-it="Farina di grano saraceno, cruda" \
  --matrix-id=farina_di_grano_saraceno --matrix-description-it="Farina di grano saraceno" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Polygonaceae --apply
```

### Fegato di maiale, crudo — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_fegato_di_maiale_raw`. FDC ID 167862 (SR Legacy, "Pork, fresh, variety meats and by-products, liver, raw").
- **Nutrienti**: **14/17** — mancano vitamina K, beta-carotene e l'altro carotenoide provitaminico A, non riportati nel record (non assunti zero). Gap biologicamente coerente: il fegato immagazzina vitamina A come retinolo preformato (Vitamin A, RAE = 6.502µg/100g riportato separatamente), non come carotenoidi vegetali — stesso tipo di gap atteso per qualunque fegato, coerente con `food_beef_liver_raw`/`food_fegato_di_pollo_raw`/`food_fegato_di_vitello_raw` già eseguiti. Energia 134kcal, proteine 21,4g, grassi 3,65g, carboidrati 2,47g, fibra 0g esplicito, ferro 23,3mg, zinco 5,76mg, calcio 9,00mg, rame 0,68mg, magnesio 18,0mg, selenio 52,7µg, vitamina C 25,3mg, vitamina B12 26,0µg, folato totale 212µg, acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167862 e dataType SR Legacy — release FoodData Central 2026-04-30.
- **Analogia usata**: `food_fegato_di_vitello_raw` (già eseguito sul DB reale — stessa categoria "frattaglia/fegato", stesso trattamento categorico già usato per manzo/pollo/vitello), `is_heme_iron=true` (coerente con tutti i fegati già eseguiti).
- **Categoria dieta**: `meat_fish` (frattaglia di origine animale).
- **Matrice**: nuova `fegato_di_maiale` ("Fegato di maiale").
- **Attributi**: `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (nessun carotenoide riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167862 --food-id=food_fegato_di_maiale_raw \
  --name-it="Fegato di maiale, crudo" \
  --matrix-id=fegato_di_maiale --matrix-description-it="Fegato di maiale" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_vitello_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=167862 --food-id=food_fegato_di_maiale_raw \
  --name-it="Fegato di maiale, crudo" \
  --matrix-id=fegato_di_maiale --matrix-description-it="Fegato di maiale" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_vitello_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Tonno, in scatola, sott'olio, scolato (senza sale) — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_tonno_in_scatola_olio_raw`. FDC ID 174227 (SR Legacy, "Fish, tuna, light, canned in oil, without salt, drained solids").
- **Nutrienti**: **14/17** — mancano vitamina K, beta-carotene e l'altro carotenoide provitaminico A (`other_provitamin_a_carotenoids_mcg`, componente beta-criptoxantina/alfa-carotene non riportati), non assunti zero. Gap atteso e coerente per un pesce (nessun pigmento vegetale), stesso tipo di gap già visto per seppia/branzino/agnello in questa coda. Energia 198kcal, proteine 29,1g, grassi 8,21g, carboidrati 0g esplicito, fibra 0g esplicito, ferro 1,39mg, zinco 0,90mg, calcio 13,0mg, rame 0,071mg, magnesio 31,0mg, selenio 76,0µg, vitamina C 0mg esplicito, vitamina B12 2,20µg, folato totale 5,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174227 e dataType SR Legacy — release FoodData Central 2026-04-30.
- **Limite dichiarato**: il record non specifica il tipo di olio di conservazione (non dichiarato "olio d'oliva" come il tonno italiano commerciale tipico, potrebbe essere olio vegetale generico) — nessun segnale nei 17 nutrienti tracciati che dipenda dal tipo d'olio (vengono dal pesce stesso, non dal grasso di conservazione), ma la vitamina K non riportata potrebbe in parte derivare dall'olio e non essere quindi un vero zero: gap dichiarato, non stimato. Variante "with salt" scartata a priori (sodio non tracciato tra i 17, ma preferibile la versione senza sale aggiunto per rappresentare il prodotto base).
- **Analogia usata**: `food_tonno_fresco_raw` (già eseguito sul DB reale — stessa specie concettuale, tonno pinna gialla/"light tuna", forma diversa: in scatola sott'olio invece di fresco crudo), `is_heme_iron=true` (pesce, stessa convenzione di tutti i pesci già eseguiti).
- **Categoria dieta**: `meat_fish` (pesce in conserva: carne/pesce, vegetariano no, vegano no, fruttariano no — invariata dal fatto che sia in scatola).
- **Matrice**: nuova `tonno_in_scatola_olio` ("Tonno, in scatola, sott'olio").
- **Attributi**: `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (nessun carotenoide riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — animale), `baseline_cooking_state=canned_in_oil`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174227 --food-id=food_tonno_in_scatola_olio_raw \
  --name-it="Tonno, in scatola, sott'olio, scolato (senza sale)" \
  --matrix-id=tonno_in_scatola_olio --matrix-description-it="Tonno, in scatola, sott'olio" \
  --baseline-cooking-state=canned_in_oil --analogy-food-id=food_tonno_fresco_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174227 --food-id=food_tonno_in_scatola_olio_raw \
  --name-it="Tonno, in scatola, sott'olio, scolato (senza sale)" \
  --matrix-id=tonno_in_scatola_olio --matrix-description-it="Tonno, in scatola, sott'olio" \
  --baseline-cooking-state=canned_in_oil --analogy-food-id=food_tonno_fresco_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Succo d'arancia, crudo (spremuto) — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_succo_di_arancia_raw`. FDC ID 169098 (SR Legacy, "Orange juice, raw (Includes foods for USDA's Food Distribution Program)").
- **Nutrienti**: **17/17** — tutti presenti. Energia 45,0kcal, proteine 0,70g, grassi 0,20g, carboidrati 10,4g, fibra 0,20g, ferro 0,20mg, zinco 0,050mg, calcio 11,0mg, rame 0,044mg, magnesio 11,0mg, selenio 0,10µg, vitamina C 50,0mg, vitamina K (fillochinone) 0,10µg, vitamina B12 0µg esplicito, folato totale 30,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 33,0µg, alfa-carotene 6,00µg e beta-criptoxantina 169µg (`other_provitamin_a_carotenoids_mcg`=169µg, coerente col pigmento caratteristico dell'arancia). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169098 e dataType SR Legacy — release FoodData Central 2026-04-30.
- **Analogia usata**: `food_oranges_raw` (già nel Golden Set originale — stessa specie, stessa famiglia reale Rutaceae, forma diversa: succo spremuto invece di polpa).
- **Categoria dieta**: `plant_non_fruit` (non `fresh_fruit`: stessa convenzione dichiarata per il succo di limone in questo stesso lotto — succo spremuto è forma trasformata, non frutto intero, secondo la definizione restrittiva del PRD §4.9; nota per revisione umana identica a quella del succo di limone, vale anche qui).
- **Matrice**: nuova `succo_di_arancia` ("Succo d'arancia, crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (carotenoidi presenti ma matrice completamente disgregata dalla spremitura, stessa convenzione del succo di limone/olive in salamoia), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169098 --food-id=food_succo_di_arancia_raw \
  --name-it="Succo d'arancia, crudo (spremuto)" \
  --matrix-id=succo_di_arancia --matrix-description-it="Succo d'arancia, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Rutaceae
```
```
npm run add-food -- --fdc-id=169098 --food-id=food_succo_di_arancia_raw \
  --name-it="Succo d'arancia, crudo (spremuto)" \
  --matrix-id=succo_di_arancia --matrix-description-it="Succo d'arancia, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Rutaceae --apply
```

### Succo di limone, crudo (spremuto) — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_succo_di_limone_raw`. FDC ID 167747 (SR Legacy, "Lemon juice, raw").
- **Nutrienti**: **17/17** — tutti presenti. Energia 22,0kcal, proteine 0,35g, grassi 0,24g, carboidrati 6,90g, fibra 0,30g, ferro 0,080mg, zinco 0,050mg, calcio 6,00mg, rame 0,016mg, magnesio 6,00mg, selenio 0,10µg, vitamina C 38,7mg, vitamina K 0µg esplicito, vitamina B12 0µg esplicito, folato totale 20,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 1,00µg, alfa-carotene 0µg esplicito e beta-criptoxantina 4,00µg (`other_provitamin_a_carotenoids_mcg`=4,00µg). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167747 e dataType SR Legacy — release FoodData Central 2026-04-30. Vitamina C più bassa del limone intero già eseguito (diluizione nella spremitura), coerente, non un segnale di problema.
- **Analogia usata**: `food_lemon_peeled_raw` (già eseguito sul DB reale — stessa specie *Citrus limon*, stessa famiglia reale Rutaceae, forma diversa: succo spremuto invece di polpa).
- **Categoria dieta**: `plant_non_fruit` (non `fresh_fruit`: succo spremuto è una forma trasformata del frutto — polpa e fibra rimosse dalla spremitura —, non frutta fresca intera nella definizione restrittiva del PRD §4.9; stessa convenzione già usata per frutta secca/disidratata e olive in salamoia in questa coda, qui applicata a un frutto liquido pressato. Nota per revisione umana: la scelta fra `fresh_fruit`/`plant_non_fruit` qui non cambia vegetariano/vegano — identici su entrambi gli assi — cambia solo la compatibilità fruttariana; se si preferisce includere i succhi di frutta puri non zuccherati nella dieta fruttariana, va corretto esplicitamente, non assunto qui).
- **Matrice**: nuova `succo_di_limone` ("Succo di limone, crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene/beta-criptoxantina presenti ma matrice completamente disgregata dalla spremitura, stessa convenzione già usata per le olive in salamoia), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167747 --food-id=food_succo_di_limone_raw \
  --name-it="Succo di limone, crudo (spremuto)" \
  --matrix-id=succo_di_limone --matrix-description-it="Succo di limone, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_lemon_peeled_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Rutaceae
```
```
npm run add-food -- --fdc-id=167747 --food-id=food_succo_di_limone_raw \
  --name-it="Succo di limone, crudo (spremuto)" \
  --matrix-id=succo_di_limone --matrix-description-it="Succo di limone, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_lemon_peeled_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Rutaceae --apply
```

### Fontina — preparato 2026-10-19 dal task orario (undicesimo lotto, turno ore 12)

- **food_id**: `food_fontina`. FDC ID 170843 (SR Legacy, "Cheese, fontina").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 389kcal, proteine 25,6g, grassi 31,1g, carboidrati 1,55g, fibra 0g esplicito, ferro 0,23mg, zinco 3,50mg, calcio 550mg, rame 0,025mg, magnesio 14,0mg, selenio 14,5µg, vitamina C 0mg esplicito, vitamina K (fillochinone) 2,60µg, vitamina B12 1,68µg, folato totale 6,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 32,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170843 e dataType SR Legacy — release FoodData Central 2026-04-30. Calcio 550mg/100g alto ma coerente con un formaggio a pasta semidura come la fontina (stesso ordine di grandezza di parmigiano/provolone già eseguiti), non un segnale di arricchimento.
- **Analogia usata**: `food_parmigiano_reggiano` (già eseguito sul DB reale — stessa convenzione già usata per `food_provolone`: formaggio a pasta dura/semidura).
- **Categoria dieta**: `egg_dairy` (formaggio: vegetariano sì, vegano no).
- **Matrice**: nuova `fontina` ("Fontina").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stessa convenzione dei latticini già eseguiti), `carotenoid_matrix_state` omesso (beta-carotene presente ma nessuno stato di matrice dichiarato per i formaggi già eseguiti, stessa convenzione), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto animale, nessuna famiglia botanica), `baseline_cooking_state=raw` (stessa convenzione dei latticini già eseguiti, es. `food_milk_whole`), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170843 --food-id=food_fontina \
  --name-it="Fontina" \
  --matrix-id=fontina --matrix-description-it="Fontina" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170843 --food-id=food_fontina \
  --name-it="Fontina" \
  --matrix-id=fontina --matrix-description-it="Fontina" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Aceto di mele — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 12, chiusura del lotto)

- **food_id**: `food_aceto_di_mele`. FDC ID 173469 (SR Legacy, "Vinegar, cider").
- **Nutrienti**: **17/17** — tutti presenti (quasi tutti a zero esplicito, atteso per un aceto). Energia 21,0kcal, proteine 0g, grassi 0g, carboidrati 0,93g, fibra 0g, ferro 0,20mg, zinco 0,040mg, calcio 7,00mg, rame 0,0080mg, magnesio 5,00mg, selenio 0,10µg, vitamina C 0mg, vitamina K 0µg, vitamina B12 0µg, folato totale 0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173469, dataType SR Legacy, descrizione "Vinegar, cider" — release FoodData Central 2026-04-30.
- **Analogia usata**: `food_zucchero_bianco` (già eseguito sul DB reale — analogia solo funzionale: prodotto vegetale trasformato con profilo nutrizionale quasi tutto a zero esplicito, nessun fermentato/condimento liquido ancora classificato nel Golden Set per un'analogia più precisa).
- **Categoria dieta**: `plant_non_fruit` (aceto: prodotto di fermentazione di origine vegetale, condimento — non frutta fresca nella definizione restrittiva del PRD §4.9).
- **Matrice**: nuova `aceto_di_mele` ("Aceto di mele").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (beta-carotene = 0 esplicito, nessuno stato di matrice da dichiarare), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto di fermentazione, non un alimento vegetale diretto, stessa convenzione già usata per zucchero bianco/sciroppo d'acero/melassa), `baseline_cooking_state=fermented`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173469 --food-id=food_aceto_di_mele \
  --name-it="Aceto di mele" \
  --matrix-id=aceto_di_mele --matrix-description-it="Aceto di mele" \
  --baseline-cooking-state=fermented --analogy-food-id=food_zucchero_bianco \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=173469 --food-id=food_aceto_di_mele \
  --name-it="Aceto di mele" \
  --matrix-id=aceto_di_mele --matrix-description-it="Aceto di mele" \
  --baseline-cooking-state=fermented --analogy-food-id=food_zucchero_bianco \
  --diet-category=plant_non_fruit --apply
```

### Olive nere, in salamoia (inscatolate) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11, ultimo del turno)

- **food_id**: `food_olive_nere`. FDC ID 169094 (SR Legacy, "Olives, ripe, canned (small-extra large)"). Oliva nera matura in salamoia/inscatolata semplice, non farcita né condita.
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 116kcal, proteine 0,84g, grassi 10,9g, carboidrati 6,04g, fibra 1,60g, ferro 6,28mg, zinco 0,22mg, calcio 88,0mg, rame 0,25mg, magnesio 4,00mg, selenio 0,90µg, vitamina C 0,90mg, vitamina K (fillochinone) 1,40µg, vitamina B12 0µg esplicito, folato totale 0µg esplicito, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 198µg, alfa-carotene 0µg e beta-criptoxantina 0µg (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169094 e dataType SR Legacy; stesso record identificato anche tramite NBD ID 9193 su recipal.com/bodbot.com (solo come conferma identità, non come fonte dei valori). Nota: ferro molto più alto (6,28mg/100g) che nelle olive verdi (0,49mg/100g) — plausibile per il trattamento con gluconato ferroso tipico delle olive nere "stile California", ma non verificata una nota esplicita in merito sulla fonte: riportato solo come dato, nessuna interpretazione aggiunta.
- **Analogia usata**: `food_albicocche_secche_raw` (albicocche secche, già eseguite sul DB reale — stessa analogia funzionale già usata per le olive verdi in questo stesso lotto: frutto trasformato/conservato classificato `plant_non_fruit` nonostante sia botanicamente un frutto; nessuna pianta della famiglia reale Oleaceae ancora eseguita, famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (oliva in salamoia/inscatolata: prodotto trasformato/condimento, non frutta fresca nella definizione restrittiva del PRD §4.9, stessa convenzione già usata per le olive verdi).
- **Matrice**: nuova `olive_nere` ("Olive nere, in salamoia") — distinta da `olive_verdi` (composizione diversa, in particolare il ferro).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 198µg/100g presente, ma matrice disgregata dal trattamento di conservazione/inscatolamento, stessa convenzione già usata per le olive verdi), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Oleaceae`, `baseline_cooking_state=pickled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169094 --food-id=food_olive_nere \
  --name-it="Olive nere, in salamoia (inscatolate)" \
  --matrix-id=olive_nere --matrix-description-it="Olive nere, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_albicocche_secche_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Oleaceae
```
```
npm run add-food -- --fdc-id=169094 --food-id=food_olive_nere \
  --name-it="Olive nere, in salamoia (inscatolate)" \
  --matrix-id=olive_nere --matrix-description-it="Olive nere, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_albicocche_secche_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Oleaceae --apply
```

### Olive verdi, in salamoia — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_olive_verdi`. FDC ID 169096 (SR Legacy, "Olives, pickled, canned or bottled, green"). Oliva da tavola in salamoia semplice, non farcita né condita.
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 145kcal, proteine 1,03g, grassi 15,3g, carboidrati 3,84g, fibra 3,30g, ferro 0,49mg, zinco 0,040mg, calcio 52,0mg, rame 0,12mg, magnesio 11,0mg, selenio 0,90µg, vitamina C 0µg esplicito, vitamina K (fillochinone) 1,40µg, vitamina B12 0µg esplicito, folato totale 3,00µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 231µg, alfa-carotene 0µg e beta-criptoxantina 9,00µg (`other_provitamin_a_carotenoids_mcg`=9,00µg). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169096 e dataType SR Legacy, incrociata con triagemethod.com (stessi valori su ferro/calcio/magnesio/selenio/vitamina K/folato/beta-carotene).
- **Analogia usata**: `food_albicocche_secche_raw` (albicocche secche, già eseguite sul DB reale — analogia solo funzionale: frutto trasformato/conservato classificato `plant_non_fruit` nonostante sia botanicamente un frutto, stesso ragionamento categoriale qui applicato alle olive in salamoia; nessuna pianta della famiglia reale Oleaceae ancora eseguita nel Golden Set per un'analogia più precisa, famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (oliva in salamoia: prodotto trasformato/condimento, non frutta fresca nella definizione restrittiva del PRD §4.9, stesso trattamento già usato per pomodoro/zucchina/melanzana pur essendo botanicamente un frutto).
- **Matrice**: nuova `olive_verdi` ("Olive verdi, in salamoia").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 231µg/100g e beta-criptoxantina 9,00µg/100g presenti, ma matrice disgregata dal trattamento di conservazione/inscatolamento, stessa convenzione già usata per i semi tostati di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Oleaceae`, `baseline_cooking_state=pickled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169096 --food-id=food_olive_verdi \
  --name-it="Olive verdi, in salamoia" \
  --matrix-id=olive_verdi --matrix-description-it="Olive verdi, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_albicocche_secche_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Oleaceae
```
```
npm run add-food -- --fdc-id=169096 --food-id=food_olive_verdi \
  --name-it="Olive verdi, in salamoia" \
  --matrix-id=olive_verdi --matrix-description-it="Olive verdi, in salamoia" \
  --baseline-cooking-state=pickled --analogy-food-id=food_albicocche_secche_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Oleaceae --apply
```

### Fagioli azuki, cotti (bolliti, senza sale) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_fagioli_azuki_bolliti`. FDC ID 173728 (SR Legacy, "Beans, adzuki, mature seeds, cooked, boiled, without salt"). Distinto da `food_fagioli_azuki_raw` (secchi crudi, FDC 173727, solo "pronto" non ancora eseguito) — stesso legume, forma cotta. FDC ID confermato tramite una pagina-hub getfoodfacts.com che elenca tutte le 4 preparazioni di azuki con i rispettivi ID (raw=173727, bolliti senza sale=173728, bolliti con sale=173789, in scatola zuccherati=173729) — scartato un link fdc.nal.usda.gov apparso inizialmente in ricerca che risultava invece essere fagioli neri, non azuki (verificato via WebFetch diretto sul JSON prima di scartarlo).
- **Nutrienti**: **14/17** (stimato dalla fonte secondaria consultata) — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi non mostrati dalla pagina, non assunti zero) — **stesso gap della voce cruda sorella** `food_fagioli_azuki_raw` (anch'essa 14/17 con gli stessi 3 campi mancanti). Energia 128kcal, proteine 7,52g, grassi 0,10g, carboidrati 24,8g, fibra 7,30g, ferro 2,00mg, zinco 1,77mg, calcio 28,0mg, rame 0,30mg, magnesio 52,0mg, selenio 1,20µg, vitamina C 0µg esplicito, vitamina B12 0µg esplicito, folato totale 121µg, acido folico 0µg esplicito (nessuna firma di arricchimento, coerente con un legume non trattato). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173728 e dataType SR Legacy (valori letti dal rendering della pagina, non dal JSON diretto fdc.nal.usda.gov — non raggiungibile in ricerca per questo ID specifico; il conteggio 14/17 verrà confermato dal dry-run reale, che ri-scarica il record).
- **Analogia usata**: `food_fagioli_cannellini_bolliti` (fagioli cannellini bolliti, già eseguiti sul DB reale — stessa famiglia botanica Fabaceae, stesso trattamento "legume bollito senza sale", stesso matrix_id `legumes`; preferito a `food_fagioli_azuki_raw`, che è solo "pronto" e non eseguito).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: riusa `legumes` (già esistente, nessun `--matrix-description-it` necessario).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nella fonte), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173728 --food-id=food_fagioli_azuki_bolliti \
  --name-it="Fagioli azuki, cotti (bolliti, senza sale)" \
  --matrix-id=legumes \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagioli_cannellini_bolliti \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=173728 --food-id=food_fagioli_azuki_bolliti \
  --name-it="Fagioli azuki, cotti (bolliti, senza sale)" \
  --matrix-id=legumes \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagioli_cannellini_bolliti \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Ostriche, cotte (al forno, calore secco) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_ostriche_cotte`. FDC ID 175173 (SR Legacy, "Mollusks, oyster, eastern, farmed, cooked, dry heat"). Distinto da `food_ostriche_raw` (crudo, FDC 175172 "...eastern, farmed, raw", solo "pronto" non ancora eseguito) — stessa specie "eastern" e stesso lineage "farmed" del crudo, forma cotta. Esisteva anche un candidato "wild" (FDC 171980, "cooked, moist heat") con copertura nutrienti leggermente diversa, scartato per mantenere coerenza di lineage (farmed) con la voce cruda sorella — più rilevante della copertura marginale in più.
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi non riportati dalla fonte consultata, non assunti zero) — **stesso identico gap della voce cruda sorella** `food_ostriche_raw` (anch'essa 14/17 con gli stessi 3 campi mancanti), coerenza che rafforza la scelta di questo record rispetto all'alternativa "wild". Energia 79,0kcal, proteine 7,00g, grassi 2,12g, carboidrati 7,28g, fibra 0g, ferro 7,77mg, zinco 45,1mg, calcio 56,0mg, rame 1,43mg, magnesio 33,0mg, selenio 77,5µg, vitamina C 6,00mg, vitamina B12 24,3µg, folato totale 24,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile ai molluschi). Zinco molto alto (45,1mg/100g): coerente con le ostriche, fra gli alimenti più ricchi di zinco in assoluto (stessa nota già fatta per `food_ostriche_raw`). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175173 e dataType SR Legacy.
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — nessun mollusco bivalve "ostrica" ancora eseguito nel Golden Set, `food_ostriche_raw` crudo è solo "pronto": stessa analogia funzionale già usata per la voce cruda sorella, `is_heme_iron=true` per coerenza).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: `ostriche` — **nota per chi esegue**: stesso `matrix_id` già proposto per `food_ostriche_raw` (crudo, solo "pronto"), per formare una coppia crudo/cotto quando entrambi saranno eseguiti.
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi/crostacei di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked`, `is_fortified_folate` omesso (false). Nota: questo alimento draft non va usato per calcolare l'assunzione di vitamina A/K finché il gap non è risolto (stessa nota già valida per la voce cruda sorella).

```
npm run add-food -- --fdc-id=175173 --food-id=food_ostriche_cotte \
  --name-it="Ostriche, cotte (al forno, calore secco)" \
  --matrix-id=ostriche --matrix-description-it="Ostriche" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175173 --food-id=food_ostriche_cotte \
  --name-it="Ostriche, cotte (al forno, calore secco)" \
  --matrix-id=ostriche --matrix-description-it="Ostriche" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Astice (lobster), cotto (bollito) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_astice_cotto`. FDC ID 174209 (SR Legacy, "Crustaceans, lobster, northern, cooked, moist heat"). Distinto da `food_astice_raw` (crudo, FDC 174208, solo "pronto" non ancora eseguito) — stesso crostaceo, forma cotta.
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 89,0kcal, proteine 19,0g, grassi 0,86g, carboidrati 0g, fibra 0g, ferro 0,29mg, zinco 4,05mg, calcio 96,0mg, rame 1,55mg, magnesio 43,0mg, selenio 73,1µg, vitamina C 0µg esplicito, vitamina K (fillochinone, menachinone-4, diidrofillochinone tutte) 0µg esplicito, vitamina B12 1,43µg, folato totale 11,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile ai crostacei), beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174209 e dataType SR Legacy, con FDC ID confermato anche dagli URL di myfooddata.com e logixpathchef.com (contenuto bloccato da robots.txt, solo ID confermato dall'URL). **Nota di cautela riportata per trasparenza**: una fonte terza (uhhospitals.org) riporta per lo zinco un valore ricalcolato da una porzione in once che risulterebbe più alto (~8,75mg/100g) del valore letto su getfoodfacts.com (4,05mg/100g) — discrepanza fra fonti secondarie non risolta in fase di ricerca; non è un problema per il comando qui sotto, perché lo script ri-scarica il valore reale direttamente da FDC al momento dell'esecuzione (non usa i numeri scritti in questa voce) — chi esegue può comunque controllare il valore di zinco nel riepilogo del dry-run prima di confermare l'apply.
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — nessun crostaceo ancora eseguito nel Golden Set, `food_astice_raw` crudo è solo "pronto": stessa analogia funzionale già usata per la voce cruda sorella, `is_heme_iron=true` per coerenza).
- **Categoria dieta**: `meat_fish` (crostaceo).
- **Matrice**: `astice` — **nota per chi esegue**: stesso `matrix_id` già proposto per `food_astice_raw` (crudo, solo "pronto"), per formare una coppia crudo/cotto quando entrambi saranno eseguiti.
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi/crostacei di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=moist_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174209 --food-id=food_astice_cotto \
  --name-it="Astice, cotto (bollito)" \
  --matrix-id=astice --matrix-description-it="Astice" \
  --baseline-cooking-state=moist_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174209 --food-id=food_astice_cotto \
  --name-it="Astice, cotto (bollito)" \
  --matrix-id=astice --matrix-description-it="Astice" \
  --baseline-cooking-state=moist_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Granchio, cotto (al vapore/bollito) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_granchio_cotto`. FDC ID 174205 (SR Legacy, "Crustaceans, crab, blue, cooked, moist heat"). Distinto da `food_granchio_raw` (crudo, FDC 174204, solo "pronto" non ancora eseguito) — stesso crostaceo, forma cotta.
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 83,0kcal, proteine 17,9g, grassi 0,74g, carboidrati 0g, fibra 0g, ferro 0,50mg, zinco 3,81mg, calcio 91,0mg, rame 0,81mg, magnesio 36,0mg, selenio 42,9µg, vitamina C 3,30mg, vitamina K (fillochinone) 0,30µg, vitamina B12 3,33µg, folato totale 51,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, non applicabile ai crostacei), beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174205 e dataType SR Legacy, incrociata con triagemethod.com (stessi valori).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — nessun crostaceo ancora eseguito nel Golden Set, `food_granchio_raw` crudo è solo "pronto": stessa analogia funzionale "frutti di mare non pesce" già usata per la voce cruda sorella, `is_heme_iron=true` per coerenza).
- **Categoria dieta**: `meat_fish` (crostaceo).
- **Matrice**: `granchio` — **nota per chi esegue**: stesso `matrix_id` già proposto per `food_granchio_raw` (crudo, solo "pronto"), per formare una coppia crudo/cotto quando entrambi saranno eseguiti; se il crudo viene eseguito per primo la matrice esiste già e questo comando la riusa automaticamente (nessun `--matrix-description-it` necessario in quel caso — qui incluso comunque per il caso in cui questo venga eseguito per primo).
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi/crostacei di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=moist_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174205 --food-id=food_granchio_cotto \
  --name-it="Granchio, cotto (al vapore/bollito)" \
  --matrix-id=granchio --matrix-description-it="Granchio" \
  --baseline-cooking-state=moist_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174205 --food-id=food_granchio_cotto \
  --name-it="Granchio, cotto (al vapore/bollito)" \
  --matrix-id=granchio --matrix-description-it="Granchio" \
  --baseline-cooking-state=moist_heat_cooked --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Capesante, cotte (al vapore) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_capesante_cotte`. FDC ID 167742 (SR Legacy, "Mollusks, scallop, (bay and sea), cooked, steamed").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 111kcal, proteine 20,5g, grassi 0,84g, carboidrati 5,41g (per differenza), fibra 0g, ferro 0,58mg, zinco 1,55mg, calcio 10,0mg, rame 0,033mg, magnesio 37,0mg, selenio 21,7µg, vitamina C 0µg esplicito, vitamina K (fillochinone) 0µg esplicito (la pagina mostra anche menachinone-4 e diidrofillochinone, entrambi 0µg — nessuna forma di vitamina K presente), vitamina B12 2,15µg, folato totale 20,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, comunque non applicabile al pesce), beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (`other_provitamin_a_carotenoids_mcg`=0). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 167742 e dataType SR Legacy. Distinto dal record impanato/fritto "Mollusks, scallop, mixed species, cooked, breaded and fried" FDC 174221, non usato qui (prodotto composito diverso).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — stessa classe reale Bivalvia (mollusco bivalve), stessa convenzione `is_heme_iron=true` già usata per i molluschi/crostacei di questa coda; nessuna specie Pectinidae ancora eseguita per un'analogia più precisa).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `capesante` ("Capesante").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi/crostacei di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=steamed`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=167742 --food-id=food_capesante_cotte \
  --name-it="Capesante, cotte (al vapore)" \
  --matrix-id=capesante --matrix-description-it="Capesante" \
  --baseline-cooking-state=steamed --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=167742 --food-id=food_capesante_cotte \
  --name-it="Capesante, cotte (al vapore)" \
  --matrix-id=capesante --matrix-description-it="Capesante" \
  --baseline-cooking-state=steamed --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Kumquat, crudo — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 11)

- **food_id**: `food_kumquat_raw`. FDC ID 168154 (SR Legacy, "Kumquats, raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 71,0kcal, proteine 1,88g, grassi 0,86g, carboidrati 15,9g, fibra 6,50g, ferro 0,86mg, zinco 0,17mg, calcio 62,0mg, rame 0,095mg, magnesio 20,0mg, selenio 0µg esplicito, vitamina C 43,9mg, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0µg esplicito, folato totale 17,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, comunque non applicabile a un frutto fresco), beta-carotene 0µg esplicito, alfa-carotene 155µg e beta-criptoxantina 193µg (quindi `other_provitamin_a_carotenoids_mcg`=348µg dalla somma dei componenti mappati). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168154 e dataType SR Legacy.
- **Analogia usata**: `food_mandarini_raw` (mandarini, già eseguiti sul DB reale — stessa famiglia botanica reale Rutaceae, stesso genere *Citrus*/affine *Fortunella*: analogia più precisa di quella usata per la carambola in questo stesso lotto, che era solo funzionale).
- **Categoria dieta**: `fresh_fruit` (frutta fresca nella definizione restrittiva del PRD §4.9).
- **Matrice**: nuova `kumquat` ("Kumquat").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (alfa-carotene 155µg/100g e beta-criptoxantina 193µg/100g presenti, frutto crudo non disgregato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168154 --food-id=food_kumquat_raw \
  --name-it="Kumquat, crudo" \
  --matrix-id=kumquat --matrix-description-it="Kumquat" \
  --baseline-cooking-state=raw --analogy-food-id=food_mandarini_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rutaceae
```
```
npm run add-food -- --fdc-id=168154 --food-id=food_kumquat_raw \
  --name-it="Kumquat, crudo" \
  --matrix-id=kumquat --matrix-description-it="Kumquat" \
  --baseline-cooking-state=raw --analogy-food-id=food_mandarini_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Rutaceae --apply
```

### Carambola (starfruit), cruda — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10, ultimo del turno)

- **food_id**: `food_carambola_raw`. FDC ID 171715 (SR Legacy, "Carambola, (starfruit), raw").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 31,0kcal, proteine 1,04g, grassi 0,33g, carboidrati 6,73g, fibra 2,80g, ferro 0,080mg, zinco 0,12mg, calcio 3,00mg, rame 0,14mg, magnesio 10,0mg, selenio 0,60µg, vitamina C 34,4mg, vitamina K (fillochinone) 0µg esplicito, vitamina B12 0µg esplicito, folato totale 12,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento, comunque non applicabile a un frutto fresco), beta-carotene 25,0µg, alfa-carotene 24,0µg e beta-criptoxantina 0µg (quindi `other_provitamin_a_carotenoids_mcg`=24,0µg dalla somma dei componenti mappati). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171715 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_kiwi_green_raw` (kiwi, già eseguito sul DB reale — analogia solo funzionale: frutto fresco di piccola/media taglia, buona vitamina C, carotenoidi presenti ma non dominanti; nessuna pianta della famiglia reale Oxalidaceae, *Averrhoa carambola*, ancora eseguita nel Golden Set per un'analogia più precisa, famiglia dichiarata separatamente).
- **Categoria dieta**: `fresh_fruit` (frutta fresca nella definizione restrittiva del PRD §4.9 — non frutta secca, non ortaggio botanicamente "frutto").
- **Matrice**: nuova `carambola` ("Carambola (starfruit)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 25,0µg/100g e alfa-carotene 24,0µg/100g presenti, frutto crudo non disgregato, stessa convenzione delle altre forme crude di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Oxalidaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171715 --food-id=food_carambola_raw \
  --name-it="Carambola (starfruit), cruda" \
  --matrix-id=carambola --matrix-description-it="Carambola (starfruit)" \
  --baseline-cooking-state=raw --analogy-food-id=food_kiwi_green_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Oxalidaceae
```
```
npm run add-food -- --fdc-id=171715 --food-id=food_carambola_raw \
  --name-it="Carambola (starfruit), cruda" \
  --matrix-id=carambola --matrix-description-it="Carambola (starfruit)" \
  --baseline-cooking-state=raw --analogy-food-id=food_kiwi_green_raw \
  --carotenoid-matrix-state=raw_intact \
  --diet-category=fresh_fruit --botanical-family=Oxalidaceae --apply
```

### Cardi, cotti (bolliti) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_cardi_cotti`. FDC ID 169982 (SR Legacy, "Cardoon, cooked, boiled, drained, without salt"). Distinto da `food_cardi_raw` (crudo, FDC 169981, già eseguito sul DB reale) — stesso alimento, forma cotta.
- **Nutrienti**: **13/17** — mancano `copper_mg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — un gap più ampio del crudo, che era già 14/17 con lo stesso tipo di mancanza su vitamina K/carotenoidi, qui si aggiunge anche il rame assente). Energia 22,0kcal, proteine 0,76g, grassi 0,11g, carboidrati 5,33g, fibra 1,70g, ferro 0,73mg, zinco 0,18mg, calcio 72,0mg, magnesio 43,0mg, selenio 1,00µg, vitamina C 1,70mg, vitamina B12 0µg esplicito, folato totale 22,0µg, acido folico 0µg esplicito — nessuna firma di arricchimento. Sodio 176mg/100g: non nullo nonostante "without salt" nella descrizione — indica solo "nessun sale aggiunto in cottura", non assenza di sodio nell'alimento, nota già incontrata per altre verdure bollite "without salt" di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169982 e dataType SR Legacy.
- **Analogia usata**: `food_cardi_raw` (cardi crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura: l'analogia più precisa possibile).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cardi_cotti` ("Cardi, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stesso trattamento della riga crudo sorella), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di altre verdure cotte di questa coda dove il dato era presente anche se basso), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae` (*Cynara cardunculus*, stessa famiglia del crudo e del carciofo già nel Golden Set), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false). Nota: questo alimento draft non va usato per calcolare l'assunzione di vitamina A/K/rame finché il gap non è risolto.

```
npm run add-food -- --fdc-id=169982 --food-id=food_cardi_cotti \
  --name-it="Cardi, cotti (bolliti)" \
  --matrix-id=cardi_cotti --matrix-description-it="Cardi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cardi_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=169982 --food-id=food_cardi_cotti \
  --name-it="Cardi, cotti (bolliti)" \
  --matrix-id=cardi_cotti --matrix-description-it="Cardi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cardi_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Semi di girasole, tostati (senza sale) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_semi_di_girasole_tostati`. FDC ID 170563 (SR Legacy, "Seeds, sunflower seed kernels, dry roasted, without salt"). Distinto dalla variante cruda/secca (già ⚠ in coda precedente per mancanza di un FDC ID verificabile) e dalla variante "with salt added" (FDC 169418/325524, scartata perché non "senza sale" come richiesto dalla voce di coda).
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 582kcal, proteine 19,3g, grassi 49,8g, carboidrati 24,1g, fibra 11,1g, ferro 3,80mg, zinco 5,29mg, calcio 70,0mg, rame 1,83mg, magnesio 129mg, selenio 79,3µg, vitamina C 1,40mg, vitamina K (fillochinone) 2,70µg, vitamina B12 0µg esplicito, folato totale 237µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 5,00µg, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg`=0 dichiarato, non assente). Sodio 3,00mg/100g, coerente con "without salt" (l'etichetta arrotonda a 0mg per porzione, ma il valore reale per 100g non è nullo). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170563 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa famiglia botanica reale Asteraceae del girasole, *Helianthus annuus*: nessun'altra pianta Asteraceae con un'analogia più precisa ancora eseguita, stessa convenzione di dragoncello/cardi in questa coda).
- **Categoria dieta**: `plant_non_fruit` (frutta secca/semi).
- **Matrice**: nuova `semi_di_girasole_tostati` ("Semi di girasole, tostati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=cooked_or_disrupted` (beta-carotene 5,00µg/100g presente, seme tostato quindi matrice disgregata dal calore, stessa convenzione delle altre forme tostate/cotte di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170563 --food-id=food_semi_di_girasole_tostati \
  --name-it="Semi di girasole, tostati (senza sale)" \
  --matrix-id=semi_di_girasole_tostati --matrix-description-it="Semi di girasole, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=170563 --food-id=food_semi_di_girasole_tostati \
  --name-it="Semi di girasole, tostati (senza sale)" \
  --matrix-id=semi_di_girasole_tostati --matrix-description-it="Semi di girasole, tostati" \
  --baseline-cooking-state=roasted --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=cooked_or_disrupted \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Pepe bianco, macinato — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_pepe_bianco_raw`. FDC ID 170933 (SR Legacy, "Spices, pepper, white").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — stesso tipo di gap già visto per alloro/dragoncello/coriandolo in questa coda). Energia 296kcal, proteine 10,4g, grassi 2,12g, carboidrati 68,6g, fibra 26,2g, ferro 14,3mg, zinco 1,13mg, calcio 265mg, rame 0,91mg, magnesio 90,0mg, selenio 3,10µg, vitamina C 21,0mg, vitamina B12 0µg esplicito, folato totale 10,0µg, acido folico 0µg esplicito — nessuna firma di arricchimento. Nota minore: il riepilogo della pagina arrotonda l'energia a 300kcal invece di 296kcal della tabella dettagliata — usati questi ultimi, stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170933 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione generica delle altre spezie/erbe secche di questa coda; nessuna pianta della famiglia Piperaceae ancora eseguita sul DB reale — il pepe nero (`food_pepe_nero_raw`) resta solo "pronto", non eseguito, quindi non utilizzabile come analogia per le regole di questo task).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `pepe_bianco` ("Pepe bianco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Piperaceae` (*Piper nigrum* — il pepe bianco è lo stesso frutto del pepe nero, privato della buccia esterna per macerazione), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi; questo alimento draft non va usato per calcolare l'assunzione di vitamina A/K finché il gap non è risolto.

```
npm run add-food -- --fdc-id=170933 --food-id=food_pepe_bianco_raw \
  --name-it="Pepe bianco, macinato" \
  --matrix-id=pepe_bianco --matrix-description-it="Pepe bianco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Piperaceae
```
```
npm run add-food -- --fdc-id=170933 --food-id=food_pepe_bianco_raw \
  --name-it="Pepe bianco, macinato" \
  --matrix-id=pepe_bianco --matrix-description-it="Pepe bianco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Piperaceae --apply
```

### Zenzero, in polvere (secco) — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_zenzero_polvere_raw`. FDC ID 170926 (SR Legacy, "Spices, ginger, ground").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 335kcal, proteine 8,98g, grassi 4,24g, carboidrati 71,6g, fibra 14,1g, ferro 19,8mg, zinco 3,64mg, calcio 114mg, rame 0,48mg, magnesio 214mg, selenio 55,8µg, vitamina C 0,70mg, vitamina K (fillochinone) 0,80µg, vitamina B12 0µg esplicito, folato totale 13,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 18,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg`=0 dichiarato, non assente). Nota minore: etichetta/descrizione riportano 340kcal invece di 335kcal della tabella dettagliata — usati questi ultimi, stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170926 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione generica delle altre spezie/erbe secche di questa coda; nessuna pianta della famiglia Zingiberaceae ancora eseguita sul DB reale — curcuma e zenzero fresco restano solo "pronti", famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `zenzero_polvere` ("Zenzero, in polvere") — distinta dalla matrice `zenzero` già usata per lo zenzero fresco (solo "pronto", non eseguito): composizione molto diversa fra fresco e disidratato/macinato, non riusabile.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — stessa convenzione delle altre spezie di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Zingiberaceae` (*Zingiber officinale*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170926 --food-id=food_zenzero_polvere_raw \
  --name-it="Zenzero, in polvere (secco)" \
  --matrix-id=zenzero_polvere --matrix-description-it="Zenzero, in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae
```
```
npm run add-food -- --fdc-id=170926 --food-id=food_zenzero_polvere_raw \
  --name-it="Zenzero, in polvere (secco)" \
  --matrix-id=zenzero_polvere --matrix-description-it="Zenzero, in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae --apply
```

### Aglio, in polvere — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_aglio_polvere_raw`. FDC ID 171325 (SR Legacy, "Spices, garlic powder").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 331kcal, proteine 16,6g, grassi 0,73g, carboidrati 72,7g, fibra 9,00g, ferro 5,65mg, zinco 2,99mg, calcio 79,0mg, rame 0,53mg, magnesio 77,0mg, selenio 23,9µg, vitamina C 1,20mg, vitamina K (fillochinone) 0,40µg, vitamina B12 0µg esplicito, folato totale 47,0µg, acido folico 0µg esplicito (nessuna firma di arricchimento), beta-carotene 0µg esplicito, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg`=0 dichiarato, non assente). Nota minore: l'etichetta riassuntiva riporta 330kcal/0,5g grassi invece di 331kcal/0,73g della tabella dettagliata — usati questi ultimi, stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171325 e dataType SR Legacy.
- **Analogia usata**: `food_garlic_fresh_raw` (aglio fresco, già eseguito sul DB reale — stessa specie reale *Allium sativum*, non solo stessa famiglia: l'analogia più precisa di questa coda insieme a paprika/finocchio).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `aglio_polvere` ("Aglio, in polvere").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0 esplicito, nessun carotenoide significativo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaryllidaceae` (stessa famiglia dell'aglio fresco/cipolla/scalogno già nel DB), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=171325 --food-id=food_aglio_polvere_raw \
  --name-it="Aglio, in polvere" \
  --matrix-id=aglio_polvere --matrix-description-it="Aglio, in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_garlic_fresh_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae
```
```
npm run add-food -- --fdc-id=171325 --food-id=food_aglio_polvere_raw \
  --name-it="Aglio, in polvere" \
  --matrix-id=aglio_polvere --matrix-description-it="Aglio, in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_garlic_fresh_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae --apply
```

### Senape, semi secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 10)

- **food_id**: `food_senape_raw`. FDC ID 170929 (SR Legacy, "Spices, mustard seed, ground").
- **Nutrienti**: **17/17** — tutti presenti, nessun gap. Energia 508kcal, proteine 26,1g, grassi 36,2g, carboidrati 28,1g, fibra 12,2g, ferro 9,21mg, zinco 6,08mg, calcio 266mg, rame 0,65mg, magnesio 370mg, selenio 208µg, vitamina C 7,10mg, vitamina K (fillochinone) 5,40µg, vitamina B12 0µg esplicito, folato totale 162µg, acido folico 0µg esplicito (nessuna firma di arricchimento), alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg`=0 dichiarato, non assente), beta-carotene 18,0µg. Nota minore: il riepilogo della pagina indica 510kcal invece di 508kcal della tabella dettagliata — usati questi ultimi, stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170929 e dataType SR Legacy. Nota sulla forma: il record trovato è esplicitamente "ground" (macinato/in polvere), non "semi interi" come la voce di coda suggerirebbe letteralmente — nessun record SR Legacy/Foundation distinto per semi di senape interi è stato trovato in questa ricerca; la composizione nutrizionale di un seme intero e della sua forma macinata è la stessa materia prima, quindi non è un caso di prodotto diverso (a differenza delle fortificazioni USA già scartate altrove in questa coda) — trattato come match valido per "semi di senape" in generale.
- **Analogia usata**: `food_brussels_sprouts_raw` (cavoletti di Bruxelles, già nel Golden Set originale — stessa famiglia botanica reale Brassicaceae della senape, *Brassica nigra*/*Sinapis alba*: un'analogia più precisa della convenzione generica `food_scarola_raw` usata per le altre spezie di questa coda senza famiglia già eseguita).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `senape` ("Senape").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — stessa convenzione delle altre spezie di questa coda, uso reale in grammi/pizzichi), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170929 --food-id=food_senape_raw \
  --name-it="Senape, semi secchi" \
  --matrix-id=senape --matrix-description-it="Senape" \
  --baseline-cooking-state=raw --analogy-food-id=food_brussels_sprouts_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae
```
```
npm run add-food -- --fdc-id=170929 --food-id=food_senape_raw \
  --name-it="Senape, semi secchi" \
  --matrix-id=senape --matrix-description-it="Senape" \
  --baseline-cooking-state=raw --analogy-food-id=food_brussels_sprouts_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae --apply
```

### Coriandolo, semi secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09, oltre la quota, ultimo del turno)

- **food_id**: `food_coriandolo_raw`. FDC ID 170922 (SR Legacy, "Spices, coriander seed").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — stesso tipo di gap già visto per alloro/dragoncello in questa coda). Energia 298kcal, proteine 12,4g, grassi 17,8g, carboidrati 55,0g, fibra 41,9g, ferro 16,3mg, zinco 4,70mg, calcio 709mg, rame 0,97mg, magnesio 330mg, selenio 26,2µg, vitamina C 21,0mg, vitamina B12 0µg, folato totale 0µg esplicito (riportato, non assente — a differenza di aneto/cardamomo in questa coda, dove il folato manca del tutto), acido folico 0µg esplicito — nessuna firma di arricchimento. Nota minore: il riepilogo della pagina indica 300kcal/710mg calcio invece di 298kcal/709mg della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170922 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_sedano_raw` (sedano, già eseguito sul DB reale — stessa famiglia botanica reale Apiaceae del coriandolo, come già fatto per cumino/aneto/semi di finocchio in questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `coriandolo` ("Coriandolo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (*Coriandrum sativum*, stessa famiglia di cumino/aneto/semi di finocchio/sedano/carote già nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170922 --food-id=food_coriandolo_raw \
  --name-it="Coriandolo, semi secchi" \
  --matrix-id=coriandolo --matrix-description-it="Coriandolo" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=170922 --food-id=food_coriandolo_raw \
  --name-it="Coriandolo, semi secchi" \
  --matrix-id=coriandolo --matrix-description-it="Coriandolo" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae --apply
```

### Cardamomo, semi secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09, oltre la quota)

- **food_id**: `food_cardamomo_raw`. FDC ID 170919 (SR Legacy, "Spices, cardamom").
- **Nutrienti**: **12/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `folate_mcg` (quindi l'acido folico non è dichiarabile separatamente), `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — stesso tipo e stessa ampiezza di gap già visti per l'aneto in questa coda, manca anche il folato). Energia 311kcal, proteine 10,8g, grassi 6,70g, carboidrati 68,5g, fibra 28,0g, ferro 14,0mg, zinco 7,47mg (il più alto fra le spezie di questa coda), calcio 383mg, rame 0,38mg, magnesio 229mg, vitamina C 21,0mg, vitamina B12 0µg. Nota minore: il riepilogo della pagina riporta 310kcal invece di 311kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170919 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione delle altre spezie/erbe secche di questa coda; nessuna pianta della famiglia Zingiberaceae ancora eseguita — curcuma e zenzero fresco restano solo "pronti" — famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `cardamomo` ("Cardamomo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Zingiberaceae` (*Elettaria cardamomum*, stessa famiglia di curcuma/zenzero, nessuno ancora eseguito), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi; questo alimento draft non va usato per calcolare l'assunzione di folato finché il gap non è risolto.

```
npm run add-food -- --fdc-id=170919 --food-id=food_cardamomo_raw \
  --name-it="Cardamomo, semi secchi" \
  --matrix-id=cardamomo --matrix-description-it="Cardamomo" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae
```
```
npm run add-food -- --fdc-id=170919 --food-id=food_cardamomo_raw \
  --name-it="Cardamomo, semi secchi" \
  --matrix-id=cardamomo --matrix-description-it="Cardamomo" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae --apply
```

### Aneto, secco — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_aneto_raw`. FDC ID 171322 (SR Legacy, "Spices, dill weed, dried").
- **Nutrienti**: **12/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `folate_mcg` (quindi l'acido folico non è dichiarabile separatamente), `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — gap dichiarato, il più ampio di questa coda insieme ai semi di finocchio: manca anche il folato, uno dei micronutrienti seguiti dall'app, non solo vitamina K/carotenoidi come per alloro/dragoncello). Energia 253kcal, proteine 20,0g, grassi 4,36g, carboidrati 55,8g, fibra 13,6g, ferro 48,8mg, zinco 3,30mg, calcio 1784mg (altissimo ma coerente con la concentrazione da disidratazione già vista per le altre erbe secche di questa coda), rame 0,49mg, magnesio 451mg, vitamina C 50,0mg, vitamina B12 0µg. Nota minore: l'etichetta riporta 250kcal invece di 253kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171322 e dataType SR Legacy.
- **Analogia usata**: `food_sedano_raw` (sedano, già eseguito sul DB reale — stessa famiglia botanica reale Apiaceae dell'aneto, come già fatto per cumino/semi di finocchio in questa coda).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica vegetale).
- **Matrice**: nuova `aneto` ("Aneto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (*Anethum graveolens*, stessa famiglia di cumino/semi di finocchio/sedano/carote già nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi; questo alimento draft non va usato per calcolare l'assunzione di folato finché il gap non è risolto.

```
npm run add-food -- --fdc-id=171322 --food-id=food_aneto_raw \
  --name-it="Aneto, secco" \
  --matrix-id=aneto --matrix-description-it="Aneto" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=171322 --food-id=food_aneto_raw \
  --name-it="Aneto, secco" \
  --matrix-id=aneto --matrix-description-it="Aneto" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae --apply
```

### Dragoncello, secco — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_dragoncello_raw`. FDC ID 170937 (SR Legacy, "Spices, tarragon, dried").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — gap dichiarato, stesso tipo di gap già visto per alloro/zafferano/rosmarino/menta in questa coda). Energia 295kcal, proteine 22,8g, grassi 7,24g, carboidrati 50,2g, fibra 7,40g, ferro 32,3mg, zinco 3,90mg, calcio 1139mg, rame 0,68mg, magnesio 347mg, selenio 4,40µg, vitamina C 50,0mg, vitamina B12 0µg, folato totale 274µg, acido folico 0µg esplicito separato dal folato alimentare — nessuna firma di arricchimento. Nota minore: la tabella di sintesi della pagina indica 300kcal invece di 295kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170937 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — qui un'analogia più precisa delle altre spezie di questa coda: stessa famiglia botanica reale Asteraceae, *Cichorium endivia* vs *Artemisia dracunculus*).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica vegetale).
- **Matrice**: nuova `dragoncello` ("Dragoncello").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di pepe nero/cannella/origano/salvia/timo/noce moscata/chiodi di garofano/cumino/paprika/maggiorana in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae` (*Artemisia dracunculus*, stessa famiglia di scarola/radicchio/lattuga romana già nel Golden Set, genere diverso), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170937 --food-id=food_dragoncello_raw \
  --name-it="Dragoncello, secco" \
  --matrix-id=dragoncello --matrix-description-it="Dragoncello" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=170937 --food-id=food_dragoncello_raw \
  --name-it="Dragoncello, secco" \
  --matrix-id=dragoncello --matrix-description-it="Dragoncello" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Maggiorana, secca — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_maggiorana_raw`. FDC ID 170928 (SR Legacy, "Spices, marjoram, dried").
- **Nutrienti**: **17/17**. Energia 271kcal, proteine 12,7g, grassi 7,04g, carboidrati 60,6g, fibra 40,3g, ferro 82,7mg, zinco 3,60mg, calcio 1990mg (altissimo ma coerente con la concentrazione da disidratazione già vista per le altre erbe secche di questa coda, es. semi di finocchio 1196mg), rame 1,13mg, magnesio 346mg, selenio 4,50µg, vitamina C 51,4mg, vitamina K 622µg, vitamina B12 0µg, folato totale 274µg, acido folico 0µg esplicito separato dal folato alimentare — nessuna firma di arricchimento —, beta-carotene 4806µg, altri carotenoidi provitaminici A (alfa 0 + cripto 70,0) = 70,0µg. Nota minore: l'etichetta riporta 270kcal invece di 271kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170928 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione delle altre spezie/erbe secche di questa coda; nessuna pianta della famiglia Lamiaceae ancora eseguita nel Golden Set — origano/rosmarino/timo/salvia/menta/basilico restano tutti solo "pronti" — famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica vegetale).
- **Matrice**: nuova `maggiorana` ("Maggiorana").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, stessa scelta già usata per le altre spezie di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Origanum majorana*, stessa famiglia di origano/rosmarino/timo/salvia/menta/basilico, nessuno ancora eseguito), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170928 --food-id=food_maggiorana_raw \
  --name-it="Maggiorana, secca" \
  --matrix-id=maggiorana --matrix-description-it="Maggiorana" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=170928 --food-id=food_maggiorana_raw \
  --name-it="Maggiorana, secca" \
  --matrix-id=maggiorana --matrix-description-it="Maggiorana" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae --apply
```

### Alloro, foglie secche — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_alloro_raw`. FDC ID 170917 (SR Legacy, "Spices, bay leaf").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina consultata, non riportati a zero — gap dichiarato, stesso tipo di gap già visto per zafferano/rosmarino/menta in questa coda). Energia 313kcal, proteine 7,61g, grassi 8,36g, carboidrati 75,0g, fibra 26,3g, ferro 43,0mg (molto alto ma coerente con la concentrazione da disidratazione già vista per le altre spezie di questa coda), zinco 3,70mg, calcio 834mg, rame 0,42mg, magnesio 120mg, selenio 2,80µg, vitamina C 46,5mg, vitamina B12 0µg, folato totale 180µg, acido folico 0µg esplicito separato dal folato alimentare — nessuna firma di arricchimento. Nota minore: l'etichetta della pagina riporta 310kcal/830mg calcio invece di 313kcal/834mg della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170917 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione delle altre spezie/erbe secche di questa coda; nessuna pianta della famiglia Lauraceae ancora eseguita nel Golden Set per un'analogia più precisa, famiglia dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `alloro` ("Alloro").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di pepe nero/cannella/origano/salvia/timo/noce moscata/chiodi di garofano/cumino/paprika in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lauraceae` (*Laurus nobilis*, stessa famiglia della cannella — non ancora eseguita sul DB reale, solo "pronta" — ma genere diverso), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in 1-2 foglie per piatto.

```
npm run add-food -- --fdc-id=170917 --food-id=food_alloro_raw \
  --name-it="Alloro, foglie secche" \
  --matrix-id=alloro --matrix-description-it="Alloro" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lauraceae
```
```
npm run add-food -- --fdc-id=170917 --food-id=food_alloro_raw \
  --name-it="Alloro, foglie secche" \
  --matrix-id=alloro --matrix-description-it="Alloro" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lauraceae --apply
```

### Paprika dolce, in polvere — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_paprika_raw`. FDC ID 171329 (SR Legacy, "Spices, paprika").
- **Nutrienti**: **17/17**. Energia 282kcal, proteine 14,1g, grassi 12,9g, carboidrati 54,0g, fibra 34,9g, ferro 21,1mg, zinco 4,33mg, calcio 229mg, rame 0,71mg, magnesio 178mg, selenio 6,30µg, vitamina C 0,90mg, vitamina K 80,3µg, vitamina B12 0µg, folato totale 49,0µg, acido folico 0µg esplicito — nessuna firma di arricchimento —, beta-carotene 26162µg (altissimo ma coerente con una spezia ottenuta da peperoni rossi disidratati e concentrati, stesso pigmento già visto per peperoni rossi/peperoncino in questa coda, qui su scala concentrata x10-15 per la disidratazione), altri carotenoidi provitaminici A (alfa 595 + cripto 6186) = 6781µg. Nota minore: l'etichetta della pagina mostra 280kcal arrotondate invece di 282kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171329 e dataType SR Legacy.
- **Analogia usata**: `food_pepper_red_raw` (peperone rosso crudo, già eseguito sul DB reale — stessa specie reale *Capsicum annuum* della paprika, che è peperone rosso disidratato e macinato, non solo stessa famiglia).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `paprika` ("Paprika dolce").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e molto alto, stessa scelta già usata per le altre spezie di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae` (*Capsicum annuum*, stessa famiglia/specie di peperoni/peperoncino/melanzane/pomodori già nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=171329 --food-id=food_paprika_raw \
  --name-it="Paprika dolce, in polvere" \
  --matrix-id=paprika --matrix-description-it="Paprika dolce" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Solanaceae
```
```
npm run add-food -- --fdc-id=171329 --food-id=food_paprika_raw \
  --name-it="Paprika dolce, in polvere" \
  --matrix-id=paprika --matrix-description-it="Paprika dolce" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Solanaceae --apply
```

### Semi di finocchio, secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_semi_di_finocchio_raw`. FDC ID 171323 (SR Legacy, "Spices, fennel seed").
- **Nutrienti**: **12/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `folate_mcg` (e quindi l'acido folico non è dichiarabile separatamente), `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg`: campi del tutto assenti dalla pagina consultata, non riportati a zero — gap dichiarato, sopra la soglia minima di ~10/17 presa come segnale di match debole ma comunque un gap reale, da non usare per questi micronutrienti. Energia 345kcal, proteine 15,8g, grassi 14,9g, carboidrati 52,3g, fibra 39,8g, ferro 18,5mg, zinco 3,70mg, calcio 1196mg (molto alto ma coerente con la concentrazione da disidratazione già vista per le altre spezie di questa coda), rame 1,07mg, magnesio 385mg, vitamina C 21,0mg, vitamina B12 0µg esplicito. Nota minore: l'etichetta della pagina riporta 350kcal invece di 345kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171323 e dataType SR Legacy.
- **Analogia usata**: `food_fennel_raw` (finocchi, bulbo crudo, già eseguito sul DB reale — stessa specie reale *Foeniculum vulgare* del seme di finocchio, non solo stessa famiglia: l'analogia più precisa di questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `semi_di_finocchio` ("Semi di finocchio").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di pepe nero/cannella/origano/salvia/timo/noce moscata/chiodi di garofano/cumino in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (*Foeniculum vulgare*, stessa famiglia di cumino/sedano/carote, stessa specie del finocchio bulbo già nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=171323 --food-id=food_semi_di_finocchio_raw \
  --name-it="Semi di finocchio, secchi" \
  --matrix-id=semi_di_finocchio --matrix-description-it="Semi di finocchio" \
  --baseline-cooking-state=raw --analogy-food-id=food_fennel_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=171323 --food-id=food_semi_di_finocchio_raw \
  --name-it="Semi di finocchio, secchi" \
  --matrix-id=semi_di_finocchio --matrix-description-it="Semi di finocchio" \
  --baseline-cooking-state=raw --analogy-food-id=food_fennel_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae --apply
```

### Cumino, semi secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_cumino_raw`. FDC ID 170923 (SR Legacy, "Spices, cumin seed").
- **Nutrienti**: **17/17**. Energia 375kcal, proteine 17,8g, grassi 22,3g, carboidrati 44,2g, fibra 10,5g, ferro 66,4mg (altissimo ma coerente con un dato noto e spesso citato per i semi di cumino secchi, non un'anomalia isolata), zinco 4,80mg, calcio 931mg, rame 0,87mg, magnesio 366mg, selenio 5,20µg, vitamina C 7,70mg, vitamina K 5,40µg, vitamina B12 0µg, folato totale 10,0µg, acido folico 0µg esplicito — nessuna firma di arricchimento —, beta-carotene 762µg, altri carotenoidi provitaminici A (alfa 0 + cripto 0) = 0. Nota minore: l'intestazione della pagina riporta 380kcal/22g grassi invece di 375kcal/22,3g della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per noce moscata/chiodi di garofano). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170923 e dataType SR Legacy.
- **Analogia usata**: `food_sedano_raw` (sedano, già eseguito sul DB reale — stessa famiglia botanica reale Apiaceae del cumino, a differenza delle altre spezie di questa coda per cui si è usata `food_scarola_raw` come convenzione generica).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `cumino` ("Cumino").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, stessa scelta già usata per le altre spezie di questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (*Cuminum cyminum*, stessa famiglia di sedano/carote già nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=170923 --food-id=food_cumino_raw \
  --name-it="Cumino, semi secchi" \
  --matrix-id=cumino --matrix-description-it="Cumino" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=170923 --food-id=food_cumino_raw \
  --name-it="Cumino, semi secchi" \
  --matrix-id=cumino --matrix-description-it="Cumino" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Apiaceae --apply
```

### Chiodi di garofano, secchi — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_chiodi_di_garofano_raw`. FDC ID 171321 (SR Legacy, "Spices, cloves, ground").
- **Nutrienti**: **17/17**. Energia 274kcal, proteine 5,97g, grassi 13,0g, carboidrati 65,5g, fibra 33,9g, ferro 11,8mg, zinco 2,32mg, calcio 632mg, rame 0,37mg, magnesio 259mg, selenio 7,20µg, vitamina C 0,20mg, vitamina K 142µg, vitamina B12 0µg, folato totale 25,0µg, acido folico 0µg esplicito — nessuna firma di arricchimento —, beta-carotene 45,0µg, altri carotenoidi provitaminici A (alfa 0 + cripto 103) = 103µg. Valori molto alti di calcio/ferro/magnesio/vitamina K coerenti con la concentrazione tipica da disidratazione di una spezia secca, qui su scala ancora più marcata che per le altre spezie di questa coda. Nota minore: l'etichetta "Nutrition Facts" riporta 270kcal invece di 274kcal della tabella dettagliata — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per noce moscata/cavolfiore cotto). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171321 e dataType SR Legacy.
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione delle altre spezie/erbe secche di questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `chiodi_di_garofano` ("Chiodi di garofano").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, stessa scelta già usata per pepe nero/cannella/origano/salvia/timo/noce moscata), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Myrtaceae` (*Syzygium aromaticum*, prima spezia di questa famiglia nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=171321 --food-id=food_chiodi_di_garofano_raw \
  --name-it="Chiodi di garofano, secchi" \
  --matrix-id=chiodi_di_garofano --matrix-description-it="Chiodi di garofano" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Myrtaceae
```
```
npm run add-food -- --fdc-id=171321 --food-id=food_chiodi_di_garofano_raw \
  --name-it="Chiodi di garofano, secchi" \
  --matrix-id=chiodi_di_garofano --matrix-description-it="Chiodi di garofano" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Myrtaceae --apply
```

### Noce moscata, in polvere — preparato 2026-10-19 dal task orario (decimo lotto, turno ore 09)

- **food_id**: `food_noce_moscata_raw`. FDC ID 171326 (SR Legacy, "Spices, nutmeg, ground").
- **Nutrienti**: **17/17**. Energia 525kcal, proteine 5,84g, grassi 36,3g, carboidrati 49,3g, fibra 20,8g, ferro 3,04mg, zinco 2,15mg, calcio 184mg, rame 1,03mg, magnesio 183mg, selenio 1,60µg, vitamina C 3,00mg, vitamina K 0µg, vitamina B12 0µg, folato totale 76,0µg, acido folico 0µg esplicito separato dal folato alimentare — nessuna firma di arricchimento —, beta-carotene 28,0µg, altri carotenoidi provitaminici A (alfa 0 + cripto 66,0) = 66,0µg. Valori alti di calcio/ferro/magnesio coerenti con la concentrazione tipica da disidratazione di una spezia secca (stessa cautela già usata per le altre spezie di questa coda). Nota minore: la tabella "Nutrition Facts" della stessa pagina riporta 530kcal/180mg calcio invece di 525kcal/184mg della tabella dettagliata per 100g — usati questi ultimi (stesso tipo di arrotondamento minore già accettato per il cavolfiore cotto, non bloccante). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171326 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per tutte le spezie/erbe secche di questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `noce_moscata` ("Noce moscata").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, stessa scelta già usata per pepe nero/cannella/origano/salvia/timo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Myristicaceae` (*Myristica fragrans*, prima spezia di questa famiglia nel Golden Set), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi/pizzichi.

```
npm run add-food -- --fdc-id=171326 --food-id=food_noce_moscata_raw \
  --name-it="Noce moscata, in polvere" \
  --matrix-id=noce_moscata --matrix-description-it="Noce moscata" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Myristicaceae
```
```
npm run add-food -- --fdc-id=171326 --food-id=food_noce_moscata_raw \
  --name-it="Noce moscata, in polvere" \
  --matrix-id=noce_moscata --matrix-description-it="Noce moscata" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Myristicaceae --apply
```

### Sgombro atlantico, cotto (al forno/calore secco) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_sgombro_cotto`. FDC ID 175120 (SR Legacy, "Fish, mackerel, Atlantic, cooked, dry heat"). Distinto da `food_sgombro_raw` (crudo, già eseguito, FDC 175119 "Fish, mackerel, Atlantic, raw") — stesso pesce, forma cotta "dry heat". **Nota sulla fonte**: l'FDC ID è confermato tramite l'URL di una pagina di confronto getfoodfacts.com comparsa nei risultati di ricerca (`.../compare/fish-herring-atlantic-pickled-175118/fish-mackerel-atlantic-cooked-dry-heat-175120/...`), ma il fetch diretto alla pagina di dettaglio getfoodfacts.com per questo record è stato bloccato da un timeout di provenance in questa sessione pianificata non presidiata (nessun utente a confermare l'accesso in tempo). I valori sotto sono letti da due fonti secondarie indipendenti e concordanti (recipal.com, triagemethod.com, che riportano numeri quasi identici), non dalla pagina FDC primaria — stessa cautela già usata per `food_acciughe_raw` ("FDC ID dedotto indirettamente").
- **Nutrienti**: **~14/17** (valori approssimati da fonti secondarie, da verificare col dry-run reale che ri-scarica da FDC). Energia ~262kcal, proteine ~23,9g, grassi ~17,8g, carboidrati 0g, fibra 0g, ferro ~1,6mg, zinco ~0,9mg, rame ~0,09mg, calcio ~11-15mg, magnesio ~85-97mg, selenio ~46-52µg, vitamina B12 ~17-19µg, folato totale ~2,0µg (basso, coerente col pesce), vitamina C ~0-0,4mg. **Mancano** (assenti in entrambe le fonti consultate, non assunti zero): vitamina K, beta-carotene, altri carotenoidi provitaminici A — gap plausibile per un pesce (dato raramente misurato), non necessariamente un segnale di match debole.
- **Analogia usata**: `food_sgombro_raw` (sgombro atlantico crudo, già eseguito sul DB reale — stesso pesce, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `sgombro_cotto` ("Sgombro atlantico, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione già usata per gli altri pesci di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked` (stessa convenzione già usata per `food_merluzzo_cotto`), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175120 --food-id=food_sgombro_cotto \
  --name-it="Sgombro atlantico, cotto (al forno)" \
  --matrix-id=sgombro_cotto --matrix-description-it="Sgombro atlantico, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_sgombro_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175120 --food-id=food_sgombro_cotto \
  --name-it="Sgombro atlantico, cotto (al forno)" \
  --matrix-id=sgombro_cotto --matrix-description-it="Sgombro atlantico, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_sgombro_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Fegato di vitello, cotto (brasato) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_fegato_di_vitello_cotto`. FDC ID 172535 (SR Legacy, "Veal, variety meats and by-products, liver, cooked, braised"). Distinto da `food_fegato_di_vitello_raw` (crudo, già eseguito sul DB reale, confermato in `lotti_alimenti/esito_lotto_05_applica.txt`, FDC 172534) — stesso alimento, forma cotta. Scelta la variante "braised" (non "pan-fried", FDC 174358, che implica grasso di cottura aggiunto) come preparazione più semplice/paragonabile al crudo.
- **Nutrienti**: **17/17**. Energia 192kcal, proteine 28,4g, grassi 6,26g, carboidrati 3,77g, fibra 0g esplicito, calcio 6,00mg, ferro 5,11mg, magnesio 20,0mg, zinco 11,2mg, rame 14,9mg (molto alto ma coerente col fegato, organo che accumula rame), selenio 19,3µg, vitamina B12 84,6µg (molto alta, coerente col fegato), folato totale 331µg, vitamina C 1,10mg, vitamina K 1,40µg, beta-carotene 47,0µg, altri carotenoidi provitaminici A (alfa 11,0 + cripto 11,0) = 22,0µg. Fonte: getfoodfacts.com (FDC ID 172535, dataType SR Legacy).
- **Analogia usata**: `food_fegato_di_vitello_raw` (fegato di vitello crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura; `is_heme_iron=true` mantenuto per coerenza).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `fegato_di_vitello_cotto` ("Fegato di vitello, cotto").
- **Attributi**: `--is-heme-iron` (true, coerente con l'analogia dichiarata e con `food_beef_liver_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172535 --food-id=food_fegato_di_vitello_cotto \
  --name-it="Fegato di vitello, cotto (brasato)" \
  --matrix-id=fegato_di_vitello_cotto --matrix-description-it="Fegato di vitello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_fegato_di_vitello_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172535 --food-id=food_fegato_di_vitello_cotto \
  --name-it="Fegato di vitello, cotto (brasato)" \
  --matrix-id=fegato_di_vitello_cotto --matrix-description-it="Fegato di vitello, cotto" \
  --baseline-cooking-state=braised --analogy-food-id=food_fegato_di_vitello_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cavolo rapa, cotto (bollito, con sale) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_cavolo_rapa_cotto`. FDC ID 169357 (SR Legacy, "Kohlrabi, cooked, boiled, drained, with salt" — solo questa variante ha un FDC ID verificato su getfoodfacts.com). Distinto da `food_cavolo_rapa_raw` (crudo, già eseguito, FDC 168424 "Kohlrabi, raw") — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Energia 29,0kcal, proteine 1,80g, grassi 0,11g, carboidrati 6,69g, fibra 1,10g, calcio 25,0mg, ferro 0,40mg, magnesio 19,0mg, zinco 0,31mg, rame 0,13mg, selenio 0,80µg, vitamina B12 0µg esplicito, folato totale 12,0µg, vitamina C 54,0mg, vitamina K 0,10µg, beta-carotene 21,0µg, altri carotenoidi provitaminici A (alfa 0 + cripto 0) = 0µg. Sodio 257mg/100g (variante "with salt", non uno dei 17 nutrienti tracciati). Fonte: getfoodfacts.com (FDC ID 169357, dataType SR Legacy).
- **Analogia usata**: `food_cavolo_rapa_raw` (cavolo rapa crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (crucifera).
- **Matrice**: nuova `cavolo_rapa_cotto` ("Cavolo rapa, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene presente 21,0µg, coerente col crudo che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Brassicaceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169357 --food-id=food_cavolo_rapa_cotto \
  --name-it="Cavolo rapa, cotto (bollito, con sale)" \
  --matrix-id=cavolo_rapa_cotto --matrix-description-it="Cavolo rapa, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cavolo_rapa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169357 --food-id=food_cavolo_rapa_cotto \
  --name-it="Cavolo rapa, cotto (bollito, con sale)" \
  --matrix-id=cavolo_rapa_cotto --matrix-description-it="Cavolo rapa, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cavolo_rapa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit --apply
```

### Sedano rapa, cotto (bollito, con sale) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_sedano_rapa_cotto`. FDC ID 169341 (SR Legacy, "Celeriac, cooked, boiled, drained, with salt" — solo questa variante ha un FDC ID verificato su getfoodfacts.com; nessuna variante "without salt" distinta trovata). Distinto da `food_sedano_rapa_raw` (crudo, già eseguito, FDC 170400 "Celeriac, raw") — stesso alimento, forma cotta.
- **Nutrienti**: **13/17** — gap dichiarato. Presenti: energia 27,0kcal, proteine 0,96g, grassi 0,19g, carboidrati 5,90g, calcio 26,0mg, ferro 0,43mg, magnesio 12,0mg, zinco 0,20mg, rame 0,043mg, selenio 0,40µg, vitamina B12 0µg esplicito, folato totale 3,00µg, vitamina C 3,60mg. Sodio 297mg/100g (variante "with salt", non uno dei 17 nutrienti tracciati). **Mancano** (non riportati, non assunti zero): fibra, vitamina K, beta-carotene, altri carotenoidi provitaminici A. Fonte: getfoodfacts.com (FDC ID 169341, dataType SR Legacy).
- **Analogia usata**: `food_sedano_rapa_raw` (sedano rapa crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (tubero/ortaggio da radice).
- **Matrice**: nuova `sedano_rapa_cotto` ("Sedano rapa, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi assenti dal record, stesso trattamento già usato per il crudo), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Apiaceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169341 --food-id=food_sedano_rapa_cotto \
  --name-it="Sedano rapa, cotto (bollito, con sale)" \
  --matrix-id=sedano_rapa_cotto --matrix-description-it="Sedano rapa, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_sedano_rapa_raw \
  --botanical-family=Apiaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169341 --food-id=food_sedano_rapa_cotto \
  --name-it="Sedano rapa, cotto (bollito, con sale)" \
  --matrix-id=sedano_rapa_cotto --matrix-description-it="Sedano rapa, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_sedano_rapa_raw \
  --botanical-family=Apiaceae --diet-category=plant_non_fruit --apply
```

### Scarola, cotta (bollita, senza sale) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_scarola_cotta`. FDC ID 168413 (SR Legacy, "Escarole, cooked, boiled, drained, no salt added"). Distinta da `food_scarola_raw` (cruda, già eseguita, FDC 168412 "Endive, raw") — con una precisione in più: "escarole" è il nome inglese esatto della scarola (*Cichorium endivia* var. *latifolium*, foglia larga), mentre il crudo aveva dovuto usare "Endive, raw" generico per mancanza di un record "escarole" crudo distinto in FDC. Per la forma cotta, invece, FDC distingue correttamente "escarole" — un match più preciso del crudo, non solo un'analogia.
- **Nutrienti**: **17/17**. Energia 15,0kcal, proteine 1,15g, grassi 0,18g, carboidrati 3,07g, fibra 2,80g, calcio 46,0mg, ferro 0,72mg, magnesio 13,0mg, zinco 0,69mg, rame 0,087mg, selenio 0,20µg, vitamina B12 0µg esplicito, folato totale 78,0µg, vitamina C 3,30mg, vitamina K 212µg, beta-carotene 1.133µg (alto, coerente con una verdura a foglia verde), altri carotenoidi provitaminici A (alfa 0 + cripto 0) = 0µg. Nessun segno di sale aggiunto ("no salt added" esplicito nel nome). Fonte: getfoodfacts.com (FDC ID 168413, dataType SR Legacy).
- **Analogia usata**: `food_scarola_raw` (scarola cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura a foglia).
- **Matrice**: nuova `scarola_cotta` ("Scarola, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene molto significativo, coerente col crudo che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Asteraceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168413 --food-id=food_scarola_cotta \
  --name-it="Scarola, cotta (bollita, senza sale)" \
  --matrix-id=scarola_cotta --matrix-description-it="Scarola, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asteraceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168413 --food-id=food_scarola_cotta \
  --name-it="Scarola, cotta (bollita, senza sale)" \
  --matrix-id=scarola_cotta --matrix-description-it="Scarola, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asteraceae \
  --diet-category=plant_non_fruit --apply
```

### Edamame (soia verde), cotto (bollito) — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_edamame_cotto`. FDC ID 168411 (SR Legacy, "Edamame, frozen, prepared" — "prepared" = bollito/cotto, distinto dal crudo/congelato "frozen, unprepared" FDC 168410 già eseguito come `food_edamame_raw`).
- **Nutrienti**: **17/17**. Energia 121kcal, proteine 11,9g, grassi 5,20g, carboidrati 8,91g, fibra 5,20g, calcio 63,0mg, ferro 2,27mg, magnesio 64,0mg, zinco 1,37mg, rame 0,34mg, selenio 0,80µg, vitamina B12 0µg esplicito, folato totale 311µg (alto ma plausibile per semi di soia, noti per l'alto contenuto di folato naturale — nessun segnale di arricchimento/acido folico separato), vitamina C 6,10mg, vitamina K 26,7µg, beta-carotene 175µg, altri carotenoidi provitaminici A (alfa 0 + cripto 8,00) = 8,00µg. Nessun segno di sale aggiunto (sodio 6,00mg/100g, basso) né additivi. Fonte: getfoodfacts.com (FDC ID 168411, dataType SR Legacy).
- **Analogia usata**: `food_edamame_raw` (edamame crudo/congelato, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura; manteniamo `carotenoid_matrix_state` NULL per coerenza con l'analogia dichiarata, pur essendo presente un beta-carotene significativo).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `edamame_cotto` ("Edamame, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL, coerente con l'analogia dichiarata `food_edamame_raw`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168411 --food-id=food_edamame_cotto \
  --name-it="Edamame (soia verde), cotto (bollito)" \
  --matrix-id=edamame_cotto --matrix-description-it="Edamame, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_edamame_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168411 --food-id=food_edamame_cotto \
  --name-it="Edamame (soia verde), cotto (bollito)" \
  --matrix-id=edamame_cotto --matrix-description-it="Edamame, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_edamame_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

### Amaranto, cotto — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_amaranto_cotto`. FDC ID 170683 (SR Legacy, "Amaranth grain, cooked"). Distinto da `food_amaranto_raw` (crudo, già eseguito, FDC 170682, 17/17 nutrienti) — stesso alimento, forma cotta.
- **Nutrienti**: **12/17** — gap dichiarato, più ampio del crudo (17/17). Presenti: energia 102kcal, proteine 3,80g, grassi 1,58g, carboidrati 18,7g, fibra 2,10g, calcio 47,0mg, ferro 2,10mg, magnesio 65,0mg, zinco 0,86mg, rame 0,15mg, selenio 5,50µg, folato totale 22,0µg. **Mancano** (non riportati nella pagina, non assunti zero): vitamina C, vitamina B12, vitamina K, beta-carotene, altri carotenoidi provitaminici A (alfa-carotene + beta-criptoxantina). Nessun segno di arricchimento (folato 22µg plausibile per un cereale integrale, nessuna firma anomala). Fonte: getfoodfacts.com (FDC ID 170683, dataType SR Legacy). **Draft non da usare per vitamina C/B12/K/vitamina A finché il gap non è risolto**, stesso trattamento già dato a `food_farro_raw`/`food_patata_dolce_cotta` per i rispettivi gap.
- **Analogia usata**: `food_amaranto_raw` (amaranto crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale/pseudocereale).
- **Matrice**: nuova `amaranto_cotto` ("Amaranto, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene assente dal record, a differenza del crudo che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Amaranthaceae` (stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170683 --food-id=food_amaranto_cotto \
  --name-it="Amaranto, cotto" \
  --matrix-id=amaranto_cotto --matrix-description-it="Amaranto, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_amaranto_raw \
  --botanical-family=Amaranthaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170683 --food-id=food_amaranto_cotto \
  --name-it="Amaranto, cotto" \
  --matrix-id=amaranto_cotto --matrix-description-it="Amaranto, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_amaranto_raw \
  --botanical-family=Amaranthaceae --diet-category=plant_non_fruit --apply
```

### Couscous, cotto — preparato 2026-10-19 dal task orario (nono lotto, turno ore 08)

- **food_id**: `food_couscous_cotto`. FDC ID 169700 (SR Legacy, "Couscous, cooked"). Distinto da `food_couscous_raw` (secco/crudo, già eseguito, FDC 169699) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Energia 112 kcal, proteine 3,79g, grassi 0,16g, carboidrati 23,2g, fibra 1,40g, calcio 8,00mg, ferro 0,38mg, magnesio 8,00mg, zinco 0,26mg, rame 0,041mg, selenio 27,5µg, folato totale 15,0µg, vitamina B12 0µg esplicito, vitamina C 0mg esplicito, vitamina K 0,10µg, beta-carotene 0µg esplicito, altri carotenoidi provitaminici A (alfa+cripto) 0µg esplicito. Calcio molto basso (8mg/100g), nessun segno di farina/semola arricchita in stile USA (a differenza del caso pane/pasta già scartato altrove in questa coda — il couscous non ha mai mostrato questo problema). Fonte: getfoodfacts.com (FDC ID 169700, dataType SR Legacy).
- **Analogia usata**: `food_couscous_raw` (couscous secco/crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `couscous_cotto` ("Couscous, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — stesso trattamento già usato per i cereali di questa coda, carotenoidi non significativi), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Poaceae` (famiglia botanica reale del grano duro), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169700 --food-id=food_couscous_cotto \
  --name-it="Couscous, cotto" \
  --matrix-id=couscous_cotto --matrix-description-it="Couscous, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_couscous_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169700 --food-id=food_couscous_cotto \
  --name-it="Couscous, cotto" \
  --matrix-id=couscous_cotto --matrix-description-it="Couscous, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_couscous_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Peperoni verdi, cotti (bolliti) — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_peperoni_verdi_cotti`. FDC ID 170109 (SR Legacy, "Peppers, sweet, green, cooked, boiled, drained, with salt"). Distinto da `food_pepper_green_raw` (crudo, già eseguito) — stesso alimento, forma cotta. Scelta la variante "with salt" (sodio 238mg/100g, non uno dei 17 nutrienti tracciati): nessuna pagina getfoodfacts indicizzata per la variante "without salt", stesso tipo di scelta già fatta per peperoni rossi/cipolle in questa coda.
- **Nutrienti**: **17/17**. Beta-carotene 264µg/100g, alfa-carotene 26µg/100g, beta-criptoxantina 8µg/100g (other_provitamin_a=34µg/100g), vitamina K 9,80µg/100g, folato totale 16,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 170109, dataType SR Legacy).
- **Analogia usata**: `food_pepper_green_raw` (peperone verde crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente frutto, trattato come tale per il PRD).
- **Matrice**: nuova `peperoni_verdi_cotti` ("Peperoni verdi, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo, coerente con la cruda che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Solanaceae` (famiglia botanica reale del peperone), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170109 --food-id=food_peperoni_verdi_cotti \
  --name-it="Peperoni verdi, cotti (bolliti)" \
  --matrix-id=peperoni_verdi_cotti --matrix-description-it="Peperoni verdi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pepper_green_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170109 --food-id=food_peperoni_verdi_cotti \
  --name-it="Peperoni verdi, cotti (bolliti)" \
  --matrix-id=peperoni_verdi_cotti --matrix-description-it="Peperoni verdi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pepper_green_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Miglio, cotto — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_miglio_cotto`. FDC ID 168871 (SR Legacy, "Millet, cooked"). Distinto da `food_miglio_raw` (crudo, già eseguito) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 2,00µg/100g e vitamina K 0,30µg/100g molto bassi ma espliciti (non assenti), folato totale 19,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 168871, dataType SR Legacy, categoria "Cereal Grains and Pasta").
- **Analogia usata**: `food_miglio_raw` (miglio crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `miglio_cotto` ("Miglio, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene molto basso, stesso trattamento già usato per orzo/riso cotti in questa coda), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Poaceae` (famiglia botanica reale del miglio), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168871 --food-id=food_miglio_cotto \
  --name-it="Miglio, cotto" \
  --matrix-id=miglio_cotto --matrix-description-it="Miglio, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_miglio_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168871 --food-id=food_miglio_cotto \
  --name-it="Miglio, cotto" \
  --matrix-id=miglio_cotto --matrix-description-it="Miglio, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_miglio_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Piselli secchi, spezzati, cotti (bolliti) — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_piselli_secchi_spezzati_cotti`. FDC ID 172429 (SR Legacy, "Peas, split, mature seeds, cooked, boiled, without salt"). Distinto da `food_piselli_secchi_spezzati_raw` (crudi, già eseguiti) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 4,00µg/100g molto basso ma esplicito, vitamina K 5,00µg/100g, folato totale 65,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 172429, dataType SR Legacy).
- **Analogia usata**: `food_piselli_secchi_spezzati_raw` (piselli secchi spezzati crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `piselli_secchi_spezzati_cotti` ("Piselli secchi spezzati, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene molto basso), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172429 --food-id=food_piselli_secchi_spezzati_cotti \
  --name-it="Piselli secchi, spezzati, cotti (bolliti)" \
  --matrix-id=piselli_secchi_spezzati_cotti --matrix-description-it="Piselli secchi spezzati, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_piselli_secchi_spezzati_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=172429 --food-id=food_piselli_secchi_spezzati_cotti \
  --name-it="Piselli secchi, spezzati, cotti (bolliti)" \
  --matrix-id=piselli_secchi_spezzati_cotti --matrix-description-it="Piselli secchi spezzati, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_piselli_secchi_spezzati_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

### Zucca, cotta (bollita) — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_zucca_cotta`. FDC ID 168449 (SR Legacy, "Pumpkin, cooked, boiled, drained, without salt"). Distinta da `food_pumpkin_raw` (cruda, già eseguita) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 2.096µg/100g e alfa-carotene 2.715µg/100g (other_provitamin_a=2.715µg/100g, beta-criptoxantina 0), vitamina K 0,80µg/100g, folato totale 9,00µg/100g con acido folico 0µg esplicito. Fonte: getfoodfacts.com (FDC ID 168449, dataType SR Legacy).
- **Analogia usata**: `food_pumpkin_raw` (zucca cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente frutto, trattato come tale per il PRD).
- **Matrice**: nuova `zucca_cotta` ("Zucca, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (carotenoidi significativi), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Cucurbitaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168449 --food-id=food_zucca_cotta \
  --name-it="Zucca, cotta (bollita)" \
  --matrix-id=zucca_cotta --matrix-description-it="Zucca, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168449 --food-id=food_zucca_cotta \
  --name-it="Zucca, cotta (bollita)" \
  --matrix-id=zucca_cotta --matrix-description-it="Zucca, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit --apply
```

### Soia secca, cotta (bollita) — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_soia_secca_cotta`. FDC ID 174271 (SR Legacy, "Soybeans, mature cooked, boiled, without salt"). Distinta da `food_soia_secca_raw` (cruda, già eseguita) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 5,00µg/100g molto basso ma esplicito, vitamina K 19,2µg/100g, folato totale 54,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 174271, dataType SR Legacy).
- **Analogia usata**: `food_soia_secca_raw` (soia secca cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `soia_secca_cotta` ("Soia secca, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene molto basso), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174271 --food-id=food_soia_secca_cotta \
  --name-it="Soia secca, cotta (bollita)" \
  --matrix-id=soia_secca_cotta --matrix-description-it="Soia secca, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_soia_secca_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=174271 --food-id=food_soia_secca_cotta \
  --name-it="Soia secca, cotta (bollita)" \
  --matrix-id=soia_secca_cotta --matrix-description-it="Soia secca, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_soia_secca_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

### Fegato di pollo, cotto (brasato/bollito) — preparato 2026-10-15 dal task orario (nono lotto, turno ore 16)

- **food_id**: `food_fegato_di_pollo_cotto`. FDC ID 171061 (SR Legacy, "Chicken, liver, all classes, cooked, simmered"). Distinto da `food_fegato_di_pollo_raw` (crudo, già eseguito) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Vitamina A molto alta (retinolo 3.978µg/100g, coerente col fegato), beta-carotene 30µg/100g, alfa-carotene 11µg/100g + beta-criptoxantina 11µg/100g (other_provitamin_a=22µg/100g), vitamina K (filloquinone) 0µg esplicito, vitamina B12 16,9µg/100g, folato totale 578µg/100g (coerente con fegato, nessuna firma di arricchimento perché non è un cereale). Fonte: getfoodfacts.com (FDC ID 171061, dataType SR Legacy).
- **Analogia usata**: `food_fegato_di_pollo_raw` (fegato di pollo crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura; coerente anche con `food_beef_liver_cooked`, già nei 30 originali, stesso tipo di tessuto animale).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `fegato_di_pollo_cotto` ("Fegato di pollo, cotto").
- **Attributi**: `--is-heme-iron` (true, frattaglia animale, coerente con `food_beef_liver_cooked`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non è un vegetale, stesso trattamento già usato per fegato di manzo nei 30 originali), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family` omesso (alimento animale), `baseline_cooking_state=simmered`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171061 --food-id=food_fegato_di_pollo_cotto \
  --name-it="Fegato di pollo, cotto (brasato/bollito)" \
  --matrix-id=fegato_di_pollo_cotto --matrix-description-it="Fegato di pollo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171061 --food-id=food_fegato_di_pollo_cotto \
  --name-it="Fegato di pollo, cotto (brasato/bollito)" \
  --matrix-id=fegato_di_pollo_cotto --matrix-description-it="Fegato di pollo, cotto" \
  --baseline-cooking-state=simmered --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cime di rapa, cotte (bollite) — preparato 2026-10-15 dal task orario (ottavo lotto, chiusura, turno ore 16)

- **food_id**: `food_cime_di_rapa_cotte`. FDC ID 170382 (SR Legacy, "Broccoli raab, cooked"). Distinte da `food_cime_di_rapa_raw` (crude, già eseguite, FDC 170381 "Broccoli raab, raw") — stesso alimento, forma cotta: NON un duplicato generico di broccoli, perché esiste un record FDC specifico per "broccoli raab" sia crudo che cotto, già usato per il crudo in questa stessa coda.
- **Nutrienti**: **17/17**. Beta-carotene ≈2.719µg/100g (ricalcolato da 2.312µg/85g), vitamina K (filloquinone) ≈256µg/100g, folato totale ≈71µg/100g con acido folico 0µg esplicito, alfa-carotene e beta-criptoxantina 0 (espliciti, other_provitamin_a=0). Fonte: getfoodfacts.com (FDC ID 170382, dataType SR Legacy), valori per porzione 85g riscalati a 100g.
- **Analogia usata**: `food_cime_di_rapa_raw` (cime di rapa crude, già eseguite sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cime_di_rapa_cotte` ("Cime di rapa, cotte").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo, coerente con la cruda che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Brassicaceae` (*Brassica rapa*, stessa famiglia reale della crucifera), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170382 --food-id=food_cime_di_rapa_cotte \
  --name-it="Cime di rapa, cotte (bollite)" \
  --matrix-id=cime_di_rapa_cotte --matrix-description-it="Cime di rapa, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cime_di_rapa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170382 --food-id=food_cime_di_rapa_cotte \
  --name-it="Cime di rapa, cotte (bollite)" \
  --matrix-id=cime_di_rapa_cotte --matrix-description-it="Cime di rapa, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cime_di_rapa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit --apply
```

### Latte di cocco, crudo — preparato 2026-10-15 dal task orario (ottavo lotto, chiusura, turno ore 16)

- **food_id**: `food_latte_di_cocco_raw`. FDC ID 170172 (SR Legacy, "Nuts, coconut milk, raw (liquid expressed from grated meat and water)"). Distinto da `food_olio_di_cocco_raw` (olio, già eseguito) e dalla "Noce di cocco, polpa fresca, cruda" (preparata ma non ancora eseguita): prodotto realmente diverso, un altro record FDC (categoria "Nut and Seed Products"), il liquido spremuto dalla polpa grattugiata, non la polpa né l'olio.
- **Nutrienti**: **17/17** (valori per 100g ricalcolati dal tbsp/15g della pagina: energia 230kcal, proteine 2,27g, grassi 23,9g, carboidrati 5,53g, fibra 2,2g). Beta-carotene 0µg esplicito, alfa-carotene e beta-criptoxantina 0 (other_provitamin_a=0, espliciti non assenti), vitamina K (filloquinone) ≈0,10µg/100g, folato totale ≈16µg/100g, vitamina B12 0µg. Fonte: getfoodfacts.com (FDC ID 170172, dataType SR Legacy).
- **Analogia usata**: `food_olio_di_cocco_raw` (olio di cocco, già eseguito sul DB reale — stessa specie *Cocos nucifera*, famiglia Arecaceae, stesso tipo di estrazione non termica).
- **Categoria dieta**: `plant_non_fruit` (derivato di frutta a guscio/seme, non frutta fresca per la definizione restrittiva del PRD §4.9, vegano).
- **Matrice**: nuova `latte_di_cocco_raw` ("Latte di cocco, crudo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0 esplicito), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Arecaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170172 --food-id=food_latte_di_cocco_raw \
  --name-it="Latte di cocco, crudo" \
  --matrix-id=latte_di_cocco_raw --matrix-description-it="Latte di cocco, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170172 --food-id=food_latte_di_cocco_raw \
  --name-it="Latte di cocco, crudo" \
  --matrix-id=latte_di_cocco_raw --matrix-description-it="Latte di cocco, crudo" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_cocco_raw \
  --botanical-family=Arecaceae --diet-category=plant_non_fruit --apply
```

### Lupini, cotti (ammollati e bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, chiusura, turno ore 16)

- **food_id**: `food_lupini_cotti`. FDC ID 172424 (SR Legacy, "Lupins, mature seeds, cooked, boiled, without salt"). Distinti da `food_lupini_raw` (crudi, già eseguiti, FDC 172423) — stesso alimento, forma cotta.
- **Nutrienti**: **14/17** — mancano vitamin_k_mcg, beta_carotene_mcg e other_provitamin_a_carotenoids_mcg (vitamina K e tutti i carotenoidi assenti dalla pagina, non riportati, non assunti zero). Resto completo: energia 119kcal/100g, proteine 15,6g, folato totale 59,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 172424, dataType SR Legacy).
- **Analogia usata**: `food_lupini_raw` (lupini crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `lupini_cotti` ("Lupini, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi assenti dal record), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172424 --food-id=food_lupini_cotti \
  --name-it="Lupini, cotti (ammollati e bolliti)" \
  --matrix-id=lupini_cotti --matrix-description-it="Lupini, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_lupini_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=172424 --food-id=food_lupini_cotti \
  --name-it="Lupini, cotti (ammollati e bolliti)" \
  --matrix-id=lupini_cotti --matrix-description-it="Lupini, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_lupini_raw \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

### Fagioli neri, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, chiusura, turno ore 16)

- **food_id**: `food_fagioli_neri_cotti`. FDC ID 175239 (SR Legacy, "Beans, black turtle, mature seeds, cooked, boiled, with salt"). Distinti da `food_fagioli_neri_raw` (crudi, già eseguiti, FDC 175186) — stesso alimento, forma cotta. Scelta la variante "with salt" (sodio 239mg/100g, non tracciato): nessuna pagina getfoodfacts indicizzata per "without salt" con FDC ID verificabile (solo recipal.com, senza ID numerico esplicito), stesso tipo di scelta già fatta per peperoni rossi/cipolle in questa coda.
- **Nutrienti**: **17/17**. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (other_provitamin_a=0), vitamina K 3,30µg/100g, folato totale 86,0µg/100g con acido folico 0µg esplicito (nessuna firma di arricchimento). Fonte: getfoodfacts.com (FDC ID 175239, dataType SR Legacy).
- **Analogia usata**: `food_fagioli_borlotti_bolliti` (fagioli borlotti bolliti, già eseguiti sul DB reale — stessa specie *Phaseolus vulgaris*, cultivar diversa, stesso stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `fagioli_neri_cotti` ("Fagioli neri, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi 0 espliciti), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175239 --food-id=food_fagioli_neri_cotti \
  --name-it="Fagioli neri, cotti (bolliti)" \
  --matrix-id=fagioli_neri_cotti --matrix-description-it="Fagioli neri, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagioli_borlotti_bolliti \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=175239 --food-id=food_fagioli_neri_cotti \
  --name-it="Fagioli neri, cotti (bolliti)" \
  --matrix-id=fagioli_neri_cotti --matrix-description-it="Fagioli neri, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagioli_borlotti_bolliti \
  --botanical-family=Fabaceae --diet-category=plant_non_fruit --apply
```

### Sogliola, cotta (al forno) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_sogliola_cotta`. FDC ID 174197 (SR Legacy, "Fish, flatfish (flounder and sole species), cooked, dry heat"). Distinta da `food_sogliola_raw` (cruda, già eseguita sul DB reale, FDC 174196 "Fish, flatfish (flounder and sole species), raw" — stessa "flatfish") — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Vitamina K riportata in due forme (filloquinone 0,10µg/100g + menachinone-4 0,30µg/100g), somma 0,40µg/100g usata. Acido folico 0µg esplicito, folato totale 6,00µg/100g — nessuna firma di arricchimento. Beta-carotene e alfa-carotene 0µg espliciti (coerente con pesce). Fonte: getfoodfacts.com (FDC ID 174197, dataType SR Legacy).
- **Analogia usata**: `food_sogliola_raw` (sogliola cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `sogliola_cotta` ("Sogliola, cotta").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_sogliola_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174197 --food-id=food_sogliola_cotta \
  --name-it="Sogliola, cotta (al forno)" \
  --matrix-id=sogliola_cotta --matrix-description-it="Sogliola, cotta" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_sogliola_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174197 --food-id=food_sogliola_cotta \
  --name-it="Sogliola, cotta (al forno)" \
  --matrix-id=sogliola_cotta --matrix-description-it="Sogliola, cotta" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_sogliola_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Branzino, cotto (al forno) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_branzino_cotto`. FDC ID 173694 (SR Legacy, "Fish, sea bass, mixed species, cooked, dry heat"). Distinto da `food_branzino_raw` (crudo, già eseguito sul DB reale, FDC 175142 "Fish, sea bass, mixed species, raw" — stessa "mixed species") — stesso alimento, forma cotta.
- **Nutrienti**: **14/17 — mancano vitamina K, beta-carotene e altri carotenoidi provitaminici A**, non riportati nel record (stesso identico gap già presente nel crudo `food_branzino_raw`, coerenza interna). Acido folico 0µg esplicito, folato totale 6,00µg/100g — nessuna firma di arricchimento. Fonte: getfoodfacts.com (FDC ID 173694, dataType SR Legacy).
- **Analogia usata**: `food_branzino_raw` (branzino crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `branzino_cotto` ("Branzino, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_branzino_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173694 --food-id=food_branzino_cotto \
  --name-it="Branzino, cotto (al forno)" \
  --matrix-id=branzino_cotto --matrix-description-it="Branzino, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_branzino_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=173694 --food-id=food_branzino_cotto \
  --name-it="Branzino, cotto (al forno)" \
  --matrix-id=branzino_cotto --matrix-description-it="Branzino, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_branzino_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Bistecca di manzo (taglio magro), cotta (alla griglia) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_bistecca_di_manzo_cotta`. FDC ID 168634 (SR Legacy, "Beef, top sirloin, steak, separable lean only, trimmed to 0\" fat, all grades, cooked, broiled"). **Non** è ancora la forma cotta di `food_bistecca_di_manzo_raw` (quest'ultimo resta solo 🟡 "Pronti", non eseguito sul DB reale — l'analogia non può riferirsi a lui, vedi sotto): è un record FDC indipendente. **Nota sul trim**: il crudo in coda usa FDC 174055 "trimmed to 1/8\" fat" (taglio magro con un velo di grasso residuo); questo cotto usa "trimmed to 0\" fat" (completamente privo di grasso visibile) — nessun record cotto con lo stesso identico trim 1/8" è stato trovato, solo varianti "lean and fat" (che includerebbero più grasso, non comparabile). Entrambi restano "separable lean only", stessa categoria di taglio magro.
- **Nutrienti**: **17/17**. Vitamina K riportata in due forme (filloquinone 1,40µg/100g + diidrofilloquinone 0µg/100g) anziché un valore unico, stesso tipo di formato già visto altrove in questa coda — somma 1,40µg/100g usata. Beta-carotene e alfa-carotene 0µg espliciti (coerente con carne). Fonte: getfoodfacts.com (FDC ID 168634, dataType SR Legacy).
- **Analogia usata**: `food_beef_ground_cooked` (manzo macinato cotto, nel Golden Set originale — stessa specie, stesso stato "cotto", stesso trattamento `is_heme_iron=true` con `matrix_category_calcium`/`botanical_family` NULL; non uso `food_bistecca_di_manzo_raw` perché non ancora eseguito sul DB reale, resta solo "Pronti").
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `bistecca_di_manzo_cotta` ("Bistecca di manzo, cotta") — distinta dalla matrice `bistecca_di_manzo` del crudo (ancora da creare quando/se quel comando verrà eseguito).
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_beef_ground_cooked`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=grilled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168634 --food-id=food_bistecca_di_manzo_cotta \
  --name-it="Bistecca di manzo (taglio magro), cotta (alla griglia)" \
  --matrix-id=bistecca_di_manzo_cotta --matrix-description-it="Bistecca di manzo, cotta" \
  --baseline-cooking-state=grilled --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168634 --food-id=food_bistecca_di_manzo_cotta \
  --name-it="Bistecca di manzo (taglio magro), cotta (alla griglia)" \
  --matrix-id=bistecca_di_manzo_cotta --matrix-description-it="Bistecca di manzo, cotta" \
  --baseline-cooking-state=grilled --analogy-food-id=food_beef_ground_cooked \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Coscia di pollo, cotta (brasata) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_coscia_di_pollo_cotta`. FDC ID 172853 (SR Legacy, "Chicken, broilers or fryers, dark meat, thigh, meat only, cooked, braised"). Distinta da `food_coscia_di_pollo_raw` (cruda, già eseguita sul DB reale, FDC 173627 "Chicken, broilers or fryers, dark meat, thigh, meat only, raw" — stesso taglio esatto "thigh, meat only") — stesso alimento, forma cotta. **Nome aggiornato rispetto alla coda**: la voce indicava "arrosto", ma nessun record FDC pulito è stato trovato per coscia di pollo arrosto semplice — solo "braised" (questo record, pagina "USDA Standard Reference" pulita) o varianti "enhanced"/"with added solution" (soluzione salina iniettata, non rappresentativo), stesso tipo di gap già incontrato per il petto di pollo in questa coda (rimasto ⚠ per lo stesso motivo).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5,00µg/100g) — nessuna firma di arricchimento. Vitamina K (0,30µg/100g) e selenio (29,2µg/100g) presenti e coerenti con pollo. Fonte: getfoodfacts.com (FDC ID 172853, dataType SR Legacy, pagina "USDA Standard Reference · Poultry Products").
- **Analogia usata**: `food_coscia_di_pollo_raw` (coscia di pollo cruda, già eseguita sul DB reale — stesso alimento, stesso taglio, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `coscia_di_pollo_cotta` ("Coscia di pollo, cotta").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione già usata per anatra/petto di pollo in questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=braised`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172853 --food-id=food_coscia_di_pollo_cotta \
  --name-it="Coscia di pollo, cotta (brasata)" \
  --matrix-id=coscia_di_pollo_cotta --matrix-description-it="Coscia di pollo, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_coscia_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172853 --food-id=food_coscia_di_pollo_cotta \
  --name-it="Coscia di pollo, cotta (brasata)" \
  --matrix-id=coscia_di_pollo_cotta --matrix-description-it="Coscia di pollo, cotta" \
  --baseline-cooking-state=braised --analogy-food-id=food_coscia_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Anatra, cotta (arrosto) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_anatra_cotta`. FDC ID 172411 (SR Legacy, "Duck, domesticated, meat only, cooked, roasted"). Distinta da `food_anatra_raw` (cruda, già eseguita sul DB reale, FDC 172410 — stesso "meat only, domesticated") — stesso alimento, forma cotta, stesso taglio "meat only" (senza pelle).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (10,0µg/100g) — nessuna firma di arricchimento. Vitamina K (3,80µg/100g) e B12 (0,40µg/100g) presenti, carotenoidi 0µg esplicito (coerente con carne). Fonte: getfoodfacts.com (FDC ID 172411, dataType SR Legacy).
- **Analogia usata**: `food_anatra_raw` (anatra cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `anatra_cotta` ("Anatra, cotta").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_anatra_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172411 --food-id=food_anatra_cotta \
  --name-it="Anatra, cotta (arrosto)" \
  --matrix-id=anatra_cotta --matrix-description-it="Anatra, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172411 --food-id=food_anatra_cotta \
  --name-it="Anatra, cotta (arrosto)" \
  --matrix-id=anatra_cotta --matrix-description-it="Anatra, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_anatra_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Coniglio, cotto (arrosto) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_coniglio_cotto`. FDC ID 172522 (SR Legacy, "Game meat, rabbit, domesticated, composite of cuts, cooked, roasted"). Distinto da `food_coniglio_raw` (crudo, già eseguito sul DB reale, FDC 172521 — stesso "composite of cuts, domesticated") — stesso alimento, forma cotta.
- **Nutrienti**: **14/17 — mancano vitamina K, beta-carotene e altri carotenoidi provitaminici A**, non riportati nel record (stesso identico gap già presente nel crudo `food_coniglio_raw`, coerenza interna). Acido folico 0µg esplicito, folato totale 11,0µg/100g — nessuna firma di arricchimento. Fonte: getfoodfacts.com (FDC ID 172522, dataType SR Legacy).
- **Analogia usata**: `food_coniglio_raw` (coniglio crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `coniglio_cotto` ("Coniglio, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_coniglio_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172522 --food-id=food_coniglio_cotto \
  --name-it="Coniglio, cotto (arrosto)" \
  --matrix-id=coniglio_cotto --matrix-description-it="Coniglio, cotto" \
  --baseline-cooking-state=roasted --analogy-food-id=food_coniglio_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=172522 --food-id=food_coniglio_cotto \
  --name-it="Coniglio, cotto (arrosto)" \
  --matrix-id=coniglio_cotto --matrix-description-it="Coniglio, cotto" \
  --baseline-cooking-state=roasted --analogy-food-id=food_coniglio_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Agnello, cotto — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_agnello_cotto`. FDC ID 174339 (SR Legacy, "Lamb, New Zealand, imported, frozen, composite of trimmed retail cuts, separable lean only, cooked"). Distinto da `food_agnello_raw` (crudo, già eseguito sul DB reale, FDC 174338) — stesso taglio composito, stessa provenienza (Nuova Zelanda, importato, congelato), stessa categoria "lean only", stesso alimento, forma cotta. **Nome aggiornato rispetto alla coda**: la descrizione FDC non specifica un metodo di cottura (non dice "roasted"/"braised"), quindi il nome resta "agnello, cotto" generico invece di "arrosto" per non attribuire un metodo non confermato.
- **Nutrienti**: **14/17 — mancano vitamina K, beta-carotene e altri carotenoidi provitaminici A**, non riportati nel record (stesso identico gap già presente nel crudo `food_agnello_raw`, coerenza interna). Acido folico 0µg esplicito, folato totale 0µg/100g — nessuna firma di arricchimento. Fonte: getfoodfacts.com (FDC ID 174339, dataType SR Legacy).
- **Analogia usata**: `food_agnello_raw` (agnello crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `agnello_cotto` ("Agnello, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_agnello_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174339 --food-id=food_agnello_cotto \
  --name-it="Agnello, cotto" \
  --matrix-id=agnello_cotto --matrix-description-it="Agnello, cotto" \
  --baseline-cooking-state=cooked --analogy-food-id=food_agnello_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174339 --food-id=food_agnello_cotto \
  --name-it="Agnello, cotto" \
  --matrix-id=agnello_cotto --matrix-description-it="Agnello, cotto" \
  --baseline-cooking-state=cooked --analogy-food-id=food_agnello_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Verza, cotta (bollita, con sale) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_verza_cotta`. FDC ID 168516 (SR Legacy, "Cabbage, savoy, cooked, boiled, drained, with salt"). Distinta da `food_verza_raw` (cruda, già eseguita sul DB reale) — stesso alimento, forma cotta. **Solo la variante "with salt" ha un FDC ID verificabile** su getfoodfacts.com: la variante "without salt" è citata da recipal.com/bodbot.com ma senza FDC ID numerico esplicito. Sodio (260mg/100g) non è uno dei 17 nutrienti tracciati, non inquina i valori usati.
- **Nutrienti**: **14/17 — mancano vitamina K, beta-carotene e altri carotenoidi provitaminici A**, non riportati nella pagina (la pagina mostra solo Vitamina A RAE aggregata, 44,0µg/100g, non le singole frazioni) — gap dichiarato, non stimato. Acido folico 0µg esplicito, separato dal folato totale (46,0µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com (FDC ID 168516, dataType SR Legacy).
- **Analogia usata**: `food_verza_raw` (verza cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura; eredita `matrix_category_calcium=NULL` dal crudo).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `verza_cotta` ("Verza, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stesso trattamento della riga crudo sorella), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non zero esplicito, vedi gap sopra), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Brassicaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168516 --food-id=food_verza_cotta \
  --name-it="Verza, cotta (bollita, con sale)" \
  --matrix-id=verza_cotta --matrix-description-it="Verza, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_verza_raw \
  --botanical-family=Brassicaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168516 --food-id=food_verza_cotta \
  --name-it="Verza, cotta (bollita, con sale)" \
  --matrix-id=verza_cotta --matrix-description-it="Verza, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_verza_raw \
  --botanical-family=Brassicaceae --diet-category=plant_non_fruit --apply
```

### Bietole da costa, cotte (bollite, con sale) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 15)

- **food_id**: `food_bietole_da_costa_cotte`. FDC ID 169343 (SR Legacy, "Chard, swiss, cooked, boiled, drained, with salt"). Distinte da `food_bietole_da_costa_raw` (crude, già eseguite sul DB reale) — stesso alimento, forma cotta. **Solo la variante "with salt" ha un FDC ID verificabile** su getfoodfacts.com: la variante "without salt" è citata da recipal.com/bodbot.com/fitbit.com ma senza un FDC ID numerico esplicito su nessuna di quelle pagine — stesso tipo di scelta già fatta per peperoni rossi e riportata nella coda. Il sodio (415mg/100g) non è uno dei 17 nutrienti tracciati da questo progetto, quindi non inquina i valori usati.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (9,00µg/100g) — nessuna firma di arricchimento. Vitamina K (327µg/100g) e beta-carotene (3.652µg/100g) presenti ed elevati, coerenti con una verdura a foglia verde. Fonte: getfoodfacts.com (FDC ID 169343, dataType SR Legacy).
- **Analogia usata**: `food_bietole_da_costa_raw` (bietole da costa crude, già eseguite sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura; eredita `matrix_category_calcium=NULL` dal crudo, non `high_oxalate` dell'analogia spinaci usata per il crudo, per restare coerente con la riga sorella già nel DB).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `bietole_da_costa_cotte` ("Bietole da costa, cotte").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stesso trattamento della riga crudo sorella), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene presente), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Amaranthaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169343 --food-id=food_bietole_da_costa_cotte \
  --name-it="Bietole da costa, cotte (bollite, con sale)" \
  --matrix-id=bietole_da_costa_cotte --matrix-description-it="Bietole da costa, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_bietole_da_costa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaranthaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169343 --food-id=food_bietole_da_costa_cotte \
  --name-it="Bietole da costa, cotte (bollite, con sale)" \
  --matrix-id=bietole_da_costa_cotte --matrix-description-it="Bietole da costa, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_bietole_da_costa_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaranthaceae \
  --diet-category=plant_non_fruit --apply
```

### Carciofi, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_carciofi_cotti`. FDC ID 168386 (SR Legacy, "Artichokes, (globe or french), cooked, boiled, drained, without salt"). Distinto da `food_carciofi_raw` (crudi, già eseguiti sul DB reale) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (89,0µg/100g) — nessuna firma di arricchimento. Tutti i valori dichiarati da un'unica fonte SR Legacy sulla pagina, nessuna mescolanza con altri database. Fonte: getfoodfacts.com (FDC ID 168386, dataType SR Legacy).
- **Analogia usata**: `food_carciofi_raw` (carciofi crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `carciofi_cotti` ("Carciofi, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene 8,00µg/100g presente, stessa convenzione delle altre verdure cotte di questo lotto), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Asteraceae` (famiglia botanica reale del carciofo, *Cynara cardunculus*), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168386 --food-id=food_carciofi_cotti \
  --name-it="Carciofi, cotti (bolliti)" \
  --matrix-id=carciofi_cotti --matrix-description-it="Carciofi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_carciofi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asteraceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168386 --food-id=food_carciofi_cotti \
  --name-it="Carciofi, cotti (bolliti)" \
  --matrix-id=carciofi_cotti --matrix-description-it="Carciofi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_carciofi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asteraceae \
  --diet-category=plant_non_fruit --apply
```

### Patata dolce, cotta (al forno) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_patata_dolce_cotta`. FDC ID 170134 (SR Legacy, "Sweet potato, cooked, baked in skin, flesh, with salt"). Distinta da `food_patata_dolce_raw` (cruda, già eseguita sul DB reale, FDC 168482) — stesso alimento, forma cotta.
- **Nutrienti**: **15/17 — ATTENZIONE, gap significativo**: mancano **beta-carotene e gli altri carotenoidi provitaminici A**, non riportati in nessuna delle due fonti indipendenti consultate (getfoodfacts.com e recipal.com), nonostante la patata dolce sia notoriamente uno degli alimenti vegetali più ricchi di vitamina A. Gap dichiarato e NON stimato, stesso trattamento già dato a `food_farro_raw` per l'energia mancante — **questo alimento, se inserito, resta `draft` e non va usato per calcolare l'assunzione di vitamina A finché il gap non è risolto da un'altra fonte**. Acido folico 0µg esplicito. Sodio 246mg/100g (sale aggiunto durante la cottura in forno con buccia, consuetudine USA) — non è uno dei 17 nutrienti tracciati da questo progetto, quindi non inquina i valori usati; non è stato trovato un record "without salt" con FDC ID verificabile (solo un NDB ID 11508 su recipal.com, senza FDC ID). Fonte: getfoodfacts.com (FDC ID 170134, dataType SR Legacy), cross-verificata con recipal.com per gli altri nutrienti (valori per 100g coerenti).
- **Analogia usata**: `food_patata_dolce_raw` (patata dolce cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (tubero).
- **Matrice**: nuova `patata_dolce_cotta` ("Patata dolce, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non zero esplicito, vedi gap sopra), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Convolvulaceae` (famiglia botanica reale della patata dolce, diversa dalla patata comune Solanaceae — stessa nota già fatta per il crudo), `baseline_cooking_state=baked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170134 --food-id=food_patata_dolce_cotta \
  --name-it="Patata dolce, cotta (al forno, con buccia)" \
  --matrix-id=patata_dolce_cotta --matrix-description-it="Patata dolce, cotta" \
  --baseline-cooking-state=baked --analogy-food-id=food_patata_dolce_raw \
  --botanical-family=Convolvulaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170134 --food-id=food_patata_dolce_cotta \
  --name-it="Patata dolce, cotta (al forno, con buccia)" \
  --matrix-id=patata_dolce_cotta --matrix-description-it="Patata dolce, cotta" \
  --baseline-cooking-state=baked --analogy-food-id=food_patata_dolce_raw \
  --botanical-family=Convolvulaceae --diet-category=plant_non_fruit --apply
```

### Cavolfiore, cotto (bollito) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_cavolfiore_cotto`. FDC ID 170397 (SR Legacy, "Cauliflower, cooked, boiled, drained, without salt"). **Non** è la forma cotta di un `food_cavolfiore_raw` che non esiste nel DB: il crudo resta ⚠ (match debole, 12/17 nutrienti, 3 valori di energia discordanti sulla stessa pagina — vedi coda PRD). Questo record cotto è un record FDC diverso e indipendente, non ereditato dal crudo.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (44,0µg/100g) — nessuna firma di arricchimento. Un solo valore di energia dichiarato (23,0 kcal/100g), coerente su tutta la pagina — a differenza del crudo. Unica incongruenza minore: il calcolo Atwater dai macronutrienti dichiarati darebbe ~28kcal invece di 23kcal — uno scostamento dello stesso tipo (arrotondamento/metodo "carboidrati per differenza") già visto altrove in questa coda (es. orzo perlato cotto), non bloccante. Fonte: getfoodfacts.com (FDC ID 170397, dataType SR Legacy).
- **Analogia usata**: `food_broccoli_boiled` (broccoli bolliti, già nei 30 alimenti originali del Golden Set, quindi reale nel DB — stessa famiglia botanica reale Brassicaceae, stesso stato di cottura. NON uso il crudo del cavolfiore come analogia: non esiste nel DB, resta solo ⚠).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cavolfiore_cotto` ("Cavolfiore, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL, stesso trattamento di `food_broccoli_boiled`), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene 7,00µg/100g presente), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Brassicaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170397 --food-id=food_cavolfiore_cotto \
  --name-it="Cavolfiore, cotto (bollito)" \
  --matrix-id=cavolfiore_cotto --matrix-description-it="Cavolfiore, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_broccoli_boiled \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170397 --food-id=food_cavolfiore_cotto \
  --name-it="Cavolfiore, cotto (bollito)" \
  --matrix-id=cavolfiore_cotto --matrix-description-it="Cavolfiore, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_broccoli_boiled \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Brassicaceae \
  --diet-category=plant_non_fruit --apply
```

### Cipolle, cotte (bollite) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_cipolle_cotte`. FDC ID 170001 (SR Legacy, "Onions, cooked, boiled, drained, without salt"). Distinte da `food_onion_raw` (crude, già eseguite sul DB reale) — stesso alimento, forma cotta. **Nome aggiornato rispetto alla coda**: la voce indicava "stufate", ma in questo run è stato cercato solo il metodo bollito (nessuna ricerca dedicata per uno stufato con grassi aggiunti, che avrebbe un profilo diverso).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (15,0µg/100g) — nessuna firma di arricchimento. Calcio 22mg/100g nella norma. Fonte: getfoodfacts.com (FDC ID 170001, dataType SR Legacy).
- **Analogia usata**: `food_onion_raw` (cipolle crude, già eseguite sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cipolle_cotte` ("Cipolle, cotte").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene 1,00µg/100g presente anche se basso, stessa convenzione delle altre verdure cotte di questo lotto), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Amaryllidaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170001 --food-id=food_cipolle_cotte \
  --name-it="Cipolle, cotte (bollite)" \
  --matrix-id=cipolle_cotte --matrix-description-it="Cipolle, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaryllidaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170001 --food-id=food_cipolle_cotte \
  --name-it="Cipolle, cotte (bollite)" \
  --matrix-id=cipolle_cotte --matrix-description-it="Cipolle, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaryllidaceae \
  --diet-category=plant_non_fruit --apply
```

### Peperoni rossi, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_peperoni_rossi_cotti`. FDC ID 170515 (SR Legacy, "Peppers, sweet, red, cooked, boiled, drained, with salt"). Distinti da `food_pepper_red_raw` (crudi, già eseguiti sul DB reale) — stesso alimento, forma cotta. **Nome aggiornato rispetto alla coda**: la voce indicava "arrostiti", ma nessun record FDC per peperoni arrostiti è stato trovato in questo run; usato il record bollito.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (16,0µg/100g) — nessuna firma di arricchimento. **Nota sul sale**: solo la variante "with salt" risulta indicizzata su getfoodfacts.com con un FDC ID verificabile (sodio 238mg/100g); non è stato trovato un FDC ID verificabile per una variante "without salt" (solo un NDB ID 11823 su recipal.com, senza corrispondenza FDC diretta). Il sodio non è uno dei 17 nutrienti tracciati da questo progetto; inoltre i valori di vitamina C (171mg) e folato (16µg) coincidono quasi esattamente con la stima indipendente "without salt" di recipal.com, a conferma che il sale aggiunto non altera i nutrienti tracciati. Fonte: getfoodfacts.com (FDC ID 170515, dataType SR Legacy).
- **Analogia usata**: `food_pepper_red_raw` (peperoni rossi crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura, ortaggio botanicamente "frutto" come da definizione PRD §4.9).
- **Matrice**: nuova `peperoni_rossi_cotti` ("Peperoni rossi, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene 1525µg/100g, valore alto), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Solanaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170515 --food-id=food_peperoni_rossi_cotti \
  --name-it="Peperoni rossi, cotti (bolliti)" \
  --matrix-id=peperoni_rossi_cotti --matrix-description-it="Peperoni rossi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pepper_red_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170515 --food-id=food_peperoni_rossi_cotti \
  --name-it="Peperoni rossi, cotti (bolliti)" \
  --matrix-id=peperoni_rossi_cotti --matrix-description-it="Peperoni rossi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pepper_red_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Melanzane, cotte (bollite) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_melanzane_cotte`. FDC ID 169229 (SR Legacy, "Eggplant, cooked, boiled, drained, without salt"). Distinte da `food_melanzane_raw` (crude, già eseguite sul DB reale, FDC 169228) — stesso alimento, forma cotta. **Nome aggiornato rispetto alla coda**: la voce indicava "grigliate", ma nessun record FDC per melanzane grigliate è stato trovato in questo run; usato il record bollito, unico disponibile e completo.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (14,0µg/100g) — nessuna firma di arricchimento. Calcio 6mg/100g basso, coerente con la verdura cruda già eseguita. Fonte: getfoodfacts.com (FDC ID 169229, dataType SR Legacy).
- **Analogia usata**: `food_melanzane_raw` (melanzane crude, già eseguite sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura, ortaggio botanicamente "frutto" come da definizione PRD §4.9).
- **Matrice**: nuova `melanzane_cotte` ("Melanzane, cotte").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene 22,0µg/100g presente), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Solanaceae`, `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169229 --food-id=food_melanzane_cotte \
  --name-it="Melanzane, cotte (bollite)" \
  --matrix-id=melanzane_cotte --matrix-description-it="Melanzane, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_melanzane_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169229 --food-id=food_melanzane_cotte \
  --name-it="Melanzane, cotte (bollite)" \
  --matrix-id=melanzane_cotte --matrix-description-it="Melanzane, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_melanzane_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Solanaceae \
  --diet-category=plant_non_fruit --apply
```

### Pasta integrale, cotta (bollita, non arricchita) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 14)

- **food_id**: `food_pasta_integrale_cotta`. FDC ID 168910 (SR Legacy, "Pasta, whole-wheat, cooked (Includes foods for USDA's Food Distribution Program)"). Distinta da `food_pasta_integrale_raw` (cruda/secca, già "pronta" ma non ancora eseguita, FDC 169738, stessa coppia del settimo lotto) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Acido folico (folic acid) riportato come voce separata dal folato totale (21,0µg/100g), con valore **0µg esplicito** — nessuna firma di arricchimento in stile USA, coerente col crudo già valutato. Calcio 13,0mg/100g, magnesio 54,0mg/100g: entrambi nella norma per una pasta integrale non arricchita, nessun segno di propionato di calcio o additivi industriali (lo stesso tipo di segnale già usato per scartare "pane comune"/"pane integrale" in questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168910 e dataType SR Legacy.
- **Analogia usata**: `food_pasta_enriched_cooked` (pasta cotta arricchita, già nei 30 alimenti originali del Golden Set, quindi già reale nel DB — stessa categoria "pasta cotta", stessa famiglia Poaceae; differisce solo per `is_fortified_folate`, qui `false` invece di `true`, stesso schema già usato dal crudo `food_pasta_integrale_raw` con `food_pasta_enriched_dry`. NON uso `food_pasta_integrale_raw` come analogia: è solo "pronto", non ancora eseguito sul DB reale, e l'analogia deve riferirsi a un alimento che esiste davvero.).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `pasta_integrale_cotta` ("Pasta integrale, cotta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 2,00µg/100g molto basso, stesso trattamento già usato per orzo/riso cotti in questo lotto), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Poaceae` (grano, stessa famiglia del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false — nessuna fortificazione).

```
npm run add-food -- --fdc-id=168910 --food-id=food_pasta_integrale_cotta \
  --name-it="Pasta integrale, cotta (bollita, non arricchita)" \
  --matrix-id=pasta_integrale_cotta --matrix-description-it="Pasta integrale, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pasta_enriched_cooked \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168910 --food-id=food_pasta_integrale_cotta \
  --name-it="Pasta integrale, cotta (bollita, non arricchita)" \
  --matrix-id=pasta_integrale_cotta --matrix-description-it="Pasta integrale, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_pasta_enriched_cooked \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Funghi champignon, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_funghi_champignon_cotti`. FDC ID 169252 (SR Legacy, "Mushrooms, white, cooked, boiled, drained, without salt"). Distinti da `food_mushroom_white_raw` (crudi, già eseguiti, FDC 169251) — stesso alimento, forma cotta. **Nome cambiato rispetto alla coda**: la voce di coda indicava "cotti (saltati)", ma nessun record FDC per funghi champignon saltati/stir-fried con copertura nutrienti pulita è stato cercato/trovato in questo run — il record SR Legacy disponibile e completo è "boiled, drained" (bolliti, non saltati in padella con grassi aggiunti, che avrebbe un profilo di grassi diverso). Nome aggiornato di conseguenza per non rappresentare un metodo di cottura diverso da quello realmente misurato.
- **Nutrienti**: **17/17**. Beta-carotene e altri carotenoidi provitaminici A tutti a 0 — coerente col crudo, che non aveva `--carotenoid-matrix-state` impostato per lo stesso motivo (i funghi non sintetizzano carotenoidi provitaminici A in quantità significative). Fonte: getfoodfacts.com (FDC ID 169252, dataType SR Legacy); una fonte alternativa (foodstruct.com) è stata scartata per un'incongruenza nell'URL/slug della pagina (mostrava contenuto sui funghi bianchi ma uno slug "mushrooms-shiitake-raw" — segnale di pagina non affidabile).
- **Analogia usata**: `food_mushroom_white_raw` (funghi champignon crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (fungo, non pianta — stesso trattamento già usato per il crudo: nessuna famiglia botanica).
- **Matrice**: nuova `funghi_champignon_cotti` ("Funghi champignon, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, coerente col crudo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — i funghi non sono piante, stesso trattamento del crudo), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169252 --food-id=food_funghi_champignon_cotti \
  --name-it="Funghi champignon, cotti (bolliti)" \
  --matrix-id=funghi_champignon_cotti --matrix-description-it="Funghi champignon, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169252 --food-id=food_funghi_champignon_cotti \
  --name-it="Funghi champignon, cotti (bolliti)" \
  --matrix-id=funghi_champignon_cotti --matrix-description-it="Funghi champignon, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit --apply
```

### Sedano, cotto (bollito) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_sedano_cotto`. FDC ID 169989 (SR Legacy, "Celery, cooked, boiled, drained, without salt"). Distinto da `food_sedano_raw` (crudo, già eseguito, FDC 169988) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 313µg/100g, folato 33,0µg/100g, vitamina K 37,8µg/100g. **Attenzione dichiarata**: la variante "with salt" dello stesso alimento (FDC 169342, anch'essa SR Legacy) riporta valori non-sodio sensibilmente diversi (folato 22,0µg/100g, beta-carotene 235µg/100g, vitamina K 28,4µg/100g — circa 30% in meno su tutti e tre), a differenza di porri/fagiolini dove le varianti con/senza sale hanno valori non-sodio pressoché identici. Sembra una reale discrepanza fra due basi analitiche USDA per il sedano cotto, non un problema di lettura da parte mia. Uso comunque FDC 169989 ("without salt", coerente con la preferenza già adottata in questa coda), ma segnalo la discrepanza qui per trasparenza: se in futuro serve citare con più sicurezza folato/beta-carotene/vit.K del sedano cotto, andrebbe verificata direttamente la pagina FDC ufficiale (non raggiungibile da questa sessione). Fonte: getfoodfacts.com (FDC ID 169989, dataType SR Legacy).
- **Analogia usata**: `food_sedano_raw` (sedano crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `sedano_cotto` ("Sedano, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo, coerente col crudo che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Apiaceae` (stessa famiglia botanica reale del sedano crudo e delle carote), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169989 --food-id=food_sedano_cotto \
  --name-it="Sedano, cotto (bollito)" \
  --matrix-id=sedano_cotto --matrix-description-it="Sedano, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_sedano_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Apiaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169989 --food-id=food_sedano_cotto \
  --name-it="Sedano, cotto (bollito)" \
  --matrix-id=sedano_cotto --matrix-description-it="Sedano, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_sedano_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Apiaceae \
  --diet-category=plant_non_fruit --apply
```

### Porri, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_porri_cotti`. FDC ID 168426 (SR Legacy, "Leeks, (bulb and lower leaf-portion), cooked, boiled, drained, without salt"). Distinti da `food_porri_raw` (crudi, già eseguiti, FDC 169246) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Beta-carotene 487µg/100g, coerente con un ortaggio a foglia/bulbo. Fonte: getfoodfacts.com (FDC ID 168426, dataType SR Legacy).
- **Analogia usata**: `food_porri_raw` (porri crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `porri_cotti` ("Porri, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo, coerente con il crudo che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Amaryllidaceae` (stessa famiglia botanica reale di aglio/cipolla/scalogno già nel DB), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168426 --food-id=food_porri_cotti \
  --name-it="Porri, cotti (bolliti)" \
  --matrix-id=porri_cotti --matrix-description-it="Porri, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_porri_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaryllidaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168426 --food-id=food_porri_cotti \
  --name-it="Porri, cotti (bolliti)" \
  --matrix-id=porri_cotti --matrix-description-it="Porri, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_porri_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaryllidaceae \
  --diet-category=plant_non_fruit --apply
```

### Fagiolini, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_fagiolini_cotti`. FDC ID 169141 (SR Legacy, "Beans, snap, green, cooked, boiled, drained, without salt"). Distinti da `food_fagiolini_raw` (crudi, già eseguiti, FDC 169961) — stesso alimento, forma cotta. Scelta la variante "without salt" (esiste anche "with salt", FDC 169321, valori non-sodio identici).
- **Nutrienti**: **17/17**. Beta-carotene 380µg/100g e alfa-carotene 70,0µg/100g (quest'ultimo confluisce in `other_provitamin_a_carotenoids_mcg`) — unico fra i 9 alimenti di questo turno con un valore non-zero per questo campo, coerente con fagiolini crudi (verdura verde con carotenoidi misti). Fonte: getfoodfacts.com (FDC ID 169141, dataType SR Legacy).
- **Analogia usata**: `food_fagiolini_raw` (fagiolini crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura/legume a baccello).
- **Matrice**: nuova `fagiolini_cotti` ("Fagiolini, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene e alfa-carotene significativi, coerente con i crudi che hanno `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Fabaceae` (stessa famiglia botanica reale dei legumi), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169141 --food-id=food_fagiolini_cotti \
  --name-it="Fagiolini, cotti (bolliti)" \
  --matrix-id=fagiolini_cotti --matrix-description-it="Fagiolini, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagiolini_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169141 --food-id=food_fagiolini_cotti \
  --name-it="Fagiolini, cotti (bolliti)" \
  --matrix-id=fagiolini_cotti --matrix-description-it="Fagiolini, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_fagiolini_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Fabaceae \
  --diet-category=plant_non_fruit --apply
```

### Asparagi, cotti (bolliti) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_asparagi_cotti`. FDC ID 168390 (SR Legacy, "Asparagus, cooked, boiled, drained"). Distinti da `food_asparagi_raw` (crudi, già eseguiti, FDC 168389) — stesso alimento, forma cotta. Record base/senza sale (esiste una variante surgelata con sale, FDC 168494, non rilevante qui).
- **Nutrienti**: **17/17**. Beta-carotene 604µg/100g (coerente con un ortaggio verde, vicino al valore del crudo). Fonte: getfoodfacts.com (FDC ID 168390, dataType SR Legacy).
- **Analogia usata**: `food_asparagi_raw` (asparagi crudi, già eseguiti sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `asparagi_cotti` ("Asparagi, cotti").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Asparagaceae` (famiglia botanica reale dell'asparago, *Asparagus officinalis* — diversa da Apiaceae usata per l'analogia funzionale carote/sedano), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168390 --food-id=food_asparagi_cotti \
  --name-it="Asparagi, cotti (bolliti)" \
  --matrix-id=asparagi_cotti --matrix-description-it="Asparagi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_asparagi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asparagaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168390 --food-id=food_asparagi_cotti \
  --name-it="Asparagi, cotti (bolliti)" \
  --matrix-id=asparagi_cotti --matrix-description-it="Asparagi, cotti" \
  --baseline-cooking-state=boiled --analogy-food-id=food_asparagi_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Asparagaceae \
  --diet-category=plant_non_fruit --apply
```

### Zucchine, cotte (bollite) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_zucchine_cotte`. FDC ID 169292 (SR Legacy, "Squash, summer, zucchini, includes skin, cooked, boiled, drained, without salt"). Distinta da `food_zucchine_raw` (crude, già eseguite, FDC 169291) — stesso alimento, forma cotta. Scelta la variante "without salt" (esiste anche una "with salt", FDC 170534, con valori non-sodio praticamente identici — "without salt" preferita per coerenza con le altre voci già eseguite in questa coda).
- **Nutrienti**: **17/17**. Beta-carotene 670µg/100g (coerente, alto come nel crudo). Fonte: getfoodfacts.com (FDC ID 169292, dataType SR Legacy), cross-verificata con foodstruct.com.
- **Analogia usata**: `food_zucchine_raw` (zucchine crude, già eseguite sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente frutto, trattato come tale per il PRD).
- **Matrice**: nuova `zucchine_cotte` ("Zucchine, cotte").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `--carotenoid-matrix-state=cooked_or_disrupted` (beta-carotene significativo, coerente con la cruda che ha `raw_intact`), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Cucurbitaceae` (stessa famiglia botanica reale della zucchina cruda), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169292 --food-id=food_zucchine_cotte \
  --name-it="Zucchine, cotte (bollite)" \
  --matrix-id=zucchine_cotte --matrix-description-it="Zucchine, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_zucchine_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169292 --food-id=food_zucchine_cotte \
  --name-it="Zucchine, cotte (bollite)" \
  --matrix-id=zucchine_cotte --matrix-description-it="Zucchine, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_zucchine_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Cucurbitaceae \
  --diet-category=plant_non_fruit --apply
```

### Orzo perlato, cotto (bollito) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_orzo_perlato_cotto`. FDC ID 170285 (SR Legacy, "Barley, pearled, cooked"). Distinto da `food_orzo_perlato_raw` (crudo, già eseguito, FDC 170284) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (16,0µg/100g) — nessuna firma di arricchimento (coerente col crudo). Beta-carotene 5,00µg/100g basso. Lieve incoerenza interna sulla pagina fonte (etichetta arrotondata 190kcal/tazza vs tabella dettagliata 193kcal/tazza — solo arrotondamento, non un problema di sourcing). Fonte: getfoodfacts.com (FDC ID 170285, dataType SR Legacy).
- **Analogia usata**: `food_orzo_perlato_raw` (orzo perlato crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `orzo_perlato_cotto` ("Orzo perlato, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene molto basso, coerente col crudo che non lo aveva impostato), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Poaceae` (famiglia botanica reale dell'orzo, *Hordeum vulgare*), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170285 --food-id=food_orzo_perlato_cotto \
  --name-it="Orzo perlato, cotto (bollito)" \
  --matrix-id=orzo_perlato_cotto --matrix-description-it="Orzo perlato, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_orzo_perlato_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=170285 --food-id=food_orzo_perlato_cotto \
  --name-it="Orzo perlato, cotto (bollito)" \
  --matrix-id=orzo_perlato_cotto --matrix-description-it="Orzo perlato, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_orzo_perlato_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Riso integrale, cotto (bollito) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_riso_integrale_cotto`. FDC ID 169704 (SR Legacy, "Rice, brown, long-grain, cooked (Includes foods for USDA's Food Distribution Program)"). Distinto da `food_riso_integrale_raw` (crudo, già eseguito, FDC 169703) — stesso alimento, forma cotta. Nessun record SR Legacy "generico" (senza la dicitura FDP) trovato: stessa famiglia di descrizione già vista per il crudo (FDC 169703 ha la stessa dicitura "Includes foods for USDA's Food Distribution Program" senza che questo implichi arricchimento — è solo una nota di programma di distribuzione USDA, non un additivo).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (9,00µg/100g) — nessuna firma di arricchimento (coerente col crudo, già verificato "unenriched"). Calcio 3,0mg/100g basso, coerente con un cereale integrale non trattato. Fonte: getfoodfacts.com (FDC ID 169704, dataType SR Legacy), cross-verificata con foodstruct.com e myfooddata.com (stesso FDC ID, stessa descrizione).
- **Analogia usata**: `food_riso_integrale_raw` (riso integrale crudo, già eseguito sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `riso_integrale_cotto` ("Riso integrale, cotto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, coerente col crudo che non lo aveva impostato), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Poaceae` (famiglia botanica reale del riso, *Oryza sativa*), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169704 --food-id=food_riso_integrale_cotto \
  --name-it="Riso integrale, cotto (bollito)" \
  --matrix-id=riso_integrale_cotto --matrix-description-it="Riso integrale, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_riso_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169704 --food-id=food_riso_integrale_cotto \
  --name-it="Riso integrale, cotto (bollito)" \
  --matrix-id=riso_integrale_cotto --matrix-description-it="Riso integrale, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_riso_integrale_raw \
  --botanical-family=Poaceae --diet-category=plant_non_fruit --apply
```

### Quinoa, cotta (bollita) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 13)

- **food_id**: `food_quinoa_cotta`. FDC ID 168917 (SR Legacy, "Quinoa, cooked"). Distinta da `food_quinoa_dry_raw` (secca/cruda, già eseguita, FDC 168874) — stesso alimento, forma cotta.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (42,0µg/100g) — nessuna firma di arricchimento. Beta-carotene 3,00µg/100g (basso ma non assente, coerente col valore non-zero già riportato per la quinoa cruda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168917 e dataType SR Legacy.
- **Analogia usata**: `food_quinoa_dry_raw` (quinoa secca/cruda, già eseguita sul DB reale — stesso alimento, stesso trattamento categorico, differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (cereale/pseudocereale).
- **Matrice**: nuova `quinoa_cotta` ("Quinoa, cotta").
- **Attributi**: `is_heme_iron` omesso (false, alimento vegetale), `matrix_category_calcium` omesso (NULL — stesso trattamento di carote/broccoli/patate: le categorie ossalati esistono solo per spinaci/kale/latte), `--carotenoid-matrix-state=cooked_or_disrupted` (coerente col fatto che la quinoa cruda ha `raw_intact` impostato, essendo presente un beta-carotene non nullo), `zinc_bioaccessibility_bucket` default `none`, `--botanical-family=Amaranthaceae` (famiglia botanica reale di *Chenopodium quinoa*, oggi inclusa in Amaranthaceae), `baseline_cooking_state=boiled`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168917 --food-id=food_quinoa_cotta \
  --name-it="Quinoa, cotta (bollita)" \
  --matrix-id=quinoa_cotta --matrix-description-it="Quinoa, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_quinoa_dry_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaranthaceae \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168917 --food-id=food_quinoa_cotta \
  --name-it="Quinoa, cotta (bollita)" \
  --matrix-id=quinoa_cotta --matrix-description-it="Quinoa, cotta" \
  --baseline-cooking-state=boiled --analogy-food-id=food_quinoa_dry_raw \
  --carotenoid-matrix-state=cooked_or_disrupted --botanical-family=Amaranthaceae \
  --diet-category=plant_non_fruit --apply
```

### Cozze, cotte (al vapore) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_cozze_cotte`. FDC ID 174217 (SR Legacy, "Mollusks, mussel, blue, cooked, moist heat"). Distinto da `food_cozze_raw` (crude, già eseguite, FDC 174216) — stesso mollusco, forma cotta.
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dal record, non riportati a zero; plausibile per un mollusco, non un'anomalia — stesso tipo di gap già visto per granchio/ostriche in questa coda). Acido folico 0µg esplicito, separato dal folato totale (76,0µg/100g) — nessuna firma di arricchimento. Vitamina B12 24,0µg/100g e selenio 89,6µg/100g alti ma tipici per un mollusco cotto (concentrazione per perdita d'acqua in cottura, coerente con i valori crudi già eseguiti). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174217 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_cozze_raw` (cozze crude, già eseguite sul DB reale — stesso mollusco, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `cozze_cotte` ("Cozze, cotte").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_cozze_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=boiled` (cottura "moist heat" = al vapore/in acqua), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174217 --food-id=food_cozze_cotte \
  --name-it="Cozze, cotte (al vapore)" \
  --matrix-id=cozze_cotte --matrix-description-it="Cozze, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cozze_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174217 --food-id=food_cozze_cotte \
  --name-it="Cozze, cotte (al vapore)" \
  --matrix-id=cozze_cotte --matrix-description-it="Cozze, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_cozze_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Vongole, cotte (al vapore) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_vongole_cotte`. FDC ID 171975 (SR Legacy, "Mollusks, clam, mixed species, cooked, moist heat"). Distinto da `food_vongole_raw` (crude, già eseguite, FDC 174214) — stesso mollusco, forma cotta.
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dal record, non riportati a zero; stesso tipo di gap già visto per granchio/ostriche in questa coda). Acido folico 0µg esplicito, separato dal folato totale (29,0µg/100g) — nessuna firma di arricchimento. Vitamina B12 98,9µg/100g molto alta ma nota caratteristica delle vongole (valore noto in letteratura, non un'anomalia). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171975 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vongole_raw` (vongole crude, già eseguite sul DB reale — stesso mollusco, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `vongole_cotte` ("Vongole, cotte").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_vongole_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=boiled` (cottura "moist heat"), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171975 --food-id=food_vongole_cotte \
  --name-it="Vongole, cotte (al vapore)" \
  --matrix-id=vongole_cotte --matrix-description-it="Vongole, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171975 --food-id=food_vongole_cotte \
  --name-it="Vongole, cotte (al vapore)" \
  --matrix-id=vongole_cotte --matrix-description-it="Vongole, cotte" \
  --baseline-cooking-state=boiled --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Pesce spada, cotto (calore secco) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_pesce_spada_cotto`. FDC ID 173704 (SR Legacy, "Fish, swordfish, cooked, dry heat"). Distinto da `food_pesce_spada_raw` (crudo, già eseguito, FDC 173703) — stesso pesce, forma cotta "dry heat" (calore secco, es. griglia/forno senza liquido), stessa convenzione già usata per `food_salmon_cooked` nel Golden Set originale e per `food_merluzzo_cotto` in questa coda.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (2,00µg/100g) — nessuna firma di arricchimento. Selenio 68,5µg/100g alto ma tipico per un pesce di grossa taglia come il pesce spada (coerente con valori noti in letteratura). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173704 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_pesce_spada_raw` (pesce spada crudo, già eseguito sul DB reale — stesso pesce, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `pesce_spada_cotto` ("Pesce spada, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_pesce_spada_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173704 --food-id=food_pesce_spada_cotto \
  --name-it="Pesce spada, cotto (calore secco)" \
  --matrix-id=pesce_spada_cotto --matrix-description-it="Pesce spada, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_pesce_spada_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=173704 --food-id=food_pesce_spada_cotto \
  --name-it="Pesce spada, cotto (calore secco)" \
  --matrix-id=pesce_spada_cotto --matrix-description-it="Pesce spada, cotto" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_pesce_spada_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Polpo, cotto (bollito) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_polpo_cotto`. FDC ID 174249 (SR Legacy, "Mollusks, octopus, common, cooked, moist heat"). Distinto da `food_polpo_raw` (crudo, già eseguito, FDC 174218) — stesso mollusco, forma cotta.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (24,0µg/100g) — nessuna firma di arricchimento. Vitamina B12 36,0µg/100g e selenio 89,6µg/100g alti ma tipici per un mollusco cotto (concentrazione per perdita d'acqua in cottura). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174249 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_polpo_raw` (polpo crudo, già eseguito sul DB reale — stesso mollusco, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `polpo_cotto` ("Polpo, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_polpo_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=boiled` (cottura "moist heat"), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174249 --food-id=food_polpo_cotto \
  --name-it="Polpo, cotto (bollito)" \
  --matrix-id=polpo_cotto --matrix-description-it="Polpo, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_polpo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174249 --food-id=food_polpo_cotto \
  --name-it="Polpo, cotto (bollito)" \
  --matrix-id=polpo_cotto --matrix-description-it="Polpo, cotto" \
  --baseline-cooking-state=boiled --analogy-food-id=food_polpo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Vitello, cotto — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_vitello_cotto`. FDC ID 175265 (SR Legacy, "Veal, composite of trimmed retail cuts, separable lean only, cooked"). Distinto da `food_vitello_raw` (crudo, già eseguito, FDC 173817) — stesso taglio composito, forma cotta. Il record FDC non specifica il metodo di cottura oltre "cooked" (a differenza di tacchino/maiale che specificano "roasted"): `baseline_cooking_state` riflette fedelmente questo, senza inventare un metodo non dichiarato.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (16,0µg/100g) — nessuna firma di arricchimento. Calcio 24,0mg/100g, nella norma per una carne magra cotta (coerente con il crudo già eseguito). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175265 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vitello_raw` (vitello crudo, già eseguito sul DB reale — stesso taglio composito, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `vitello_cotto` ("Vitello, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_vitello_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=cooked` (metodo non specificato nel record FDC), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175265 --food-id=food_vitello_cotto \
  --name-it="Vitello, cotto" \
  --matrix-id=vitello_cotto --matrix-description-it="Vitello, cotto" \
  --baseline-cooking-state=cooked --analogy-food-id=food_vitello_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175265 --food-id=food_vitello_cotto \
  --name-it="Vitello, cotto" \
  --matrix-id=vitello_cotto --matrix-description-it="Vitello, cotto" \
  --baseline-cooking-state=cooked --analogy-food-id=food_vitello_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Lonza di maiale, cotta (arrosto) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_lonza_di_maiale_cotta`. FDC ID 168233 (SR Legacy, "Pork, fresh, loin, whole, separable lean only, cooked, roasted"). Distinto da `food_lonza_di_maiale_raw` (cruda, già eseguita, FDC 168230) — stesso taglio ("loin, whole, separable lean only"), forma cotta arrosto.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (1,00µg/100g) — nessuna firma di arricchimento. Vitamina K 0µg (sia fillochinone sia diidrofillochinone), coerente con una carne magra. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168233 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_lonza_di_maiale_raw` (lonza di maiale cruda, già eseguita sul DB reale — stesso taglio, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `lonza_di_maiale_cotta` ("Lonza di maiale, cotta").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_lonza_di_maiale_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168233 --food-id=food_lonza_di_maiale_cotta \
  --name-it="Lonza di maiale, cotta (arrosto)" \
  --matrix-id=lonza_di_maiale_cotta --matrix-description-it="Lonza di maiale, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_lonza_di_maiale_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=168233 --food-id=food_lonza_di_maiale_cotta \
  --name-it="Lonza di maiale, cotta (arrosto)" \
  --matrix-id=lonza_di_maiale_cotta --matrix-description-it="Lonza di maiale, cotta" \
  --baseline-cooking-state=roasted --analogy-food-id=food_lonza_di_maiale_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Petto di tacchino, cotto (arrosto) — preparato 2026-10-15 dal task orario (ottavo lotto, turno ore 12)

- **food_id**: `food_petto_di_tacchino_cotto`. FDC ID 174516 (SR Legacy, "Turkey, retail parts, breast, meat only, cooked, roasted"). Distinto da `food_petto_di_tacchino_raw` (crudo, già eseguito, FDC 174515) — stesso taglio ("retail parts, breast, meat only"), forma cotta arrosto; FDC ID immediatamente successivo a quello del crudo, stessa voce USDA.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (9,00µg/100g) — nessuna firma di arricchimento. Vitamina B12 1,76µg/100g, selenio 30,7µg/100g: nella norma per petto di tacchino cotto. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174516 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_petto_di_tacchino_raw` (petto di tacchino crudo, già eseguito sul DB reale — stesso taglio, stesso trattamento `is_heme_iron=true`, differisce solo per stato di cottura).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `petto_di_tacchino_cotto` ("Petto di tacchino, cotto").
- **Attributi**: `--is-heme-iron` (true, stessa convenzione di `food_petto_di_tacchino_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=roasted`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174516 --food-id=food_petto_di_tacchino_cotto \
  --name-it="Petto di tacchino, cotto (arrosto)" \
  --matrix-id=petto_di_tacchino_cotto --matrix-description-it="Petto di tacchino, cotto" \
  --baseline-cooking-state=roasted --analogy-food-id=food_petto_di_tacchino_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174516 --food-id=food_petto_di_tacchino_cotto \
  --name-it="Petto di tacchino, cotto (arrosto)" \
  --matrix-id=petto_di_tacchino_cotto --matrix-description-it="Petto di tacchino, cotto" \
  --baseline-cooking-state=roasted --analogy-food-id=food_petto_di_tacchino_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Curcuma, in polvere — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 12 — chiude il lotto)

- **food_id**: `food_curcuma_raw`. FDC ID 172231 (SR Legacy, "Spices, turmeric, ground").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (20,0µg/100g) — nessuna firma di arricchimento. Ferro **55,0mg/100g**: valore estremo ma non anomalo — la curcuma è notoriamente tra le spezie più ricche di ferro (stesso ordine di grandezza del timo già lavorato in questa coda, 124mg/100g), coerente con calcio 168mg/100g e magnesio 208mg/100g, tutti alti per concentrazione da disidratazione. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg=0`, valore esplicito non assunto). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172231 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre spezie/erbe secche di questa coda; famiglia botanica Zingiberaceae dichiarata separatamente, diversa da tutte le altre spezie già lavorate in questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `curcuma` ("Curcuma in polvere").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, a differenza di pepe nero/cannella/origano/salvia/timo in questa coda dove era non-zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Zingiberaceae` (*Curcuma longa*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi.

```
npm run add-food -- --fdc-id=172231 --food-id=food_curcuma_raw \
  --name-it="Curcuma, in polvere" \
  --matrix-id=curcuma --matrix-description-it="Curcuma in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae
```
```
npm run add-food -- --fdc-id=172231 --food-id=food_curcuma_raw \
  --name-it="Curcuma, in polvere" \
  --matrix-id=curcuma --matrix-description-it="Curcuma in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae --apply
```

### Zafferano, secco — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 12)

- **food_id**: `food_zafferano_raw`. FDC ID 170934 (SR Legacy, "Spices, saffron").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (alfa-carotene e beta-criptoxantina; campi del tutto assenti dal record, non riportati a zero — gap dichiarato, sopra la soglia minima, stesso tipo di gap già visto per rosmarino/menta in questa coda). Acido folico 0µg esplicito, separato dal folato totale (93,0µg/100g) — nessuna firma di arricchimento. Vitamina C 80,8mg/100g, ferro 11,1mg/100g: alti ma coerenti con una spezia secca (stessa concentrazione da disidratazione già vista per le altre spezie di questa coda). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170934 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre spezie/erbe secche di questa coda; famiglia botanica Iridaceae dichiarata separatamente, diversa da tutte le altre spezie già lavorate in questa coda).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `zafferano` ("Zafferano").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di pepe nero/cannella/origano/salvia/timo in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Iridaceae` (*Crocus sativus*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in centesimi di grammo (è la spezia più costosa al mondo).

```
npm run add-food -- --fdc-id=170934 --food-id=food_zafferano_raw \
  --name-it="Zafferano, secco" \
  --matrix-id=zafferano --matrix-description-it="Zafferano" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Iridaceae
```
```
npm run add-food -- --fdc-id=170934 --food-id=food_zafferano_raw \
  --name-it="Zafferano, secco" \
  --matrix-id=zafferano --matrix-description-it="Zafferano" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Iridaceae --apply
```

### Pepe nero, macinato — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11, oltre la quota, ultimo del turno)

- **food_id**: `food_pepe_nero_raw`. FDC ID 170931 (SR Legacy, "Spices, pepper, black"). Nota: il record USDA non distingue macinato/in grani nel nome — le porzioni elencate in pagina coprono entrambe le forme ("1 tsp, ground" e "1 tsp, whole") con lo stesso valore per 100g, quindi rappresenta correttamente anche la forma macinata richiesta.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (17,0µg/100g) — nessuna firma di arricchimento. Calcio (443mg/100g) e ferro (9,71mg/100g) alti ma coerenti con una spezia secca (stessa concentrazione da disidratazione già vista per le altre spezie di questo run, qui su scala più contenuta). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170931 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre spezie secche di questa coda; famiglia botanica Piperaceae dichiarata separatamente, diversa da tutte le altre spezie già lavorate in questo run).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `pepe_nero` ("Pepe nero").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 310µg/100g esplicito — stessa scelta prudente già usata per le altre spezie di questo run), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Piperaceae` (*Piper nigrum*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi.

```
npm run add-food -- --fdc-id=170931 --food-id=food_pepe_nero_raw \
  --name-it="Pepe nero, macinato" \
  --matrix-id=pepe_nero --matrix-description-it="Pepe nero" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Piperaceae
```
```
npm run add-food -- --fdc-id=170931 --food-id=food_pepe_nero_raw \
  --name-it="Pepe nero, macinato" \
  --matrix-id=pepe_nero --matrix-description-it="Pepe nero" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Piperaceae --apply
```

### Salvia, secca (macinata) — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11, oltre la quota)

- **food_id**: `food_salvia_raw`. FDC ID 170935 (SR Legacy, "Spices, sage, ground"). Nota: il record USDA è specificamente "ground" (macinata), non foglie intere essiccate — nome dell'alimento precisato di conseguenza per non rappresentare una forma diversa da quella misurata.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (274µg/100g) — nessuna firma di arricchimento. Calcio (1652mg/100g), ferro (28,1mg/100g) e magnesio (428mg/100g) alti ma coerenti con una spezia secca macinata (stessa concentrazione da disidratazione già vista per le altre spezie di questo run). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170935 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre erbe aromatiche secche di questa coda; famiglia botanica Lamiaceae dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica secca).
- **Matrice**: nuova `salvia_secca` ("Salvia secca, macinata").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 3485µg/100g esplicito — stessa scelta prudente già usata per le altre spezie di questo run), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Salvia officinalis*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi.

```
npm run add-food -- --fdc-id=170935 --food-id=food_salvia_raw \
  --name-it="Salvia, secca (macinata)" \
  --matrix-id=salvia_secca --matrix-description-it="Salvia secca, macinata" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=170935 --food-id=food_salvia_raw \
  --name-it="Salvia, secca (macinata)" \
  --matrix-id=salvia_secca --matrix-description-it="Salvia secca, macinata" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae --apply
```

### Timo, secco — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11, oltre la quota)

- **food_id**: `food_timo_secco_raw`. FDC ID 170938 (SR Legacy, "Spices, thyme, dried").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (274µg/100g) — nessuna firma di arricchimento. Ferro **124mg/100g**: valore estremo ma non anomalo — il timo secco è notoriamente tra le spezie più ricche di ferro in assoluto (fonte: dato USDA stesso, nessun altro segnale di errore nel record, coerente con calcio 1890mg/100g e magnesio 220mg/100g, tutti alti per lo stesso motivo di concentrazione da disidratazione). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170938 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre erbe aromatiche secche di questa coda; famiglia botanica Lamiaceae dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica secca).
- **Matrice**: nuova `timo_secco` ("Timo secco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 2264µg/100g esplicito — stessa scelta prudente già usata per le altre spezie di questo run), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Thymus vulgaris*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi; il ferro altissimo va interpretato dall'app con questa scala in mente quando usato nel Meal Builder.

```
npm run add-food -- --fdc-id=170938 --food-id=food_timo_secco_raw \
  --name-it="Timo, secco" \
  --matrix-id=timo_secco --matrix-description-it="Timo secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=170938 --food-id=food_timo_secco_raw \
  --name-it="Timo, secco" \
  --matrix-id=timo_secco --matrix-description-it="Timo secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae --apply
```

### Cannella, in polvere — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_cannella_raw`. FDC ID 171320 (SR Legacy, "Spices, cinnamon, ground").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (6,00µg/100g) — nessuna firma di arricchimento. Calcio (1002mg/100g) e ferro (8,32mg/100g) alti ma coerenti con una spezia secca macinata (stessa concentrazione per disidratazione già vista per le altre spezie di questo run). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171320 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre erbe/spezie secche di questa coda; famiglia botanica Lauraceae dichiarata separatamente, diversa da tutte le altre spezie già lavorate in questo run).
- **Categoria dieta**: `plant_non_fruit` (spezia vegetale).
- **Matrice**: nuova `cannella` ("Cannella in polvere").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 112µg/100g esplicito — stessa scelta prudente già usata per origano/frutta secca essiccata nel Golden Set), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lauraceae` (*Cinnamomum verum/cassia* — la pagina non distingue le due specie), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi.

```
npm run add-food -- --fdc-id=171320 --food-id=food_cannella_raw \
  --name-it="Cannella, in polvere" \
  --matrix-id=cannella --matrix-description-it="Cannella in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lauraceae
```
```
npm run add-food -- --fdc-id=171320 --food-id=food_cannella_raw \
  --name-it="Cannella, in polvere" \
  --matrix-id=cannella --matrix-description-it="Cannella in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lauraceae --apply
```

### Rosmarino, secco — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_rosmarino_secco_raw`. FDC ID 171333 (SR Legacy, "Spices, rosemary, dried").
- **Nutrienti**: **13/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (alfa-carotene e beta-criptoxantina; campi del tutto assenti dal record, non riportati a zero — gap dichiarato, stesso standard già usato altrove in questa coda). Acido folico 0µg esplicito, separato dal folato totale (307µg/100g) — nessuna firma di arricchimento. Calcio (1280mg/100g), ferro (29,3mg/100g) alti ma coerenti con una spezia secca (stessa concentrazione per disidratazione già vista per l'origano in questo run). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171333 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per le altre erbe aromatiche di questa coda; famiglia botanica Lamiaceae dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica secca).
- **Matrice**: nuova `rosmarino_secco` ("Rosmarino secco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza dell'origano), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Salvia rosmarinus*, già *Rosmarinus officinalis*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi.

```
npm run add-food -- --fdc-id=171333 --food-id=food_rosmarino_secco_raw \
  --name-it="Rosmarino, secco" \
  --matrix-id=rosmarino_secco --matrix-description-it="Rosmarino secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=171333 --food-id=food_rosmarino_secco_raw \
  --name-it="Rosmarino, secco" \
  --matrix-id=rosmarino_secco --matrix-description-it="Rosmarino secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lamiaceae --apply
```

### Origano, secco — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_origano_secco_raw`. FDC ID 171328 (SR Legacy, "Spices, oregano, dried").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (237µg/100g) — nessuna firma di arricchimento. Calcio (1597mg/100g), ferro (36,8mg/100g) e folato molto alti ma coerenti con una spezia secca (concentrazione per disidratazione, stesso fenomeno già visto per basilico/prezzemolo/menta in questa coda, qui amplificato perché l'uso è "dried" non "fresh"), non un segnale di arricchimento artificiale. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171328 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa convenzione già usata per basilico/prezzemolo/menta in questa coda, "erba/pianta aromatica"; famiglia botanica Lamiaceae dichiarata separatamente, diversa da Asteraceae della scarola).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica secca).
- **Matrice**: nuova `origano_secco` ("Origano secco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 1007µg/100g esplicito — stessa scelta prudente già usata per la frutta secca essiccata nel Golden Set, fattore di conversione meno generoso), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Origanum vulgare*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi (come già per le altre erbe aromatiche di questa coda).

```
npm run add-food -- --fdc-id=171328 --food-id=food_origano_secco_raw \
  --name-it="Origano, secco" \
  --matrix-id=origano_secco --matrix-description-it="Origano secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=171328 --food-id=food_origano_secco_raw \
  --name-it="Origano, secco" \
  --matrix-id=origano_secco --matrix-description-it="Origano secco" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae --apply
```

### Melassa — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_melassa`. FDC ID 168820 (SR Legacy, "Molasses"). Distinta da `food_miele` (miele, già eseguito — prodotto animale, dieta egg_dairy) e da `food_sciroppo_di_acero_raw` (sciroppo d'acero, già eseguito — fonte diversa).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (0µg/100g) — nessuna firma di arricchimento. Calcio (205mg/100g) e ferro (4,72mg/100g) alti ma coerenti con la melassa comune (non "blackstrap"): è un sottoprodotto concentrato della raffinazione dello zucchero, notoriamente ricco di minerali — non un segnale di arricchimento artificiale, a differenza dei casi "enriched"/"with added solution" già scartati altrove in questa coda. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168820 e dataType SR Legacy (release 30 aprile 2026). La pagina segnala una seconda voce USDA per la melassa (probabilmente "blackstrap", con minerali ancora più concentrati) non consultata: questo comando usa la voce generica "Molasses", non quella eventualmente più concentrata.
- **Analogia usata**: `food_zucchero_di_canna_raw` (zucchero di canna, già eseguito sul DB reale — stesso sottoprodotto della canna da zucchero, stessa categoria funzionale "dolcificante vegetale", botanical_family lasciata NULL per lo stesso motivo — ambiguità canna/barbabietola — già dichiarato per `food_zucchero_bianco`).
- **Categoria dieta**: `plant_non_fruit` (dolcificante vegetale, a differenza del miele che è di origine animale).
- **Matrice**: nuova `melassa` ("Melassa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — melassa può derivare da canna o barbabietola, ambiguo, stessa scelta già fatta per `food_zucchero_bianco`), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168820 --food-id=food_melassa \
  --name-it="Melassa" \
  --matrix-id=melassa --matrix-description-it="Melassa" \
  --baseline-cooking-state=raw --analogy-food-id=food_zucchero_di_canna_raw \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=168820 --food-id=food_melassa \
  --name-it="Melassa" \
  --matrix-id=melassa --matrix-description-it="Melassa" \
  --baseline-cooking-state=raw --analogy-food-id=food_zucchero_di_canna_raw \
  --diet-category=plant_non_fruit --apply
```

### Olio di semi di lino, crudo — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_olio_di_semi_di_lino_raw`. FDC ID 167702 (SR Legacy, "Oil, flaxseed, cold pressed"). Distinto da `food_semi_di_lino_interi_raw` (semi interi, già eseguiti — prodotto diverso, solo l'olio estratto) e da `food_olio_di_girasole_raw`/`food_olio_di_mais_raw`/`food_olio_di_cocco_raw` (altri oli vegetali, già eseguiti). Scartato a priori "Oil, flaxseed, contains added sliced flaxseed" (FDC 171442): nonostante abbia una pagina getfoodfacts con FDC ID esplicito, la descrizione indica semi di lino a fette AGGIUNTI all'olio — proteine (0,37g/100g), calcio (9mg/100g) e ferro (0,34mg/100g) non nulli per un olio puro confermano che il profilo nutrizionale è contaminato dai semi aggiunti, non rappresenta l'olio puro richiesto.
- **Nutrienti**: **13/17** — mancano `vitamin_c_mg`, `other_provitamin_a_carotenoids_mcg`/beta-carotene/alfa-carotene (non riportati nella pagina, non assunti zero). Profilo coerente con un olio vegetale puro (grassi 100g/100g, proteine/carboidrati/minerali quasi tutti a zero esplicito o vicino a zero) — nessuna firma di contaminazione come la variante scartata sopra. Fonte: foodstruct.com, pagina che cita esplicitamente il link ufficiale `fdc.nal.usda.gov/food-details/167702/nutrients`.
- **Analogia usata**: `food_olio_di_girasole_raw` (olio di semi di girasole, già eseguito sul DB reale — stessa categoria funzionale "olio vegetale puro, nessun carotenoide rilevato").
- **Categoria dieta**: `plant_non_fruit` (olio vegetale).
- **Matrice**: nuova `olio_di_semi_di_lino` ("Olio di semi di lino").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — carotenoidi non riportati), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Linaceae` (*Linum usitatissimum*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — folato 0µg esplicito, nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=167702 --food-id=food_olio_di_semi_di_lino_raw \
  --name-it="Olio di semi di lino, crudo" \
  --matrix-id=olio_di_semi_di_lino --matrix-description-it="Olio di semi di lino" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_girasole_raw \
  --diet-category=plant_non_fruit --botanical-family=Linaceae
```
```
npm run add-food -- --fdc-id=167702 --food-id=food_olio_di_semi_di_lino_raw \
  --name-it="Olio di semi di lino, crudo" \
  --matrix-id=olio_di_semi_di_lino --matrix-description-it="Olio di semi di lino" \
  --baseline-cooking-state=raw --analogy-food-id=food_olio_di_girasole_raw \
  --diet-category=plant_non_fruit --botanical-family=Linaceae --apply
```

### Bistecca di manzo (taglio magro, es. controfiletto), cruda — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 11)

- **food_id**: `food_bistecca_di_manzo_raw`. FDC ID 174055 (SR Legacy, "Beef, top sirloin, steak, separable lean only, trimmed to 1/8\" fat, all grades, raw"). NON usa `food_beef_raw` (riga demo legacy già riservata/esclusa) né altri id riservati.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (13,0µg/100g) — nessuna firma di arricchimento. Calcio 25,0mg/100g, nella norma per un taglio di manzo magro (non l'anomalia vista nei prodotti "enhanced"/affumicati di questa coda). "Separable lean only" = taglio magro, coerente con la richiesta "manzo magro, es. controfiletto". Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174055 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_beef_ground_raw` (manzo macinato crudo, nel Golden Set originale — stessa specie, stesso trattamento `is_heme_iron=true`, `matrix_category_calcium`/`botanical_family` NULL già usati per quella riga).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `bistecca_di_manzo` ("Bistecca di manzo, taglio magro").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione di `food_beef_ground_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174055 --food-id=food_bistecca_di_manzo_raw \
  --name-it="Bistecca di manzo (taglio magro, es. controfiletto), cruda" \
  --matrix-id=bistecca_di_manzo --matrix-description-it="Bistecca di manzo, taglio magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174055 --food-id=food_bistecca_di_manzo_raw \
  --name-it="Bistecca di manzo (taglio magro, es. controfiletto), cruda" \
  --matrix-id=bistecca_di_manzo --matrix-description-it="Bistecca di manzo, taglio magro" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Farina di cocco — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_farina_di_cocco_raw`. FDC ID 2515382 (**Foundation Foods**, "Flour, coconut"). Distinta da `food_olio_di_cocco_raw` (olio di cocco, già eseguito — prodotto diverso, solo il grasso estratto) e da `food_noce_di_cocco_raw` (polpa fresca, 🟡 in coda precedente — prodotto disidratato e defatted, non la polpa fresca).
- **Nutrienti**: **11/17** — mancano `vitamin_c_mg`, `folate_mcg`, `vitamin_b12_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dal record Foundation Foods, non riportati a zero — questo dataset riporta meno nutrienti totali, 22 nel complesso, rispetto a un tipico SR Legacy). Gap dichiarato, sopra la soglia minima ~10/17 ma significativo (manca l'intero gruppo vitamine/folato/carotenoidi, non solo un paio di voci marginali). Nessun segno di arricchimento rilevabile (acido folico non riportato affatto, non un valore zero esplicito — diverso dagli altri casi di questa coda dove la non-fortificazione è confermata da uno zero esplicito). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 2515382 e dataType Foundation Foods (release 30 aprile 2026); alimento generico mono-ingrediente, nessun marchio/prodotto composito.
- **Analogia usata**: `food_farina_di_mais_raw` (farina di mais, già eseguita sul DB reale — stessa categoria funzionale "farina vegetale processata, nessun carotenoide rilevato", pur essendo una famiglia botanica diversa — Arecaceae per la noce di cocco contro Poaceae per il mais, dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (farina vegetale).
- **Matrice**: nuova `farina_di_cocco` ("Farina di cocco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae` (*Cocos nucifera*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — la farina di cocco non è soggetta all'obbligo USA di fortificazione dei cereali, anche se qui il folato non è nemmeno riportato).

```
npm run add-food -- --fdc-id=2515382 --food-id=food_farina_di_cocco_raw \
  --name-it="Farina di cocco" \
  --matrix-id=farina_di_cocco --matrix-description-it="Farina di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae
```
```
npm run add-food -- --fdc-id=2515382 --food-id=food_farina_di_cocco_raw \
  --name-it="Farina di cocco" \
  --matrix-id=farina_di_cocco --matrix-description-it="Farina di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae --apply
```

### Erba cipollina, fresca — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_erba_cipollina_raw`. FDC ID 169994 (SR Legacy, "Chives, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (105µg/100g) — nessuna firma di arricchimento. Beta-carotene 2612µg/100g esplicito, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti. Calcio 92,0mg/100g, vitamina K 213µg/100g: alti ma tipici per un'erba aromatica allium a foglia, non un'anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169994 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_onion_raw` (cipolla, già eseguita sul DB reale — stessa famiglia Amaryllidaceae, stesso genere *Allium*, già usata come analogia per porri e scalogno in lotti precedenti).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica/ortaggio allium).
- **Matrice**: nuova `erba_cipollina` ("Erba cipollina").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 2612µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaryllidaceae` (*Allium schoenoprasum*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169994 --food-id=food_erba_cipollina_raw \
  --name-it="Erba cipollina, fresca" \
  --matrix-id=erba_cipollina --matrix-description-it="Erba cipollina" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Amaryllidaceae
```
```
npm run add-food -- --fdc-id=169994 --food-id=food_erba_cipollina_raw \
  --name-it="Erba cipollina, fresca" \
  --matrix-id=erba_cipollina --matrix-description-it="Erba cipollina" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Amaryllidaceae --apply
```

### Peperoncino verde piccante, crudo — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_peperoncino_verde_raw`. FDC ID 170497 (SR Legacy, "Peppers, hot chili, green, raw"). Distinto da `food_peperoncino_piccante_raw` (peperoncino rosso piccante, FDC 170106, già 🟡 in questa coda — colore/varietà diversa, profilo nutrizionale diverso, non lo stesso alimento) e dai peperoni dolci rosso/giallo/verde già coperti.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (23,0µg/100g) — nessuna firma di arricchimento. Vitamina C 243mg/100g molto alta ma tipica per un peperoncino piccante crudo (coerente con l'ordine di grandezza già visto per i peperoni dolci nel Golden Set). Beta-carotene 671µg/100g, alfa-carotene 23,0µg/100g, beta-criptoxantina 50,0µg/100g tutti espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170497 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_pepper_green_raw` (peperone dolce verde, già nei 30 alimenti originali del Golden Set — stesso genere *Capsicum*, stessa famiglia Solanaceae, stesso colore verde).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente "frutto", stessa convenzione già usata per gli altri peperoni).
- **Matrice**: nuova `peperoncino_verde` ("Peperoncino verde piccante").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 671µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170497 --food-id=food_peperoncino_verde_raw \
  --name-it="Peperoncino verde piccante, crudo" \
  --matrix-id=peperoncino_verde --matrix-description-it="Peperoncino verde piccante" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_green_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Solanaceae
```
```
npm run add-food -- --fdc-id=170497 --food-id=food_peperoncino_verde_raw \
  --name-it="Peperoncino verde piccante, crudo" \
  --matrix-id=peperoncino_verde --matrix-description-it="Peperoncino verde piccante" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_green_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Solanaceae --apply
```

### Menta fresca (menta verde/spearmint), cruda — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_menta_raw`. FDC ID 173475 (SR Legacy, "Spearmint, fresh"). Nota: rappresenta la specie *Mentha spicata* (menta verde), la più comune per uso culinario in Italia — FDC non ha un record generico "mint, fresh" con dati completi, solo voci per specie (spearmint/peppermint), stessa situazione già incontrata per basilico/prezzemolo in questa coda.
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina del record, non riportati a zero; gap dichiarato, sopra la soglia minima ~10/17 — inusuale che un'erba a foglia non riporti vitamina K/carotenoidi come basilico e prezzemolo nella stessa coda, ma nessun segnale di record sbagliato: descrizione e resto dei valori coerenti). Acido folico 0µg esplicito, separato dal folato totale (105µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173475 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa categoria "verdura/erba a foglia verde", stessa convenzione già usata per basilico/prezzemolo in questa coda).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica).
- **Matrice**: nuova `menta` ("Menta fresca").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, a differenza di basilico/prezzemolo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Mentha spicata*, stessa famiglia già usata per basilico), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173475 --food-id=food_menta_raw \
  --name-it="Menta fresca, cruda" \
  --matrix-id=menta --matrix-description-it="Menta fresca" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=173475 --food-id=food_menta_raw \
  --name-it="Menta fresca, cruda" \
  --matrix-id=menta --matrix-description-it="Menta fresca" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --diet-category=plant_non_fruit --botanical-family=Lamiaceae --apply
```

### Crescione, crudo — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_crescione_raw`. FDC ID 170068 (SR Legacy, "Watercress, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (9,00µg/100g) — nessuna firma di arricchimento. Calcio 120mg/100g: tipico per una crucifera a foglia verde (coerente con kale/rucola già nel Golden Set), non un'anomalia. Beta-carotene 1914µg/100g esplicito, alfa-carotene 0µg e beta-criptoxantina 0µg espliciti. Vitamina K 250µg/100g, alta ma tipica per una verdura a foglia verde scura. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170068 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_kale_raw` (cavolo kale, già nei 30 alimenti originali del Golden Set — stessa famiglia Brassicaceae, stessa categoria "verdura a foglia verde crucifera", stesso trattamento low_oxalate).
- **Categoria dieta**: `plant_non_fruit` (verdura a foglia).
- **Matrice**: nuova `crescione` ("Crescione").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium=low_oxalate` (per analogia diretta con kale, stessa famiglia), `carotenoid_matrix_state=raw_intact` (beta-carotene 1914µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae` (*Nasturtium officinale*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170068 --food-id=food_crescione_raw \
  --name-it="Crescione, crudo" \
  --matrix-id=crescione --matrix-description-it="Crescione" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --matrix-category-calcium=low_oxalate --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae
```
```
npm run add-food -- --fdc-id=170068 --food-id=food_crescione_raw \
  --name-it="Crescione, crudo" \
  --matrix-id=crescione --matrix-description-it="Crescione" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --matrix-category-calcium=low_oxalate --carotenoid-matrix-state=raw_intact \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae --apply
```

### Farina di carruba — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_farina_di_carruba_raw`. FDC ID 173755 (SR Legacy, "Carob flour").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (29,0µg/100g) — nessuna firma di arricchimento. Beta-carotene 8,00µg/100g esplicito (basso ma reale, coerente con un legume/baccello, non un'anomalia), alfa-carotene 0µg e beta-criptoxantina 0µg espliciti (quindi `other_provitamin_a_carotenoids_mcg=0`, valore esplicito non assunto). Vitamina K 0µg esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173755 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_farina_di_ceci_raw` (farina di ceci, già eseguita sul DB reale — stessa categoria "farina da legume", stessa famiglia Fabaceae del baccello di carruba, *Ceratonia siliqua*).
- **Categoria dieta**: `plant_non_fruit` (farina da legume arboreo).
- **Matrice**: nuova `farina_di_carruba` ("Farina di carruba").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 8,00µg esplicito, basso; farina macinata quindi matrice meccanicamente alterata — scelta prudente per analogia diretta con la stessa convenzione già usata per la frutta secca/disidratata di questa coda, che abbassa la stima di vitamina A invece di sovrastimarla), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173755 --food-id=food_farina_di_carruba_raw \
  --name-it="Farina di carruba" \
  --matrix-id=farina_di_carruba --matrix-description-it="Farina di carruba" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_ceci_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=173755 --food-id=food_farina_di_carruba_raw \
  --name-it="Farina di carruba" \
  --matrix-id=farina_di_carruba --matrix-description-it="Farina di carruba" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_ceci_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Fabaceae --apply
```

### Fagioli borlotti, secchi, crudi (non bolliti) — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_fagioli_borlotti_secchi_raw`. FDC ID 175189 (SR Legacy, "Beans, cranberry (roman), mature seeds, raw"). Distinto da `food_fagioli_borlotti_bolliti` (già eseguito sul DB reale, FDC 173736 — variante bollita, non crudo secco).
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dal record, non riportati a zero; plausibile per un legume secco, non un'anomalia). Acido folico 0µg esplicito, separato dal folato totale (604µg/100g, food folate=604, DFE=604 — tutti coincidenti, alto ma tipico per un legume secco crudo) — nessuna firma di arricchimento. Vitamina C 0mg esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175189 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_fagioli_borlotti_bolliti` (stesso fagiolo, variante bollita, già eseguita sul DB reale — stessa cultivar *Phaseolus vulgaris* "cranberry/roman", differisce solo per stato di cottura).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `fagioli_borlotti_secchi` ("Fagioli borlotti, secchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw` (secco, non bollito), `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175189 --food-id=food_fagioli_borlotti_secchi_raw \
  --name-it="Fagioli borlotti, secchi, crudi" \
  --matrix-id=fagioli_borlotti_secchi --matrix-description-it="Fagioli borlotti, secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_fagioli_borlotti_bolliti \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=175189 --food-id=food_fagioli_borlotti_secchi_raw \
  --name-it="Fagioli borlotti, secchi, crudi" \
  --matrix-id=fagioli_borlotti_secchi --matrix-description-it="Fagioli borlotti, secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_fagioli_borlotti_bolliti \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Pasta integrale, cruda (non arricchita) — preparato 2026-10-15 dal task orario (settimo lotto, turno ore 10)

- **food_id**: `food_pasta_integrale_raw`. FDC ID 169738 (SR Legacy, "Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program)").
- **Nutrienti**: **14/17** — mancano `vitamin_c_mg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dal record, non riportati a zero; plausibile per un prodotto a base di farina, non un'anomalia). Acido folico 0µg esplicito, separato dal folato totale (69,0µg/100g, food folate=69,0, DFE=69,0 — tutti coincidenti) — **nessuna firma di arricchimento stile USA**, a differenza della pasta "enriched" già nei 30 originali (`food_pasta_enriched_dry`, FDC 169736): questo record rappresenta genuinamente la pasta integrale comune italiana, non la variante fortificata. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169738 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_pasta_enriched_dry` (pasta secca arricchita, già nei 30 alimenti originali del Golden Set — stessa categoria "pasta di semola secca", stessa famiglia Poaceae; differisce solo per `is_fortified_folate`, qui `false` invece di `true`).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `pasta_integrale_non_arricchita` ("Pasta integrale (non arricchita)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (grano), `baseline_cooking_state=raw` (secca, non cotta), `is_fortified_folate` omesso (false — acido folico 0µg esplicito, nessuna fortificazione).

```
npm run add-food -- --fdc-id=169738 --food-id=food_pasta_integrale_raw \
  --name-it="Pasta integrale, cruda (non arricchita)" \
  --matrix-id=pasta_integrale_non_arricchita --matrix-description-it="Pasta integrale (non arricchita)" \
  --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=169738 --food-id=food_pasta_integrale_raw \
  --name-it="Pasta integrale, cruda (non arricchita)" \
  --matrix-id=pasta_integrale_non_arricchita --matrix-description-it="Pasta integrale (non arricchita)" \
  --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Funghi shiitake, crudi — preparato 2026-10-15 dal task orario (settimo lotto, bonus oltre la quota)

- **food_id**: `food_funghi_shiitake_raw`. FDC ID 169242 (SR Legacy, "Mushrooms, shiitake, raw").
- **Nutrienti**: **12/17** — mancano `vitamin_c_mg`, `vitamin_k_mcg`, `vitamin_b12_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina del record, non riportati a zero; gap dichiarato, stesso standard già usato per castagne/cardi in coda precedenti — soglia minima accettata ~10/17, qui sopra soglia). Acido folico 0µg esplicito, separato dal folato totale (13,0µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169242 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_mushroom_white_raw` (funghi champignon, già eseguiti sul DB reale — stessa categoria "fungo commestibile", stesso trattamento "nessuna famiglia botanica" perché i funghi non sono piante).
- **Categoria dieta**: `plant_non_fruit` (fungo).
- **Matrice**: nuova `funghi_shiitake` ("Funghi shiitake").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non zero esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — fungo, non pianta, stesso trattamento dei funghi champignon già nel DB), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169242 --food-id=food_funghi_shiitake_raw \
  --name-it="Funghi shiitake, crudi" \
  --matrix-id=funghi_shiitake --matrix-description-it="Funghi shiitake" \
  --baseline-cooking-state=raw --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=169242 --food-id=food_funghi_shiitake_raw \
  --name-it="Funghi shiitake, crudi" \
  --matrix-id=funghi_shiitake --matrix-description-it="Funghi shiitake" \
  --baseline-cooking-state=raw --analogy-food-id=food_mushroom_white_raw \
  --diet-category=plant_non_fruit --apply
```

### Semi di papavero, secchi — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_semi_di_papavero_raw`. FDC ID 171330 (SR Legacy, "Spices, poppy seed").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (82,0µg/100g) — nessuna firma di arricchimento. Calcio 1.438mg/100g molto alto ma è una caratteristica nota e reale dei semi di papavero (fra i semi più ricchi di calcio in assoluto, come i semi di sesamo già nel Golden Set), non un'anomalia. Beta-carotene, alfa-carotene, beta-criptoxantina tutti 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171330 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_semi_di_sesamo_raw` (semi di sesamo, già eseguiti sul DB reale — stessa categoria funzionale "seme condimento ad alto contenuto di calcio").
- **Categoria dieta**: `plant_non_fruit` (seme).
- **Matrice**: nuova `semi_di_papavero` ("Semi di papavero").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione già usata per i funghi champignon e lo zenzero di questo run), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Papaveraceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi (come già per aglio/basilico/prezzemolo/zenzero).

```
npm run add-food -- --fdc-id=171330 --food-id=food_semi_di_papavero_raw \
  --name-it="Semi di papavero, secchi" \
  --matrix-id=semi_di_papavero --matrix-description-it="Semi di papavero" \
  --baseline-cooking-state=raw --analogy-food-id=food_semi_di_sesamo_raw \
  --diet-category=plant_non_fruit --botanical-family=Papaveraceae
```
```
npm run add-food -- --fdc-id=171330 --food-id=food_semi_di_papavero_raw \
  --name-it="Semi di papavero, secchi" \
  --matrix-id=semi_di_papavero --matrix-description-it="Semi di papavero" \
  --baseline-cooking-state=raw --analogy-food-id=food_semi_di_sesamo_raw \
  --diet-category=plant_non_fruit --botanical-family=Papaveraceae --apply
```

### Formaggio svizzero (Emmentaler) — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_formaggio_svizzero_raw`. FDC ID 171251 (SR Legacy, "Cheese, swiss").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (10,0µg/100g) — nessuna firma di arricchimento. Calcio 890mg/100g alto ma coerente con un formaggio a pasta semidura (confrontabile con parmigiano/gorgonzola già nel Golden Set), nessuna anomalia. Vitamina K: il record non riporta un totale ma riporta il filloquinone (fillochinone, la forma mappata dallo script) a 1,40µg/100g — usato come valore. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171251 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_parmigiano_reggiano` (parmigiano, già eseguito sul DB reale — stessa categoria "formaggio a pasta dura/semidura da latte vaccino", calcio concentrato in modo simile).
- **Categoria dieta**: `egg_dairy` (latticino).
- **Matrice**: nuova `formaggio_svizzero` ("Formaggio svizzero (Emmentaler)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stessa convenzione già usata per gli altri latticini del Golden Set, le categorie ossalati esistono solo per spinaci/kale/latte), `carotenoid_matrix_state` omesso (NULL — non applicabile, latticino, beta-carotene presente ma di origine lattea non vegetale, stessa convenzione già usata per burro/latte/yogurt/formaggi), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171251 --food-id=food_formaggio_svizzero_raw \
  --name-it="Formaggio svizzero (Emmentaler)" \
  --matrix-id=formaggio_svizzero --matrix-description-it="Formaggio svizzero (Emmentaler)" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171251 --food-id=food_formaggio_svizzero_raw \
  --name-it="Formaggio svizzero (Emmentaler)" \
  --matrix-id=formaggio_svizzero --matrix-description-it="Formaggio svizzero (Emmentaler)" \
  --baseline-cooking-state=raw --analogy-food-id=food_parmigiano_reggiano \
  --diet-category=egg_dairy --apply
```

### Ostriche, crude (allevate) — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_ostriche_raw`. FDC ID 175172 (SR Legacy, "Mollusks, oyster, eastern, farmed, raw"). Nota: scelta la variante "allevate" (farmed) perché è la forma più diffusa in commercio in Italia/Europa; esiste anche una variante "wild" come record FDC separato, non usata qui.
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina del record, non riportati a zero; stesso tipo di gap già incontrato per granchio in questo stesso run). Acido folico 0µg esplicito, separato dal folato totale (18,0µg/100g) — nessuna firma di arricchimento. Zinco 37,9mg/100g molto alto: valore noto e corretto per le ostriche (fra gli alimenti più ricchi di zinco in assoluto), non un'anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175172 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — stessa categoria "mollusco bivalve", analogia più stretta di quelle usate per astice/granchio in questo run perché le ostriche sono anch'esse molluschi bivalvi come le vongole).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `ostriche` ("Ostriche").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175172 --food-id=food_ostriche_raw \
  --name-it="Ostriche, crude (allevate)" \
  --matrix-id=ostriche --matrix-description-it="Ostriche" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=175172 --food-id=food_ostriche_raw \
  --name-it="Ostriche, crude (allevate)" \
  --matrix-id=ostriche --matrix-description-it="Ostriche" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Granchio, polpa, crudo — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_granchio_raw`. FDC ID 174204 (SR Legacy, "Crustaceans, crab, blue, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina del record, non riportati a zero; gap dichiarato, stesso standard già usato per vitello/agnello/coniglio in questa coda). Acido folico 0µg esplicito, separato dal folato totale (44,0µg/100g) — nessuna firma di arricchimento. Vitamina B12 9,00µg/100g e zinco 3,54mg/100g coerenti con un crostaceo crudo, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174204 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — stessa categoria funzionale "frutti di mare non pesce", stesso trattamento `is_heme_iron=true` già usato per i molluschi di questa coda; nessun altro crostaceo ancora nel Golden Set).
- **Categoria dieta**: `meat_fish` (crostaceo).
- **Matrice**: nuova `granchio` ("Granchio").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174204 --food-id=food_granchio_raw \
  --name-it="Granchio, polpa, crudo" \
  --matrix-id=granchio --matrix-description-it="Granchio" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174204 --food-id=food_granchio_raw \
  --name-it="Granchio, polpa, crudo" \
  --matrix-id=granchio --matrix-description-it="Granchio" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Astice (lobster), crudo — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_astice_raw`. FDC ID 174208 (SR Legacy, "Crustaceans, lobster, northern, raw"). Nota sul nome: "astice" in italiano è il crostaceo con le chele (*Homarus*, come questo record); "aragosta" (senza chele, genere *Palinurus*) è un record FDC diverso, non usato qui — il nome scelto riflette il record effettivamente trovato.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (10,0µg/100g) — nessuna firma di arricchimento (non applicabile ai crostacei). Zinco 3,53mg/100g e vitamina B12 1,25µg/100g coerenti con un crostaceo crudo, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174208 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — nessun crostaceo ancora nel Golden Set: analogia funzionale per categoria "frutti di mare non pesce", stesso trattamento `is_heme_iron=true` già usato per i molluschi di questa coda).
- **Categoria dieta**: `meat_fish` (crostaceo).
- **Matrice**: nuova `astice` ("Astice").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per pesci/molluschi di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174208 --food-id=food_astice_raw \
  --name-it="Astice, crudo" \
  --matrix-id=astice --matrix-description-it="Astice" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174208 --food-id=food_astice_raw \
  --name-it="Astice, crudo" \
  --matrix-id=astice --matrix-description-it="Astice" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Zucca butternut, cruda — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_zucca_butternut_raw`. FDC ID 169295 (SR Legacy, "Squash, winter, butternut, raw"). Distinta da `food_pumpkin_raw` (zucca generica, già eseguita, stessa famiglia ma cultivar/specie diversa).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (27,0µg/100g) — nessuna firma di arricchimento. Beta-carotene 4.226µg/100g, alfa-carotene 834µg/100g, beta-criptoxantina 3.471µg/100g — valori alti ma coerenti con una zucca invernale a polpa arancione (confrontabile con la zucca generica già nel Golden Set), nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169295 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_pumpkin_raw` (zucca generica, già eseguita sul DB reale — stessa famiglia botanica Cucurbitaceae, stesso tipo di polpa).
- **Categoria dieta**: `plant_non_fruit` (ortaggio, stessa convenzione già usata per la zucca generica).
- **Matrice**: nuova `zucca_butternut` ("Zucca butternut").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene presente con valore), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169295 --food-id=food_zucca_butternut_raw \
  --name-it="Zucca butternut, cruda" \
  --matrix-id=zucca_butternut --matrix-description-it="Zucca butternut" \
  --baseline-cooking-state=raw --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae
```
```
npm run add-food -- --fdc-id=169295 --food-id=food_zucca_butternut_raw \
  --name-it="Zucca butternut, cruda" \
  --matrix-id=zucca_butternut --matrix-description-it="Zucca butternut" \
  --baseline-cooking-state=raw --analogy-food-id=food_pumpkin_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae --apply
```

### Zenzero fresco, crudo — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_zenzero_raw`. FDC ID 169231 (SR Legacy, "Ginger root, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (11,0µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti (coerente con una radice, non una parte verde fotosintetica). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169231 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_carrots_raw` (per funzione del campo beta-carotene/radice, stessa convenzione già usata per l'aglio in questa coda — nessuna parentela botanica reale, famiglia vera dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (radice/spezia).
- **Matrice**: nuova `zenzero` ("Zenzero").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione già usata per i funghi champignon), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Zingiberaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false). Nota: valori per 100g, uso reale tipico in grammi (come già per aglio/basilico/prezzemolo).

```
npm run add-food -- --fdc-id=169231 --food-id=food_zenzero_raw \
  --name-it="Zenzero fresco, crudo" \
  --matrix-id=zenzero --matrix-description-it="Zenzero" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae
```
```
npm run add-food -- --fdc-id=169231 --food-id=food_zenzero_raw \
  --name-it="Zenzero fresco, crudo" \
  --matrix-id=zenzero --matrix-description-it="Zenzero" \
  --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw \
  --diet-category=plant_non_fruit --botanical-family=Zingiberaceae --apply
```

### Mirtilli rossi (cranberry), crudi — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_mirtilli_rossi_raw`. FDC ID 171722 (SR Legacy, "Cranberries, raw"). Distinto da `food_mirtilli_raw` (mirtilli blu, già eseguito, specie diversa dello stesso genere *Vaccinium*).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (1,00µg/100g) — nessuna firma di arricchimento. Beta-carotene 38,0µg/100g, alfa-carotene e beta-criptoxantina 0µg espliciti — valori coerenti con un piccolo frutto di bosco acido, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171722 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_mirtilli_raw` (mirtilli blu, già eseguito sul DB reale — stessa famiglia botanica Ericaceae, stesso genere *Vaccinium*, stesso tipo di bacca).
- **Categoria dieta**: `fresh_fruit` (frutta fresca).
- **Matrice**: nuova `mirtilli_rossi` ("Mirtilli rossi (cranberry)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene presente con valore), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Ericaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171722 --food-id=food_mirtilli_rossi_raw \
  --name-it="Mirtilli rossi (cranberry), crudi" \
  --matrix-id=mirtilli_rossi --matrix-description-it="Mirtilli rossi (cranberry)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit --botanical-family=Ericaceae
```
```
npm run add-food -- --fdc-id=171722 --food-id=food_mirtilli_rossi_raw \
  --name-it="Mirtilli rossi (cranberry), crudi" \
  --matrix-id=mirtilli_rossi --matrix-description-it="Mirtilli rossi (cranberry)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit --botanical-family=Ericaceae --apply
```

### Nettarine, crude — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_nettarine_raw`. FDC ID 169914 (SR Legacy, "Nectarines, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5,00µg/100g) — nessuna firma di arricchimento. Beta-carotene 150µg/100g, alfa-carotene 0µg, beta-criptoxantina 98,0µg/100g (quest'ultima confluisce in `other_provitamin_a_carotenoids_mcg`) — valori coerenti con una drupacea, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169914 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_peach_yellow_raw` (pesche gialle, già eseguito sul DB reale — nettarina e pesca sono la stessa specie *Prunus persica*, differiscono solo per il gene della buccia liscia/pelosa: analogia quasi diretta).
- **Categoria dieta**: `fresh_fruit` (frutta fresca).
- **Matrice**: nuova `nettarine` ("Nettarine").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene presente con valore), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169914 --food-id=food_nettarine_raw \
  --name-it="Nettarine, crude" \
  --matrix-id=nettarine --matrix-description-it="Nettarine" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=169914 --food-id=food_nettarine_raw \
  --name-it="Nettarine, crude" \
  --matrix-id=nettarine --matrix-description-it="Nettarine" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### Merluzzo, cotto al forno (calore secco) — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_merluzzo_cotto`. FDC ID 171956 (SR Legacy, "Fish, cod, Atlantic, cooked, dry heat"). Distinto da `food_merluzzo_raw` (merluzzo crudo, già eseguito, FDC 171955) — stesso pesce, forma cotta "dry heat" (calore secco, es. al forno/alla griglia senza liquido), stessa convenzione già usata per `food_salmon_cooked` nel Golden Set originale (`baseline_cooking_state=dry_heat_cooked`).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (8,00µg/100g) — nessuna firma di arricchimento (comunque non applicabile al pesce). Selenio 37,6µg/100g e vitamina B12 1,05µg/100g coerenti con un pesce magro cotto, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171956 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_merluzzo_raw` (merluzzo crudo, già eseguito sul DB reale — stesso pesce, stesso stato tranne la cottura; `is_heme_iron=true` mantenuto per coerenza con la convenzione già usata per i pesci di questa coda).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: **nota per chi esegue**: per formare una vera coppia crudo/cotto (necessaria al motore di cottura per calcolare i fattori di ritenzione, come già fatto per carote/broccoli/spinaci/cavoletti nel Golden Set originale) questo alimento dovrebbe riusare lo STESSO `matrix_id` già assegnato a `food_merluzzo_raw` — non verificabile da questa sessione, priva di accesso diretto a Supabase (il comando originale di quella voce è nella cronologia git non più raggiungibile da questa sessione per via del rebase/force-update del repository). Propongo `matrix-id=merluzzo` con descrizione "Merluzzo": se il raw usa già questo nome lo script lo riusa correttamente; se usa un nome diverso, correggere `--matrix-id` prima di lanciare il comando per far coincidere le due righe sulla stessa matrice (altrimenti si crea comunque l'alimento, solo senza la coppia di ritenzione).
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per gli altri pesci di questa coda e per `food_merluzzo_raw`), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, alimento animale, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=dry_heat_cooked`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171956 --food-id=food_merluzzo_cotto \
  --name-it="Merluzzo, cotto al forno (calore secco)" \
  --matrix-id=merluzzo --matrix-description-it="Merluzzo" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171956 --food-id=food_merluzzo_cotto \
  --name-it="Merluzzo, cotto al forno (calore secco)" \
  --matrix-id=merluzzo --matrix-description-it="Merluzzo" \
  --baseline-cooking-state=dry_heat_cooked --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Crusca d'avena, cruda — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_crusca_di_avena_raw`. FDC ID 168872 (SR Legacy, "Oat bran, raw"). Distinta da `food_crusca_di_frumento_raw` (crusca di frumento, già eseguita, specie diversa) e da `food_farina_di_avena_raw` (preparato in questo stesso run, parte diversa del chicco).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (52,0µg/100g, alto ma coerente con una crusca concentrata in nutrienti) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene, beta-criptoxantina tutti 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168872 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_avena_cruda` (avena cruda in grani, già eseguita sul DB reale — stessa specie *Avena sativa*, stessa famiglia botanica Poaceae; differisce solo per la parte del chicco).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `crusca_di_avena` ("Crusca d'avena").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168872 --food-id=food_crusca_di_avena_raw \
  --name-it="Crusca d'avena, cruda" \
  --matrix-id=crusca_di_avena --matrix-description-it="Crusca d'avena" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=168872 --food-id=food_crusca_di_avena_raw \
  --name-it="Crusca d'avena, cruda" \
  --matrix-id=crusca_di_avena --matrix-description-it="Crusca d'avena" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Farina di riso integrale, cruda — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_farina_di_riso_integrale_raw`. FDC ID 168898 (SR Legacy, "Rice flour, brown"). Distinta da `food_farina_di_riso_raw` (farina di riso bianco, già eseguita, FDC 169714).
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (campi del tutto assenti dalla pagina del record, non riportati a zero; gap dichiarato, stesso standard già usato per il semolino di grano duro in questo stesso run). Acido folico 0µg esplicito, separato dal folato totale (16,0µg/100g) — nessuna firma di arricchimento. Calcio 11,0mg/100g molto basso, coerente con una farina di riso non trattata (non l'anomalia vista nei record "enriched"/"commercially prepared"). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168898 e dataType SR Legacy (release 30 aprile 2026). Scartato a priori "Flour, rice, brown" (FDC 1104812, probabile Branded) — non verificato, il record SR Legacy era già individuato.
- **Analogia usata**: `food_riso_integrale_raw` (riso integrale in chicchi, già eseguito sul DB reale — stesso grado di raffinazione "integrale", stessa specie *Oryza sativa*).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `farina_di_riso_integrale` ("Farina di riso integrale").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non zero esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168898 --food-id=food_farina_di_riso_integrale_raw \
  --name-it="Farina di riso integrale, cruda" \
  --matrix-id=farina_di_riso_integrale --matrix-description-it="Farina di riso integrale" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=168898 --food-id=food_farina_di_riso_integrale_raw \
  --name-it="Farina di riso integrale, cruda" \
  --matrix-id=farina_di_riso_integrale --matrix-description-it="Farina di riso integrale" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Farina di avena, cruda — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_farina_di_avena_raw`. FDC ID 169741 (SR Legacy, "Oat flour, partially debranned").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (32,0µg/100g) — nessuna firma di arricchimento. Calcio 55,0mg/100g nella norma per una farina di cereale integrale/parzialmente decorticata (non l'anomalia 105-163mg/100g vista nei record "enriched"/"commercially prepared" già scartati per pane/pancarré). Beta-carotene, alfa-carotene, beta-criptoxantina tutti 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169741 e dataType SR Legacy (release 30 aprile 2026). Scartato a priori "Flour, oat, whole grain" (FDC 2261421, Foundation Foods) — non verificato, il record SR Legacy era già pulito e completo.
- **Analogia usata**: `food_avena_cruda` (avena cruda in grani, già eseguita sul DB reale — stessa specie *Avena sativa*, stessa famiglia botanica Poaceae; differisce solo per il grado di macinazione).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `farina_di_avena` ("Farina di avena").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=169741 --food-id=food_farina_di_avena_raw \
  --name-it="Farina di avena, cruda" \
  --matrix-id=farina_di_avena --matrix-description-it="Farina di avena" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=169741 --food-id=food_farina_di_avena_raw \
  --name-it="Farina di avena, cruda" \
  --matrix-id=farina_di_avena --matrix-description-it="Farina di avena" \
  --baseline-cooking-state=raw --analogy-food-id=food_avena_cruda \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Farina integrale di segale, cruda — preparato 2026-10-15 dal task orario (settimo lotto)

- **food_id**: `food_farina_di_segale_integrale_raw`. FDC ID 168885 (SR Legacy, "Rye flour, dark"). "Dark" rye flour = farina integrale (include crusca e germe), distinta dalla "light" (raffinata) — scelta deliberata per rappresentare la farina di segale integrale richiesta dalla voce di coda.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (33,0µg/100g) — nessuna firma di arricchimento. Fibra 23,8g/100g: alta ma coerente con una farina di segale integrale concentrata in crusca (non un'anomalia, lo stesso ordine di grandezza della crusca di frumento già nel Golden Set). Beta-carotene 7,00µg/100g esplicito (piccola traccia, plausibile per una farina integrale). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168885 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_segale_raw` (segale in chicchi, già eseguita sul DB reale — stessa specie *Secale cereale*, stessa famiglia botanica Poaceae; differisce solo per il grado di macinazione).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `farina_di_segale_integrale` ("Farina di segale integrale").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 7,00µg esplicito, non zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168885 --food-id=food_farina_di_segale_integrale_raw \
  --name-it="Farina integrale di segale, cruda" \
  --matrix-id=farina_di_segale_integrale --matrix-description-it="Farina di segale integrale" \
  --baseline-cooking-state=raw --analogy-food-id=food_segale_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=168885 --food-id=food_farina_di_segale_integrale_raw \
  --name-it="Farina integrale di segale, cruda" \
  --matrix-id=farina_di_segale_integrale --matrix-description-it="Farina di segale integrale" \
  --baseline-cooking-state=raw --analogy-food-id=food_segale_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Poaceae --apply
```

### Olio di semi di colza (canola) — preparato 2026-10-15 dal task orario (sesto lotto, chiusura)

- **food_id**: `food_olio_di_colza_raw`. FDC ID 172336 (SR Legacy, "Oil, canola").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (0µg/100g) — nessuna firma di arricchimento (comunque non applicabile a un olio puro). Praticamente tutti i micronutrienti minerali/vitaminici idrosolubili sono 0µg/mg espliciti (coerente con un olio vegetale puro al 100% di grasso, nessuna traccia di proteine/minerali/acqua) — unica eccezione rilevante, vitamina K 71,3µg/100g, plausibile per un olio vegetale (coerente con gli altri oli già nel progetto). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172336 e dataType SR Legacy (release 30 aprile 2026). Scartato a priori un secondo candidato con lo stesso nome (FDC 748278): non verificato, il primo risultato SR Legacy era già pulito e completo.
- **Analogia usata**: `food_burro` (burro, già eseguito sul DB reale — stessa categoria "grasso puro da cucina", stessa convenzione già usata per olio di girasole/mais/cocco e per lo strutto in questa coda).
- **Categoria dieta**: `plant_non_fruit` (olio vegetale).
- **Matrice**: nuova `olio_di_colza` ("Olio di semi di colza (canola)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — stesso trattamento già usato per gli altri oli/zuccheri raffinati di questa coda, prodotto industriale non rappresentativo di una singola pianta), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172336 --food-id=food_olio_di_colza_raw \
  --name-it="Olio di semi di colza (canola)" \
  --matrix-id=olio_di_colza --matrix-description-it="Olio di semi di colza (canola)" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit
```
```
npm run add-food -- --fdc-id=172336 --food-id=food_olio_di_colza_raw \
  --name-it="Olio di semi di colza (canola)" \
  --matrix-id=olio_di_colza --matrix-description-it="Olio di semi di colza (canola)" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit --apply
```

### Yogurt magro (nonfat), bianco — preparato 2026-10-15 dal task orario (sesto lotto, chiusura)

- **food_id**: `food_yogurt_magro_raw`. FDC ID 170887 (SR Legacy, "Yogurt, plain, skim milk"). Distinto da `food_yogurt_bianco_intero` (yogurt bianco intero, già eseguito, FDC 171284) e da `food_yogurt_greco` (yogurt greco intero, già eseguito, FDC 171304) — prodotto a basso contenuto di grassi, non Greco.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (12,0µg/100g) — nessuna firma di arricchimento. Calcio 199mg/100g: più alto del latte scremato di partenza (122mg/100g), coerente con la concentrazione di solidi del latte durante la fermentazione in yogurt, non un'anomalia. Beta-carotene e alfa-carotene 0µg espliciti (coerente con l'assenza di grasso). **Nota di ricerca**: un primo candidato (FDC 2647437 "Yogurt, plain, nonfat", Foundation Foods) è stato scartato — pagina con dati incompleti/ambigui (ferro, rame, manganese riportati a 0 senza chiarezza se assenti o non misurati; vitamina C, selenio, vitamina K, B12, folato e carotenoidi del tutto assenti dalla pagina, un gap troppo ampio proprio sui micronutrienti seguiti da questo progetto) — il record SR Legacy 170887 usato invece è completo e pulito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170887 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_yogurt_bianco_intero` (yogurt bianco intero, già eseguito sul DB reale — stesso prodotto "yogurt bianco", differisce solo per il contenuto di grassi, analogia più precisa del semplice latte).
- **Categoria dieta**: `egg_dairy` (derivato del latte).
- **Matrice**: nuova `yogurt_magro` ("Yogurt magro/scremato"). **Nota per chi esegue**: se nel DB reale esiste già una matrice `yogurt` o simile usata per gli yogurt già eseguiti (non verificabile da questa sessione, priva di accesso diretto a Supabase — il dettaglio dei comandi originali di quelle due voci è stato compattato in una tabella riassuntiva e non riporta il matrix_id esatto), valutare se riusarla invece di crearne una nuova, per evitare matrici duplicate per lo stesso tipo di alimento; lo script comunque non si rompe in nessuno dei due casi.
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per gli altri derivati del latte aggiunti dopo i 30 originali), `carotenoid_matrix_state` omesso (NULL — non applicabile, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=170887 --food-id=food_yogurt_magro_raw \
  --name-it="Yogurt magro (nonfat), bianco" \
  --matrix-id=yogurt_magro --matrix-description-it="Yogurt magro/scremato" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170887 --food-id=food_yogurt_magro_raw \
  --name-it="Yogurt magro (nonfat), bianco" \
  --matrix-id=yogurt_magro --matrix-description-it="Yogurt magro/scremato" \
  --baseline-cooking-state=raw --analogy-food-id=food_yogurt_bianco_intero \
  --diet-category=egg_dairy --apply
```

### Latte vaccino scremato, con vitamina A e D aggiunte — preparato 2026-10-15 dal task orario (sesto lotto, chiusura)

- **food_id**: `food_latte_scremato_raw`. FDC ID 171269 (SR Legacy, "Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim)"). Distinto da `food_milk_whole` (latte intero, già reale nel DB) — prodotto diverso per contenuto di grassi.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5,00µg/100g) — nessuna firma di arricchimento tipo "enriched" USA (l'aggiunta di vitamina D al latte scremato è pratica standard, non il tipo di arricchimento con acido folico/ferro/calcio anomalo già scartato per pane/pasta). Calcio 122mg/100g, in linea con il latte vaccino intero (123mg/100g già nel Golden Set), nessuna anomalia. Beta-carotene e alfa-carotene 0µg espliciti (coerente con l'assenza di grasso, dove si concentrano i carotenoidi del latte). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171269 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, Golden Set originale, già reale nel DB — stesso animale, stesso prodotto, differisce solo per il contenuto di grassi).
- **Categoria dieta**: `egg_dairy` (latte).
- **Matrice**: riusa `dairy_milk` (già esistente dal Golden Set originale — stesso latte vaccino, nessun `--matrix-description-it` necessario).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per yogurt/formaggi/panna aggiunti dopo i 30 originali: la categoria ossalati del latte intero non è stata sistematicamente estesa ai derivati), `carotenoid_matrix_state` omesso (NULL — non applicabile, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — acido folico 0µg esplicito).

```
npm run add-food -- --fdc-id=171269 --food-id=food_latte_scremato_raw \
  --name-it="Latte vaccino scremato, con vitamina A e D aggiunte" \
  --matrix-id=dairy_milk \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=171269 --food-id=food_latte_scremato_raw \
  --name-it="Latte vaccino scremato, con vitamina A e D aggiunte" \
  --matrix-id=dairy_milk \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy --apply
```

### Panna da cucina (panna fluida leggera), cruda — preparato 2026-10-15 dal task orario (sesto lotto, chiusura)

- **food_id**: `food_panna_da_cucina_raw`. FDC ID 170857 (SR Legacy, "Cream, fluid, light (coffee cream or table cream)").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (2,00µg/100g) — nessuna firma di arricchimento. Grasso 19,1g/100g: coerente con una panna "leggera" da cucina (~19-20%), non con la panna fresca da montare (~35%) — scelta deliberata per rappresentare "panna da cucina" come inteso nella voce di coda, non panna per dolci. Calcio 91,0mg/100g e beta-carotene 37,0µg/100g plausibili per un derivato del latte, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170857 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, Golden Set originale, già reale nel DB — stesso prodotto lattiero-caseario, stessa categoria "latte e derivati").
- **Categoria dieta**: `egg_dairy` (derivato del latte).
- **Matrice**: nuova `panna_da_cucina` ("Panna da cucina / panna fluida leggera").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per yogurt/formaggi/burro aggiunti dopo i 30 originali: la categoria ossalati non è stata estesa oltre spinaci/kale/latte originale), `carotenoid_matrix_state` omesso (NULL — non applicabile, matrice animale, non vegetale: il beta-carotene del latte non è soggetto a disgregazione di parete cellulare), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170857 --food-id=food_panna_da_cucina_raw \
  --name-it="Panna da cucina (panna fluida leggera), cruda" \
  --matrix-id=panna_da_cucina --matrix-description-it="Panna da cucina / panna fluida leggera" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=170857 --food-id=food_panna_da_cucina_raw \
  --name-it="Panna da cucina (panna fluida leggera), cruda" \
  --matrix-id=panna_da_cucina --matrix-description-it="Panna da cucina / panna fluida leggera" \
  --baseline-cooking-state=raw --analogy-food-id=food_milk_whole \
  --diet-category=egg_dairy --apply
```

### Basilico fresco, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_basilico_raw`. FDC ID 172232 (SR Legacy, "Basil, fresh").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (68,0µg/100g) — nessuna firma di arricchimento. Calcio 177mg/100g: alto ma tipico per un'erba aromatica a foglia (stesso trattamento già usato per il prezzemolo in questo run, non un segno di arricchimento). Beta-carotene 3142µg/100g e beta-criptoxantina 46,0µg/100g espliciti, alfa-carotene 0µg esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 172232 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa categoria "verdura/erba a foglia verde", stessa convenzione appena usata per il prezzemolo in questo run).
- **Categoria dieta**: `plant_non_fruit` (erba aromatica/verdura a foglia).
- **Matrice**: nuova `basilico` ("Basilico").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 3142µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lamiaceae` (*Ocimum basilicum*, stessa famiglia già usata per i semi di chia in questa coda), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=172232 --food-id=food_basilico_raw \
  --name-it="Basilico fresco, crudo" \
  --matrix-id=basilico --matrix-description-it="Basilico" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae
```
```
npm run add-food -- --fdc-id=172232 --food-id=food_basilico_raw \
  --name-it="Basilico fresco, crudo" \
  --matrix-id=basilico --matrix-description-it="Basilico" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Lamiaceae --apply
```

### Prezzemolo fresco, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_prezzemolo_raw`. FDC ID 170416 (SR Legacy, "Parsley, fresh").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (152µg/100g, alto ma coerente con un'erba a foglia verde) — nessuna firma di arricchimento. Calcio 138mg/100g: alto ma tipico per un'erba aromatica a foglia (non un segno di arricchimento, le erbe non vengono fortificate). Beta-carotene 5054µg/100g esplicito, beta-criptoxantina 0µg, alfa-carotene 0µg. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170416 e dataType SR Legacy (release 30 aprile 2026; corroborata anche dal link diretto `fdc.nal.usda.gov/portal-data/external/170416` comparso nei risultati di ricerca, non apribile direttamente in questa sessione senza approvazione di provenienza). Scartato a priori "Parsley, raw" (FDC 2709796, dataType Survey/FNDDS — composito statistico, non un singolo alimento misurato).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stessa categoria "verdura/erba a foglia verde").
- **Categoria dieta**: `plant_non_fruit` (erba aromatica/verdura a foglia).
- **Matrice**: nuova `prezzemolo` ("Prezzemolo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento delle altre verdure a foglia di questa coda, le categorie ossalati esistono solo per spinaci/kale/latte), `carotenoid_matrix_state=raw_intact` (beta-carotene 5054µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae` (*Petroselinum crispum*, stessa famiglia di sedano/carote), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170416 --food-id=food_prezzemolo_raw \
  --name-it="Prezzemolo fresco, crudo" \
  --matrix-id=prezzemolo --matrix-description-it="Prezzemolo" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=170416 --food-id=food_prezzemolo_raw \
  --name-it="Prezzemolo fresco, crudo" \
  --matrix-id=prezzemolo --matrix-description-it="Prezzemolo" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Apiaceae --apply
```

### Noce di cocco, polpa fresca, cruda — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_noce_di_cocco_raw`. FDC ID 170169 (SR Legacy, "Nuts, coconut meat, raw"). Distinta da `food_olio_di_cocco_raw` (olio di cocco, già eseguito — prodotto diverso, solo il grasso estratto).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (26,0µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene, beta-criptoxantina tutti 0µg espliciti (coerente con una polpa di frutto senza pigmenti carotenoidi). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170169 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_noci_raw` (noci, già eseguite sul DB reale — stessa categoria "frutta a guscio/seme oleoso", stessa convenzione già usata per pinoli/noci macadamia/noci del Brasile in questa coda).
- **Categoria dieta**: `plant_non_fruit` (frutta a guscio/seme — stessa categoria di mandorle/noci/nocciole, anche se consumata fresca e non secca).
- **Matrice**: nuova `noce_di_cocco` ("Noce di cocco, polpa fresca").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae` (palma da cocco, *Cocos nucifera*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170169 --food-id=food_noce_di_cocco_raw \
  --name-it="Noce di cocco, polpa fresca, cruda" \
  --matrix-id=noce_di_cocco --matrix-description-it="Noce di cocco, polpa fresca" \
  --baseline-cooking-state=raw --analogy-food-id=food_noci_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae
```
```
npm run add-food -- --fdc-id=170169 --food-id=food_noce_di_cocco_raw \
  --name-it="Noce di cocco, polpa fresca, cruda" \
  --matrix-id=noce_di_cocco --matrix-description-it="Noce di cocco, polpa fresca" \
  --baseline-cooking-state=raw --analogy-food-id=food_noci_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae --apply
```

### Guava, cruda — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_guava_raw`. FDC ID 173044 (SR Legacy, "Guavas, common, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (49,0µg/100g) — nessuna firma di arricchimento. Vitamina C 228mg/100g: valore alto ma coerente con la guava, nota per l'altissimo contenuto di vitamina C (non un'anomalia). Beta-carotene 374µg/100g esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173044 e dataType SR Legacy (release 30 aprile 2026). Scartato a priori "Guava, raw" (FDC 2709238, dataType Survey/FNDDS — un composito statistico, non un singolo alimento misurato, stesso tipo di gap già evitato altrove in questa coda).
- **Analogia usata**: `food_papaya_raw` (papaya, già eseguita sul DB reale — stessa categoria "frutto tropicale a polpa arancione/beta-carotene elevato").
- **Categoria dieta**: `fresh_fruit` (frutta fresca vera).
- **Matrice**: nuova `guava` ("Guava").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 374µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Myrtaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173044 --food-id=food_guava_raw \
  --name-it="Guava, cruda" \
  --matrix-id=guava --matrix-description-it="Guava" \
  --baseline-cooking-state=raw --analogy-food-id=food_papaya_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Myrtaceae
```
```
npm run add-food -- --fdc-id=173044 --food-id=food_guava_raw \
  --name-it="Guava, cruda" \
  --matrix-id=guava --matrix-description-it="Guava" \
  --baseline-cooking-state=raw --analogy-food-id=food_papaya_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Myrtaceae --apply
```

### Frutto della passione, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_frutto_della_passione_raw`. FDC ID 169108 (SR Legacy, "Passion-fruit, (granadilla), purple, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (14,0µg/100g) — nessuna firma di arricchimento. Beta-carotene 743µg/100g e beta-criptoxantina 41,0µg/100g (entrambi espliciti, confluiscono nei campi del progetto), vitamina C 30,0mg/100g: tutti valori plausibili per un frutto tropicale a polpa arancione, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169108 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_mango_raw` (mango, già eseguito sul DB reale — stessa categoria "frutto tropicale a polpa arancione/beta-carotene elevato").
- **Categoria dieta**: `fresh_fruit` (frutta fresca vera).
- **Matrice**: nuova `frutto_della_passione` ("Frutto della passione (maracuja)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 743µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Passifloraceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169108 --food-id=food_frutto_della_passione_raw \
  --name-it="Frutto della passione, crudo" \
  --matrix-id=frutto_della_passione --matrix-description-it="Frutto della passione (maracuja)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mango_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Passifloraceae
```
```
npm run add-food -- --fdc-id=169108 --food-id=food_frutto_della_passione_raw \
  --name-it="Frutto della passione, crudo" \
  --matrix-id=frutto_della_passione --matrix-description-it="Frutto della passione (maracuja)" \
  --baseline-cooking-state=raw --analogy-food-id=food_mango_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Passifloraceae --apply
```

### Mela cotogna, cruda — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_mela_cotogna_raw`. FDC ID 168163 (SR Legacy, "Quinces, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero; gap dichiarato, stesso standard già usato per nespole/cardi, anch'essi fermi a 14/17 con un singolo record SR Legacy pulito). Acido folico 0µg esplicito, separato dal folato totale (3,00µg/100g) — nessuna firma di arricchimento (comunque non applicabile a un frutto fresco). Calcio 11,0mg/100g nella norma. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 168163 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_pear_raw` (pere, Golden Set originale — stessa famiglia botanica Rosaceae, frutto a pomo simile, stessa convenzione già usata per le nespole in questa coda).
- **Categoria dieta**: `fresh_fruit` (frutta fresca vera).
- **Matrice**: nuova `mela_cotogna` ("Mela cotogna").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non zero esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=168163 --food-id=food_mela_cotogna_raw \
  --name-it="Mela cotogna, cruda" \
  --matrix-id=mela_cotogna --matrix-description-it="Mela cotogna" \
  --baseline-cooking-state=raw --analogy-food-id=food_pear_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=168163 --food-id=food_mela_cotogna_raw \
  --name-it="Mela cotogna, cruda" \
  --matrix-id=mela_cotogna --matrix-description-it="Mela cotogna" \
  --baseline-cooking-state=raw --analogy-food-id=food_pear_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### Ribes rosso, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_ribes_rosso_raw`. FDC ID 173964 (SR Legacy, "Currants, red and white, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (8,00µg/100g) — nessuna firma di arricchimento (comunque non applicabile a un frutto fresco). Vitamina C 41,0mg/100g, calcio 33,0mg/100g e beta-carotene 25,0µg/100g tutti plausibili per una piccola bacca acidula, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173964 e dataType SR Legacy (release 30 aprile 2026). Distinto da "Currants, european black, raw" (FDC 173963, ribes nero, già scartato ⚠ in questa coda per copertura nutrienti insufficiente, 11/17) — questo record per il ribes rosso/bianco è invece completo.
- **Analogia usata**: `food_mirtilli_raw` (mirtilli, già eseguiti sul DB reale — stessa categoria "piccola bacca fresca").
- **Categoria dieta**: `fresh_fruit` (frutta fresca vera).
- **Matrice**: nuova `ribes_rosso` ("Ribes rosso").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 25,0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Grossulariaceae` (genere *Ribes*, famiglia reale diversa dal mirtillo Ericaceae), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173964 --food-id=food_ribes_rosso_raw \
  --name-it="Ribes rosso, crudo" \
  --matrix-id=ribes_rosso --matrix-description-it="Ribes rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Grossulariaceae
```
```
npm run add-food -- --fdc-id=173964 --food-id=food_ribes_rosso_raw \
  --name-it="Ribes rosso, crudo" \
  --matrix-id=ribes_rosso --matrix-description-it="Ribes rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_mirtilli_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=fresh_fruit \
  --botanical-family=Grossulariaceae --apply
```

### Bulgur di grano, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_bulgur_raw`. FDC ID 170688 (SR Legacy, "Bulgur, dry").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (27,0µg/100g) — nessuna firma di arricchimento. Calcio 35,0mg/100g nella norma per un cereale integrale (non anomalo). Beta-carotene 5,00µg esplicito; alfa-carotene e beta-criptoxantina 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170688 e dataType SR Legacy (release 30 aprile 2026). "Dry" (secco, non cotto): rappresenta correttamente il bulgur crudo richiesto dalla voce di coda.
- **Analogia usata**: `food_farina_di_frumento_integrale_raw` (farina di frumento integrale, già eseguita sul DB reale — stessa famiglia Poaceae, stesso genere cereale non arricchito).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `bulgur` ("Bulgur (grano spezzato)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 5,00µg esplicito, non zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento).

```
npm run add-food -- --fdc-id=170688 --food-id=food_bulgur_raw \
  --name-it="Bulgur di grano, crudo" \
  --matrix-id=bulgur --matrix-description-it="Bulgur (grano spezzato)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=170688 --food-id=food_bulgur_raw \
  --name-it="Bulgur di grano, crudo" \
  --matrix-id=bulgur --matrix-description-it="Bulgur (grano spezzato)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Poaceae --apply
```

### Farina di frumento tipo 00 (bianca), non arricchita, cruda — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_farina_frumento_00_raw`. FDC ID 169761 (SR Legacy, "Wheat flour, white, all-purpose, unenriched").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (26,0µg/100g) — nessuna firma di arricchimento, coerente con "unenriched" nel nome del record. Calcio 15,0mg/100g nella norma per una farina raffinata non trattata (non l'anomalia 105-163mg/100g vista nei record "enriched"/"commercially prepared" già scartati in questa coda per pane/pancarré). Beta-carotene, alfa-carotene, beta-criptoxantina tutti 0µg espliciti (coerente con una farina bianca priva di crusca/germe). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169761 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_farina_di_frumento_integrale_raw` (farina di frumento integrale, già eseguita sul DB reale — stessa specie *Triticum aestivum*, stessa famiglia Poaceae; differisce solo per il grado di raffinazione).
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `farina_frumento_00` ("Farina di frumento tipo 00 (bianca)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento degli altri cereali in questa coda), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — "unenriched" esplicito nel nome del record, acido folico 0µg).

```
npm run add-food -- --fdc-id=169761 --food-id=food_farina_frumento_00_raw \
  --name-it="Farina di frumento tipo 00 (bianca), non arricchita, cruda" \
  --matrix-id=farina_frumento_00 --matrix-description-it="Farina di frumento tipo 00 (bianca)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=169761 --food-id=food_farina_frumento_00_raw \
  --name-it="Farina di frumento tipo 00 (bianca), non arricchita, cruda" \
  --matrix-id=farina_frumento_00 --matrix-description-it="Farina di frumento tipo 00 (bianca)" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Capesante, crude — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_capesante_raw`. FDC ID 174220 (SR Legacy, "Mollusks, scallop, mixed species, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (16,0µg/100g) — nessuna firma di arricchimento (comunque non applicabile a un mollusco). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 174220 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite sul DB reale — stessa classe Mollusca, stessa convenzione `is_heme_iron=true` già usata per vongole/cozze/polpo/calamari/acciughe in questo progetto).
- **Categoria dieta**: `meat_fish` (mollusco).
- **Matrice**: nuova `capesante` ("Capesante").
- **Attributi**: `--is-heme-iron` (true — mollusco, stessa convenzione di vongole/cozze/polpo/calamari), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=174220 --food-id=food_capesante_raw \
  --name-it="Capesante, crude" \
  --matrix-id=capesante --matrix-description-it="Capesante" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=174220 --food-id=food_capesante_raw \
  --name-it="Capesante, crude" \
  --matrix-id=capesante --matrix-description-it="Capesante" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Pesce persico, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_pesce_persico_raw`. FDC ID 173678 (SR Legacy, "Fish, perch, mixed species, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5,00µg/100g) — nessuna firma di arricchimento (comunque non applicabile al pesce). Valori coerenti con un pesce magro d'acqua dolce, nessuna anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173678 e dataType SR Legacy (release 30 aprile 2026). "Mixed species" (comprende sia pesce persico europeo che americano): il più generico/rappresentativo disponibile in FDC per questo pesce.
- **Analogia usata**: `food_merluzzo_raw` (merluzzo, già eseguito sul DB reale — stessa categoria "pesce magro", stesso trattamento `is_heme_iron=true` già usato per i pesci di questa coda, a loro volta per analogia con `food_salmon_raw` del Golden Set originale).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `pesce_persico` ("Pesce persico").
- **Attributi**: `--is-heme-iron` (true — stessa convenzione già usata per gli altri pesci di questa coda), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173678 --food-id=food_pesce_persico_raw \
  --name-it="Pesce persico, crudo" \
  --matrix-id=pesce_persico --matrix-description-it="Pesce persico" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=173678 --food-id=food_pesce_persico_raw \
  --name-it="Pesce persico, crudo" \
  --matrix-id=pesce_persico --matrix-description-it="Pesce persico" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Rognone di manzo, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_rognone_di_manzo_raw`. FDC ID 169449 (SR Legacy, "Beef, variety meats and by-products, kidneys, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (98,0µg/100g) — nessuna firma di arricchimento (comunque non applicabile a una carne). Vitamina B12 molto alta (27,5µg/100g) e selenio molto alto (141µg/100g) coerenti con una frattaglia renale, non un'anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169449 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_beef_liver_raw` (fegato di manzo, Golden Set originale — stesso animale, stessa categoria "frattaglia", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `rognone_di_manzo` ("Rognone di manzo").
- **Attributi**: `--is-heme-iron` (true — frattaglia animale), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169449 --food-id=food_rognone_di_manzo_raw \
  --name-it="Rognone di manzo, crudo" \
  --matrix-id=rognone_di_manzo --matrix-description-it="Rognone di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=169449 --food-id=food_rognone_di_manzo_raw \
  --name-it="Rognone di manzo, crudo" \
  --matrix-id=rognone_di_manzo --matrix-description-it="Rognone di manzo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cuore di pollo, crudo — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_cuore_di_pollo_raw`. FDC ID 171458 (SR Legacy, "Chicken, heart, all classes, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record; coerente, nessuna frattaglia di questa coda li ha). Acido folico 0µg esplicito, separato dal folato totale (72,0µg/100g) — nessuna firma di arricchimento (comunque non applicabile a una carne). Vitamina B12 molto alta (7,29µg/100g, 304% VNR) e ferro/zinco elevati (5,96mg, 6,59mg) coerenti con una frattaglia, non un'anomalia. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 171458 e dataType SR Legacy (release 30 aprile 2026). Scartato "Chicken, broilers or fryers, giblets, raw" (FDC 171057): è un composito fegato+cuore+ventriglio, non il cuore puro richiesto.
- **Analogia usata**: `food_fegato_di_pollo_raw` (fegato di pollo, già eseguito sul DB reale — stessa specie, stessa categoria "frattaglia di pollo", `is_heme_iron=true`).
- **Categoria dieta**: `meat_fish` (frattaglia).
- **Matrice**: nuova `cuore_di_pollo` ("Cuore di pollo").
- **Attributi**: `--is-heme-iron` (true — frattaglia animale), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — non applicabile, nessun carotenoide in un alimento animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=171458 --food-id=food_cuore_di_pollo_raw \
  --name-it="Cuore di pollo, crudo" \
  --matrix-id=cuore_di_pollo --matrix-description-it="Cuore di pollo" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish
```
```
npm run add-food -- --fdc-id=171458 --food-id=food_cuore_di_pollo_raw \
  --name-it="Cuore di pollo, crudo" \
  --matrix-id=cuore_di_pollo --matrix-description-it="Cuore di pollo" \
  --baseline-cooking-state=raw --analogy-food-id=food_fegato_di_pollo_raw \
  --is-heme-iron --diet-category=meat_fish --apply
```

### Cicoria selvatica, cruda — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_cicoria_selvatica_raw`. FDC ID 169992 (SR Legacy, "Chicory greens, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (110µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 169992 e dataType SR Legacy (release 30 aprile 2026). Distinto da "Chicory, witloof, raw" (FDC 170404, già in coda come indivia belga ⚠) e da "Chicory roots, raw" (FDC 169993, radice non foglia — non quello che si intende per "cicoria selvatica" da insalata/verdura cotta).
- **Analogia usata**: `food_scarola_raw` (scarola, già eseguita sul DB reale — stesso genere botanico *Cichorium*, stessa famiglia Asteraceae).
- **Categoria dieta**: `plant_non_fruit` (verdura a foglia).
- **Matrice**: nuova `cicoria_selvatica` ("Cicoria selvatica").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per le altre verdure a foglia di questa coda, le categorie ossalati esistono solo per spinaci/kale/latte), `carotenoid_matrix_state=raw_intact` (beta-carotene 3430µg/100g esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=169992 --food-id=food_cicoria_selvatica_raw \
  --name-it="Cicoria selvatica, cruda" \
  --matrix-id=cicoria_selvatica --matrix-description-it="Cicoria selvatica" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=169992 --food-id=food_cicoria_selvatica_raw \
  --name-it="Cicoria selvatica, cruda" \
  --matrix-id=cicoria_selvatica --matrix-description-it="Cicoria selvatica" \
  --baseline-cooking-state=raw --analogy-food-id=food_scarola_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Asteraceae --apply
```

### Taccole (piselli mangiatutto), crude — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_taccole_raw`. FDC ID 170010 (SR Legacy, "Peas, edible-podded, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (42,0µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 170010 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_peas_green_raw` (piselli freschi crudi, già eseguiti sul DB reale — stessa specie *Pisum sativum*, stessa famiglia Fabaceae; le taccole si mangiano col baccello intero, quindi matrice propria separata invece di riusare `piselli`).
- **Categoria dieta**: `plant_non_fruit` (legume/verdura).
- **Matrice**: nuova `taccole` ("Taccole / piselli mangiatutto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 630µg/100g esplicito, alpha-carotene 44µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=170010 --food-id=food_taccole_raw \
  --name-it="Taccole (piselli mangiatutto), crude" \
  --matrix-id=taccole --matrix-description-it="Taccole (piselli mangiatutto)" \
  --baseline-cooking-state=raw --analogy-food-id=food_peas_green_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=170010 --food-id=food_taccole_raw \
  --name-it="Taccole (piselli mangiatutto), crude" \
  --matrix-id=taccole --matrix-description-it="Taccole (piselli mangiatutto)" \
  --baseline-cooking-state=raw --analogy-food-id=food_peas_green_raw \
  --carotenoid-matrix-state=raw_intact --diet-category=plant_non_fruit \
  --botanical-family=Fabaceae --apply
```

### Fagioli azuki, secchi, crudi — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_fagioli_azuki_raw`. FDC ID 173727 (SR Legacy, "Beans, adzuki, mature seeds, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record; il campo "Vitamin A, RAE" = 1µg con retinolo 0 suggerisce una piccola quota di carotenoidi provitaminici A non scomposta per codice specifico — non stimata, lasciata fuori). Acido folico 0µg esplicito, separato dal folato totale (622µg/100g, alto ma coerente con un legume secco) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 173727 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_kidney_beans_raw` (fagioli rossi crudi, Golden Set originale — stessa famiglia botanica Fabaceae, stesso matrix_id `legumes` già esistente).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: riusa `legumes` (già esistente, nessun `--matrix-description-it` necessario).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — nessun beta-carotene scomposto nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=173727 --food-id=food_fagioli_azuki_raw \
  --name-it="Fagioli azuki, secchi, crudi" \
  --matrix-id=legumes \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=173727 --food-id=food_fagioli_azuki_raw \
  --name-it="Fagioli azuki, secchi, crudi" \
  --matrix-id=legumes \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Fagioli cannellini, secchi, crudi (non bolliti) — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_fagioli_cannellini_secchi_raw`. FDC ID 175202 (SR Legacy, "Beans, white, mature seeds, raw"). Distinto da `food_fagioli_cannellini_bolliti` (già eseguito, FDC 175203, versione bollita) — stessa coppia FDC cruda/cotta già vista per altri legumi di questa coda.
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (388µg/100g) — nessuna firma di arricchimento. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID 175202 e dataType SR Legacy (release 30 aprile 2026).
- **Analogia usata**: `food_kidney_beans_raw` (fagioli rossi crudi, Golden Set originale — stessa famiglia botanica Fabaceae, stesso matrix_id `legumes` già esistente).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: riusa `legumes` (già esistente, nessun `--matrix-description-it` necessario).
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per gli altri legumi del Golden Set), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false).

```
npm run add-food -- --fdc-id=175202 --food-id=food_fagioli_cannellini_secchi_raw \
  --name-it="Fagioli cannellini, secchi, crudi" \
  --matrix-id=legumes \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=175202 --food-id=food_fagioli_cannellini_secchi_raw \
  --name-it="Fagioli cannellini, secchi, crudi" \
  --matrix-id=legumes \
  --baseline-cooking-state=raw --analogy-food-id=food_kidney_beans_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Semolino di grano duro, crudo, non arricchito — preparato 2026-10-15 dal task orario (sesto lotto)

- **food_id**: `food_semolino_di_grano_duro_raw`. FDC ID 168933 (SR Legacy, "Semolina, unenriched").
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record consultato, non assunti zero). Due fonti indipendenti (bodbot.com e eatthismuch.com, entrambe su base "1 cup = 167g") concordano cifra per cifra sui valori per porzione: 601kcal, proteine 21,18g, grassi 1,75g, carboidrati 121,63g, fibra 6,51g, calcio 28,39mg, ferro 2,05mg, zinco 1,75mg, magnesio 78,49mg, rame 0,3mg, folato 120,24µg, vitamina C 0, B12 0 — nessun acido folico riportato separatamente (campo assente, non zero esplicito) e nessun segno di arricchimento in stile USA: per confronto, la variante "enriched" (FDC 169715, eatthismuch id 4825) ha ferro ~4,2mg/100g e folato ~183µg/100g, valori chiaramente più alti per fortificazione — questo record "unenriched" non li ha. Un terzo sito (foodstruct.com) dava per "Semolina" valori contraddittori con intestazione di pagina che citava un alimento diverso (riso), quindi scartato come fonte non attendibile per questo record.
- **Analogia usata**: `food_farina_di_frumento_integrale_raw` (farina di frumento integrale, già eseguita sul DB reale — stessa famiglia botanica Poaceae, stessa categoria "farina/derivato del grano").
- **Categoria dieta**: `plant_non_fruit` (cereale/derivato).
- **Matrice**: nuova `semolino_di_grano_duro` ("Semolino di grano duro").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento degli altri cereali in questa coda), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae` (*Triticum durum*), `baseline_cooking_state=raw`, `is_fortified_folate` omesso (false — nessuna firma di arricchimento, vedi sopra).

```
npm run add-food -- --fdc-id=168933 --food-id=food_semolino_di_grano_duro_raw \
  --name-it="Semolino di grano duro, crudo, non arricchito" \
  --matrix-id=semolino_di_grano_duro --matrix-description-it="Semolino di grano duro" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=168933 --food-id=food_semolino_di_grano_duro_raw \
  --name-it="Semolino di grano duro, crudo, non arricchito" \
  --matrix-id=semolino_di_grano_duro --matrix-description-it="Semolino di grano duro" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_frumento_integrale_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

*(Le voci nuove del task orario si aggiungono in cima a questa sezione; quelle già eseguite stanno in "Eseguiti" in fondo.)*

## Eseguiti (archivio, ultimi 10)

> **Nota (2026-10-13) sulla classificazione dieta degli alimenti qui sotto.** Dalla melanzana in giù in questa lista, sono stati inseriti con la versione di `add-food` precedente alla correzione `--diet-category`: le loro tre colonne `diet_compat_*` risultavano quindi NULL ("non classificato", escluse dai filtri vegetariano/vegano/fruttariano) finche' non e' stato eseguito `fix_diet_compat_pipeline_foods.sql` (**eseguito il 2026-10-13**: l'utente ha confermato a voce che la query di controllo non mostra piu' nessuno di loro come non classificato, senza screenshot rivisto da questa sessione). **Le zucchine, appena sotto, sono il primo alimento eseguito già con `--diet-category` incluso dall'inizio** (diet=plant_non_fruit scritto direttamente, verificato nel riepilogo di scrittura): non serve alcun fix per loro.

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
