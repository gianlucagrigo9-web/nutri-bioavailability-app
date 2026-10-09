# Workflow di retrieval/triage della letteratura

Formalizza quello che è stato fatto ad-hoc più volte in questo progetto
(verifica Hallberg 2000, Miller 2007, Heaney&Weaver, IOM 1998, NNR2023,
Livny 2003, Doniec 2022...), così è ripetibile per i prossimi nutrienti
senza reinventare il processo ogni volta.

## Perché non è uno script autonomo

Tentativo fatto e verificato (2026-10-09): chiamare direttamente API come
CrossRef, Unpaywall, OpenAlex o PubMed via `curl`/`requests` da uno script
shell in questo ambiente sandbox **non funziona** — la rete d'uscita è
filtrata da una policy che blocca (403) tutto tranne un allowlist (registri
di pacchetti, GitHub). Quindi "l'agente" non è un processo headless che
gira da solo nella shell.

Quello che funziona sono gli strumenti di ricerca/fetch web di Claude
(diversi dalla shell, passano da un altro percorso di rete) — sono quelli
usati per ogni citazione in questo repository.

## Procedura (ripetibile per batch di nutrienti)

1. **Query mirate** (non generiche): nome del nutriente/molecola + il
   fenomeno specifico cercato (es. "bioavailability", "absorption kinetics",
   "retention factor") + se noto l'autore/anno di uno studio cardine. 2-4
   query in parallelo su angoli diversi (review vs studio primario vs dati
   di cottura specifici).
2. **Identificare candidati con accesso libero** — ignorare risultati
   dietro paywall evidente (informahealthcare, alcuni Cambridge Core senza
   "core-reader") a meno che l'abstract da solo basti.
3. **Fetch full-text, non solo abstract**, quando possibile — gli abstract
   spesso omettono i numeri esatti (vedi: l'abstract di Levine 1996 non
   dà le percentuali per dose, serviva la review 2001 di Padayatty&Levine
   per quei numeri specifici).
4. **Verificare SEMPRE la citazione esatta** (titolo, autori, anno, rivista,
   DOI) con una chiamata dedicata se il primo fetch non la dà per intero —
   non fidarsi del titolo dell'URL.
5. **Distinguere il tipo di fonte**: studio primario con parametri propri
   fittati e CI pubblicati (Miller 2007, Heaney&Weaver) vs convenzione
   istituzionale adottata senza fonte propria (NNR2023 RAE) vs dato singolo
   senza intervallo (Doniec 2022 n=3). Questo decide `evidenceLevel` e
   se `confidenceLow/High` possono essere popolati con un vero intervallo
   o devono restare `null`.
6. **Se due fonti misurano cose diverse e non sono facilmente combinabili
   senza rischio di doppio conteggio** (vedi: Livny 2003 % di assorbimento
   crudo/cotto vs NNR2023 fattore RAE medio 6:1 — caso reale, non integrato
   stanotte per questo motivo), **non combinarle arbitrariamente**: documentare
   entrambe separatamente e lasciare la decisione di integrazione esplicita
   per la prossima sessione, non indovinare.
7. **Se dopo 2 tentativi di ricerca mirata il dato resta assente** (vedi:
   fattori di ritenzione per i fitati, cercati sia nella sessione originale
   che stanotte, mai trovati in forma citabile), fermarsi e dichiararlo
   assente esplicitamente invece di continuare a cercare all'infinito o,
   peggio, stimare un valore.

## Come invocarlo per il prossimo batch

Non serve altro che chiedere a Claude (in una conversazione o in un task
pianificato) di applicare questi 7 passi a una lista di nutrienti/matrici
specifica, es.: "applica il workflow di retrieval a: magnesio (inibizione
da fitati), rame (antagonismo con lo zinco), vitamina K (rilascio dalla
matrice vegetale)". Il risultato atteso è, per ciascuno: o un'implementazione
con criteri/test (come B12, DFE, RAE stanotte), o una dichiarazione esplicita
di "dato non trovato, resta in attesa" (come i fitati).
