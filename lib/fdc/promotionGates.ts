// lib/fdc/promotionGates.ts
//
// Modulo PURO (nessun I/O). Controlli automatici ("gate") che un alimento
// deve superare PRIMA che scripts/verify_golden_set_batch.ts promuova le sue
// righe a 'verified'. Si aggiungono al confronto numerico riga-per-riga con
// FDC (che resta il controllo principale): servono a bloccare gli alimenti
// "numericamente giusti ma incompleti per l'app".
//
// Introdotto il 2026-10-23, quando l'utente ha chiesto di promuovere i 428
// alimenti della pipeline add-food "con criteri solo automatici".
//
// Regola: un alimento che non supera un gate NON viene promosso e il motivo
// viene riportato nel report (mai scartato in silenzio, mai promosso "per
// default"): resta draft in attesa di un controllo umano.

export interface PromotionGateInput {
  nameIt: string | null;
  /** foods_raw.fdc_name: descrizione FDC salvata al momento dell'inserimento. */
  fdcNameStored: string | null;
  /** Descrizione FDC del record ri-scaricato adesso. */
  fdcDescriptionLive: string | undefined;
  dietVegetarian: boolean | null;
  dietVegan: boolean | null;
  dietFruitarian: boolean | null;
}

export interface PromotionGateResult {
  ok: boolean;
  reasons: string[];
}

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function evaluatePromotionGate(i: PromotionGateInput): PromotionGateResult {
  const reasons: string[] = [];

  if (!i.nameIt || normalize(i.nameIt) === "") {
    reasons.push("nome italiano (name_it) vuoto");
  }

  // Descrizione FDC: lo stesso fdc_id deve ancora descrivere lo stesso
  // alimento scelto all'inserimento. Senza descrizione salvata non c'e'
  // nulla da confrontare: non si promuove cio' che non si puo' controllare.
  if (!i.fdcNameStored || normalize(i.fdcNameStored) === "") {
    reasons.push("descrizione FDC salvata (fdc_name) assente: impossibile controllare che il record FDC sia quello scelto");
  } else if (i.fdcDescriptionLive === undefined || normalize(i.fdcDescriptionLive) === "") {
    reasons.push("il record FDC ri-scaricato non ha una descrizione: impossibile confrontarla");
  } else if (normalize(i.fdcNameStored) !== normalize(i.fdcDescriptionLive)) {
    reasons.push(
      `descrizione FDC cambiata: salvata "${normalize(i.fdcNameStored)}", ora "${normalize(i.fdcDescriptionLive)}"`
    );
  }

  // Classificazione dieta: un NULL esclude l'alimento da ogni dieta non
  // onnivora (dietTypeFilter.ts); combinazioni incoerenti non sono
  // esprimibili con le 4 categorie di lib/fdc/dietCategory.ts.
  if (i.dietVegetarian === null || i.dietVegan === null || i.dietFruitarian === null) {
    reasons.push("classificazione dieta incompleta (almeno un flag diet_compat_* e' NULL)");
  } else {
    if (i.dietVegan && !i.dietVegetarian) reasons.push("flag dieta incoerenti: vegano ma non vegetariano");
    if (i.dietFruitarian && !i.dietVegan) reasons.push("flag dieta incoerenti: fruttariano ma non vegano");
  }

  return { ok: reasons.length === 0, reasons };
}
