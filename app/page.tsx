'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MicrobiotaEngine } from '../lib/engine/microbiotaEngine';
import { ComputationalNutritionEngine } from '../lib/engine/computationalNutritionEngine';
import { CookingTransformationEngine, RetentionFactorRecord } from '../lib/engine/cookingTransformationEngine';
import { FoodItem } from '../lib/engine/types';

// Mappatura temporanea food_id -> matrice/famiglia/categoria, in attesa che
// queste colonne vivano in foods_raw invece che hardcoded qui (debito tecnico
// dichiarato, non nuovo: era cosi' anche nella versione precedente).
const FOOD_META: Record<string, { botanicalFamily: string | null; matrixId: string; isHemeIron: boolean; calciumCategory: FoodItem["matrix_category_calcium"] }> = {
  food_apple_raw:   { botanicalFamily: 'Rosaceae',    matrixId: 'pome_fruits',  isHemeIron: false, calciumCategory: 'low_oxalate' },
  food_lentils_raw: { botanicalFamily: 'Fabaceae',    matrixId: 'legumes',      isHemeIron: false, calciumCategory: 'medium_oxalate' },
  food_spinach_raw: { botanicalFamily: 'Amaranthaceae', matrixId: 'leafy_greens', isHemeIron: false, calciumCategory: 'high_oxalate' },
  food_beef_raw:    { botanicalFamily: null,          matrixId: 'meat',         isHemeIron: true,  calciumCategory: 'medium_oxalate' },
};

function nutrientValue(nutrients: { nutrient_code: string; value: number }[], code: string): number {
  return nutrients.find(n => n.nutrient_code === code)?.value || 0;
}

export default function Home() {
  const [foods, setFoods] = useState<any[]>([]);
  const [dbRetentionFactors, setDbRetentionFactors] = useState<RetentionFactorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cookingMethods, setCookingMethods] = useState<{ [key: string]: string }>({});

  const microbiotaEngine = new MicrobiotaEngine();
  const nutritionEngine = new ComputationalNutritionEngine();
  const cookingEngine = new CookingTransformationEngine();

  useEffect(() => {
    async function fetchAllData() {
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods_raw')
        .select(`food_id, name_it, nutrient_values ( nutrient_code, value )`);
      if (!foodsError && foodsData) setFoods(foodsData);

      const { data: factorsData, error: factorsError } = await supabase
        .from('retention_factors')
        .select('matrix_id, cooking_method, nutrient, value');
      if (!factorsError && factorsData) setDbRetentionFactors(factorsData as RetentionFactorRecord[]);

      setLoading(false);
    }
    fetchAllData();
  }, []);

  const handleCookingChange = (foodId: string, method: string) => {
    setCookingMethods(prev => ({ ...prev, [foodId]: method }));
  };

  if (loading) {
    return <div className="p-10 text-slate-600 font-sans">Sincronizzazione con Supabase in corso...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Cervello Bio-Nutrizionale</h1>
          <p className="text-slate-500">Motori di Microbiota e Biodisponibilità, con simulazione cottura</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {foods.map((food) => {
            const nutrients = Array.isArray(food.nutrient_values) ? food.nutrient_values : [];
            const meta = FOOD_META[food.food_id] || { botanicalFamily: null, matrixId: 'generic', isHemeIron: false, calciumCategory: 'medium_oxalate' as const };
            const selectedMethod = cookingMethods[food.food_id] || 'raw';

            // Un solo oggetto, un solo tipo: nessun cast "any" necessario.
            const rawFoodInput: FoodItem = {
              id: food.food_id,
              name: food.name_it,
              iron_mg: nutrientValue(nutrients, 'iron_mg'),
              zinc_mg: nutrientValue(nutrients, 'zinc_mg'),
              calcium_mg: nutrientValue(nutrients, 'calcium_mg'),
              vitamin_c_mg: nutrientValue(nutrients, 'vitamin_c_mg'),
              phytates_mg: nutrientValue(nutrients, 'phytates_mg'),
              oxalates_mg: nutrientValue(nutrients, 'oxalates_mg'),
              polyphenols_mg: nutrientValue(nutrients, 'polyphenols_mg'),
              macs_mg: nutrientValue(nutrients, 'macs_mg'),
              is_heme_iron: meta.isHemeIron,
              matrix_category_calcium: meta.calciumCategory,
              botanical_family: meta.botanicalFamily,
            };

            const cookedFood = cookingEngine.applyCookingTransformation(
              rawFoodInput, meta.matrixId, selectedMethod, dbRetentionFactors
            );

            const mealContext = { foods: [cookedFood] };
            const microbiotaScores = microbiotaEngine.calculateMicrobiotaImpactScore(mealContext);
            const ironScore = nutritionEngine.calculateBioavailableIron(mealContext);
            const zincScore = nutritionEngine.calculateBioavailableZinc(mealContext);
            const calciumScore = nutritionEngine.calculateBioavailableCalcium(mealContext);

            return (
              <div key={food.food_id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{food.name_it}</h2>
                      <span className="text-xs text-slate-400 uppercase tracking-widest">{meta.botanicalFamily || 'Matrice Animale'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">Cottura</label>
                      <select
                        value={selectedMethod}
                        onChange={(e) => handleCookingChange(food.food_id, e.target.value)}
                        className="bg-indigo-50 border-none text-indigo-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="raw">Nessuna (Crudo)</option>
                        <option value="boiled">Bollitura</option>
                        <option value="steamed">Al Vapore</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Ferro Assoluto</span>
                      <strong className="text-lg text-slate-700">{cookedFood.iron_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Vitamina C</span>
                      <strong className="text-lg text-slate-700">{cookedFood.vitamin_c_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Zinco Assoluto</span>
                      <strong className="text-lg text-slate-700">{cookedFood.zinc_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Fitati (Inibitore)</span>
                      <strong className="text-lg text-slate-700">{cookedFood.phytates_mg} mg</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                  <div className="bg-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Asse Microbiota</h4>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-slate-300">MACs</span>
                      <span className="text-xl font-black text-emerald-400">{microbiotaScores.macsScore.value}<span className="text-xs text-emerald-500/50 ml-1">/100</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Polifenoli</span>
                      <span className="text-xl font-black text-purple-400">{microbiotaScores.polyphenolsScore.value}<span className="text-xs text-purple-500/50 ml-1">/100</span></span>
                    </div>
                  </div>

                  <div className="bg-indigo-950 p-5 rounded-2xl flex flex-col justify-between border border-indigo-900/50">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 border-b border-indigo-800/50 pb-2">Assorbimento Reale</h4>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm text-indigo-100 block">Ferro</span>
                        <span className="text-[9px] text-indigo-400 font-mono">Hallberg 2000{ironScore.verificationStatus === 'draft' ? ' · draft' : ''}</span>
                      </div>
                      <span className="text-xl font-black text-white">{ironScore.value}<span className="text-xs text-indigo-300 ml-1">mg</span></span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm text-indigo-100 block">Zinco</span>
                        <span className="text-[9px] text-indigo-400 font-mono">Miller 2007{zincScore.verificationStatus === 'draft' ? ' · draft' : ''}</span>
                      </div>
                      <span className="text-xl font-black text-white">{zincScore.value}<span className="text-xs text-indigo-300 ml-1">mg</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-indigo-100 block">Calcio</span>
                        <span className="text-[9px] text-indigo-400 font-mono">Heaney & Weaver{calciumScore.verificationStatus === 'draft' ? ' · draft' : ''}</span>
                      </div>
                      <span className="text-xl font-black text-white">{calciumScore.value}<span className="text-xs text-indigo-300 ml-1">mg</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
