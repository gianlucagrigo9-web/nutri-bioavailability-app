# Comandi pronti per l'espansione Golden Set — in attesa di esecuzione umana

**Perché questo file esiste (2026-10-12).** Nessuna sessione automatica disponibile oggi può eseguire realmente `npm run add-food -- --apply`: le sessioni collegate al PC (device-link) non hanno una shell vera per le app Terminale/IDE (accesso solo "click", confermato da un collaudo reale lo stesso giorno — vedi `docs/PRD.md` §9 Fase 4 punto 16), e le sessioni cloud non collegate al PC non hanno rete diretta verso Supabase né verso `api.nal.usda.gov` (confermato più volte, vedi `docs/PENDING_HUMAN_ACTIONS.md`). La parte di **ricerca** (trovare un match FDC solido, decidere gli attributi categorici per analogia) non richiede invece né shell né rete verso Supabase/FDC diretta — solo `git` e ricerca web — quindi **può** girare da sola in un task pianificato cloud. Questo file è la coda di output di quel task: alimenti già ricercati e valutati, con i comandi pronti da incollare sul tuo PC quando hai un momento.

**Convenzione:**
- Una voce per alimento, più recenti in cima.
- Ogni voce ha: alimento, FDC ID + dataType, quanti nutrienti su 17 trovati, l'analogia dichiarata, i due comandi (dry-run e apply).
- Quando esegui un comando da qui e confermi l'esito (dal log reale, non a sensazione), la voce va spostata in "Eseguiti" con la data ed eventualmente la riga nella coda di `docs/PRD.md` va marcata `✅` — questo lavoro di chiusura lo fa una sessione interattiva (questa chat), non il task pianificato stesso (che prepara soltanto, non segue mai l'esito di un comando che non ha eseguito lui).
- Se un comando qui elencato fallisce o dà un riepilogo diverso da quanto previsto, dimmelo in chat: la voce resta qui finché non si chiarisce, non va rimossa automaticamente.

---

## Pronti

### Riso integrale, crudo, non arricchito (2026-10-12)

- **FDC ID**: 169703, dataType **SR Legacy** — "Rice, brown, long-grain, raw (Includes foods for USDA's Food Distribution Program)".
- **Nutrienti attesi**: 17/17, nessun componente mancante atteso. A differenza della voce "Riso bianco" in "Eseguiti" sotto, qui i valori sono stati letti **direttamente** dalla pagina aggregatore (getfoodfacts.com), che per questo FDC ID mostra l'intero pannello nutrienti scaricato da FDC, non una conversione indiretta: energia 367kcal, proteine 7,54g, grassi 3,20g, carboidrati 76,3g, fibra 3,60g, calcio 9,00mg, ferro 1,29mg, zinco 2,13mg, magnesio 116mg, rame 0,30mg, selenio 17,1µg, vitamina K (fillochinone) 0,60µg, vitamina B12 0µg, vitamina C 0mg, folato totale 23,0µg (= folato da alimenti 23,0µg = folato DFE 23,0µg), **acido folico 0µg riportato esplicitamente come voce separata** (non assente, proprio a zero — nessuna fortificazione), beta-carotene 0µg, alfa-carotene 0µg, **beta-criptoxantina 0µg riportata esplicitamente** (quindi `other_provitamin_a_carotenoids_mcg` = somma di due componenti entrambi presenti e noti, non un componente mancante). Nota metodologica onesta: un secondo aggregatore indipendente (uhhospitals.org, valori "per cup") NON combacia bene con questi dati una volta convertiti a 100g con pesi-cup plausibili (185-190g, stessa logica di cross-check applicata alla voce "Riso bianco" in "Eseguiti" sotto) — calcio e vitamina K risultano 2-3 volte più alti nell'aggregatore rispetto a questa conversione, discrepanza troppo grande per essere solo arrotondamento o un peso-cup diverso. Probabile che uhhospitals.org compili il riso integrale da una fonte/analisi diversa dal FDC ID qui usato. Scartato come cross-check inconcludente (non usato né per confermare né per invalidare i valori sopra, che restano letti direttamente dalla pagina FDC). Tutti i valori restano comunque da confermare col fetch reale dell'endpoint FDC al momento dell'esecuzione (è lo script stesso a farlo, non questa ricerca).
- **Perché questo record rappresenta bene il riso integrale comune italiano, non arricchito**: nessuna firma di arricchimento in stile USA — acido folico riportato esplicitamente a 0µg separato dal folato alimentare (non un valore anomalo come i 223µg/18µg visti nei record di pane/riso bianco arricchiti scartati altrove in questa coda), calcio 9mg/100g nella norma per un cereale integrale non trattato (non i 105-163mg/100g anomali visti nei record di pane scartati per la stessa ragione). Record generico SR Legacy ("Includes foods for USDA's Food Distribution Program"), non un prodotto Branded/istantaneo.
- **Analogia dichiarata**: `food_pasta_enriched_dry` — stesso criterio già usato per "riso bianco" (voce in "Eseguiti" sotto): unico cereale già presente nel Golden Set, stessa famiglia botanica (Poaceae), stesso tipo di matrice (cereale secco/crudo), `matrix_category_calcium` NULL/non applicabile, `is_heme_iron=false`. Differenza dichiarata rispetto all'analogia: come per il riso bianco, questo record è **non arricchito** — `is_fortified_folate` resta `false` (default, omesso dal comando), scelta indipendente dall'analogia e basata sul dato FDC stesso (acido folico=0µg in questo record), non per analogia.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=169703 --food-id=food_riso_integrale_raw --name-it="Riso integrale, crudo, non arricchito" --matrix-id=riso_integrale --matrix-description-it="Riso integrale" --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry --botanical-family=Poaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=169703 --food-id=food_riso_integrale_raw --name-it="Riso integrale, crudo, non arricchito" --matrix-id=riso_integrale --matrix-description-it="Riso integrale" --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry --botanical-family=Poaceae --apply
  ```

**Piano B (record alternativo, stesso alimento concettuale)** — **FDC 2512380, dataType Foundation Foods**, "Rice, brown, long grain, unenriched, raw": solo 13/17 nutrienti confermati nella pagina consultata (presenti fibra, calcio, ferro, zinco, magnesio, rame, selenio, macro; **assenti dalla pagina** vitamina C, vitamina K, B12, folato/acido folico, carotenoidi — non assunti zero, semplicemente non mostrati in quella pagina, potrebbero comunque essere nel record FDC reale). Usare SOLO se il dry-run sopra (FDC 169703) dà un riepilogo sospetto o la fetch fallisce — non lanciare entrambi, sono lo stesso alimento concettuale, creerebbero due righe duplicate nel Golden Set. **Attenzione al food_id**: NON usare `food_rice_brown_raw` — quel food_id ha già una riga `nutrient_values` orfana (`macs_mg`, `source_id` NULL, residuo del vecchio seed demo pre-Golden-Set, vedi `cleanup_macs_cruft.sql` righe 17-26) deliberatamente lasciata non pulita perché "non raggiungibile" in assenza di una riga `foods_raw` corrispondente — crearla ora con questo identico food_id la renderebbe raggiungibile e resusciterebbe silenziosamente un valore MACs senza fonte, lo stesso problema che `cleanup_macs_cruft.sql` aveva già risolto altrove. Usare invece `food_riso_integrale_foundation_raw` se questo piano B viene lanciato:
  ```
  npm run add-food -- --fdc-id=2512380 --food-id=food_riso_integrale_foundation_raw --name-it="Riso integrale a grani lunghi, crudo, non arricchito" --matrix-id=riso_integrale --matrix-description-it="Riso integrale" --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry --botanical-family=Poaceae
  ```
  (aggiungere `--apply` solo dopo dry-run pulito, stesso schema)

## Eseguiti (archivio, ultimi 10)

### Riso bianco, crudo, non arricchito — ✅ eseguito 2026-10-12

- **food_id**: `food_riso_bianco_raw`. FDC ID 169756 (SR Legacy, "Rice, white, long-grain, regular, raw, unenriched").
- **Esito reale** (dal log dell'utente, comando `--apply` lanciato sul suo PC): `food_matrices_master "riso_bianco" creata`, `foods_raw "food_riso_bianco_raw" creato (draft)`, `nutrient_values: 17 righe inserite (draft)`, verifica difensiva post-scrittura passata (17/17 nutrienti rilette, tutto coerente). FDC description confermata al momento della scrittura reale: "Rice, white, long-grain, regular, raw, unenriched" — combacia con quanto previsto in fase di ricerca.
- **Analogia usata**: `food_pasta_enriched_dry` (stessa famiglia botanica Poaceae), con `is_fortified_folate=false` perché questo record è esplicitamente non arricchito.
- Resta `verification_status='draft'` finché `scripts/verify_golden_set_batch.ts` (o una revisione umana) non lo promuove esplicitamente — non ancora fatto.
- **Piano B non usato** (scartato, non serviva): FDC 2512381 (Foundation Foods, stesso alimento concettuale, 11/17 nutrienti) — era pronto come riserva ma il piano A ha dato 17/17 pulito, quindi non è mai stato lanciato. Nessuna azione necessaria su di esso.
