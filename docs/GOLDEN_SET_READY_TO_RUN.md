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

*(Le voci nuove del task orario si aggiungono in cima a questa sezione; quelle già eseguite stanno in "Eseguiti" in fondo.)*

### Pesce spada, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_pesce_spada_raw`. FDC ID 173703 (SR Legacy, "Fish, swordfish, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 2µg/100g), vitamina B12 1,7µg/100g esplicito, selenio 57,4µg/100g — nessuna firma di arricchimento.
- **Analogia usata**: `food_salmon_raw` (salmone, già eseguito — stessa funzione di pesce crudo, già usata come analogia per sgombro/merluzzo/tonno/acciughe/vongole/cozze in questa coda).
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `pesce_spada` ("Pesce spada").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, nessuna famiglia botanica (alimento animale), `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=173703 --food-id=food_pesce_spada_raw \
  --name-it="Pesce spada, crudo" \
  --matrix-id=pesce_spada --matrix-description-it="Pesce spada" \
  --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=173703 --food-id=food_pesce_spada_raw \
  --name-it="Pesce spada, crudo" \
  --matrix-id=pesce_spada --matrix-description-it="Pesce spada" \
  --baseline-cooking-state=raw --analogy-food-id=food_salmon_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Seppia, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_seppia_raw`. FDC ID 174215 (SR Legacy, "Mollusks, cuttlefish, mixed species, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero). Acido folico 0µg esplicito (folato totale 16µg/100g), vitamina B12 3,0µg/100g esplicito, selenio 44,8µg/100g — nessuna firma di arricchimento.
- **Analogia usata**: `food_vongole_raw` (vongole, già eseguite — stessa classe Mollusca, stessa logica già usata per calamari/polpo in questo stesso quarto lotto), con `--is-heme-iron` per coerenza con la stessa analogia.
- **Categoria dieta**: `meat_fish`.
- **Matrice**: nuova `seppia` ("Seppia").
- **Attributi**: `is_heme_iron=true`, `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato), `zinc_bioaccessibility_bucket` default `none`, nessuna famiglia botanica (alimento animale, stesso trattamento già usato per pesce/molluschi/carne/funghi in questa coda), `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=174215 --food-id=food_seppia_raw \
  --name-it="Seppia, cruda" \
  --matrix-id=seppia --matrix-description-it="Seppia" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=174215 --food-id=food_seppia_raw \
  --name-it="Seppia, cruda" \
  --matrix-id=seppia --matrix-description-it="Seppia" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Fichi secchi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_fichi_secchi_raw`. FDC ID 174665 (SR Legacy, "Figs, dried, uncooked").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 9µg/100g), vitamina B12 0µg esplicito, beta-carotene 6µg/100g esplicito e non nullo, calcio 162mg/100g (alto ma plausibile: il fico secco è un fico fresco concentrato ~3x dalla disidratazione, coerente con la nota concentrazione di calcio di questo frutto, non una firma di arricchimento tipo acido folico/calcio anomalo già scartata per pane/latte vegetale in questa coda) — nessuna firma di arricchimento.
- **Analogia usata**: `food_fig_raw` (fico fresco, già eseguito — stessa identica specie reale Ficus carica, il fico secco ne è semplicemente la forma disidratata).
- **Categoria dieta**: `plant_non_fruit` — frutta secca/disidratata per il PRD (§4.9), NON `fresh_fruit`.
- **Matrice**: nuova `fichi_secchi` ("Fichi secchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Moraceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=174665 --food-id=food_fichi_secchi_raw \
  --name-it="Fichi secchi" \
  --matrix-id=fichi_secchi --matrix-description-it="Fichi secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_fig_raw \
  --diet-category=plant_non_fruit --botanical-family=Moraceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=174665 --food-id=food_fichi_secchi_raw \
  --name-it="Fichi secchi" \
  --matrix-id=fichi_secchi --matrix-description-it="Fichi secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_fig_raw \
  --diet-category=plant_non_fruit --botanical-family=Moraceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Prugne secche, snocciolate — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_prugne_secche_raw`. FDC ID 168162 (SR Legacy, "Plums, dried (prunes), uncooked").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 4µg/100g), vitamina B12 0µg esplicito, beta-carotene 394µg/100g esplicito e non nullo (plausibile, concentrazione tipica della frutta disidratata) — nessuna firma di arricchimento.
- **Analogia usata**: `food_peach_yellow_raw` (pesca gialla, già eseguita — stesso genere botanico reale Prunus, famiglia Rosaceae, come l'albicocca secca già preparata in questa coda).
- **Categoria dieta**: `plant_non_fruit` — frutta secca/disidratata per il PRD (§4.9), NON `fresh_fruit`.
- **Matrice**: nuova `prugne_secche` ("Prugne secche").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168162 --food-id=food_prugne_secche_raw \
  --name-it="Prugne secche, snocciolate" \
  --matrix-id=prugne_secche --matrix-description-it="Prugne secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=plant_non_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168162 --food-id=food_prugne_secche_raw \
  --name-it="Prugne secche, snocciolate" \
  --matrix-id=prugne_secche --matrix-description-it="Prugne secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=plant_non_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Albicocche secche, solforate — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_albicocche_secche_raw`. FDC ID 173941 (SR Legacy, "Apricots, dried, sulfured, uncooked").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 10µg/100g), vitamina B12 0µg esplicito, beta-carotene 2163µg/100g esplicito (alto ma plausibile, concentrazione tipica delle albicocche disidratate) — nessuna firma di arricchimento.
- **Nota sulla solforazione**: il record è "sulfured" (anidride solforosa come conservante/antiossidante) — pratica standard anche per le albicocche secche italiane/commerciali (spesso etichettate "solforate"), non equivalente al tipo di arricchimento USA (acido folico/calcio anomali) già scartato altrove in questa coda; non cambia la decisione.
- **Analogia usata**: `food_peach_yellow_raw` (pesca gialla, già eseguita — stesso genere botanico reale Prunus, famiglia Rosaceae, più vicina dell'albicocca di quanto lo sia qualunque frutta a guscio).
- **Categoria dieta**: `plant_non_fruit` — frutta secca/disidratata per il PRD (§4.9), NON `fresh_fruit`.
- **Matrice**: nuova `albicocche_secche` ("Albicocche secche").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=173941 --food-id=food_albicocche_secche_raw \
  --name-it="Albicocche secche, solforate" \
  --matrix-id=albicocche_secche --matrix-description-it="Albicocche secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=plant_non_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=173941 --food-id=food_albicocche_secche_raw \
  --name-it="Albicocche secche, solforate" \
  --matrix-id=albicocche_secche --matrix-description-it="Albicocche secche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=plant_non_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Uva passa (sultanina), disidratata — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_uva_passa_raw`. FDC ID 168165 (SR Legacy, "Raisins, dark, seedless (Includes foods for USDA's Food Distribution Program)").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 5µg/100g), vitamina B12 0µg esplicito, beta-carotene 0µg esplicito (plausibile per uva scura disidratata), calcio 62mg/100g nella norma — nessuna firma di arricchimento.
- **Analogia usata**: `food_grapes_european_raw` (stessa specie reale Vitis vinifera, uva europea già eseguita — l'uva passa ne è semplicemente la forma disidratata), famiglia botanica Vitaceae.
- **Categoria dieta**: `plant_non_fruit` — frutta secca/disidratata per il PRD (§4.9), NON `fresh_fruit`.
- **Matrice**: nuova `uva_passa` ("Uva passa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione di mandorle/noci/nocciole/pistacchi/anacardi), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Vitaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168165 --food-id=food_uva_passa_raw \
  --name-it="Uva passa (sultanina), disidratata" \
  --matrix-id=uva_passa --matrix-description-it="Uva passa" \
  --baseline-cooking-state=raw --analogy-food-id=food_grapes_european_raw \
  --diet-category=plant_non_fruit --botanical-family=Vitaceae
```
```
npm run add-food -- --fdc-id=168165 --food-id=food_uva_passa_raw \
  --name-it="Uva passa (sultanina), disidratata" \
  --matrix-id=uva_passa --matrix-description-it="Uva passa" \
  --baseline-cooking-state=raw --analogy-food-id=food_grapes_european_raw \
  --diet-category=plant_non_fruit --botanical-family=Vitaceae --apply
```

### Datteri (Medjool), crudi/disidratati — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_datteri_medjool_raw` (NON `food_dates_raw`: quell'id esiste già nel DB come riga demo legacy del primo seed, fuori dal Golden Set — vedi nota ID riservati in questa coda).
- **Nutrienti**: **15/17** — mancano `selenium_mcg`, `vitamin_b12_mcg` (non riportati nel record, non assunti zero). Acido folico 0µg esplicito (folato totale 15µg/100g), vitamina C 0mg esplicito, beta-carotene 89µg/100g esplicito e non nullo — nessuna firma di arricchimento.
- **Analogia usata**: `food_fig_raw` (fico fresco, già eseguito — stessa funzione di frutto dolce ad alto contenuto di zuccheri, famiglia botanica reale diversa, vedi sotto). Famiglia botanica reale del dattero, Arecaceae (palma, Phoenix dactylifera), dichiarata separatamente, diversa da quella del fico (Moraceae).
- **Categoria dieta**: `plant_non_fruit` — frutta secca/disidratata per il PRD (§4.9), NON `fresh_fruit` (definizione restrittiva: solo frutta fresca).
- **Matrice**: nuova `datteri_medjool` ("Datteri Medjool").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168191 --food-id=food_datteri_medjool_raw \
  --name-it="Datteri (Medjool), crudi/disidratati" \
  --matrix-id=datteri_medjool --matrix-description-it="Datteri Medjool" \
  --baseline-cooking-state=raw --analogy-food-id=food_fig_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168191 --food-id=food_datteri_medjool_raw \
  --name-it="Datteri (Medjool), crudi/disidratati" \
  --matrix-id=datteri_medjool --matrix-description-it="Datteri Medjool" \
  --baseline-cooking-state=raw --analogy-food-id=food_fig_raw \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Semi di canapa, decorticati, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_semi_di_canapa_raw`. FDC ID 170148 (SR Legacy, "Seeds, hemp seed, hulled").
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `vitamin_b12_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero — stesso tipo di gap già accettato per `food_avena_cruda`/`food_castagne_raw`, 13/17). Acido folico 0µg esplicito (folato totale 110µg/100g naturale), vitamina C 0,5mg/100g, beta-carotene 7µg/100g (basso ma esplicito e non nullo) — nessuna firma di arricchimento.
- **Analogia usata**: `food_almonds` (mandorle, già eseguite — stessa funzione "frutta a guscio/semi", stessa logica già usata per noci/nocciole/castagne/anacardi/pistacchi/arachidi in questa coda). Famiglia botanica reale della canapa, Cannabaceae, dichiarata separatamente.
- **Categoria dieta**: `plant_non_fruit` (seme).
- **Matrice**: nuova `semi_di_canapa` ("Semi di canapa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene esplicito e non nullo, stessa convenzione già usata per scalogno/porri/cipolla in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cannabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170148 --food-id=food_semi_di_canapa_raw \
  --name-it="Semi di canapa, decorticati, crudi" \
  --matrix-id=semi_di_canapa --matrix-description-it="Semi di canapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Cannabaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170148 --food-id=food_semi_di_canapa_raw \
  --name-it="Semi di canapa, decorticati, crudi" \
  --matrix-id=semi_di_canapa --matrix-description-it="Semi di canapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Cannabaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Scalogno, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_scalogno_raw`. FDC ID 170499 (SR Legacy, "Shallots, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 34µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_onion_raw` (stessa famiglia botanica reale Amaryllidaceae, bulbo allium, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio).
- **Matrice**: nuova `scalogno` ("Scalogno").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 3µg/100g, basso ma esplicito e non nullo, stessa convenzione già usata per cipolla/porri in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaryllidaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170499 --food-id=food_scalogno_raw \
  --name-it="Scalogno, crudo" \
  --matrix-id=scalogno --matrix-description-it="Scalogno" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170499 --food-id=food_scalogno_raw \
  --name-it="Scalogno, crudo" \
  --matrix-id=scalogno --matrix-description-it="Scalogno" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Ravanelli, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_ravanelli_raw`. FDC ID 169276 (SR Legacy, "Radishes, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 25µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_broccoli_raw` (stessa famiglia botanica reale Brassicaceae, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio a radice).
- **Matrice**: nuova `ravanelli` ("Ravanelli").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per questo tipo di radice), `carotenoid_matrix_state=raw_intact` (beta-carotene 4µg/100g, basso ma esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169276 --food-id=food_ravanelli_raw \
  --name-it="Ravanelli, crudi" \
  --matrix-id=ravanelli --matrix-description-it="Ravanelli" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169276 --food-id=food_ravanelli_raw \
  --name-it="Ravanelli, crudi" \
  --matrix-id=ravanelli --matrix-description-it="Ravanelli" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Indivia belga, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_indivia_belga_raw`. FDC ID 170404 (SR Legacy, "Chicory, witloof, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero). Acido folico 0µg esplicito (folato totale 37µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_lettuce_romaine_raw` (stessa famiglia botanica reale Asteraceae, ortaggio a foglia da insalata, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio).
- **Matrice**: nuova `indivia_belga` ("Indivia belga").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non assunto zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170404 --food-id=food_indivia_belga_raw \
  --name-it="Indivia belga, cruda" \
  --matrix-id=indivia_belga --matrix-description-it="Indivia belga" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=170404 --food-id=food_indivia_belga_raw \
  --name-it="Indivia belga, cruda" \
  --matrix-id=indivia_belga --matrix-description-it="Indivia belga" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Scarola, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_scarola_raw`. FDC ID 168412 (SR Legacy, "Endive, raw").
- **Deviazione dichiarata**: nessun record FDC dedicato a "escarole, raw" trovato — l'unico record "escarole" esistente in FDC è cotto ("Escarole, cooked, boiled, drained, no salt added", FDC 168413), stato di cottura diverso da quello richiesto dalla voce di coda ("scarola, cruda"). Usato invece "Endive, raw" (FDC 168412): stessa specie botanica *Cichorium endivia*, solo varietà a foglia riccia (indivia riccia) invece che a foglia larga (scarola) — stessa pianta, cultivar diversa, non un proxy di specie diversa come altri casi ⚠ di questa coda (es. orata/porgy).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 142µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_lettuce_romaine_raw` (stessa famiglia botanica reale Asteraceae, ortaggio a foglia da insalata, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio).
- **Matrice**: nuova `scarola` ("Scarola").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 1300µg/100g esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168412 --food-id=food_scarola_raw \
  --name-it="Scarola, cruda" \
  --matrix-id=scarola --matrix-description-it="Scarola" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168412 --food-id=food_scarola_raw \
  --name-it="Scarola, cruda" \
  --matrix-id=scarola --matrix-description-it="Scarola" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Rapa, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_rapa_raw`. FDC ID 170465 (SR Legacy, "Turnips, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 15µg/100g naturale), vitamina B12 0µg, calcio 30mg/100g nella norma per un ortaggio a radice — nessuna firma di arricchimento.
- **Analogia usata**: `food_broccoli_raw` (stessa famiglia botanica reale Brassicaceae — organo diverso, radice invece di infiorescenza, stessa logica già usata per `food_barbabietola_rossa_raw`/`food_spinach_raw` in questa coda — già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio a radice).
- **Matrice**: nuova `rapa` ("Rapa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170465 --food-id=food_rapa_raw \
  --name-it="Rapa, cruda" \
  --matrix-id=rapa --matrix-description-it="Rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae
```
```
npm run add-food -- --fdc-id=170465 --food-id=food_rapa_raw \
  --name-it="Rapa, cruda" \
  --matrix-id=rapa --matrix-description-it="Rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae --apply
```

### Peperoncino piccante, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_peperoncino_piccante_raw`. FDC ID 170106 (SR Legacy, "Peppers, hot chili, red, raw").
- **Nota sulla verifica dell'FDC ID**: questo FDC ID non è stato aperto direttamente su fdc.nal.usda.gov in questa sessione (avrebbe richiesto un'approvazione di provenienza non ottenuta) — stesso livello di cautela già dichiarato per le acciughe in questa coda. È corroborato da due fonti aggregatore indipendenti (logixpathchef.com e myfooddata.com) che citano esplicitamente "170106" per questa identica descrizione, più una terza fonte (triagemethod.com) che conferma descrizione e dataset SR Legacy con un profilo nutrizionale completo e coerente — non un singolo riferimento non corroborato come nei casi ⚠ (pasta di semola, semi di girasole) scartati altrove in questa coda.
- **Nutrienti**: **17/17** (fonte triagemethod.com, tutti i valori etichettati esplicitamente SR Legacy, nessun mix con AFCD). Acido folico 0µg esplicito (folato totale 23µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_pepper_red_raw` (stesso genere botanico *Capsicum*, famiglia Solanaceae, peperone dolce già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente "frutto", stessa convenzione già usata per i peperoni dolci in questa coda).
- **Matrice**: nuova `peperoncino_piccante` ("Peperoncino piccante").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 534µg/100g esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170106 --food-id=food_peperoncino_piccante_raw \
  --name-it="Peperoncino piccante, crudo" \
  --matrix-id=peperoncino_piccante --matrix-description-it="Peperoncino piccante" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170106 --food-id=food_peperoncino_piccante_raw \
  --name-it="Peperoncino piccante, crudo" \
  --matrix-id=peperoncino_piccante --matrix-description-it="Peperoncino piccante" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Pompelmo rosa, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_pompelmo_rosa_raw`. FDC ID 174673 (SR Legacy, "Grapefruit, raw, pink and red, all areas").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 13µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_oranges_raw` (stessa famiglia botanica reale Rutaceae, agrume, già eseguito sul DB reale).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `pompelmo` ("Pompelmo rosa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 686µg/100g esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=174673 --food-id=food_pompelmo_rosa_raw \
  --name-it="Pompelmo rosa, crudo" \
  --matrix-id=pompelmo --matrix-description-it="Pompelmo rosa" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=174673 --food-id=food_pompelmo_rosa_raw \
  --name-it="Pompelmo rosa, crudo" \
  --matrix-id=pompelmo --matrix-description-it="Pompelmo rosa" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Nespole, crude — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_nespole_raw`. FDC ID 169908 (SR Legacy, "Loquats, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero; il record riporta comunque "Vitamin A, RAE" già derivato, non usato qui perché il progetto traccia il beta-carotene grezzo, non il derivato). Acido folico 0µg esplicito (folato totale 14µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_pear_raw` (stessa famiglia botanica reale Rosaceae, frutto "pomo", già eseguito sul DB reale).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `nespole` ("Nespole").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato nel record, non assunto zero), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169908 --food-id=food_nespole_raw \
  --name-it="Nespole, crude" \
  --matrix-id=nespole --matrix-description-it="Nespole" \
  --baseline-cooking-state=raw --analogy-food-id=food_pear_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae
```
```
npm run add-food -- --fdc-id=169908 --food-id=food_nespole_raw \
  --name-it="Nespole, crude" \
  --matrix-id=nespole --matrix-description-it="Nespole" \
  --baseline-cooking-state=raw --analogy-food-id=food_pear_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae --apply
```

### Lime, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_lime_raw`. FDC ID 168155 (SR Legacy, "Limes, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 8µg/100g naturale), vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_lemon_peeled_raw` (stessa famiglia botanica reale Rutaceae, agrume, già eseguito sul DB reale).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `lime` ("Lime").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 30µg/100g esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168155 --food-id=food_lime_raw \
  --name-it="Lime, crudo" \
  --matrix-id=lime --matrix-description-it="Lime" \
  --baseline-cooking-state=raw --analogy-food-id=food_lemon_peeled_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168155 --food-id=food_lime_raw \
  --name-it="Lime, crudo" \
  --matrix-id=lime --matrix-description-it="Lime" \
  --baseline-cooking-state=raw --analogy-food-id=food_lemon_peeled_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Cime di rapa, crude — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_cime_di_rapa_raw`. FDC ID 170381 (SR Legacy, "Broccoli raab, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (83µg/100g) — nessuna firma di arricchimento. Calcio 108mg/100g e vitamina K alta (224µg/100g), coerenti con una brassicacea a foglia/infiorescenza. Beta-carotene 1.573µg/100g esplicito (alto), alfa-carotene e beta-criptoxantina entrambi 0 esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Corrispondenza del nome**: "broccoli raab"/"rapini" è il nome con cui FDC cataloga esattamente le cime di rapa italiane — stessa specie *Brassica rapa* (var. *rapa*/*sylvestris*, le infiorescenze immature con foglie usate in Italia per "orecchiette e cime di rapa"), non un proxy approssimativo come altri casi ⚠ di questa coda.
- **Analogia usata**: `food_broccoli_raw` (broccoli, già eseguiti nel Golden Set originale — stessa famiglia botanica reale **Brassicaceae**, stessa categoria funzionale "infiorescenza/foglia crucifera cruda").
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cime_di_rapa` ("Cime di rapa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per broccoli/verza/cavolo cappuccio in questa coda, nessuna categoria ossalati stabilita), `carotenoid_matrix_state=raw_intact` (beta-carotene 1.573µg/100g, alto ed esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170381 --food-id=food_cime_di_rapa_raw \
  --name-it="Cime di rapa, crude" \
  --matrix-id=cime_di_rapa --matrix-description-it="Cime di rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170381 --food-id=food_cime_di_rapa_raw \
  --name-it="Cime di rapa, crude" \
  --matrix-id=cime_di_rapa --matrix-description-it="Cime di rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_broccoli_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Bietole da costa, crude — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_bietole_da_costa_raw`. FDC ID 169991 (SR Legacy, "Chard, swiss, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (14µg/100g) — nessuna firma di arricchimento. Calcio 51mg/100g, vitamina K molto alta (830µg/100g) e beta-carotene alto (3.647µg/100g), entrambi coerenti con una foglia verde scura come la bietola. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_spinach_raw` (spinaci, già eseguiti nel Golden Set originale — stessa famiglia botanica reale **Amaranthaceae**, Beta vulgaris come la bietola da costa è imparentata botanicamente con le barbabietole/spinaci, stessa categoria funzionale "foglia verde cruda").
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `bietole_da_costa` ("Bietole da costa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati specificamente stabilita per la bietola nel modello Heaney&Weaver usato dal motore: solo spinaci/kale/latte hanno una categoria dichiarata in questo progetto; assegnarne una per analogia sarebbe una stima non dichiarata come tale, quindi evitata), `carotenoid_matrix_state=raw_intact` (beta-carotene 3.647µg/100g, alto ed esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaranthaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169991 --food-id=food_bietole_da_costa_raw \
  --name-it="Bietole da costa, crude" \
  --matrix-id=bietole_da_costa --matrix-description-it="Bietole da costa" \
  --baseline-cooking-state=raw --analogy-food-id=food_spinach_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169991 --food-id=food_bietole_da_costa_raw \
  --name-it="Bietole da costa, crude" \
  --matrix-id=bietole_da_costa --matrix-description-it="Bietole da costa" \
  --baseline-cooking-state=raw --analogy-food-id=food_spinach_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Cavolo cappuccio bianco, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_cavolo_cappuccio_raw`. FDC ID 169975 (SR Legacy, "Cabbage, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (38µg/100g) — nessuna firma di arricchimento. Calcio 40mg/100g, nella norma per una brassicacea cruda. Beta-carotene 42µg/100g esplicito, alfa-carotene 33µg/100g esplicito, beta-criptoxantina 0 esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Nota sul nome**: questo FDC ID era già stato individuato nel secondo lotto come record generico/liscio per "cavolo cappuccio", ma esplicitamente **non usato** per la voce "verza" (vedi quella voce in questo stesso file: FDC 170388 "Cabbage, savoy, raw", foglia increspata, composizione leggermente diversa) proprio per riservarlo a questa voce distinta — nessun doppione.
- **Analogia usata**: `food_kale_raw` (cavolo kale, già eseguito nel Golden Set originale — stessa famiglia botanica reale **Brassicaceae**, foglia cruda).
- **Categoria dieta**: `plant_non_fruit` (verdura).
- **Matrice**: nuova `cavolo_cappuccio` ("Cavolo cappuccio").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per il cavolo cappuccio nel modello Heaney&Weaver usato dal motore, stesso trattamento già usato per broccoli/verza/rucola in questa coda), `carotenoid_matrix_state=raw_intact` (beta-carotene 42µg/100g, esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169975 --food-id=food_cavolo_cappuccio_raw \
  --name-it="Cavolo cappuccio bianco, crudo" \
  --matrix-id=cavolo_cappuccio --matrix-description-it="Cavolo cappuccio" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169975 --food-id=food_cavolo_cappuccio_raw \
  --name-it="Cavolo cappuccio bianco, crudo" \
  --matrix-id=cavolo_cappuccio --matrix-description-it="Cavolo cappuccio" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Lenticchie rosse, decorticate, crude — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_lenticchie_rosse_raw`. FDC ID 174284 (SR Legacy, "Lentils, pink or red, raw").
- **Nutrienti**: **16/17** — manca `vitamin_k_mcg` (non riportato nella pagina, non assunto zero). Acido folico 0µg esplicito, separato dal folato totale (204µg/100g) — nessuna firma di arricchimento. Calcio 48mg/100g, nella norma per un legume secco. Beta-carotene 35µg/100g esplicito (non nullo). Selenio 0µg esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_lentils_raw` (lenticchie comuni, crude e secche, già eseguite nel Golden Set originale — stessa specie *Lens culinaris*, solo varietà diversa: l'analogia più diretta possibile).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `lenticchie_rosse` ("Lenticchie rosse decorticate").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per le lenticchie comuni nel Golden Set), `carotenoid_matrix_state=raw_intact` (beta-carotene 35µg/100g, esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=174284 --food-id=food_lenticchie_rosse_raw \
  --name-it="Lenticchie rosse, decorticate, crude" \
  --matrix-id=lenticchie_rosse --matrix-description-it="Lenticchie rosse decorticate" \
  --baseline-cooking-state=raw --analogy-food-id=food_lentils_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=174284 --food-id=food_lenticchie_rosse_raw \
  --name-it="Lenticchie rosse, decorticate, crude" \
  --matrix-id=lenticchie_rosse --matrix-description-it="Lenticchie rosse decorticate" \
  --baseline-cooking-state=raw --analogy-food-id=food_lentils_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Piselli secchi, spezzati, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_piselli_secchi_spezzati_raw`. FDC ID 172428 (SR Legacy, "Peas, green, split, mature seeds, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (15µg/100g) — nessuna firma di arricchimento. Calcio 46mg/100g, nella norma per un legume secco. Beta-carotene 89µg/100g esplicito (non nullo), alfa-carotene e beta-criptoxantina entrambi 0 esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType. Diverso sia dai piselli freschi crudi (`food_peas_green_raw`, FDC 170419) sia dai piselli verdi bolliti (`food_piselli_bolliti`, FDC 170420) già nel Golden Set: questo è il seme maturo secco spezzato, non il pisello fresco immaturo.
- **Analogia usata**: `food_lentils_raw` (lenticchie, crude e secche, già eseguite nel Golden Set originale — stessa categoria funzionale "legume secco crudo", stessa famiglia botanica reale **Fabaceae**).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `piselli_secchi_spezzati` ("Piselli secchi spezzati").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento già usato per lenticchie/ceci/fagioli nel Golden Set, nessuna categoria ossalati stabilita per i legumi), `carotenoid_matrix_state=raw_intact` (beta-carotene 89µg/100g, esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=172428 --food-id=food_piselli_secchi_spezzati_raw \
  --name-it="Piselli secchi, spezzati, crudi" \
  --matrix-id=piselli_secchi_spezzati --matrix-description-it="Piselli secchi spezzati" \
  --baseline-cooking-state=raw --analogy-food-id=food_lentils_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=172428 --food-id=food_piselli_secchi_spezzati_raw \
  --name-it="Piselli secchi, spezzati, crudi" \
  --matrix-id=piselli_secchi_spezzati --matrix-description-it="Piselli secchi spezzati" \
  --baseline-cooking-state=raw --analogy-food-id=food_lentils_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Topinambur, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_topinambur_raw`. FDC ID 169236 (SR Legacy, "Jerusalem-artichokes, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (13µg/100g) — nessuna firma di arricchimento. Calcio 14mg/100g, basso e coerente con un tubero crudo. Beta-carotene 12µg/100g esplicito (basso ma non nullo). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_potato_raw` (patata, già eseguita — analogia solo funzionale "tubero crudo", stessa logica già usata per la patata dolce in questa coda). Famiglia botanica reale del topinambur, **Asteraceae** (Helianthus tuberosus — è un tubero di girasole, non ha nessuna parentela con la patata), dichiarata separatamente, diversa da quella della patata (Solanaceae).
- **Categoria dieta**: `plant_non_fruit` (tubero).
- **Matrice**: nuova `topinambur` ("Topinambur").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per i tuberi in questo progetto), `carotenoid_matrix_state=raw_intact` (beta-carotene 12µg/100g, basso ma esplicito e non nullo, stessa convenzione già usata per segale/amaranto in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169236 --food-id=food_topinambur_raw \
  --name-it="Topinambur, crudo" \
  --matrix-id=topinambur --matrix-description-it="Topinambur" \
  --baseline-cooking-state=raw --analogy-food-id=food_potato_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169236 --food-id=food_topinambur_raw \
  --name-it="Topinambur, crudo" \
  --matrix-id=topinambur --matrix-description-it="Topinambur" \
  --baseline-cooking-state=raw --analogy-food-id=food_potato_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Amaranto, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_amaranto_raw`. FDC ID 170682 (SR Legacy, "Amaranth grain, uncooked").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (82µg/100g) — nessuna firma di arricchimento. Calcio 159mg/100g, alto per un seme ma è una caratteristica naturale nota dell'amaranto (pseudocereale, non un vero cereale), non accompagnata da altri segnali di arricchimento (vitamina D assente, nessun'altra anomalia) — diverso quindi dai casi scartati altrove in questa coda (es. bevande vegetali) dove il calcio alto era accompagnato da vitamina D/B12 inattese. Beta-carotene 1µg/100g esplicito (basso ma non nullo). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_orzo_perlato_raw` (orzo perlato, già eseguito — analogia solo funzionale "cereale/pseudocereale crudo non cotto", stesso tipo di analogia funzionale senza parentela botanica già usata per cacao/olio di cocco in questa coda). Famiglia botanica reale dell'amaranto, **Amaranthaceae** (Amaranthus spp.), dichiarata separatamente, diversa da quella dell'orzo (Poaceae).
- **Categoria dieta**: `plant_non_fruit` (pseudocereale).
- **Matrice**: nuova `amaranto` ("Amaranto").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per questo tipo di alimento nel modello Heaney&Weaver usato dal motore, nonostante il calcio non trascurabile), `carotenoid_matrix_state=raw_intact` (beta-carotene 1µg/100g, basso ma esplicito e non nullo, stessa convenzione già usata per segale/semi di sesamo/zucca in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaranthaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170682 --food-id=food_amaranto_raw \
  --name-it="Amaranto, crudo" \
  --matrix-id=amaranto --matrix-description-it="Amaranto" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170682 --food-id=food_amaranto_raw \
  --name-it="Amaranto, crudo" \
  --matrix-id=amaranto --matrix-description-it="Amaranto" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Segale, integrale, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_segale_raw`. FDC ID 168884 (SR Legacy, "Rye grain").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (38µg/100g) — nessuna firma di arricchimento. Calcio 24mg/100g, nella norma per un cereale. Beta-carotene 7µg/100g esplicito (basso ma non nullo), alfa-carotene e beta-criptoxantina entrambi 0 esplicito. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_orzo_perlato_raw` (orzo perlato, già eseguito — stessa categoria funzionale "cereale crudo non cotto", stessa famiglia botanica reale **Poaceae**, Secale cereale come l'orzo appartiene alle graminacee).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `segale` ("Segale").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per i cereali in questo progetto), `carotenoid_matrix_state=raw_intact` (beta-carotene 7µg/100g, basso ma esplicito e non nullo, stessa convenzione già usata per semi di sesamo/zucca in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168884 --food-id=food_segale_raw \
  --name-it="Segale, integrale, cruda" \
  --matrix-id=segale --matrix-description-it="Segale" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168884 --food-id=food_segale_raw \
  --name-it="Segale, integrale, cruda" \
  --matrix-id=segale --matrix-description-it="Segale" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Miglio, decorticato, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_miglio_raw`. FDC ID 169702 (SR Legacy, "Millet, raw").
- **Nutrienti**: **15/17** — mancano `beta_carotene_mcg` e `other_provitamin_a_carotenoids_mcg` (non riportati nella pagina, non assunti zero). Acido folico 0µg esplicito, separato dal folato totale (85µg/100g) — nessuna firma di arricchimento. Calcio 8mg/100g, basso e coerente con un cereale non arricchito (stesso ordine di grandezza di riso/orzo già nel Golden Set). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_orzo_perlato_raw` (orzo perlato, già eseguito — stessa categoria funzionale "cereale crudo non cotto", stessa famiglia botanica reale **Poaceae**).
- **Categoria dieta**: `plant_non_fruit` (cereale).
- **Matrice**: nuova `miglio` ("Miglio").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati stabilita per i cereali in questo progetto), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato, non 0 esplicito: non c'è un valore su cui basare lo stato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169702 --food-id=food_miglio_raw \
  --name-it="Miglio, decorticato, crudo" \
  --matrix-id=miglio --matrix-description-it="Miglio" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=169702 --food-id=food_miglio_raw \
  --name-it="Miglio, decorticato, crudo" \
  --matrix-id=miglio --matrix-description-it="Miglio" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Fegato di pollo, crudo — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_fegato_di_pollo_raw`. FDC ID 171060 (SR Legacy, "Chicken, liver, all classes, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (588µg/100g, molto alto ma atteso per il fegato — stesso ordine di grandezza del fegato di manzo già nel Golden Set) — nessuna firma di arricchimento. Vitamina E aggiunta e B12 aggiunta entrambe 0. Beta-carotene 56µg/100g, alfa-carotene 11µg/100g, beta-criptoxantina 11µg/100g — valori non nulli ma plausibili per un organo di deposito di vitamina A (coerente con la vitamina A RAE molto alta, 3.296µg/100g).
- **Analogia usata**: `food_beef_liver_raw` (fegato di manzo, già presente nei 30 alimenti originali del Golden Set — stesso organo, stessa categoria funzionale "fegato", solo specie animale diversa: l'analogia più diretta possibile in questa coda).
- **Categoria dieta**: `meat_fish` (frattaglia/carne: vegetariano NO, vegano NO, fruttariano NO).
- **Matrice**: nuova `fegato_di_pollo` ("Fegato di pollo").
- **Attributi**: `is_heme_iron=true` (fegato, ferro eme, stessa convenzione di `food_beef_liver_raw`), `matrix_category_calcium` omesso (NULL, non applicabile — stesso trattamento del fegato di manzo), `carotenoid_matrix_state` omesso (NULL — stesso trattamento del fegato di manzo, nessun fattore di cottura carotenoidi applicabile a un organo animale), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=171060 --food-id=food_fegato_di_pollo_raw \
  --name-it="Fegato di pollo, crudo" \
  --matrix-id=fegato_di_pollo --matrix-description-it="Fegato di pollo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=171060 --food-id=food_fegato_di_pollo_raw \
  --name-it="Fegato di pollo, crudo" \
  --matrix-id=fegato_di_pollo --matrix-description-it="Fegato di pollo" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_liver_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Castagne, crude, sbucciate — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_castagne_raw`. FDC ID 170575 (SR Legacy, "Nuts, chestnuts, european, raw, peeled").
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero — stesso tipo di gap già accettato per `food_avena_cruda`, 13/17 con gli stessi 4 nutrienti mancanti). Acido folico 0µg esplicito (folato totale 58µg/100g), vitamina B12 0µg esplicito — nessuna firma di arricchimento. **Nota sulla fibra**: il riepilogo della prima fonte consultata (getfoodfacts.com) mostrava "0g" in contraddizione con la tabella dettagliata — corretto con una seconda fonte (recipal.com, stesso FDC record per descrizione): fibra ≈7,1g/100g, valore plausibile per una castagna, non realmente zero.
- **Analogia usata**: `food_almonds` (mandorle, già eseguite — stessa funzione "frutta a guscio", stessa logica già usata per noci/nocciole/anacardi in questa coda). Famiglia botanica reale della castagna, Fagaceae (Castanea sativa, castagno europeo — coerente con il castagno coltivato in Italia), dichiarata separatamente, diversa da quella delle mandorle.
- **Categoria dieta**: `plant_non_fruit` (frutta a guscio).
- **Matrice**: nuova `castagne` ("Castagne").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non riportato, stesso trattamento già usato per altra frutta a guscio in questa coda), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fagaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170575 --food-id=food_castagne_raw \
  --name-it="Castagne, crude, sbucciate" \
  --matrix-id=castagne --matrix-description-it="Castagne" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Fagaceae
```
```
npm run add-food -- --fdc-id=170575 --food-id=food_castagne_raw \
  --name-it="Castagne, crude, sbucciate" \
  --matrix-id=castagne --matrix-description-it="Castagne" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Fagaceae --apply
```

### Cacao amaro in polvere, non zuccherato — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_cacao_amaro_raw`. FDC ID 169593 (SR Legacy, "Cocoa, dry powder, unsweetened").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (32µg/100g) — nessuna firma di arricchimento. Il record non specifica se trattato con alcali (dutch process) o naturale, ma la descrizione "dry powder, unsweetened" senza ulteriori qualificatori è coerente con un cacao amaro non trattato (il record "processed with alkali" è un record FDC distinto, non usato qui). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_farina_di_mais_raw` (farina di mais, già eseguita — stessa categoria funzionale "polvere vegetale secca non cotta", nessuna parentela botanica: famiglia reale del cacao, Malvaceae (Theobroma cacao), dichiarata separatamente).
- **Categoria dieta**: `plant_non_fruit` (derivato vegetale in polvere).
- **Matrice**: nuova `cacao_amaro` ("Cacao amaro in polvere").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — calcio 128mg/100g non trascurabile ma nessuna categoria ossalati stabilita per questo tipo di alimento), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Malvaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169593 --food-id=food_cacao_amaro_raw \
  --name-it="Cacao amaro in polvere, non zuccherato" \
  --matrix-id=cacao_amaro --matrix-description-it="Cacao amaro in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --diet-category=plant_non_fruit --botanical-family=Malvaceae
```
```
npm run add-food -- --fdc-id=169593 --food-id=food_cacao_amaro_raw \
  --name-it="Cacao amaro in polvere, non zuccherato" \
  --matrix-id=cacao_amaro --matrix-description-it="Cacao amaro in polvere" \
  --baseline-cooking-state=raw --analogy-food-id=food_farina_di_mais_raw \
  --diet-category=plant_non_fruit --botanical-family=Malvaceae --apply
```

### Olio di cocco — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_olio_di_cocco_raw`. FDC ID 171412 (SR Legacy, "Oil, coconut").
- **Nutrienti**: **17/17** (18 voci, vedi nota olio di girasole). Quasi tutti i valori sono zero esplicito (coerente con un olio puro). Vitamina K 0,60µg/100g, calcio 1,00mg/100g, ferro 0,050mg/100g, zinco 0,020mg/100g (tracce, non arricchimento). Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType. Il record non specifica se raffinato o vergine — nessuno dei 17 nutrienti tracciati da questo progetto ne sarebbe influenzato.
- **Deviazione dichiarata sull'analogia**: stessa situazione dell'olio di semi di girasole (nessun olio vegetale ancora eseguito sul DB reale). Analogia solo funzionale: `food_burro` (burro, già eseguito — stessa categoria concettuale "fonte di grasso quasi puro").
- **Categoria dieta**: `plant_non_fruit` (oli vegetali).
- **Matrice**: nuova `olio_di_cocco` ("Olio di cocco").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — calcio 1mg/100g, traccia), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Arecaceae` (Cocos nucifera), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=171412 --food-id=food_olio_di_cocco_raw \
  --name-it="Olio di cocco" \
  --matrix-id=olio_di_cocco --matrix-description-it="Olio di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae
```
```
npm run add-food -- --fdc-id=171412 --food-id=food_olio_di_cocco_raw \
  --name-it="Olio di cocco" \
  --matrix-id=olio_di_cocco --matrix-description-it="Olio di cocco" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit --botanical-family=Arecaceae --apply
```

### Olio di semi di girasole — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_olio_di_girasole_raw`. FDC ID 171025 (SR Legacy, "Oil, sunflower, linoleic, (approx. 65%)").
- **Nutrienti**: **17/17** (18 voci nella pagina, contando separatamente alfa-carotene e beta-criptoxantina). Quasi tutti i valori sono zero esplicito (proteine, carboidrati, calcio, ferro, zinco, magnesio, rame, selenio, vitamina C, folato, acido folico, B12, beta-carotene, altri carotenoidi) — coerente con un olio puro (quasi 100% grassi), non un segnale di dato mancante: ogni voce compare con un valore numerico nella pagina, non è un'assenza. Vitamina K 5,40µg/100g. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Deviazione dichiarata sull'analogia**: nessun olio vegetale è ancora stato eseguito sul DB reale (l'olio extravergine d'oliva resta ⚠, mai eseguito). L'analogia è quindi solo funzionale, non botanica: `food_burro` (burro, già eseguito — stessa categoria concettuale "fonte di grasso quasi puro", stessa logica già usata altrove in questa coda per analogie solo funzionali senza parentela biologica, es. coniglio/manzo, agnello/manzo). Gli attributi categorici effettivi (is_heme_iron, matrix_category_calcium, carotenoid_matrix_state) sono comunque tutti determinati direttamente dai valori espliciti del record (tutti nulli/zero), non dedotti dall'analogia.
- **Categoria dieta**: `plant_non_fruit` (oli vegetali, come da definizione esplicita nel PRD §9 punto 2d).
- **Matrice**: nuova `olio_di_girasole` ("Olio di semi di girasole").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — calcio 0 esplicito), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae` (Helianthus annuus), `baseline_cooking_state=raw` (olio non riscaldato dopo l'estrazione; il record non specifica se raffinato o spremuto a freddo, ma nessuno dei 17 nutrienti tracciati da questo progetto ne sarebbe influenzato).

```
npm run add-food -- --fdc-id=171025 --food-id=food_olio_di_girasole_raw \
  --name-it="Olio di semi di girasole" \
  --matrix-id=olio_di_girasole --matrix-description-it="Olio di semi di girasole" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=171025 --food-id=food_olio_di_girasole_raw \
  --name-it="Olio di semi di girasole" \
  --matrix-id=olio_di_girasole --matrix-description-it="Olio di semi di girasole" \
  --baseline-cooking-state=raw --analogy-food-id=food_burro \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Gorgonzola — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_gorgonzola`. FDC ID 172175 (SR Legacy, "Cheese, blue").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (36µg/100g) — nessuna firma di arricchimento. Calcio 528mg/100g e sodio coerenti con un formaggio erborinato stagionato. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Proxy dichiarato**: nessun record FDC rappresenta specificamente il Gorgonzola DOP italiano. Il record SR Legacy generico "Cheese, blue" rappresenta la categoria USA dei formaggi erborinati (tipo Roquefort/blue cheese commerciale), tipicamente anch'esso a latte vaccino come il Gorgonzola reale (a differenza del caso Pecorino Romano, dove lo scostamento era sul tipo di latte: qui il latte è coerente, ma la tecnica di stagionatura/muffa e la consistenza — più morbida e cremosa nel Gorgonzola DOP, più friabile nel "blue cheese" USA da condimento insalate — non sono verificate equivalenti). Stesso tipo di proxy dichiarato già usato in questa coda per branzino/anatra/mandarini (record generico più vicino disponibile, nessuna invenzione di dati).
- **Analogia usata**: `food_mozzarella` (mozzarella, già eseguita — stessa categoria "formaggio a latte vaccino", stessa convenzione `matrix_category_calcium=medium_oxalate` di tutti i latticini/formaggi nel Golden Set).
- **Categoria dieta**: `egg_dairy` (latticino: vegetariano SÌ, vegano NO, fruttariano NO).
- **Matrice**: nuova `gorgonzola` ("Gorgonzola").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium=medium_oxalate` (stessa convenzione di tutti i latticini/formaggi già nel Golden Set, come per la feta), `carotenoid_matrix_state` omesso (NULL — stesso trattamento di tutti i formaggi nel Golden Set nonostante il beta-carotene non nullo, 74µg/100g: la distinzione raw_intact/cooked_or_disrupted non si applica a un prodotto fermentato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto animale), `baseline_cooking_state=fresh` (stessa convenzione di mozzarella/ricotta/feta: formaggio pronto al consumo).

```
npm run add-food -- --fdc-id=172175 --food-id=food_gorgonzola \
  --name-it="Gorgonzola" \
  --matrix-id=gorgonzola --matrix-description-it="Gorgonzola" \
  --baseline-cooking-state=fresh --analogy-food-id=food_mozzarella \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=172175 --food-id=food_gorgonzola \
  --name-it="Gorgonzola" \
  --matrix-id=gorgonzola --matrix-description-it="Gorgonzola" \
  --baseline-cooking-state=fresh --analogy-food-id=food_mozzarella \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
```

### Calamari, crudi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_calamari_raw`. FDC ID 174223 (SR Legacy, "Mollusks, squid, mixed species, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene, beta-criptoxantina e vitamina K tutti 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_vongole_raw` (vongole crude, già eseguito — stessa categoria concettuale "mollusco crudo con ferro eme", stessa logica usata per il polpo in questo stesso run).
- **Categoria dieta**: `meat_fish` (frutti di mare/mollusco: vegetariano NO, vegano NO, fruttariano NO).
- **Matrice**: nuova `calamari` ("Calamari").
- **Attributi**: `is_heme_iron=true` (mollusco, stessa convenzione di vongole/cozze/acciughe/polpo), `matrix_category_calcium` omesso (NULL, non applicabile), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=174223 --food-id=food_calamari_raw \
  --name-it="Calamari, crudi" \
  --matrix-id=calamari --matrix-description-it="Calamari" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=174223 --food-id=food_calamari_raw \
  --name-it="Calamari, crudi" \
  --matrix-id=calamari --matrix-description-it="Calamari" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Polpo, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_polpo_raw`. FDC ID 174218 (SR Legacy, "Mollusks, octopus, common, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (16µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti. Fonte: getfoodfacts.com, pagina che cita esplicitamente FDC ID e dataType.
- **Analogia usata**: `food_vongole_raw` (vongole crude, già eseguito — stessa categoria concettuale "mollusco crudo con ferro eme", più specifica di un pesce: il polpo è un mollusco cefalopode, le vongole un mollusco bivalve, entrambi non vertebrati acquatici con la stessa convenzione `is_heme_iron=true` già usata per vongole/cozze/acciughe in questa coda).
- **Categoria dieta**: `meat_fish` (frutti di mare/mollusco: vegetariano NO, vegano NO, fruttariano NO).
- **Matrice**: nuova `polpo` ("Polpo").
- **Attributi**: `is_heme_iron=true` (mollusco, stessa convenzione di vongole/cozze/acciughe nel Golden Set), `matrix_category_calcium` omesso (NULL, non applicabile), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=174218 --food-id=food_polpo_raw \
  --name-it="Polpo, crudo" \
  --matrix-id=polpo --matrix-description-it="Polpo" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=174218 --food-id=food_polpo_raw \
  --name-it="Polpo, crudo" \
  --matrix-id=polpo --matrix-description-it="Polpo" \
  --baseline-cooking-state=raw --analogy-food-id=food_vongole_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Feta — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_feta`. FDC ID 173420 (SR Legacy, "Cheese, feta").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (32µg/100g) — nessuna firma di arricchimento. Calcio 493mg/100g e sodio 1139mg/100g sono alti ma coerenti con un formaggio stagionato in salamoia (atteso per la feta, non un segnale di anomalia o arricchimento).
- **Analogia usata**: `food_milk_whole` (latte vaccino intero, già eseguito — stessa convenzione già usata per `food_mozzarella`/`food_ricotta`/`food_parmigiano_reggiano`: stessa categoria "latticino", `matrix_category_calcium=medium_oxalate`, `botanical_family` NULL, `is_heme_iron=false`).
- **Categoria dieta**: `egg_dairy` (latticino: vegetariano SÌ, vegano NO, fruttariano NO).
- **Matrice**: nuova `feta` ("Feta").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium=medium_oxalate` (stessa convenzione di tutti i latticini/formaggi già nel Golden Set), `carotenoid_matrix_state` omesso (NULL — beta-carotene 3µg/100g, basso, stesso trattamento già usato per gli altri formaggi che non hanno questo campo valorizzato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — prodotto animale), `baseline_cooking_state=fresh` (stessa convenzione di mozzarella/ricotta: formaggio pronto al consumo, non un prodotto cotto).

```
npm run add-food -- --fdc-id=173420 --food-id=food_feta \
  --name-it="Feta" \
  --matrix-id=feta --matrix-description-it="Feta" \
  --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy
```
```
npm run add-food -- --fdc-id=173420 --food-id=food_feta \
  --name-it="Feta" \
  --matrix-id=feta --matrix-description-it="Feta" \
  --baseline-cooking-state=fresh --analogy-food-id=food_milk_whole \
  --matrix-category-calcium=medium_oxalate --diet-category=egg_dairy --apply
```

### Branzino, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_branzino_raw`. FDC ID 175142 (SR Legacy, "Fish, sea bass, mixed species, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (5µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti.
- **Deviazione dichiarata**: nessun record FDC specifico per "branzino"/spigola europea (Dicentrarchus labrax) trovato — il genere USDA più vicino, "sea bass", è riportato solo come "mixed species" (categoria generica che raggruppa più specie di spigola/branzino nordamericane, non necessariamente D. labrax). Nessun record SR Legacy/Foundation per "European sea bass" o specie-specifico trovato in ricerca. Accettato come proxy dichiarato — stessa logica già usata per mandarini/clementine in questa coda (specie/varietà affine, non verificata separatamente).
- **Analogia usata**: `food_merluzzo_raw` (merluzzo, già eseguito — stessa categoria funzionale "pesce bianco magro crudo", profilo lipidico comparabile, più vicino del salmone che è un pesce grasso).
- **Categoria dieta**: `meat_fish` (pesce).
- **Matrice**: nuova `branzino` ("Branzino").
- **Attributi**: `is_heme_iron=true` (pesce, come merluzzo/salmone/tonno nel Golden Set), `matrix_category_calcium` omesso (NULL, non applicabile a un pesce), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=175142 --food-id=food_branzino_raw \
  --name-it="Branzino, crudo" \
  --matrix-id=branzino --matrix-description-it="Branzino" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=175142 --food-id=food_branzino_raw \
  --name-it="Branzino, crudo" \
  --matrix-id=branzino --matrix-description-it="Branzino" \
  --baseline-cooking-state=raw --analogy-food-id=food_merluzzo_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Anatra, carne senza pelle, cruda — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_anatra_raw`. FDC ID 172410 (SR Legacy, "Duck, domesticated, meat only, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (25µg/100g) — nessuna firma di arricchimento. Beta-carotene, alfa-carotene e beta-criptoxantina tutti 0µg espliciti.
- **Deviazione dichiarata dalla voce di coda** ("anatra (petto), cruda"): nessun record SR Legacy/Foundation trovato per "anatra, domestica, petto, carne senza pelle, CRUDA" con copertura nutrienti sufficiente — l'unico record "breast" trovato per anatra domestica è cotto ("broiled"), e l'unico "breast" crudo disponibile è di anatra SELVATICA ("Duck, wild, breast, meat only, raw" FDC 174469), specie/allevamento diverso da quella domestica normalmente in commercio. Usato invece il record generico "Duck, domesticated, meat only, raw" (carne senza pelle, non specifico per taglio) — il petto è il taglio più magro e più comune della stessa carne, composizione simile ma non identica; nome alimento corretto in "Anatra, carne senza pelle, cruda" per non spacciarlo per il petto specifico.
- **Analogia usata**: `food_petto_di_pollo_raw` (petto di pollo crudo, già eseguito — stessa categoria funzionale "carne di volatile, senza pelle, cruda, ferro eme", più vicina taxonomicamente di un mammifero: entrambi uccelli).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `anatra` ("Anatra").
- **Attributi**: `is_heme_iron=true` (carne/pollame contiene ferro eme, stessa convenzione di salmone/pollo/manzo nel Golden Set), `matrix_category_calcium` omesso (NULL, non applicabile a una carne), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=172410 --food-id=food_anatra_raw \
  --name-it="Anatra, carne senza pelle, cruda" \
  --matrix-id=anatra --matrix-description-it="Anatra" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=172410 --food-id=food_anatra_raw \
  --name-it="Anatra, carne senza pelle, cruda" \
  --matrix-id=anatra --matrix-description-it="Anatra" \
  --baseline-cooking-state=raw --analogy-food-id=food_petto_di_pollo_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Coniglio, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_coniglio_raw`. FDC ID 172521 (SR Legacy, "Game meat, rabbit, domesticated, composite of cuts, raw" — verificato apertura diretta del record su `fdc.nal.usda.gov/portal-data/external/172521`, non solo aggregatore).
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (assenti dall'array `foodNutrients` del record, non assunti zero — stesso gap tipico già dichiarato per `food_vitello_raw`/`food_agnello_raw`, atteso per una carne). **Acido folico**: 0µg presente nel record ma con codice di derivazione "Z" ("valore assunto", non misurato) — standard USDA per nutrienti attesi trascurabili in questo gruppo alimentare (carne non arricchita non contiene acido folico per definizione), non un segnale di arricchimento né un'incertezza sul match.
- **Analogia usata**: `food_beef_ground_raw` (manzo macinato crudo, già eseguito — stessa categoria funzionale "carne rossa di mammifero crudo con ferro eme", stessa logica già usata per vitello/agnello in questo run; famiglia reale diversa — coniglio = Oryctolagus cuniculus, manzo = Bos taurus — nessuna parentela biologica, solo analogia di categoria).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `coniglio` ("Coniglio").
- **Attributi**: `is_heme_iron=true` (carne, come manzo/maiale/vitello/agnello), `matrix_category_calcium` omesso (NULL, non applicabile a una carne), `carotenoid_matrix_state` omesso (NULL — nessun carotenoide riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=172521 --food-id=food_coniglio_raw \
  --name-it="Coniglio, crudo" \
  --matrix-id=coniglio --matrix-description-it="Coniglio" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=172521 --food-id=food_coniglio_raw \
  --name-it="Coniglio, crudo" \
  --matrix-id=coniglio --matrix-description-it="Coniglio" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Agnello, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_agnello_raw`. FDC ID 174338 (SR Legacy, "Lamb, New Zealand, imported, frozen, composite of trimmed retail cuts, separable lean only, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero — stesso gap tipico già dichiarato per `food_vitello_raw`, atteso per una carne). Acido folico 0µg esplicito, folato totale 0µg esplicito (non assente: valore riportato) — nessuna firma di arricchimento. **Nota**: selenio 1,50µg/100g è basso rispetto ad altre carni del Golden Set (es. manzo 15,8-21,5µg) — valore esplicito del record, non un errore: la Nuova Zelanda ha aree con suoli poveri di selenio, un fattore agronomico noto e documentato, non un'anomalia da scartare.
- **Perché il record "composite"**: la voce di coda chiede "agnello" in generale — scelto il record che rappresenta la media dei tagli al dettaglio ("composite of trimmed retail cuts"), stessa logica già usata per `food_vitello_raw` in questo stesso run. Scartato il record "Australian, imported" equivalente (FDC 174399): stessa descrizione concettuale ma copertura nutrienti inferiore (manca anche la vitamina B12... in realtà presente, ma manca folato/vitamina C, circa 11/17 contro i 14/17 di questo record neozelandese).
- **Analogia usata**: `food_beef_ground_raw` (manzo macinato crudo, già eseguito — stessa categoria funzionale "carne rossa di mammifero crudo con ferro eme", stessa logica già usata per pollo/tacchino/maiale nel Golden Set; famiglia reale diversa — agnello = Ovis aries, manzo = Bos taurus — nessuna parentela biologica, solo analogia di categoria).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `agnello` ("Agnello").
- **Attributi**: `is_heme_iron=true` (carne rossa, come manzo/maiale/vitello nel Golden Set/coda), `matrix_category_calcium` omesso (NULL, non applicabile a una carne), `carotenoid_matrix_state` omesso (NULL — nessun carotenoide riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=174338 --food-id=food_agnello_raw \
  --name-it="Agnello, crudo" \
  --matrix-id=agnello --matrix-description-it="Agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=174338 --food-id=food_agnello_raw \
  --name-it="Agnello, crudo" \
  --matrix-id=agnello --matrix-description-it="Agnello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Vitello, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_vitello_raw`. FDC ID 173817 (SR Legacy, "Veal, composite of trimmed retail cuts, separable lean only, raw").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non riportati nel record, non assunti zero; per una carne è un gap atteso/tipico, non un segnale di match debole — vitamina K e carotenoidi sono tracce quasi nulle nella carne anche quando il record USDA le riporta esplicitamente, come per il manzo nel Golden Set). Acido folico 0µg esplicito, separato dal folato totale (13µg/100g) — nessuna firma di arricchimento.
- **Perché il record "composite"**: la voce di coda chiede "vitello" in generale, non un taglio specifico — il record "composite of trimmed retail cuts" (media pesata dei tagli al dettaglio più comuni) rappresenta meglio un vitello generico di quanto farebbe un singolo taglio (lombo, girello, ecc.), stessa logica già usata altrove nel Golden Set per i tagli generici di pollo/manzo.
- **Analogia usata**: `food_beef_ground_raw` (manzo macinato crudo, già eseguito — non solo analogia di funzione: vitello e manzo sono la stessa specie reale, Bos taurus, solo età dell'animale diversa — parentela biologica più stretta di qualunque analogia usata finora in questa coda).
- **Categoria dieta**: `meat_fish` (carne).
- **Matrice**: nuova `vitello` ("Vitello").
- **Attributi**: `is_heme_iron=true` (carne rossa, come manzo/maiale/agnello nel Golden Set — ferro eme), `matrix_category_calcium` omesso (NULL, non applicabile a una carne), `carotenoid_matrix_state` omesso (NULL — nessun carotenoide riportato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family` omesso (NULL — alimento animale, nessuna famiglia botanica, stesso trattamento di manzo/salmone/pollo nel Golden Set), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=173817 --food-id=food_vitello_raw \
  --name-it="Vitello, crudo" \
  --matrix-id=vitello --matrix-description-it="Vitello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron
```
```
npm run add-food -- --fdc-id=173817 --food-id=food_vitello_raw \
  --name-it="Vitello, crudo" \
  --matrix-id=vitello --matrix-description-it="Vitello" \
  --baseline-cooking-state=raw --analogy-food-id=food_beef_ground_raw \
  --diet-category=meat_fish --is-heme-iron --apply
```

### Semi di lino, interi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_semi_di_lino_interi_raw` (NON `food_flaxseed_raw`: quell'id è riservato, collide con una riga demo legacy — vedi nota ID riservati in questo file/PRD).
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (87µg/100g interamente naturale), vitamina B12 0µg, beta-carotene/alfa-carotene/beta-criptoxantina tutti 0µg espliciti — nessuna firma di arricchimento.
- **Analogia usata**: `food_almonds` (mandorle, già eseguito — stessa funzione "frutta a guscio/seme oleoso", stessa logica già usata per pistacchi/anacardi/arachidi/semi di sesamo in questa coda). Famiglia botanica reale del lino, Linaceae (Linum usitatissimum), dichiarata separatamente — diversa da quella delle mandorle (Rosaceae), nessuna parentela botanica.
- **Categoria dieta**: `plant_non_fruit` (seme oleoso).
- **Matrice**: nuova `semi_di_lino` ("Semi di lino").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento degli altri semi/frutta a guscio in questa coda), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione già usata per melograno/sedano rapa), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Linaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169414 --food-id=food_semi_di_lino_interi_raw \
  --name-it="Semi di lino, interi" \
  --matrix-id=semi_di_lino --matrix-description-it="Semi di lino" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Linaceae
```
```
npm run add-food -- --fdc-id=169414 --food-id=food_semi_di_lino_interi_raw \
  --name-it="Semi di lino, interi" \
  --matrix-id=semi_di_lino --matrix-description-it="Semi di lino" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Linaceae --apply
```

### Semi di sesamo, secchi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_semi_di_sesamo_raw`. FDC ID 170150 (SR Legacy, "Seeds, sesame seeds, whole, dried").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato totale (97µg/100g interamente naturale) — nessuna firma di arricchimento. Calcio 975mg/100g è molto alto ma è un valore noto e reale per il seme di sesamo intero (il calcio è concentrato nel tegumento esterno del seme), non un segnale di arricchimento in stile USA (che qui sarebbe comunque incoerente: non è un prodotto da forno).
- **Analogia usata**: `food_almonds` (mandorle, già eseguito — stessa funzione "frutta a guscio/seme oleoso", stessa logica già usata per pistacchi/anacardi/arachidi in questa coda). Famiglia botanica reale del sesamo, Pedaliaceae (Sesamum indicum), dichiarata separatamente — diversa da quella delle mandorle (Rosaceae), nessuna parentela botanica.
- **Categoria dieta**: `plant_non_fruit` (seme oleoso).
- **Matrice**: nuova `semi_di_sesamo` ("Semi di sesamo").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento di mandorle/noci/nocciole/pistacchi/anacardi/arachidi: nessuna categoria ossalati dichiarata per frutta a guscio/semi), `carotenoid_matrix_state=raw_intact` (beta-carotene 5µg/100g, basso ma esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Pedaliaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=170150 --food-id=food_semi_di_sesamo_raw \
  --name-it="Semi di sesamo, secchi" \
  --matrix-id=semi_di_sesamo --matrix-description-it="Semi di sesamo" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Pedaliaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170150 --food-id=food_semi_di_sesamo_raw \
  --name-it="Semi di sesamo, secchi" \
  --matrix-id=semi_di_sesamo --matrix-description-it="Semi di sesamo" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Pedaliaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Semi di zucca, secchi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_semi_di_zucca_raw`. FDC ID 170556 (SR Legacy, "Seeds, pumpkin and squash seed kernels, dried").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 58µg/100g interamente naturale) — nessuna firma di arricchimento.
- **Analogia usata**: `food_pumpkin_raw` (zucca, già eseguito — stessa famiglia botanica reale Cucurbitaceae, Cucurbita pepo/Cucurbita spp., gli stessi semi del frutto della zucca).
- **Categoria dieta**: `plant_non_fruit` (semi).
- **Matrice**: nuova `semi_di_zucca` ("Semi di zucca").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 9µg/100g, basso ma esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170556 --food-id=food_semi_di_zucca_raw \
  --name-it="Semi di zucca, secchi" \
  --matrix-id=semi_di_zucca --matrix-description-it="Semi di zucca" \
  --baseline-cooking-state=raw --analogy-food-id=food_pumpkin_raw \
  --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170556 --food-id=food_semi_di_zucca_raw \
  --name-it="Semi di zucca, secchi" \
  --matrix-id=semi_di_zucca --matrix-description-it="Semi di zucca" \
  --baseline-cooking-state=raw --analogy-food-id=food_pumpkin_raw \
  --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Arachidi, crude non salate — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_arachidi_raw`. FDC ID 172430 (SR Legacy, "Peanuts, all types, raw").
- **Nutrienti**: **17/17**. Beta-carotene, alfa-carotene, beta-criptoxantina e vitamina K 0µg tutti espliciti; acido folico 0µg esplicito (folato totale 240µg/100g interamente naturale) — nessuna firma di arricchimento. Sodio 18mg/100g, coerente con un prodotto crudo non salato (non dichiarato esplicitamente "unsalted" nella descrizione, ma il valore è troppo basso per un prodotto salato).
- **Analogia usata**: `food_chickpeas_raw` (ceci, già eseguito — l'arachide è botanicamente un legume, Fabaceae, stessa famiglia reale dei ceci, non solo un'analogia di funzione).
- **Categoria dieta**: `plant_non_fruit` (legume/frutta a guscio).
- **Matrice**: nuova `arachidi` ("Arachidi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=172430 --food-id=food_arachidi_raw \
  --name-it="Arachidi, crude non salate" \
  --matrix-id=arachidi --matrix-description-it="Arachidi" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=172430 --food-id=food_arachidi_raw \
  --name-it="Arachidi, crude non salate" \
  --matrix-id=arachidi --matrix-description-it="Arachidi" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Anacardi, crudi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_anacardi_raw`. FDC ID 170162 (SR Legacy, "Nuts, cashew nuts, raw").
- **Nutrienti**: **17/17**. Beta-carotene, alfa-carotene e beta-criptoxantina 0µg tutti espliciti; acido folico 0µg esplicito (folato totale 25µg/100g interamente naturale) — nessuna firma di arricchimento.
- **Analogia usata**: `food_almonds` (mandorle, già eseguito — stessa funzione "frutta a guscio" già usata per noci/nocciole, famiglia botanica reale diversa — vedi sotto). La famiglia botanica reale dell'anacardo, Anacardiaceae, è la stessa dei pistacchi, ma `food_pistacchi_raw` non è ancora eseguito sul DB reale (solo "pronto"): per questo l'analogia dichiarata resta `food_almonds`, coerente con la regola che richiede un alimento già presente nel DB.
- **Categoria dieta**: `plant_non_fruit` (frutta a guscio).
- **Matrice**: nuova `anacardi` ("Anacardi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione di mandorle/noci/nocciole/pistacchi), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Anacardiaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170162 --food-id=food_anacardi_raw \
  --name-it="Anacardi, crudi" \
  --matrix-id=anacardi --matrix-description-it="Anacardi" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Anacardiaceae
```
```
npm run add-food -- --fdc-id=170162 --food-id=food_anacardi_raw \
  --name-it="Anacardi, crudi" \
  --matrix-id=anacardi --matrix-description-it="Anacardi" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Anacardiaceae --apply
```

### Mandarini (e clementine), crudi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_mandarini_raw`. FDC ID 169105 (SR Legacy, "Tangerines, (mandarin oranges), raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 16µg/100g interamente naturale) — nessuna firma di arricchimento.
- **Analogia usata**: `food_oranges_raw` (arance, già eseguito — stessa famiglia botanica reale Rutaceae, stesso genere Citrus dell'arancia).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `mandarini` ("Mandarini").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 155µg/100g, alfa-carotene 101µg/100g, beta-criptoxantina 407µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rutaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169105 --food-id=food_mandarini_raw \
  --name-it="Mandarini (e clementine), crudi" \
  --matrix-id=mandarini --matrix-description-it="Mandarini" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169105 --food-id=food_mandarini_raw \
  --name-it="Mandarini (e clementine), crudi" \
  --matrix-id=mandarini --matrix-description-it="Mandarini" \
  --baseline-cooking-state=raw --analogy-food-id=food_oranges_raw \
  --diet-category=fresh_fruit --botanical-family=Rutaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Cachi, crudi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_cachi_raw`. FDC ID 169941 (SR Legacy, "Persimmons, japanese, raw" — la varietà giapponese/kaki, Diospyros kaki, è quella coltivata e venduta in Italia; scartato a priori "Persimmons, native, raw" FDC 169943, specie diversa, Diospyros virginiana, astringente, non commercializzata in Italia).
- **Nutrienti**: **17/17**. Alfa-carotene 0µg esplicito; acido folico 0µg esplicito (folato totale 8µg/100g interamente naturale) — nessuna firma di arricchimento.
- **Analogia usata**: `food_melone_cantalupo_raw` (melone cantalupo, già eseguito — analogia di funzione "frutto fresco a polpa arancione, ricco di carotenoidi", stessa categoria `fresh_fruit`. **Deviazione dichiarata**: famiglia botanica reale del cachi è Ebenaceae (Diospyros kaki), diversa da quella del melone, Cucurbitaceae — nessuna Ebenaceae già presente nel Golden Set).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `cachi` ("Cachi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 253µg/100g, beta-criptoxantina 1.447µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Ebenaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169941 --food-id=food_cachi_raw \
  --name-it="Cachi, crudi" \
  --matrix-id=cachi --matrix-description-it="Cachi" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --diet-category=fresh_fruit --botanical-family=Ebenaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169941 --food-id=food_cachi_raw \
  --name-it="Cachi, crudi" \
  --matrix-id=cachi --matrix-description-it="Cachi" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --diet-category=fresh_fruit --botanical-family=Ebenaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Melograno (arilli), crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_melograno_raw`. FDC ID 169134 (SR Legacy, "Pomegranates, raw" — record sugli arilli/chicchi commestibili, non sul frutto intero con buccia, coerente con la voce di coda).
- **Nutrienti**: **17/17**. Beta-carotene, alfa-carotene e beta-criptoxantina 0µg tutti espliciti; acido folico 0µg esplicito (folato totale 38µg/100g interamente naturale) — nessuna firma di arricchimento.
- **Analogia usata**: `food_grapes_european_raw` (uva, già eseguito — analogia di funzione "frutto fresco con piccoli semi/arilli commestibili", stessa categoria `fresh_fruit`. **Deviazione dichiarata**: famiglia botanica reale del melograno è Lythraceae (Punica granatum), diversa da quella dell'uva, Vitaceae — nessuna Lythraceae già presente nel Golden Set).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `melograno` ("Melograno").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione già usata per sedano rapa/funghi champignon), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Lythraceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169134 --food-id=food_melograno_raw \
  --name-it="Melograno (arilli), crudo" \
  --matrix-id=melograno --matrix-description-it="Melograno" \
  --baseline-cooking-state=raw --analogy-food-id=food_grapes_european_raw \
  --diet-category=fresh_fruit --botanical-family=Lythraceae
```
```
npm run add-food -- --fdc-id=169134 --food-id=food_melograno_raw \
  --name-it="Melograno (arilli), crudo" \
  --matrix-id=melograno --matrix-description-it="Melograno" \
  --baseline-cooking-state=raw --analogy-food-id=food_grapes_european_raw \
  --diet-category=fresh_fruit --botanical-family=Lythraceae --apply
```

### Prugne, crude — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_prugne_raw`. FDC ID 169949 (SR Legacy, "Plums, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 5µg/100g interamente naturale), alfa-carotene 0µg esplicito — nessuna firma di arricchimento.
- **Analogia usata**: `food_peach_yellow_raw` (pesche gialle, già eseguito — stessa famiglia botanica reale Rosaceae, stesso genere Prunus della prugna).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `prugne` ("Prugne").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 190µg/100g, beta-criptoxantina 35µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169949 --food-id=food_prugne_raw \
  --name-it="Prugne, crude" \
  --matrix-id=prugne --matrix-description-it="Prugne" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169949 --food-id=food_prugne_raw \
  --name-it="Prugne, crude" \
  --matrix-id=prugne --matrix-description-it="Prugne" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Mirtilli, crudi — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_mirtilli_raw`. FDC ID 171711 (SR Legacy, "Blueberries, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato totale 6µg/100g interamente naturale), alfa-carotene e beta-criptoxantina 0µg espliciti — nessuna firma di arricchimento.
- **Analogia usata**: `food_strawberry_raw` (fragole, già eseguito — analogia di funzione "frutto a bacca piccola, fresco", stessa categoria `fresh_fruit`. **Deviazione dichiarata**: famiglia botanica reale del mirtillo è Ericaceae (Vaccinium), diversa da quella della fragola, Rosaceae — nessuna famiglia Ericaceae già presente nel Golden Set da cui prendere l'analogia esatta, stessa logica già usata per `food_patata_dolce_raw`/`food_quinoa_dry_raw` quando l'analogia botanica esatta manca).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `mirtilli` ("Mirtilli").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 32µg/100g, esplicito e non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Ericaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=171711 --food-id=food_mirtilli_raw \
  --name-it="Mirtilli, crudi" \
  --matrix-id=mirtilli --matrix-description-it="Mirtilli" \
  --baseline-cooking-state=raw --analogy-food-id=food_strawberry_raw \
  --diet-category=fresh_fruit --botanical-family=Ericaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=171711 --food-id=food_mirtilli_raw \
  --name-it="Mirtilli, crudi" \
  --matrix-id=mirtilli --matrix-description-it="Mirtilli" \
  --baseline-cooking-state=raw --analogy-food-id=food_strawberry_raw \
  --diet-category=fresh_fruit --botanical-family=Ericaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Sedano rapa, crudo — preparato 2026-10-14 dal task orario (terzo lotto)

- **food_id**: `food_sedano_rapa_raw`. FDC ID 170400 (SR Legacy, "Celeriac, raw").
- **Nutrienti**: **17/17**. Beta-carotene, alfa-carotene e beta-criptoxantina 0µg tutti espliciti; acido folico 0µg esplicito (folato totale 8µg/100g, interamente naturale) — nessuna firma di arricchimento, calcio 43mg/100g nella norma per un tubero/radice.
- **Analogia usata**: `food_sedano_raw` (sedano, Apium graveolens var. dulce — il sedano rapa, Apium graveolens var. rapaceum, è la stessa specie botanica, solo varietà coltivata per la radice invece che per il gambo; già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio a radice).
- **Matrice**: nuova `sedano_rapa` ("Sedano rapa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento del sedano/carote/patate, nessuna categoria ossalati dichiarata per le radici), `carotenoid_matrix_state` omesso (NULL — beta-carotene 0µg esplicito, stessa convenzione già usata per i funghi champignon: nessun fattore carotenoide da applicare su un valore nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Apiaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170400 --food-id=food_sedano_rapa_raw \
  --name-it="Sedano rapa, crudo" \
  --matrix-id=sedano_rapa --matrix-description-it="Sedano rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae
```
```
npm run add-food -- --fdc-id=170400 --food-id=food_sedano_rapa_raw \
  --name-it="Sedano rapa, crudo" \
  --matrix-id=sedano_rapa --matrix-description-it="Sedano rapa" \
  --baseline-cooking-state=raw --analogy-food-id=food_sedano_raw \
  --diet-category=plant_non_fruit --botanical-family=Apiaceae --apply
```

### Peperoni verdi, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_pepper_green_raw`. FDC ID 170427 (SR Legacy, "Peppers, sweet, green, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_pepper_red_raw` (stessa specie reale Capsicum annuum, famiglia Solanaceae, già eseguito — solo varietà di colore diversa, come per il giallo preparato nello stesso run).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `peperoni_verdi` ("Peperoni verdi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 208µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170427 --food-id=food_pepper_green_raw \
  --name-it="Peperoni verdi, crudi" \
  --matrix-id=peperoni_verdi --matrix-description-it="Peperoni verdi" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170427 --food-id=food_pepper_green_raw \
  --name-it="Peperoni verdi, crudi" \
  --matrix-id=peperoni_verdi --matrix-description-it="Peperoni verdi" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Peperoni gialli, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_pepper_yellow_raw`. FDC ID 169383 (SR Legacy, "Peppers, sweet, yellow, raw").
- **Nutrienti**: **15/17** — mancano `vitamin_k_mcg` (non riportato) e `other_provitamin_a_carotenoids_mcg` (non riportato). Acido folico 0µg esplicito, vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_pepper_red_raw` (stessa specie reale Capsicum annuum, famiglia Solanaceae, già eseguito sul DB reale — solo varietà di colore diversa).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente frutto, come il peperone rosso già nel Golden Set).
- **Matrice**: nuova `peperoni_gialli` ("Peperoni gialli").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 120µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Solanaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169383 --food-id=food_pepper_yellow_raw \
  --name-it="Peperoni gialli, crudi" \
  --matrix-id=peperoni_gialli --matrix-description-it="Peperoni gialli" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169383 --food-id=food_pepper_yellow_raw \
  --name-it="Peperoni gialli, crudi" \
  --matrix-id=peperoni_gialli --matrix-description-it="Peperoni gialli" \
  --baseline-cooking-state=raw --analogy-food-id=food_pepper_red_raw \
  --diet-category=plant_non_fruit --botanical-family=Solanaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Carciofi, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_carciofi_raw`. FDC ID 169205 (SR Legacy, "Artichokes, (globe or french), raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato alimentare 68µg/100g naturale), vitamina B12 0µg, alfa-carotene e beta-criptoxantina 0µg — tutti valori espliciti, nessuna firma di arricchimento.
- **Analogia usata**: `food_lettuce_romaine_raw` (stessa famiglia botanica reale Asteraceae — carciofo e lattuga appartengono entrambi alle Asteraceae, stessa logica già usata per il radicchio).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `carciofi` ("Carciofi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 8µg/100g, basso ma non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169205 --food-id=food_carciofi_raw \
  --name-it="Carciofi, crudi" \
  --matrix-id=carciofi --matrix-description-it="Carciofi" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169205 --food-id=food_carciofi_raw \
  --name-it="Carciofi, crudi" \
  --matrix-id=carciofi --matrix-description-it="Carciofi" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Fagiolini, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_fagiolini_raw`. FDC ID 169961 (SR Legacy, "Beans, snap, green, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_chickpeas_raw` (stessa famiglia botanica reale Fabaceae, già eseguito).
- **Categoria dieta**: `plant_non_fruit` (legume/verdura).
- **Matrice**: nuova `fagiolini` ("Fagiolini").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 379µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169961 --food-id=food_fagiolini_raw \
  --name-it="Fagiolini, crudi" \
  --matrix-id=fagiolini --matrix-description-it="Fagiolini" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169961 --food-id=food_fagiolini_raw \
  --name-it="Fagiolini, crudi" \
  --matrix-id=fagiolini --matrix-description-it="Fagiolini" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Cetrioli, crudi (con buccia) — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_cetrioli_raw`. FDC ID 168409 (SR Legacy, "Cucumber, with peel, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, vitamina B12 0µg — nessuna firma di arricchimento.
- **Analogia usata**: `food_zucchine_raw` (stessa famiglia botanica reale Cucurbitaceae, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit` (ortaggio botanicamente frutto, come zucchine/pomodori già nel Golden Set).
- **Matrice**: nuova `cetrioli` ("Cetrioli").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 45µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=168409 --food-id=food_cetrioli_raw \
  --name-it="Cetrioli, crudi (con buccia)" \
  --matrix-id=cetrioli --matrix-description-it="Cetrioli" \
  --baseline-cooking-state=raw --analogy-food-id=food_zucchine_raw \
  --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168409 --food-id=food_cetrioli_raw \
  --name-it="Cetrioli, crudi (con buccia)" \
  --matrix-id=cetrioli --matrix-description-it="Cetrioli" \
  --baseline-cooking-state=raw --analogy-food-id=food_zucchine_raw \
  --diet-category=plant_non_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Tofu, al naturale (con solfato di calcio) — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_tofu_raw`. FDC ID 172475 (SR Legacy, "Tofu, raw, firm, prepared with calcium sulfate").
- **Nutrienti**: **14/17** — mancano `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non trovati nel record, non assunti zero). Acido folico 0µg esplicito, folato alimentare 29µg/100g naturale, vitamina B12 0µg — nessuna firma di arricchimento tipo pane/pasta.
- **Nota sul calcio**: 683mg/100g, molto più alto di un legume crudo tipico — **non è un segnale di arricchimento stile USA**: deriva dal solfato di calcio usato come coagulante nella produzione del tofu "firm", un ingrediente reale e atteso per questo tipo di prodotto (non un additivo nascosto). Il contenuto di calcio del tofu varia molto in pratica a seconda del coagulante (nigari/cloruro di magnesio darebbe un calcio molto più basso) — questo record rappresenta la variante con solfato di calcio, non "il" tofu in assoluto; dichiarato qui per trasparenza, non verificabile quale coagulante sia più comune nel tofu italiano venduto al dettaglio.
- **Analogia usata**: `food_chickpeas_raw` (stessa famiglia botanica reale Fabaceae — il tofu è un derivato della soia).
- **Categoria dieta**: `plant_non_fruit` (derivato della soia, legume).
- **Matrice**: nuova `tofu` ("Tofu").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — nessuna categoria ossalati/coagulante dichiarata nel progetto per il tofu, stesso trattamento dei legumi), `carotenoid_matrix_state` omesso (NULL — beta-carotene non trovato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw` (FDC lo descrive esplicitamente "raw"), `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=172475 --food-id=food_tofu_raw \
  --name-it="Tofu, al naturale (con solfato di calcio)" \
  --matrix-id=tofu --matrix-description-it="Tofu" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=172475 --food-id=food_tofu_raw \
  --name-it="Tofu, al naturale (con solfato di calcio)" \
  --matrix-id=tofu --matrix-description-it="Tofu" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

### Semi di soia, secchi, crudi — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_soia_secca_raw`. FDC ID 174270 (SR Legacy, "Soybeans, mature seeds, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito (folato alimentare 375µg/100g interamente naturale), vitamina B12 0µg, alfa-carotene e beta-criptoxantina 0µg — tutti valori espliciti, nessuna firma di arricchimento USA.
- **Analogia usata**: `food_chickpeas_raw` (stessa famiglia botanica reale Fabaceae, legume secco crudo, già nel DB reale).
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `soia_secca` ("Semi di soia secchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — stesso trattamento di ceci/lenticchie/fagioli, la categoria ossalati è dichiarata solo per spinaci/kale/latte), `carotenoid_matrix_state=raw_intact` (beta-carotene 13µg/100g, basso ma non nullo e esplicitamente riportato), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=174270 --food-id=food_soia_secca_raw \
  --name-it="Semi di soia, secchi, crudi" \
  --matrix-id=soia_secca --matrix-description-it="Semi di soia secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=174270 --food-id=food_soia_secca_raw \
  --name-it="Semi di soia, secchi, crudi" \
  --matrix-id=soia_secca --matrix-description-it="Semi di soia secchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Quinoa, secca, cruda — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_quinoa_dry_raw` (NON `food_quinoa_raw`: quell'id esiste già nel DB come riga demo legacy del primo seed — vedi nota ID riservati in questo file/PRD).
- **Nutrienti**: **16/17** — manca solo `vitamin_c_mg` (non riportato nel record). Acido folico 0µg esplicito, folato alimentare 184µg/100g interamente naturale — nessuna firma di arricchimento. Vitamina K (fillochinone) 0µg esplicito.
- **Analogia usata**: `food_orzo_perlato_raw` (analogia di funzione/categoria "cereale/pseudocereale secco crudo non arricchito", già eseguito nel DB reale). **Deviazione dichiarata**: la famiglia botanica reale della quinoa è Amaranthaceae (Chenopodium quinoa), non Poaceae come l'orzo — stessa logica già usata per `food_patata_dolce_raw` rispetto a `food_potato_raw` (analogia di funzione, famiglia botanica reale diversa, dichiarata esplicitamente).
- **Categoria dieta**: `plant_non_fruit` (cereale e derivati, come da coda PRD).
- **Matrice**: nuova `quinoa` ("Quinoa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 8µg/100g, basso ma non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaranthaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=168874 --food-id=food_quinoa_dry_raw \
  --name-it="Quinoa, secca, cruda" \
  --matrix-id=quinoa --matrix-description-it="Quinoa" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=168874 --food-id=food_quinoa_dry_raw \
  --name-it="Quinoa, secca, cruda" \
  --matrix-id=quinoa --matrix-description-it="Quinoa" \
  --baseline-cooking-state=raw --analogy-food-id=food_orzo_perlato_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Couscous, crudo (non cotto) — preparato 2026-10-14 dal task orario (quarto lotto)

- **food_id**: `food_couscous_raw`. FDC ID 169699 (SR Legacy, "Couscous, dry").
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non trovati nel record, non assunti zero — atteso per un cereale raffinato senza carotenoidi significativi). Acido folico 0µg esplicito, separato dal folato alimentare (20µg/100g) — nessuna firma di arricchimento USA (a differenza di pane/pasta comuni già scartati in coda per questo stesso motivo).
- **Analogia usata**: `food_riso_bianco_raw` (stessa famiglia botanica reale Poaceae — non solo funzionale: couscous è semola di grano duro, Triticum, Poaceae come il riso).
- **Categoria dieta**: `plant_non_fruit` (cereale e derivati).
- **Matrice**: nuova `couscous` ("Couscous").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non trovato nel record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Poaceae`, `baseline_cooking_state=raw`, `is_fortified_folate=false`.

```
npm run add-food -- --fdc-id=169699 --food-id=food_couscous_raw \
  --name-it="Couscous, crudo (non cotto)" \
  --matrix-id=couscous --matrix-description-it="Couscous" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_bianco_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae
```
```
npm run add-food -- --fdc-id=169699 --food-id=food_couscous_raw \
  --name-it="Couscous, crudo (non cotto)" \
  --matrix-id=couscous --matrix-description-it="Couscous" \
  --baseline-cooking-state=raw --analogy-food-id=food_riso_bianco_raw \
  --diet-category=plant_non_fruit --botanical-family=Poaceae --apply
```

### Pistacchi, secchi crudi — preparato 2026-10-14 dal task orario (secondo alimento lavorato dal terzo lotto)

- **food_id**: `food_pistacchi_raw`. FDC ID 170184 (SR Legacy, "Nuts, pistachio nuts, raw").
- **Nutrienti**: **16/17** — manca solo `vitamin_k_mcg` (non trovato nel record, non assunto zero). Acido folico 0µg esplicito, separato dal folato alimentare — nessuna firma di arricchimento.
- **Analogia usata**: `food_almonds` (stessa funzione "frutta a guscio" già usata per noci/nocciole nel Golden Set, famiglia botanica reale diversa — vedi sotto).
- **Categoria dieta**: `plant_non_fruit` (frutta a guscio).
- **Matrice**: nuova `pistacchi` ("Pistacchi").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — stessa convenzione di `food_almonds`/`food_noci_raw`/`food_nocciole_raw`, che non hanno questo campo valorizzato nonostante un beta-carotene non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Anacardiaceae` (famiglia reale del pistacchio — diversa da mandorle/Rosaceae, noci/Juglandaceae, nocciole/Betulaceae: l'analogia `food_almonds` è di funzione/categoria "frutta a guscio", non di parentela botanica, stessa logica già dichiarata per `food_nocciole_raw` e `food_noci_raw`), `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170184 --food-id=food_pistacchi_raw \
  --name-it="Pistacchi, secchi crudi" \
  --matrix-id=pistacchi --matrix-description-it="Pistacchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Anacardiaceae
```
```
npm run add-food -- --fdc-id=170184 --food-id=food_pistacchi_raw \
  --name-it="Pistacchi, secchi crudi" \
  --matrix-id=pistacchi --matrix-description-it="Pistacchi" \
  --baseline-cooking-state=raw --analogy-food-id=food_almonds \
  --diet-category=plant_non_fruit --botanical-family=Anacardiaceae --apply
```

### Ciliegie, crude — preparato 2026-10-14 dal task orario (primo alimento lavorato dal terzo lotto)

- **food_id**: `food_ciliegie_raw`. FDC ID 171719 (SR Legacy, "Cherries, sweet, raw").
- **Nutrienti**: **17/17**. Selenio 0µg e acido folico 0µg entrambi esplicitamente riportati (non assenti) — nessuna firma di arricchimento.
- **Analogia usata**: `food_peach_yellow_raw` (stessa famiglia botanica reale Rosaceae, stesso genere Prunus, già eseguito).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `ciliegie` ("Ciliegie").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 38µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=171719 --food-id=food_ciliegie_raw \
  --name-it="Ciliegie, crude" \
  --matrix-id=ciliegie --matrix-description-it="Ciliegie" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=171719 --food-id=food_ciliegie_raw \
  --name-it="Ciliegie, crude" \
  --matrix-id=ciliegie --matrix-description-it="Ciliegie" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Albicocche, crude — preparato 2026-10-14 dal task orario

- **food_id**: `food_albicocche_raw`. FDC ID 171697 (SR Legacy, "Apricots, raw").
- **Nutrienti**: **17/17** (`other_provitamin_a_carotenoids_mcg` = alfa-carotene 19µg + beta-criptoxantina 104µg = 123µg). Acido folico 0µg esplicito, separato dal folato alimentare — nessuna firma di arricchimento.
- **Analogia usata**: `food_peach_yellow_raw` (stessa famiglia botanica reale Rosaceae, stesso genere Prunus, già eseguito).
- **Categoria dieta**: `fresh_fruit`.
- **Matrice**: nuova `albicocche` ("Albicocche").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 1094µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Rosaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=171697 --food-id=food_albicocche_raw \
  --name-it="Albicocche, crude" \
  --matrix-id=albicocche --matrix-description-it="Albicocche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=171697 --food-id=food_albicocche_raw \
  --name-it="Albicocche, crude" \
  --matrix-id=albicocche --matrix-description-it="Albicocche" \
  --baseline-cooking-state=raw --analogy-food-id=food_peach_yellow_raw \
  --diet-category=fresh_fruit --botanical-family=Rosaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Anguria, cruda — preparato 2026-10-14 dal task orario

- **food_id**: `food_anguria_raw`. FDC ID 167765 (SR Legacy, "Watermelon, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato alimentare — nessuna firma di arricchimento.
- **Analogia usata**: `food_melone_cantalupo_raw` (stessa famiglia botanica reale Cucurbitaceae, già eseguito; stesso trattamento "melone" come frutta fresca pur essendo botanicamente un frutto della famiglia delle cucurbitacee, coerente con la voce già presente per il melone cantalupo).
- **Categoria dieta**: `fresh_fruit` (frutta fresca, come il melone cantalupo già nel Golden Set).
- **Matrice**: nuova `anguria` ("Anguria").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 303µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Cucurbitaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=167765 --food-id=food_anguria_raw \
  --name-it="Anguria, cruda" \
  --matrix-id=anguria --matrix-description-it="Anguria" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --diet-category=fresh_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=167765 --food-id=food_anguria_raw \
  --name-it="Anguria, cruda" \
  --matrix-id=anguria --matrix-description-it="Anguria" \
  --baseline-cooking-state=raw --analogy-food-id=food_melone_cantalupo_raw \
  --diet-category=fresh_fruit --botanical-family=Cucurbitaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Radicchio rosso, crudo — preparato 2026-10-14 dal task orario

- **food_id**: `food_radicchio_raw`. FDC ID 2747664 (Foundation Foods, "Radicchio, raw").
- **Nutrienti**: **12/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `vitamin_b12_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non trovati nel record, non assunti zero).
- **Nota sulla qualità**: la pagina aggregatore consultata mostra una lieve discordanza di energia (26,4 kcal in tabella contro 25 kcal in etichetta, ~5%, verosimile arrotondamento etichetta/calcolo) — non lo scarto strutturale a tre valori visto per il cavolfiore (dove un quarto valore calcolato dai macro divergeva ulteriormente). Nessun altro segnale di prodotto diverso o di fonti miste. Nessun record SR Legacy trovato per radicchio (solo questo Foundation Foods, unico candidato).
- **Analogia usata**: `food_lettuce_romaine_raw` (stessa famiglia botanica reale Asteraceae — lattuga e radicchio appartengono entrambi alle Asteraceae nonostante generi diversi, Lactuca e Cichorium).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `radicchio` ("Radicchio rosso").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non trovato in questo record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Asteraceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=2747664 --food-id=food_radicchio_raw \
  --name-it="Radicchio rosso, crudo" \
  --matrix-id=radicchio --matrix-description-it="Radicchio rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae
```
```
npm run add-food -- --fdc-id=2747664 --food-id=food_radicchio_raw \
  --name-it="Radicchio rosso, crudo" \
  --matrix-id=radicchio --matrix-description-it="Radicchio rosso" \
  --baseline-cooking-state=raw --analogy-food-id=food_lettuce_romaine_raw \
  --diet-category=plant_non_fruit --botanical-family=Asteraceae --apply
```

### Barbabietola rossa, cruda — preparato 2026-10-14 dal task orario

- **food_id**: `food_barbabietola_rossa_raw`. FDC ID 169145 (SR Legacy, "Beets, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato alimentare — nessuna firma di arricchimento.
- **Analogia usata**: `food_spinach_raw` (stessa famiglia botanica reale Amaranthaceae). **Deviazione dichiarata**: a differenza dello spinacio (che nel Golden Set ha `matrix_category_calcium=high_oxalate`), qui il campo è lasciato NULL — la categoria ossalati nel progetto è dichiarata solo per spinaci/kale/latte (vedi nota del lotto da 18), non per le radici; stessa logica già usata per `food_patata_dolce_raw` rispetto a `food_potato_raw` (analogia di funzione, famiglia botanica reale diversa/non classificata per quell'attributo).
- **Categoria dieta**: `plant_non_fruit` (ortaggio a radice).
- **Matrice**: nuova `barbabietola` ("Barbabietola rossa").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 20µg/100g, basso ma non nullo), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaranthaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169145 --food-id=food_barbabietola_rossa_raw \
  --name-it="Barbabietola rossa, cruda" \
  --matrix-id=barbabietola --matrix-description-it="Barbabietola rossa" \
  --baseline-cooking-state=raw --analogy-food-id=food_spinach_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169145 --food-id=food_barbabietola_rossa_raw \
  --name-it="Barbabietola rossa, cruda" \
  --matrix-id=barbabietola --matrix-description-it="Barbabietola rossa" \
  --baseline-cooking-state=raw --analogy-food-id=food_spinach_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaranthaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Porri, crudi — preparato 2026-10-14 dal task orario

- **food_id**: `food_porri_raw`. FDC ID 169246 (SR Legacy, "Leeks, (bulb and lower leaf-portion), raw").
- **Nutrienti**: **17/17**. Acido folico 0µg esplicito, separato dal folato alimentare — nessuna firma di arricchimento.
- **Analogia usata**: `food_onion_raw` (stessa famiglia botanica reale Amaryllidaceae, già eseguito sul DB reale).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `porri` ("Porri").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state=raw_intact` (beta-carotene 1000µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Amaryllidaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=169246 --food-id=food_porri_raw \
  --name-it="Porri, crudi" \
  --matrix-id=porri --matrix-description-it="Porri" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=169246 --food-id=food_porri_raw \
  --name-it="Porri, crudi" \
  --matrix-id=porri --matrix-description-it="Porri" \
  --baseline-cooking-state=raw --analogy-food-id=food_onion_raw \
  --diet-category=plant_non_fruit --botanical-family=Amaryllidaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Rucola (baby), cruda — preparato 2026-10-14 dal task orario

- **food_id**: `food_rucola_raw`. FDC ID 2710822 (Foundation Foods, "Arugula, baby, raw").
- **Nutrienti**: **12/17** — mancano `selenium_mcg`, `vitamin_k_mcg`, `vitamin_b12_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non trovati nel record, non assunti zero).
- **Nota sulla varietà**: unico record FDC trovato per la rucola è la varietà "baby" (Foundation Foods). Una ricerca mirata per un record "Arugula, raw" generico/SR Legacy non ha dato risultati — non è detto che la composizione della rucola "baby" differisca significativamente da quella matura, ma è una differenza dichiarata, non verificata.
- **Analogia usata**: `food_kale_raw` (stessa famiglia botanica reale Brassicaceae — la rucola, Eruca vesicaria, appartiene alla famiglia dei cavoli nonostante il nome comune suggerisca altro).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `rucola` ("Rucola").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non trovato in questo record), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=2710822 --food-id=food_rucola_raw \
  --name-it="Rucola, cruda" \
  --matrix-id=rucola --matrix-description-it="Rucola" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae
```
```
npm run add-food -- --fdc-id=2710822 --food-id=food_rucola_raw \
  --name-it="Rucola, cruda" \
  --matrix-id=rucola --matrix-description-it="Rucola" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae --apply
```

### Verza (cavolo verza/savoy), cruda — preparato 2026-10-14 dal task orario

- **food_id**: `food_verza_raw`. FDC ID 170388 (SR Legacy, "Cabbage, savoy, raw").
- **Nutrienti**: **17/17**. Acido folico 0µg riportato esplicitamente separato dal folato alimentare — nessuna firma di arricchimento.
- **Precisione sul nome**: la voce di coda diceva "verza (cavolo cappuccio)", trattando i due come sinonimi. In realtà sono due varietà diverse della stessa specie (Brassica oleracea): "verza" = cavolo verza/di Savoia (var. sabauda, foglia increspata), "cavolo cappuccio" = cavolo a palla liscio (var. capitata). FDC ha record separati per entrambi (SR Legacy "Cabbage, savoy, raw" FDC 170388 qui usato per "verza"; "Cabbage, raw" FDC 169975, generico/liscio, resta disponibile per un eventuale "cavolo cappuccio" separato in futuro — non usato qui per non confondere le due verdure, composizione leggermente diversa: 27kcal/35mg calcio/68,8µg vit.K per il verza contro 25kcal/40mg calcio/76µg vit.K per il cappuccio generico).
- **Analogia usata**: `food_kale_raw` (stessa famiglia botanica reale Brassicaceae, foglia cruda, già eseguito nel Golden Set originale).
- **Categoria dieta**: `plant_non_fruit`.
- **Matrice**: nuova `verza` ("Verza (cavolo verza)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL — la categoria ossalati nel progetto è dichiarata solo per spinaci/kale/latte, non per la verza), `carotenoid_matrix_state=raw_intact` (beta-carotene 600µg/100g), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Brassicaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=170388 --food-id=food_verza_raw \
  --name-it="Verza (cavolo verza), cruda" \
  --matrix-id=verza --matrix-description-it="Verza (cavolo verza)" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact
```
```
npm run add-food -- --fdc-id=170388 --food-id=food_verza_raw \
  --name-it="Verza (cavolo verza), cruda" \
  --matrix-id=verza --matrix-description-it="Verza (cavolo verza)" \
  --baseline-cooking-state=raw --analogy-food-id=food_kale_raw \
  --diet-category=plant_non_fruit --botanical-family=Brassicaceae \
  --carotenoid-matrix-state=raw_intact --apply
```

### Edamame (soia verde), sgranati, crudi e congelati (non cotti) — preparato 2026-10-14 dal task orario

- **food_id**: `food_edamame_raw`. FDC ID 168410 (SR Legacy, "Edamame, frozen, unprepared").
- **Nutrienti**: **13/17** — mancano `selenium_mcg`, `vitamin_b12_mcg`, `beta_carotene_mcg`, `other_provitamin_a_carotenoids_mcg` (non trovati nel record FDC, non assunti zero). Nessuna firma di arricchimento: acido folico 0µg riportato esplicitamente separato dal folato alimentare.
- **Deviazione dichiarata dalla voce di coda** ("sgranati, bolliti"): la coda chiedeva edamame bollito. In FDC esistono solo due record SR Legacy per edamame: FDC 168411 "Edamame, frozen, prepared" (17/17 nutrienti, ma la descrizione NON specifica il metodo di preparazione — non dice "boiled"/"steamed", né se con o senza sale; il sodio basso, 6mg/100g, è un indizio indiretto ma non una conferma) e FDC 168410 "Edamame, frozen, unprepared" (crudo/congelato, stato non ambiguo, ma solo 13/17). Per non indovinare lo stato di cottura del record "prepared" (Regola 1), si è scelto il record "unprepared", esplicitamente crudo, accettando il gap di 4 nutrienti invece di un'assunzione non verificabile sulla cottura — stesso tipo di scelta già fatto per `food_farro_raw` (accettare un gap dichiarato piuttosto che forzare un dato incerto).
- **Analogia usata**: `food_chickpeas_raw` (stessa famiglia botanica reale Fabaceae, legume crudo, già eseguito sul DB reale), con `is_fortified_folate=false`.
- **Categoria dieta**: `plant_non_fruit` (legume).
- **Matrice**: nuova `edamame` ("Edamame (soia verde)").
- **Attributi**: `is_heme_iron` omesso (false), `matrix_category_calcium` omesso (NULL), `carotenoid_matrix_state` omesso (NULL — beta-carotene non trovato in questo record, nessun valore da correggere con un fattore di ritenzione), `zinc_bioaccessibility_bucket` default `none`, `botanical_family=Fabaceae`, `baseline_cooking_state=raw`.

```
npm run add-food -- --fdc-id=168410 --food-id=food_edamame_raw \
  --name-it="Edamame (soia verde), sgranati, crudi e congelati (non cotti)" \
  --matrix-id=edamame --matrix-description-it="Edamame (soia verde)" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae
```
```
npm run add-food -- --fdc-id=168410 --food-id=food_edamame_raw \
  --name-it="Edamame (soia verde), sgranati, crudi e congelati (non cotti)" \
  --matrix-id=edamame --matrix-description-it="Edamame (soia verde)" \
  --baseline-cooking-state=raw --analogy-food-id=food_chickpeas_raw \
  --diet-category=plant_non_fruit --botanical-family=Fabaceae --apply
```

## Eseguiti (archivio, ultimi 10)

> **Nota (2026-10-13) sulla classificazione dieta degli alimenti qui sotto.** Dalla melanzana in giù in questa lista, sono stati inseriti con la versione di `add-food` precedente alla correzione `--diet-category`: le loro tre colonne `diet_compat_*` risultavano quindi NULL ("non classificato", escluse dai filtri vegetariano/vegano/fruttariano) finche' non e' stato eseguito `fix_diet_compat_pipeline_foods.sql` (**eseguito il 2026-10-13**: l'utente ha confermato a voce che la query di controllo non mostra piu' nessuno di loro come non classificato, senza screenshot rivisto da questa sessione). **Le zucchine, appena sotto, sono il primo alimento eseguito già con `--diet-category` incluso dall'inizio** (diet=plant_non_fruit scritto direttamente, verificato nel riepilogo di scrittura): non serve alcun fix per loro.

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
