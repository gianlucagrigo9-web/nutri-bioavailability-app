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
import { FoodItem, SourcedValue, OxalateCategory, Meal } from '@/lib/engine/types';

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
  is_heme_iron: boolean;
  matrix_category_calcium: OxalateCategory | null;
  botanical_family: string | null;
  carotenoid_matrix_state: FoodItem['carotenoid_matrix_state'] | null;
  zinc_bioaccessibility_bucket: FoodItem['zinc_bioaccessibility_bucket'] | null;
  is_fortified_folate: boolean | null;
  nutrient_values: NutrientRow[] | null;
};

type SourceRow = { id: string; citation: string; url_or_doi: string | null };

interface MealItem {
  instanceId: string; // permette di aggiungere lo stesso alimento più volte
  foodId: string;
  cookingMethod: string;
}

// Etichette italiane per i valori di cooking_method_enum attualmente nel DB
// (vedi extend_cooking_method_enum.sql). "padella" non è ancora qui: non
// esiste ancora un fattore di ritenzione sourced per quel metodo (vedi
// retention_factors_*.sql) -- aggiungerlo come opzione senza un dato dietro
// violerebbe la regola "zero dati inventati".
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
                return (
                  <li key={sid}>
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
          `food_id, name_it, matrix_id, is_heme_iron, matrix_category_calcium,
           botanical_family, carotenoid_matrix_state, zinc_bioaccessibility_bucket,
           is_fortified_folate,
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
        .select('id, citation, url_or_doi');
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

  const addToMeal = (foodId: string) => {
    setMealItems((prev) => [...prev, { instanceId: `${foodId}-${Date.now()}`, foodId, cookingMethod: 'raw' }]);
  };
  const removeFromMeal = (instanceId: string) => {
    setMealItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };
  const updateCookingMethod = (instanceId: string, method: string) => {
    setMealItems((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, cookingMethod: method } : item))
    );
  };

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
      const dbFood = foods.find((f) => f.food_id === item.foodId);
      if (!dbFood) return null;
      const rawFoodItem = foodRowToFoodItem(dbFood);
      return cookingEngine.applyCookingTransformation(rawFoodItem, dbFood.matrix_id, item.cookingMethod, retentionFactors);
    })
    .filter((f): f is FoodItem => f !== null);

  const mealContext: Meal = { foods: currentMealFoods };

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

        {/* WORKSPACE DIVISO: DISPENSA vs PIATTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLONNA SINISTRA: Dispensa */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Dispensa Alimenti</h3>
            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {foods.map((food) => {
                const hasDraft = (food.nutrient_values ?? []).some((n) => n.verification_status === 'draft');
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
                {mealItems.map((item) => {
                  const dbFood = foods.find((f) => f.food_id === item.foodId);
                  if (!dbFood) return null;
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
                          <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                            Cottura
                          </label>
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
    </div>
  );
}
