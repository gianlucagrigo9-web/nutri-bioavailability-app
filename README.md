# App nutrizione — biodisponibilità, cottura, microbiota, impatto ambientale

Stato: motori core (ferro/zinco/calcio, microbiota, cottura, LCA) riscritti
secondo il contratto `SourcedValue` definito in `PRD.md` (v2.0), con test
reali eseguiti in `tests/engines.test.ts`.

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

- `lib/engine/` — i 4 motori core (TypeScript, nessuna dipendenza esterna)
  e `types.ts` con l'interfaccia `FoodItem`/`SourcedValue` condivisa.
- `tests/engines.test.ts` — suite di test reale, eseguibile con `tsx`,
  nessuna dipendenza (vitest/jest non installati in questo ambiente).
- `app/admin/data-entry/` — pannello Human-in-the-Loop per l'inserimento
  manuale di fattori di ritenzione/valori nutrizionali, protetto da
  password, con `verification_status` forzato a `draft` finché non
  revisionato.
- `*.sql` — migrazioni/fix per lo schema Supabase (RLS, source IDs,
  fattori di ritenzione verificati su USDA Release 6 / Bognár 2002).
- `PRD.md` — product requirements document v2.0 (perimetro MVP, schema
  dati, regole d'ingaggio).
- `computationalNutritionEngine_criteri_e_test.md` — criteri di
  accettazione e proposta di test per il motore di nutrizione,
  approvata prima della scrittura del codice.

## Limiti noti (dichiarati, non nascosti)

- Ferro: mancano i fattori carne/calcio/soia/alcol/uova del modello
  completo di Hallberg (solo vit.C, fitati, polifenoli implementati); il
  termine fitato dell'Equazione 2 pubblicata ha un bias strutturale
  piccolo (~+3%) documentato in `tests/engines.test.ts`.
- Golden Set di alimenti e relativi fattori di ritenzione: solo
  Legumi/Tuberi (USDA Release 6, boiled) sono sourced finora; il resto
  del dataset va popolato riga per riga tramite il pannello admin.
