# Product Requirements Document (PRD) v2.0
## Piattaforma di Biodisponibilità Nutrizionale, Microbiota ed Eco-Score

**Stato:** Draft per revisione — sostituisce integralmente PRD v1.0
**Proprietario di dominio:** Utente (Biologo Molecolare)
**Tech Lead / Data Engineer:** Claude
**Non è:** un dispositivo medico, uno strumento diagnostico, un sostituto del parere di un medico o nutrizionista.

---

## 1. Visione e perimetro

L'applicazione è uno strumento **informativo ed educativo** che calcola, per un pasto descritto dall'utente, una stima della biodisponibilità reale dei nutrienti in base al metodo di cottura e agli abbinamenti, un punteggio di impatto sul microbiota e un punteggio di impatto ambientale (Eco-Score), **mostrando sempre la fonte e il livello di evidenza scientifica di ogni numero**.

Il target primario è l'utente "biohacker"/appassionato di ottimizzazione nutrizionale che vuole capire *perché* un numero è quello che è, non un paziente che cerca una terapia.

### 1.1 Cosa l'app NON fa (perimetro esplicito, vincolante)

Questi punti sono stati rimossi rispetto al PRD v1.0 su richiesta esplicita e restano fuori perimetro finché non esiste una base legale/regolatoria verificata con un professionista:

- **Nessuna acquisizione o interpretazione di referti medici** (no OCR di esami del sangue, prescrizioni, diagnosi).
- **Nessun modulo di patologie cliniche** (no celiachia, favismo, calcolosi renale, IBD, ecc. come trigger di regole "contraindication"/"lethal alert").
- **Nessuna raccomandazione terapeutica o dosaggio clinico.** L'app non dice mai "assumi X per curare Y".
- **Nessun salvataggio di dati sanitari** (ferritina, HbA1c, eGFR, mutazioni genetiche, ecc.).

Il motivo non è solo prudenziale: un'app che legge referti, traccia patologie e genera alert di severità clinica ("lethal_or_critical_alert") rientra con alta probabilità nella definizione di *Medical Device Software* secondo la guida MDCG 2019-11 (rev. 1, giugno 2025) dell'Unione Europea, il che comporterebbe marcatura CE, fascicolo tecnico e un percorso di conformità che non ha senso affrontare prima di un MVP validato. Restando su raccomandazioni generiche non personalizzate su una condizione clinica specifica, l'app si mantiene nell'area "wellness/informativa" tipicamente esclusa da quella definizione — ma questa è una valutazione tecnica, non un parere legale: va confermata da un consulente prima del lancio pubblico, specie se in futuro si vorrà reintrodurre un modulo clinico.

Stesso ragionamento per il GDPR: non trattando più dati sanitari (categoria particolare, Art. 9), il trattamento dati dell'MVP si riduce a dati personali "ordinari" (profilo nutrizionale, log pasti), con obblighi molto più leggeri. Età e sesso restano nel profilo solo perché servono al calcolo dei fabbisogni di riferimento (LARN/RDA), non sono trattati come dati sanitari.

### 1.2 Standard scientifici di riferimento

- Nutrizione/assorbimento: IZiNCG, modello Hallberg-Cook-Hurrell (ferro), modello Miller (zinco), USDA Table of Nutrient Retention Factors Release 6 (2007), EuroFIR.
- Microbiota: Sonnenburg Lab, American Gut Project.
- LCA ambientale: Agribalyse 3.1.1 (ADEME/INRAE), metodologia PEF (Product Environmental Footprint) dell'UE, indice di scarsità idrica AWARE.

---

## 2. Regole di ingaggio (vincolanti per ogni modifica futura)

Queste regole governano *come* il codice e i dati vengono prodotti d'ora in avanti. Si applicano a Claude, a chiunque altro lavori sul repository, e a qualunque agente AI (Cursor/Claude Code) venga istruito con questo documento.

1. **Zero dati inventati.** Nessun coefficiente, range o valore nutrizionale viene scritto nel database o nel codice senza un `source_id` verificabile (fonte ufficiale con URL/DOI, o letteratura primaria con DOI). Se il dato non è reperibile, il campo resta `NULL` con stato `unverified`, mai un numero plausibile.
2. **Range di confidenza, non punti singoli.** Ogni valore biochimico esposto all'utente è una tripla `{value, confidence_low, confidence_high}` quando la fonte riporta una variabilità; quando la fonte riporta solo un punto (es. le tabelle USDA, arrotondate al 5%), il range resta esplicitamente assente (`range_available: false`) — non viene mai generato un range fittizio per "sembrare" più rigoroso.
3. **Ogni claim ha un livello di evidenza** (schema al §4). Un claim senza livello di evidenza non può comparire in UI.
4. **Architettura difensiva.** Ogni funzione di calcolo gestisce esplicitamente: divisione per zero, input mancanti, valori fuori range fisiologico plausibile. Nessuna funzione lancia un'eccezione non gestita su un input incompleto: restituisce invece un risultato parziale con i campi mancanti marcati.
5. **Test-first.** Prima di scrivere o riscrivere un motore, si propongono criteri di accettazione e casi di test per approvazione. Il codice segue solo dopo l'approvazione.
6. **Trasparenza e rifiuto motivato.** Se un requisito richiede dati clinici, violerebbe il perimetro §1.1, o manca di supporto in letteratura verificabile, questo viene segnalato esplicitamente con un'alternativa sicura proposta, invece di essere implementato "silenziosamente addolcito".

---

## 3. Stack tecnico

| Livello | Scelta | Note |
|---|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS | invariato da v1 |
| Database | Supabase (PostgreSQL), hosting **regione UE** | vedi §6 privacy |
| Motore di calcolo | TypeScript, funzioni pure (`/lib/engine/`) | pattern "Functional Core, Imperative Shell" |
| Dati prodotti confezionati | Open Food Facts API (ODbL 1.0) | consultato live, **mai unito** alla tabella proprietaria `foods_raw` per evitare obblighi di share-alike sull'intero dataset; solo i campi del singolo prodotto scansionato vengono mostrati con attribuzione "© Open Food Facts contributors" |
| Deployment | Vercel, PWA | rimandato: integrazione wearable nativa (richiede HealthKit, solo iOS nativo) |

---

## 4. Schema del grading delle evidenze

Ogni coefficiente, soglia o claim nel database porta un `evidence_level` secondo questa scala (coerente con le gerarchie GRADE/EFSA):

| Livello | Nome | Criterio | Esempio |
|---|---|---|---|
| **1** | Meta-analisi / RCT su umani | Revisione sistematica o trial randomizzato controllato pubblicato e con DOI | Sinergia vitamina C + ferro non-eme (Hallberg et al.) |
| **2** | Studio clinico singolo / coorte umana | Studio osservazionale o clinico su umani, non ancora replicato in meta-analisi | Effetto della cottura sul licopene biodisponibile |
| **3** | Studio in vivo su modello animale | Topo, ratto, C. elegans | Induzione di autofagia da spermidina |
| **4** | In vitro / meccanicistico | Colture cellulari, modelli enzimatici isolati | Affinità di legame avidina-biotina |
| **5 (interno)** | Database istituzionale di composizione | USDA FoodData Central, CREA/BDA-IEO, EuroFIR — non è un "claim" ma un dato di composizione/ritenzione misurato o tabellato da un ente ufficiale | Retention factor USDA Release 6 |

Nota: il Livello 5 non è parte della scala GRADE originale (che valuta claim causali), ma serve a distinguere "dato di composizione misurato da un ente" da "claim meccanicistico", che nella UI vanno mostrati in modo diverso (un retention factor USDA non è un'"evidenza scientifica debole", è un dato ufficiale con una propria incertezza dichiarata).

Lo **switch di tolleranza scientifica** dell'utente (impostazioni: "Conservativo" = solo Livelli 1-2-5, oppure "Esplorativo" = tutti i livelli con badge visibile) resta nel perimetro MVP: è la funzione che il tuo target (biohacker) ha chiesto esplicitamente, ed è esattamente ciò che la pipeline di grading deve abilitare.

### 4.0 Nutrienti senza un modello di biodisponibilità pubblicato (decisione del 2026-10-09)

Per molti micronutrienti (es. magnesio, rame, vitamina K, iodio, selenio, e la componente cottura/matrice della vitamina A finché non la verifichiamo) non esiste ancora, nella letteratura che abbiamo recuperato, un'equazione o un fattore di conversione citabile che modelli l'assorbimento reale. Decisione: **questi nutrienti vanno comunque inseriti e mostrati**, usando il valore di composizione standard (es. USDA FoodData Central) così com'è — **non lasciati vuoti** — ma distinti esplicitamente dai nutrienti per cui un vero modello di biodisponibilità è stato applicato (oggi: ferro, zinco, calcio; in arrivo: B12, DFE folati).

Questo si implementa con un campo booleano aggiuntivo nel contratto `SourcedValue` (§6), `bioavailabilityAdjusted`:
- `true` → il valore riflette un modello di assorbimento/biodisponibilità reale (equazione o fattore di conversione sourced), anche se `evidenceLevel` è basso.
- `false` (o assente) → il valore è la composizione grezza, non passata per nessun modello di assorbimento, perché quel modello non esiste ancora in letteratura verificata. Resta comunque `sourceIds`-tracciato (es. USDA FDC) e tipicamente `evidenceLevel: 5`, `verificationStatus: draft`.

La UI (non ancora disegnata, ma il contratto dati è già pronto per questo) userà `bioavailabilityAdjusted` — non `evidenceLevel` da solo — per decidere il trattamento visivo (es. colore/badge "stima di composizione" vs "biodisponibilità calcolata"): sono due assi diversi (qualità della fonte vs presenza stessa di un modello di assorbimento) e tenerli distinti evita di dover sovraccaricare `evidenceLevel` con un significato che non gli appartiene.

### 4.1 Vitamina B12 e Folati (aggiunti 2026-10-09)

- **B12** (`calculateBioavailableB12`): due componenti sourced separatamente (via attiva saturabile 1.5-2.5µg/pasto, Scott 1997; via passiva ~1%, Berlin 1968/Doscherholmen&Hagen 1957), combinate con una curva Michaelis-Menten la cui forma (Km) NON è fittata da un paper ma calibrata a occhio sul punto a dose=1µg (Adams 1971) — limite dichiarato e quantificato nei test ("LIMITE NOTO"): il modello sovrastima l'assorbimento reale del 30-60% a dosi 5-25µg, e non distingue B12 cristallina da B12 legata alla matrice alimentare (dove Heyssel 1966 su pasta di fegato mostra l'opposto: assorbimento reale più alto di quanto il modello preveda). `evidenceLevel: 3`, `draft`.
- **Folati -> DFE** (`calculateFolateDFE`): conversione ufficiale FNB/NIH-ODS, non un'equazione di assorbimento. `evidenceLevel: 2`, `verified` (la conversione stessa non è in discussione), nessuna fascia di confidenza (la fonte non ne pubblica una).

### 4.2 Vitamina A (aggiunta 2026-10-09) — decisione aperta, non ancora chiusa

`calculateVitaminARAE` implementa SOLO la conversione media adottata da NNR2023 (Olsen & Lerner 2023, Food Nutr Res 67:10229): 6:1 per beta-carotene alimentare, 12:1 per altri carotenoidi provitaminici. La fonte stessa dichiara di non avere un'evidenza che permetta un fattore preciso — per questo `evidenceLevel: 5`, `bioavailabilityAdjusted: false` (è una conversione stechiometrica media, non un modello di assorbimento specifico).

**Aggiornamento 2026-10-09 (decisione presa dall'utente): integrato.** Livny et al. 2003 (*Eur J Nutr* 42(6):338-45, studio su ileostomia, misura diretta) mostra 65.1±7.4% di beta-carotene assorbito da carote cotte/pureed vs 41.4±7.4% da carote crude tritate (stesso pasto, stesso contenuto di olio). L'utente ha scelto l'opzione (b) esplicitamente, accettando il rischio di doppio conteggio ("al massimo lo togliamo più avanti come dato"): il fattore 6:1 di NNR2023 è trattato come il valore per lo stato `cooked_or_disrupted`, e per `raw_intact` è derivato scalando per il rapporto Livny (6 × 65.1/41.4 ≈ 9.44:1). `evidenceLevel` abbassato a 4 (era 5) per riflettere che è una nostra ricombinazione di due fonti non co-pubblicate, non un singolo numero da un paper. `bioavailabilityAdjusted` è ora `true`. Reversibile: se la combinazione risulta sbagliata, si torna al 6:1 flat rimuovendo solo la logica di stato, senza toccare il resto del motore. `other_provitamin_a_carotenoids_mcg` resta a 12:1 flat (Livny non l'ha misurato).

### 4.3 Crucifere: fattori di ritenzione trovati (aggiunto 2026-10-09)

Colmato uno dei buchi espliciti di `retention_factors_legumi_tuberi.sql`: Doniec et al. 2022 (*Molecules* 27(6):1861) su cavoletti di Bruxelles bolliti/a vapore — vedi `retention_factors_crucifere.sql`. Trovata anche una misura di **bioaccessibilità dello zinco** (non solo ritenzione di massa) che scende da 17.0% (crudo) a 6.6-6.8% (cotto) — un calo molto più grande del semplice fattore di ritenzione di massa (0.78-0.81). Questo suggerisce che `CookingTransformationEngine` oggi, applicando solo fattori di ritenzione di massa, possa sottostimare l'impatto reale della cottura sulla biodisponibilità per alcuni nutrienti/matrici. Non implementato stanotte (richiede un nuovo meccanismo, decisione esplicita rimandata).

**Fitati**: ricercati di nuovo stanotte (secondo tentativo, dopo quello della sessione precedente), ancora nessun fattore di ritenzione citabile trovato per cottura di legumi/crucifere. Resta assente per decisione, non per dimenticanza.

### 4.4 Zinco: terzo strato di bioaccessibilità post-cottura, SOLO cavoletti di Bruxelles (aggiornato 2026-10-09, decisione presa dall'utente)

**Aggiornamento 2026-10-09 (decisione presa dall'utente): implementato, con scopo deliberatamente ristretto.** Il dato di bioaccessibilità trovato in §4.3 (17.0% crudo → 6.57% bollito / 6.83% vapore, Doniec et al. 2022) è stato integrato come terzo strato in `calculateBioavailableZinc`, in aggiunta ai due strati già esistenti (equazione di Miller 2007 su zinco/fitati totali del pasto).

**Scopo esplicitamente ristretto ai cavoletti di Bruxelles.** L'utente ha posto una condizione precisa prima dell'implementazione: estendere lo strato a "crucifere" in generale solo se il paper stesso avesse fatto un'assunzione di generalizzazione. Verifica fatta ora sul full-text (PMC8951108): gli autori **non generalizzano** — la conclusione è scoperta esplicitamente a *Brassica oleracea var. gemmifera* (cavoletti di Bruxelles), e in discussione notano che le discrepanze con altri studi su crucifere "possono essere dovute proprio alla differenza di specie". Di conseguenza il nuovo campo in `FoodItem` non si chiama `crucifere_cotte` ma nomina esplicitamente l'unico alimento misurato: `zinc_bioaccessibility_bucket: "none" | "brussels_sprouts_boiled" | "brussels_sprouts_steamed"` (default `"none"`, incluse tutte le altre crucifere).

**Collocazione nel calcolo: DOPO l'equazione di Miller, non come input.** Bioaccessibilità (misura in vitro, digestione simulata) e il modello di Miller (calibrato su dato in vivo, usando lo zinco dietetico totale normalmente misurato — non pre-filtrato per bioaccessibilità) sono due paradigmi di misura diversi. Applicare la deratazione come input a Miller rischierebbe un doppio conteggio, perché l'AMAX di Miller è già implicitamente calibrato su qualunque bioaccessibilità fosse presente nei suoi 21 studi di calibrazione originali. Il risultato di Miller viene quindi prima calcolato normalmente sul pasto, poi deratato in proporzione alla quota di zinco del pasto proveniente da cavoletti di Bruxelles bolliti/a vapore (allocazione proporzionale — una semplificazione dichiarata, non una misura diretta).

**Impatto su evidenceLevel e sourceIds**: quando questo strato si applica, `evidenceLevel` scende a 3 (eredita l'evidenza più debole fra Miller 2007 ed il dato di bioaccessibilità Doniec 2022, in vitro — meno robusto di uno studio umano in vivo —, coerente con la regola di §6 per cui i valori computazionali ereditano l'evidenza più debole tra gli input combinati), e `sourceIds` include sia `MILLER_2007_JNUTR` che `DONIEC_2022_MOLECULES`. `bioavailabilityAdjusted` resta `true` (è ancora un vero modello di assorbimento, solo più conservativo quando applicabile). Testato in `tests/engines.test.ts` su tre livelli: difensivo (bucket assente → nessun cambiamento; entrambi i bucket nello stesso pasto → nessuna eccezione), proprietà (il bucket riduce sempre il risultato; un pasto misto produce un valore intermedio), calibrazione (il fattore di deratazione applicato corrisponde esattamente al rapporto 6.57/17.02 o 6.83/17.02 pubblicato).

### 4.5 Micronutrienti senza modello di biodisponibilità pubblicato: implementati come composizione grezza (aggiunto 2026-10-09)

Dà seguito alla decisione descritta in §4.0 (nutrienti senza modello → non lasciati vuoti, mostrati come composizione standard con `bioavailabilityAdjusted: false`, distinguibili in UI come "info sommarie"). Finora questa regola era solo dichiarata nel PRD, senza implementazione concreta nell'engine. Implementati ora i cinque esempi già citati in §4.0: **magnesio, rame, selenio, iodio, vitamina K** (fillochinone/K1 — non distingue K1/K2, limitazione dichiarata).

Ciascuno ha un nuovo campo in `FoodItem` (`magnesium_mg`, `copper_mg`, `selenium_mcg`, `iodine_mcg`, `vitamin_k_mcg`) e un metodo pubblico dedicato in `ComputationalNutritionEngine` (`calculateMagnesium`, `calculateCopper`, `calculateSelenium`, `calculateIodine`, `calculateVitaminK`), tutti delegati a un unico helper privato (`sumRawNutrient`) per evitare di duplicare la stessa logica cinque volte. La logica è deliberatamente **una somma, non un modello**: nessuna interazione fra nutrienti, nessuna saturazione, nessun effetto matrice — perché non abbiamo recuperato in letteratura un'equazione di assorbimento per nessuno di questi cinque. `evidenceLevel: 5` (database di composizione, non uno studio di assorbimento), `verificationStatus: "draft"` (non ancora verificato riga per riga nel Golden Set), `confidenceLow/High: null` (nessun modello da cui propagare un intervallo — non inventato), `sourceIds: ["USDA_FDC"]` come placeholder generico fino a quando il Golden Set non sarà popolato riga per riga con fonti specifiche tramite il pannello admin. `bioavailabilityAdjusted: false` sempre, per contratto: è il segnale che la UI dovrà usare per il trattamento visivo differenziato.

Anche `CookingTransformationEngine` (`NUTRIENT_FIELD_MAP`) è stato esteso con i codici `magnesium`/`copper`/`selenium`/`iodine`/`vitamin_k`, cosi' che un futuro fattore di ritenzione per questi nutrienti (cottura/perdita in acqua) possa applicarsi senza modificare altro codice.

**Nota per i prossimi nutrienti da aggiungere con lo stesso pattern** (es. vitamina D, vitamina E, tiamina, riboflavina, niacina, B6): usare `sumRawNutrient`, non duplicare la logica — e verificare caso per caso se in futuro emerge un vero modello di assorbimento in letteratura, nel qual caso quel nutriente esce da questa sezione e riceve un metodo dedicato con `bioavailabilityAdjusted: true` (come già fatto per B12, folati, vitamina A).

### 4.6 Golden Set: 20/20 alimenti reali, sourced riga per riga (aggiunto 2026-10-09, esteso lo stesso giorno 13 → 19 → 20)

Primo popolamento reale del Golden Set (vedi `golden_set_foods.sql`, generato da `scripts/generate_golden_set_foods.py` — lo script Python è la fonte di verità, non il file SQL a mano, per evitare errori di trascrizione su centinaia di righe). **20 alimenti su 20** (target MVP, §7, raggiunto). I primi 13 sono gli alimenti già usati come esempio/calibrazione nei commenti dei motori (spinaci/kale/latte per le tre categorie calcio di Heaney&Weaver; fagioli/lenticchie/patate per ferro-zinco-fitati; cavoletti di Bruxelles per la bioaccessibilità zinco; carote per Livny/vitamina A; fegato di manzo per il B12 legato alla matrice di Heyssel; manzo macinato per il ferro eme). 6 aggiunti successivamente (broccoli crudi, mandorle, arance crude, uovo sodo, salmone atlantico cotto, ceci bolliti) ampliano la varietà di matrici alimentari del set (frutta, frutta a guscio, uova, pesce, un secondo legume). Il 20° è l'alimento fortificato (pasta arricchita, vedi sotto), che esercita `is_fortified_folate` su un dato reale per la prima volta.

**Fonte primaria**: USDA FoodData Central, letto direttamente (non da mirror di terze parti) tramite l'endpoint `fdc.nal.usda.gov/portal-data/external/<FDC_ID>` — le pagine `food-details/*/nutrients` standard sono una SPA Angular non fetchable in questo ambiente, ma quell'endpoint espone lo stesso dataset sottostante. FDC ID citato per ogni riga nel file SQL, verificabile in qualunque momento.

**Ossalati e fitati** (assenti da USDA FDC) aggiunti per 3 alimenti da fonti di letteratura dedicate: ossalati spinaci crudi (Noonan & Savage 1999, *Asia Pac J Clin Nutr*, 970 mg/100g, range 320-1260 — review esplicitamente richiesta per questo compito), ossalati kale crudo (Erdoğan & Onar 2012, *J Food Drug Anal*, 297±67.2 mg/100g, convertito da mg/kg), fitati fagioli rossi bolliti (Zia-ur-Rehman et al. 2002, *Pak J Sci Ind Res*, 805 mg/100g — unica fonte che distingue esplicitamente crudo/bollito con unità chiare).

**Gap dichiarati esplicitamente** (vedi commenti in fondo a `golden_set_foods.sql`), non numeri indovinati per riempire le celle vuote:
- Fitati lenticchie: trovato solo per crude/secche, non bollite — stato di cottura non corrispondente, non inserito.
- Ossalati spinaci: una seconda fonte (Siener et al. 2006) dà un valore quasi doppio (1959 vs 970 mg/100g) — discrepanza documentata, nessuna scelta arbitraria tra le due, decisione rimandata a un controllo umano. **Risolto 2026-10-10** (vedi Fase 1 punto 6 in §9): su scelta esplicita dell'utente, passato a Siener (1959 mg/100g) — resta comunque `draft`, Siener non letto direttamente da Claude (paywall).
- Kale e latte: alcuni campi (selenio/vitamina K/B12 per il kale; quasi tutto tranne il calcio per il latte) non recuperati per un troncamento del fetch su record molto verbosi — da ri-tentare, non assenti per certo dalla fonte.
- Nessun alimento fortificato con acido folico inserito (le pagine FDC dei candidati non erano raggiungibili in questa sessione) — `is_fortified_folate` resta quindi esercitato solo da test sintetici, non da un alimento reale.
- **Cavoletti di Bruxelles "al vapore" non ha una riga propria**: FDC non ha una voce "steamed" per questo alimento, e derivare una riga applicando il retention factor di Doniec 2022 al solo ferro/zinco crudo (lasciando il resto nullo) mischierebbe dato misurato e dato simulato nella stessa riga — scelto di non farlo. Rivela anche un punto architetturale non ancora risolto: `carotenoid_matrix_state`, `zinc_bioaccessibility_bucket` e `is_fortified_folate` sono attributi categorici "congelati" per stato di cottura (come `is_heme_iron`), ma `CookingTransformationEngine` oggi non li tocca quando simula una trasformazione — serve una decisione futura su come (o se) propagarli quando un alimento viene "cotto" solo tramite retention factor, invece di avere una riga measured dedicata.
- `macs_mg`/`polyphenols_mg`: non ricercati in questo giro per nessuno dei 20 alimenti (gap preesistente, non introdotto ora).
- `iodine_mcg`: non trovato per nessuno dei 20 alimenti — confirma il gap già dichiarato in §4.0/§4.5 (USDA FDC non riporta lo iodio per la maggior parte delle voci standard).
- **Broccoli: manca la controparte "cotta"** (Broccoli, cooked, boiled, drained, without salt, fresco non surgelato). Due FDC ID tentati erano sbagliati (170380 = la versione *surgelata* dello stesso piatto, non quella fresca; 170378 = fave, un alimento diverso); l'NDB legacy 11091 (citato su recipal.com) non è stato mappato a un FDC ID verificabile tramite web search in questa sessione — resta solo "Broccoli, crudi", da completare in futuro. **Risolto 2026-10-10**: trovato FDC ID 169967, confermato fresco (non surgelato). Golden Set ora a 30 alimenti.
- **Ceci, vitamina B12**: il record FDC segnala esplicitamente 0 data points per questo campo (diverso dal B12=0.00 con dati reali a supporto usato per gli altri alimenti vegetali di questo set). Inserito comunque come 0.00/USDA_FDC per coerenza biologica (i legumi non contengono B12), ma il limite metodologico specifico di questo singolo record resta dichiarato, non nascosto.
- **Pasta arricchita, folato**: il record FDC riporta tre numeri distinti (folato totale 73 µg, acido folico 66 µg, folato alimentare naturale 7 µg), ma `calculateFolateDFE` usa un solo campo `folate_mcg` con doppio significato a seconda di `is_fortified_folate` (vedi `computationalNutritionEngine.ts:355` e il commento nello script generatore). Per questa riga è stato inserito **solo l'acido folico** (66 µg, coerente con la semantica già testata), quindi la quota di folato naturale (7 µg) non è rappresentata. Non è un errore introdotto ora, ma un limite preesistente dello schema a singolo campo, reso visibile per la prima volta da un alimento reale invece che da dati sintetici — una futura estensione potrebbe separare `folate_mcg` in due campi (folato alimentare + acido folico) per modellare correttamente alimenti che contengono entrambi.

**Schema**: aggiunte le colonne `carotenoid_matrix_state`, `zinc_bioaccessibility_bucket`, `is_fortified_folate` a `foods_raw` (con `CHECK` sui valori enum, §2 Regola 2 — architettura difensiva anche sui dati, non solo sul codice), e sincronizzate le liste `NUTRIENT_FIELDS`/`NUTRIENT_OPTIONS` del pannello admin (`app/admin/data-entry/`) con i nuovi nutrienti — altrimenti il pannello non avrebbe potuto inserire manualmente nessuno dei campi aggiunti da B12 in avanti, lo stesso tipo di disallineamento già capitato una volta in questo progetto (vedi commento storico in `DataEntryDashboard.tsx`).

**Verification status**: promosso a `verified` il 2026-10-09 (vedi `golden_set_promote_verified.sql`), su decisione esplicita dell'utente dopo un **cross-check meccanico indipendente**: ri-scaricato da zero ciascuno dei 20 FDC ID (fetch nuovi, non gli stessi usati per popolare il file) e confrontato cifra per cifra nome-alimento e ogni valore con quanto scritto in `golden_set_foods.sql` — **0 discrepanze su 20/20 alimenti** (nessun errore di trascrizione, nessuno stato di cottura sbagliato). I gap già dichiarati per kale (selenio/vit.K/B12) e latte (9 campi) sono stati confermati ancora genuinamente irrecuperabili: il fetch continua a troncarsi nello stesso punto a offset diversi — non sono quindi "persi per pigrizia", è un limite dello strumento di fetch su questi due record specifici.

Promosse SOLO le righe `nutrient_values` con `source_id = 'USDA_FDC'`: le 3 righe da letteratura specifica (ossalati spinaci crudi, ossalati kale, fitati fagioli rossi bolliti) **restano `draft`**, perché il cross-check di oggi ha riguardato solo l'endpoint FDC, non le citazioni di quei paper — promuoverle ora avrebbe significato dichiarare "verificato" qualcosa non ri-controllato in questo giro, contro la regola "zero dati inventati" applicata anche allo status stesso, non solo ai valori.

Importante su cosa questa promozione *non* significa: un cross-check meccanico (ho letto bene la fonte) non è lo stesso di un giudizio di esperto di dominio sulla fonte stessa (è la fonte giusta per il modello? il metodo analitico è comparabile ad altri alimenti del set?). L'utente ha deciso esplicitamente di accettare il cross-check meccanico come base sufficiente per la promozione ora, con l'intesa dichiarata che un controllo periodico più approfondito (incluse le 3 righe da letteratura rimaste draft), con correzioni se emergono errori, avverrà in futuro — non è pensato come un controllo one-shot definitivo.

**Target MVP di 20 alimenti raggiunto** (poi esteso a 30, vedi sopra). Resta comunque da fare, come miglioramento qualità (non quantità): idealmente completare kale/latte con i campi mancanti, e valutare se separare `folate_mcg` in due campi per modellare correttamente alimenti con folato sia naturale sia da fortificazione (vedi gap pasta sopra).

### 4.1 Esempio reale di verifica (fatto ora, non ipotetico)

Per mostrare come funziona in pratica la Regola 1 (§2): il file Excel caricato riporta per `veg_leafy_soft / boiled` un retention factor di Vitamina C = **0.45** (45%), attribuito genericamente a "Bognár / EuroFIR" (nessun URL, nessuna pagina, nessun DOI).

Ho recuperato la tabella ufficiale **USDA Table of Nutrient Retention Factors, Release 6 (2007)** (pubblico dominio, CC0, DOI 10.15482/USDA.ADC/1409034). Le righe corrispondenti a "verdure a foglia, bollite" riportano:

| Codice USDA | Descrizione | Retention factor Vitamina C |
|---|---|---|
| 3004 | VEG,GREENS,BOILED,LITTLE WATER DRAIN | **60%** |
| 3005 | VEG,GREENS,BOILED,WATER COVER DRAIN | **55%** |
| 3006 | VEG,GREENS,BOILED,WATER USED (brodo consumato) | **70%** |

Il valore dell'Excel (45%) non corrisponde a nessuna di queste tre varianti ufficiali e non ha una fonte verificabile associata. Non significa necessariamente che sia sbagliato — potrebbe derivare da uno studio specifico su spinaci che non ho ancora verificato — ma **con le regole di questo PRD, un numero così resta marcato `unverified` finché non si trova la fonte primaria**, e nel frattempo il campo mostra il valore USDA (verificabile, Livello 5, con il codice tabella come `source_id`) oppure resta vuoto.

Questo è esattamente il meccanismo che il §2 Regola 1 e la tabella `sources` (§5) devono applicare sistematicamente a tutte le ~125 righe del file Excel e, in futuro, ai dati dei singoli alimenti.

### 4.7 "Stima dichiarata": attivazione di `sources.source_type` come livello di trasparenza generale (aggiunto 2026-10-11)

**Il problema che questa sezione risolve.** Durante la ricerca di fonti reali per i MACs (vedi Fase 1 punto 8b in §9) è emerso che, per molti nutrienti/alimenti, non esiste e non esisterà a breve una misura diretta citabile — non solo per i MACs. L'utente ha posto il problema in generale: *"dovremo [...] trovare il modo per fornire agli utenti anche i dati dei quali non siamo sicuri, perché finirebbe per essere veramente una proposta completa solo per pochi cibi [...] bisogna trovare un metodo per poter stimare i valori e poi far sapere al cliente che quella è solo una stima e non un valore ufficiale come per tutti gli altri."* Questa sezione documenta il meccanismo scelto per farlo, senza violare "zero dati inventati": una stima resta ammissibile solo se è dichiarata come tale ovunque arrivi all'utente, mai presentata con lo stesso peso visivo di un dato misurato.

**Scoperta, non invenzione, di un meccanismo già esistente.** Interrogando lo schema live (`information_schema.columns`, `pg_enum`/`pg_type` via SQL editor Supabase) è emerso che `sources.source_type` esiste **già** in produzione, con esattamente l'enum che il §5 di questo PRD documentava in modo aspirazionale da tempo senza che nessuno script l'avesse mai popolato:

```
source_type_enum: official_database | peer_reviewed_study | preprint | institutional_report | internal_estimate
```

Quasi tutte le righe erano NULL (nessuna distinzione interrogabile fra "misurato/da letteratura" e "stimato con metodo interno"). Si è scelto di **attivare questa colonna già esistente** come meccanismo per la "stima dichiarata", invece di aggiungere una nuova colonna o una nuova tabella — stesso dato, stesso schema, solo finalmente popolato e letto.

**Cosa significa `internal_estimate` qui.** Un source_id con `source_type = 'internal_estimate'` non cita una misura diretta in letteratura o in un database ufficiale: è un numero derivato con un metodo nostro, dichiarato nel commento della fonte stessa. Il primo caso reale è `DERIVED_FDC_RAW_COOKED_RATIO` (vedi §4.6 e i commenti in `scripts/generate_golden_set_foods.py`): il fattore di ritenzione di cottura per broccoli, carote, spinaci e cavoletti di Bruxelles, calcolato come rapporto valore_cotto/valore_crudo fra due misure USDA FDC indipendenti della stessa matrice — un numero reale, non inventato, ma non lo stesso tipo di evidenza di un fattore pubblicato (es. USDA Retention Factors Release 6, Doniec et al. 2022).

**Implementazione, in due parti.**

1. `scripts/generate_golden_set_foods.py`: `SOURCES_NEW` è ora una lista di 4-tuple `(id, citazione, url, source_type)`, con un `SOURCE_TYPES_VALID` e un `assert` difensivo (stesso stile dei sanity check già presenti nel file) che blocca la generazione se un source_type non è uno dei cinque validi. L'INSERT in `sources` scrive la colonna e la aggiorna con `ON CONFLICT (id) DO UPDATE`.
2. `fix_backfill_source_type.sql` (nuovo file, stesso pattern dei precedenti `fix_*.sql`): backfill una tantum per le righe **già live** in produzione che il generatore da solo non avrebbe corretto in questa sessione (richiederebbe ri-eseguire l'intero `golden_set_foods.sql` contro il DB, non fatto qui per disciplina di scope) — sia gli id di `SOURCES_NEW`, sia gli id citati **solo** dai motori (`HALLBERG_2000_SCANDJNUTR`, `SONNENBURG_2016_CELL`, `AGRIBALYSE_3.1.1`, ecc.: liste fisse in `computationalNutritionEngine.ts`/`lcaLogisticsEngine.ts`/`microbiotaEngine.ts`, mai scritte dal generatore). Il file include una query di verifica che segnala (non silenzia) qualunque id atteso risultato assente o ancora NULL dopo l'esecuzione.

**UI: badge "Stima" — due punti di integrazione, non equivalenti.**

- `MetricRow` (in `app/page.tsx`, pannello "Perché questo numero?"): mostra un badge ambra "STIMA" accanto a qualunque fonte con `source_type = 'internal_estimate'` nella lista `result.sourceIds`. **Limite scoperto durante l'implementazione**: `result.sourceIds` per i punteggi calcolati (es. `calculateBioavailableIron`, `calculateMicrobiotaImpactScore`) è una lista **fissa**, hardcoded per metodo — cita le fonti del MODELLO di assorbimento/punteggio stesso (es. Hallberg & Young per il ferro), non il `source_id` del singolo `nutrient_value`/`retention_factor` usato per quel food specifico. Questo badge quindi **non si illumina mai**, nella pratica odierna, per il caso reale che dovrebbe segnalare (il fattore di ritenzione derivato di broccoli/carote/spinaci/cavoletti). Resta comunque corretto per il giorno in cui un source_id di modello verrà classificato `internal_estimate`.
- Dispensa (lista alimenti, stesso componente): esteso il badge già esistente "· contiene dati draft" (`hasDraft`, basato su `nutrient_values[].verification_status`) con un secondo badge, sullo stesso alimento, "· cottura stimata" — acceso quando **almeno uno** dei `retention_factors` applicabili alla matrice dell'alimento (qualunque metodo di cottura, non solo quello eventualmente selezionato) cita una fonte `internal_estimate`. Questo è il punto di integrazione che effettivamente copre il caso reale, perché legge il `source_id` del dato grezzo (via `retentionFactors` + `sourcesMap`), non la lista fissa del modello.

**Deliberatamente non toccato in questa sessione (debito tecnico dichiarato, non nascosto):**
- Cruft di righe duplicate/quasi-duplicate in `sources` (es. `USDA_FDC` vs `USDA_FDC_SR`, `SONNENBURG_2016` vs `SONNENBURG_2016_CELL`, tre varianti `HEANEY_WEAVER_*`): stesso pattern già pulito una volta per `macs_mg`/ceci, lasciato stare qui per non allargare lo scope della sola attivazione di `source_type`.
- Il gap architetturale appena descritto (`SourcedValue.sourceIds` fisso per metodo, non dinamico per food) non è stato risolto: servirebbe che ogni funzione di calcolo propagasse i `source_id` reali dei `nutrient_values`/`retention_factors` effettivamente usati per quel food/pasto, invece della lista fissa del modello. Rimandato: è un cambiamento più ampio del contratto `SourcedValue` (§6), da affrontare come task a sé.
- Estensione di "stima dichiarata" a **tutto** ciò che l'app traccia (richiesta esplicita dell'utente, non solo MACs): questa sessione attiva il meccanismo e lo collega al primo caso reale esistente (i fattori di ritenzione derivati); non audita/retrofitta ancora ogni altro output del motore per verificare se meriti la stessa etichetta.

---

## 5. Architettura dati con provenienza

Differenza principale rispetto a v1.0: **nessuna tabella contiene più un numero nudo.** Ogni valore quantitativo porta con sé la propria provenienza.

```
sources
  id                  text primary key        -- es. "USDA_RETN06", "DOI:10.xxxx/yyyy"
  citation            text not null            -- citazione leggibile
  url_or_doi          text
  publisher           text                     -- "USDA ARS", "CREA", "peer_reviewed_journal", ecc.
  source_type         enum (official_database, peer_reviewed_study, preprint,
                             institutional_report, internal_estimate)
  retrieved_date       date

scientific_evidence_library
  claim_id            uuid primary key
  nutrient_or_molecule text
  food_or_mechanism   text
  evidence_level      int (1-5, vedi §4)
  source_id           references sources(id)
  reviewer_approved    boolean default false   -- approvazione 1-click dell'esperto di dominio
  date_added          timestamptz
  date_last_reviewed  timestamptz

retention_factors
  matrix_id           text references food_matrices_master(matrix_id)
  cooking_method      cooking_method_enum
  nutrient            text
  value               numeric                 -- punto centrale
  confidence_low      numeric null            -- null se la fonte non riporta un range
  confidence_high     numeric null
  range_available     boolean generated always as (confidence_low is not null)
  source_id           references sources(id)  -- MAI null in produzione
  evidence_level      int references scientific_evidence_library -- tipicamente 5
  verification_status enum (draft, verified)  -- default 'draft'

foods_raw
  food_id             text primary key
  name_it             text not null
  matrix_id           text references food_matrices_master(matrix_id)
  -- per ciascun nutriente: non una colonna numerica nuda, ma un riferimento
  -- a nutrient_values (sotto), per non duplicare source_id per ogni singolo campo
  verification_status enum (draft, verified) default 'draft'

nutrient_values
  food_id             references foods_raw(food_id)
  nutrient_code       text                    -- es. "vitamin_c_mg"
  value               numeric
  confidence_low      numeric null
  confidence_high     numeric null
  source_id           references sources(id)
  per_100g            boolean default true

food_matrices_master   -- invariata nello scopo (LCA), stesso principio:
  matrix_id, category_crea, description_it,
  base_co2_kg_per_kg, ..., source_id references sources(id),
  verification_status enum (draft, verified) default 'draft'
```

**Rimosse rispetto a v1.0:** `user_clinical_profiles`, `user_medical_prescriptions` (OCR referti), ogni campo di biomarcatori ematochimici.

**Profilo utente minimo mantenuto** (dati personali ordinari, non sanitari):
```
user_profile
  user_id, age, sex, region, lifestyle_activity_level (generico, non clinico),
  evidence_tolerance ('conservative' | 'exploratory')
```

---

## 6. Contratto computazionale (output degli engine)

Nessuna funzione dei quattro motori (`computationalNutritionEngine.ts`, `microbiotaEngine.ts`, `lcaLogisticsEngine.ts` — il quarto, `clinicalOntologyEngine.ts`, è **fuori perimetro**, vedi §8) può più restituire un numero nudo per un valore derivato da una fonte esterna. Il tipo di ritorno per ogni grandezza "sourceable" diventa:

```typescript
interface SourcedValue {
  value: number;
  confidenceLow: number | null;   // null = range non disponibile dalla fonte
  confidenceHigh: number | null;
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  sourceIds: string[];
  verificationStatus: "draft" | "verified";
}
```

I valori puramente *computati* dall'algoritmo stesso (es. uno score 0-100 aggregato da più `SourcedValue`) non hanno una fonte propria, ma ereditano il `verificationStatus` più basso tra i loro input, e l'`evidenceLevel` più debole tra le evidenze coinvolte — così uno score "Draft" segnala all'utente che si basa anche su dati non ancora verificati, invece di apparire autorevole quanto uno score interamente su dati `verified`.

Questo contratto sarà il primo criterio di accettazione da validare quando riscriveremo `computationalNutritionEngine.ts` (prossimo step, in attesa della tua approvazione sui test).

---

## 7. Perimetro MVP

### Dentro (v1)
- I tre motori non-clinici: biodisponibilità nutrizionale, microbiota, LCA/Eco-Score — riscritti secondo il contratto §6.
- Pannello "Perché questo numero?" in UI: mostra fonte, livello di evidenza, e se il valore è `draft`/`verified`.
- Switch Conservativo/Esplorativo (§4).
- Database: solo il **Golden Set verificato** (20 alimenti popolati e promossi a `verified` il 2026-10-09, vedi §4.6; 3 righe da letteratura specifica restano `draft` in attesa di un cross-check dedicato) — non i ~1.100 alimenti, finché non esiste un processo di verifica scalabile (vedi roadmap §9).
- Scanner barcode via Open Food Facts (consultazione live, non importazione nel DB proprietario).

### Fuori (rimandato, non cancellato)
- OCR referti, profili clinici, prescrizioni — **bloccato** finché non c'è una valutazione legale (§1.1).
- Integrazione wearable (Apple HealthKit/Health Connect) — richiede app nativa, non PWA.
- Mappa globale di popolazione (FAOSTAT/GDD).
- Database integratori e crononutrizione.
- AI Recipe Co-Pilot conversazionale.
- Copertura completa dei ~1.100 alimenti italiani.
- Integrazione CGM (curve glicemiche in continuo) — **non è una semplice feature rimandata**: va trattata con la stessa cautela del modulo clinico (§1.1) quando arriverà il suo turno, non come le voci sopra. Motivo: la glicemia continua è dato sanitario GDPR Art. 9, e "suggerire combinazioni correttive" in base alla curva post-prandiale è già un consiglio personalizzato legato a un dato fisiologico individuale, non una semplice informazione nutrizionale generica. Nessuna decisione presa qui — solo un promemoria a non farla scivolare dentro come se fosse equivalente a, es., la mappa globale.

**Nota sulla roadmap estesa (2026-10-10):** l'utente ha condiviso un documento di visione a 7 step (PROGETTO: COMPUTATIONAL BIO-NUTRITION APP) che include, oltre alle voci sopra, un modulo di ontologia clinica eziologica con alberi decisionali per patologia (ictus ischemico/emorragico, sottotipi di demenza, stadiazione eGFR) — di fatto il modulo clinico già escluso in §1.1, nella sua versione più estesa (con contraindicazioni esplicite su supplementi). Decisione esplicita dell'utente: il documento resta valido come **visione a lungo termine/bussola** verso cui tendere, non come piano operativo da seguire in ordine da ora. Il modulo clinico resta fuori perimetro **per ora**; si rivaluterà se/come implementarlo **dopo che l'app attuale (perimetro MVP sopra) sarà completa**, non prima. Questa nota esiste per non dover riproporre la stessa domanda in una sessione futura.

---

## 8. Inventario degli asset esistenti (stato a oggi)

| Asset | Stato | Azione |
|---|---|---|
| `master_retention_factors_crea_italia_v2.xlsx` | 125 righe di retention factor (34 matrici × metodo di cottura) + 35 gruppi-alimento con **conteggi stimati**, nessuna con `source_id` verificabile | Da ri-sorgere riga per riga secondo §2 Regola 1; l'esempio §4.1 è il primo caso |
| `seed_golden_set.sql` (legacy) | 20 alimenti con profilo nutrizionale completo, nessun valore ha una fonte | **Superato** da `golden_set_foods.sql` (vedi §4.6): non va più usato |
| `golden_set_foods.sql` | 20/20 alimenti (target MVP raggiunto), ogni valore con `source_id` verificabile | Nessuna azione urgente |
| `golden_set_promote_verified.sql` | Promuove a `verified` le righe `foods_raw` dei 20 alimenti e le `nutrient_values` con `source_id='USDA_FDC'`, dopo cross-check meccanico indipendente (2026-10-09) | Le 3 righe da letteratura (ossalati/fitati) restano `draft`; completare i gap residui dichiarati in §4.6 (broccoli cotti, kale/latte, folato pasta) e fare un controllo periodico più approfondito in futuro |
| `computationalNutritionEngine.ts` | Formule biochimicamente plausibili (Hallberg, Miller, Michaelis-Menten) ma senza distinzione fonte/range; restituisce numeri nudi | Da riscrivere secondo il contratto §6 — **prossimo step**, previa approvazione dei test |
| `microbiotaEngine.ts` | Stessa situazione | Da riscrivere dopo il motore nutrizionale |
| `lcaLogisticsEngine.ts` | Stessa situazione; i coefficienti LCA per hub/trasporto sono plausibili ma non testuali-sourced (es. 1.25 x tortuosità stradale, 0.140 kg CO2/km TIR) | Da riscrivere; coefficienti di trasporto verificabili via Agribalyse/INEMAR |
| `clinicalOntologyEngine.ts` | Fuori perimetro (§1.1) | **Non viene portato nella nuova architettura.** L'idea di archetipi non-clinici (es. "sedentario", "endurance") potrà eventualmente rientrare come personalizzazione generica di attività fisica, senza patologie né prescrizioni — da valutare in una fase successiva, non ora |

---

## 9. Roadmap

**Stato (2026-10-10):** i punti 1-3 della versione precedente di questa roadmap sono completi (schema, 3 motori riscritti secondo il contratto §6, Golden Set 20/20 `verified`). Quanto segue è la scaletta completa dal punto attuale al completamento dell'app, riordinata per **dipendenza tecnica reale** (cosa deve reggere prima di cosa), non per importanza percepita. Il modulo clinico e il CGM (§7, nota 2026-10-10) restano intenzionalmente fuori da questa lista.

### Fase 0 — Collaudare quello che esiste già (prima di costruire altro)
✅ **Chiusa (2026-10-10)** — tutti e 5 i punti verificati.
1. ✅ **`npm install` + `.env.local` reale** — fatto il 2026-10-10. Scoperta rilevante: esisteva già una cartella locale (`bio-nutrition-app`) ma era uno scaffold `create-next-app` vuoto, mai collegato al repo GitHub — il progetto vero non era mai stato clonato sul PC dell'utente. Risolto clonando `nutri-bioavailability-app` in una cartella nuova e riusando l'`.env.local` già compilato nella vecchia cartella.
2. ✅ **`npm run dev` — primo collaudo visivo, riuscito** (2026-10-10, dopo correzione di un problema): la pagina carica, "Simulatore Bio-Nutrizionale" mostra i 20 alimenti del Golden Set in Dispensa (ognuno etichettato `CONTIENE DATI DRAFT` dove pertinente — coerente, non un bug), pannelli Ferro/Zinco/Calcio `VERIFIED`, assi Microbiota/Ambiente Chimico/Macronutrienti tutti presenti. Problema incontrato e risolto: la cartella clonata aveva una cache `.next` residua di un commit vecchio (10+ commit indietro) — dopo `git pull`, i chunk JS/CSS referenziati dall'HTML non corrispondevano più a quelli su disco (404 su `_next/static/chunks/*`), pagina bloccata su "Sincronizzazione con Supabase in corso...". Fix: `Remove-Item -Recurse -Force .next` + riavvio di `npm run dev`. **Non ancora provato**: aggiungere un alimento alla Composizione Piatto e verificare che i calcoli (sinergie, inibizioni) si aggiornino con numeri reali, non più tutti a zero.
3. ✅ **`npm run typecheck` — passato, zero errori** (2026-10-10). `tsc --noEmit` pulito su tutto il progetto, pannello admin incluso.
4. ✅ **`npm run build` — passato** (2026-10-10). "Compiled successfully", linting ok, Next.js 14.2.35, 5 pagine generate (`/` statica 159 kB First Load JS, `/admin/data-entry` dinamica server-rendered 91.2 kB), nessun errore.
5. ✅ **Login admin — confermato dall'utente** (2026-10-10). Dentro il pannello "Human-in-the-Loop Data Entry": form completo (food_id, nome, matrice, famiglia botanica, 16 campi nutrienti per 100g, gestione fonti) visibile e funzionante.

### Fase 1 — Chiudere i gap dichiarati sul Golden Set attuale
Prima di espandere la copertura, onorare "zero dati inventati" sui 20 alimenti che già ci sono.
6. ✅ **Ri-verificate le 3 righe `nutrient_values` da letteratura** (2026-10-10, vedi `fix_literature_sources_recheck.sql`). Kale (ossalati, Erdoğan & Onar 2012) e fagioli rossi bolliti (fitati, Zia-ur-Rehman 2002): confermati cifra per cifra leggendo direttamente le fonti primarie, promossi a `verified`. Spinaci crudi (ossalati): due fonti primarie discordanti (Noonan & Savage 1999, review, 970 mg/100g vs Siener et al. 2006, studio primario dedicato, 1959 mg/100g) — su scelta esplicita dell'utente (fonte più recente e più "di prima mano"), il valore è passato a Siener (1959 mg/100g), ma la riga **resta `draft`**: il testo di Siener 2006 è a pagamento, Claude non lo ha letto direttamente, solo di seconda mano.
7. ✅ **Ri-controllato 2026-10-10, poi esteso lo stesso giorno** (vedi commenti in `scripts/generate_golden_set_foods.py`). USDA Retention Factors Release 6 letto di persona: nessuna riga food-specifica per carote/broccoli/mandorle, solo categorie generiche cross-alimento troppo larghe per lo standard di questo progetto — gap confermato, non risolto coi fattori di ritenzione pubblicati. Prima soluzione: aggiunto **`food_broccoli_boiled`** (FDC ID 169967, confermato fresco non surgelato) con valori misurati direttamente da USDA FDC per lo stato cotto. Golden Set ora a **30 alimenti** (461 righe `nutrient_values`).

   **Estensione 2026-10-10 (stesso giorno, su richiesta esplicita dell'utente dopo il collaudo UI)**: l'utente ha notato che "Broccoli crudi" nel selettore "Cottura" mostrava solo "Crudo" — una voce separata per il cotto non bastava, voleva il cotto nella stessa tendina. Decisione esplicita dell'utente: dove manca un fattore di ritenzione pubblicato ma esistono due alimenti Golden Set misurati indipendentemente da USDA FDC per la stessa matrice (crudo + già cotto), **deriviamo** il fattore come `valore_cotto_per_100g / valore_crudo_per_100g` (fonte interna `DERIVED_FDC_RAW_COOKED_RATIO`, `verification_status='draft'`) invece di lasciare solo "Crudo". Applicato a broccoli e carote (13 nutrienti ciascuno — ferro, zinco, calcio, vitamina C, magnesio, rame, selenio, vitamina K, più i 5 macro; **esclusi** per guardia difensiva propria del generatore (`assert 0.0 <= value <= 1.5`): folato broccoli (108/63=1.71, troppo alto per essere un vero effetto di cottura) e selenio carote (0.7/0.1=7.00, valori-traccia, rumore di misura — entrambi restano un gap dichiarato, non un numero forzato). **Esclusi anche apposta** beta-carotene/altri carotenoidi provitaminici A: quel contenuto è già gestito da `carotenoid_matrix_state` (Livny 2003) — applicarci sopra anche un fattore di ritenzione conterebbe due volte lo stesso effetto. `food_broccoli_boiled`/`food_carrots_boiled` restano nel DB (draft, non promossi) solo come base di calcolo tracciabile.

   **Bug collaterale corretto nello stesso cambiamento**: `cookingTransformationEngine.ts` non flippava mai `carotenoid_matrix_state` da `raw_intact` a `cooked_or_disrupted` quando si applicava un fattore di ritenzione reale — latente perché nessun alimento aveva finora SIA un fattore di ritenzione SIA beta-carotene misurabile. Ora, quando almeno un fattore si applica, lo stato della matrice flippa (il contenuto numerico di beta-carotene stesso resta invariato, per lo stesso motivo del doppio conteggio sopra). 2 nuovi test aggiunti in `tests/engines.test.ts` — 94 PASS / 0 FAIL su 97 totali.

   Mandorle restano senza controparte cotta per scelta (non è un alimento tipicamente bollito) — nessun gap da chiudere per quella matrice.

   **Bug residuo scoperto e corretto lo stesso giorno (collaudo UI successivo)**: l'utente ha segnalato che "carote crude" e "carote bollite e scolate" comparivano ANCORA come due voci Dispensa separate, nonostante il fattore di ritenzione derivato appena aggiunto. Causa: il fix sopra aveva aggiunto solo il fattore di ritenzione, non controllato/corretto `verification_status` sulla riga `food_carrots_boiled` — che restava `'verified'` da **prima** di questa sessione (fa parte del Golden Set originale a 20 alimenti), a differenza di `food_broccoli_boiled` (aggiunto in questa sessione, correttamente `'draft'` dall'inizio). La query Dispensa filtra `verification_status='verified'` (`app/page.tsx`), quindi una riga `verified` compare sempre come voce a sé, fattore di ritenzione o no. Il generatore Python non può correggere questo: hardcoda sempre `'draft'` per ogni riga che genera, quindi rigenerare `golden_set_foods.sql` non toccherebbe comunque righe già `'verified'` nel DB live — richiede un `UPDATE` diretto a parte.

   **Estesa lo stesso giorno a spinaci e cavoletti di Bruxelles** (istruzione dell'utente, ora **policy permanente**: "d'ora in avanti... accorpi sempre i cibi quando sono lo stesso; se li avevi distinti perché non esiste retention factor... lo si deduce matematicamente"). Stesso metodo `DERIVED_FDC_RAW_COOKED_RATIO`:
   - **Spinaci** (`leafy_greens`/boiled, FDC 168462 crudi → 168463 bolliti): 13 fattori derivati (ferro, zinco, calcio, magnesio, rame, selenio, vitamina K, folato, più i 5 macro). **Escluso apposta** vitamina C: esiste già un fattore di letteratura (`USDA_RETN06`, 0.58) che ha priorità — un fattore derivato sulla stessa chiave lo sovrascriverebbe silenziosamente via `ON CONFLICT DO UPDATE`. Ossalati non affrontati: nessuna misura da cotto nel Golden Set, nessun rapporto calcolabile (gap dichiarato).
   - **Cavoletti di Bruxelles** (`crucifere_cavoletti_bruxelles`/boiled, FDC 170383 crudi → 169971 bolliti): 11 fattori derivati (calcio, vitamina C, magnesio, rame, selenio, vitamina K, folato, più 4 macro). **Esclusi apposta** ferro/zinco: fattori verificati Doniec et al. 2022 hanno priorità. **Escluso** grasso (0.50/0.30 = 1.67, fuori dal range `[0.0, 1.5]` del sanity check del generatore — stessa logica di folato-broccoli/selenio-carote sopra, gap dichiarato non forzato).
   - **Secondo bug latente della stessa famiglia, scoperto ed esteso correttamente**: `zinc_bioaccessibility_bucket` (usato da `calculateBioavailableZinc` per il derating di biodisponibilità zinco specifico di Doniec et al. 2022) non veniva flippato da `'none'` a `'brussels_sprouts_boiled'`/`'brussels_sprouts_steamed'` quando si selezionava la cottura — stesso tipo di bug di `carotenoid_matrix_state` (punto precedente), ma **non generalizzabile**: il commento in `lib/engine/types.ts` è esplicito che Doniec et al. 2022 hanno misurato SOLO cavoletti di Bruxelles. Il fix in `cookingTransformationEngine.ts` è quindi scoped esplicitamente a `matrixId === "crucifere_cavoletti_bruxelles"` + `cookingMethod` boiled/steamed, non generico come il flip di carotenoidi. 3 nuovi test in `tests/engines.test.ts` (flip boiled, flip steamed, non-generalizzazione su broccoli) — **97 PASS / 0 FAIL su 100 totali**.
   - **Fix del bug residuo applicato anche a spinaci/cavoletti**: `food_spinach_boiled` e `food_brussels_sprouts_boiled` erano anch'essi `'verified'` da prima di questa sessione — demossi a `'draft'` nello stesso `UPDATE` di `food_carrots_boiled` (vedi `fix_add_spinach_brussels_retention_factors.sql`).

   Golden Set: 30 alimenti (invariato, nessun alimento nuovo aggiunto in questa estensione — solo fattori di ritenzione e correzione `verification_status`), 461 righe `nutrient_values`, 73 righe `retention_factors` (era 49).
8. Controllo periodico più approfondito sui 20 alimenti promossi (dichiarato in `golden_set_promote_verified.sql`, mai ancora programmato).
8b. **MACs: nessun alimento del Golden Set ha più un valore sourced** (scoperto durante il collaudo UI del 2026-10-10, segnalato dall'utente — "i MAC vengono modificati da pochissime pietanze"). Controllo riga per riga: 18 righe `macs_mg` esistevano nel DB, ma solo 2 corrispondevano a food_id del Golden Set attuale (broccoli e spinaci crudi), ed entrambe erano cruft non sourced dal vecchio seed demo (`source_id NULL`) — stesso schema già pulito per i ceci. Rimosse (`cleanup_macs_cruft.sql`). Effetto netto: il punteggio MACs nel Meal Builder ora è onestamente 0 per qualunque alimento, finché non si trova una fonte vera (USDA / letteratura su fibra fermentabile, amido resistente, inulina) per almeno alcuni dei 29 alimenti — **gap di dati reale, non ancora colmato, priorità da stabilire**.

   **Ricerca metodologica avviata 2026-10-10 (stessa sera), NESSUN valore inserito nel DB — solo note per la prossima sessione:**

   **Scoperta che cambia l'impostazione del problema**: i MACs (*microbiota-accessible carbohydrates*, Sonnenburg & Sonnenburg 2016, *Cell Metabolism* 24(1):41-50) non sono un dato che un database di composizione pubblica come singolo numero per alimento — è un **concetto-ombrello**, non una categoria chimica fissa (fonte: voce Wikipedia "Microbiota-accessible carbohydrates", verificata per la definizione generale, non per cifre). Include amido resistente, inulina/FOS, pectina, beta-glucano e alcune fibre solubili fermentabili, ma **esclude esplicitamente** gran parte della fibra totale (cellulosa/lignina, che la maggior parte dei batteri intestinali non fermenta). Conclusione diretta: usare `fiber_g` (già sourced da USDA FDC per tutto il Golden Set) come proxy per `macs_mg` sarebbe **scientificamente sbagliato**, non solo una semplificazione dichiarata — conterebbe dentro anche fibra non fermentabile, gonfiando il punteggio per alimenti ricchi di cellulosa ma poveri di amido resistente/inulina/pectina.

   **Decisione di scope (non ancora implementata)**: data l'ampiezza del concetto, l'unico sottoinsieme dei MACs con letteratura quantitativa realisticamente reperibile per i legumi del Golden Set è l'**amido resistente (RS)**. Se/quando si implementa, `macs_mg` andrebbe quindi documentato esplicitamente come "amido resistente sourced", un sottoinsieme ristretto e dichiarato dei MACs — non l'intero concetto — coerente con lo spirito delle altre semplificazioni dichiarate di questo motore (vedi commenti in `microbiotaEngine.ts`). Inulina/pectina/beta-glucano per gli alimenti vegetali del Golden Set restano un gap separato, non affrontato stasera.

   **Fonti reali trovate stasera** (nessuna ancora abbastanza completa/verificata da inserire):
   - Fabbri et al. 2016 (citato da Harvard T.H. Chan Nutrition Source, "Ask the Expert: Legumes and Resistant Starch"): fagioli neri e fagioli borlotti bolliti, RS ≈ 5% su **base sostanza secca** (non g/100g come consumato); legumi bolliti in generale 4-5% s.s.; legumi bolliti e raffreddati fino a 24h, 5-6% s.s.
   - Bednar et al. 2001 (citato dalla stessa pagina Harvard): legumi secchi crudi, RS 20-30% s.s.
   - Un secondo studio (letto solo parzialmente via PMC, citazione completa non ancora verificata) riporta lenticchie bollite convenzionalmente ≈ 5.0% s.s. di RS.
   - García-Alonso, Goñi & Saura-Calixto (1998), *Zeitschrift für Lebensmittel-Untersuchung und -Forschung* 206(4):284-287, "Resistant starch and potential glycaemic index of raw and cooked legumes (lentils, chickpeas and beans)" — citazione completa trovata (via repositorio UCM), ma **valori numerici non ancora recuperati** (abstract non raggiungibile da questo ambiente, serve il full-text).

   **Problemi aperti che impediscono di inserire questi numeri ora** (motivo dello stop, non dimenticanza):
   1. Tutti i valori trovati sono "% su sostanza secca", non g/100g come consumato (il formato che usa `macs_mg`) — servirebbe la % di umidità specifica dell'alimento bollito del Golden Set per convertire, un dato/fonte ulteriore non ancora sourced.
   2. "Fagioli neri"/"fagioli borlotti" (Fabbri 2016) non sono "fagioli rossi" (kidney, il legume del Golden Set) — stessa specie *Phaseolus vulgaris*, cultivar diversa: un'approssimazione cross-cultivar da dichiarare esplicitamente se usata, non un dato diretto.
   3. Nessun valore numerico ancora recuperato per i ceci.
   4. Zero ricerca fatta stasera su inulina/pectina/beta-glucano per gli altri alimenti vegetali del set (spinaci, kale, carote, broccoli, cavoletti, arance, mandorle, patate, pasta) — il gap per quei 9 alimenti resta totalmente aperto.

   **Stato invariato nel DB**: `macs_mg` resta a 0/assente per tutti i 30 alimenti, come prima di questa ricerca — nessuna scrittura fatta stasera. Decisione esplicita dell'utente (chat, 2026-10-10, tardi): fermarsi qui e documentare, non forzare un inserimento con una catena di conversioni/approssimazioni non ancora verificate.

### Fase 2 — Irrobustire prima di esporre al pubblico
Il DB è già in produzione (etichettato "PRODUCTION" su Supabase) ma finora ci abbiamo scritto solo noi due dalla dashboard SQL. Nessuno di questi punti è urgente finché l'app non è raggiungibile da altri, ma vanno chiusi prima che lo sia.
9. **Row Level Security su Supabase** — ⚠️ **correzione:** la prima verifica (fatta solo con un grep sui file SQL locali, non sul DB vero) diceva "nessuna policy esiste" — **falso**, controllato oggi stesso dal vivo contro `pg_class`/`pg_policies`: RLS è **abilitata** su tutte e 5 le tabelle (`foods_raw`, `nutrient_values`, `retention_factors`, `sources`, `food_matrices_master`), con policy SELECT pubbliche attive (`qual = true`, nessun filtro su `verification_status` — quindi anche le righe `draft` sono leggibili via API diretta, non solo tramite l'app; coerente col principio del progetto di mostrare sempre lo stato, non nasconderlo). Nessuna policy INSERT/UPDATE/DELETE per il ruolo pubblico/anon → le scritture dirette via chiave anon sono bloccate di default (comportamento Postgres quando RLS è on e manca una policy per quel comando). Resta da confermare solo che il pannello admin scriva esclusivamente tramite `SUPABASE_SERVICE_ROLE_KEY` lato server (vedi punto 10), non che manchi RLS — era un allarme sbagliato.
10. ✅ **Audit variabili d'ambiente completato (2026-10-10), nessun problema trovato.** `SUPABASE_SERVICE_ROLE_KEY` usata solo in `lib/supabaseAdmin.ts`, mai `NEXT_PUBLIC_`; ogni importatore (`app/admin/data-entry/actions.ts` con `'use server'`, `app/admin/data-entry/page.tsx` come Server Component async) è server-only. `.env.local` mai committato (verificato anche nella storia git, non solo nel working tree attuale) — solo `.env.local.example` con valori vuoti. `lib/supabaseClient.ts` (lato browser) usa solo la chiave `anon`, protetta da RLS.
11. Pipeline di deployment (Vercel) — repository non ancora collegato a nessun progetto Vercel; primo deploy reale, variabili d'ambiente configurate lì.

### Fase 3 — Completare la superficie UI del perimetro MVP (§7)
Cosa manca ancora rispetto a quello che il PRD dichiara "dentro" la v1.
12. ✅ **Quantità/grammatura per alimento nel Meal Builder** — scoperto mancante durante il collaudo UI del 2026-10-10, implementato lo stesso giorno. `scaleFoodItemToGrams(food, grams)` in `lib/engine/types.ts`: scaling lineare puro di tutti i campi nutrienti numerici (per-100g, USDA), esclusi deliberatamente i campi categorici/booleani; difensivo su grammi negativi/NaN/Infinity (trattati come 0g, mai un valore inventato). 10 nuovi test (Livello A difensivo + Livello B proprietà di scaling, incl. additività) — 92 PASS / 0 FAIL su 95 totali, nessuna regressione. `app/page.tsx`: `MealItem.grams` (default 100g, equivalente al dato grezzo), handler `updateGrams`, scaling applicato in `currentMealFoods` DOPO la trasformazione di cottura, nuovo campo "Quantità (g)" nella UI con avviso se il valore non è una porzione valida. Da confermare dal vivo sul PC dell'utente (`git pull` + `npm run dev`): aggiungere un alimento con una grammatura diversa da 100 deve produrre numeri proporzionalmente scalati.
13. ✅ Scanner barcode via Open Food Facts (2026-10-10). Implementato in `lib/openFoodFacts.ts` (fetch live, mai scritto nel DB proprietario — vedi riga "Dati prodotti confezionati" in §2) + `components/BarcodeScanner.tsx` (camera via `html5-qrcode`) + integrazione in `app/page.tsx`. Decisione dell'utente (chat, 2026-10-10): i prodotti scansionati entrano nel Meal Builder e nel calcolo di biodisponibilità del pasto (non una lista separata), con un sistema a 3 livelli di fiducia dichiarato in UI con colori/legenda:
   - **Misurato** (verde): valore letto dal campo `nutriments` di OFF (dichiarato dal produttore in etichetta, non verificato da Claude come il Golden Set).
   - **Stimato** (ambra): dedotto da una regola euristica semplice su categoria/ingredienti OFF (es. `is_heme_iron` da categoria carne/pesce; vedi commento di testa di `lib/openFoodFacts.ts` per l'elenco completo e le tag usate).
   - **Non disponibile** (grigio): fitati, ossalati, polifenoli, MACs, beta-carotene — nessuna base per stimarli da una categoria generica, lasciati a 0 e mai inventati.

   Un avviso dedicato (non un badge sul motore, che non ha e non deve avere alcuna nozione di OFF) compare nell'HUD "Assorbimento Reale" quando il pasto contiene un prodotto scansionato, perché il Draft/Verified di `calculateBioavailableIron/Zinc/Calcium` riflette solo il rigore del modello di assorbimento (es. derating zinco, categoria ossalati), non la provenienza del dato alimentare — un pasto con un prodotto scansionato approssimato può quindi mostrare "Verified" pur contenendo un input stimato; l'avviso compensa questo scollamento.

   **Verificato sul PC dell'utente (2026-10-10)**: `git pull` + `npm install` (incl. `html5-qrcode`) + `npm run build` completati senza errori (un bug di import in `lib/openFoodFacts.ts` — percorso `./types` invece di `./engine/types` — trovato dal typecheck reale e corretto nello stesso giorno, vedi commit `c76630b`).

   **LIMITE ANCORA APERTO**: l'assunzione che i campi `_100g` di OFF siano normalizzati in grammi (non nell'unità naturale del nutriente) si basa solo sulla documentazione scritta OFF, non su un fetch live confrontato con un'etichetta reale (questo sandbox non ha accesso di rete al dominio OFF). **Ancora da fare sul PC dell'utente**: scansionare un prodotto reale e confrontare i valori mostrati con l'etichetta stampata, prima di fidarsi dei numeri.
14. Meal Builder — rifinitura generale dopo il primo collaudo visivo riuscito (Fase 0 punto 2).

### Fase 4 — Scalare oltre i 20 alimenti
Esplicitamente subordinato: non partire prima che Fasi 0-1 siano chiuse.
15. Disegnare un processo di verifica **a batch** (non più un alimento alla volta a mano) — criterio esplicito di cosa rende una riga promuovibile a `verified`, ripetibile.
16. Espandere la copertura alimenti usando quel processo, dando priorità a ciò che serve davvero ai primi utenti (non ai ~1.100 alimenti tutti insieme).

### Fase 5 — Backlog post-MVP (fuori perimetro per sequenza, non per blocco legale)
Dalla visione a 7 step condivisa il 2026-10-10, al netto delle voci escluse (vedi §7, nota 2026-10-10). Nessun ordine imposto fra questi — da prioritizzare quando ci si arriva.
17. Pipeline evidenze scientifiche (scraping PubMed + estrazione parametri + livello di evidenza + review umana) — coerente con §2 regola 3 e §4; rafforzerebbe le fonti dei motori già ammessi, utile anche prima della Fase 4.
18. AI Recipe Co-Pilot (parsing ricette da voce/testo).
19. Database integratori e crononutrizione.
20. Mappa globale di popolazione (FAOSTAT/GDD).
21. Integrazione wearable (HealthKit/Health Connect) — richiede app nativa, non PWA: decisione architetturale a sé.

### Fase 6 — Intenzionalmente parcheggiato (non "dopo", ma "da ridiscutere se e quando")
22. Modulo clinico (ontologia eziologica, alberi decisionali per patologia) — fuori perimetro per motivi legali/regolatori (§1.1), si rivaluta a MVP completo.
23. Integrazione CGM — stesso livello di cautela del modulo clinico (§7, nota 2026-10-10), non una voce di backlog ordinaria.

---

## 10. Istruzioni per l'agente di sviluppo AI (Cursor / Claude Code)

1. Inizializzare Next.js + Tailwind; collegare Supabase (regione UE).
2. Applicare le migrazioni SQL del §5 **prima** di importare qualunque dato.
3. Importare nel Golden Set **solo** righe con `verification_status = 'verified'`.
4. Nessun engine va scritto/modificato senza che i test di accettazione corrispondenti esistano già e passino.
5. Qualunque numero che l'agente sarebbe tentato di "stimare per completare" va invece lasciato `NULL` con `verification_status = 'draft'` e un commento `// TODO: fonte mancante`. Non indovinare mai un coefficiente per far quadrare la UI.
