// lib/engine/microbiotaEngine.ts
//
// La separazione in due SourcedValue indipendenti (MACs e Polifenoli) e'
// corretta e la manteniamo: fondere i due domini in un unico punteggio
// richiederebbe un peso relativo (es. 70/30) che nessuna fonte giustifica.
//
// Correzioni rispetto alla versione precedente:
// - polyphenolsScore non cita piu' MCDONALD_2018_MSYSTEMS da solo: quel
//   paper riguarda la diversita' del microbiota (American Gut Project), non
//   il metabolismo dei polifenoli. E' stato spostato dove pertiene (la
//   diversita' botanica) e il punteggio polifenoli resta senza una fonte
//   quantitativa dedicata finche' non ne troviamo una: evidenceLevel 4
//   (meccanicistico/non quantificato), non piu' 2.
// - Le costanti Km (5g per i MACs, 0.5g per i polifenoli) e il moltiplicatore
//   di diversita' (log10 x 0.15) restano forme funzionali plausibili ma SENZA
//   una fonte che ne giustifichi il valore esatto: lo dichiariamo nel commento
//   invece di citare papers che non le supportano a quel livello di dettaglio.
// - La soglia di tolleranza (15g/pasto, 45g/die) cita Grabitske & Slavin 2008,
//   paper reale e pertinente, ma la soglia numerica esatta e' una nostra
//   approssimazione: la tolleranza varia di un fattore 6-7x a seconda del
//   tipo di MAC (da ~3.75g/d per l'alginato a ~25g/d per la fibra di soia),
//   quindi una soglia unica per "i MACs" e' una semplificazione dichiarata.

import { SourcedValue, Meal, DailyDiet, FoodItem, isDailyDiet, flattenFoods, createZeroValue } from "./types";

export interface MicrobiotaScores {
  macsScore: SourcedValue;
  polyphenolsScore: SourcedValue;
}

export class MicrobiotaEngine {
  public calculateMicrobiotaImpactScore(context: Meal | DailyDiet): MicrobiotaScores {
    const foods = flattenFoods(context);
    const daily = isDailyDiet(context);

    if (foods.length === 0) {
      return {
        macsScore: createZeroValue(["SONNENBURG_2016_CELL", "GRABITSKE_SLAVIN_2008_CRFSN"]),
        polyphenolsScore: createZeroValue(["SONNENBURG_2016_CELL"])
      };
    }

    let totalMacsMg = 0;
    let totalPolyphenolsMg = 0;
    const uniqueBotanicalFamilies = new Set<string>();

    foods.forEach(f => {
      totalMacsMg += f.macs_mg;
      totalPolyphenolsMg += f.polyphenols_mg;
      if (f.botanical_family && (f.macs_mg > 0 || f.polyphenols_mg > 0)) {
        uniqueBotanicalFamilies.add(f.botanical_family);
      }
    });

    const totalMacsGrams = totalMacsMg / 1000;
    const totalPolyphenolsGrams = totalPolyphenolsMg / 1000;

    // Soglia di tolleranza GI (Grabitske & Slavin 2008), approssimata e
    // dichiarata come tale: varia molto per tipo di MAC nella letteratura.
    const MAC_TOLERANCE_G = daily ? 45 : 15;
    const effectiveMacsGrams = Math.min(totalMacsGrams, MAC_TOLERANCE_G);

    // Km non sourced, forma a saturazione scelta per plausibilita' fisiologica
    const macsBaseScore = (effectiveMacsGrams / (5 + effectiveMacsGrams)) * 100;
    const polyBaseScore = (totalPolyphenolsGrams / (0.5 + totalPolyphenolsGrams)) * 100;

    // Moltiplicatore di diversita': forma log non sourced a livello di
    // singola formula (McDonald et al. 2018 supporta il concetto generale
    // -- piu' specie vegetali, migliore la diversita' del microbiota --
    // non questa specifica curva).
    const botanicalCount = uniqueBotanicalFamilies.size;
    const diversityMultiplier = botanicalCount > 1 ? 1 + Math.log10(botanicalCount) * 0.15 : 1.0;

    const finalMacs = Math.min(macsBaseScore * diversityMultiplier, 100);
    const finalPoly = Math.min(polyBaseScore * diversityMultiplier, 100);

    return {
      macsScore: {
        value: +finalMacs.toFixed(1),
        confidenceLow: null,
        confidenceHigh: null,
        evidenceLevel: 3, // concetto da Sonnenburg (modelli animali) + soglia da Grabitske&Slavin (umani, ma soglia approssimata)
        sourceIds: ["SONNENBURG_2016_CELL", "GRABITSKE_SLAVIN_2008_CRFSN", "MCDONALD_2018_MSYSTEMS"],
        verificationStatus: "draft"
      },
      polyphenolsScore: {
        value: +finalPoly.toFixed(1),
        confidenceLow: null,
        confidenceHigh: null,
        evidenceLevel: 4, // meccanicistico: nessuna fonte quantitativa dedicata trovata finora
        sourceIds: ["SONNENBURG_2016_CELL"],
        verificationStatus: "draft"
      }
    };
  }
}
