// lib/fdc/dietCategory.ts
//
// Categoria di compatibilita' dieta per gli alimenti aggiunti da
// scripts/add_food_from_fdc.ts (docs/PRD.md §4.9 e §9 Fase 4.16).
// Criteri di accettazione: tests/dietCategory.test.ts (scritti prima di
// questo file, Regola 5).
//
// PERCHE' ESISTE. Lo script add-food non scriveva le tre colonne
// foods_raw.diet_compat_vegetarian/vegan/fruitarian: ogni alimento nuovo
// restava NULL ("non classificato") e lib/engine/dietTypeFilter.ts lo
// esclude da qualunque dieta diversa da "onnivora" (scelta difensiva
// corretta: mai assumere compatibile cio' che non e' classificato). Senza
// questo, la copertura cresceva solo per chi mangia di tutto -- un
// fallimento silenzioso (Regola 4).
//
// COME. La classificazione resta una decisione EDITORIALE (non derivabile
// da un solo campo, vedi add_diet_compatibility_golden_set.sql): chi lancia
// lo script la dichiara con UNA categoria fra le quattro gia' usate dal
// Golden Set -- non tre booleani liberi, cosi' una combinazione incoerente
// (es. vegano ma non vegetariano) non e' nemmeno esprimibile. I flag NON
// sono duplicati qui: sono le stesse costanti di
// lib/engine/goldenSetDietCompatibility.ts (singola fonte di verita').
//
// Funzioni pure, nessuna dipendenza di rete o di ambiente.

import {
  EGG_DAIRY,
  FRESH_FRUIT,
  MEAT_FISH,
  PLANT_NON_FRUIT,
  type DietCompatibilityFlags,
} from "../engine/goldenSetDietCompatibility";

const CATEGORY_FLAGS = {
  // Carne, pesce, pollame, frattaglie.
  meat_fish: MEAT_FISH,
  // Uova, latticini, miele: vegetariano si', vegano no.
  egg_dairy: EGG_DAIRY,
  // Frutta fresca (definizione restrittiva del PRD: non frutta secca, non
  // ortaggi botanicamente "frutto" come pomodoro/zucchina/melanzana).
  fresh_fruit: FRESH_FRUIT,
  // Verdure (inclusi ortaggi botanicamente "frutto" come pomodoro, zucchina,
  // melanzana), legumi, cereali, tuberi, funghi (non animali), frutta
  // secca/a guscio, semi, oli vegetali, zucchero: vegetariano e vegano si',
  // fruttariano no.
  plant_non_fruit: PLANT_NON_FRUIT,
} as const satisfies Record<string, DietCompatibilityFlags>;

export type DietCategory = keyof typeof CATEGORY_FLAGS;

export const DIET_CATEGORY_NAMES = Object.keys(CATEGORY_FLAGS) as DietCategory[];

export type ParseDietCategoryResult =
  | { ok: true; category: DietCategory; flags: DietCompatibilityFlags }
  | { ok: false; error: string };

/**
 * Valida il valore di --diet-category. Nessun default, nessuna
 * normalizzazione (maiuscole/spazi): un valore mancante o non esatto e'
 * un errore, mai una categoria indovinata -- sbagliare in silenzio su un
 * alimento di origine animale proporrebbe carne a un utente vegano.
 */
export function parseDietCategory(value: string | null): ParseDietCategoryResult {
  const valid = DIET_CATEGORY_NAMES.join(", ");
  if (value === null) {
    return {
      ok: false,
      error: `--diet-category obbligatorio -- senza, l'alimento resterebbe non classificato e sparirebbe dai filtri vegetariano/vegano/fruttariano. Valori: ${valid}`,
    };
  }
  // Object.hasOwn-style check: niente chiavi ereditate da Object.prototype.
  if (!Object.prototype.hasOwnProperty.call(CATEGORY_FLAGS, value)) {
    return { ok: false, error: `--diet-category non valido: "${value}" -- atteso esattamente uno fra: ${valid}` };
  }
  const category = value as DietCategory;
  // Copia: chi riceve il risultato non puo' alterare la tabella condivisa.
  return { ok: true, category, flags: { ...CATEGORY_FLAGS[category] } };
}

/** Nomi colonna esatti di foods_raw (add_diet_compatibility_golden_set.sql). */
export function dietFlagsToColumns(flags: DietCompatibilityFlags): {
  diet_compat_vegetarian: boolean;
  diet_compat_vegan: boolean;
  diet_compat_fruitarian: boolean;
} {
  return {
    diet_compat_vegetarian: flags.vegetarian,
    diet_compat_vegan: flags.vegan,
    diet_compat_fruitarian: flags.fruitarian,
  };
}
