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
  vitamin_k: "vitamin_k_mcg"
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

    return cookedFood;
  }
}
