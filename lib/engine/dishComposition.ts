// lib/engine/dishComposition.ts
//
// Piatti tradizionali/compositi (es. "pasta al pomodoro"): design approvato
// dall'utente in docs/PRD.md §4.8 il 2026-10-11 ("mi piace più il concetto
// di due tabelle leggere per mantenere dinamicità... perché ognuno possa
// aggiungere o togliere qualcosa senza sfanculare tutto").
//
// SCELTA ARCHITETTURALE (chiarita durante l'implementazione, non ancora
// nella bozza originale di §4.8): un dish_template NON viene espanso in un
// unico FoodItem fuso/sommato. Viene invece espanso in una LISTA di
// FoodItem -- uno per componente, ciascuno scalato alla propria
// grammatura -- che il Meal Builder aggiunge al pasto esattamente come se
// l'utente avesse scelto quei food uno per uno. Motivo: i campi categorici
// di FoodItem (is_heme_iron, matrix_category_calcium,
// carotenoid_matrix_state, zinc_bioaccessibility_bucket, ecc.) sono
// significativi SOLO per singolo alimento -- i motori di calcolo (ferro,
// zinco, calcio) già iterano un Meal.foods eterogeneo applicando le
// proprie regole food-per-food. "Fondere" i componenti in un solo
// FoodItem richiederebbe di fondere anche quei campi categorici (es. che
// matrix_category_calcium assegnare a "pasta al pomodoro", che mischia
// pomodoro ad alto contenuto di ossalati e pasta che non ne ha?) -- una
// decisione arbitraria che la Regola 1 (zero dati inventati) non
// permette. Espandere in più FoodItem evita il problema: ogni componente
// mantiene i propri dati reali, nessuna fusione.
//
// Conseguenza pratica: questo file non introduce NESSUNA nuova logica di
// calcolo nutrizionale -- riusa solo scaleFoodItemToGrams, già testato.

import { FoodItem, scaleFoodItemToGrams } from "./types";

export interface DishComponentInput {
  food: FoodItem;
  gramsPerServing: number;
}

/**
 * Espande i componenti di un dish_template (letti da dish_components,
 * uniti ai rispettivi foods_raw/nutrient_values) nella lista di FoodItem
 * da aggiungere al pasto corrente -- ciascuno scalato alla propria
 * grammatura e marcato isCompositeDish/compositeDishSourceId per
 * azionare il badge "Ricetta stimata" in UI.
 *
 * Architettura difensiva: un array vuoto restituisce un array vuoto
 * (nessuna eccezione) -- un dish_template senza componenti è un dato
 * incompleto, non un errore di questa funzione; la responsabilità di
 * segnalarlo (es. in fase di lettura dal DB) è di chi la chiama.
 */
export function expandDishComponentsToFoodItems(
  components: DishComponentInput[],
  dishSourceId: string
): FoodItem[] {
  return components.map(({ food, gramsPerServing }) => {
    const scaled = scaleFoodItemToGrams(food, gramsPerServing);
    return {
      ...scaled,
      isCompositeDish: true,
      compositeDishSourceId: dishSourceId,
    };
  });
}

/**
 * Range di confidenza del piatto per UN SOLO campo nutriente (Regola 2 --
 * mai inventare un range che il dato non ha). Propagazione lineare
 * attraverso la somma: se ANCHE UN SOLO componente non ha un range per
 * quel campo (confidenceLow/confidenceHigh null, cioè la fonte non lo
 * riporta), il totale del piatto non ha un range per quel campo --
 * sommare un numero certo a un range noto non restituisce un range
 * valido, restituirebbe un falso senso di precisione.
 *
 * Nota: questa funzione opera sui SourcedValue già calcolati dai motori
 * (non sui FoodItem grezzi), quindi non duplica la logica di
 * scaleFoodItemToGrams -- è un'utility pensata per un futuro "totale del
 * piatto" mostrato in UI, non ancora wired in app/page.tsx (stesso tipo
 * di gap dichiarato per nutrientSourceIds in §4.7: infrastruttura pronta,
 * nessun caso reale da mostrare finché non esiste un primo dish_template
 * verificato).
 */
export function sumConfidenceRange(
  values: Array<{ value: number; confidenceLow: number | null; confidenceHigh: number | null }>
): { value: number; confidenceLow: number | null; confidenceHigh: number | null } {
  const value = values.reduce((sum, v) => sum + v.value, 0);
  const anyMissing = values.some(v => v.confidenceLow === null || v.confidenceHigh === null);
  if (anyMissing || values.length === 0) {
    return { value, confidenceLow: null, confidenceHigh: null };
  }
  const confidenceLow = values.reduce((sum, v) => sum + (v.confidenceLow as number), 0);
  const confidenceHigh = values.reduce((sum, v) => sum + (v.confidenceHigh as number), 0);
  return { value, confidenceLow, confidenceHigh };
}
