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
- Database: solo il **Golden Set verificato** (20 alimenti, con fonti reali per ogni campo prima di essere marcati `verified`) — non i ~1.100 alimenti, finché non esiste un processo di verifica scalabile (vedi roadmap §9).
- Scanner barcode via Open Food Facts (consultazione live, non importazione nel DB proprietario).

### Fuori (rimandato, non cancellato)
- OCR referti, profili clinici, prescrizioni — **bloccato** finché non c'è una valutazione legale (§1.1).
- Integrazione wearable (Apple HealthKit/Health Connect) — richiede app nativa, non PWA.
- Mappa globale di popolazione (FAOSTAT/GDD).
- Database integratori e crononutrizione.
- AI Recipe Co-Pilot conversazionale.
- Copertura completa dei ~1.100 alimenti italiani.

---

## 8. Inventario degli asset esistenti (stato a oggi)

| Asset | Stato | Azione |
|---|---|---|
| `master_retention_factors_crea_italia_v2.xlsx` | 125 righe di retention factor (34 matrici × metodo di cottura) + 35 gruppi-alimento con **conteggi stimati**, nessuna con `source_id` verificabile | Da ri-sorgere riga per riga secondo §2 Regola 1; l'esempio §4.1 è il primo caso |
| `seed_golden_set.sql` | 20 alimenti con profilo nutrizionale completo, nessun valore ha una fonte | Diventa il Golden Set MVP **solo dopo** verifica campo per campo |
| `computationalNutritionEngine.ts` | Formule biochimicamente plausibili (Hallberg, Miller, Michaelis-Menten) ma senza distinzione fonte/range; restituisce numeri nudi | Da riscrivere secondo il contratto §6 — **prossimo step**, previa approvazione dei test |
| `microbiotaEngine.ts` | Stessa situazione | Da riscrivere dopo il motore nutrizionale |
| `lcaLogisticsEngine.ts` | Stessa situazione; i coefficienti LCA per hub/trasporto sono plausibili ma non testuali-sourced (es. 1.25 x tortuosità stradale, 0.140 kg CO2/km TIR) | Da riscrivere; coefficienti di trasporto verificabili via Agribalyse/INEMAR |
| `clinicalOntologyEngine.ts` | Fuori perimetro (§1.1) | **Non viene portato nella nuova architettura.** L'idea di archetipi non-clinici (es. "sedentario", "endurance") potrà eventualmente rientrare come personalizzazione generica di attività fisica, senza patologie né prescrizioni — da valutare in una fase successiva, non ora |

---

## 9. Roadmap

1. **Schema & provenienza** (questa settimana): migrazioni SQL per le tabelle del §5.
2. **Un motore alla volta, test-first:** per ciascuno dei tre motori ammessi, Claude propone criteri di accettazione e test; solo dopo approvazione viene riscritto secondo il contratto §6. Ordine proposto: nutrizionale → microbiota → LCA.
3. **Golden Set verificato:** 20 alimenti, ogni campo ricondotto a una fonte reale (USDA FoodData Central dove disponibile, altrimenti segnalato `draft`).
4. **Prototipo UI** sui 20 alimenti verificati, incluso il pannello "Perché questo numero?".
5. **Espansione dati** oltre i 20 alimenti solo dopo che il processo di verifica a batch è collaudato (non prima).

---

## 10. Istruzioni per l'agente di sviluppo AI (Cursor / Claude Code)

1. Inizializzare Next.js + Tailwind; collegare Supabase (regione UE).
2. Applicare le migrazioni SQL del §5 **prima** di importare qualunque dato.
3. Importare nel Golden Set **solo** righe con `verification_status = 'verified'`.
4. Nessun engine va scritto/modificato senza che i test di accettazione corrispondenti esistano già e passino.
5. Qualunque numero che l'agente sarebbe tentato di "stimare per completare" va invece lasciato `NULL` con `verification_status = 'draft'` e un commento `// TODO: fonte mancante`. Non indovinare mai un coefficiente per far quadrare la UI.
