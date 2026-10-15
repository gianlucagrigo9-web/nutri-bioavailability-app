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
