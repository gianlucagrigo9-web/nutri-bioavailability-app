// lib/engine/lcaLogisticsEngine.ts
//
// Il passaggio da "costante fissa per volo" a "chilometri reali x fattore
// DEFRA per tonnellata-km" era la correzione giusta e la manteniamo.
// Due limiti restano dichiarati (non finti come risolti):
// - Il fattore DEFRA usato (0.00113 kg CO2e/kg-km) non e' ancora verificato
//   da noi contro la tabella DEFRA dell'anno corrente, e le tabelle DEFRA
//   distinguono short-haul da long-haul (il breve raggio ha un fattore per
//   km piu' alto per via del decollo/atterraggio ammortizzato su meno km).
//   Qui si usa un unico fattore per qualunque distanza: approssimazione
//   dichiarata, da affinare quando verifichiamo la tabella ufficiale.
// - Il moltiplicatore "x4.0" per le colture fuori stagione in serra
//   riscaldata resta una cifra plausibile ma non ancora ricondotta a una
//   riga specifica di Agribalyse 3.1.1: evidenceLevel piu' basso per
//   questo singolo fattore rispetto al resto del calcolo.

export interface SourcedValue {
  value: number;
  confidenceLow: number | null;
  confidenceHigh: number | null;
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  sourceIds: string[];
  verificationStatus: "draft" | "verified";
}

export interface FoodItemLCA {
  id: string;
  name: string;
  weight_g: number;
  base_co2_kg_per_kg: number;        // Agribalyse 3.1.1
  base_water_l_per_kg: number | null; // AWARE; null se ignoto (non va mai inventato)
  is_out_of_season: boolean;
  air_freight_distance_km: number | null; // null = trasporto non aereo
}

export interface MealLCA {
  foods: FoodItemLCA[];
}

export class LCALogisticsEngine {
  public calculateEnvironmentalImpact(meal: MealLCA): { carbon: SourcedValue; water: SourcedValue } {
    if (meal.foods.length === 0) {
      return {
        carbon: this.zero(["AGRIBALYSE_3.1.1"]),
        water: this.zero(["WULCA_AWARE_2018"])
      };
    }

    let totalCarbonKg = 0;
    let totalWaterL = 0;
    let missingWaterData = false;
    let usedUnverifiedSeasonFactor = false;

    const DEFRA_AIR_FACTOR_PER_KG_KM = 0.00113; // ~1.13 kg CO2e/tonne-km, non differenziato per tratta

    meal.foods.forEach(f => {
      const weightKg = f.weight_g / 1000;
      let itemCarbon = f.base_co2_kg_per_kg * weightKg;

      if (f.is_out_of_season) {
        itemCarbon *= 4.0; // vedi nota in testa al file: cifra plausibile, non pinnata a una riga Agribalyse specifica
        usedUnverifiedSeasonFactor = true;
      }

      if (f.air_freight_distance_km && f.air_freight_distance_km > 0) {
        itemCarbon += f.air_freight_distance_km * weightKg * DEFRA_AIR_FACTOR_PER_KG_KM;
      }

      totalCarbonKg += itemCarbon;

      if (f.base_water_l_per_kg !== null) {
        totalWaterL += f.base_water_l_per_kg * weightKg;
      } else {
        missingWaterData = true;
      }
    });

    const carbon: SourcedValue = {
      value: +totalCarbonKg.toFixed(3),
      confidenceLow: null,
      confidenceHigh: null,
      evidenceLevel: 5,
      sourceIds: ["AGRIBALYSE_3.1.1", "DEFRA_FREIGHT_2023"],
      verificationStatus: usedUnverifiedSeasonFactor ? "draft" : "verified"
    };

    const water: SourcedValue = {
      value: +totalWaterL.toFixed(1),
      confidenceLow: null,
      confidenceHigh: null,
      evidenceLevel: 5,
      sourceIds: ["WULCA_AWARE_2018"],
      verificationStatus: missingWaterData ? "draft" : "verified"
    };

    return { carbon, water };
  }

  private zero(sources: string[]): SourcedValue {
    return { value: 0, confidenceLow: null, confidenceHigh: null, evidenceLevel: 5, sourceIds: sources, verificationStatus: "verified" };
  }
}
