# Azioni pendenti che richiedono l'utente o accesso che questo sandbox non ha

**Perché questo file esiste (2026-10-11).** Il sandbox interattivo (dove Claude chatta con l'utente) non ha accesso di rete diretto a Supabase né a `api.nal.usda.gov` — solo il PC dell'utente lo ha. Prima di questo file, ogni volta che una sessione interattiva incontrava un blocco di questo tipo si fermava e chiedeva subito all'utente di agire (es. eseguire una query SQL via browser). Su richiesta esplicita dell'utente: invece di interrompere, una sessione bloccata **accoda qui** la richiesta e **continua con tutto il resto che non dipende da quel blocco**. Il task pianificato "Revisione notturna Golden Set" legge questo file ogni sera, lo riporta in forma consolidata, e propone l'ordine per il giorno dopo — così l'utente gestisce tutte le richieste di sblocco in un solo momento, invece di essere interrotto più volte durante il giorno.

**Convenzione per chi aggiunge una voce** (qualunque sessione, interattiva o pianificata):
- Una riga per voce, in cima alla sezione "In attesa" (più recenti in alto).
- Formato: `- [YYYY-MM-DD, tipo sessione] Cosa serve fare — perché è bloccato qui.`
- Solo per blocchi che NON fermano tutto il resto del lavoro di quella sessione — se un blocco impedisce di proseguire su qualunque fronte, è comunque corretto fermarsi e dirlo subito in chat, non solo loggarlo qui.
- Non duplicare una voce già presente per lo stesso identico blocco.

**Convenzione per chiudere una voce**: quando l'utente esegue l'azione (o dice di averla eseguita), spostarla nella sezione "Risolte" con la data di chiusura, non cancellarla subito — serve da registro per la revisione notturna successiva.

---

## In attesa

- [2026-10-11, sessione interattiva] Eseguire `add_sources_larn_efsa_porzioni.sql` (root del repo, appena scritto) sul DB reale via SQL editor Supabase — inserisce le 3 righe `sources` mancanti (`LARN_2024_SINU`, `EFSA_DRV_SUMMARY_2017`, `LARN_2024_SINU_PORZIONI_STANDARD`) referenziate da `lib/engine/nutrientTargets.ts` e `lib/engine/standardPortions.ts`. Motivo del blocco: **diverso dagli altri** — non è mancanza di rete, ma il classificatore di sicurezza della modalità auto di questa sessione ha bloccato esplicitamente il click su "Run" nell'editor SQL di Supabase con motivo "[Production Deploy]" (scrittura su branch `main · PRODUCTION`). SHA-256 del file al momento della scrittura: `04ca5b746f5944fad1c08c363e5b43d8aa4469f4eedc4fc6cf699be19e3b32b0`. Contenuto già verificato (nessuna corruzione, SQL corretto, citazioni complete) — serve solo che l'utente stesso clicchi "Run" nell'SQL editor di Supabase (query già pronta, basta incollare il file), oppure confermi esplicitamente di voler autorizzare quell'azione specifica in una prossima sessione. Il blocco `DO $$` in fondo RAISE un'eccezione se non tutte e 3 le righe risultano scritte con `source_type='institutional_report'`.

## Risolte (archivio breve, ultime 10)

- [2026-10-11, sessione interattiva, chiusa 2026-10-11] Eseguito `add_diet_compatibility_golden_set.sql` sul DB reale (Supabase, progetto APPLICAZIONE V1, branch main · PRODUCTION) via SQL editor. Verificato con query indipendente post-esecuzione: 3 colonne create, 30/30 righe del Golden Set classificate su tutti e 3 gli assi (vegetarian/vegan/fruitarian), 0 incoerenze logiche (vegan=true&vegetarian=false, fruitarian=true&vegan=false). Esito atteso confermato.
- [2026-10-11, sessione interattiva, chiusa 2026-10-11] Eseguito `add_dish_templates.sql` sul DB reale (stesso progetto/branch) via SQL editor. Query di verifica in fondo al file confermata: `dish_templates_esiste=1`, `dish_components_esiste=1`, `dish_templates_rls_on=true`, `dish_components_rls_on=true`.
