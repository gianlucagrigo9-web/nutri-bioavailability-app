'use client';

// app/page.tsx
//
// Riscritta il 2026-10-10: unisce due prototipi che fino ad oggi erano
// rimasti separati:
// - lo "scaffold" (questo repo): Golden Set sourced su 20 alimenti
//   verificati, motori completi (ferro/zinco/calcio/B12/folati/vitamina A/
//   Mg/Cu/Se/I/vitK), pannello "Perché questo numero?" con fonti cliccabili.
// - bio-nutrition-app (cartella locale separata, mai pushata su questo
//   repo): la UI "Meal Builder" (Dispensa Alimenti + Composizione Piatto,
//   selezione del metodo di cottura per singolo alimento del pasto), ma con
//   motori più vecchi (niente B12/folati/vitamina A) e senza Golden Set.
//
// Qui: interazione Meal Builder, dati/motori dello scaffold. Ogni valore
// calcolato sul PASTO TOTALE (non più un alimento alla volta) passa dagli
// stessi 11 metodi del motore di nutrizione + i 2 del motore microbiota,
// ciascuno con il proprio pannello "Perché questo numero?".
//
// LIMITE DICHIARATO (eredità della versione precedente di questa pagina,
// vedi commit precedenti): CookingTransformationEngine trasforma solo i
// campi NUMERICI tramite i fattori di ritenzione (iron_mg, zinc_mg, ...),
// non i flag categorici carotenoid_matrix_state / zinc_bioaccessibility_bucket.
// Quindi selezionare "Bollitura" su un alimento la cui riga Golden Set è
// 'raw_intact' (es. carote crude) NON fa scattare il fattore Livny 2003 per
// lo stato cotto: quel flag resta congelato allo stato della riga originale.
// Per gli alimenti che il Golden Set misura separatamente da crudi/cotti
// (spinaci, carote, cavoletti di Bruxelles) la soluzione corretta è
// aggiungere al pasto la riga già cotta (es. "Carote, bollite e scolate"),
// non simulare la cottura sulla riga cruda. Non nascosto: è lo stesso
// limite già documentato nella versione precedente di questo file.
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MicrobiotaEngine } from '@/lib/engine/microbiotaEngine';
import { ComputationalNutritionEngine } from '@/lib/engine/computationalNutritionEngine';
import { CookingTransformationEngine, RetentionFactorRecord } from '@/lib/engine/cookingTransformationEngine';
import { FoodItem, SourcedValue, OxalateCategory, Meal, scaleFoodItemToGrams } from '@/lib/engine/types';
import { fetchOffProduct, buildApproximatedFood, ApproximatedFood } from '@/lib/openFoodFacts';
import BarcodeScanner from '@/components/BarcodeScanner';
import { DietType, filterFoodsByDietType } from '@/lib/engine/dietTypeFilter';
import { buildDietNutrientTargets, generateDiet, DietGeneratorResult, OmittedNutrientTarget } from '@/lib/engine/dietGenerator';
import { Sex } from '@/lib/engine/nutrientTargets';

const nutritionEngine = new ComputationalNutritionEngine();
const microbiotaEngine = new MicrobiotaEngine();
const cookingEngine = new CookingTransformationEngine();

type NutrientRow = {
  nutrient_code: string;
  value: number;
  confidence_low: number | null;
  confidence_high: number | null;
  source_id: string;
  verification_status: string;
};

type FoodRow = {
  food_id: string;
  name_it: string;
  matrix_id: string;
  baseline_cooking_state: string;
  is_heme_iron: boolean;
  matrix_category_calcium: OxalateCategory | null;
  botanical_family: string | null;
  carotenoid_matrix_state: FoodItem['carotenoid_matrix_state'] | null;
  zinc_bioaccessibility_bucket: FoodItem['zinc_bioaccessibility_bucket'] | null;
  is_fortified_folate: boolean | null;
  nutrient_values: NutrientRow[] | null;
  // Popolate da add_diet_compatibility_golden_set.sql (eseguito sul DB
  // reale il 2026-10-11, vedi docs/PRD.md §4.9). null = non ancora
  // classificato per quell'asse (o per nessuno, se la riga non è stata
  // toccata dalla migrazione) -- MAI trattato come "compatibile" di
  // default, vedi dietTypeFilter.ts: un alimento non classificato viene
  // escluso da qualunque filtro diverso da "onnivora", mai assunto
  // compatibile (rischio di proporre carne a un utente vegano).
  diet_compat_vegetarian: boolean | null;
  diet_compat_vegan: boolean | null;
  diet_compat_fruitarian: boolean | null;
};

// source_type attiva una colonna dello schema gia' presente nel DB live
// (vedi docs/PRD.md §4.7, 2026-10-11) ma finora mai letta da qui: quando
// vale 'internal_estimate', il valore non e' una misura diretta citata in
// letteratura/database ufficiale, ma un numero derivato con un metodo
// nostro (es. DERIVED_FDC_RAW_COOKED_RATIO) -- la UI lo segnala con un
// badge "Stima", sullo stesso modello gia' usato per i prodotti scansionati
// via barcode (Misurato/Stimato/Non disponibile, vedi BarcodeScanner.tsx).
// null = non ancora classificata (righe storiche non ancora passate dalla
// migrazione di backfill): trattata come non-estimate, mai come se fosse
// certamente "misurata" -- vedi commento dove viene letta.
type SourceType = 'official_database' | 'peer_reviewed_study' | 'preprint' | 'institutional_report' | 'internal_estimate' | null;
type SourceRow = { id: string; citation: string; url_or_doi: string | null; source_type: SourceType };

interface MealItem {
  instanceId: string; // permette di aggiungere lo stesso alimento più volte
  foodId: string;
  cookingMethod: string;
  grams: number; // quantità reale nel piatto; i valori in DB sono per 100g (vedi scaleFoodItemToGrams)
  // Presente SOLO per alimenti aggiunti via scanner barcode (Open Food
  // Facts, vedi lib/openFoodFacts.ts) -- porta il FoodItem già costruito
  // invece di un riferimento a `foods` (quegli alimenti non sono MAI
  // scritti nel DB, vedi PRD "Dati prodotti confezionati": consultazione
  // live, mai unione col dataset proprietario per gli obblighi ODbL).
  // undefined per gli alimenti del Golden Set, dove foodId punta a `foods`.
  scannedFood?: ApproximatedFood;
}

// Etichette italiane per i valori di cooking_method_enum attualmente nel DB
// (vedi extend_cooking_method_enum.sql). "Fritto" rappresenta anche la
// "padella" (scottatura senza acqua) richiesta dall'utente: i dati sourced
// per cooking_method='fried' esistono oggi SOLO per le matrici 'tubers' e
// 'legumes' (USDA Release 6, vedi retention_factors_padella.sql, status
// 'draft' con riserve documentate nei commenti SQL). Per le altre matrici
// (carote, crucifere, broccoli, verdure a foglia) 'fried' resta un gap
// dichiarato -- non esiste ancora una fonte reale, quindi per quegli
// alimenti availableCookingMethods() sotto non lo mostra come opzione
// (coerente con "zero dati inventati": nessun fattore stimato).
const COOKING_METHOD_LABELS: Record<string, string> = {
  raw: 'Crudo',
  boiled: 'Bollitura',
  boiled_quick_15_20min: 'Bollitura rapida (15-20 min)',
  boiled_in_skin: 'Bollitura in buccia',
  steamed: 'Al vapore',
  roasted: 'Arrosto',
  baked: 'Al forno',
  fried: 'Fritto',
  microwaved: 'Microonde',
};
const COOKING_METHOD_ORDER = [
  'raw',
  'boiled',
  'boiled_quick_15_20min',
  'boiled_in_skin',
  'steamed',
  'roasted',
  'baked',
  'fried',
  'microwaved',
];

// Bug trovato il 2026-10-10 (segnalato dall'utente): CookingTransformationEngine
// presuppone che i nutrient_values salvati per un food_id siano lo stato
// CRUDO dell'alimento. Per 7 alimenti del Golden Set non è così -- i
// valori sono già di una preparazione cotta (patate bollite, legumi
// bolliti, fegato brasato, manzo alla griglia, uovo sodo, salmone,
// pasta). Se la UI avesse comunque offerto il menu di cottura per questi
// (indicizzato per matrice, non per singolo food_id), selezionare un
// metodo con dati reali avrebbe applicato lo sconto di ritenzione una
// SECONDA volta su un valore già scontato dalla cottura vera. Vedi
// fix_baseline_cooking_state.sql per i dettagli e foods_raw.baseline_cooking_state
// per lo stato reale di ogni riga (default difensivo 'unknown', mai 'raw',
// per qualunque alimento futuro non ancora classificato).
//
// Etichette per gli stati non-crudo che NON hanno un cooking_method_enum
// corrispondente (nessun fattore di ritenzione "da crudo a qui" esiste
// ancora per questi): usate solo per mostrare un badge statico, mai per
// popolare il selettore di cottura.
const BASELINE_STATE_LABELS: Record<string, string> = {
  braised: 'Brasato',
  grilled: 'Alla griglia',
  dry_heat_cooked: 'Cotto (calore secco)',
  hard_boiled: 'Sodo',
  unknown: 'Stato di cottura non ancora classificato',
};

// Label italiane per "Genera un piano alimentare" (2026-10-11, docs/PRD.md
// §4.9) -- due mappe distinte perché generateDiet lavora su NutrientFieldName
// (campo grezzo di FoodItem, es. 'vitamin_c_mg') mentre buildDietNutrientTargets
// segnala gli omessi per TargetNutrientKey (es. 'vitamin_c'), due vocabolari
// diversi dello stesso file (vedi lib/engine/nutrientTargets.ts).
const DIET_TARGET_NUTRIENT_LABELS: Record<string, string> = {
  vitamin_c_mg: 'Vitamina C',
  vitamin_b12_mcg: 'Vitamina B12',
  magnesium_mg: 'Magnesio',
  copper_mg: 'Rame',
  selenium_mcg: 'Selenio',
  iodine_mcg: 'Iodio',
  vitamin_k_mcg: 'Vitamina K',
  calcium_mg: 'Calcio',
};
const TARGET_NUTRIENT_KEY_LABELS: Record<string, string> = {
  iron: 'Ferro',
  zinc: 'Zinco',
  calcium: 'Calcio',
  vitamin_c: 'Vitamina C',
  vitamin_b12: 'Vitamina B12',
  folate_dfe: 'Folati (DFE)',
  magnesium: 'Magnesio',
  copper: 'Rame',
  selenium: 'Selenio',
  iodine: 'Iodio',
  vitamin_k: 'Vitamina K',
  vitamin_a_rae: 'Vitamina A (RAE)',
};

function baselineStateLabel(state: string): string {
  return COOKING_METHOD_LABELS[state] ?? BASELINE_STATE_LABELS[state] ?? state;
}

function nutrientValue(nutrients: NutrientRow[], code: string): number {
  return nutrients.find((n) => n.nutrient_code === code)?.value ?? 0;
}

function foodRowToFoodItem(row: FoodRow): FoodItem {
  const nutrients = row.nutrient_values ?? [];
  return {
    id: row.food_id,
    name: row.name_it,
    iron_mg: nutrientValue(nutrients, 'iron_mg'),
    zinc_mg: nutrientValue(nutrients, 'zinc_mg'),
    calcium_mg: nutrientValue(nutrients, 'calcium_mg'),
    vitamin_c_mg: nutrientValue(nutrients, 'vitamin_c_mg'),
    phytates_mg: nutrientValue(nutrients, 'phytates_mg'),
    oxalates_mg: nutrientValue(nutrients, 'oxalates_mg'),
    polyphenols_mg: nutrientValue(nutrients, 'polyphenols_mg'),
    is_heme_iron: row.is_heme_iron,
    matrix_category_calcium: row.matrix_category_calcium ?? 'medium_oxalate',
    macs_mg: nutrientValue(nutrients, 'macs_mg'),
    botanical_family: row.botanical_family,
    vitamin_b12_mcg: nutrientValue(nutrients, 'vitamin_b12_mcg'),
    folate_mcg: nutrientValue(nutrients, 'folate_mcg'),
    is_fortified_folate: row.is_fortified_folate ?? false,
    beta_carotene_mcg: nutrientValue(nutrients, 'beta_carotene_mcg'),
    other_provitamin_a_carotenoids_mcg: nutrientValue(nutrients, 'other_provitamin_a_carotenoids_mcg'),
    carotenoid_matrix_state: row.carotenoid_matrix_state ?? 'cooked_or_disrupted',
    zinc_bioaccessibility_bucket: row.zinc_bioaccessibility_bucket ?? 'none',
    magnesium_mg: nutrientValue(nutrients, 'magnesium_mg'),
    copper_mg: nutrientValue(nutrients, 'copper_mg'),
    selenium_mcg: nutrientValue(nutrients, 'selenium_mcg'),
    iodine_mcg: nutrientValue(nutrients, 'iodine_mcg'),
    vitamin_k_mcg: nutrientValue(nutrients, 'vitamin_k_mcg'),
    energy_kcal: nutrientValue(nutrients, 'energy_kcal'),
    protein_g: nutrientValue(nutrients, 'protein_g'),
    carbohydrates_g: nutrientValue(nutrients, 'carbohydrates_g'),
    fat_g: nutrientValue(nutrients, 'fat_g'),
    fiber_g: nutrientValue(nutrients, 'fiber_g'),
    // Popolato SOLO se tutti e 3 gli assi sono classificati nel DB (mai
    // parzialmente, per non far passare un filtro su un asse non
    // verificato) -- vedi commento su FoodRow sopra e dietTypeFilter.ts.
    dietCompatibility:
      row.diet_compat_vegetarian !== null && row.diet_compat_vegan !== null && row.diet_compat_fruitarian !== null
        ? {
            vegetarian: row.diet_compat_vegetarian,
            vegan: row.diet_compat_vegan,
            fruitarian: row.diet_compat_fruitarian,
          }
        : undefined,
  };
}

// ----------------------------------------------------------------------------
// "Perché questo numero?" -- pannello di trasparenza per OGNI valore
// calcolato (docs/PRD.md §1 Regola 1/4: nessun numero senza una fonte visibile).
// ----------------------------------------------------------------------------
function MetricRow({
  label,
  unit,
  result,
  sourcesMap,
}: {
  label: string;
  unit: string;
  result: SourcedValue;
  sourcesMap: Record<string, SourceRow>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-indigo-900/40 last:border-b-0 py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center text-left"
      >
        <div>
          <span className="text-sm text-indigo-100 block">{label}</span>
          <span className="text-[9px] text-indigo-400 font-mono">
            {result.verificationStatus === 'draft' ? 'draft' : 'verified'}
            {result.bioavailabilityAdjusted === false ? ' · composizione grezza' : ''}
            {' · perché questo numero? '}
            {open ? '▲' : '▼'}
          </span>
        </div>
        <span className="text-xl font-black text-white shrink-0 ml-3">
          {Number.isFinite(result.value) ? result.value.toFixed(2) : result.value}
          <span className="text-xs text-indigo-300 ml-1">{unit}</span>
        </span>
      </button>

      {open && (
        <div className="mt-2 bg-indigo-900/40 rounded-xl p-3 text-xs text-indigo-100 space-y-1">
          <div>
            <span className="text-indigo-400">Livello di evidenza:</span> {result.evidenceLevel}/5
          </div>
          <div>
            <span className="text-indigo-400">Intervallo di confidenza:</span>{' '}
            {result.confidenceLow !== null && result.confidenceHigh !== null
              ? `${result.confidenceLow.toFixed(2)} – ${result.confidenceHigh.toFixed(2)} ${unit}`
              : 'non disponibile (la fonte non pubblica un range)'}
          </div>
          <div>
            <span className="text-indigo-400">Modello di assorbimento:</span>{' '}
            {result.bioavailabilityAdjusted === false
              ? 'nessuno — valore di composizione grezza (vedi docs/PRD.md §4.0/§4.5)'
              : 'applicato'}
          </div>
          <div>
            <span className="text-indigo-400">Fonti:</span>
            <ul className="list-disc list-inside">
              {result.sourceIds.map((sid) => {
                const src = sourcesMap[sid];
                // Badge "Stima" SOLO quando source_type e' esplicitamente
                // 'internal_estimate' -- mai per null/altro valore, per non
                // etichettare come stima una fonte semplicemente non ancora
                // classificata (vedi nota sul tipo SourceType sopra).
                const isEstimate = src?.source_type === 'internal_estimate';
                return (
                  <li key={sid}>
                    {isEstimate && (
                      <span className="inline-block bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded mr-1 align-middle">
                        STIMA
                      </span>
                    )}
                    {src ? (
                      src.url_or_doi ? (
                        <a href={src.url_or_doi} target="_blank" rel="noreferrer" className="underline">
                          {src.citation}
                        </a>
                      ) : (
                        src.citation
                      )
                    ) : (
                      <>
                        {sid}{' '}
                        <span className="text-indigo-400">
                          (citazione completa in docs/PRD.md / nei commenti del motore, non ancora in tabella sources)
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [foods, setFoods] = useState<FoodRow[]>([]);
  const [retentionFactors, setRetentionFactors] = useState<RetentionFactorRecord[]>([]);
  const [sourcesMap, setSourcesMap] = useState<Record<string, SourceRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  // Filtro tipo di dieta (docs/PRD.md §4.9: "ovviamente prima cosa che si
  // offre a cliente è selezionare se vuole dieta onnivora, carnivora,
  // vegana, fruttariana"). Agisce solo sulla Dispensa (cosa si può
  // aggiungere al piatto da ora in poi) -- non rimuove retroattivamente
  // alimenti già aggiunti al piatto se l'utente cambia idea a metà.
  const [dietType, setDietType] = useState<DietType>('omnivore');

  // "Genera un piano alimentare" (docs/PRD.md §4.9) -- età/sesso servono
  // SOLO a buildDietNutrientTargets (target LARN/EFSA di micronutrienti),
  // non a un calcolo del fabbisogno energetico: quello resta un input
  // diretto dell'utente (dietGenTargetKcal), scelta esplicita dell'utente
  // il 2026-10-11 ("togliamo il calcolo del fabbisogno, mettiamo solo
  // l'opzione di settare le kcal") -- vedi commento di testa a
  // lib/engine/dietGenerator.ts.
  const [dietGenAge, setDietGenAge] = useState(30);
  const [dietGenSex, setDietGenSex] = useState<Sex>('female');
  const [dietGenTargetKcal, setDietGenTargetKcal] = useState(2000);
  const [dietGenResult, setDietGenResult] = useState<DietGeneratorResult | null>(null);
  const [dietGenOmitted, setDietGenOmitted] = useState<OmittedNutrientTarget[]>([]);

  // Stato per lo scanner barcode (Open Food Facts, vedi lib/openFoodFacts.ts).
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);
  // Prodotto trovato, in attesa di conferma dell'utente prima di entrare
  // nel piatto (mostra nome/marca/badge di fiducia prima dell'aggiunta).
  const [pendingScan, setPendingScan] = useState<ApproximatedFood | null>(null);

  useEffect(() => {
    async function fetchAllData() {
      // Solo foods_raw con verification_status='verified' -- gli stessi 20
      // alimenti del Golden Set promossi in golden_set_promote_verified.sql.
      // Vedi nota storica in fondo al commento di intestazione: le
      // nutrient_values NON vengono filtrate per il proprio
      // verification_status (alcune righe sourced da letteratura restano
      // 'draft' non per sospetto, ma perché non ri-controllate oggi --
      // escluderle sovrastimerebbe l'assorbimento, un errore peggiore).
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods_raw')
        .select(
          `food_id, name_it, matrix_id, baseline_cooking_state, is_heme_iron, matrix_category_calcium,
           botanical_family, carotenoid_matrix_state, zinc_bioaccessibility_bucket,
           is_fortified_folate, diet_compat_vegetarian, diet_compat_vegan, diet_compat_fruitarian,
           nutrient_values ( nutrient_code, value, confidence_low, confidence_high, source_id, verification_status )`
        )
        .eq('verification_status', 'verified')
        .order('name_it');

      if (foodsError) {
        setError(`Errore nel caricare foods_raw da Supabase: ${foodsError.message}`);
        setLoading(false);
        return;
      }
      setFoods((foodsData ?? []) as unknown as FoodRow[]);

      const { data: factorsData, error: factorsError } = await supabase
        .from('retention_factors')
        .select('matrix_id, cooking_method, nutrient, value, confidence_low, confidence_high, source_id');
      if (!factorsError && factorsData) {
        setRetentionFactors(factorsData as RetentionFactorRecord[]);
      }

      const { data: sourcesData, error: sourcesError } = await supabase
        .from('sources')
        .select('id, citation, url_or_doi, source_type');
      if (!sourcesError && sourcesData) {
        const map: Record<string, SourceRow> = {};
        for (const s of sourcesData as SourceRow[]) map[s.id] = s;
        setSourcesMap(map);
      }

      setLoading(false);
    }
    fetchAllData();
  }, []);

  if (loading) {
    return <div className="p-10 text-slate-600 font-sans">Sincronizzazione con Supabase in corso...</div>;
  }

  if (error) {
    return <div className="p-10 text-rose-600 font-sans">{error}</div>;
  }

  // Alimenti ammessi nella Dispensa per il tipo di dieta selezionato.
  // Riusa filterFoodsByDietType (stessa funzione del motore/engine, non
  // una riscrittura locale della regola "non classificato -> escluso")
  // sui FoodItem derivati dai FoodRow, poi riporta il risultato a un
  // Set di food_id per filtrare la lista FoodRow da rendere sotto.
  const visibleFoodIds = new Set(
    filterFoodsByDietType(foods.map(foodRowToFoodItem), dietType).map((f) => f.id)
  );

  // Genera un piano con l'euristica generateDiet, sui soli alimenti
  // compatibili col tipo di dieta selezionato sopra (visibleFoodIds) --
  // mai sugli alimenti scansionati via barcode (dati stimati, non adatti
  // come candidati di un generatore algoritmico).
  function runDietGenerator() {
    const { targets, omittedNutrients } = buildDietNutrientTargets(dietGenSex, dietGenAge);
    const candidateFoods = foods
      .filter((food) => visibleFoodIds.has(food.food_id))
      .map(foodRowToFoodItem);
    const result = generateDiet(candidateFoods, targets, dietGenTargetKcal);
    setDietGenResult(result);
    setDietGenOmitted(omittedNutrients);
  }

  // Sostituisce il piatto corrente col piano generato -- azione esplicita
  // dell'utente (un bottone dedicato, mai automatico), coerente con
  // "genera un piano" come alternativa alla composizione manuale, non
  // un'aggiunta silenziosa a un piatto già in corso.
  function loadGeneratedDietIntoMeal() {
    if (!dietGenResult) return;
    setMealItems(
      dietGenResult.foods.map(({ food, grams }, index) => ({
        instanceId: `${food.id}-gen-${Date.now()}-${index}`,
        foodId: food.id,
        cookingMethod: 'raw',
        grams,
      }))
    );
    setDietGenResult(null);
  }

  const addToMeal = (foodId: string) => {
    // 100g di default: i valori in DB sono per 100g (convenzione USDA), quindi
    // 100g è la porzione che corrisponde esattamente al dato grezzo -- non è
    // una "porzione tipica" inventata, è il default che non altera nulla finché
    // l'utente non lo modifica (vedi scaleFoodItemToGrams in lib/engine/types.ts).
    setMealItems((prev) => [...prev, { instanceId: `${foodId}-${Date.now()}`, foodId, cookingMethod: 'raw', grams: 100 }]);
  };
  const removeFromMeal = (instanceId: string) => {
    setMealItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };
  const updateCookingMethod = (instanceId: string, method: string) => {
    setMealItems((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, cookingMethod: method } : item))
    );
  };
  // Architettura difensiva: l'input del campo numerico può arrivare come
  // stringa vuota (utente che cancella per riscrivere) o testo non numerico.
  // Number("") è 0, non NaN -- gestito comunque correttamente da
  // scaleFoodItemToGrams (0g valido). Qualunque altro input non interpretabile
  // diventa NaN qui, e scaleFoodItemToGrams lo tratta come 0g, mai un valore
  // inventato o un crash silenzioso a valle nei motori.
  const updateGrams = (instanceId: string, rawValue: string) => {
    const grams = Number(rawValue);
    setMealItems((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, grams } : item))
    );
  };

  // --- Scanner barcode (Open Food Facts) ---------------------------------

  async function handleBarcodeDetected(barcode: string) {
    setScannerOpen(false);
    setScanStatus('loading');
    setScanErrorMsg(null);
    const result = await fetchOffProduct(barcode);
    if (!result.ok) {
      setScanStatus('error');
      setScanErrorMsg(
        result.error.kind === 'not_found'
          ? `Nessun prodotto trovato su Open Food Facts per il codice ${barcode}.`
          : `Errore nella ricerca del prodotto: ${result.error.message}`
      );
      return;
    }
    setPendingScan(buildApproximatedFood(result.product));
    setScanStatus('idle');
  }

  function confirmAddScannedFood() {
    if (!pendingScan) return;
    setMealItems((prev) => [
      ...prev,
      {
        instanceId: `${pendingScan.item.id}-${Date.now()}`,
        foodId: pendingScan.item.id,
        cookingMethod: 'raw',
        grams: 100,
        scannedFood: pendingScan,
      },
    ]);
    setPendingScan(null);
  }

  function cancelPendingScan() {
    setPendingScan(null);
  }

  // Metodi di cottura disponibili per una data matrice: SOLO quelli per cui
  // esiste davvero un fattore di ritenzione sourced in DB (+ 'raw', sempre
  // disponibile) -- non mostriamo un'opzione che non cambierebbe nulla,
  // facendo credere all'utente che il metodo sia stato "applicato" quando
  // in realtà non esiste un dato per quella matrice (vedi CookingTransformationEngine:
  // nessun fattore corrispondente -> alimento invariato, silenziosamente).
  function availableCookingMethods(matrixId: string): string[] {
    const methods = new Set<string>(['raw']);
    for (const rf of retentionFactors) {
      if (rf.matrix_id === matrixId) methods.add(rf.cooking_method);
    }
    return COOKING_METHOD_ORDER.filter((m) => methods.has(m));
  }

  const currentMealFoods: FoodItem[] = mealItems
    .map((item) => {
      // Alimenti da scanner barcode (Open Food Facts): il FoodItem è già
      // costruito (vedi confirmAddScannedFood), niente lookup in `foods`
      // (non ci sono, per design -- mai scritti nel DB) né trasformazione
      // di cottura (un prodotto confezionato è "com'è", non ha un fattore
      // di ritenzione sourced per nessuna matrice).
      if (item.scannedFood) {
        return scaleFoodItemToGrams(item.scannedFood.item, item.grams);
      }
      const dbFood = foods.find((f) => f.food_id === item.foodId);
      if (!dbFood) return null;
      const rawFoodItem = foodRowToFoodItem(dbFood);
      // Difensivo (vedi fix_baseline_cooking_state.sql): se il valore
      // salvato per questo alimento non è genuinamente crudo, ignoriamo
      // qualunque cookingMethod memorizzato e forziamo 'raw' -- che per
      // CookingTransformationEngine significa "nessuna trasformazione",
      // l'unico comportamento corretto quando il dato è già di uno stato
      // cotto specifico. La UI non offre più il selettore in questo caso
      // (vedi sotto), ma questo guard resta anche se in futuro cambiasse.
      const effectiveCookingMethod = dbFood.baseline_cooking_state === 'raw' ? item.cookingMethod : 'raw';
      const cookedFoodItem = cookingEngine.applyCookingTransformation(rawFoodItem, dbFood.matrix_id, effectiveCookingMethod, retentionFactors);
      // Scala DOPO la trasformazione di cottura: i fattori di ritenzione sono
      // percentuali (indipendenti dalla grammatura), quindi l'ordine è
      // matematicamente equivalente, ma logicamente più chiaro così --
      // "crudo per 100g" -> "cotto per 100g" -> "cotto per la porzione reale".
      return scaleFoodItemToGrams(cookedFoodItem, item.grams);
    })
    .filter((f): f is FoodItem => f !== null);

  const mealContext: Meal = { foods: currentMealFoods };

  // Vedi lib/openFoodFacts.ts: i prodotti scansionati entrano in
  // currentMealFoods con un profilo inibitori/promotori parzialmente
  // approssimato o assente (vedi ApproximatedFood.approximatedFields /
  // .unavailableFields). I motori sotto NON sanno nulla di questa
  // provenienza -- il loro verificationStatus riflette solo il rigore
  // del modello di assorbimento (es. derating zinco, categoria ossalati
  // per il calcio), non la qualità del dato alimentare in ingresso. Un
  // pasto con un prodotto scansionato può quindi mostrare "Verified" sul
  // badge anche se uno dei suoi input (es. fitati=0 perché non misurati
  // da Open Food Facts, non perché genuinamente assenti) è approssimato.
  // "Trasparenza": segnaliamo questo scollamento con un avviso dedicato
  // vicino ai badge, invece di toccare il motore per fargli conoscere
  // OFF (vedi PRD "Dati prodotti confezionati": mai unito al dataset
  // proprietario).
  const hasScannedItems = mealItems.some((item) => item.scannedFood !== undefined);

  const ironScore = nutritionEngine.calculateBioavailableIron(mealContext);
  const zincScore = nutritionEngine.calculateBioavailableZinc(mealContext);
  const calciumScore = nutritionEngine.calculateBioavailableCalcium(mealContext);
  const b12Score = nutritionEngine.calculateBioavailableB12(mealContext);
  const folateScore = nutritionEngine.calculateFolateDFE(mealContext);
  const vitaminAScore = nutritionEngine.calculateVitaminARAE(mealContext);
  const magnesiumScore = nutritionEngine.calculateMagnesium(mealContext);
  const copperScore = nutritionEngine.calculateCopper(mealContext);
  const seleniumScore = nutritionEngine.calculateSelenium(mealContext);
  const iodineScore = nutritionEngine.calculateIodine(mealContext);
  const vitaminKScore = nutritionEngine.calculateVitaminK(mealContext);
  const microbiotaScores = microbiotaEngine.calculateMicrobiotaImpactScore(mealContext);
  const energyScore = nutritionEngine.calculateEnergy(mealContext);
  const proteinScore = nutritionEngine.calculateProtein(mealContext);
  const carbsScore = nutritionEngine.calculateCarbohydrates(mealContext);
  const fatScore = nutritionEngine.calculateFat(mealContext);
  const fiberScore = nutritionEngine.calculateFiber(mealContext);

  const totalRawIron = currentMealFoods.reduce((acc, f) => acc + f.iron_mg, 0).toFixed(2);
  const totalRawZinc = currentMealFoods.reduce((acc, f) => acc + f.zinc_mg, 0).toFixed(2);
  const totalVitC = currentMealFoods.reduce((acc, f) => acc + f.vitamin_c_mg, 0).toFixed(2);
  const totalPhytates = currentMealFoods.reduce((acc, f) => acc + f.phytates_mg, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Simulatore Bio-Nutrizionale</h1>
            <p className="text-slate-500">
              Meal Builder sul Golden Set verificato: interazioni sinergiche e inibitorie, ogni numero con fonte —
              apri &quot;perché questo numero?&quot; su qualunque valore.
            </p>
          </div>
          <a
            href="/admin/data-entry"
            className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            Pannello data-entry →
          </a>
        </header>

        {foods.length === 0 && (
          <p className="text-slate-500 mb-6">
            Nessun alimento con verification_status=&apos;verified&apos; trovato. Hai eseguito golden_set_foods.sql e
            golden_set_promote_verified.sql su questo progetto Supabase?
          </p>
        )}

        {/* HUD RISULTATI MOTORE (Fisso in alto) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10 sticky top-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
                Assorbimento Reale (Pasto Totale)
              </h4>
              {hasScannedItems && (
                <p className="text-[10px] text-amber-600 font-medium -mt-3 mb-3 leading-snug">
                  ⚠️ Il pasto contiene un prodotto scansionato (vedi legenda sotto): il badge Verified/Draft
                  qui sopra riguarda solo il modello di assorbimento, non la qualità del dato del prodotto —
                  i punteggi possono quindi essere meno accurati di quanto indicato.
                </p>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-950 p-4 rounded-xl">
                  <span className="text-xs text-indigo-200 block mb-1">Ferro (Eq.2 H&H)</span>
                  <strong className="text-2xl text-white block">
                    {ironScore.value} <span className="text-sm font-normal text-indigo-400">/ {totalRawIron} mg</span>
                  </strong>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest">
                    {ironScore.verificationStatus === 'draft' ? 'Draft' : 'Verified'}
                  </span>
                </div>
                <div className="bg-indigo-950 p-4 rounded-xl">
                  <span className="text-xs text-indigo-200 block mb-1">Zinco (Miller &apos;07)</span>
                  <strong className="text-2xl text-white block">
                    {zincScore.value} <span className="text-sm font-normal text-indigo-400">/ {totalRawZinc} mg</span>
                  </strong>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest">
                    {zincScore.verificationStatus === 'draft' ? 'Draft' : 'Verified'}
                  </span>
                </div>
                <div className="bg-indigo-950 p-4 rounded-xl">
                  <span className="text-xs text-indigo-200 block mb-1">Calcio (H&W)</span>
                  <strong className="text-2xl text-white block">
                    {calciumScore.value} <span className="text-sm font-normal text-indigo-400">mg</span>
                  </strong>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest">
                    {calciumScore.verificationStatus === 'draft' ? 'Draft' : 'Verified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
                Asse Microbiota
              </h4>
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="bg-slate-900 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs text-slate-400 block mb-1">MACs</span>
                  <strong className="text-2xl text-emerald-400 block">
                    {microbiotaScores.macsScore.value}
                    <span className="text-sm font-normal text-emerald-600">/100</span>
                  </strong>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs text-slate-400 block mb-1">Polifenoli</span>
                  <strong className="text-2xl text-purple-400 block">
                    {microbiotaScores.polyphenolsScore.value}
                    <span className="text-sm font-normal text-purple-600">/100</span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
                Ambiente Chimico
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-full flex flex-col justify-center">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Vit. C (Promotore)</span>
                  <strong className="text-slate-700">{totalVitC} mg</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fitati (Inibitore)</span>
                  <strong className="text-slate-700">{totalPhytates} mg</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrienti (Pasto Totale) -- richiesta esplicita dell'utente
              (2026-10-10: "non abbiamo da nessuna parte i macro"). Composizione
              grezza USDA FDC, nessun modello di digeribilità -- vedi
              MetricRow nel dettaglio completo sotto per fonte/evidenza per
              ciascun valore. */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Macronutrienti (Pasto Totale) · composizione grezza
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">Energia</span>
                <strong className="text-lg text-slate-700">{energyScore.value}</strong>
                <span className="text-[10px] text-slate-400 block">kcal</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">Proteine</span>
                <strong className="text-lg text-slate-700">{proteinScore.value}</strong>
                <span className="text-[10px] text-slate-400 block">g</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">Carboidrati</span>
                <strong className="text-lg text-slate-700">{carbsScore.value}</strong>
                <span className="text-[10px] text-slate-400 block">g</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">Grassi</span>
                <strong className="text-lg text-slate-700">{fatScore.value}</strong>
                <span className="text-[10px] text-slate-400 block">g</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">Fibra</span>
                <strong className="text-lg text-slate-700">{fiberScore.value}</strong>
                <span className="text-[10px] text-slate-400 block">g</span>
              </div>
            </div>
          </div>

          {/* Dettaglio completo: B12/folati/vitamina A/Mg/Cu/Se/I/vitK -- stessa
              copertura della vecchia pagina a card, ora sul pasto totale.
              Collassato di default per non affollare l'HUD, ma sempre a un
              click: "zero dati inventati" vale anche come "zero dati nascosti". */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowFullBreakdown((o) => !o)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {showFullBreakdown ? '▲ Nascondi' : '▼ Mostra'} dettaglio completo (B12, folati, vitamina A, Mg, Cu, Se,
              I, vit. K) — con fonti
            </button>
            {showFullBreakdown && (
              <div className="mt-4 bg-indigo-950 p-5 rounded-2xl border border-indigo-900/50 grid grid-cols-1 md:grid-cols-3 gap-x-8">
                <div>
                  <MetricRow label="Vitamina B12 assorbita" unit="µg" result={b12Score} sourcesMap={sourcesMap} />
                  <MetricRow label="Folati (DFE)" unit="µg" result={folateScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Vitamina A (RAE)" unit="µg" result={vitaminAScore} sourcesMap={sourcesMap} />
                </div>
                <div>
                  <MetricRow label="Magnesio" unit="mg" result={magnesiumScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Rame" unit="mg" result={copperScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Selenio" unit="µg" result={seleniumScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Iodio" unit="µg" result={iodineScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Vitamina K" unit="µg" result={vitaminKScore} sourcesMap={sourcesMap} />
                </div>
                <div>
                  <MetricRow label="Energia" unit="kcal" result={energyScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Proteine" unit="g" result={proteinScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Carboidrati" unit="g" result={carbsScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Grassi" unit="g" result={fatScore} sourcesMap={sourcesMap} />
                  <MetricRow label="Fibra" unit="g" result={fiberScore} sourcesMap={sourcesMap} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GENERA UN PIANO ALIMENTARE (2026-10-11, docs/PRD.md §4.9) --
            generateDiet + buildDietNutrientTargets, sui soli alimenti
            compatibili col tipo di dieta selezionato sotto. Euristica
            golosa dichiarata (non un ottimo LP/MILP garantito), opera
            SOLO su composizione grezza -- vedi i warning del motore,
            mostrati sempre, mai silenziati (Regola 6). */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Genera un piano alimentare</h3>
          <p className="text-xs text-slate-400 mb-4">
            Euristica &quot;weakest-link first&quot; sui {visibleFoodIds.size} alimenti compatibili con il tipo di
            dieta selezionato qui sotto — non è un ottimo globale garantito (nessun solver LP/MILP, vedi
            commento di testa a lib/engine/dietGenerator.ts). Età e sesso servono solo ai target di
            micronutrienti LARN/EFSA, non calcolano il fabbisogno energetico — quello lo imposti tu.
          </p>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <label className="text-xs text-slate-500">
              Età
              <input
                type="number"
                min={0}
                value={dietGenAge}
                onChange={(e) => setDietGenAge(Number(e.target.value))}
                className="block w-20 mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Sesso
              <select
                value={dietGenSex}
                onChange={(e) => setDietGenSex(e.target.value as Sex)}
                className="block w-28 mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
              >
                <option value="female">Donna</option>
                <option value="male">Uomo</option>
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Target energetico
              <input
                type="number"
                min={0}
                value={dietGenTargetKcal}
                onChange={(e) => setDietGenTargetKcal(Number(e.target.value))}
                className="block w-28 mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
              />
              <span className="block text-[10px] text-slate-400 mt-0.5">kcal/giorno, input diretto</span>
            </label>
            <button
              type="button"
              onClick={runDietGenerator}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Genera
            </button>
          </div>

          {dietGenResult && (
            <div className="border-t border-slate-100 pt-4">
              {dietGenResult.warnings.length > 0 && (
                <div className="bg-amber-50 text-amber-700 text-xs rounded-xl p-3 mb-4 space-y-1">
                  {dietGenResult.warnings.map((w, i) => (
                    <div key={i}>⚠ {w}</div>
                  ))}
                </div>
              )}
              {dietGenOmitted.length > 0 && (
                <div className="bg-slate-50 text-slate-500 text-xs rounded-xl p-3 mb-4">
                  <span className="font-semibold text-slate-600">Nutrienti non ancora inclusi in questo piano</span>{' '}
                  (richiederebbero i valori bioavailability-adjusted dei motori esistenti, non ancora integrati
                  in generateDiet — gap dichiarato, docs/PRD.md §4.9):{' '}
                  {dietGenOmitted.map((o) => TARGET_NUTRIENT_KEY_LABELS[o.nutrientKey] ?? o.nutrientKey).join(', ')}.
                </div>
              )}

              {dietGenResult.foods.length === 0 ? (
                <p className="text-slate-400 text-sm">Nessun piano generato — vedi i warning sopra.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      MAR: {(dietGenResult.mar * 100).toFixed(0)}% (media dei NAR sui nutrienti target inclusi)
                    </span>
                    <button
                      type="button"
                      onClick={loadGeneratedDietIntoMeal}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
                    >
                      Sostituisci il piatto con questo piano
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {dietGenResult.foods.map(({ food, grams }) => (
                      <div key={food.id} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-slate-600">{food.name}</span>
                        <span className="font-semibold text-slate-700">{grams}g</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.entries(dietGenResult.narByNutrient) as [string, number][]).map(([code, nar]) => (
                      <div key={code} className="bg-slate-50 rounded-lg p-2 text-center">
                        <span className="text-[10px] text-slate-500 block">
                          {DIET_TARGET_NUTRIENT_LABELS[code] ?? code}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{(nar * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* WORKSPACE DIVISO: DISPENSA vs PIATTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLONNA SINISTRA: Dispensa */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Dispensa Alimenti</h3>
              <button
                onClick={() => {
                  setScanErrorMsg(null);
                  setScannerOpen(true);
                }}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                title="Scansiona un codice a barre (Open Food Facts)"
              >
                📷 Scansiona
              </button>
            </div>
            {/* Selettore tipo di dieta (docs/PRD.md §4.9) -- filtra solo cosa
                si può aggiungere da qui in avanti, vedi commento su
                dietType sopra. */}
            <div className="flex flex-wrap gap-2 mb-3">
              {([
                ['omnivore', 'Onnivora'],
                ['vegetarian', 'Vegetariana'],
                ['vegan', 'Vegana'],
                ['fruitarian', 'Fruttariana'],
              ] as [DietType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDietType(value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    dietType === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {dietType !== 'omnivore' && visibleFoodIds.size === 0 && (
              <div className="bg-slate-50 text-slate-500 text-xs rounded-xl p-3 mb-3">
                Nessun alimento del Golden Set è ancora classificato come compatibile con questo tipo di dieta (o la classificazione non è ancora stata sincronizzata da questa sessione).
              </div>
            )}
            {scanStatus === 'loading' && (
              <div className="bg-amber-50 text-amber-700 text-xs rounded-xl p-3 mb-3">
                Ricerca del prodotto su Open Food Facts…
              </div>
            )}
            {scanErrorMsg && (
              <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 mb-3 flex justify-between items-start gap-2">
                <span>{scanErrorMsg}</span>
                <button onClick={() => setScanErrorMsg(null)} className="shrink-0 font-bold">✕</button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {foods.filter((food) => visibleFoodIds.has(food.food_id)).map((food) => {
                const hasDraft = (food.nutrient_values ?? []).some((n) => n.verification_status === 'draft');
                // "Stima": almeno un fattore di ritenzione applicabile a questa
                // matrice (qualunque metodo di cottura, non solo quello
                // eventualmente selezionato ora) cita una fonte classificata
                // internal_estimate -- oggi solo DERIVED_FDC_RAW_COOKED_RATIO
                // (vedi docs/PRD.md §4.7). Questo e' il punto di integrazione
                // corretto per il badge "stima": il MetricRow in basso legge
                // result.sourceIds, che per i punteggi calcolati e' la lista
                // fissa delle fonti del MODELLO di assorbimento/punteggio
                // (es. HALLBERG_2000_SCANDJNUTR), non il source_id del singolo
                // retention_factor/nutrient_value usato -- quindi non si
                // illuminerebbe mai per questo caso reale. sourcesMap[id] puo'
                // non esistere ancora (riga 'sources' non sincronizzata): in
                // quel caso optional chaining restituisce undefined, trattato
                // come non-estimate, mai come se fosse certamente misurato.
                const hasEstimatedRetention = retentionFactors.some(
                  (rf) => rf.matrix_id === food.matrix_id && rf.source_id && sourcesMap[rf.source_id]?.source_type === 'internal_estimate'
                );
                return (
                  <div
                    key={food.food_id}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-700 text-sm">{food.name_it}</h4>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {food.botanical_family || 'Animale'}
                        {hasDraft && <span className="text-amber-500"> · contiene dati draft</span>}
                        {hasEstimatedRetention && (
                          <span className="text-amber-500" title="Il fattore di ritenzione da crudo a cotto per questo alimento e' stimato (derivato dal rapporto USDA crudo/cotto), non misurato da uno studio dedicato.">
                            {' '}· cottura stimata
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => addToMeal(food.food_id)}
                      className="bg-slate-100 hover:bg-indigo-100 text-indigo-600 h-8 w-8 rounded-full flex items-center justify-center font-bold transition-colors shrink-0 ml-3"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLONNA DESTRA: Piatto Attuale */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Composizione Piatto</h3>
            {mealItems.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
                Aggiungi alimenti dalla dispensa per calcolare le interazioni.
              </div>
            ) : (
              <div className="space-y-4">
                {mealItems.some((i) => i.scannedFood) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-600">Legenda prodotti scansionati:</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />misurato (etichetta prodotto)</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />stimato dalla categoria</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1" />non disponibile</span>
                  </div>
                )}
                {mealItems.map((item) => {
                  if (item.scannedFood) {
                    const sf = item.scannedFood;
                    return (
                      <div
                        key={item.instanceId}
                        className="bg-white p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{sf.productName}</h4>
                          {sf.brand && <span className="text-xs text-slate-400 block">{sf.brand}</span>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-amber-600 uppercase tracking-widest font-semibold">
                              Prodotto confezionato — dati approssimativi
                            </span>
                            <a
                              href={sf.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-slate-400 underline hover:text-slate-600"
                            >
                              © Open Food Facts contributors
                            </a>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"
                              title={`Misurati: ${sf.measuredFields.join(', ')}`}
                            />
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"
                              title={`Stimati: ${sf.approximatedFields.join(', ')}`}
                            />
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300"
                              title={`Non disponibili: ${sf.unavailableFields.join(', ')}`}
                            />
                            <span className="text-[9px] text-slate-400 ml-1">
                              i valori di ferro/zinco/calcio entrano nel calcolo del pasto, ma il profilo fitati/ossalati/ferro-eme di questo prodotto è stimato o assente (vedi legenda) — il punteggio del pasto può essere meno accurato
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="flex flex-col flex-grow sm:flex-grow-0">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                              Quantità (g)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.grams}
                              onChange={(e) => updateGrams(item.instanceId, e.target.value)}
                              className="bg-emerald-50 border-none text-emerald-700 text-sm rounded-xl px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                            />
                          </div>
                          <button
                            onClick={() => removeFromMeal(item.instanceId)}
                            className="bg-red-50 hover:bg-red-100 text-red-500 h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-colors mt-4 sm:mt-0"
                            title="Rimuovi dal piatto"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const dbFood = foods.find((f) => f.food_id === item.foodId);
                  if (!dbFood) return null;
                  const hasRawBaseline = dbFood.baseline_cooking_state === 'raw';
                  const methods = availableCookingMethods(dbFood.matrix_id);

                  return (
                    <div
                      key={item.instanceId}
                      className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{dbFood.name_it}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{dbFood.matrix_id}</span>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex flex-col flex-grow sm:flex-grow-0">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                            Quantità (g)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={item.grams}
                            onChange={(e) => updateGrams(item.instanceId, e.target.value)}
                            className="bg-emerald-50 border-none text-emerald-700 text-sm rounded-xl px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                          />
                          {/* I valori nutrienti sono per 100g (convenzione USDA, vedi
                              lib/engine/types.ts): questo campo scala linearmente ogni
                              calcolo a valle. 0 o negativo -> trattato come porzione
                              assente (0g), mai un valore inventato -- vedi scaleFoodItemToGrams. */}
                          {(!Number.isFinite(item.grams) || item.grams <= 0) && (
                            <span className="text-[9px] text-amber-600 mt-1">
                              quantità non valida: trattata come 0g (porzione assente)
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col flex-grow sm:flex-grow-0">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                            Cottura
                          </label>
                          {hasRawBaseline ? (
                            <>
                              <select
                                value={item.cookingMethod}
                                onChange={(e) => updateCookingMethod(item.instanceId, e.target.value)}
                                className="bg-indigo-50 border-none text-indigo-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                              >
                                {methods.map((m) => (
                                  <option key={m} value={m}>
                                    {COOKING_METHOD_LABELS[m] ?? m}
                                  </option>
                                ))}
                              </select>
                              {methods.length === 1 && (
                                <span className="text-[9px] text-slate-400 mt-1">
                                  nessun fattore di ritenzione sourced per questa matrice: solo crudo
                                </span>
                              )}
                            </>
                          ) : (
                            // Il valore salvato per questo alimento è GIA' di uno stato
                            // cotto specifico (vedi fix_baseline_cooking_state.sql):
                            // nessun selettore, per non permettere di applicare un
                            // fattore di ritenzione due volte sullo stesso dato.
                            <>
                              <span className="bg-slate-100 text-slate-600 text-sm rounded-xl px-3 py-2 font-semibold">
                                {baselineStateLabel(dbFood.baseline_cooking_state)}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-1">
                                dato già di questa preparazione: nessun altro metodo disponibile
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromMeal(item.instanceId)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-colors mt-4 sm:mt-0"
                          title="Rimuovi dal piatto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
          onError={(msg) => {
            setScanStatus('error');
            setScanErrorMsg(msg);
          }}
        />
      )}

      {pendingScan && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-slate-800 text-lg">{pendingScan.productName}</h3>
            {pendingScan.brand && <span className="text-sm text-slate-400 block mb-2">{pendingScan.brand}</span>}
            <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 my-3">
              Prodotto confezionato da Open Food Facts: i macronutrienti sono quelli dichiarati in etichetta
              (non verificati da Claude come il Golden Set). Ferro/zinco/calcio/ecc. ENTRANO nel calcolo di
              biodisponibilità del pasto, ma {pendingScan.approximatedFields.length} campi di questo prodotto
              (es. se il ferro è eme, categoria ossalati) sono <strong>stimati</strong> dalla categoria del
              prodotto, non misurati, e {pendingScan.unavailableFields.length} campi non sono disponibili per
              un prodotto confezionato generico (es. fitati, ossalati, MACs) — restano a zero. Il punteggio di
              biodisponibilità del pasto può quindi risultare più o meno accurato di quanto sembri.
            </p>
            <a
              href={pendingScan.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-slate-400 underline hover:text-slate-600"
            >
              © Open Food Facts contributors — vedi scheda prodotto
            </a>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={cancelPendingScan}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold text-sm"
              >
                Annulla
              </button>
              <button
                onClick={confirmAddScannedFood}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm"
              >
                Aggiungi al piatto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
