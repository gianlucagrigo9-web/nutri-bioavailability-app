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
