# Comandi pronti per l'espansione Golden Set — in attesa di esecuzione umana

**Perché questo file esiste (2026-10-12).** Nessuna sessione automatica disponibile oggi può eseguire realmente `npm run add-food -- --apply`: le sessioni collegate al PC (device-link) non hanno una shell vera per le app Terminale/IDE (accesso solo "click", confermato da un collaudo reale lo stesso giorno — vedi `docs/PRD.md` §9 Fase 4 punto 16), e le sessioni cloud non collegate al PC non hanno rete diretta verso Supabase né verso `api.nal.usda.gov` (confermato più volte, vedi `docs/PENDING_HUMAN_ACTIONS.md`). La parte di **ricerca** (trovare un match FDC solido, decidere gli attributi categorici per analogia) non richiede invece né shell né rete verso Supabase/FDC diretta — solo `git` e ricerca web — quindi **può** girare da sola in un task pianificato cloud. Questo file è la coda di output di quel task: alimenti già ricercati e valutati, con i comandi pronti da incollare sul tuo PC quando hai un momento.

**Convenzione:**
- Una voce per alimento, più recenti in cima.
- Ogni voce ha: alimento, FDC ID + dataType, quanti nutrienti su 17 trovati, l'analogia dichiarata, i due comandi (dry-run e apply).
- Quando esegui un comando da qui e confermi l'esito (dal log reale, non a sensazione), la voce va spostata in "Eseguiti" con la data ed eventualmente la riga nella coda di `docs/PRD.md` va marcata `✅` — questo lavoro di chiusura lo fa una sessione interattiva (questa chat), non il task pianificato stesso (che prepara soltanto, non segue mai l'esito di un comando che non ha eseguito lui).
- Se un comando qui elencato fallisce o dà un riepilogo diverso da quanto previsto, dimmelo in chat: la voce resta qui finché non si chiarisce, non va rimossa automaticamente.

**Per l'uso quotidiano (2026-10-12)**: l'utente non programma e trova questo file troppo denso da seguire ogni volta. Esiste quindi `docs/PROSSIMO_COMANDO.txt` — solo il comando (dry-run + apply) del PRIMO alimento in "Pronti" sotto, senza spiegazioni, mantenuto aggiornato da una sessione interattiva (non dal task pianificato, che non sa quale comando l'utente ha già in mano) ogni volta che una voce viene eseguita o aggiunta. Questo file resta la fonte di verità con tutto il ragionamento; quello è solo una vista semplificata del primo elemento della coda.

---

## Pronti

### Melanzane, crude (2026-10-12)

- **FDC ID**: 169228, dataType **SR Legacy** — "Eggplant, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g (confermati da getfoodfacts.com, che riporta esplicitamente FDC ID 169228 come SR Legacy): energia 25,0kcal, proteine 0,98g, grassi 0,18g, carboidrati 5,88g, fibra 3,00g, calcio 9,00mg, ferro 0,23mg, zinco 0,16mg, magnesio 14,0mg, rame 0,081mg, selenio 0,30µg, vitamina C 2,20mg, vitamina K 3,50µg, vitamina B12 0µg, folato totale 22,0µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione), beta-carotene 14,0µg, alfa-carotene 0µg, beta-criptoxantina 0µg.
- **Perché questo record rappresenta bene le melanzane comuni italiane**: nessuna firma di arricchimento in stile USA, calcio basso (9mg/100g) coerente con una verdura cruda non trattata. Record generico SR Legacy, non Branded. Scartato un secondo candidato, Foundation Foods FDC 2685577 ("Eggplant, raw"): meno completo sulla pagina consultata (selenio, vitamina K, B12, acido folico e tutti i carotenoidi non riportati) e con l'energia incoerente fra le sezioni della stessa pagina (20 vs 22,4 vs 22 kcal) — segnale di dato meno pulito del record SR Legacy scelto.
- **Analogia dichiarata**: `food_potato_boiled_in_skin` — stessa famiglia botanica Solanaceae (unica già presente nel Golden Set per questa famiglia), `matrix_category_calcium` NULL, `is_heme_iron=false`. Il beta-carotene della melanzana è trascurabile (14µg/100g, ordini di grandezza sotto le carote) e la patata, stessa famiglia, non ha `carotenoid_matrix_state` impostato nel Golden Set esistente: per coerenza con questa analogia, `carotenoid_matrix_state` resta NULL anche per la melanzana, invece di forzare una classificazione raw_intact/cooked_or_disrupted pensata per alimenti dove i carotenoidi provitaminici A sono un contributo nutrizionale rilevante.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=169228 --food-id=food_melanzane_raw --name-it="Melanzane, crude" --matrix-id=melanzane --matrix-description-it="Melanzane" --baseline-cooking-state=raw --analogy-food-id=food_potato_boiled_in_skin --botanical-family=Solanaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=169228 --food-id=food_melanzane_raw --name-it="Melanzane, crude" --matrix-id=melanzane --matrix-description-it="Melanzane" --baseline-cooking-state=raw --analogy-food-id=food_potato_boiled_in_skin --botanical-family=Solanaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 169228 è pulito e completo (17/17).

### Zucchine, crude (con buccia) (2026-10-12)

- **FDC ID**: 169291, dataType **SR Legacy** — "Squash, summer, zucchini, includes skin, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g (confermati da getfoodfacts.com, tabella nutrienti completa per FDC ID 169291, SR Legacy): energia 17,0kcal, proteine 1,21g, grassi 0,32g, carboidrati 3,11g, fibra 1,00g, calcio 16,0mg, ferro 0,37mg, zinco 0,32mg, magnesio 18,0mg, rame 0,053mg, selenio 0,20µg, vitamina C 17,9mg, vitamina K 4,30µg, vitamina B12 0µg, folato totale 24,0µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione), beta-carotene 120µg, alfa-carotene 0µg, beta-criptoxantina 0µg.
- **Perché questo record rappresenta bene le zucchine comuni italiane**: nessuna firma di arricchimento in stile USA, valori coerenti con una verdura cruda non trattata. Record generico SR Legacy, non Branded.
- **Analogia dichiarata**: `food_carrots_raw` — NON la stessa famiglia botanica (zucchine=Cucurbitaceae, carote=Apiaceae; nessun alimento Cucurbitaceae è ancora presente nel Golden Set, quindi un'analogia di famiglia non è disponibile), ma è l'unico alimento già classificato nel Golden Set con un contenuto di beta-carotene nutrizionalmente rilevante e una distinzione `raw_intact`/`cooked_or_disrupted` già usata per lo stesso motivo (modello di assorbimento vitamina A) — analogia dichiarata per funzione del campo, non per parentela botanica (quest'ultima è dichiarata separatamente via `--botanical-family=Cucurbitaceae`, fatto botanico diretto, non analogico). `matrix_category_calcium` NULL (come le carote), `is_heme_iron=false`, `carotenoid_matrix_state=raw_intact` (stato crudo).
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=169291 --food-id=food_zucchine_raw --name-it="Zucchine, crude (con buccia)" --matrix-id=zucchine --matrix-description-it="Zucchine" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Cucurbitaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=169291 --food-id=food_zucchine_raw --name-it="Zucchine, crude (con buccia)" --matrix-id=zucchine --matrix-description-it="Zucchine" --baseline-cooking-state=raw --analogy-food-id=food_carrots_raw --carotenoid-matrix-state=raw_intact --botanical-family=Cucurbitaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 169291 è pulito e completo (17/17).

### Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale (2026-10-12)

- **FDC ID**: 175203, dataType **SR Legacy** — "Beans, white, mature seeds, cooked, boiled, without salt".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g (confermati da getfoodfacts.com, tabella nutrienti completa per FDC ID 175203, SR Legacy): energia 139kcal, proteine 9,73g, grassi 0,35g, carboidrati 25,1g, fibra 6,30g, calcio 90,0mg, ferro 3,70mg, zinco 1,38mg, magnesio 63,0mg, rame 0,29mg, selenio 1,30µg, vitamina C 0mg, vitamina K 3,50µg, vitamina B12 0µg, folato totale 81,0µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione), beta-carotene 0µg, alfa-carotene 0µg, beta-criptoxantina 0µg.
- **Nota sulla scelta del record**: FDC non ha una voce "cannellini" dedicata (solo prodotti Branded di marca, troppo generici/incompleti per questo uso) — "Beans, white, mature seeds" (fagioli bianchi) è la voce generica SR Legacy più diretta per rappresentare i fagioli cannellini (varietà a seme bianco di Phaseolus vulgaris), stesso approccio già usato per fave/piselli in questo file (preferenza per il record generico SR Legacy sulla variante branded specifica).
- **Perché questo record rappresenta bene i cannellini comuni italiani**: nessuna firma di arricchimento (acido folico 0µg esplicito, separato dal folato totale). Il calcio (90mg/100g) è più alto dei fagioli rossi kidney già nel Golden Set (28mg/100g), ma è una differenza varietale nota fra legumi comuni (i fagioli bianchi riportano tipicamente più calcio dei fagioli rossi nelle tabelle di composizione), non un segnale di arricchimento — quest'ultimo richiederebbe acido folico non-zero, qui assente.
- **Analogia dichiarata**: `food_kidney_beans_boiled` — stessa specie botanica *Phaseolus vulgaris* (famiglia Fabaceae), stesso matrix_id `legumes` (già esistente in `food_matrices_master`, non serve quindi `--matrix-description-it`), stesso stato "semi maturi, bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=175203 --food-id=food_fagioli_cannellini_bolliti --name-it="Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=175203 --food-id=food_fagioli_cannellini_bolliti --name-it="Fagioli cannellini (bianchi), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 175203 è pulito e completo (17/17).

### Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale (2026-10-12)

- **FDC ID**: 173736, dataType **SR Legacy** — "Beans, cranberry (roman), mature seeds, cooked, boiled, without salt".
- **Nutrienti attesi**: almeno 14/17 confermati dalla pagina aggregatore consultata (getfoodfacts.com, che riporta esplicitamente FDC ID 173736 come SR Legacy): energia 136kcal, proteine 9,34g, grassi 0,46g, carboidrati 24,5g, fibra 8,60g, calcio 50,0mg, ferro 2,09mg, zinco 1,14mg, magnesio 50,0mg, rame 0,23mg, selenio 1,30µg, vitamina C 0mg, vitamina B12 0µg, folato totale 207µg, **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione). **Non riportati dalla pagina aggregatore consultata** (ma non necessariamente assenti dal record FDC reale — lo script, al momento dell'esecuzione, farà un fetch diretto che potrà trovarne un numero diverso): vitamina K, beta-carotene, alfa-carotene, beta-criptoxantina.
- **Perché questo record rappresenta bene i fagioli borlotti comuni italiani**: nessuna firma di arricchimento (acido folico 0µg esplicito), valori coerenti con un legume bollito senza trattamenti industriali. Record generico SR Legacy, non Branded. FDC non ha una voce "borlotti" dedicata, ma "cranberry (roman) beans" è il nome USDA standard per la stessa varietà screziata di *Phaseolus vulgaris* nota in Italia come borlotto — stesso alimento, nome diverso, non un prodotto diverso.
- **Analogia dichiarata**: `food_kidney_beans_boiled` — stessa specie botanica *Phaseolus vulgaris* (famiglia Fabaceae), stesso matrix_id `legumes` (già esistente, non serve `--matrix-description-it`), stesso stato "semi maturi, bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=173736 --food-id=food_fagioli_borlotti_bolliti --name-it="Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=173736 --food-id=food_fagioli_borlotti_bolliti --name-it="Fagioli borlotti (cranberry/roman), semi maturi, bolliti, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_kidney_beans_boiled --botanical-family=Fabaceae --apply
  ```
- **Piano B**: non necessario per la scelta del record (nessuna alternativa migliore trovata). Attenzione in fase di esecuzione reale: se il fetch diretto dello script trova meno di ~10/17 nutrienti effettivi (molto sotto i 14/17 già confermati qui da fonte aggregata), il match risulterebbe più debole di quanto stimato in questa ricerca — in quel caso fermarsi e segnalarlo invece di considerare l'alimento comunque pronto per la promozione futura a `verified`.

### Piselli, verdi, cotti, bolliti, scolati, senza sale (2026-10-12)

- **FDC ID**: 170420, dataType **SR Legacy** — "Peas, green, cooked, boiled, drained, without salt".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori per 100g: energia 84,0kcal, proteine 5,36g, grassi 0,22g, carboidrati 15,6g, fibra 5,50g, ferro 1,54mg, zinco 1,19mg, calcio 27,0mg, vitamina C 14,2mg, magnesio 39,0mg, rame 0,17mg, selenio 1,90µg, vitamina K 25,9µg, vitamina B12 0µg, folato totale 63,0µg (= folato da alimenti = folato DFE), **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione; anche "Vitamin E, added" e "Vitamin B-12, added" risultano 0), beta-carotene 470µg, alfa-carotene 22,0µg, beta-criptoxantina 0µg.
- **Nota sulla scelta del record**: esiste anche una variante "frozen" (es. FDC 170105/170102, con/senza sale) — scartata qui perché "piselli" nell'uso comune italiano indica tipicamente piselli verdi freschi o surgelati cotti, non piselli secchi/spezzati (che sarebbero un prodotto diverso, tipico di zuppe). Il record scelto (170420, "green, cooked, boiled, drained", senza qualificatore "frozen") è la rappresentazione generica più diretta di "piselli bolliti" nella forma in cui vengono normalmente consumati, coerente con la descrizione già presente nel Golden Set per il matrix_id `legumes` ("Legumi secchi (fagioli, lenticchie, piselli, ceci)" — i piselli erano già previsti per questa matrice).
- **Perché questo record rappresenta bene i piselli comuni italiani**: nessuna firma di arricchimento in stile USA, valori nutrizionali coerenti con un legume verde bollito senza trattamenti industriali. Record generico SR Legacy, non un prodotto Branded.
- **Analogia dichiarata**: `food_chickpeas_boiled` — stessa famiglia botanica Fabaceae, stesso matrix_id `legumes` (già esistente), stesso stato "bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=170420 --food-id=food_piselli_bolliti --name-it="Piselli, verdi, cotti, bolliti, scolati, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_chickpeas_boiled --botanical-family=Fabaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=170420 --food-id=food_piselli_bolliti --name-it="Piselli, verdi, cotti, bolliti, scolati, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_chickpeas_boiled --botanical-family=Fabaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 170420 è pulito e completo (17/17). Se in futuro si vuole anche una variante "surgelati" distinta, FDC 170105 (senza sale, frozen) è già stato individuato e può essere proposto come voce separata.

## Eseguiti (archivio, ultimi 10)

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
