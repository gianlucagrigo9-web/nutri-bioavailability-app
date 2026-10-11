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

- [2026-10-11, sessione interattiva] Eseguire `add_dish_templates.sql` (root del repo) sul DB reale via SQL editor Supabase o sul PC — crea `dish_templates`/`dish_components` (Fase 4.16b, design §4.8, approvato). Motivo: questo sandbox non ha rete diretta verso Supabase. Leggere la query di verifica in fondo al file dopo l'esecuzione (attesi: 2 tabelle create, RLS attiva su entrambe).

## Risolte (archivio breve, ultime 10)

(nessuna ancora)
