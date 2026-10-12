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

### Fave, semi maturi, bollite, senza sale (2026-10-12)

- **FDC ID**: 173753, dataType **SR Legacy** — "Broadbeans (fava beans), mature seeds, cooked, boiled, without salt".
- **Nutrienti attesi**: 17/17. Valori confermati da due fonti indipendenti che si corroborano a vicenda dopo conversione a 100g: myfooddata.com (FDC ID citato esplicitamente, valori per 100g: energia 110kcal, proteine 7,6g, grassi 0,4g, carboidrati 19,6g, fibra 5,4g, ferro 1,5mg, zinco 1,0mg, calcio 36,0mg, vitamina C 0,3mg, magnesio 43,0mg, rame 0,26mg, selenio 2,6µg, vitamina K 2,9µg, vitamina B12 0µg, folato totale 104,0µg DFE, acido folico 0µg, beta-carotene 9,0µg, alfa-carotene 0µg, beta-criptoxantina 0µg) e bodbot.com (stesso alimento via NDB 16053, valori per 1 cup/170g che convertiti a 100g combaciano: ferro 2,55/1,7≈1,5mg, zinco 1,72/1,7≈1,01mg, calcio 61,2/1,7≈36,0mg — stesso ordine di grandezza su tutti i campi confrontabili, nessuna discrepanza grossa).
- **Perché questo record rappresenta bene le fave comuni italiane**: nessuna firma di arricchimento (acido folico 0µg esplicito su entrambe le fonti), valori nutrizionali coerenti con un legume bollito senza trattamenti industriali. Record generico SR Legacy ("mature seeds" = fave secche, la forma più comunemente bollita/cucinata, coerente con le altre voci "legumi" già nel Golden Set che sono tutte semi maturi bolliti), non un prodotto Branded.
- **Analogia dichiarata**: `food_chickpeas_boiled` — stessa famiglia botanica Fabaceae, stesso matrix_id `legumes` (già esistente in `food_matrices_master`, descritto esplicitamente come "Legumi secchi (fagioli, lenticchie, piselli, ceci)" — non serve quindi `--matrix-description-it`), stesso stato "semi maturi, bolliti, senza sale", `matrix_category_calcium` NULL, `is_heme_iron=false`.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=173753 --food-id=food_fave_bollite --name-it="Fave, semi maturi, bollite, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_chickpeas_boiled --botanical-family=Fabaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=173753 --food-id=food_fave_bollite --name-it="Fave, semi maturi, bollite, senza sale" --matrix-id=legumes --baseline-cooking-state=boiled --analogy-food-id=food_chickpeas_boiled --botanical-family=Fabaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 173753 è pulito e completo (17/17), corroborato da due fonti indipendenti.

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
