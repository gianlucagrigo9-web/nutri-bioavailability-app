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
- ~~Cruft di righe duplicate/quasi-duplicate in `sources`~~ **Pulito il 2026-10-11** (`fix_cleanup_sources_cruft.sql`, registro di quanto eseguito via SQL editor — su richiesta esplicita dell'utente, non di iniziativa). Dei 31 id allora presenti, solo 25 erano citati dal codice. 4 erano orfani ovunque (0 riferimenti in tutte le 4 tabelle con FK verso `sources`), cancellati direttamente. 2 (`USDA_FDC_SR`, `SONNENBURG_2016`) erano citati da 5 righe `nutrient_values` reali appartenenti a `food_apple_raw`/`food_beef_raw` — due alimenti fuori dal Golden Set attuale, `draft`, invisibili in UI, con citazioni già sbagliate secondo gli standard odierni (`macs_mg` attribuito a `SONNENBURG_2016`, un paper che non pubblica valori MACs per singolo alimento — vedi Fase 1 punto 8b in §9). Mostrato il contenuto completo all'utente prima di cancellare. `sources` ha ora esattamente 25 righe, tutte con `source_type` non-NULL.
- Il gap architetturale appena descritto (`SourcedValue.sourceIds` fisso per metodo, non dinamico per food) non è stato risolto: servirebbe che ogni funzione di calcolo propagasse i `source_id` reali dei `nutrient_values`/`retention_factors` effettivamente usati per quel food/pasto, invece della lista fissa del modello. Rimandato: è un cambiamento più ampio del contratto `SourcedValue` (§6), da affrontare come task a sé.
- Estensione di "stima dichiarata" a **tutto** ciò che l'app traccia (richiesta esplicita dell'utente, non solo MACs): questa sessione attiva il meccanismo e lo collega al primo caso reale esistente (i fattori di ritenzione derivati); non audita/retrofitta ancora ogni altro output del motore per verificare se meriti la stessa etichetta.

**Scoperta collaterale durante l'esecuzione del backfill (2026-10-11), risolta lo stesso giorno.** Eseguendo `fix_backfill_source_type.sql` contro il DB live, la query di verifica finale ha segnalato 6 dei 25 `source_id` attesi come **assenti dalla tabella `sources`**, non semplicemente NULL: `IOM_1998_DRI_B_VITAMINS`, `NIH_ODS_FOLATE_FACT_SHEET`, `LIVNY_2003_EURJNUTR`, `HEYSSEL_1966`, `ADAMS_1971`, `NNR2023_OLSEN_LERNER_FNR`. Sono citati da `calculateBioavailableB12`, `calculateFolateDFE` e `calculateVitaminARAE` (§4.1, §4.2) ma nessuno script `fix_*.sql` del repository li aveva mai effettivamente inseriti in produzione — un gap preesistente, non introdotto stasera, scoperto solo perché il backfill include una verifica difensiva invece di assumere silenziosamente che l'UPDATE avesse toccato una riga.

**Risolto** (`fix_backfill_source_type_missing_rows.sql`, stessa sessione): inserite tutte e 6 le righe. 4 con citazione completa verificata: `LIVNY_2003_EURJNUTR` e `NNR2023_OLSEN_LERNER_FNR` (già note da §4.1/§4.2), `IOM_1998_DRI_B_VITAMINS` e `NIH_ODS_FOLATE_FACT_SHEET` (lette direttamente via fetch, URL confermati attivi). Per le altre 2 (`ADAMS_1971`, `HEYSSEL_1966`) la citazione resta **dichiaratamente incompleta**: confermato con un fetch diretto del capitolo 9 di IOM 1998 (NCBI Bookshelf NBK114302) che il report cita davvero "Adams and colleagues (1971)" (ancora `#ch9.r4`) e "Heyssel et al., 1966" (ancora `#ch9.r68`) per esattamente le affermazioni già descritte nei commenti del motore, ma la sezione References del capitolo non è stata raggiungibile in questa sessione (il fetch si tronca prima) — rivista/volume/pagine non verificati, dichiarato esplicitamente nel campo `citation` stesso invece di essere completato a memoria. Stesso standard di trasparenza già usato per `SIENER_2006_FOODCHEM` (§4.6): citazione di seconda mano accettata, mai presentata come se fosse stata letta per intero.

**Verifica del gap architetturale `sourceIds` dinamico (2026-10-11, stessa sessione, prima di scrivere codice): il gap è reale, ma oggi senza un solo caso reale su cui si manifesti.** Prima di toccare le ~16 funzioni di calcolo in `computationalNutritionEngine.ts`/`microbiotaEngine.ts` (un refactor non verificabile in locale in questa sandbox — vedi limite rete sotto), si è interrogato il DB live per capire quante righe, **sulle 4 tabelle con FK verso `sources`**, citano oggi una fonte `internal_estimate`:

```sql
-- nutrient_values (461 righe totali)
SELECT s.source_type, count(*) FROM nutrient_values nv JOIN sources s ON s.id = nv.source_id GROUP BY 1;
--  official_database: 458, peer_reviewed_study: 3, internal_estimate: 0

-- food_matrices_master + scientific_evidence_library
SELECT 'food_matrices_master', s.source_type, count(*) FROM food_matrices_master f JOIN sources s ON s.id=f.source_id GROUP BY 1,2
UNION ALL SELECT 'scientific_evidence_library', s.source_type, count(*) FROM scientific_evidence_library e JOIN sources s ON s.id=e.source_id GROUP BY 1,2;
--  food_matrices_master: 4 righe, tutte official_database. scientific_evidence_library: 0 righe.
```

Risultato: **zero** righe `internal_estimate` in `nutrient_values`, `food_matrices_master` o `scientific_evidence_library`. L'unica fonte `internal_estimate` esistente in tutto il DB (`DERIVED_FDC_RAW_COOKED_RATIO`) è citata **esclusivamente** da `retention_factors` — caso già coperto dal badge "· cottura stimata" in Dispensa (vedi sopra). Il badge "STIMA" di `MetricRow`, quindi, non solo non si illumina mai per un limite di design (lista `sourceIds` fissa per metodo) — oggi non avrebbe comunque **nulla da mostrare**, perché nessun dato grezzo reale è etichettato come stima a livello di singolo nutriente/food.

**Decisione presentata all'utente, che ha scelto di procedere comunque** (opzione "Costruisci comunque l'infrastruttura", scelta esplicita a fronte della verifica sopra): costruire l'infrastruttura del `sourceIds` dinamico ORA, come preparazione in anticipo sui dati, pur sapendo che non cambia nulla osservabile in UI oggi.

**Implementato** (stessa sessione, `lib/engine/types.ts`, `computationalNutritionEngine.ts`, `microbiotaEngine.ts`):
- `FoodItem.nutrientSourceIds?: Partial<Record<NutrientFieldName, string>>` — campo opzionale, mappa nome-campo → `sources.id`, provenienza reale per singolo nutriente. `NutrientFieldName` è derivato da `SCALABLE_NUTRIENT_FIELDS` (non duplicato a mano). Categorico rispetto alla grammatura: `scaleFoodItemToGrams` lo propaga già invariato tramite lo spread `{...food}` esistente, nessuna modifica necessaria lì.
- `mergeSourceIds(model, foods, fields)` (nuova funzione esportata in `types.ts`): restituisce `model` con, in coda e deduplicati, gli eventuali `nutrientSourceIds` reali dei `fields` effettivamente usati come input, per i `foods` passati. Se nessun food ha `nutrientSourceIds` per quei campi — il caso di ogni riga oggi in produzione — il risultato è identico a `model`: zero cambiamento di comportamento.
- Ogni funzione di calcolo che restituisce un `SourcedValue` sourced a dati reali (`calculateBioavailableZinc/Calcium/Iron/B12`, `calculateFolateDFE`, `calculateVitaminARAE`, le 10 funzioni dietro il helper condiviso `sumRawNutrient` per magnesio/rame/selenio/iodio/vitK/energia/proteine/carboidrati/grassi/fibra, e `calculateMicrobiotaImpactScore` per MACs/polifenoli) ora passa `sourceIds` attraverso `mergeSourceIds`, specificando i campi di `FoodItem` che quella funzione legge davvero come input. **Deliberatamente non toccato**: `lcaLogisticsEngine.ts` (tipo `FoodItemLCA` diverso, nessuna fonte `internal_estimate` oggi in `food_matrices_master`, verificato sopra) e `cookingTransformationEngine.ts` (il caso `retention_factors` è già coperto dal badge "cottura stimata" esistente, un meccanismo indipendente che non passa da `SourcedValue.sourceIds`).
- **Deliberatamente NON ancora wired in `app/page.tsx`**: popolare `nutrientSourceIds` da `nutrient_values`/`sourcesMap` lì richiederebbe modificare il file più centrale e meno verificabile dell'app per un caso che oggi non ha alcun dato reale da leggere (0 righe `internal_estimate`, verificato sopra) — plumbing cieco, non esercitabile. Rimandato a quando esisterà un primo dato reale, da fare nello stesso momento in cui si potrà anche verificare dal vivo che il badge "STIMA" di `MetricRow` si accende davvero.

**Verifica eseguita (non rimandata all'utente, contrariamente a quanto inizialmente previsto in questa sessione)**: scoperto durante l'implementazione che `tsx` e `tsc` sono disponibili globalmente in questa sandbox (`/home/claude/.npm-global/bin/`) e il codice dei motori (`lib/engine/*.ts`) non ha **nessuna** dipendenza npm esterna (solo import relativi fra loro) — quindi, a differenza del resto dell'app Next.js (bloccata da node_modules mancanti, vedi limite di rete altrove in questo documento), è eseguibile e tipizzabile qui senza installare nulla:
- `tsx tests/engines.test.ts`: **108 PASS, 0 FAIL, 3 LIMITE NOTO su 111 test totali** (i 3 LIMITE NOTO sono gli stessi limiti preesistenti documentati sopra per B12, non legati a questa modifica) — inclusi i nuovi test aggiunti per `mergeSourceIds` e per l'integrazione in `calculateBioavailableIron`/`calculateMagnesium`/`calculateMicrobiotaImpactScore` (fixture sintetiche con un `source_id` di test, `TEST_ESTIMATE_SOURCE`, che non esiste in produzione).
- `tsc --noEmit --strict` (stessi flag del `tsconfig.json` del progetto: target ES2017, lib dom/dom.iterable/esnext) su tutti e 5 i file di `lib/engine/`: **0 errori**.
- Resta da fare da parte dell'utente solo `npm run typecheck`/`npm run test` sul **resto** dell'app (`app/page.tsx` e tutto ciò che dipende da `next`/`react`, non verificabile qui per mancanza di quei pacchetti) — non più l'intero motore, come inizialmente comunicato in questa sessione.

### 4.8 Piatti compositi/tradizionali e una terza fascia di accuratezza (2026-10-11) — **APPROVATO dall'utente lo stesso giorno, schema+motore scritti, non ancora eseguiti sul DB reale né wired in UI**

**Il problema.** L'utente ha chiesto come trattare piatti tradizionali composti (es. "pasta al pomodoro", "minestrone", "parmigiana di melanzane") che non esistono come voce singola in USDA FDC né altrove: *"per piatti tradizionali bisogna guardare ai singoli componenti, a come e quanto cuociono e dedurre da lì i nostri valori, in ogni caso saranno ancora meno precisi dei cibi processati presumo e quindi potremmo fare una terza categoria di accuratezza."* Questa sezione propone un design, da approvare prima di scrivere una riga di codice o di schema (Regola 5).

**Osservazione chiave: non serve una quarta/terza tabella di "livelli di accuratezza" nuova — il meccanismo esiste già, in due pezzi che vanno solo collegati.**
1. Il Meal Builder **già** soma più `FoodItem` scalati a grammatura reale (`scaleFoodItemToGrams`, Fase 3 punto 12) per ottenere i totali di un pasto. Un "piatto composito" è esattamente questo — un meal pre-assemblato e salvato come template, non un oggetto concettualmente nuovo.
2. `sources.source_type = 'internal_estimate'` (§4.7) è già il meccanismo generale per "valore derivato con metodo nostro, non misurato direttamente" — `DERIVED_FDC_RAW_COOKED_RATIO` è già un precedente reale di un numero calcolato (non misurato) a partire da altri dati verificati.

**Design proposto.**
- **Nessuna riga statica in `nutrient_values` per il piatto.** Scrivere oggi un numero "pasta al pomodoro = X mg ferro" e lasciarlo lì violerebbe silenziosamente la Regola 1 il giorno in cui corrggiamo il dato sorgente di uno dei componenti (es. il pomodoro): il piatto resterebbe sbagliato finché qualcuno non se ne accorge a mano. Il valore del piatto va invece **calcolato a runtime** dai componenti, sempre, esattamente come già avviene per un pasto assemblato a mano — nessun nuovo dato "nudo" da mantenere sincronizzato.
- **Due tabelle nuove, leggere**: `dish_templates` (`dish_id`, `name_it`, `description_it`, `source_id` → nuova riga `sources` con `source_type='internal_estimate'`, citazione = descrizione testuale della ricetta di riferimento usata) e `dish_components` (`dish_id`, `food_id` componente, `grams_per_serving`, `cooking_state_assumed` — crudo/cotto, per scegliere quale riga/fattore di ritenzione usare). Nessun numero nutrizionale scritto a mano in nessuna delle due: solo grammi e riferimenti a `food_id` già esistenti.
- **Calcolo**: al momento dell'uso, per ciascun componente si applica la stessa pipeline già testata (cottura → `cookingTransformationEngine`, poi `scaleFoodItemToGrams`), si somma, e il risultato eredita i `sourceIds` reali di ogni componente via `mergeSourceIds` (meccanismo già costruito in §4.7) — **nessuna logica di calcolo nuova**, solo composizione di pezzi esistenti.
- **La "terza fascia" richiesta dall'utente non è un nuovo campo DB ma un badge UI dedicato**, propagato come `isCompositeDish: boolean` sul `FoodItem` risultante (stesso pattern di `hasDraft` in Dispensa, Fase 3 punto 13): un colore/etichetta distinto da "Misurato" (verde, Golden Set) e da "Stimato" (ambra, singolo nutriente/prodotto scansionato) — proposta: **"Ricetta stimata"** (viola/blu), per non confondersi visivamente con gli altri due. Si attiva ogni volta che il pasto contiene un `dish_template`, indipendentemente dal fatto che i singoli componenti siano `verified`: la ricetta stessa (proporzioni, presenza/assenza di un ingrediente, grado di cottura assunto) è un'approssimazione che un'etichetta "Verified" sui componenti non comunicherebbe.
- **Range di confidenza (Regola 2), senza inventare nulla di nuovo**: se un componente ha un range dichiarato, il range del piatto è la somma dei minimi e la somma dei massimi dei componenti che ne hanno uno (propagazione lineare attraverso l'addizione, matematicamente esatta); se nessun componente ha un range, il piatto resta `range_available: false` — mai un range fabbricato solo perché il piatto "sembra" dover essere più incerto.

**Perché non una quarta colonna/enum invece che riuso di `internal_estimate`**: ogni piatto composito avrebbe comunque bisogno di un `source_id` che descriva *quella specifica* combinazione di componenti e grammature (per la Regola 6 — tracciabilità) — un solo valore enum in più non lo sostituirebbe, mentre una riga `sources` dedicata per `dish_id` (stesso pattern già in uso per `DERIVED_FDC_RAW_COOKED_RATIO`) lo fa gratis.

**Approvazione dell'utente (2026-10-11)**: *"riguardo all'ultima proposta, mi piace più concetto di due tabelle leggere per mantenere dinamicità all'interno di una ricetta classica perché ognuno possa aggiungere o togliere qualcosa senza sfanculare tutto."* — design approvato così com'è.

**Scelta architetturale chiarita durante l'implementazione (non ancora nella bozza sopra): mai un FoodItem fuso.** Un `dish_template` non viene espanso in un unico `FoodItem` somma — viene espanso in una **lista** di `FoodItem`, uno per componente, ciascuno scalato alla propria grammatura, che il Meal Builder aggiunge al pasto esattamente come se l'utente avesse scelto quei food uno per uno. Motivo: fondere i componenti in un solo oggetto richiederebbe di scegliere un valore unico anche per i campi categorici (`matrix_category_calcium`, `is_heme_iron`, ecc.) — es. quale categoria di ossalati assegnare a "pasta al pomodoro", che mischia pomodoro (alto) e pasta (non pertinente)? Una scelta così sarebbe essa stessa un dato inventato, in conflitto con la Regola 1. Espandere in lista evita il problema: ogni componente mantiene i propri dati reali, i motori di calcolo (ferro/zinco/calcio) già iterano un `Meal.foods` eterogeneo food-per-food, quindi non serve nessuna modifica lì.

**Implementato** (stessa sessione, logica pura — nessuna chiamata rete necessaria, testabile in questo sandbox):
- `add_dish_templates.sql` (nuovo file root, stesso stile `fix_*.sql`): `dish_templates` (`dish_id`, `name_it`, `description_it`, `source_id` → `sources`, `verification_status`) e `dish_components` (`dish_id`, `food_id` → `foods_raw`, `grams_per_serving`, `cooking_state_assumed`). RLS abilitata su entrambe, stessa policy pubblica SELECT-only delle altre 5 tabelle (§9 Fase 2 punto 9) — nessuna policy INSERT/UPDATE/DELETE per `anon`. Query di verifica finale (esistenza tabelle + RLS attiva) in coda al file. **Non ancora eseguito contro Supabase** (questo sandbox non ha rete diretta — stesso limite di sempre): da eseguire sul PC dell'utente o via SQL editor.
- `lib/engine/dishComposition.ts` (nuovo file): `expandDishComponentsToFoodItems(components, dishSourceId)` — scala ogni componente con `scaleFoodItemToGrams` (riuso, zero logica nuova) e lo marca `isCompositeDish: true` + `compositeDishSourceId`. `sumConfidenceRange(...)` — utility per un futuro "totale del piatto" in UI: somma i range solo se **tutti** i componenti ne hanno uno, altrimenti nessun range (mai fabbricato) — non ancora wired in `app/page.tsx` (stesso tipo di gap dichiarato per `nutrientSourceIds` in §4.7: infrastruttura pronta, nessun `dish_template` reale ancora esistente da mostrare).
- `lib/engine/types.ts`: due nuovi campi opzionali su `FoodItem` — `isCompositeDish?: boolean` (badge "Ricetta stimata") e `compositeDishSourceId?: string` (audit, non ancora propagato nei `sourceIds` dei `SourcedValue`).
- `tests/dishComposition.test.ts` (nuovo, 8 test): scaling corretto per componente, badge/sourceId propagati, **nessuna fusione dei campi categorici** (verificato esplicitamente — ogni componente mantiene i propri), array vuoto difensivo, grammatura non fisica trattata come 0g, propagazione/assenza del range di confidenza. `npm test` (3 file): **136 PASS, 0 FAIL, 3 LIMITE NOTO** (i 3 limite noto sono preesistenti su B12, non legati a questa modifica). `tsc --noEmit --strict` su `lib/engine/*.ts` + `lib/fdc/*.ts`: 0 errori.

**Ancora da fare, non deciso oggi:**
- Eseguire `add_dish_templates.sql` sul DB reale (sul PC dell'utente, come sempre per le modifiche di schema).
- Come scegliere le **grammature standard** per porzione di un piatto tradizionale (fonte: una ricetta di riferimento dichiarata esplicitamente, non una media "a sensazione" — es. CREA/LARN per le porzioni standard italiane, se disponibile).
- Se/come gestire la **perdita di peso in cottura aggregata** (es. l'acqua che evapora da un sugo) separatamente dai fattori di ritenzione per-nutriente già esistenti, che assumono grammatura del singolo alimento, non del piatto intero.
- Wiring in `app/page.tsx`: leggere `dish_templates`/`dish_components` da Supabase, un modo per l'utente di scegliere "aggiungi piatto" nel Meal Builder, il badge "Ricetta stimata" visibile in UI.
- Priorità: quali piatti tradizionali entrano nella coda Fase 4 punto 16/16b (§9) e in che ordine.

### 4.9 Ricalibrazione della funzione principale: motore di generazione dieta + recommender "Pareto-superiore" (2026-10-11) — **PROPOSTA APERTA, in attesa di una sessione di design dedicata, nessun codice/schema scritto**

**Richiesta dell'utente, testuale**: *"noi forniamo in primis un servizio di creazione dieta che sia la migliore possibile stando alle linee guida, che abbia cadenza come minimo settimanale [...] e che l'utente può chiedere di modificare sulla base di preferenze per un certo cibo che per lui deve esserci per forza, per la necessità di escludere certi cibi per allergie o perché non piacciono, per la necessità di avere un bilancio migliore per impatto ambientale; in secondo luogo c'è ovviamente il servizio di 'inserire la mia dieta e vedere che valori ha' e a quel punto noi potremmo aggiungere la feature di 'consiglio' stile pareto superior in cui [...] capiamo aggiungendo quale cibo o togliendo quale altro si possa ottenere [...] la miglior possibile dieta (tipo max cambiare 3/4 alimenti)."*

**Perché questo non è semplicemente la voce Fase 5 punto 18 ("AI Recipe Co-Pilot")**: quella voce è parsing di ricette esistenti da voce/testo. Questa è diversa e più ambiziosa — un motore di **generazione/ottimizzazione** di un piano alimentare, in due servizi distinti:
1. **Generazione periodica** (minimo settimanale, eventualmente mensile se si vuole far girare più alimenti): costruisce il miglior piano possibile secondo le linee guida nutrizionali, con vincoli espliciti dell'utente (alimenti obbligatori, esclusioni per allergia/gusto, bilancio ambientale).
2. **Recommender "Pareto-superiore"** sul servizio già esistente "inserisci la tua dieta": dato un pasto/piano inserito dall'utente, trova la modifica minima (massimo 3-4 alimenti cambiati) che lo migliora.

**Dipendenza diretta con il lavoro già in corso (non in conflitto, anzi lo rinforza)**: entrambi i servizi hanno bisogno di un panel di alimenti ampio per avere margine di scelta reale — un ottimizzatore su 30 alimenti del Golden Set attuale ha pochissimo spazio di manovra. La Fase 4.16 (espansione panel italiano) resta quindi prioritaria anche per questo motivo, non solo per la copertura di base.

**Perché serve una sessione di design dedicata prima di qualunque criterio di accettazione (Regola 5), più che per le decisioni precedenti di questo documento**: qui la posta in gioco è più alta — non un singolo fattore di ritenzione, ma la funzione che l'utente definisce "primaria" dell'app. Domande aperte che nessuna scelta di default implicita dovrebbe risolvere da sola:
- **Target di riferimento**: LARN (italiane), EFSA DRI (europee), o un mix — e come si lega al `user_profile` (età/sesso) già esistente per i fabbisogni individuali.
- **Granularità "settimanale"**: un unico pattern di pasti ripetuto, 7 giorni realmente diversi, o una via di mezzo (pochi giorni-tipo alternati).
- **Come arbitrare conflitti fra i tre assi** (adeguatezza nutrizionale alle linee guida, biodisponibilità reale calcolata dai nostri motori, impatto ambientale): vincolo rigido + ottimizzazione entro quel vincolo, o pesi relativi fra obiettivi — scelte molto diverse per il risultato finale.
- **Metodo di ottimizzazione**: con un panel che crescerà da 30 a centinaia di alimenti, una ricerca combinatoria esaustiva non scala — richiede una scelta esplicita di approccio (programmazione lineare/greedy/ricerca locale vincolata), con criteri di test su insiemi piccoli prima di eventuali garanzie su insiemi grandi.
- **Cosa conta come "Pareto-superiore"** quando si modificano max 3-4 alimenti: serve una definizione formale di dominanza sui tre assi, e un comportamento esplicito e dichiarato (Regola 6) per il caso in cui NESSUNA modifica entro 3-4 alimenti migliori il piano — mai forzare un "miglioramento" fittizio per rispondere comunque qualcosa.

**Risposte dell'utente alle 3 domande (2026-10-11, stessa sessione) e bozza di design conseguente — ancora NON criteri di accettazione formali, ma un passo avanti concreto:**

1. **Linee guida**: confermato il mix LARN + EFSA dove manca un valore.

2. **Granularità settimanale — risposta più ricca della domanda posta**: *"deve semplicemente essere la migliore [...] se abbiamo detto che per il microbiota si dovrebbero avere 30 vegetali diversi a settimana quello potrebbe già essere un paletto, poi le persone metteranno loro sesso, peso, obiettivo di peso, attività svolte e noi calcoliamo fabbisogno settimanale [...] si potrebbe comunque anche mettere opzione [...] 'dieta monotona' (per esempio per palestrati) in cui gli fornisci pochissimi cambiamenti intrasettimanali."* Conseguenze:
   - **`user_profile` va esteso**: oggi ha solo età/sesso (per LARN/RDA, §1.1). Servono **peso, obiettivo di peso (perdita/mantenimento/aumento, con che intensità), livello di attività fisica** — nuovi campi, schema non ancora modificato.
   - **Fabbisogno energetico**: proposta **Mifflin-St Jeor** (Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. "A new predictive equation for resting energy expenditure in healthy individuals." *Am J Clin Nutr.* 1990;51(2):241-247. DOI 10.1093/ajcn/51.2.241) — uomini: `10×peso(kg) + 6.25×altezza(cm) − 5×età + 5`; donne: stessa formula `− 161` invece di `+5`. Poi moltiplicata per un fattore di attività (PAL) per il fabbisogno totale — **fonte del fattore PAL non ancora trovata/verificata** (gap dichiarato, da risolvere prima di implementare, non un numero a caso).
   - **"30 vegetali diversi a settimana" è un claim reale, già nella nostra libreria fonti**: McDonald D et al., *mSystems* 2018 (già `MCDONALD_2018_MSYSTEMS` in `sources`, verificato ora leggendo la copertura del paper) — chi mangia **>30 tipi diversi di piante/settimana** (41 persone) ha un microbiota più diverso di chi ne mangia **≤10/settimana** (44 persone), indipendentemente da vegetariano/vegano/omnivoro. **Attenzione, distinzione importante da non confondere**: `microbiotaEngine.ts` oggi usa un moltiplicatore di diversità basato sul **conteggio di famiglie botaniche uniche** (`uniqueBotanicalFamilies`, vedi codice), NON sul conteggio di "tipi di piante" come nello studio McDonald — sono due metriche diverse (poche famiglie botaniche possono contenere molte "piante" distinte nel senso dello studio). Se il generatore di dieta adotta "≥30 piante/settimana" come paletto, serve un **nuovo contatore dedicato** (alimenti vegetali distinti nel piano settimanale), non il riuso diretto del multiplier esistente — da decidere esplicitamente, non assunto.
   - **Modalità "dieta monotona"**: confermata come opzione utente (default: massima varietà "migliore possibile"; toggle per chi preferisce pochi cambiamenti, es. palestrati) — parametro esatto (quanti giorni-tipo, quanta ripetizione) ancora da definire.

3. **Priorità tra adeguatezza/biodisponibilità/ambiente — l'utente corregge la mia impostazione**: *"non capisco perché metti biodisponibilità fuori adeguatezza. biodisponibilità è forse la cosa più importante dopo il bilancio dei macronutrienti [...] ambiente conterà zero per [chi] non [gli] interessa [...] possiamo far scendere qualità dieta del 20% [...] (nostra dieta 0 interessi ambiente = 100, quella con interesse ambiente = 80, [...] derivati da quanto ci si stia allontanando da [...] linee guida [...] micro e macro nutrienti) [...] magari [...] linee guida per comprare dai posti giusti: bio, stagione, km zero [...] sulla base dei classici fattori [...] (carbon footprint, uso acqua...) per quelli che dicono che a loro interessa."* Punto giusto, corretto: la biodisponibilità non va trattata come un terzo asse competitivo — va dentro il punteggio di adeguatezza stesso. Proposta conseguente (metodologia esistente in letteratura, non inventata da noi):
   - **Un solo punteggio di "adeguatezza" (macro+micro+biodisponibilità insieme)**, basato su **NAR/MAR** (*Nutrient Adequacy Ratio* / *Mean Adequacy Ratio*): per ciascun nutriente, NAR = assunzione ÷ valore di riferimento (LARN/EFSA), **capped a 1.0** (un nutriente in forte eccesso non compensa un altro carente — proprietà esplicita del metodo, non nostra invenzione); MAR = media dei NAR su tutti i nutrienti considerati. Metodo storico di Madden & Yoder (1972, valutazione food stamps), metodologia dettagliata in Hatloy A, Torheim LE, Oshaug A. "Food variety, socioeconomic status and nutritional status in urban Côte d'Ivoire." *Eur J Clin Nutr.* 1998;52(12):891-898. **Estensione nostra, da dichiarare esplicitamente come tale (non nel metodo originale)**: usare il valore **bioavailability-adjusted** (dai nostri stessi motori: ferro, zinco, calcio, B12, folato, vitamina A) come numeratore del NAR per quei nutrienti, invece della sola composizione grezza — così la biodisponibilità entra DENTRO l'adeguatezza, non a lato, esattamente come richiesto. Macronutrienti ed energia trattati con lo stesso meccanismo NAR (target da LARN/EFSA, AMDR per i macro), non un sistema separato.
   - **Impatto ambientale, opt-in, zero peso di default**: per chi non lo richiede, non entra nel punteggio. Per chi lo richiede: ottimizzare il punteggio ambientale (motore LCA già esistente, Agribalyse/AWARE, §1.2/§3) **soggetto al vincolo** che il MAR non scenda sotto una soglia configurabile (esempio dato dall'utente: fino al 20% in meno rispetto al MAR massimo raggiungibile ignorando l'ambiente — **valore illustrativo, da trattare come parametro impostabile, non costante fissa nel codice**, salvo diversa indicazione).
   - **Linee guida d'acquisto (bio, stagionalità, km zero)**: riconosciuta come richiesta separata, non parte del punteggio numerico (non abbiamo dati quantificati per-100g su "dove è stato comprato" — è un attributo del punto vendita, non della composizione dell'alimento). Proposta: trattarla come funzionalità **a parte**, consigli testuali/tag per categoria, non parte dell'ottimizzatore matematico — da riprendere quando il resto è stabile, non ora.

**Cosa resta da chiudere prima di poter scrivere criteri di accettazione formali (Regola 5)**:
1. Fonte verificata per il fattore PAL (attività fisica) nel calcolo del fabbisogno energetico — non ancora trovata a uno standard citabile.
2. Decidere il contatore "piante diverse/settimana" (nuovo, separato dal multiplier famiglie botaniche esistente) e la sua soglia esatta/ruolo (vincolo rigido o solo bonus nel punteggio).
3. Parametri esatti della modalità "dieta monotona" (quanti giorni-tipo, quanta variazione tollerata).
4. Metodo di ottimizzazione concreto (dato che il panel crescerà da 30 a centinaia di alimenti) e suoi criteri di test su insiemi piccoli.
5. Definizione formale di "Pareto-superiore" per il recommender a 3-4 alimenti e comportamento dichiarato quando nessun miglioramento esiste entro quel limite.

**Stato**: design sostanzialmente convergente su MAR/NAR + LARN/EFSA + ambiente opt-in vincolato; ancora NESSUN codice, NESSUN criterio di accettazione formale — i 5 punti sopra restano da chiudere prima.

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

**Nota sulla ricalibrazione della funzione principale (2026-10-11)**: l'utente ha chiesto di riposizionare il servizio di generazione/ottimizzazione dieta come funzione primaria dell'app (vedi §4.9, proposta aperta, nessuna decisione presa su scope/metodo). Se e quando questa sessione di design produrrà criteri approvati, questa sezione §7 andrà aggiornata di conseguenza — non modificata ora per non anticipare decisioni non prese.

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

   **Risolto parzialmente 2026-10-11 (ceci, fagioli kidney, lenticchie — 3 dei 29 alimenti del gap):** trovata una fonte migliore di tutte quelle elencate sopra — Yadav, Sharma & Yadav (2010), *J Food Sci Technol* 47(1):84-88, DOI 10.1007/s13197-010-0020-6 — perché misura direttamente, con lo stesso metodo di cottura "bollitura convenzionale" del Golden Set, RS per Bengal gram/cece (4.8±0.10% dwb), kidney bean (4.3±0.15% dwb) e lentil (5.0±0.11% dwb) nella stessa Tabella 3, risolvendo in un colpo solo i problemi 1 e 3 sopra elencati. Full-text letto direttamente (non di seconda mano): valori estratti con precisione esatta dal layer di testo del PDF via `pdf.js` caricato a runtime nel browser (non più lettura a occhio di screenshot ingranditi, metodo instabile usato nei primi tentativi di questa stessa sessione). Percentuali di sostanza secca per la conversione a g/100g-come-consumato lette direttamente dall'API ufficiale USDA FDC (non un mirror) per i tre alimenti bolliti del Golden Set: cece 39.79% DM, kidney bean 33.06% DM, lentil 30.36% DM. Valori inseriti (`fix_add_macs_legumi_golden_set.sql`, source `YADAV_SHARMA_YADAV_2010_JFST`, `peer_reviewed_study`, `draft`): **cece 1910, kidney bean 1422, lentil 1518 mg/100g**. Due limiti dichiarati esplicitamente nel file (non silenziati): (a) il testo Materiali e Metodi del paper descrive la formula grezza del saggio come "% sul campione tal quale", mentre la didascalia di Tabella 3 etichetta i valori pubblicati "% dwb" — scelto di fidarsi dell'etichetta della tabella (più specifica, convenzione standard, risultato plausibile vs letteratura), ma se smentito in futuro i valori andrebbero ricalcolati ~2.5x più alti; (b) il paper identifica solo "kidney beans (*Phaseolus vulgaris*)" senza cultivar, mentre il Golden Set usa la cultivar rossa — stesso tipo di caveat già dichiarato per Fabbri 2016 (problema 2 sopra), ma più debole perché "kidney bean" come nome comune denota quasi sempre la cultivar rossa (a differenza di "fagioli neri/borlotti" di Fabbri, nominati esplicitamente come cultivar diversa). Scritto e verificato dal vivo contro il DB (query di lettura indipendente, 3/3 righe presenti coi valori attesi). Problema 2 (cross-cultivar Fabbri) ora superato per questi tre alimenti dalla fonte migliore. **Resta aperto**: problema 4 (inulina/pectina/beta-glucano e gli altri 9 alimenti vegetali del set) — non affrontato oggi, gap dichiarato.

   **Continuato, stessa sessione (2026-10-11), su richiesta esplicita dell'utente ("MACs: altri 9 alimenti"):** altri 4 dei 9 alimenti vegetali risolti, portando il totale complessivo a 7/29 alimenti del gap originale.

   - **Patata bollita con la buccia**: stessa Tabella 3 di Yadav et al. 2010 include anche "Potato" (metodo H1 identico: "tuberi bolliti interi con la buccia"), RS 1.8±0.15% dwb. DM da USDA FDC (fdc_id 170438, acqua 76.98% → DM 23.02%). `food_potato_boiled_in_skin.macs_mg = 414` (`fix_add_macs_potato_golden_set.sql`). Stesso limite dwb/as-is dei legumi; nessun limite di cultivar (specie unica).
   - **Pasta cotta**: nuova fonte, Cervini et al. 2023, *Foods* 12(2):327, DOI 10.3390/foods12020327 — campione di controllo (100% semola, nessun additivo RS), letto per intero dalla pagina HTML di PMC9857741. RS dopo cottura 0.2±0.01% dwb (crollo da 1.9% crudo — la gelatinizzazione in acqua bollente distrugge >90% del poco RS nativo della semola, testo del paper). DM da USDA FDC (fdc_id 169737, acqua 62.13% → DM 37.87%). `food_pasta_enriched_cooked.macs_mg = 76` (`fix_add_macs_pasta_golden_set.sql`) — valore molto più basso di legumi/patata, atteso e coerente con la Discussione del paper.
   - **Carote crude e spinaci crudi**: primo caso con sottoinsieme diverso dei MACs — **pectina**, non amido resistente (entrambi non sono fonti di RS significative). Fonte: Bailoni et al. 2005, *Ital J Anim Sci* 4(1):49-58, DOI 10.4081/ijas.2005.49, letta per intero dal PDF via `pdf.js` (stesso metodo). Pectina totale: carote crude e sbucciate 31.76±1.57 g/kg DM, spinaci 33.48±0.26 g/kg DM. **Scelta metodologica dichiarata**: la sostanza secca usata per la conversione è quella DELLO STESSO CAMPIONE del paper (carote 9.6% DM, spinaci 11.4% DM), non quella USDA FDC — verificato che USDA riporta valori quasi invertiti per questi due alimenti (carote 11.71% DM, spinaci 8.6% DM) — perché mescolare il rapporto pectina/sostanza-secca di un campione con la sostanza secca media di un campione USDA diverso introdurrebbe un errore, non lo eviterebbe. `food_carrots_raw.macs_mg = 305`, `food_spinach_raw.macs_mg = 382` (`fix_add_macs_carote_spinaci_golden_set.sql`). **Copertura limitata al crudo**: `food_carrots_boiled`/`food_spinach_boiled` restano senza macs_mg (nessun retention_factor per questo nutriente — la pectina si altera durante la bollitura, effetto reale non quantificato).

   **Fermato qui, non forzato oltre (stessa sera).** Ricerca tentata anche per kale, broccoli, cavoletti di Bruxelles, arance e mandorle, senza successo a uno standard accettabile:
   - **Arance**: la letteratura reperibile sulla pectina degli agrumi riguarda quasi esclusivamente l'**estrazione industriale dalla buccia** (sottoprodotto, base secca del sottoprodotto essiccato) — non la polpa/spicchi edibili come consumati, e non comparabile senza un'ulteriore catena di assunzioni non verificate.
   - **Kale**: trovato uno studio dedicato (Maciejak & Kosmala 2019, *Biotechnol Food Sci* 83(2):135-141) con fibra solubile (SDF, non pectina specificamente) su 5 produttori diversi — ma i valori variano di oltre 6× tra campioni (0.12–0.74 g/100g peso fresco), troppo instabile per un singolo valore rappresentativo, e SDF non è comunque lo stesso sottoinsieme dichiarato (pectina) usato per carote/spinaci.
   - **Broccoli, cavoletti di Bruxelles, mandorle**: nessuna fonte quantitativa pertinente trovata nel tempo dedicato stasera (la letteratura su broccoli riguarda prevalentemente frazioni di fibra isolate dai gambi come ingrediente, non la composizione dell'ortaggio come consumato).

   **Ripreso e chiuso, stessa sessione (continuazione dopo compattazione, 2026-10-11), su istruzione esplicita dell'utente ("Chiudi prima i gap MACs residui"):** ulteriori tentativi mirati sui 5 alimenti rimasti, tutti senza esito utile — nessuna nuova riga scritta nel DB:
   - **Mandorle**: controllato Gorrepati, Balasubramanian & Chandra 2014, *J Food Sci Technol* 52(7):3965-3976 (review "Plant based butters", PMC4486598), letto per intero (non di seconda mano) perché una fonte secondaria lo citava come possibile dato su fibra delle mandorle. Tabella 5 del paper riporta solo **fibra totale** (13.9 g/100g mandorle crude, 10.5 g/100g burro di mandorle) — nessuna disaggregazione solubile/pectina/beta-glucano, quindi non utilizzabile per lo stesso motivo già stabilito per altre fonti di "fibra totale" in questo progetto (includerebbe cellulosa/lignina non fermentabili). In più, i dati sono su **burro di mandorle** (prodotto trasformato, tostato e macinato con eventuali aggiunte), non sulla mandorla intera/cruda del Golden Set (`food_almonds`) — un secondo motivo di scarto indipendente dal primo.
   - **USDA FDC "Fiber, soluble"** per broccoli (crudo e bollito), mandorle, arance: nuovo tentativo di lettura diretta dall'API ufficiale (stesso endpoint già usato con successo per kale/cavoletti, dove il campo risultava assente/`null`) — bloccato da **rate limiting della chiave DEMO_KEY** (HTTP 429 su tutte le richieste, confermato sia in parallelo sia in sequenza singola). Non è stato quindi possibile nemmeno escludere con certezza l'assenza del campo per questi 4 alimenti, a differenza di kale/cavoletti (dove l'assenza è confirmata, non solo presunta). Richiederebbe una API key FDC personale (non DEMO_KEY) per essere risolto — non ottenuta in questa sessione.

   **Stato DB dopo questa sessione**: 7/29 alimenti del gap originale hanno macs_mg sourced (cece, kidney bean, lentil, patata, pasta, carote crude, spinaci crudi). Restano a 0/assente: kale, broccoli, cavoletti di Bruxelles, arance, mandorle, più gli stati "bolliti" di carote/spinaci — **gap reale, dichiarato, priorità da ristabilire**, non un errore di questa sessione. Tentativi di ricerca per questi 5 alimenti considerati esauriti per ora con gli strumenti/tempo disponibili; la via più promettente rimasta e non percorsa è una chiave API FDC personale (per verificare "Fiber, soluble" su broccoli/mandorle/arance, bloccata qui solo da rate limiting) e l'accesso al dataset UK CoFID/McCance & Widdowson (bloccato qui da un login richiesto) — entrambe richiedono risorse esterne a questo ambiente, non ulteriore ricerca bibliografica.

   **Risolto in gran parte, stessa sessione (continuazione dopo compattazione, 2026-10-11):** l'utente ha scaricato personalmente il file CoFID 2021 e lo ha fornito in chat — confermando che il blocco di accesso segnalato sopra era solo di rete sandboxata di questo ambiente, non un vero login richiesto dal dataset. La chiave API FDC personale offerta come alternativa non si è resa necessaria: nel frattempo è stata trovata una fonte migliore (fibra solubile diretta, non NSP) per 2 dei 5 alimenti. Risultato: 6 delle 8 righe mancanti (broccoli crudo, arance crude, kale, cavoletti crudi e bolliti, mandorle) ora hanno macs_mg sourced; resta aperto solo `food_broccoli_boiled`.

   - **Broccoli crudo e arance crude — quarto sottoinsieme MACs, "fibra solubile" (AOAC 991.43)**: trovata una fonte primaria diretta, Li, Andrews & Pehrsson (2002), *J Food Compos Anal* 15(6):715-723, DOI 10.1006/jfca.2002.1096 — 70 alimenti ad alto consumo USA, fibra solubile/insolubile misurata direttamente (non derivata), valori già "as eaten" (nessuna conversione sostanza secca necessaria). Broccoli crudo: fibra solubile 0.44 g/100g → `food_broccoli_raw.macs_mg = 440`. Arance (Navel) crude: fibra solubile 1.37 g/100g → `food_oranges_raw.macs_mg = 1370` (limite dichiarato: il paper usa specificamente la cultivar Navel, il food_id del Golden Set è mappato su "all commercial varieties" — stesso tipo di caveat già accettato per il fagiolo kidney). `food_broccoli_boiled` **resta senza macs_mg**: il paper ha solo un valore "microwaved" (1.85 g/100g), un metodo di cottura diverso dal "bollito e scolato" del Golden Set (la bollitura lisciva la fibra solubile nell'acqua in modo diverso dalla cottura a microonde) — usarlo avrebbe introdotto un bias non quantificabile, gap dichiarato non forzato. Script: `fix_add_macs_broccoli_orange_golden_set.sql`, eseguito e verificato dal vivo contro il DB.

   - **Kale, cavoletti di Bruxelles (crudi e bolliti), mandorle — quinto sottoinsieme MACs, "NSP" (Non-Starch Polysaccharide, metodo Englyst), dichiarato esplicitamente PIÙ GREZZO**: per questi 4 alimenti non è stata trovata fibra solubile/pectina specifica nemmeno nel dataset CoFID (fornito dall'utente dal proprio browser, scheda "1.3 Proximates") — solo NSP (esclude la lignina ma include cellulosa, in gran parte non fermentabile dal microbiota) o fibra totale AOAC. **Decisione esplicita dell'utente** (chat, 2026-10-11): accettare NSP come terzo/quinto sottoinsieme, più grezzo di pectina/fibra-solubile/amido-resistente usati altrove, SOLO dopo aver verificato che non esiste un dato che fraziona NSP in cellulosa/polisaccaridi-non-cellulosici per questi alimenti specifici (cercato: trovato solo per il cavolo cappuccio, un ortaggio diverso non nel Golden Set, e solo come valore derivato NDF-ADF, non una misura diretta — fonte scartata). Valori NSP (g/100g come consumato, CoFID 2021, Public Health England): kale crudo 3.1 → `food_kale_raw.macs_mg = 3100`; cavoletti crudi 4.1 → `food_brussels_sprouts_raw.macs_mg = 4100`; cavoletti bolliti 3.1 → `food_brussels_sprouts_boiled.macs_mg = 3100`; mandorle 7.4 → `food_almonds.macs_mg = 7400` (limite dichiarato aggiuntivo: per "Almonds, whole kernels", la voce CoFID che corrisponde esattamente al food_id, NSP è "N"/non quantificato — usato invece il valore di "Almonds, flaked and ground", stesso dataset, sull'assunzione dichiarata che la macinazione meccanica non alteri la composizione in polisaccaridi; controllo di plausibilità indipendente: la fibra totale AOAC di CoFID per le mandorle intere, 12.5 g/100g, coincide esattamente col valore fiber_g già presente nel Golden Set da fonte USDA FDC indipendente). Script: `fix_add_macs_nsp_kale_brussels_almonds_golden_set.sql`, eseguito e verificato dal vivo contro il DB (trasferimento del contenuto SQL nel browser verificato byte-per-byte via SHA-256 prima dell'esecuzione).

   **Stato DB finale di questa sessione**: 13/29 alimenti del gap originale hanno macs_mg sourced — cece, kidney bean, lentil, patata, pasta, carote crude, spinaci crudi (amido resistente/pectina), broccoli crudo, arance crude (fibra solubile AOAC), kale crudo, cavoletti crudi, cavoletti bolliti, mandorle (NSP, sottoinsieme dichiarato più grezzo). **Gap residuo, dichiarato**: `food_broccoli_boiled` (nessuna fonte col metodo di cottura corretto trovata; riga `draft`/non promossa, usata solo come base di calcolo del fattore di ritenzione — impatto pratico basso) e gli stati "bolliti" di carote/spinaci (pectina non quantificata dopo cottura). Da qui in avanti, qualunque confronto fra alimenti su `macs_mg` deve tenere conto che il campo non è uno standard unico: tre sottoinsiemi diversi di rigore decrescente (amido resistente/pectina/fibra-solubile-AOAC vs NSP) convivono nella stessa colonna, distinti solo dal `source_id` — non un errore, ma una caratteristica da ricordare in qualsiasi analisi comparativa o visualizzazione futura di questo campo.

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

    **Scritto ed ESEGUITO sul DB reale (2026-10-11, sul PC dell'utente)** — questo sandbox non ha accesso di rete diretto né a Supabase né a `api.nal.usda.gov` (confermato via `curl`, vedi commit `dd8ca8a`), quindi lo script è stato collaudato dall'utente in prima persona.

    **Risultato del primo run reale**: dry-run iniziale → bug trovato e corretto nella stessa sessione (vedi commit `92c8497`: `normalizeFdcUnit` faceva `.toUpperCase()` prima del confronto unità, e il segno di micro "µ" in JavaScript si maiuscolizza nella lettera greca Mu, non resta "µ" — tutti i nutrienti in µg, 40/249 righe, finivano quindi `UNIT_MISMATCH` anche con valore numerico corretto). Dopo il fix: **249/249 MATCH, 0 MISMATCH, 0 alimenti irraggiungibili** — ogni singolo valore USDA_FDC trascritto a mano nelle sessioni precedenti ha combaciato cifra per cifra con un ri-scaricamento live da FDC. Rilanciato con `--apply`: **249 righe `nutrient_values` e 13 `foods_raw` promossi a `verified`** (comprese le basi crude interne per i fattori di ritenzione e alcuni cotti rimasti fuori dalla promozione manuale del 2026-10-09: `food_broccoli_boiled`, `food_spinach_boiled`, `food_carrots_boiled`, `food_brussels_sprouts_boiled`, `food_chickpeas_raw`, `food_beef_liver_raw`, `food_beef_ground_raw`, `food_egg_raw`, `food_salmon_raw`, `food_pasta_enriched_dry`, `food_potato_raw`, `food_kidney_beans_raw`, `food_lentils_raw`).

    Criterio esplicito approvato ("Sì, procedi a scrivere lo script"), a **tre livelli per `source_type`/`source_id`**, coerente col precedente umano di `golden_set_promote_verified.sql`:
    - `source_id = 'USDA_FDC'` → **automatizzato qui**: `scripts/verify_golden_set_batch.ts` ri-scarica il record FDC via `foods_raw.fdc_id` (prerequisito aggiunto in `dd8ca8a`) e confronta meccanicamente ogni nutriente mappato in `lib/fdc/nutrientMapping.ts` (17 `nutrient_code`, mappati ai "nutrient number" ufficiali USDA — calcio=301, ferro=303, ecc. — metadati di catalogo pubblici, non un dato per-alimento, quindi non in conflitto con "zero dati inventati"). Promozione a `verified` **riga per riga**, solo se `|DB - FDC| <= tolleranza dichiarata` (max tra 0.05 assoluto e 0.5% relativo, per assorbire solo l'arrotondamento già presente nei dati trascritti, non vere discrepanze). Se anche un solo componente di un nutriente composito (es. `other_provitamin_a_carotenoids_mcg` = alfa-carotene + beta-criptoxantina) manca dalla risposta FDC, il nutriente NON viene promosso (mai assunto zero per un valore assente — FDC spesso omette le tracce invece di riportare 0).
    - `source_type = 'official_database'` ma `source_id != 'USDA_FDC'` (es. `COFID_2021_PHE`) → fuori scope per questo script (nessuna API live, solo il file xlsx caricato una volta) — deferred esplicitamente, non ignorato: andrebbe confrontato contro una copia locale del file, non una fetch.
    - `source_type = 'peer_reviewed_study'` → mai automatizzabile: richiede il giudizio umano di dominio già usato il 2026-10-09 (checklist fissa, non un re-fetch).

    Lo script (default **dry-run**, richiede `--apply` esplicito per scrivere) non promuove mai in base a "non trovato"/"non mappato"/"irraggiungibile" — solo un MATCH esplicito promuove una riga; `foods_raw` viene promossa solo se TUTTE le sue righe USDA_FDC sono MATCH. Logica pura (mappatura nutrienti, tolleranza, gestione componenti mancanti) testata in questo sandbox senza rete in `tests/fdcVerification.test.ts` (14/14 PASS) — lo script stesso (fetch reali) no.

    **Prerequisito ancora da fare dall'utente, non confermato fatto**: chiave personale `USDA_FDC_API_KEY` in `.env.local` (gratuita, fdc.nal.usda.gov/api-key-signup.html — la `DEMO_KEY` va in 429 troppo presto per un batch). Comando: `npm run verify:golden-set` (dry-run) poi `npm run verify:golden-set -- --apply`.
16. Espandere la copertura alimenti usando quel processo, dando priorità a ciò che serve davvero ai primi utenti (non ai ~1.100 alimenti tutti insieme).

    **Obiettivo dichiarato dall'utente (2026-10-11)**: l'app non va lanciata finché non copre almeno il panel alimentare italiano comune (alimenti base + processati), con l'ambizione successiva di coprire anche mercato europeo e USA. Scala enorme rispetto ai 30 alimenti attuali — gestita come **coda ampliabile nel tempo**, non come lista chiusa da esaurire in un colpo. Un task pianificato (lato utente, ogni ~3 ore durante il giorno, vedi §9.x sotto) lavora la coda un alimento alla volta, commit+push automatico, fermandosi e segnalando (mai indovinando) quando un alimento non ha un buon match FDC o non rientra nelle euristiche di categorizzazione già stabilite per i 30 alimenti esistenti.

    **Limite dichiarato**: FDC è una banca dati USA — per prodotti tipicamente italiani (formaggi, salumi, piatti tradizionali) spesso manca un corrispettivo preciso. Usato comunque come fonte primaria per ora (unica pipeline meccanica collaudata); l'integrazione di CREA (banca dati ufficiale italiana) come fonte parallela resta un lavoro futuro non ancora iniziato.

    **Coda — primo lotto (2026-10-11), NON esaustivo, da ampliare**. Un alimento alla volta, nell'ordine; ogni riga va aggiornata dal task con l'esito (✅ aggiunto come draft + food_id, oppure ⚠ + motivo se richiede revisione umana) e la data:

    - Cereali/pane/pasta: pane comune, pane integrale, riso bianco, riso integrale, polenta (farina di mais), orzo perlato, farro
    - Legumi: fave, piselli, fagioli borlotti, fagioli cannellini
    - Verdura: zucchine, melanzane, pomodori, cipolle, aglio, peperoni, lattuga, zucca, finocchi, funghi champignon
    - Frutta: mele, banane, pere, uva, limoni, fragole, pesche, kiwi, fichi
    - Carne: petto di pollo, coscia di pollo, carne di maiale (lonza), tacchino, prosciutto cotto, prosciutto crudo, bresaola
    - Pesce: tonno (fresco e in scatola sott'olio), merluzzo/nasello, acciughe, cozze, vongole, gamberi
    - Latticini/formaggi: parmigiano reggiano, mozzarella, ricotta, yogurt bianco intero, yogurt greco
    - Grassi/condimenti: olio extravergine d'oliva, burro
    - Alimenti processati comuni: pane confezionato in cassetta, biscotti secchi, fette biscottate, pasta di semola comune (non arricchita — diversa da `food_pasta_enriched_cooked` già presente, che è USA-style enriched), cioccolato fondente, miele, zucchero bianco

16b. **Piatti tradizionali/compositi** (pasta al pomodoro, minestrone, parmigiana, ecc.) — richiesti dall'utente il 2026-10-11 come parte della copertura del panel italiano. **Design approvato e implementato (schema + motore + test, vedi §4.8)**, non ancora eseguito sul DB reale né wired in UI. Resta 👤 (non delegabile al task diurno automatico) finché: (a) qualcuno esegue `add_dish_templates.sql` sul DB reale, (b) si decide la fonte delle grammature standard per porzione, (c) esiste il wiring UI in `app/page.tsx`. Una volta chiusi questi tre punti, popolare la coda di piatti (quali, con quali componenti) può tornare un lavoro mediamente meccanico.

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

### 9.1 Scaletta prioritaria sintetizzata, dal punto attuale al lancio (sintesi richiesta dall'utente, 2026-10-11)

Stessi punti di sopra, solo riordinati in un'unica lista di priorità verso il lancio IT→EU→USA, con accanto chi può eseguirli: 🤖 = lavoro meccanico/verificabile, adatto al task pianificato autonomo esistente (o a uno analogo, una volta scoperto); 👤 = richiede una sessione con l'utente prima di scrivere codice (nuova funzionalità, nuova metodologia, o un'azione che solo l'utente può fare — Regola 5).

0. 👤 **Motore di generazione dieta + recommender "Pareto-superiore" (§4.9)** — ricalibrazione della funzione principale richiesta dall'utente il 2026-10-11. Sessione di design dedicata appena avviata (domande poste in chat); nessun criterio di accettazione ancora approvato. Dipende comunque dal punto 1 sotto (più alimenti = più margine per l'ottimizzatore), quindi non lo sostituisce come priorità immediata.
1. 🤖 **Fase 4.16 — Espansione panel alimenti italiani** (in corso, task diurno attivo).
2. 👤 **Fase 4.16b — Piatti compositi/tradizionali**: design approvato e implementato (§4.8); resta da eseguire lo schema sul DB reale, decidere la fonte delle grammature standard, e fare il wiring UI — poi la coda di piatti diventa lavorabile 🤖.
3. 👤 **Fase 3.13 (limite aperto)** — scansionare un prodotto reale con l'app e confrontarlo con l'etichetta stampata: azione fisica sul telefono dell'utente, non delegabile.
4. 👤 **Fase 3.14 — Meal Builder, rifinitura generale**: serve prima capire cosa non va bene a livello di UX/prodotto (sessione con l'utente), poi l'implementazione puntuale può tornare 🤖/👤 a seconda della portata.
5. 👤 **Fase 2.11 — Collegare Vercel**: richiede l'account Vercel dell'utente (login, scelta dominio) — preparo io i file di configurazione, ma il collegamento stesso è un'azione umana.
6. 👤 **Fase 1.8 — Controllo periodico più approfondito sui 30 alimenti promossi**: va prima definito un criterio/checklist esplicito (oggi non esiste) — una volta approvato, l'esecuzione ricorrente diventa 🤖.
7. 👤 **Integrazione CREA** (dati italiani ufficiali, oggi solo dichiarata come gap) — nuova fonte dati, nuova pipeline, serve una sessione di design come per FDC.
8. 👤 **Fase 5 (17-21)**: pipeline evidenze PubMed, AI Recipe Co-Pilot, integratori/crononutrizione, mappa popolazione, wearable — post-MVP, ciascuno da scoprire quando ci si arriva, nessuno ancora scoping-ato.
9. **Fase 6 (22-23)**: modulo clinico, CGM — intenzionalmente fuori da questa lista, cancello legale/regolatorio non ancora passato (§1.1, §7).

**Nota sul "fare tutto in autonomia" (richiesta dell'utente, 2026-10-11)**: il task diurno pianificato resta scoped al punto 1 (e, una volta approvati i rispettivi design, ai punti che diventano 🤖 sopra) perché quel lavoro è meccanico e ogni singolo output è verificabile a posteriori senza ambiguità (un alimento FDC esiste o non esiste, un valore combacia o non combacia). I punti 👤 richiedono invece un giudizio che la Regola 5 riserva esplicitamente a una sessione con criteri approvati PRIMA del codice, o un'azione che solo l'utente può fisicamente fare (login Vercel, scansione di un prodotto reale). Non è una decisione contro l'autonomia in sé — è la stessa distinzione già in vigore stasera tra "il task diurno scrive ed esegue" e "io propongo, tu approvi, poi si scrive".

---

## 10. Istruzioni per l'agente di sviluppo AI (Cursor / Claude Code)

1. Inizializzare Next.js + Tailwind; collegare Supabase (regione UE).
2. Applicare le migrazioni SQL del §5 **prima** di importare qualunque dato.
3. Importare nel Golden Set **solo** righe con `verification_status = 'verified'`.
4. Nessun engine va scritto/modificato senza che i test di accettazione corrispondenti esistano già e passino.
5. Qualunque numero che l'agente sarebbe tentato di "stimare per completare" va invece lasciato `NULL` con `verification_status = 'draft'` e un commento `// TODO: fonte mancante`. Non indovinare mai un coefficiente per far quadrare la UI.
