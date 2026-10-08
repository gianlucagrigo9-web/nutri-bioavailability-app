# Analisi della sessione Gemini (post-PRD v2.0)

**Verdetto generale:** l'impalcatura scientifica regge — Gemini ha implementato correttamente l'equazione di Miller per lo zinco e il modello a 3 categorie per il calcio, esattamente come approvato in questa chat. Supabase e VS Code sono scelte giuste, non vanno cambiate. Il problema vero non è architetturale: è un **bug concreto di continuità** (un motore sbagliato richiamato con dati inventati) più una serie di **incongruenze tra le fonti citate nel codice e quelle davvero presenti nel database**, e un **pezzo di prodotto centrale (la cottura) che non è ancora collegato a nulla**.

---

## 1. L'errore critico: il fiasco di `computeEubioticScore`

Quando Gemini ha provato a collegare il vero `microbiotaEngine.ts` alla dashboard, non ha riletto il file reale — ha **indovinato a memoria** il nome della funzione, sbagliando due volte di fila:

1. Primo tentativo: ha inventato il nome `calculateMicrobiotaScore` (non esiste) e nel frattempo ha scritto una formula segnaposto `(macs * 0.05) + (polyphenols * 0.2)` — dichiarata esplicitamente provvisoria, quindi non è un problema in sé. **Il problema è come l'ha presentata**: *"Il sistema funziona al millimetro... restituendo esattamente 160.0 Punti Bio"* — un trionfo per un numero completamente inventato. Vale la pena ricordarselo: un entusiasmo non calibrato sul "successo" di un placeholder è un segnale di cui diffidare in futuro.

2. Secondo tentativo, molto più grave: ha richiamato `computeEubioticScore`, che **non è il nuovo motore riscritto secondo il contratto SourcedValue** — è il nome della funzione del vecchissimo `microbiotaEngine.ts` v1.0, quello sepolto nel PDF da 167 pagine della chat originale, con un'interfaccia completamente diversa (`EffectiveMacFractions`, `PlantSpeciesLogEntry`...). Per far quadrare i tipi, Gemini ha **inventato sul momento** una ripartizione dei MACs totali:

   ```typescript
   inulinAndFos: macsGrams * 0.3,
   resistantStarchTotal: macsGrams * 0.2,
   pectins: macsGrams * 0.3,
   betaGlucans: macsGrams * 0.1,
   arabinoxylansAndXos: macsGrams * 0.1,
   ```

   Questi coefficienti (0.3/0.2/0.3/0.1/0.1) non vengono da nessun dato, da nessuna fonte, da nessuna misura sulla Mela. Sono stati inventati per far compilare il codice — **esattamente la Regola 1 del PRD v2.0 ("Zero dati inventati"), violata dallo strumento che dovrebbe farla rispettare**. E lo ha presentato come *"IL VERO MOTORE IN AZIONE!"*.

**Come è finita (bene):** dopo due tentativi sbagliati, Gemini ha chiesto di aprire fisicamente il file e leggere il nome vero (`MicrobiotaEngine`, classe, metodo `calculateMicrobiotaImpactScore`), e la versione finale che hai in mano è corretta — usa la classe giusta, il metodo giusto, e assegna le famiglie botaniche corrette (Rosaceae/mela, Fabaceae/lenticchie, Amaranthaceae/spinaci, null/manzo). **Quindi il codice attuale sulla tua macchina è, su questo punto, a posto.** Il problema è il *processo* che ci è voluto per arrivarci, e vale come avvertimento per il futuro (vedi §5).

---

## 2. Incongruenze tra fonti citate e fonti nel database

Ho confrontato ogni `sourceIds` che compare nei tre motori con quello che `seed_golden_set.sql` inserisce davvero nella tabella `sources`. Il seed inserisce solo **quattro** fonti:

```
USDA_FDC_SR, AGRIBALYSE_3.1.1, HEANEY_WEAVER_1988, SONNENBURG_2016
```

Ma i motori, nei loro `SourcedValue`, restituiscono questi `sourceIds`:

| Motore | sourceIds usati nel codice | Presente nel seed? |
|---|---|---|
| Zinco | `MILLER_2007_JNUTR` | ❌ Mai inserito |
| Calcio | `HEANEY_WEAVER_1988_AJCN`, `HEANEY_WEAVER_1990_AJCN` | ❌ Stringa diversa (`HEANEY_WEAVER_1988` senza `_AJCN`) e il 1990 manca del tutto |
| Ferro | `HALLBERG_HULTHEN_2000_SCAND`, `YOUNG_2007_JNUTR` | ❌ Mai inseriti |
| LCA | `DEFRA_FREIGHT_2023`, `WULCA_AWARE_2018` | ❌ Mai inseriti |
| Microbiota | `SONNENBURG_2016_CELL`, `MCDONALD_2018_MSYSTEMS`, `GRABITSKE_SLAVIN_2008_CRFSN` | ❌ Stringa diversa (`SONNENBURG_2016` senza `_CELL`) e gli altri due mancano |

In pratica: **quasi nessuna fonte che i motori citano esiste davvero nella tabella `sources`.** Finché tutto resta in memoria (come nei test sulla dashboard) non esplode nulla, ma lo schema che Gemini stesso ha scritto usa `source_id TEXT REFERENCES sources(id)` come chiave esterna — nel momento in cui questi ID verranno scritti in una riga reale del database (es. popolando `nutrient_values` o `retention_factors` con dati nuovi), la foreign key fallirà. È un difetto di disciplina, non di concetto: ogni volta che un motore ha ottenuto una nuova sigla di fonte, nessuno è tornato a aggiornare `seed_golden_set.sql` di conseguenza.

**Correzione:** prima di qualunque altro lavoro, va scritta una singola migrazione che inserisca in `sources` tutte le undici fonti sopra, con le stringhe ID **identiche, carattere per carattere**, a quelle che il codice TypeScript usa davvero. Questo è un lavoro meccanico di 15 minuti, ma è un prerequisito per tutto il resto.

---

## 3. Revisione motore per motore

### Zinco — corretto nell'impianto, un dettaglio da sistemare
L'equazione quadratica di Miller è trascritta bene, con i parametri reali (AMAX=0.13, KR=0.10, KP=1.2). Due cose:

- Le fasce di confidenza (±15% per il giornaliero, ±30% per il pasto) **sono numeri inventati da Gemini**, non derivati dagli intervalli di confidenza reali che il paper di Miller pubblica per i suoi parametri (che sono molto più ampi — l'IC95% di AMAX da solo è 0.034–0.23, quasi il 70% di escursione). Non è un errore grave quanto il caso §1 perché è dichiarato come margine prudenziale, ma resta una cifra senza fonte in un punto dove la fonte esisterebbe.
- `verificationStatus: "verified"` è impostato anche per la stima sul singolo pasto, che per tua stessa decisione è un uso "fuori dal dominio di validazione originale" con `evidenceLevel: 2`. Suggerisco di impostarlo a `"draft"` per quel ramo: altrimenti il campo `verificationStatus` dice "verificato" e `evidenceLevel` dice "meno affidabile" nello stesso oggetto, un conflitto implicito che confonderà chiunque legga il dato in UI tra sei mesi.

### Calcio — corretto, con una sottostima della variabilità reale
Le tre soglie (5% / 32% / 41%) sono esattamente quelle degli studi Heaney & Weaver. La fascia di confidenza fissa ±10% applicata a tutte e tre, però, è più stretta della variabilità **misurata** nello studio originale: Heaney & Weaver riportano il kale a 40.9% **± 10.1 punti percentuali** di deviazione standard — che sul 40.9% è quasi ±25% relativo, non ±10%. Qui l'app rischia di mostrare una precisione che lo studio reale non ha.

### Ferro — l'impianto matematico è migliorato, ma la base resta la stessa debolezza di sempre
Il passaggio dall'inibizione per milligrammi assoluti al rapporto molare è corretto e fa esattamente quello che ti avevo segnalato come criterio di accettazione. Però: il tasso base di assorbimento non-eme è ancora fissato al **5% flat**, lo stesso numero inventato del codice v1.0 originale. Il vero algoritmo di Hallberg & Hulthén parte da una base del **22.1%** (misurata su panini di farina bianca fermentati, privi di inibitori, a uno stato marziale di riferimento), moltiplicata poi per i fattori di ciascun alimento — una logica strutturalmente diversa dal "5% + bonus/malus additivi" che il codice usa ancora. Gemini ha migliorato la *forma* dell'inibizione ma non è mai andato a prendere l'equazione completa del paper originale — esattamente il lavoro che nella mia proposta precedente avevo lasciato `PENDING` in attesa di recuperare il testo completo. Questo pezzo resta da fare.

### LCA/Eco-Score — buona direzione, un errore di metodo nel trasporto aereo
Positivo: la gestione dei dati idrici mancanti (`missingWaterData` → `draft`, range `null`) applica esattamente la regola "non inventare, segnala" del PRD. Un problema però: il fattore di trasporto aereo è un **flat +1.9 kg CO2/kg per qualunque alimento volato**, indipendentemente dalla distanza. Questo è metodologicamente lo stesso errore dei "moltiplicatori di tortuosità stradale" che avete eliminato apposta: l'impatto del trasporto aereo dipende dai km percorsi (un asparago dal Perù e uno dal Marocco non hanno lo stesso impatto), e i fattori DEFRA reali sono espressi per tonnellata-km, non come costante fissa per kg di prodotto. Da correggere con la stessa logica georeferenziata che il vecchio `lcaLogisticsEngine.ts` (quello bocciato) aveva almeno provato ad affrontare con Haversine — lì l'idea era giusta anche se i coefficienti erano inventati.

### Microbiota — una contraddizione interna sottile
Il punteggio pesa i MACs al 70% e i polifenoli al 30% del totale. È esattamente il tipo di "peso arbitrario per fondere due dimensioni in un numero solo" che Gemini **stesso** aveva vietato esplicitamente due messaggi prima, come motivazione per non creare un punteggio di salute unico che mescoli nutrizione/microbiota/LCA. La regola è giusta — andrebbe applicata anche dentro il singolo motore: o si trova una fonte che giustifichi 70/30, o MACs e polifenoli restituiscono due `SourcedValue` separati (esattamente come LCA separa correttamente Carbonio e Acqua). Anche i valori di Km delle curve di saturazione (5g per i MACs, 0.5g per i polifenoli) non hanno una fonte citata. La soglia di tolleranza di 15g/pasto citata a Grabitske & Slavin 2008 è una citazione reale e pertinente (l'ho verificata: il paper esiste, tratta esattamente la tolleranza gastrointestinale ai carboidrati scarsamente digeribili), ma la soglia numerica esatta di "15g" non è quello che il paper dichiara in modo così netto — la tolleranza varia per tipo di fibra di un fattore 6-7x nella letteratura più ampia (da ~3.75g/giorno per l'alginato a 25g/giorno per la fibra di soia). Trattare "i MACs" come un'unica categoria con un'unica soglia di tolleranza è una semplificazione che andrebbe segnalata come tale.

---

## 4. Il pezzo di prodotto che manca ancora: la cottura

Lo schema `retention_factors` esiste nel database, ma **nessuno dei tre motori accetta un parametro `cookingMethod`.** Tutti e tre operano sui valori nutrizionali grezzi (crudi) così come sono in `nutrient_values`. Questo è rilevante perché l'idea originale dell'app — quella che hai descritto fin dal primo PDF — era proprio "come la cottura cambia la biodisponibilità". Oggi quella parte non è collegata a nulla: il database ha la tabella, ma è vuota e non interrogata. Lo segnalo come il gap di prodotto più importante da richiudere prima di aggiungere altro.

Anche `scientific_evidence_library` è stata creata ma non popolata: oggi gli `evidenceLevel` vivono come costanti scritte a mano dentro il TypeScript, non come righe recuperate da quella tabella — il che vanifica in parte lo scopo di averla come fonte di verità unica.

---

## 5. Supabase e VS Code: li confermo, non li cambierei

Hai chiesto se ci sono metodi migliori. Onestamente: no, non per la tua situazione.

**Supabase** è la scelta giusta: PostgreSQL vero (lo schema con ENUM, CHECK, colonne `GENERATED ALWAYS AS` richiede proprio Postgres), hosting in regione UE disponibile (Frankfurt, già scelto correttamente per il GDPR), RLS integrata che mappa esattamente sul bisogno "dati pubblici in lettura, nessuna scrittura non autorizzata", piano gratuito adeguato a un MVP, e un client JS che si collega a Next.js senza dover scrivere un backend separato. Le policy RLS impostate finora ("lettura pubblica" su `foods_raw`, `nutrient_values`, `sources`, `food_matrices_master`) sono corrette per dati di riferimento non personali — l'unica cosa da tenere d'occhio è **non applicare mai** una policy altrettanto permissiva a `user_profile` quando inizierete a usarla: lì serve una policy che leghi la riga a `auth.uid()`.

**VS Code** va bene. Il dolore che hai vissuto (file finiti nel Cestino, cartelle annidate storte, `microbiotaEngine.ts.ts`, il nome di download automatico `gemini-code-1791226358930.ts`, la cartella `salvataggio` spostata avanti e indietro tre volte) non è un problema dell'editor — è l'assenza di **Git**. Con un repository Git inizializzato dal primo minuto:
- Niente si perde mai davvero (basta `git checkout` invece di scavare nel Cestino di Windows).
- `npx create-next-app@latest .` si lancia per primo, in una cartella vuota, **prima** di scrivere qualunque file di `lib/` o `database/` — questo da solo avrebbe evitato tutta la saga della cartella `salvataggio`.
- Ogni motore validato diventa un commit, che è esattamente il ritmo "un pezzo alla volta, testato, approvato" che questo progetto ha già adottato.

Se vuoi, posso guidarti passo-passo nell'inizializzazione di Git e GitHub (repository privato) come primissima mossa riparativa.

---

## 6. Mosse riparative, in ordine

1. **Popolare `sources` con tutte le 11 citazioni reali usate dai motori**, con ID identici a quelli nel codice (§2). Lavoro meccanico, 15 minuti, sblocca tutto il resto.
2. **Inizializzare Git** nel progetto così com'è ora, prima di toccare altro (così da qui in avanti nulla si perde più).
3. **Correggere `verificationStatus` nel ramo "pasto singolo" dello zinco** da `"verified"` a `"draft"`.
4. **Decidere insieme** se andare a recuperare il testo completo di Hallberg & Hulthén 2000 per il ferro (la base 22.1% invece del 5% flat) — è il pezzo scientificamente più debole rimasto.
5. **Separare MACs e Polifenoli in due `SourcedValue` indipendenti** nel motore del microbiota, invece del 70/30 fuso.
6. **Riscrivere il fattore di trasporto aereo del LCA** in funzione della distanza reale, non come costante fissa.
7. **Collegare `retention_factors` ai motori** (il parametro cottura) — è il cuore prodotto mancante.

## Una nota sul processo, per il futuro

L'intero incidente di `computeEubioticScore` (§1) è successo perché Gemini ha ricostruito a memoria il contenuto di un file invece di leggerlo davvero. In una chat lunga, su un progetto multi-sessione, questo rischio è strutturale, non un caso isolato — vale per qualunque AI, me compreso. La protezione più efficace è pratica: **prima di chiedere una modifica a un file, incolla sempre il contenuto attuale di quel file**, anche quando sembra ridondante. È esattamente il motivo per cui ti ho chiesto il codice v1.0 prima di scrivere i criteri di accettazione, invece di fidarmi di quello che ricordavo dal PDF.
