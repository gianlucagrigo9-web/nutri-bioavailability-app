'use client';

// app/page.tsx
//
// Prototipo UI sui 20 alimenti VERIFICATI del Golden Set (docs/PRD.md §4.6,
// roadmap §9 punto 4: "Prototipo UI sui 20 alimenti verificati, incluso
// il pannello 'Perché questo numero?'").
//
// Riscritta il 2026-10-09: la versione precedente usava una mappa
// FOOD_META hardcoded per 4 alimenti demo (food_apple_raw, food_beef_raw,
// ...) che non esistono più nel Golden Set reale, e non mostrava mai
// sorgente / livello di evidenza / intervallo di confidenza per nessun
// valore calcolato -- il pannello "Perché questo numero?" non esisteva.
// Niente FOOD_META qui: matrix_id/is_heme_iron/matrix_category_calcium/
// botanical_family/carotenoid_matrix_state/zinc_bioaccessibility_bucket/
// is_fortified_folate arrivano DIRETTAMENTE da foods_raw, perché quelle
// colonne esistono davvero nel DB da quando sono stati popolati i 20
// alimenti (vedi golden_set_foods.sql).
//
// Niente simulazione di cottura via retention factor in questa pagina
// (a differenza della versione precedente): CookingTransformationEngine
// trasforma solo i campi NUMERICI, non i flag categorici
// (carotenoid_matrix_state, zinc_bioaccessibility_bucket) -- simulare
// "bollitura" su un alimento crudo lascerebbe quei flag congelati allo
// stato crudo, con lo stesso tipo di errore già documentato in docs/PRD.md §4.6
// per i cavoletti di Bruxelles "al vapore". Il Golden Set ha già righe
// MISURATE separate per crudo/cotto quando esistono entrambe (spinaci,
// carote, cavoletti di Bruxelles): qui si vede ogni riga reale come una
// card indipendente, mai un numero derivato/simulato.
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MicrobiotaEngine } from '@/lib/engine/microbiotaEngine';
import { ComputationalNutritionEngine } from '@/lib/engine/computationalNutritionEngine';
import { FoodItem, SourcedValue, OxalateCategory } from '@/lib/engine/types';

const nutritionEngine = new ComputationalNutritionEngine();
const microbiotaEngine = new MicrobiotaEngine();

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

type SourceRow = { id: string; citation: string; url: string | null };

function nutrientValue(nutrients: NutrientRow[], code: string): number {
  return nutrients.find((n) => n.nutrient_code === code)?.value ?? 0;
}

// Per alcuni nutrienti il modello vuole un valore PER-ALIMENTO (es. la
// quota di acido folico in un alimento fortificato), ma non è un numero
// a cui serve un'unità "mg"/"mcg" diversa da quella già nel codice
// nutriente -- questa funzione serve solo a rendere leggibile l'origine
// quando un dato manca (0 per assenza di riga, non per valore misurato
// a zero -- distinzione che il pannello "Perché questo numero?" rende
// visibile mostrando le sourceIds, non solo il numero).
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
    // Default 'cooked_or_disrupted' quando il DB non ha il campo: è il
    // default meno "generoso" già usato nei test (makeFood), non una
    // scelta che gonfia artificialmente la vitamina A per un alimento
    // di cui non sappiamo lo stato della matrice.
    carotenoid_matrix_state: row.carotenoid_matrix_state ?? 'cooked_or_disrupted',
    zinc_bioaccessibility_bucket: row.zinc_bioaccessibility_bucket ?? 'none',
    magnesium_mg: nutrientValue(nutrients, 'magnesium_mg'),
    copper_mg: nutrientValue(nutrients, 'copper_mg'),
    selenium_mcg: nutrientValue(nutrients, 'selenium_mcg'),
    iodine_mcg: nutrientValue(nutrients, 'iodine_mcg'),
    vitamin_k_mcg: nutrientValue(nutrients, 'vitamin_k_mcg'),
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
                      src.url ? (
                        <a href={src.url} target="_blank" rel="noreferrer" className="underline">
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
  const [sourcesMap, setSourcesMap] = useState<Record<string, SourceRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllData() {
      // Solo foods_raw con verification_status='verified' -- roadmap §10
      // punto 3, e sono i 20 alimenti promossi in
      // golden_set_promote_verified.sql. ATTENZIONE: qui le nutrient_values
      // NON vengono filtrate per il loro proprio verification_status.
      // Motivo: 3 righe (ossalati spinaci/kale, fitati fagioli rossi) sono
      // state lette direttamente dal paper citato in una sessione
      // precedente ma restano 'draft' perché non ri-controllate nel
      // cross-check di oggi (vedi docs/PRD.md §4.6) -- NON perché sospette.
      // Escluderle qui (es. con un filtro .eq su nutrient_values.verification_status)
      // azzererebbe silenziosamente l'effetto inibitorio di fitati/ossalati
      // nel calcolo di ferro/calcio sotto, SOVRASTIMANDO l'assorbimento
      // reale per quei 3 alimenti -- un errore più grave che mostrare un
      // dato ancora 'draft'. Il pannello "Perché questo numero?" resta
      // comunque fedele: mostra la fonte reale (NOONAN_SAVAGE_1999_APJCN
      // ecc.), non nasconde che si tratta di letteratura, non di FDC.
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

      const { data: sourcesData, error: sourcesError } = await supabase
        .from('sources')
        .select('id, citation, url');
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Golden Set — 20 alimenti verificati</h1>
            <p className="text-slate-500">
              Biodisponibilità reale, microbiota, ogni numero con fonte, livello di evidenza e stato —
              apri &quot;perché questo numero?&quot; su qualunque valore calcolato.
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
          <p className="text-slate-500">
            Nessun alimento con verification_status=&apos;verified&apos; trovato. Hai eseguito
            golden_set_foods.sql e golden_set_promote_verified.sql su questo progetto Supabase?
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {foods.map((row) => {
            const item = foodRowToFoodItem(row);
            const meal = { foods: [item] };
            const draftNutrients = (row.nutrient_values ?? []).filter(
              (n) => n.verification_status === 'draft'
            );

            const ironScore = nutritionEngine.calculateBioavailableIron(meal);
            const zincScore = nutritionEngine.calculateBioavailableZinc(meal);
            const calciumScore = nutritionEngine.calculateBioavailableCalcium(meal);
            const b12Score = nutritionEngine.calculateBioavailableB12(meal);
            const folateScore = nutritionEngine.calculateFolateDFE(meal);
            const vitaminAScore = nutritionEngine.calculateVitaminARAE(meal);
            const magnesiumScore = nutritionEngine.calculateMagnesium(meal);
            const copperScore = nutritionEngine.calculateCopper(meal);
            const seleniumScore = nutritionEngine.calculateSelenium(meal);
            const iodineScore = nutritionEngine.calculateIodine(meal);
            const vitaminKScore = nutritionEngine.calculateVitaminK(meal);
            const microbiotaScores = microbiotaEngine.calculateMicrobiotaImpactScore(meal);

            return (
              <div
                key={row.food_id}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{row.name_it}</h2>
                      <span className="text-xs text-slate-400 uppercase tracking-widest">
                        {row.botanical_family || 'Matrice animale'} · {row.matrix_id}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {row.is_fortified_folate && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-1">
                          fortificato (folato)
                        </span>
                      )}
                      {draftNutrients.length > 0 && (
                        <span
                          title={`Da letteratura, non ancora cross-checkata oggi: ${draftNutrients
                            .map((n) => n.nutrient_code)
                            .join(', ')} (vedi docs/PRD.md §4.6)`}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-1 cursor-help"
                        >
                          {draftNutrients.length} valore{draftNutrients.length > 1 ? 'i' : ''} draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Ferro (composizione)</span>
                      <strong className="text-lg text-slate-700">{item.iron_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Vitamina C (composizione)</span>
                      <strong className="text-lg text-slate-700">{item.vitamin_c_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Zinco (composizione)</span>
                      <strong className="text-lg text-slate-700">{item.zinc_mg} mg</strong>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Calcio (composizione)</span>
                      <strong className="text-lg text-slate-700">{item.calcium_mg} mg</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                  <div className="bg-slate-900 p-5 rounded-2xl flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-700 pb-2">
                      Asse microbiota
                    </h4>
                    <MetricRow label="MACs" unit="/100" result={microbiotaScores.macsScore} sourcesMap={sourcesMap} />
                    <MetricRow
                      label="Polifenoli"
                      unit="/100"
                      result={microbiotaScores.polyphenolsScore}
                      sourcesMap={sourcesMap}
                    />
                  </div>

                  <div className="bg-indigo-950 p-5 rounded-2xl flex flex-col border border-indigo-900/50">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2 border-b border-indigo-800/50 pb-2">
                      Assorbimento / composizione
                    </h4>
                    <MetricRow label="Ferro assorbito" unit="mg" result={ironScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Zinco assorbito" unit="mg" result={zincScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Calcio assorbito" unit="mg" result={calciumScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Vitamina B12 assorbita" unit="µg" result={b12Score} sourcesMap={sourcesMap} />
                    <MetricRow label="Folati (DFE)" unit="µg" result={folateScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Vitamina A (RAE)" unit="µg" result={vitaminAScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Magnesio" unit="mg" result={magnesiumScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Rame" unit="mg" result={copperScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Selenio" unit="µg" result={seleniumScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Iodio" unit="µg" result={iodineScore} sourcesMap={sourcesMap} />
                    <MetricRow label="Vitamina K" unit="µg" result={vitaminKScore} sourcesMap={sourcesMap} />
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
