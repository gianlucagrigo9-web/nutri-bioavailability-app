# nutri-bioavailability-app — istruzioni per Claude Code

Leggi **`docs/PRD.md`** per intero prima di modificare qualunque cosa. È la fonte di verità del progetto (stato reale, decisioni prese, gap dichiarati, roadmap) — non riassumerlo a memoria da una sessione precedente, rileggilo sempre.

## Le 6 regole ferree (docs/PRD.md §2) — non negoziabili, in nessuna sessione

*(Correzione 2026-10-11: questo file ne elencava solo 4, una semplificazione imprecisa. Il PRD §2 ne ha sempre avute 6 — vedi lì per il testo integrale.)*

1. **Zero dati inventati.** Ogni numero o citazione non banale deve risalire a una fonte primaria verificata, o restare esplicitamente `null`/`draft`. Mai un placeholder plausibile, mai un valore "ragionevole" senza fonte.
2. **Range di confidenza, non punti singoli**, quando la fonte li riporta — mai un range fabbricato per sembrare più rigorosi.
3. **Ogni claim ha un livello di evidenza dichiarato.**
4. **Architettura difensiva.** Nessuna eccezione sui casi limite, nessun fallimento silenzioso. Ogni scrittura importante sul DB ha una verifica difensiva che segnala i problemi invece di assumere che sia andato tutto bene.
5. **Test-first.** Criteri di accettazione/test proposti e approvati prima del codice di produzione, non dopo.
6. **Trasparenza e rifiuto motivato.** Se qualcosa viola questi standard, manca di supporto scientifico o esce dal perimetro §1.1, dillo esplicitamente con un'alternativa sicura — non implementarlo in silenzio, non saltarlo in silenzio.

## Convenzioni del progetto (non reinventarle)

- **Niente ORM/migrazioni automatiche**: le modifiche allo schema Supabase sono file `.sql` sciolti in root (es. `fix_*.sql`, `add_*.sql`), con un blocco `DO $$ ... RAISE EXCEPTION/NOTICE` di verifica difensiva alla fine, eseguiti a mano via SQL editor e poi committati come registro di quanto fatto.
- **`verification_status`**: ogni riga `draft`/`verified` per design. `draft` è il default di qualunque inserimento (pannello admin o script); `verified` è sempre una promozione esplicita, mai un default silenzioso — vedi `golden_set_promote_verified.sql` per il precedente umano e `scripts/verify_golden_set_batch.ts` per quello meccanico (solo `source_id='USDA_FDC'`).
- **Test**: nessun framework esterno (niente jest/vitest). Micro test runner autosufficiente (`describe`/`it`/`expect`) in `tests/*.test.ts`, eseguito con `tsx`. `npm test` li esegue tutti in sequenza. Segui la stessa convenzione per nuovi file di test.
- **Script standalone** (`scripts/*.ts`, eseguiti con `tsx`, non da Next.js) **non caricano `.env.local` automaticamente** — solo `next dev`/`next build` lo fanno. Qualunque nuovo script che usa variabili d'ambiente deve caricarle da sé (vedi il parser minimo in cima a `scripts/verify_golden_set_batch.ts`) o fallire con un errore chiaro, mai con un valore `undefined` silenzioso.
- **Questo sandbox non ha accesso di rete diretto** a Supabase (`*.supabase.co`) né a `api.nal.usda.gov` (confermato via `curl`, vedi commit `dd8ca8a`). Scrivere sul DB reale passa per il browser (Chrome/Claude in Chrome, editor SQL di Supabase) con verifica SHA-256 del contenuto prima di eseguire grandi blocchi SQL; chiamate API esterne che richiedono rete diretta vanno scritte come script e **collaudate dall'utente sul suo PC**, mai assunte funzionanti da qui.
- **Blocchi di questo tipo non fermano automaticamente la sessione** (convenzione introdotta il 2026-10-11, su richiesta esplicita dell'utente): se il blocco impedisce solo UNA parte del lavoro, accoda una riga in `docs/PENDING_HUMAN_ACTIONS.md` (formato spiegato in testa al file) e continua con tutto il resto. Il task pianificato "Revisione notturna Golden Set" lo legge ogni sera e lo riporta in forma consolidata, così l'utente sblocca tutto in un solo momento invece di essere interrotto più volte al giorno. Se invece il blocco impedisce di proseguire su qualunque fronte, fermarsi e dirlo subito in chat resta corretto — il file non sostituisce quel caso.

## Prima di dichiarare un task finito

- Rileggi la sezione pertinente di `docs/PRD.md` e aggiornala con lo stato reale (fatto/non fatto/eseguito ma non collaudato) — non lasciare il PRD disallineato dal codice.
- Se hai scritto o modificato logica non banale, esegui `npm test` e riporta il risultato reale, non "dovrebbe funzionare".
- Se un file va eseguito sul PC dell'utente (accesso di rete/DB che questo sandbox non ha), dillo esplicitamente — non dare per scontato che l'esecuzione qui equivalga a un collaudo reale.
