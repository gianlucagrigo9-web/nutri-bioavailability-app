// lib/engine/dietGenerator.ts
//
// Generazione di un piano alimentare (Fase pre-5, docs/PRD.md §4.9 --
// design chiuso il 2026-10-11, su istruzione esplicita dell'utente
// "chiudi queste [punto 4], poi IG CG"). Euristica golosa
// ("weakest-link first"), NESSUNA dipendenza esterna: tentato
// `npm install` di una libreria LP/MILP in questa sessione per validare
// un vero solver prima di raccomandarlo, ma registry.npmjs.org non era
// risolvibile da questo sandbox in questa sessione (rete generale, non
// solo il blocco già noto verso Supabase/FDC) -- impossibile validare
// qui una dipendenza esterna, quindi si resta su un'euristica scrivibile
// e testabile subito, spiegabile passo-passo (coerente col pannello
// "Perché questo numero?" di tutta l'app). DICHIARATO ESPLICITAMENTE:
// non garantisce l'ottimo globale come farebbe un vero solver LP/MILP --
// se in futuro una libreria risulta installabile e si vuole l'ottimo
// garantito, questa euristica resta un limite di paragone utile, non va
// scartata.
//
// Opera SOLO su composizione grezza (campi NutrientFieldName di
// FoodItem) -- l'integrazione coi valori bioavailability-adjusted dei
// motori esistenti (ferro/zinco/calcio/B12/folato/vitaminaA) e'
// deliberatamente rimandata: richiederebbe invocare quei motori con uno
// stato di cottura per ogni alimento candidato, un livello di
// integrazione non ancora progettato. Dichiarato come gap, non nascosto.

import { FoodItem, NutrientFieldName } from "./types";
import { calculateMAR, findBottleneckNutrient, NutrientRequirement } from "./dietAdequacy";

export interface DietNutrientTarget {
  nutrientCode: NutrientFieldName;
  target: number; // LARN/EFSA o AMDR -- NON popolato con valori reali in questo file, responsabilita' del chiamante
}

export interface DietGeneratorOptions {
  // Placeholder NON sourced (dichiarato in testa al file e nel PRD §4.9):
  // massimo grammi per singolo alimento, per evitare soluzioni assurde
  // ("2kg di spinaci"). Da sostituire con un valore sourced (es.
  // porzioni standard INRAN/CREA) quando disponibile.
  maxGramsPerFood?: number;
  stepGrams?: number; // granularita' di ogni incremento (default 10g)
  energyToleranceKcal?: number; // quanto puo' discostarsi dal target energetico (default 5%)
  maxIterations?: number; // guardia difensiva anti-loop-infinito
}

export interface DietGeneratorResult {
  foods: Array<{ food: FoodItem; grams: number }>;
  mar: number;
  narByNutrient: Record<string, number>;
  warnings: string[]; // mai silenziati -- limiti/gap dichiarati qui (Regola 6)
}

const DEFAULT_MAX_GRAMS_PER_FOOD = 300; // placeholder non sourced, vedi commento di testa
const DEFAULT_STEP_GRAMS = 10;
const DEFAULT_ENERGY_TOLERANCE_FRACTION = 0.05;
const DEFAULT_MAX_ITERATIONS = 100_000;

function computeIntake(
  gramsByFoodId: Map<string, number>,
  candidateFoods: FoodItem[],
  nutrientCode: NutrientFieldName
): number {
  let total = 0;
  for (const food of candidateFoods) {
    const grams = gramsByFoodId.get(food.id) ?? 0;
    if (grams <= 0) continue;
    total += (food[nutrientCode] as number) * (grams / 100);
  }
  return total;
}

/**
 * Genera un piano alimentare dai soli `candidateFoods` (già filtrati per
 * tipo-dieta da dietTypeFilter.ts -- questa funzione non applica quel
 * filtro, lo assume già fatto), massimizzando il MAR entro il budget
 * energetico `targetKcal` (input diretto dell'utente, Regola 2026-10-11
 * "togliamo il calcolo del fabbisogno, mettiamo solo l'opzione di
 * settare le kcal").
 *
 * Architettura difensiva: nessun input non fisico produce un'eccezione
 * non gestita o un valore inventato -- vedi i warning restituiti.
 */
export function generateDiet(
  candidateFoods: FoodItem[],
  requirements: DietNutrientTarget[],
  targetKcal: number,
  options: DietGeneratorOptions = {}
): DietGeneratorResult {
  const warnings: string[] = [];

  if (candidateFoods.length === 0) {
    return { foods: [], mar: 0, narByNutrient: {}, warnings: ["nessun alimento candidato (controllare il filtro tipo-dieta)"] };
  }
  if (!Number.isFinite(targetKcal) || targetKcal <= 0) {
    return { foods: [], mar: 0, narByNutrient: {}, warnings: ["targetKcal non valido (deve essere un numero positivo)"] };
  }

  const maxGramsPerFood = options.maxGramsPerFood ?? DEFAULT_MAX_GRAMS_PER_FOOD;
  if (!options.maxGramsPerFood) {
    warnings.push(
      `maxGramsPerFood non specificato: usato un placeholder non sourced (${DEFAULT_MAX_GRAMS_PER_FOOD}g) -- vedi docs/PRD.md §4.9, gap dichiarato.`
    );
  }
  const stepGrams = options.stepGrams ?? DEFAULT_STEP_GRAMS;
  const energyTolerance = (options.energyToleranceKcal ?? targetKcal * DEFAULT_ENERGY_TOLERANCE_FRACTION);
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;

  const foodsWithEnergy = candidateFoods.filter((f) => f.energy_kcal > 0);
  const skippedZeroEnergy = candidateFoods.length - foodsWithEnergy.length;
  if (skippedZeroEnergy > 0) {
    warnings.push(
      `${skippedZeroEnergy} alimento/i candidato/i con energy_kcal <= 0 ignorato/i da questa euristica (evita divisioni per zero e priorità non fisiche).`
    );
  }
  if (foodsWithEnergy.length === 0) {
    return { foods: [], mar: 0, narByNutrient: {}, warnings: [...warnings, "nessun alimento candidato con energy_kcal > 0, impossibile procedere"] };
  }

  const gramsByFoodId = new Map<string, number>(foodsWithEnergy.map((f) => [f.id, 0]));
  let remainingKcal = targetKcal;
  let iterations = 0;
  let stoppedByIterationCap = false;

  while (remainingKcal > energyTolerance) {
    if (iterations++ >= maxIterations) {
      stoppedByIterationCap = true;
      break;
    }

    const narRequirements: NutrientRequirement[] = requirements.map((r) => ({
      nutrientCode: r.nutrientCode,
      intake: computeIntake(gramsByFoodId, foodsWithEnergy, r.nutrientCode),
      target: r.target,
    }));
    const { narByNutrient } = calculateMAR(narRequirements);
    const bottleneck = findBottleneckNutrient(narByNutrient) as NutrientFieldName | null;
    if (bottleneck === null) break; // nessun requisito valido fornito -- niente da ottimizzare

    let bestFood: FoodItem | null = null;
    let bestDensity = -Infinity;
    for (const food of foodsWithEnergy) {
      const currentGrams = gramsByFoodId.get(food.id) ?? 0;
      if (currentGrams + stepGrams > maxGramsPerFood) continue;
      const kcalCost = (food.energy_kcal / 100) * stepGrams;
      if (remainingKcal - kcalCost < -energyTolerance) continue; // non sforare troppo il budget
      const density = food[bottleneck] / food.energy_kcal; // nutriente per kcal, non per grammo (il costo è in kcal)
      if (density > bestDensity) {
        bestDensity = density;
        bestFood = food;
      }
    }

    if (bestFood === null) break; // nessun alimento può più migliorare il collo di bottiglia senza sforare un vincolo

    const kcalCost = (bestFood.energy_kcal / 100) * stepGrams;
    gramsByFoodId.set(bestFood.id, (gramsByFoodId.get(bestFood.id) ?? 0) + stepGrams);
    remainingKcal -= kcalCost;
  }

  if (stoppedByIterationCap) {
    warnings.push(`fermato dopo ${maxIterations} iterazioni (guardia anti-loop-infinito) -- il budget energetico potrebbe non essere stato esaurito.`);
  }

  const finalRequirements: NutrientRequirement[] = requirements.map((r) => ({
    nutrientCode: r.nutrientCode,
    intake: computeIntake(gramsByFoodId, foodsWithEnergy, r.nutrientCode),
    target: r.target,
  }));
  const { mar, narByNutrient, excludedNutrients } = calculateMAR(finalRequirements);
  if (excludedNutrients.length > 0) {
    warnings.push(`nutrienti esclusi dal MAR per target non valido: ${excludedNutrients.join(", ")}`);
  }

  const foods = foodsWithEnergy
    .map((food) => ({ food, grams: gramsByFoodId.get(food.id) ?? 0 }))
    .filter((entry) => entry.grams > 0);

  return { foods, mar, narByNutrient, warnings };
}
