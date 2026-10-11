// lib/engine/dietAdequacy.ts
//
// Punteggio di adeguatezza nutrizionale per il motore di generazione dieta
// (Fase pre-5, docs/PRD.md §4.9 -- design chiuso il 2026-10-11). Metodo
// NAR/MAR (Nutrient Adequacy Ratio / Mean Adequacy Ratio): storicamente di
// Madden & Yoder 1972 (valutazione food stamps), metodologia dettagliata in
// Hatloy A, Torheim LE, Oshaug A. "Food variety, socioeconomic status and
// nutritional status in urban Côte d'Ivoire." Eur J Clin Nutr.
// 1998;52(12):891-898.
//
// Estensione NOSTRA, dichiarata come tale (non nel metodo originale,
// richiesta esplicita dell'utente 2026-10-11 -- "non capisco perché metti
// biodisponibilità fuori adeguatezza"): il chiamante può passare, come
// `intake`, un valore già corretto per biodisponibilità (output di
// calculateBioavailableIron/Zinc/Calcium/B12/FolateDFE/VitaminARAE) invece
// della sola composizione grezza -- così la biodisponibilità entra DENTRO
// il punteggio di adeguatezza, non come asse separato. Questo file non sa
// né gli importa da dove viene `intake`: riceve numeri, non FoodItem.

export interface NutrientRequirement {
  nutrientCode: string;
  intake: number; // puo' essere grezzo o bioavailability-adjusted, a scelta del chiamante
  target: number; // LARN/EFSA o AMDR per macro/energia -- non popolato con valori reali in questo file
}

/**
 * NAR di un singolo nutriente: assunzione / target, CAPPATO a 1.0.
 * Il cap e' una proprieta' esplicita del metodo (Hatloy et al. 1998), non
 * una nostra scelta: un nutriente in forte eccesso non deve compensare,
 * nella media, un altro nutriente carente.
 *
 * Architettura difensiva: un target non fisico (<=0, NaN, infinito) non
 * produce mai un NAR inventato o un'eccezione non gestita -- restituisce
 * `null`, segnalando al chiamante che quel nutriente non ha un target
 * valido per questo calcolo (va escluso dalla media, non trattato come 0
 * né come 1). Un intake negativo/non finito e' trattato come 0 (nessuna
 * assunzione, il caso piu' conservativo, non un valore inventato).
 */
export function calculateNAR(intake: number, target: number): number | null {
  if (!Number.isFinite(target) || target <= 0) return null;
  const safeIntake = Number.isFinite(intake) && intake > 0 ? intake : 0;
  return Math.min(safeIntake / target, 1);
}

export interface MARResult {
  mar: number; // 0..1, media dei NAR validi. 0 se nessun NAR valido (difensivo, mai NaN)
  narByNutrient: Record<string, number>; // solo i nutrient_code con un NAR valido
  excludedNutrients: string[]; // nutrient_code esclusi per target non valido -- mai silenziati
}

/**
 * MAR: media dei NAR validi sull'elenco di requisiti forniti. Un
 * `NutrientRequirement` con target non valido (vedi calculateNAR) viene
 * escluso dalla media ESPLICITAMENTE (elencato in excludedNutrients), mai
 * trattato come se non esistesse -- cosi' chi chiama questa funzione puo'
 * accorgersi se, es., manca ancora il target LARN per un nutriente e il
 * punteggio risultante e' calcolato su un sottoinsieme piu' piccolo di
 * quanto previsto.
 */
export function calculateMAR(requirements: NutrientRequirement[]): MARResult {
  const narByNutrient: Record<string, number> = {};
  const excludedNutrients: string[] = [];

  for (const req of requirements) {
    const nar = calculateNAR(req.intake, req.target);
    if (nar === null) {
      excludedNutrients.push(req.nutrientCode);
    } else {
      narByNutrient[req.nutrientCode] = nar;
    }
  }

  const validNars = Object.values(narByNutrient);
  const mar = validNars.length > 0 ? validNars.reduce((sum, n) => sum + n, 0) / validNars.length : 0;

  return { mar, narByNutrient, excludedNutrients };
}

/**
 * Nutriente col NAR piu' basso ("collo di bottiglia") -- usato
 * dall'euristica golosa in dietGenerator.ts per decidere quale nutriente
 * migliorare al prossimo passo (migliorare un nutriente gia' al cap 1.0
 * non aumenta il MAR, quindi non e' mai la scelta giusta).
 *
 * Difensivo: narByNutrient vuoto -> null (nessun collo di bottiglia da
 * migliorare, es. nessun requisito valido fornito).
 */
export function findBottleneckNutrient(narByNutrient: Record<string, number>): string | null {
  const entries = Object.entries(narByNutrient);
  if (entries.length === 0) return null;
  let worstCode = entries[0][0];
  let worstValue = entries[0][1];
  for (const [code, value] of entries) {
    if (value < worstValue) {
      worstCode = code;
      worstValue = value;
    }
  }
  return worstCode;
}
