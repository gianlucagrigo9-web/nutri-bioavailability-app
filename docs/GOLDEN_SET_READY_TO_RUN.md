# Comandi pronti per l'espansione Golden Set — in attesa di esecuzione umana

**Perché questo file esiste (2026-10-12).** Nessuna sessione automatica disponibile oggi può eseguire realmente `npm run add-food -- --apply`: le sessioni collegate al PC (device-link) non hanno una shell vera per le app Terminale/IDE (accesso solo "click", confermato da un collaudo reale lo stesso giorno — vedi `docs/PRD.md` §9 Fase 4 punto 16), e le sessioni cloud non collegate al PC non hanno rete diretta verso Supabase né verso `api.nal.usda.gov` (confermato più volte, vedi `docs/PENDING_HUMAN_ACTIONS.md`). La parte di **ricerca** (trovare un match FDC solido, decidere gli attributi categorici per analogia) non richiede invece né shell né rete verso Supabase/FDC diretta — solo `git` e ricerca web — quindi **può** girare da sola in un task pianificato cloud. Questo file è la coda di output di quel task: alimenti già ricercati e valutati, con i comandi pronti da incollare sul tuo PC quando hai un momento.

**Convenzione:**
- Una voce per alimento, più recenti in cima.
- Ogni voce ha: alimento, FDC ID + dataType, quanti nutrienti su 17 trovati, l'analogia dichiarata, i due comandi (dry-run e apply).
- Quando esegui un comando da qui e confermi l'esito (dal log reale, non a sensazione), la voce va spostata in "Eseguiti" con la data ed eventualmente la riga nella coda di `docs/PRD.md` va marcata `✅` — questo lavoro di chiusura lo fa una sessione interattiva (questa chat), non il task pianificato stesso (che prepara soltanto, non segue mai l'esito di un comando che non ha eseguito lui).
- Se un comando qui elencato fallisce o dà un riepilogo diverso da quanto previsto, dimmelo in chat: la voce resta qui finché non si chiarisce, non va rimossa automaticamente.

---

## Pronti

### Riso bianco, crudo, non arricchito (2026-10-12)

- **FDC ID**: 169756, dataType **SR Legacy** — "Rice, white, long-grain, regular, raw, unenriched".
- **Nutrienti attesi**: 17/17, nessun componente mancante atteso. Verifica indiretta (questo sandbox non ha rete verso `api.nal.usda.gov`): i dati "per cup" di un aggregatore (uhhospitals.org), convertiti a 100g con il peso standard FDC di 185g/cup (dedotto dall'energia: 675.25 kcal/cup ÷ 185g × 100 = 365.0 kcal/100g, identico al record gemello sotto), combaciano quasi al centesimo con TUTTI i nutrienti non soggetti ad arricchimento del record gemello arricchito (FDC 168877, stesso riso ma "enriched", dataType SR Legacy confermato via fetch diretto): zinco 1,09mg, calcio 28,0mg, magnesio 25,0mg, rame 0,22mg, selenio 15,1µg, vitamina K 0,10µg, fibra 1,30g, energia 365kcal, proteine 7,13g, grassi 0,66g, carboidrati 80,0g — tutti identici o quasi fra le due versioni, come ci si aspetta (l'arricchimento USA per legge riguarda solo ferro/tiamina/riboflavina/niacina/acido folico, non questi altri nutrienti). I due nutrienti che infatti differiscono sono esattamente quelli soggetti a fortificazione: ferro (0,80mg/100g qui, derivato dalla stessa conversione, vs 4,31mg/100g nel record arricchito — ~5x) e folato (qui 8,0µg totale, tutto "folato alimentare", acido folico 0 — vs 231µg totale di cui 223µg acido folico nel record arricchito). Nota metodologica onesta: un secondo aggregatore (triagemethod.com) riportava per questo stesso FDC ID alcuni valori per-100g incoerenti con questo cross-check (es. ferro 0,14mg, fibra 0,15g) — scartati come probabile errore di scraping di quella pagina, non usati. Tutti i valori sopra restano da confermare col fetch reale dell'endpoint FDC al momento dell'esecuzione (è lo script stesso a farlo, non questa ricerca).
- **Perché NON si è usato il record arricchito (FDC 168877) invece**: mostra la stessa firma di arricchimento in stile USA già scartata per "pane comune" nella coda del PRD (acido folico 223µg/100g riportato separatamente dal folato alimentare, ferro 4,31mg/100g anomalo) — non rappresenterebbe il riso bianco comune italiano, non arricchito per legge in UE/Italia.
- **Analogia dichiarata**: `food_pasta_enriched_dry` — unico cereale già presente nel Golden Set: stessa famiglia botanica (Poaceae), stesso tipo di matrice (cereale secco/crudo), `matrix_category_calcium` NULL/non applicabile, `is_heme_iron=false`. Differenza dichiarata rispetto all'analogia: a differenza di `food_pasta_enriched_dry`, questo record è **non arricchito** — `is_fortified_folate` resta `false` (default, omesso dal comando), scelta indipendente dall'analogia e basata sul dato FDC stesso (acido folico assente in questo record), non per analogia.
- **Comando dry-run**:
  ```
  npm run add-food -- --fdc-id=169756 --food-id=food_riso_bianco_raw --name-it="Riso bianco, crudo, non arricchito" --matrix-id=riso_bianco --matrix-description-it="Riso bianco" --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry --botanical-family=Poaceae
  ```
- **Comando con --apply** (solo dopo aver controllato l'esito del dry-run):
  ```
  npm run add-food -- --fdc-id=169756 --food-id=food_riso_bianco_raw --name-it="Riso bianco, crudo, non arricchito" --matrix-id=riso_bianco --matrix-description-it="Riso bianco" --baseline-cooking-state=raw --analogy-food-id=food_pasta_enriched_dry --botanical-family=Poaceae --apply
  ```

## Eseguiti (archivio, ultimi 10)

*(nessuno ancora)*
