// lib/engine/nutrientTargets.ts
//
// Target numerici reali LARN/EFSA per il generatore di dieta (docs/PRD.md
// §4.9 -- "Linee guida: Mix LARN + EFSA dove manca un valore", risposta
// dell'utente). Finora DietNutrientTarget.target in dietGenerator.ts non
// aveva MAI un valore reale popolato (responsabilità lasciata al
// chiamante) -- questo file fornisce una prima tabella di riferimento
// sourced, non più un placeholder.
//
// SCOPO DICHIARATAMENTE LIMITATO (Regola 6, non nascosto):
// - Solo MICRONUTRIENTI (ferro, zinco, calcio, vitamina C, B12, folati,
//   magnesio, rame, selenio, iodio, vitamina K, vitamina A). I
//   macronutrienti (proteine/carboidrati/grassi/fibra) NON sono qui --
//   l'utente ha esplicitamente rimandato quel dettaglio ("il peso resta
//   comunque utile [...] da confermare quando si arriva a quel dettaglio,
//   non deciso ora", §4.9) e dipendono da scelte non ancora prese
//   (proteine g/kg richiede il peso, non ancora in user_profile).
// - Solo UNA fascia "adulto" (18+), per sesso, con le SOLE eccezioni per
//   età che le fonti stesse danno esplicitamente (ferro e calcio nella
//   donna, legate alla menopausa). NESSUNA fascia 0-17, gravidanza/
//   allattamento, o oltre-75 differenziata -- non sourced in questa
//   sessione, resta un gap dichiarato per quando servirà.
// - La fonte NON fornisce un'età di menopausa esatta: usiamo età>=60
//   (ferro) o età>=65/60 (calcio, soglie diverse per sesso perché le
//   fonti stesse le davano diverse) come PROXY per "post-menopausa",
//   un'approssimazione dichiarata, non un criterio clinico -- se l'app
//   arriverà a chiedere lo stato menopausale direttamente, questo proxy
//   va sostituito, non raffinato.
//
// FONTI:
// - LARN, V Revisione (2024), Società Italiana di Nutrizione Umana
//   (SINU) -- valori consultati tramite le tabelle di sintesi
//   SmartFood/IEO (smartfood.ieo.it/media/{ad5l2acl,wefj2kxp,swie5abw}/
//   smartfood_tabella_larn_{minerali,vitamine_idrosolubili,
//   vitamine_liposolubili}_2025.pdf), NON il PDF ufficiale SINU
//   originale (non raggiunto in questa sessione, sinu.it/larn/ non
//   fetchabile) -- gap dichiarato: se i valori ufficiali SINU
//   differiscono da queste tabelle di sintesi, vanno corretti qui.
// - EFSA, "Dietary Reference Values for nutrients: Summary report"
//   (EFSA Supporting Publication 2017:e15121) -- usata per la
//   metodologia dichiarata dall'utente ("EFSA dove manca un valore
//   LARN"), ma per TUTTI i nutrienti elencati sotto un valore LARN
//   esisteva già, quindi EFSA qui serve solo da cross-check indipendente
//   (es. calcio PRI 950mg adulti 25+, rame AI 1.6mg uomo/1.3mg donna --
//   coerente con LARN 2024, non con la precedente IV Revisione LARN che
//   aveva rame a 0.9mg, discrepanza storica dichiarata sotto).
//
// Nota sulla categoria (PRI = Assunzione Raccomandata per la Popolazione,
// soddisfa il 97.5% della popolazione; AI = Assunzione Adeguata, meno
// certa, basata su intake osservati non su un fabbisogno derivato):
// l'estrazione testuale delle tabelle PDF ha perso la formattazione
// (grassetto/corsivo) che le distingue nella fonte originale -- la
// categoria riportata qui è quindi una BEST-GUESS, non confermata al
// 100%, mentre il VALORE NUMERICO è confermato (confrontato su più
// estrazioni indipendenti della stessa tabella, sempre coerente).
//
// evidenceLevel 5 per tutti (Livello "interno" del PRD §4, Database
// istituzionale di riferimento -- non un claim causale, un valore
// tabellato da un ente ufficiale, stesso trattamento di USDA FDC).

export type Sex = "male" | "female";

export type TargetNutrientKey =
  | "iron"
  | "zinc"
  | "calcium"
  | "vitamin_c"
  | "vitamin_b12"
  | "folate_dfe"
  | "magnesium"
  | "copper"
  | "selenium"
  | "iodine"
  | "vitamin_k"
  | "vitamin_a_rae";

export interface NutrientReferenceValue {
  value: number;
  unit: "mg" | "mcg";
  category: "PRI" | "AI";
  categoryConfirmed: boolean; // false = best-guess, vedi nota di testa sulla formattazione persa
  evidenceLevel: 5;
  sourceIds: string[];
  // true quando il target NON si applica direttamente al campo grezzo
  // di FoodItem con lo stesso nome, ma all'OUTPUT calcolato di un motore
  // esistente (bioavailability-adjusted per ferro/zinco/calcio, RE per
  // la vitamina A, DFE per i folati) -- gap di wiring già dichiarato in
  // docs/PRD.md §4.9 ("integrazione con i valori bioavailability-adjusted
  // [...] non fatta"), qui solo RI-dichiarato per ciascun nutriente
  // specifico, non risolto da questo file.
  mapsToRawFoodItemField: boolean;
  engineOutputNote?: string;
  // Override di età, SOLO dove la fonte stessa lo dà esplicitamente
  // (mai inventato per altri nutrienti). ageYearsThreshold e' il proxy
  // dichiarato per "post-menopausa" (vedi nota di testa).
  ageOverride?: { ageYearsThreshold: number; value: number; note: string };
}

const LARN_SOURCE = ["LARN_2024_SINU"];
const LARN_EFSA_CROSSCHECK = ["LARN_2024_SINU", "EFSA_DRV_SUMMARY_2017"];

type ReferenceTable = Record<Sex, Record<TargetNutrientKey, NutrientReferenceValue>>;

export const ADULT_NUTRIENT_REFERENCE_VALUES: ReferenceTable = {
  male: {
    iron: { value: 10, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target da confrontare con l'OUTPUT di calculateBioavailableIron, non con iron_mg grezzo (NAR/MAR §4.9 lo prevede già a livello di design, non ancora wired)." },
    zinc: { value: 12, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target da confrontare con l'OUTPUT di calculateBioavailableZinc, non con zinc_mg grezzo." },
    calcium: { value: 950, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true, ageOverride: { ageYearsThreshold: 65, value: 1100, note: "LARN 2024: 1100mg oltre i 65 anni (soglia esplicita della fonte, non un proxy)." } },
    vitamin_c: { value: 105, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    vitamin_b12: { value: 4, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    folate_dfe: { value: 330, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target in DFE (Dietary Folate Equivalents): da confrontare con l'OUTPUT di calculateFolateDFE, non con folate_mcg grezzo (che e' folato alimentare naturale, non DFE)." },
    magnesium: { value: 350, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    copper: { value: 1.4, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true, engineOutputNote: "LARN IV Revisione (2014) riportava 0.9mg: LARN V Revisione (2024) lo ha alzato a 1.4mg (coerente con EFSA AI 1.6mg) -- usare 1.4, non 0.9, discrepanza storica dichiarata." },
    selenium: { value: 55, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    iodine: { value: 150, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true },
    vitamin_k: { value: 135, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    vitamin_a_rae: { value: 750, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target in RE (equivalenti di retinolo, sistema europeo LARN/EFSA: 1 mcg RE = 6 mcg di beta-carotene = 12 mcg di altri carotenoidi provitaminici): da confrontare con l'OUTPUT di calculateVitaminARAE (che usa gli stessi fattori RE; il nome del metodo resta per compatibilita'), non con beta_carotene_mcg grezzo." },
  },
  female: {
    iron: { value: 18, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target da confrontare con l'OUTPUT di calculateBioavailableIron, non con iron_mg grezzo.", ageOverride: { ageYearsThreshold: 60, value: 10, note: "Proxy dichiarato per post-menopausa (la fonte non da' un'eta' esatta di menopausa) -- NON un criterio clinico, da sostituire se l'app arrivera' a chiedere lo stato menopausale direttamente." } },
    zinc: { value: 9, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target da confrontare con l'OUTPUT di calculateBioavailableZinc, non con zinc_mg grezzo." },
    calcium: { value: 950, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true, ageOverride: { ageYearsThreshold: 60, value: 1100, note: "Proxy dichiarato per post-menopausa (vedi nota su ferro) -- la fonte parla di 'post-menopausa', non di un'eta' esatta; qui si usa 60 come soglia, diversa da quella usata per l'uomo (65, soglia esplicita della fonte) perche' le fonti davano criteri diversi per sesso." } },
    vitamin_c: { value: 85, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    vitamin_b12: { value: 4, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    folate_dfe: { value: 330, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target in DFE: da confrontare con l'OUTPUT di calculateFolateDFE, non con folate_mcg grezzo. NOTA: non include il fabbisogno aumentato in gravidanza (400mcg+, LARN) -- fuori scope per questa tabella 'adulto generico'." },
    magnesium: { value: 350, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    copper: { value: 1.3, unit: "mg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true, engineOutputNote: "LARN IV Revisione (2014) riportava 0.9mg: LARN V Revisione (2024) lo ha alzato a 1.3mg (coerente con EFSA AI 1.3mg) -- usare 1.3, non 0.9." },
    selenium: { value: 55, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    iodine: { value: 150, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_EFSA_CROSSCHECK, mapsToRawFoodItemField: true },
    vitamin_k: { value: 125, unit: "mcg", category: "AI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: true },
    vitamin_a_rae: { value: 650, unit: "mcg", category: "PRI", categoryConfirmed: false, evidenceLevel: 5, sourceIds: LARN_SOURCE, mapsToRawFoodItemField: false, engineOutputNote: "Target in RE (equivalenti di retinolo, sistema europeo LARN/EFSA): da confrontare con l'OUTPUT di calculateVitaminARAE (stessi fattori RE), non con beta_carotene_mcg grezzo." },
  },
};

/**
 * Restituisce il valore di riferimento per un nutriente, sesso ed età.
 * Applica l'override di età SOLO se la fonte lo dichiara esplicitamente
 * per quel nutriente/sesso (mai interpolato o esteso ad altri nutrienti).
 * Architettura difensiva: età non finita/negativa -> usa il valore di
 * default (nessuna eccezione, nessun override applicato su un input non
 * fisico).
 */
export function getNutrientReferenceValue(
  nutrientKey: TargetNutrientKey,
  sex: Sex,
  ageYears: number
): NutrientReferenceValue {
  const base = ADULT_NUTRIENT_REFERENCE_VALUES[sex][nutrientKey];
  const validAge = Number.isFinite(ageYears) && ageYears >= 0;
  if (validAge && base.ageOverride && ageYears >= base.ageOverride.ageYearsThreshold) {
    return { ...base, value: base.ageOverride.value };
  }
  return base;
}
