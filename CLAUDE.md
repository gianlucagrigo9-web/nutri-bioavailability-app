# nutri-bioavailability-app — istruzioni per Claude Code

Leggi **`docs/PRD.md`** per intero prima di modificare qualunque cosa. È la fonte di verità del progetto (stato reale, decisioni prese, gap dichiarati, roadmap) — non riassumerlo a memoria da una sessione precedente, rileggilo sempre.

## Le 4 regole ferree (docs/PRD.md §2) — non negoziabili, in nessuna sessione

1. **Zero dati inventati.** Ogni numero o citazione non banale deve risalire a una fonte primaria verificata, o restare esplicitamente `null`/`draft`. Mai un placeholder plausibile, mai un valore "ragionevole" senza fonte.
2. **Architettura difensiva.** Nessuna eccezione sui casi limite, nessun fallimento silenzioso. Ogni scrittura importante sul DB ha una verifica difensiva che segnala i problemi invece di assumere che sia andato tutto bene.
3. **Test-driven.** Criteri di accettazione/test proposti e approvati prima del codice di produzione, non dopo.
4. **Trasparenza.** Se qualcosa viola questi standard o manca di supporto scientifico, dillo esplicitamente — non implementarlo in silenzio, non saltarlo in silenzio.

## Convenzioni del progetto (non reinventarle)

- **Niente ORM/migrazioni automatiche**: le modifiche allo schema Supabase sono file `.sql` sciolti in root (es. `fix_*.sql`, `add_*.sql`), con un blocco `DO $$ ... RAISE EXCEPTION/NOTICE` di verifica difensiva alla fine, eseguiti a mano via SQL editor e poi committati come registro di quanto fatto.
- **`verification_status`**: ogni riga `draft`/`verified` per design. `draft` è il default di qualunque inserimento (pannello admin o script); `verified` è sempre una promozione esplicita, mai un default silenzioso — vedi `golden_set_promote_verified.sql` per il precedente umano e `scripts/verify_golden_set_batch.ts` per quello meccanico (solo `source_id='USDA_FDC'`).
- **Test**: nessun framework esterno (niente jest/vitest). Micro test runner autosufficiente (`describe`/`it`/`expect`) in `tests/*.test.ts`, eseguito con `tsx`. `npm test` li esegue tutti in sequenza. Segui la stessa convenzione per nuovi file di test.
- **Script standalone** (`scripts/*.ts`, eseguiti con `tsx`, non da Next.js) **non caricano `.env.local` automaticamente** — solo `next dev`/`next build` lo fanno. Qualunque nuovo script che usa variabili d'ambiente deve caricarle da sé (vedi il parser minimo in cima a `scripts/verify_golden_set_batch.ts`) o fallire con un errore chiaro, mai con un valore `undefined` silenzioso.
- **Questo sandbox non ha accesso di rete diretto** a Supabase (`*.supabase.co`) né a `api.nal.usda.gov` (confermato via `curl`, vedi commit `dd8ca8a`). Scrivere sul DB reale passa per il browser (Chrome/Claude in Chrome, editor SQL di Supabase) con verifica SHA-256 del contenuto prima di eseguire grandi blocchi SQL; chiamate API esterne che richiedono rete diretta vanno scritte come script e **collaudate dall'utente sul suo PC**, mai assunte funzionanti da qui.

## Prima di dichiarare un task finito

- Rileggi la sezione pertinente di `docs/PRD.md` e aggiornala con lo stato reale (fatto/non fatto/eseguito ma non collaudato) — non lasciare il PRD disallineato dal codice.
- Se hai scritto o modificato logica non banale, esegui `npm test` e riporta il risultato reale, non "dovrebbe funzionare".
- Se un file va eseguito sul PC dell'utente (accesso di rete/DB che questo sandbox non ha), dillo esplicitamente — non dare per scontato che l'esecuzione qui equivalga a un collaudo reale.
