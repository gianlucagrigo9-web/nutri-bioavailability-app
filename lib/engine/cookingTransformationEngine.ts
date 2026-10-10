// lib/engine/cookingTransformationEngine.ts
//
// Correzione rispetto alla versione precedente: prima questo motore
// dichiarava di accettare un NutritionFoodItem (iron_mg, zinc_mg...) ma
// nella dashboard veniva chiamato passandogli un FoodItemMicrobiota
// (macs_mg, botanical_family...) tramite un oggetto tipizzato `any` --
// un bypass del controllo dei tipi che nascondeva il problema invece di
// risolverlo. Ora entrambi i motori (nutrizione e microbiota) condividono
// lo stesso FoodItem da ./types, quindi questo motore puo' trasformare
// l'alimento una sola volta e il risultato e' valido per tutti i motori
// a valle, senza cast.
//
// Convenzione dei nomi: la colonna "nutrient" di retention_factors usa i
// codici SENZA suffisso _mg (es. "vitamin_c", "phytates", "polyphenols",
// "iron", "zinc", "oxalates", "macs") per coerenza con lo schema
// originale. La mappa sotto e' l'unico punto che traduce questi codici
// nei campi del FoodItem: se in futuro servisse un nuovo nutriente,
// aggiungilo qui, non con una nuova convenzione di nomi.

import { FoodItem } from "./types";

export interface RetentionFactorRecord {
  matrix_id: string;
  cooking_method: string;
  nutrient: string;
  value: number;
  confidence_low?: number | null;
  confidence_high?: number | null;
  source_id?: string;
}

const NUTRIENT_FIELD_MAP: Partial<Record<string, keyof FoodItem>> = {
  iron: "iron_mg",
  zinc: "zinc_mg",
  calcium: "calcium_mg",
  vitamin_c: "vitamin_c_mg",
  phytates: "phytates_mg",
  oxalates: "oxalates_mg",
  polyphenols: "polyphenols_mg",
  macs: "macs_mg",
  vitamin_b12: "vitamin_b12_mcg",
  folate: "folate_mcg",
  magnesium: "magnesium_mg",
  copper: "copper_mg",
  selenium: "selenium_mcg",
  iodine: "iodine_mcg",
  vitamin_k: "vitamin_k_mcg",
  // Aggiunti 2026-10-10 insieme ai macronutrienti in FoodItem. Nessuna riga
  // retention_factors usa ancora questi codici (nessun dato sourced
  // raccolto finora per le perdite di macro in cottura, es. USDA Release 6
  // le avrebbe per proteine/grassi/carboidrati/fibra ma non sono state
  // ancora trascritte) -- la mappatura esiste già per quando arriveranno,
  // coerente con la convenzione "un solo punto che traduce i codici".
  energy: "energy_kcal",
  protein: "protein_g",
  carbohydrates: "carbohydrates_g",
  fat: "fat_g",
  fiber: "fiber_g"
};

export class CookingTransformationEngine {
  public applyCookingTransformation(
    rawFood: FoodItem,
    matrixId: string,
    cookingMethod: string,
    dbRetentionFactors: RetentionFactorRecord[]
  ): FoodItem {
    if (cookingMethod === "raw" || !cookingMethod) {
      return { ...rawFood };
    }

    const relevantFactors = dbRetentionFactors.filter(
      rf => rf.matrix_id === matrixId && rf.cooking_method === cookingMethod
    );
    if (relevantFactors.length === 0) {
      return { ...rawFood };
    }

    const cookedFood = { ...rawFood };
    relevantFactors.forEach(factor => {
      const fieldName = NUTRIENT_FIELD_MAP[factor.nutrient];
      if (!fieldName) return; // nutriente non riconosciuto: non applicare nulla, non indovinare un campo
      const rawValue = cookedFood[fieldName];
      if (typeof rawValue === "number") {
        (cookedFood[fieldName] as number) = Number((rawValue * factor.value).toFixed(2));
      }
    });

    // Correzione 2026-10-10: finche' nessun cibo del Golden Set aveva SIA
    // un fattore di ritenzione reale SIA beta_carotene_mcg > 0, questo
    // bug restava latente. carotenoid_matrix_state descrive se la matrice
    // e' fisicamente intatta (Livny 2003) -- qualunque cottura REALMENTE
    // applicata (cioe' per cui esiste almeno un fattore di ritenzione,
    // come appena verificato sopra) la disgrega, quindi non puo' restare
    // 'raw_intact' nel risultato. Il contenuto di beta-carotene stesso
    // NON viene scalato qui da nessun fattore di ritenzione (vedi
    // NUTRIENT_FIELD_MAP e DERIVED_FDC_RAW_COOKED_RATIO in
    // generate_golden_set_foods.py): lo fa gia' questo flip, a valle, nel
    // motore di conversione RAE -- scalarlo anche qui conterebbe due
    // volte lo stesso effetto di disgregazione.
    cookedFood.carotenoid_matrix_state = "cooked_or_disrupted";

    // Correzione 2026-10-10 (stesso bug latente del flip sopra, scoperto
    // estendendo la stessa policy a cavoletti di Bruxelles/spinaci):
    // zinc_bioaccessibility_bucket alimenta calculateBioavailableZinc in
    // computationalNutritionEngine.ts, che applica il derating di
    // biodisponibilita' zinco misurato da Doniec et al. 2022 SOLO per i
    // bucket 'brussels_sprouts_boiled'/'brussels_sprouts_steamed'. Senza
    // questo flip, selezionare "Bollito"/"Vapore" per i cavoletti di
    // Bruxelles scalava gia' correttamente zinc_mg tramite i fattori di
    // ritenzione (verified, sopra) ma NON attivava il derating aggiuntivo
    // di biodisponibilita' -- un secondo bug della stessa famiglia del
    // carotenoid_matrix_state, rimasto latente per lo stesso motivo (nessun
    // cibo del Golden Set esercitava ancora questo percorso).
    //
    // A differenza del flip di carotenoid_matrix_state (generico, valido
    // per qualunque matrice/cottura con un fattore di ritenzione reale),
    // questo flip NON puo' essere generico: il commento in types.ts e'
    // esplicito sul fatto che Doniec et al. 2022 hanno misurato SOLO
    // cavoletti di Bruxelles e che il risultato non generalizza ad altre
    // crucifere. Va quindi scoped esplicitamente a questa matrice e a
    // questi due metodi di cottura, non triggerato da "matrixId esiste
    // nei fattori di ritenzione" come il flip sopra.
    if (matrixId === "crucifere_cavoletti_bruxelles") {
      if (cookingMethod === "boiled") {
        cookedFood.zinc_bioaccessibility_bucket = "brussels_sprouts_boiled";
      } else if (cookingMethod === "steamed") {
        cookedFood.zinc_bioaccessibility_bucket = "brussels_sprouts_steamed";
      }
    }

    return cookedFood;
  }
}
