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

- [2026-10-11, sessione interattiva] Creare riga `sources` reale per `LARN_2024_SINU_PORZIONI_STANDARD` sul DB reale — serve al `sourceIds` referenziato da `lib/engine/standardPortions.ts` (porzioni standard LARN 2024 per i 28/30 food_id del Golden Set, docs/PRD.md §4.8/§4.9). Motivo: questo sandbox non ha rete diretta verso Supabase. Citazione: LARN V Revisione (2024, SINU), "Standard quantitativi delle porzioni", consultata via la pubblicazione secondaria SSD IAN ATS Brescia ("Porzioni standard degli alimenti per la popolazione adulta", ats-brescia.it, 27/03/2025) — non il PDF ufficiale SINU.
- [2026-10-11, sessione interattiva] Creare righe `sources` reali per `LARN_2024_SINU` ed `EFSA_DRV_SUMMARY_2017` sul DB reale (tabella `sources`, vedi schema §5 di docs/PRD.md) — servono a dare una riga reale ai `sourceIds` referenziati da `lib/engine/nutrientTargets.ts` (12 target numerici LARN/EFSA per micronutrienti, docs/PRD.md §4.9). Motivo: questo sandbox non ha rete diretta verso Supabase. Citazioni da usare per la riga: LARN V Revisione (2024, SINU) consultata via tabelle di sintesi SmartFood/IEO (`smartfood.ieo.it/media/{ad5l2acl,wefj2kxp,swie5abw}/smartfood_tabella_larn_{minerali,vitamine_idrosolubili,vitamine_liposolubili}_2025.pdf`, non il PDF ufficiale SINU — gap dichiarato); EFSA "Dietary Reference Values for nutrients: Summary report" (EFSA Supporting Publication 2017:e15121).
- [2026-10-11, sessione interattiva] Eseguire `add_diet_compatibility_golden_set.sql` (root del repo) sul DB reale via SQL editor Supabase o sul PC — aggiunge 3 colonne (`diet_compat_vegetarian/vegan/fruitarian`) a `foods_raw` e classifica i 30 alimenti del Golden Set (docs/PRD.md §4.9, filtro tipo-dieta). Motivo: questo sandbox non ha rete diretta verso Supabase. SHA-256 del file al momento della scrittura (verificare prima di eseguire): `d86cd50d6463e456e6cb84c116cdb103c06db80826b5309cd9b8992567ebb315`. Il blocco `DO $$` in fondo al file RAISE un'eccezione se qualcosa non torna (food_id mancante, classificazione incompleta, incoerenza logica vegano/vegetariano o fruttariano/vegano) — atteso un semplice NOTICE "30/30/30/0". **Nota**: la stessa classificazione esiste già come mappa TypeScript in `lib/engine/goldenSetDietCompatibility.ts` (testata, usabile subito in sviluppo/test) — questo file SQL serve solo a portarla sul DB reale per quando `app/page.tsx` verrà wired a leggerla da lì.
- [2026-10-11, sessione interattiva] Eseguire `add_dish_templates.sql` (root del repo) sul DB reale via SQL editor Supabase o sul PC — crea `dish_templates`/`dish_components` (Fase 4.16b, design §4.8, approvato). Motivo: questo sandbox non ha rete diretta verso Supabase. Leggere la query di verifica in fondo al file dopo l'esecuzione (attesi: 2 tabelle create, RLS attiva su entrambe).

## Risolte (archivio breve, ultime 10)

(nessuna ancora)
