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

### Orzo perlato, crudo, non arricchito (2026-10-12)

- **FDC ID**: 170284, dataType **SR Legacy** — "Barley, pearled, raw".
- **Nutrienti attesi**: 17/17, nessun componente mancante. Valori letti dalla pagina aggregatore (getfoodfacts.com), che per questo FDC ID mostra l'intero pannello scaricato da FDC: energia 352kcal, proteine 9,91g, grassi 1,16g, carboidrati 77,7g, fibra 15,6g, ferro 2,50mg, zinco 2,13mg, calcio 29,0mg, vitamina C 0mg, magnesio 79,0mg, rame 0,42mg, selenio 37,7µg, vitamina K 2,20µg, vitamina B12 0µg, folato totale 23,0µg (= folato da alimenti = folato DFE), **acido folico 0µg riportato esplicitamente come voce separata** (nessuna fortificazione), beta-carotene 13,0µg, alfa-carotene 0µg e beta-criptoxantina 0µg (entrambi riportati esplicitamente, quindi `other_provitamin_a_carotenoids_mcg` = 0 da due componenti noti, non un componente mancante).
- **Perché questo record rappresenta bene l'orzo perlato comune italiano, non arricchito**: nessuna firma di arricchimento in stile USA — acido folico esplicitamente 0µg separato dal folato alimentare, calcio 29mg/100g nella norma per l'orzo (valore biologicamente plausibile per questo cereale specifico, non un'anomalia da conservante come nei casi di pane scartati altrove in questa coda). Record generico SR Legacy, non un prodotto Branded.
- **Analogia dichiarata**: `food_riso_integrale_raw` (già reale nel DB, aggiunto in questa stessa coda il 2026-10-12) — stessa famiglia botanica Poaceae, stesso tipo di matrice (cereale secco/crudo, non arricchito), `matrix_category_calcium` NULL/non applicabile, `is_heme_iron=false`. `is_fortified_folate` resta `false` (default, omesso dal comando) in base al dato FDC stesso (acido folico=0µg), non per analogia.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=170284 --food-id=food_orzo_perlato_raw --name-it="Orzo perlato, crudo, non arricchito" --matrix-id=orzo_perlato --matrix-description-it="Orzo perlato" --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw --botanical-family=Poaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=170284 --food-id=food_orzo_perlato_raw --name-it="Orzo perlato, crudo, non arricchito" --matrix-id=orzo_perlato --matrix-description-it="Orzo perlato" --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw --botanical-family=Poaceae --apply
  ```
- **Piano B**: non necessario, il record FDC 170284 è pulito e completo (17/17).

### Farro perlato, secco, crudo (2026-10-12) — nutrienti incompleti, gap dichiarato

- **FDC ID**: 2710828, dataType **Foundation Foods** — "Farro, pearled, dry, raw".
- **Nutrienti trovati: 10/17** (energia, proteine, grassi, carboidrati, fibra, ferro, zinco, calcio, magnesio, rame). **Mancanti dal record stesso** (verificato chiedendo l'elenco letterale e completo della tabella nutrienti della pagina, non un troncamento del fetch): vitamina C, selenio, vitamina K, vitamina B12, folato (totale e acido folico), beta-carotene, alfa-carotene, beta-criptoxantina. La pagina dichiara esplicitamente "23 nutrients" totali per questo record, di cui nessuno dei 7 mancanti compare nella tabella — non è quindi un'omissione della pagina aggregatore, ma un pannello di analisi FDC ancora parziale per questo specifico record Foundation (relativamente recente).
- **Valori dei 10 nutrienti trovati** (per 100g): energia 340kcal (etichetta)/344kcal (confronto USDA), proteine 12,6g, grassi 3,10g, carboidrati 72,1g, fibra 7,31g, ferro 3,19mg, zinco 3,97mg, calcio 25,9mg, magnesio 119mg, rame 0,47mg.
- **Valutazione del match (soglia ~10/17 dichiarata nel compito)**: il record è esattamente al limite (10/17). Non è però un segnale di alimento sbagliato: è un record **Foundation Foods** (tipo preferito, non Branded), il nome corrisponde esattamente a "farro perlato" (la forma di farro più comune in vendita anche in Italia, non una forzatura), nessuna firma di arricchimento (nessun campo acido folico anomalo, calcio 25,9mg/100g nella norma, nessuna parola "enriched" nella descrizione). La scarsità è quindi attribuita a un pannello nutrienti FDC ancora incompleto per questo record specifico, non a un match debole sul prodotto — stesso tipo di gap già accettato nel Golden Set originale per latte e kale (§4.6 del PRD), dichiarato esplicitamente invece di essere nascosto o riempito con un valore stimato.
- **Nessun record alternativo migliore trovato**: cercati sia altri FDC SR Legacy/Foundation per "farro"/"emmer wheat" sia fonti di cross-check (nutritionvalue.org non raggiungibile, torrinomedica.it non è FDC quindi non utilizzabile per questo script) — solo risultati Branded (incompleti, <10/17) oltre a questo. FDC 2710828 resta la scelta migliore disponibile.
- **Analogia dichiarata**: `food_riso_integrale_raw` — stessa famiglia botanica Poaceae, cereale secco/crudo non arricchito, `matrix_category_calcium` NULL, `is_heme_iron=false`. `is_fortified_folate` resta `false` (default) — qui per assenza di segnali di fortificazione nel record, non perché il campo folato sia verificabile (è assente).
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=2710828 --food-id=food_farro_raw --name-it="Farro perlato, secco, crudo" --matrix-id=farro --matrix-description-it="Farro" --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw --botanical-family=Poaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run — ricontrollare che lo script riporti davvero 10 nutrienti estratti, non un numero diverso, prima di procedere con --apply):
  ```
  npm run add-food -- --fdc-id=2710828 --food-id=food_farro_raw --name-it="Farro perlato, secco, crudo" --matrix-id=farro --matrix-description-it="Farro" --baseline-cooking-state=raw --analogy-food-id=food_riso_integrale_raw --botanical-family=Poaceae --apply
  ```
- **Piano B**: nessuno trovato (vedi sopra). Se dopo l'esecuzione si preferisce non avere una riga con solo 10/17 nutrienti, l'alternativa è rimandare "farro" e aspettare che FDC pubblichi un pannello più completo per questo record, o integrare CREA in futuro (gap già noto, §9 Fase 4 punto 16 del PRD).

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
