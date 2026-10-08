# Criteri di accettazione e piano di test
## `computationalNutritionEngine.ts` — Ferro, Zinco, Calcio

**Stato:** proposta per approvazione, **nessun codice di produzione è ancora stato scritto**.
Per ciascun nutriente: (1) analisi sourced del codice v1.0 che hai allegato, (2) criteri di accettazione secondo il contratto §6 del PRD v2.0, (3) test su tre livelli.

### I tre livelli di test (si applicano a tutti e tre i nutrienti)

- **Livello A — Difensivo/contratto:** comportamento del codice su input limite (zero, mancanti, negativi). Valore atteso sempre deterministico, non serve letteratura.
- **Livello B — Proprietà fisiologiche (monotonicità):** direzione dell'effetto garantita dalla fisiologia nota (es. "più vitamina C non riduce mai l'assorbimento di ferro"), senza bisogno di un numero esatto dalla letteratura.
- **Livello C — Calibrazione su dato pubblicato:** un valore atteso concreto, tracciabile a una fonte precisa. **Qui si applica rigorosamente la Regola 1 del PRD**: se non ho un numero verificato da una fonte primaria, il test resta `PENDING` invece di inventare un valore plausibile.

---

## 1. Zinco — `calculateBioavailableZinc`

### 1.1 Cosa dice davvero la letteratura (verificato ora)

Il codice attuale implementa l'inibizione da fitati come una funzione a gradini su 3 livelli (rapporto molare fitato:zinco >15 → 10%; >5 → 20%; altrimenti 30% fisso). Ho recuperato il paper originale — Miller LV, Krebs NF, Hambidge KM. *A Mathematical Model of Zinc Absorption in Humans As a Function of Dietary Zinc and Phytate*. J Nutr. 2007;137(1):135–141. DOI 10.1093/jn/137.1.135 (full text libero, PMC1995555) — e la vera "equazione di Miller" non è una funzione a gradini. È la soluzione di un'equazione quadratica derivata da un modello di equilibrio chimico (legame zinco-recettore in competizione con legame zinco-fitato):

```
FAZ(TDZ, TDP) = (0.5 / TDZ) · [ AMAX + TDZ + KR·(1 + TDP/KP)
                 − √( (AMAX + TDZ + KR·(1 + TDP/KP))² − 4·AMAX·TDZ ) ]
```
dove `TDZ`/`TDP` sono zinco e fitati **dietetici totali giornalieri** in mmol/giorno (non per pasto — vedi §1.4), e i parametri stimati dal fitting del modello su 21 studi di assorbimento sono:

`AMAX = 0.13 mmol/d (IC95% 0.034–0.23)`, `KR = 0.10 mmol/d (IC95% −0.073–0.28)`, `KP = 1.2 mmol/d (IC95% −0.36–2.8)`.

Il paper dichiara esplicitamente: *"it is obvious from this graph that the model does not support the existence of a threshold for a phytate effect on absorption"* — cioè i dati reali **contraddicono** proprio la struttura a soglie (>15, >5) che il codice attuale implementa.

C'è anche una revisione successiva — Hambidge, Miller, Krebs 2013 (DOI 10.1017/S000711451200195X) — che aggiunge calcio e proteine al modello (il calcio "libera" zinco legando il fitato al posto suo) e trova che il ferro dietetico non ha invece un effetto misurabile. Dobbiamo decidere quale dei due modelli adottare (§4).

### 1.2 Criteri di accettazione
1. La funzione implementa l'Eq. 11/12 del paper Miller 2007, non un'approssimazione a gradini.
2. I parametri `AMAX`, `KR`, `KP` sono costanti nominate con la loro fonte (non "magic number" nel corpo della funzione).
3. Output nel formato `SourcedValue` (§6 PRD): `evidenceLevel: 1` (il modello è validato su dati umani, anche se con ampi intervalli di confidenza sui parametri — vedi punto 6 sotto), `sourceIds: ["MILLER_2007_JNUTR"]`.
4. Gestione di `TDZ = 0`: la funzione non deve lanciare un'eccezione (divisione per zero in FAZ = TAZ/TDZ) — restituisce `TAZ = 0` usando la forma non normalizzata (Eq. 11), non la forma FAZ (Eq. 12).
5. **Decisione architetturale aperta**: il modello è validato per il totale giornaliero, la tua app calcola per pasto. Va dichiarata esplicitamente questa deviazione (vedi §4).
6. Il range di confidenza esposto all'utente usa gli intervalli di confidenza al 95% dei parametri riportati nel paper (non inventati), propagati nel calcolo — oppure, più semplice per l'MVP, un range fisso dichiarato "± incertezza strutturale del modello, cfr. Miller 2007" finché non implementiamo la propagazione formale dell'incertezza. Da decidere insieme.

### 1.3 Test Livello A — difensivo
```typescript
describe("calculateBioavailableZinc — Livello A (difensivo)", () => {
  it("pasto vuoto → 0, nessuna eccezione", () => {
    expect(calculateBioavailableZinc({ foods: [] }).value).toBe(0);
  });

  it("zinco dietetico = 0 → assorbimento 0 (niente divisione per zero)", () => {
    const meal = mealWith({ zinc_mg: 0, phytates_mg: 500 });
    expect(calculateBioavailableZinc(meal).value).toBe(0);
  });

  it("fitati = 0 → usa KP correttamente senza NaN (TDP/KP = 0/1.2 = 0)", () => {
    const meal = mealWith({ zinc_mg: 10, phytates_mg: 0 });
    expect(Number.isFinite(calculateBioavailableZinc(meal).value)).toBe(true);
  });
});
```

### 1.4 Test Livello B — proprietà fisiologiche
```typescript
describe("calculateBioavailableZinc — Livello B (proprietà)", () => {
  it("a fitati fissi, più fitato non aumenta mai l'assorbimento assoluto", () => {
    const low = calculateBioavailableZinc(mealWith({ zinc_mg: 10, phytates_mg: 200 }));
    const high = calculateBioavailableZinc(mealWith({ zinc_mg: 10, phytates_mg: 800 }));
    expect(high.value).toBeLessThanOrEqual(low.value);
  });

  it("nessuna discontinuità a nessun rapporto molare fitato:zinco (il paper esclude soglie)", () => {
    // verifica che la funzione sia continua intorno ai vecchi cutoff del codice v1 (5 e 15)
    const ratios = [4.9, 5.0, 5.1, 14.9, 15.0, 15.1];
    const values = ratios.map(r => calculateBioavailableZinc(mealWithRatio(r)).value);
    for (let i = 1; i < values.length; i++) {
      const jump = Math.abs(values[i] - values[i - 1]);
      expect(jump).toBeLessThan(0.5); // mg — nessun salto brusco, solo variazione continua
    }
  });

  it("FAZ (frazionale) diminuisce all'aumentare dello zinco totale, anche a fitati = 0 " +
     "(proprietà di saturazione — il codice v1 NON la soddisfa: a fitati=0 restituisce sempre 30% flat)", () => {
    const lowDose = calculateBioavailableZinc(mealWith({ zinc_mg: 9.81, phytates_mg: 0 }));
    const highDose = calculateBioavailableZinc(mealWith({ zinc_mg: 30, phytates_mg: 0 }));
    const fazLow = lowDose.value / 9.81;
    const fazHigh = highDose.value / 30;
    expect(fazHigh).toBeLessThan(fazLow);
  });
});
```

### 1.5 Test Livello C — calibrazione su Miller 2007 (valori reali, calcolati a mano dall'equazione pubblicata)

Questi non sono numeri "plausibili": sono il risultato esatto dell'Eq. 11 con `AMAX=0.13, KR=0.10, KP=1.2 mmol/d`, che ho calcolato io stesso dall'equazione del paper — la fonte del numero è l'equazione citata sopra, non una mia stima.

```typescript
describe("calculateBioavailableZinc — Livello C (calibrazione Miller 2007)", () => {
  it("TDZ=9.81mg (0.15 mmol), fitati=0 → assorbimento ≈ 4.00mg (FAZ ≈ 40.8%)", () => {
    const meal = mealWith({ zinc_mg: 9.81, phytates_mg: 0 });
    expect(calculateBioavailableZinc(meal).value).toBeCloseTo(4.00, 1);
  });

  it("TDZ=9.81mg, fitati=990mg (rapporto molare fitato:zinco = 10) → assorbimento ≈ 2.75mg (FAZ ≈ 28.1%)", () => {
    // Il codice v1 su questo stesso input restituirebbe 1.96mg (20% flat, branch "ratio>5"):
    // sottostima del ~30% relativo rispetto al modello pubblicato.
    const meal = mealWith({ zinc_mg: 9.81, phytates_mg: 990 });
    expect(calculateBioavailableZinc(meal).value).toBeCloseTo(2.75, 1);
  });
});
```

---

## 2. Calcio — `calculateBioavailableCalcium`

### 2.1 Cosa dice davvero la letteratura (verificato ora)

Il codice sottrae le moli di ossalato dalle moli di calcio 1:1 e applica poi un tasso fisso del 30% al residuo. Non è un meccanismo documentato in un paper specifico (non ho trovato una fonte che descriva proprio questo algoritmo), ed è strutturalmente incapace di superare il 30%, qualunque sia l'alimento.

Dati reali di assorbimento frazionale del calcio da studi isotopici controllati sull'uomo:

| Alimento | Assorbimento frazionale | Fonte |
|---|---|---|
| Latte vaccino | ~32.1% (stessi soggetti dello studio kale) | Heaney & Weaver, *Am J Clin Nutr* 1990;51:656-7 |
| Cavolo riccio (kale, basso ossalato) | ~40.9% (significativamente **più alto** del latte, p<0.025) | Heaney & Weaver, *Am J Clin Nutr* 1990;51:656-7 |
| Spinaci (alto ossalato) | ~5% | Heaney, Weaver, Recker, *Am J Clin Nutr* 1988;47:707-9 |

Il modello attuale non può riprodurre nessuno di questi tre casi correttamente:
- Per gli spinaci, dove le moli di ossalato eccedono ampiamente le moli di calcio, la sottrazione stechiometrica porta il residuo a 0 (o vicino a 0) → assorbimento predetto ≈ 0%, contro il 5% reale misurato.
- Per il kale, a bassissimo ossalato, il modello applicherebbe semplicemente il 30% flat — ma il dato reale è ~41%, più alto del tetto che il modello può produrre per costruzione.

### 2.2 Criteri di accettazione
1. Il modello deve poter superare il 30% per alimenti a basso contenuto di ossalato (il tetto fisso attuale va rimosso).
2. Il modello deve avvicinarsi ragionevolmente ai tre punti di ancoraggio sopra (tolleranza da concordare, es. ±5 punti percentuali — non è realistico pretendere una corrispondenza esatta da un modello di matrice che generalizza oltre 3 soli studi).
3. **Non esiste, che io abbia trovato, un equivalente del "modello di Miller" per il calcio** (continuo, validato su tanti dati quanto quello dello zinco). Per l'MVP propongo un modello a categorie di matrice (basso/medio/alto ossalato) calibrato sui 3 punti sopra, marcato esplicitamente `evidenceLevel: 2` (pochi studi umani, non una meta-analisi) finché non troviamo di meglio — invece di fingere un modello continuo che non è supportato da altrettanti dati quanto quello dello zinco.
4. Vitamina D e dose totale di calcio (che fanno saturare l'assorbimento attivo transcellulare) restano **fuori dall'MVP di questa funzione** — vanno dichiarate come limitazione nota, non implementate silenziosamente con un coefficiente inventato.

### 2.3 Test Livello A — difensivo
```typescript
describe("calculateBioavailableCalcium — Livello A", () => {
  it("pasto vuoto → 0", () => {
    expect(calculateBioavailableCalcium({ foods: [] }).value).toBe(0);
  });
  it("calcio=0, ossalati>0 → 0, non negativo", () => {
    const meal = mealWith({ calcium_mg: 0, oxalates_mg: 500 });
    expect(calculateBioavailableCalcium(meal).value).toBe(0);
  });
});
```

### 2.4 Test Livello B — proprietà
```typescript
describe("calculateBioavailableCalcium — Livello B", () => {
  it("a calcio fisso, più ossalato non aumenta mai l'assorbimento", () => {
    const low = calculateBioavailableCalcium(mealWith({ calcium_mg: 100, oxalates_mg: 50 }));
    const high = calculateBioavailableCalcium(mealWith({ calcium_mg: 100, oxalates_mg: 600 }));
    expect(high.value).toBeLessThanOrEqual(low.value);
  });
  it("una matrice a basso ossalato può superare il 30% di assorbimento frazionale " +
     "(il codice v1 non può mai farlo, per costruzione)", () => {
    const kaleLike = calculateBioavailableCalcium(mealWith({ calcium_mg: 100, oxalates_mg: 2 }));
    expect(kaleLike.value / 100).toBeGreaterThan(0.30);
  });
});
```

### 2.5 Test Livello C — calibrazione sui 3 punti di ancoraggio reali
```typescript
describe("calculateBioavailableCalcium — Livello C (Heaney & Weaver)", () => {
  it("matrice ad alto ossalato tipo spinaci → assorbimento frazionale vicino al 5% (±5pp)", () => {
    const spinachLike = calculateBioavailableCalcium(spinachTestFood);
    expect(spinachLike.value / spinachTestFood.calcium_mg).toBeCloseTo(0.05, 1);
  });
  it("matrice a basso ossalato tipo kale → assorbimento frazionale vicino al 41% (±5pp)", () => {
    const kaleFood = calculateBioavailableCalcium(kaleTestFood);
    expect(kaleFood.value / kaleTestFood.calcium_mg).toBeCloseTo(0.41, 1);
  });
});
```
*(I valori esatti di calcio/ossalato di `spinachTestFood`/`kaleTestFood` andranno presi da USDA FoodData Central, non inventati — li verifico quando prepariamo il Golden Set.)*

---

## 3. Ferro — `calculateBioavailableIron`

### 3.1 Cosa dice davvero la letteratura (verificato ora — e un avvertimento importante)

Qui la situazione è più delicata che per zinco e calcio, e vale la pena dirlo chiaramente invece di nascondertelo.

**Quello che è sbagliato nel codice attuale, con certezza:**
- L'inibizione da fitati e polifenoli è modellata su **milligrammi assoluti** (`exp(-0.1 * totalPhytates)`), non sul **rapporto molare** fitato:ferro o polifenoli:ferro come fa la letteratura consolidata (Hallberg & Hulthén 2000; Hallberg & Rossander 1984 e successivi). 10mg di fitati con 1mg di ferro nel pasto non è la stessa cosa di 10mg di fitati con 20mg di ferro, ma il codice attuale li tratta identicamente.
- Il potenziamento da vitamina C è un logaritmo additivo inventato (`+= log10(1+vitC) * 0.02`), non la forma a saturazione (tipo Michaelis-Menten) usata nei modelli pubblicati.
- Mancano completamente: il "fattore carne" (MFP — carne/pesce/pollame potenziano l'assorbimento non-eme, Cook & Monsen), la competizione calcio-ferro, e soprattutto **lo stato marziale individuale (ferritina sierica)**, che nei modelli pubblicati è spesso la variabile più importante, più dei fattori del pasto stesso.

**Quello che ho scoperto facendo la ricerca, ed è più importante di qualunque dettaglio formulare:**

Esiste uno studio di confronto diretto — Young MF, et al., *Iron Absorption Prediction Equations Lack Agreement and Underestimate Iron Absorption*. J Nutr. 2007;137(7):1741 — che ha messo alla prova gli algoritmi pubblicati più usati (Monsen & Balintfy, Hallberg & Hulthén, Reddy/Hurrell/Cook) su un trial di alimentazione controllata di 9 mesi su 114 donne. Risultato: **tutti e tre gli algoritmi hanno sottostimato l'assorbimento reale di ferro di un fattore 2-3x** (assorbimento mediano predetto 6-8%, assorbimento reale misurato dal cambiamento di ferritina sierica: 17.2%).

Questo non è un dettaglio tecnico: significa che anche l'algoritmo "giusto" preso pari pari dalla letteratura avrebbe un errore sistematico noto e ampio. Per il ferro, più che inseguire la formula più citata, il punto critico è **che il range di confidenza esposto in UI sia onestamente ampio**, e che l'app non dia mai l'impressione di una precisione che la scienza stessa non ha.

### 3.2 Perché non ti do ancora i criteri di calibrazione definitivi per il ferro

A differenza di zinco (dove ho recuperato l'equazione e i parametri esatti dal paper originale) e calcio (dove ho 3 punti di ancoraggio reali da studi isotopici), per il ferro **non ho ancora recuperato il testo completo di un'equazione specifica con costanti verificate**. Ho trovato ed elenco i candidati principali, con una domanda per te:

| Algoritmo | Cosa fa diversamente | Fonte |
|---|---|---|
| Hallberg & Hulthén 2000 | Il classico, basato su "dose di riferimento" calibrata a ferritina sierica = 40 µg/L | *Scand J Nutr* 2000;44:150-4, DOI 10.3402/fnr.v44i0.1779 |
| Reddy, Hurrell & Cook 2000 | Simile, diversa parametrizzazione dei fattori pasto | citato in più rassegne, non ancora recuperato in full-text |
| Modello "diet-based" più recente | Usa la dieta completa invece del singolo pasto; trova che la ferritina sierica conta più dei fattori dietetici | J Nutr. 2013;143(7):1136-40, DOI 10.3945/jn.112.169904 |

Prima di scrivere una sola costante numerica per il ferro, propongo di recuperare il testo completo di **uno** di questi (il terzo, 2013, è probabilmente il più solido perché corregge esplicitamente il problema di sovrastima dei modelli a singolo pasto — ma è anche il più complesso da implementare in un calcolo "per pasto" come fa la tua app). Dimmi tu quale preferisci approfondire, oppure se preferisci che proceda io con il 2013 come default.

### 3.3 Test Livello A — difensivo (questi li posso già fissare)
```typescript
describe("calculateBioavailableIron — Livello A", () => {
  it("pasto vuoto → 0", () => {
    expect(calculateBioavailableIron({ foods: [] }).value).toBe(0);
  });
  it("solo ferro eme, zero non-eme → assorbimento = solo quota eme", () => {
    const meal = mealWith({ iron_mg: 5, is_heme_iron: true });
    expect(calculateBioavailableIron(meal).value).toBeGreaterThan(0);
  });
  it("ferro non-eme con fitati altissimi non va mai sotto un pavimento fisiologico " +
     "plausibile (l'assorbimento non-eme non misurato è mai stato osservato a 0 assoluto)", () => {
    const meal = mealWith({ iron_mg: 10, is_heme_iron: false, phytates_mg: 5000 });
    expect(calculateBioavailableIron(meal).value).toBeGreaterThan(0);
  });
});
```

### 3.4 Test Livello B — proprietà (fissabili senza l'equazione definitiva)
```typescript
describe("calculateBioavailableIron — Livello B", () => {
  it("più vitamina C non riduce mai l'assorbimento di ferro non-eme", () => {
    const low = calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 10 }));
    const high = calculateBioavailableIron(mealWith({ iron_mg: 5, is_heme_iron: false, vitamin_c_mg: 100 }));
    expect(high.value).toBeGreaterThanOrEqual(low.value);
  });
  it("l'inibizione da fitati dipende dal RAPPORTO col ferro, non dal valore assoluto: " +
     "stesso rapporto molare fitato:ferro a dosi diverse → stessa percentuale di assorbimento " +
     "(il codice v1 fallisce questo test, perché usa mg assoluti di fitato)", () => {
    const smallMeal = calculateBioavailableIron(mealWithPhytateIronRatio({ ironMg: 2, molarRatio: 8 }));
    const bigMeal = calculateBioavailableIron(mealWithPhytateIronRatio({ ironMg: 8, molarRatio: 8 }));
    const fractionSmall = smallMeal.value / 2;
    const fractionBig = bigMeal.value / 8;
    expect(fractionSmall).toBeCloseTo(fractionBig, 1);
  });
});
```

### 3.5 Test Livello C — `PENDING`, in attesa della tua decisione su quale paper (§3.2)

---

## 4. Decisioni che mi servono da te prima di scrivere il motore

1. **Zinco: aggregazione giornaliera vs per pasto.** Il modello di Miller è validato solo sul totale giornaliero. Opzioni: (a) calcoliamo lo zinco assorbito a livello di giornata intera, non di singolo pasto, cambiando l'architettura della dashboard; (b) lo applichiamo comunque per pasto come approssimazione, dichiarando esplicitamente `evidenceLevel` più basso per questo uso "fuori dal dominio di validazione originale". Quale preferisci?
2. **Ferro: quale dei tre algoritmi del §3.2 adottare come riferimento primario** (o vuoi che li recuperi tutti e tre in full-text prima di decidere)?
3. **Calcio: confermi l'approccio a 3 categorie di matrice (basso/medio/alto ossalato) calibrato sui punti Heaney/Weaver per l'MVP**, sapendo che non è un modello continuo come quello dello zinco?
4. **Tolleranza dei test di calibrazione (Livello C):** per calcio e zinco ho proposto ±5 punti percentuali / arrotondamento a 1 decimale. Va bene, o vuoi una tolleranza diversa?

Una volta che mi rispondi su questi quattro punti, scrivo il motore riscritto secondo il contratto `SourcedValue` e questi test diventano la suite di accettazione.
