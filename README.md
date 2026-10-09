# App nutrizione — biodisponibilità, cottura, microbiota, impatto ambientale

Stato: motori core (ferro/zinco/calcio, B12, folati->DFE, vitamina A->RAE,
magnesio/rame/selenio/iodio/vitamina K (composizione grezza, senza
modello di assorbimento), microbiota, cottura, LCA) riscritti secondo il
contratto `SourcedValue` definito in `docs/PRD.md` (v2.0), con test reali
eseguiti in `tests/engines.test.ts` (78 test: 75 PASS, 0 FAIL, 3 "limite
noto" dichiarati e quantificati, non nascosti). Golden Set: 20/20
alimenti popolati e promossi a `verified` (§4.6). Prototipo UI
(`app/page.tsx`, roadmap §9 punto 4) riscritto sui 20 alimenti reali con
il pannello "Perché questo numero?" — **non ancora eseguito end-to-end**
in questo ambiente (vedi "Come avviare il progetto" sotto per il perché).

## Come avviare il progetto

Questo repository non conteneva, prima del 2026-10-09, i file di scaffold
di un progetto Next.js vero (`package.json`, `tsconfig.json`,
`next.config.js`, config Tailwind) — solo il codice dei motori e del
pannello admin, scritto assumendo che un progetto li ospitasse. È lo
stesso problema di workflow descritto in `docs/audit_gemini_post_pdf.md`
(copia-incolla manuale tra chat e VS Code, mai una vera sincronizzazione
disco↔chat): questi file di scaffold ora esistono in questo stesso repo,
per chiudere quel gap una volta per tutte. Se hai già un progetto Next.js
reale altrove (sul tuo PC) con questi stessi file, quelli vincono — questi
sono ridondanti e puoi ignorarli o sovrascriverli.

```bash
npm install
cp .env.local.example .env.local   # poi riempi le chiavi Supabase/password
npm run dev                        # http://localhost:3000 — Golden Set
                                    # http://localhost:3000/admin/data-entry
npm run typecheck                  # tsc --noEmit
npm test                           # tsx tests/engines.test.ts (nessuna dipendenza)
```

**Non sono riuscito a eseguire `npm install` in questo sandbox**: la rete
di questo ambiente non risolve `registry.npmjs.org` (DNS fallisce anche
passando esplicitamente dal proxy configurato — non è un blocco di
policy, sembra un problema di rete di questa sessione specifica, diverso
da quello che blocca deliberatamente altri host). `app/page.tsx` e i file
di scaffold sono stati scritti e rivisti a mano con attenzione (import,
nomi di metodo e firme dei tipi controllati contro il codice reale dei
motori, non indovinati), ma il primo collaudo end-to-end (`npm install` +
`npm run dev` con credenziali Supabase vere) lo farai tu sul tuo PC.

## Regole d'ingaggio (vincolanti, definite dall'utente)

1. **Zero dati inventati.** Ogni valore numerico non banale deve essere
   tracciabile a una fonte primaria citata (`sourceIds`), oppure restare
   esplicitamente `null`/`draft` finché non lo è.
2. **Architettura difensiva.** Nessuna eccezione su input limite (zero,
   mancanti); nessuna divisione per zero silenziosa.
3. **Test-driven.** Criteri di accettazione e test scritti prima del
   codice di produzione, su tre livelli (A difensivo, B proprietà
   fisiologiche, C calibrazione su dato pubblicato).
4. **Trasparenza.** Se un requisito viola le linee guida UE sui
   dispositivi medici (MDCG 2019-11), il GDPR sui dati sensibili, o manca
   di supporto accademico, va segnalato e proposta un'alternativa sicura
   invece di implementarlo silenziosamente.

## Struttura

- `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`,
  `postcss.config.js`, `app/layout.tsx`, `app/globals.css` — scaffold del
  progetto Next.js 14 + TypeScript + Tailwind, aggiunto il 2026-10-09
  (vedi "Come avviare il progetto" sopra per il perché mancava).
- `lib/engine/` — i 4 motori core (TypeScript, nessuna dipendenza esterna)
  e `types.ts` con l'interfaccia `FoodItem`/`SourcedValue` condivisa.
- `lib/supabaseClient.ts` — client Supabase con chiave pubblica "anon"
  (rispetta la RLS, solo lettura), per qualunque componente che finisce
  nel browser. Diverso da `lib/supabaseAdmin.ts` (service role, solo
  Server Actions) — non scambiare i due.
- `app/page.tsx` — prototipo UI sui 20 alimenti verificati del Golden Set
  (roadmap §9 punto 4): ogni card è una riga reale e misurata (mai una
  simulazione di cottura — vedi commento in testa al file sul perché),
  con un pannello "Perché questo numero?" per ogni valore calcolato
  (fonte, livello di evidenza, intervallo di confidenza, stato).
- `tests/engines.test.ts` — suite di test reale, eseguibile con `tsx`,
  nessuna dipendenza (vitest/jest non installati in questo ambiente).
- `app/admin/data-entry/` — pannello Human-in-the-Loop per l'inserimento
  manuale di fattori di ritenzione/valori nutrizionali, protetto da
  password, con `verification_status` forzato a `draft` finché non
  revisionato.
- `*.sql` — migrazioni/fix per lo schema Supabase (RLS, source IDs,
  fattori di ritenzione verificati su USDA Release 6 / Bognár 2002 /
  Doniec 2022 per le crucifere).
- `golden_set_foods.sql` — tutti i 20 alimenti target del Golden Set MVP
  (traguardo raggiunto), ogni valore sourced (USDA FoodData Central, o
  letteratura specifica per ossalati/fitati), generato da
  `scripts/generate_golden_set_foods.py` (quest'ultimo è la fonte di
  verità: per aggiungere un alimento, si modifica lo script e si
  rigenera il file, non il contrario). Vedi docs/PRD.md §4.6 per i gap
  qualitativi ancora dichiarati (nessuno bloccante per il conteggio).
- `golden_set_promote_verified.sql` — promuove a `verified` i 20
  alimenti e i loro valori USDA FDC, dopo un cross-check meccanico
  indipendente (ri-fetch da zero di ogni FDC ID, confrontato cifra per
  cifra, 0 discrepanze) e decisione esplicita dell'utente di accettarlo
  come base per la promozione. Le 3 righe da letteratura (ossalati/
  fitati) restano deliberatamente `draft`, non essendo state
  ri-controllate in questo giro — vedi docs/PRD.md §4.6.
- `docs/` — tutta la documentazione di progetto, raccolta qui il
  2026-10-09 (prima erano sparsi nella radice del repo):
  - `docs/PRD.md` — product requirements document v2.0 (perimetro MVP,
    schema dati, regole d'ingaggio, §4.0-4.6 per le decisioni su
    B12/folati/vitamina A/crucifere/micronutrienti senza modello/Golden
    Set prese il 2026-10-09, alcune in autonomia e alcune per istruzione
    esplicita dell'utente — Livny §4.2, bioaccessibilità zinco cavoletti
    §4.4, magnesio/rame/selenio/iodio/vitamina K come composizione
    grezza §4.5, popolamento Golden Set §4.6).
  - `docs/computationalNutritionEngine_criteri_e_test.md` — criteri di
    accettazione e proposta di test per il motore di nutrizione,
    approvata prima della scrittura del codice.
  - `docs/workflow_retrieval_letteratura.md` — procedura ripetibile per
    cercare/verificare letteratura su nuovi nutrienti (WebSearch+WebFetch,
    non uno script autonomo: la rete della shell è bloccata da policy).
  - `docs/analisi_sessione_gemini.md`, `docs/audit_gemini_post_pdf.md` —
    analisi della sessione di lavoro precedente con Gemini (il problema
    del copia-incolla manuale chat↔VS Code, mai risolto fino allo
    scaffold Next.js aggiunto in questa sessione — vedi "Come avviare il
    progetto" sopra).
  `README.md` resta invece nella radice del repo: è lì che GitHub lo
  mostra automaticamente quando apri il repository.

## Limiti noti (dichiarati, non nascosti)

- Ferro: mancano i fattori carne/calcio/soia/alcol/uova del modello
  completo di Hallberg (solo vit.C, fitati, polifenoli implementati); il
  termine fitato dell'Equazione 2 pubblicata ha un bias strutturale
  piccolo (~+3%) documentato in `tests/engines.test.ts`.
- B12: la curva di saturazione non è fittata da un paper (solo i due
  estremi — ceiling e via passiva — sono sourced); sovrastima
  l'assorbimento reale del 30-60% a dosi 5-25µg (vedi docs/PRD.md §4.1).
- Vitamina A: distingue crudo/cotto (Livny 2003, integrato il
  2026-10-09 su richiesta esplicita dell'utente), ma il fattore 9.44:1
  per lo stato crudo è una ricombinazione di due fonti non
  co-pubblicate (NNR2023 + Livny), non un singolo numero da un paper —
  rischio di doppio conteggio accettato esplicitamente dall'utente,
  reversibile (vedi docs/PRD.md §4.2).
- Zinco: la deratazione per bioaccessibilità post-cottura (Doniec 2022)
  copre ESCLUSIVAMENTE i cavoletti di Bruxelles (bolliti/a vapore) — il
  paper stesso non generalizza ad altre crucifere. L'allocazione
  proporzionale della quota di zinco deratata in un pasto misto è una
  semplificazione dichiarata, non una misura diretta (vedi docs/PRD.md §4.4).
- Magnesio/rame/selenio/iodio/vitamina K: nessun modello di assorbimento
  trovato in letteratura finora — mostrati come somma della composizione
  grezza (placeholder sourceIds `USDA_FDC`, da sostituire riga per riga
  quando il Golden Set verrà popolato), marcati `bioavailabilityAdjusted:
  false` così la UI può distinguerli come "info sommarie" (vedi docs/PRD.md
  §4.0 e §4.5).
- Golden Set di alimenti e relativi fattori di ritenzione: Legumi/Tuberi
  (USDA Release 6) e Crucifere/cavoletti di Bruxelles (Doniec 2022) sono
  sourced; fitati e cottura a vapore per legumi restano assenti dopo due
  tentativi di ricerca.
- Golden Set (`golden_set_foods.sql` + `golden_set_promote_verified.sql`):
  20/20 alimenti popolati (target MVP raggiunto) e promossi a `verified`
  dopo cross-check meccanico indipendente (vedi docs/PRD.md §4.6); le 3 righe
  da letteratura (ossalati/fitati) restano `draft`, non ri-controllate in
  questo giro. Gap qualitativi ancora dichiarati (non bloccanti per il
  conteggio o la promozione): la controparte "cotta" dei
  broccoli (FDC ID non trovato dopo due tentativi sbagliati); alcuni
  campi non recuperati per kale/latte (fetch troncato, non assenti per
  certo dalla fonte); una riga reale per i cavoletti di Bruxelles "al
  vapore" (nessuna misura FDC diretta esiste per quello stato — derivarla
  avrebbe mischiato dato misurato e simulato nella stessa riga, scelto di
  non farlo: vedi docs/PRD.md §4.6 per il punto architetturale che questo
  rivela su `CookingTransformationEngine`); e per la pasta arricchita
  (l'alimento fortificato), il campo `folate_mcg` contiene solo l'acido
  folico (66 µg) e non la quota di folato naturale (7 µg), per i limiti
  dello schema a singolo campo usato da `calculateFolateDFE` (vedi
  docs/PRD.md §4.6).
