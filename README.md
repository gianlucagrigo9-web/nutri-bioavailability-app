# App nutrizione — biodisponibilità, cottura, microbiota, impatto ambientale

Stato: motori core (ferro/zinco/calcio, B12, folati->DFE, vitamina A->RAE,
magnesio/rame/selenio/iodio/vitamina K (composizione grezza, senza
modello di assorbimento), microbiota, cottura, LCA) riscritti secondo il
contratto `SourcedValue` definito in `PRD.md` (v2.0), con test reali
eseguiti in `tests/engines.test.ts` (78 test: 75 PASS, 0 FAIL, 3 "limite
noto" dichiarati e quantificati, non nascosti).

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
  fattori di ritenzione verificati su USDA Release 6 / Bognár 2002 /
  Doniec 2022 per le crucifere).
- `golden_set_foods.sql` — 13 dei 20 alimenti target del Golden Set MVP,
  ogni valore sourced (USDA FoodData Central, o letteratura specifica per
  ossalati/fitati), generato da `scripts/generate_golden_set_foods.py`
  (quest'ultimo è la fonte di verità: per aggiungere un alimento, si
  modifica lo script e si rigenera il file, non il contrario). Vedi
  PRD.md §4.6 per i gap dichiarati.
- `PRD.md` — product requirements document v2.0 (perimetro MVP, schema
  dati, regole d'ingaggio, §4.0-4.6 per le decisioni su B12/folati/
  vitamina A/crucifere/micronutrienti senza modello/Golden Set prese il
  2026-10-09, alcune in autonomia e alcune per istruzione esplicita
  dell'utente — Livny §4.2, bioaccessibilità zinco cavoletti §4.4,
  magnesio/rame/selenio/iodio/vitamina K come composizione grezza §4.5,
  popolamento Golden Set §4.6).
- `computationalNutritionEngine_criteri_e_test.md` — criteri di
  accettazione e proposta di test per il motore di nutrizione,
  approvata prima della scrittura del codice.
- `docs/workflow_retrieval_letteratura.md` — procedura ripetibile per
  cercare/verificare letteratura su nuovi nutrienti (WebSearch+WebFetch,
  non uno script autonomo: la rete della shell è bloccata da policy).

## Limiti noti (dichiarati, non nascosti)

- Ferro: mancano i fattori carne/calcio/soia/alcol/uova del modello
  completo di Hallberg (solo vit.C, fitati, polifenoli implementati); il
  termine fitato dell'Equazione 2 pubblicata ha un bias strutturale
  piccolo (~+3%) documentato in `tests/engines.test.ts`.
- B12: la curva di saturazione non è fittata da un paper (solo i due
  estremi — ceiling e via passiva — sono sourced); sovrastima
  l'assorbimento reale del 30-60% a dosi 5-25µg (vedi PRD.md §4.1).
- Vitamina A: distingue crudo/cotto (Livny 2003, integrato il
  2026-10-09 su richiesta esplicita dell'utente), ma il fattore 9.44:1
  per lo stato crudo è una ricombinazione di due fonti non
  co-pubblicate (NNR2023 + Livny), non un singolo numero da un paper —
  rischio di doppio conteggio accettato esplicitamente dall'utente,
  reversibile (vedi PRD.md §4.2).
- Zinco: la deratazione per bioaccessibilità post-cottura (Doniec 2022)
  copre ESCLUSIVAMENTE i cavoletti di Bruxelles (bolliti/a vapore) — il
  paper stesso non generalizza ad altre crucifere. L'allocazione
  proporzionale della quota di zinco deratata in un pasto misto è una
  semplificazione dichiarata, non una misura diretta (vedi PRD.md §4.4).
- Magnesio/rame/selenio/iodio/vitamina K: nessun modello di assorbimento
  trovato in letteratura finora — mostrati come somma della composizione
  grezza (placeholder sourceIds `USDA_FDC`, da sostituire riga per riga
  quando il Golden Set verrà popolato), marcati `bioavailabilityAdjusted:
  false` così la UI può distinguerli come "info sommarie" (vedi PRD.md
  §4.0 e §4.5).
- Golden Set di alimenti e relativi fattori di ritenzione: Legumi/Tuberi
  (USDA Release 6) e Crucifere/cavoletti di Bruxelles (Doniec 2022) sono
  sourced; fitati e cottura a vapore per legumi restano assenti dopo due
  tentativi di ricerca.
- Golden Set (`golden_set_foods.sql`): 13/20 alimenti popolati, tutti
  sourced (vedi PRD.md §4.6). Mancano ancora: i restanti ~7 alimenti,
  un esempio di alimento fortificato con acido folico (per esercitare
  `is_fortified_folate` su un dato reale, oggi solo su dati sintetici),
  alcuni campi non recuperati per kale/latte in questa sessione (fetch
  troncato, non assenti per certo dalla fonte), e una riga reale per i
  cavoletti di Bruxelles "al vapore" (nessuna misura FDC diretta esiste
  per quello stato — derivarla avrebbe mischiato dato misurato e
  simulato nella stessa riga, scelto di non farlo: vedi PRD.md §4.6 per
  il punto architetturale che questo rivela su
  `CookingTransformationEngine`).
