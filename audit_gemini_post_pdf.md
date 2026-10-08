# Audit delle risposte di Gemini (post-PDF)

Ho letto tutto il documento (55 scambi, i tre motori riscritti, lo schema SQL, il seed, l'attivazione di Supabase e il debug in VS Code). Verdetto d'insieme: l'architettura e il processo che Gemini ha seguito sono **concettualmente corretti e in linea col PRD** — contratto `SourcedValue`, schema con tabella `sources`, RLS su Supabase, regione UE. Ma ho trovato un problema urgente da risolvere subito, e un pattern sistemico che riguarda *tutti e tre* i motori: valori dichiarati `"verified"` e agganciati a citazioni vere, ma senza che nessuno li abbia effettivamente ricontrollati in quella conversazione. Questo è esattamente ciò che la Regola 1 del PRD doveva impedire.

---

## 0. 🚨 Prima di tutto: controlla subito questo

Verso la fine del documento, Gemini perde il filo e genera codice React che chiama `computeEubioticScore(...)` — che è la funzione del **vecchio** `microbiotaEngine.ts` v1.0 (quello con `EubioticScoreOutput`, `effectiveMacs`, `past7DaysPlantEntries` — il motore che avevamo scartato all'inizio di questa conversazione). Non `calculateMicrobiotaImpactScore(...)`, che è la funzione del **nuovo** motore a contratto `SourcedValue` che Gemini stesso aveva scritto poche decine di messaggi prima in questo stesso documento.

Gemini lo scopre solo perché Next.js tira un errore "export not found", e a quel punto si adatta al file che *esiste davvero sul tuo PC* invece di quello di cui avevate discusso. Questo significa una di due cose:
- il nuovo `microbiotaEngine.ts` (quello con MACs/polifenoli/famiglie botaniche) non è mai stato effettivamente incollato/salvato nel file, oppure
- è stato sovrascritto per sbaglio in un passaggio successivo.

**Prima di leggere il resto di questo audit**, apri `lib/engine/microbiotaEngine.ts` su VS Code e guarda quale dei due motori contiene davvero. Se è ancora il vecchio `computeEubioticScore`, significa che l'app sta girando su un motore che pensavi fosse stato sostituito — e lo stesso dubbio va esteso per sicurezza agli altri due file (`computationalNutritionEngine.ts`, `lcaLogisticsEngine.ts`). Dimmi cosa trovi, così ripartiamo da uno stato noto invece che da quello che la chat *dice* di aver scritto.

Questo è anche l'esempio più concreto del motivo per cui più sotto (§5) ti propongo di cambiare come lavori col codice.

---

## 1. Il pattern sistemico: citazione vera, numero non ricontrollato

Questo è più importante di ogni singolo bug, perché attraversa tutti e tre i motori e il seed SQL.

**Caso dimostrato, non ipotetico — i MACs di lenticchie e mela:**
```sql
('food_lentils_raw', 'macs_mg', 8000.0, 7000.0, 9000.0, 'SONNENBURG_2016'); -- Stimato per l'impatto microbiota
('food_apple_raw', 'macs_mg', 2400.0, 2100.0, 2700.0, 'SONNENBURG_2016'),
```
Ho verificato: Sonnenburg et al. 2016, *Nature* 529:212-5, DOI 10.1038/nature16504 è un paper reale — uno studio su topi gnotobiotici con microbiota umano trapiantato, sulla perdita di diversità batterica su più generazioni con dieta povera di MACs. **Non contiene nessun dato sul contenuto in mg di MACs di lenticchie o mele.** Il commento SQL stesso dice "Stimato" — cioè è una stima inventata su due piedi, a cui però è stato attaccato un range di confidenza (7000–9000, 2100–2700) che implica una precisione che non esiste, e una citazione reale che non c'entra nulla con quel numero specifico. Questo viola contemporaneamente la Regola 1 (zero dati inventati) e la Regola 2 (range solo se la fonte lo riporta) del PRD.

**Caso probabile — il calcio degli spinaci:**
```sql
(USDA FDC ID: 168462)
('food_spinach_raw', 'calcium_mg', 99.0, 89.1, 108.9, 'USDA_FDC_SR'),
```
Ho controllato l'ID 168462 su FoodData Central: corrisponde davvero a "Spinach, raw" — quindi l'ID non è inventato. Ma il valore di calcio che mostra oggi quella voce è **~66.6 mg/100g**, non 99.0 mg. Il "99 mg" è quasi certamente il vecchissimo valore USDA SR Legacy che compare in praticamente ogni libro di nutrizione stampato negli ultimi 30 anni — probabilmente Gemini lo ricorda "a memoria" dai dati di addestramento, non dall'ID specifico che ha citato. È la prova pratica del motivo per cui nel PRD insistiamo che `retrieved_date` deve essere la data in cui qualcuno (io o te) ha davvero controllato il dato in quel momento, non la data in cui è stata scritta la riga SQL.

**Perché te lo dico con questo livello di dettaglio:** non ho ricontrollato ogni singolo numero del documento (ci vorrebbe un'altra giornata intera), ma questi due casi bastano a stabilire il pattern. Tratta come `draft`, non `verified`, finché non li ricontrolliamo uno per uno: i coefficienti LCA nel seed (`0.95` kg CO₂/kg per le verdure a foglia alto-ossalato, `27.50` per il manzo, `1.60` per i legumi, il moltiplicatore `4x` per le serre fuori stagione, l'`1.9 kg CO₂/kg` DEFRA per il trasporto aereo) e le soglie nel motore microbiota (`Km=5g` per i MACs, `15g`/`45g` di soglia di tolleranza). Ho verificato che Grabitske & Slavin 2008 e McDonald et al. 2018 (American Gut Project) sono citazioni reali e pertinenti nell'area giusta — ma non ho controllato se i numeri esatti agganciati a loro (15g, soglia di 30 specie) sono presi dal testo o anche questi "a memoria".

---

## 2. Errori tecnico-scientifici nei tre motori

### `computationalNutritionEngine.ts`

**Cosa ha fatto bene:** l'inibizione da fitati/polifenoli per il ferro ora usa il rapporto molare invece dei mg assoluti — è esattamente la correzione che avevo chiesto. La vera equazione quadratica di Miller per lo zinco è implementata correttamente, con i parametri reali del paper. Buon lavoro su questi due punti.

**Zinco:**
- `confidenceLow/High: ±15%` (giornaliero) e `±30%` (pasto) sono commentati come "Propagazione IC95% dei parametri" — ma non lo sono. I veri IC95% di Miller 2007 sono enormi e asimmetrici (KR e KP hanno intervalli che attraversano lo zero), quindi una propagazione vera darebbe una forbice molto più ampia e non simmetrica. Il commento dichiara un rigore che il codice non ha.
- Sia la versione giornaliera che quella per pasto sono marcate `"verified"`. Per il pasto, che è un uso esplicitamente fuori dal dominio di validazione del modello (come avevamo concordato), questo dovrebbe essere `"draft"`.

**Calcio:**
- Qualsiasi alimento con `matrix_category_calcium: "medium_oxalate"` (o un valore mancante) finisce nel ramo `else` e riceve lo `0.32` del latte — ma quel numero è specifico del latte (Heaney & Weaver 1990), non una categoria "ossalato medio" generica. Un legume o un cereale (dove l'inibizione è da fitati, non ossalati) marcato "medium" oggi eredita silenziosamente il numero del latte senza che nessuna fonte lo giustifichi per quel caso.
- Il margine `±10%` è più stretto della vera incertezza riportata nello studio: Heaney & Weaver 1990 riportano il kale al 40.9% **± 10.1 punti percentuali** (circa ±25% relativo), non ±10%.

**Ferro:**
- La base del 5% per il ferro non-eme non viene da Hallberg & Hulthén 2000 nonostante sia citata come tale (`HALLBERG_HULTHEN_2000_SCAND`). Ho recuperato il paper: il loro valore di riferimento (pane di farina bianca fermentata, senza fitati) è **22.1% ± 0.18%**, calibrato su un assorbimento di riferimento del 40%. Il 5% sembra essere rimasto tale e quale dal codice v1.0 originale (quello che avevamo già bocciato), solo con l'etichetta della fonte cambiata.
- La curva di saturazione per la vitamina C (`vitC/(vitC+30)`) è plausibile come forma, ma i parametri non vengono dall'equazione di Hallberg (che ha una forma diversa, con un termine di interazione log(AA+1) con i fitati).
- Importante e non implementato: Hallberg riporta esplicitamente che il calcio inibisce **anche l'assorbimento del ferro eme**, non solo quello non-eme. Né la v1.0 né questa versione lo modellano — il ferro eme resta un 25% fisso, sempre.
- Dato tutto questo, marcarlo `"verified"` non è giustificato: dovrebbe restare `"draft"` finché non recuperiamo il testo completo dell'equazione originale (AJCN 2000;71:1147-60, non il solo articolo di rassegna che ho trovato finora — vedi la mia risposta precedente in questa conversazione).

### `microbiotaEngine.ts`
- Oltre al problema del §0, la curva di Michaelis-Menten per i MACs (`Km=5g`, peso 70/100) è citata a Sonnenburg 2016, che — come spiegato al §1 — non contiene questo dato. È una curva plausibile nella forma, ma i parametri numerici sono inventati.
- Buona l'idea del moltiplicatore di diversità botanica e dell'hard cap a 15g/pasto come principio; verifica solo che i numeri esatti (15g, logaritmo in base 10, +25% massimo) vengano davvero da Grabitske & Slavin 2008 e non siano anch'essi "a memoria".

### `lcaLogisticsEngine.ts`
- Il punto migliore di tutto il documento: la gestione dei dati idrici mancanti. Se manca il coefficiente AWARE per un alimento, il motore non inventa un numero — mette `confidenceLow/High: null` e `verificationStatus: "draft"` per *l'intero pasto*. Questo è esattamente il comportamento difensivo richiesto dal PRD. Tienilo come modello per gli altri motori.
- Stesso dubbio del §1 per i coefficienti del seed (`0.95`, `27.50`, `1.60` kg CO₂/kg, il moltiplicatore serra `4x`, il fattore DEFRA `1.9 kg CO₂/kg` per il trasporto aereo): marcati `"verified"` e attribuiti ad Agribalyse 3.1.1/DEFRA, ma senza che io veda evidenza che siano stati effettivamente cercati nella conversazione, invece che richiamati dalla memoria del modello. Da ricontrollare uno per uno prima di fidarsene.

---

## 3. Database (schema.sql / RLS)

Lo schema segue fedelmente il PRD — tabella `sources` obbligatoria, `nutrient_values` una riga per nutriente invece di colonne piatte, `verification_status` e `evidence_level` ovunque. Buono.

Due cose da sistemare:
1. **RLS: mancano le policy di lettura su due tabelle.** Nel documento vedo `CREATE POLICY ... FOR SELECT` solo per `foods_raw`, `nutrient_values`, `sources`, `food_matrices_master`. Mancano `retention_factors` e `scientific_evidence_library`. Finché restano senza policy, qualunque query dell'app su quelle due tabelle tornerà vuota in silenzio (non un errore — proprio questo la rende insidiosa da scoprire).
2. Coerente con §1: lo stato `"verified"` nei dati del Golden Set è prematuro per diversi valori. Non è un problema di RLS, è un problema di aver etichettato come controllato qualcosa che non lo è stato.

Buone pratiche confermate, nessuna correzione necessaria: regione Frankfurt (UE) per Supabase, uso della chiave `anon` (non `service_role`) lato client, RLS attivata di default sulle tabelle.

---

## 4. Supabase: tienilo, non serve cambiare

Lo schema è relazionale con molte foreign key, CHECK constraint e colonne generate (`range_available`) — PostgreSQL è la scelta tecnicamente giusta, non ci sono dubbi su questo. Rispetto alle alternative:
- **Firebase/Firestore**: NoSQL, si romperebbe contro un modello con join multipli tra `sources`, `nutrient_values`, `scientific_evidence_library` — sbagliato per questo schema.
- **Postgres "nudo" (Neon, Railway) + API custom**: stesso database, ma dovresti scrivere e mantenere tu l'intero layer API che Supabase ti dà gratis con RLS integrata — più lavoro, zero vantaggi per un progetto solo.
- **Supabase** resta la scelta più adatta per un biologo che programma da solo: editor SQL via browser, API REST automatica, RLS nativa, piano gratuito generoso, regione UE disponibile. L'unica cosa da fare è completare le policy mancanti (§3).

## 5. VS Code: il problema non è l'editor, è il metodo

Anche qui, nessun errore nei comandi che Gemini ti ha dato — `npx create-next-app@latest .`, l'installazione di Node.js, lo sblocco di PowerShell (`Set-ExecutionPolicy`), sono tutti tecnicamente corretti. Il problema è **il flusso di lavoro**: copiare blocchi di codice da una finestra di chat, incollarli a mano in VS Code, e sperare che i due resti sincronizzati. In questo stesso documento quel metodo ha causato, in ordine: un file salvato come `microbiotaEngine.ts.ts`, un `PRD_v2.md` rimasto vuoto alla riga 1, cartelle da riorganizzare a mano più volte, un file scaricato col nome automatico `gemini-code-1791226358930.ts`, e — il problema più serio — il mix-up del §0, dove nessuno dei due (tu o Gemini) aveva più la certezza di quale codice fosse realmente salvato sul disco.

Non è un problema di competenza tua: è strutturale a "due chat separate + copia-incolla manuale", perché **nessuno dei due lati ha mai una vista reale di cosa c'è davvero nel file**, solo di cosa *pensa* ci sia.

La correzione pratica: uno strumento agentico (Claude Code, o Cursor) che lavora *dentro* VS Code/terminale e legge/scrive i file lui stesso, invece di dettarteli a parole. Non sostituisce VS Code come editor — ci gira dentro — ma elimina la categoria di errore che hai visto qui, perché prima di scrivere "il file contiene X" lo verifica davvero. Dato che hai tempo e vuoi che l'app sia fatta bene, è il cambiamento con il rapporto costo/beneficio più alto tra tutti quelli di questo audit.

## 6. I "prompt" (le istruzioni passo-passo)

Non ho trovato, in questo documento, dei veri e propri meta-prompt pensati per essere incollati in Cursor/Claude Code — sono tutte istruzioni dirette a te per operazioni manuali su VS Code/Supabase (creare cartelle, rinominare file, cliccare bottoni). Tecnicamente sono quasi tutte corrette (l'unica piccola imprecisione è aver dato per scontato, in un punto, l'errore sbagliato prima di rileggere lo screenshot — cosa che Gemini stesso ha riconosciuto). Il problema non è nei singoli prompt, è nel fatto che l'intero processo genera lavoro manuale ripetitivo dove ogni passaggio è un'occasione per un disallineamento — coerente con quanto detto al §5.

---

## 7. Piano d'azione, in ordine

1. **Subito:** apri `lib/engine/microbiotaEngine.ts` e dimmi quale funzione contiene davvero (`computeEubioticScore` o `calculateMicrobiotaImpactScore`). Controlla anche gli altri due motori per sicurezza. Non si procede oltre finché non sappiamo con certezza cosa è realmente salvato.
2. Aggiungi le due policy RLS mancanti su `retention_factors` e `scientific_evidence_library`.
3. Nel seed, declassa a `draft` i MACs di lenticchie/mela (sono stime dichiarate, non dati) e qualunque coefficiente LCA/soglia microbiota che non sia stato verificato in questa sessione — io posso aiutarti a ricontrollarli uno per uno, come ho già fatto per ferro/zinco/calcio.
4. Decidi se adottare un flusso agentico (§5) prima di continuare — ti farebbe risparmiare esattamente il tipo di tempo che avete perso su estensioni doppie e cartelle da rifare.
5. Io ho già pronta, da questa stessa conversazione, un'analisi sourced e i criteri di test per ferro/zinco/calcio con le equazioni reali (Miller 2007 per lo zinco, i tre punti Heaney & Weaver per il calcio). Appena mi confermi i punti 1-4, scrivo la versione definitiva di `computationalNutritionEngine.ts` — quella vera, non quella di Gemini — e poi passiamo a sistemare `microbiotaEngine.ts` e `lcaLogisticsEngine.ts` con lo stesso rigore.
