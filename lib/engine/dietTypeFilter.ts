// lib/engine/dietTypeFilter.ts
//
// Filtro per tipo di dieta (Fase pre-5, docs/PRD.md §4.9 -- design chiuso
// il 2026-10-11): il primo passo del generatore di dieta e' scegliere il
// sottoinsieme di alimenti compatibile col tipo di dieta scelto
// dall'utente, PRIMA di qualunque ottimizzazione.
//
// "onnivora" non e' un valore distinto: nessun filtro, tutto compatibile.

import { FoodItem } from "./types";

export type DietType = "omnivore" | "vegetarian" | "vegan" | "fruitarian";

/**
 * Filtra una lista di FoodItem per compatibilita' col tipo di dieta
 * scelto.
 *
 * Architettura difensiva, dichiarata (Regola 6, non un bug): un FoodItem
 * SENZA `dietCompatibility` popolato (il caso di ogni alimento del
 * Golden Set oggi, 2026-10-11 -- classificazione non ancora fatta, vedi
 * PRD §4.9) viene escluso da qualunque filtro diverso da "omnivore",
 * MAI assunto compatibile per default. Il motivo: assumere compatibile
 * un alimento non classificato potrebbe silenziosamente proporre carne
 * a un utente vegano -- l'errore piu' grave possibile qui, quindi la
 * scelta difensiva e' nella direzione opposta (escludere, non includere,
 * quando l'informazione manca).
 */
export function filterFoodsByDietType(foods: FoodItem[], dietType: DietType): FoodItem[] {
  if (dietType === "omnivore") return foods;

  return foods.filter((food) => {
    if (!food.dietCompatibility) return false; // non classificato -> escluso, mai assunto compatibile
    return food.dietCompatibility[dietType] === true;
  });
}
