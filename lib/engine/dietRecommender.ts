// lib/engine/dietRecommender.ts
//
// Recommender "Pareto-superiore" (Fase pre-5, docs/PRD.md §4.9): dato
// il piano attuale dell'utente, trova fino a 4 sostituzioni che lo
// migliorano, confrontando SOLO alimenti dello stesso contesto d'uso
// (mai una bistecca con verdure contro pane e Nutella -- esempio
// esplicito dell'utente).
//
// **RIAPERTO/PARCHEGGIATO il 2026-10-11, DOPO questa prima
// implementazione** -- l'utente ha segnalato che il modello di
// "contesto" qui sotto (una stringa fissa tipo "colazione"/"pranzo") e
// la regola "un alimento sostituito non puo' essere sostituito di nuovo"
// (`touchedIndices`) sono entrambe semplificazioni non ancora
// validate, non un design chiuso:
// - uno stesso alimento puo' avere flessibilita' di contesto diversa
//   (le uova si possono mangiare anche a colazione; uno stufato no) --
//   un contesto binario "stesso slot pasto o niente" non lo rappresenta.
// - cambiare un cereale a pranzo potrebbe avere senso guardando anche
//   agli altri pasti della giornata (es. se la colazione ha già un
//   cereale migliore), non solo al pool dello stesso contesto isolato.
// - la regola che impedisce di ri-toccare un indice già sostituito non
//   ha una giustificazione data all'utente (era solo una scelta di
//   semplicità per limitare la ricerca) ed è stata esplicitamente
//   contestata ("per me puoi anche cambiare un alimento che hai già
//   cambiato, non ho capito quella regola").
// L'utente ha inoltre chiarito che questa intera feature (max 3-4
// alimenti da cambiare) e' SECONDARIA e rimandabile: "possiamo
// pensarci più avanti e andare avanti col resto". Il codice sotto
// RESTA com'era (compila, passa i test scritti per QUESTA versione
// semplificata) ma non va considerato un design approvato da estendere
// o da cui derivare altro finché non si torna su questo punto --
// vedi docs/PRD.md §4.9 per lo stato aggiornato.

import { FoodItem, NutrientFieldName } from "./types";
import { calculateMAR, NutrientRequirement } from "./dietAdequacy";
import { DietNutrientTarget } from "./dietGenerator";

export interface DietItem {
  food: FoodItem;
  grams: number;
  context: string;
}

export interface DietSwap {
  removed: DietItem;
  added: { food: FoodItem; grams: number; context: string };
  marAfterThisSwap: number;
}

export interface RecommenderResult {
  improved: boolean;
  swaps: DietSwap[];
  marBefore: number;
  marAfter: number;
  warnings: string[];
}

function computeIntakeFromDietItems(dietItems: DietItem[], nutrientCode: NutrientFieldName): number {
  let total = 0;
  for (const item of dietItems) {
    if (item.grams <= 0) continue;
    total += (item.food[nutrientCode] as number) * (item.grams / 100);
  }
  return total;
}

function computeMarForDiet(dietItems: DietItem[], requirements: DietNutrientTarget[]): number {
  const narRequirements: NutrientRequirement[] = requirements.map((r) => ({
    nutrientCode: r.nutrientCode,
    intake: computeIntakeFromDietItems(dietItems, r.nutrientCode),
    target: r.target,
  }));
  return calculateMAR(narRequirements).mar;
}

const DEFAULT_MAX_CHANGES = 4;

/**
 * Trova fino a `maxChanges` sostituzioni che migliorano il MAR del piano
 * attuale, confrontando solo alimenti dello stesso `context`.
 *
 * Architettura difensiva: piano vuoto, nessun requisito valido, o nessun
 * candidato per nessun contesto presente nel piano -> `improved: false`,
 * mai un'eccezione, mai un miglioramento inventato.
 */
export function findBestSwaps(
  currentDiet: DietItem[],
  candidatesByContext: Record<string, FoodItem[]>,
  requirements: DietNutrientTarget[],
  maxChanges: number = DEFAULT_MAX_CHANGES
): RecommenderResult {
  const warnings: string[] = [];

  if (currentDiet.length === 0) {
    return { improved: false, swaps: [], marBefore: 0, marAfter: 0, warnings: ["piano attuale vuoto, nessuna sostituzione possibile"] };
  }

  const marBefore = computeMarForDiet(currentDiet, requirements);

  let workingDiet = [...currentDiet];
  const swaps: DietSwap[] = [];
  const touchedIndices = new Set<number>();

  for (let step = 0; step < maxChanges; step++) {
    let bestGain = 0;
    let bestIndex = -1;
    let bestReplacement: FoodItem | null = null;
    let bestMar = computeMarForDiet(workingDiet, requirements);
    const marBeforeStep = bestMar;

    for (let i = 0; i < workingDiet.length; i++) {
      if (touchedIndices.has(i)) continue;
      const item = workingDiet[i];
      const candidates = candidatesByContext[item.context] ?? [];
      for (const candidate of candidates) {
        if (candidate.id === item.food.id) continue; // non e' una sostituzione
        const trialDiet = workingDiet.map((d, idx) => (idx === i ? { ...d, food: candidate } : d));
        const trialMar = computeMarForDiet(trialDiet, requirements);
        const gain = trialMar - marBeforeStep;
        if (gain > bestGain) {
          bestGain = gain;
          bestIndex = i;
          bestReplacement = candidate;
          bestMar = trialMar;
        }
      }
    }

    if (bestIndex === -1 || bestReplacement === null || bestGain <= 0) {
      break; // nessuna sostituzione residua migliora il MAR -- mai forzarne una
    }

    const removedItem = workingDiet[bestIndex];
    workingDiet = workingDiet.map((d, idx) => (idx === bestIndex ? { ...d, food: bestReplacement! } : d));
    touchedIndices.add(bestIndex);
    swaps.push({
      removed: removedItem,
      added: { food: bestReplacement, grams: removedItem.grams, context: removedItem.context },
      marAfterThisSwap: bestMar,
    });
  }

  const marAfter = swaps.length > 0 ? swaps[swaps.length - 1].marAfterThisSwap : marBefore;

  if (swaps.length === 0) {
    warnings.push("nessun miglioramento trovato entro il numero massimo di sostituzioni consentite");
  }

  return { improved: swaps.length > 0, swaps, marBefore, marAfter, warnings };
}
