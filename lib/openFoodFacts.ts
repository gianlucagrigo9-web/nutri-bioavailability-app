// lib/openFoodFacts.ts
//
// Integrazione Open Food Facts (OFF) per lo scanner barcode (PRD §7, Fase 3
// punto 13: "dentro v1").
//
// REGOLA FERREA (vedi PRD, riga "Dati prodotti confezionati" nella tabella
// fonti): i dati OFF vengono SOLO consultati live, MAI scritti nel DB
// proprietario (foods_raw/nutrient_values) -- per evitare obblighi di
// share-alike ODbL 1.0 sull'intero dataset. Ogni prodotto scansionato resta
// un oggetto client-side effimero (mai persistito da nessuna parte),
// mostrato con attribuzione "© Open Food Facts contributors".
//
// "ZERO DATI INVENTATI" APPLICATO A UN DATASET CROWD-SOURCED: un prodotto
// confezionato generico non ha (e non può avere) i dati fine-grained che il
// Golden Set richiede per il modello di biodisponibilità (fitati, ossalati,
// MACs, stato eme del ferro misurato, bioaccessibilità zinco post-cottura,
// ecc. -- quella roba richiede letteratura specifica per singolo alimento,
// non esiste per un barcode generico). Soluzione concordata con l'utente
// (chat, 2026-10-10): un sistema a 3 livelli di fiducia, mai mescolati
// silenziosamente:
//
//   TIER 1 "measured"     -- valore letto direttamente dal campo nutriments
//                             di OFF (quello che il produttore ha dichiarato
//                             in etichetta). Non verificato da Claude come il
//                             Golden Set, ma non è nemmeno una stima nostra.
//   TIER 2 "approximated"  -- valore NON presente in OFF, dedotto con una
//                             regola euristica semplice e dichiarata (es.
//                             is_heme_iron=true se la categoria del
//                             prodotto è "carne/pesce"). Un'APPROSSIMAZIONE
//                             esplicita, mai spacciata per dato misurato.
//   TIER 3 "unavailable"   -- nessuna base nemmeno per una stima grezza
//                             (fitati, ossalati, MACs, polifenoli, iodio
//                             variano troppo da prodotto a prodotto perché
//                             una categoria generica dia un numero
//                             sensato) -- lasciato a 0, MAI inventato.
//
// Ogni FoodItem costruito da questo file porta con sé le tre liste di campi
// per livello, cosi' la UI puo' mostrare badge/colori coerenti con una
// legenda, invece di presentare il prodotto come se fosse un'altra riga del
// Golden Set.
//
// CONVERSIONE UNITA' (LIMITE DICHIARATO, da verificare dal vivo): la
// documentazione ufficiale OFF dichiara che tutti i campi nutrienti
// "_100g" sono normalizzati in GRAMMI indipendentemente dalla scala
// naturale del nutriente -- quindi iron_100g=0.0025 significa 2.5 mg/100g,
// non 0.0025 mg. Fonte: https://github.com/openfoodfacts/api-documentation/issues/64
// ("(in g, or kJ for energy)", uniche eccezioni dichiarate: alcohol in %vol
// e pH senza unità). NON sono riuscito a confermarlo con un fetch live di
// un prodotto reale (OFF blocca il fetch automatico via robots.txt da
// questo ambiente, e il sandbox non ha accesso di rete al dominio) --
// la conversione sotto si basa SOLO sulla documentazione scritta.
// Prima di fidarti dei numeri: scansiona un prodotto di cui conosci
// l'etichetta reale e confronta il valore mostrato in app con quello
// stampato sulla confezione.

import { FoodItem, OxalateCategory } from "./engine/types";

export interface OffProduct {
  code: string;
  product_name: string | null;
  brands: string | null;
  categories_tags: string[];
  ingredients_text: string | null;
  nutriments: Record<string, number | undefined>;
  // URL della pagina prodotto su openfoodfacts.org, per l'attribuzione.
  productUrl: string;
}

export interface ApproximatedFood {
  item: FoodItem;
  productName: string;
  brand: string | null;
  productUrl: string;
  // Nome dei campi di FoodItem per ciascun livello di fiducia (vedi
  // commento di testa). Usato dalla UI per i badge/legenda, MAI per
  // ri-calcolare qualcosa -- i valori sono già dentro `item`.
  measuredFields: string[];
  approximatedFields: string[];
  unavailableFields: string[];
}

export type OffFetchError =
  | { kind: "not_found" }
  | { kind: "network_error"; message: string };

export type OffFetchResult =
  | { ok: true; product: OffProduct }
  | { ok: false; error: OffFetchError };

/**
 * Interroga live l'API pubblica di Open Food Facts per un barcode (EAN-13/
 * UPC-A tipici dei prodotti alimentari). Non scrive mai nulla, non salva
 * nulla lato server -- una singola GET per ogni scansione.
 */
export async function fetchOffProduct(barcode: string): Promise<OffFetchResult> {
  const cleaned = barcode.trim();
  if (!/^\d{8,14}$/.test(cleaned)) {
    // Difensivo: un barcode non numerico o di lunghezza implausibile non
    // viene nemmeno interrogato -- evita una richiesta inutile e un
    // risultato OFF fuorviante (OFF a volte risponde comunque con dati
    // vuoti invece di un errore chiaro per barcode malformati).
    return { ok: false, error: { kind: "network_error", message: `Codice a barre non valido: "${barcode}"` } };
  }
  let res: Response;
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleaned}.json?fields=code,product_name,brands,categories_tags,ingredients_text,nutriments`,
      { headers: { "User-Agent": "nutri-bioavailability-app (research/educational use)" } }
    );
  } catch (e) {
    return { ok: false, error: { kind: "network_error", message: e instanceof Error ? e.message : String(e) } };
  }
  if (!res.ok) {
    return { ok: false, error: { kind: "network_error", message: `HTTP ${res.status}` } };
  }
  const json = await res.json();
  if (json.status !== 1 || !json.product) {
    return { ok: false, error: { kind: "not_found" } };
  }
  const p = json.product;
  return {
    ok: true,
    product: {
      code: cleaned,
      product_name: p.product_name || null,
      brands: p.brands || null,
      categories_tags: Array.isArray(p.categories_tags) ? p.categories_tags : [],
      ingredients_text: p.ingredients_text || null,
      nutriments: p.nutriments || {},
      productUrl: `https://world.openfoodfacts.org/product/${cleaned}`,
    },
  };
}

// OFF normalizza tutti i nutrienti "peso" in grammi nel campo "_100g" (vedi
// commento di testa) -- queste funzioni convertono verso le unità usate da
// FoodItem (mg/mcg), restituendo undefined se il campo non è presente
// (MAI 0 travestito da "misurato": undefined viene gestito a valle come
// "non disponibile", tier 3).
function g100ToMg(n: number | undefined): number | undefined {
  return n != null && Number.isFinite(n) ? n * 1000 : undefined;
}
function g100ToMcg(n: number | undefined): number | undefined {
  return n != null && Number.isFinite(n) ? n * 1_000_000 : undefined;
}

const HEME_CATEGORY_TAGS = [
  "en:meats", "en:meat-based-products", "en:fishes", "en:seafood", "en:poultry",
  "en:charcuterie", "en:cured-meats", "en:fish-and-meat-and-eggs",
];
const HIGH_OXALATE_TAGS = [
  "en:spinaches", "en:leafy-vegetables", "en:chards", "en:beet-greens", "en:rhubarb",
];
const MEDIUM_OXALATE_TAGS = [
  "en:legumes", "en:beans", "en:lentils", "en:chickpeas", "en:nuts", "en:cereals-and-potatoes",
  "en:whole-grain-cereals", "en:potatoes",
];

function inferIsHemeIron(categoriesTags: string[]): boolean {
  return categoriesTags.some((t) => HEME_CATEGORY_TAGS.includes(t));
}
function inferOxalateCategory(categoriesTags: string[]): OxalateCategory {
  if (categoriesTags.some((t) => HIGH_OXALATE_TAGS.includes(t))) return "high_oxalate";
  if (categoriesTags.some((t) => MEDIUM_OXALATE_TAGS.includes(t))) return "medium_oxalate";
  return "low_oxalate";
}
function inferFortifiedFolate(ingredientsText: string | null): boolean {
  if (!ingredientsText) return false;
  const t = ingredientsText.toLowerCase();
  return t.includes("acido folico") || t.includes("folic acid") || t.includes("acide folique");
}

/**
 * Costruisce un FoodItem approssimato da un prodotto OFF, secondo il
 * sistema a 3 livelli descritto in testa al file. Funzione pura.
 */
export function buildApproximatedFood(product: OffProduct): ApproximatedFood {
  const n = product.nutriments;
  const measuredFields: string[] = [];
  const unavailableFields: string[] = [];

  // Tier 1/3: se il campo è presente in OFF lo usiamo com'è (misurato dal
  // produttore, non da Claude), altrimenti resta 0 e il campo finisce in
  // unavailableFields -- MAI un numero indovinato per riempire il vuoto.
  function measuredOrUnavailable(fieldName: string, value: number | undefined): number {
    if (value !== undefined) {
      measuredFields.push(fieldName);
      return value;
    }
    unavailableFields.push(fieldName);
    return 0;
  }

  // Tier 3 dichiarato a priori: nessuna base per stimare questi campi da
  // una categoria generica di prodotto -- variano troppo da ricetta a
  // ricetta per un numero anche solo approssimativo onesto (a differenza
  // dei campi categorici sotto, che SONO stimabili dalla categoria).
  const alwaysUnavailableFields = [
    "phytates_mg", "oxalates_mg", "polyphenols_mg", "macs_mg",
    "beta_carotene_mcg", "other_provitamin_a_carotenoids_mcg",
  ];
  unavailableFields.push(...alwaysUnavailableFields);

  // Tier 2: euristiche dichiarate, dedotte dalla categoria/ingredienti OFF
  // (vedi inferIsHemeIron/inferOxalateCategory/inferFortifiedFolate e il
  // commento sulla scelta di carotenoid_matrix_state qui sotto).
  const approximatedFields = [
    "is_heme_iron", "matrix_category_calcium", "is_fortified_folate", "carotenoid_matrix_state",
  ];

  const item: FoodItem = {
    id: `off_${product.code}`,
    name: product.product_name || `Prodotto scansionato (${product.code})`,

    iron_mg: measuredOrUnavailable("iron_mg", g100ToMg(n["iron_100g"])),
    zinc_mg: measuredOrUnavailable("zinc_mg", g100ToMg(n["zinc_100g"])),
    calcium_mg: measuredOrUnavailable("calcium_mg", g100ToMg(n["calcium_100g"])),
    vitamin_c_mg: measuredOrUnavailable("vitamin_c_mg", g100ToMg(n["vitamin-c_100g"])),
    phytates_mg: 0,
    oxalates_mg: 0,
    polyphenols_mg: 0,
    is_heme_iron: inferIsHemeIron(product.categories_tags),
    matrix_category_calcium: inferOxalateCategory(product.categories_tags),

    macs_mg: 0,
    botanical_family: null, // non deducibile in modo affidabile da una categoria generica

    vitamin_b12_mcg: measuredOrUnavailable("vitamin_b12_mcg", g100ToMcg(n["vitamin-b12_100g"])),
    folate_mcg: measuredOrUnavailable("folate_mcg", g100ToMcg(n["folates_100g"])),
    is_fortified_folate: inferFortifiedFolate(product.ingredients_text),

    beta_carotene_mcg: 0,
    other_provitamin_a_carotenoids_mcg: 0,
    // Assunzione difensiva (tier 2): un prodotto confezionato/processato
    // non è quasi mai "crudo intatto" -- 'cooked_or_disrupted' è la
    // scelta che non sovrastima la biodisponibilità del beta-carotene.
    carotenoid_matrix_state: "cooked_or_disrupted",

    // Nessuna base per assumere il bucket specifico cavoletti-di-Bruxelles
    // (Doniec 2022 misura solo quello) -- 'none' è il default corretto,
    // non un'approssimazione.
    zinc_bioaccessibility_bucket: "none",

    magnesium_mg: measuredOrUnavailable("magnesium_mg", g100ToMg(n["magnesium_100g"])),
    copper_mg: measuredOrUnavailable("copper_mg", g100ToMg(n["copper_100g"])),
    selenium_mcg: measuredOrUnavailable("selenium_mcg", g100ToMcg(n["selenium_100g"])),
    iodine_mcg: measuredOrUnavailable("iodine_mcg", g100ToMcg(n["iodine_100g"])),
    vitamin_k_mcg: measuredOrUnavailable("vitamin_k_mcg", g100ToMcg(n["vitamin-k_100g"])),

    // Macro + energia: OFF le riporta già in kcal/g (nessuna conversione
    // di scala necessaria), tier 1 "measured" -- è quanto dichiarato in
    // etichetta dal produttore, non una nostra stima.
    energy_kcal: measuredOrUnavailable("energy_kcal", n["energy-kcal_100g"]),
    protein_g: measuredOrUnavailable("protein_g", n["proteins_100g"]),
    carbohydrates_g: measuredOrUnavailable("carbohydrates_g", n["carbohydrates_100g"]),
    fat_g: measuredOrUnavailable("fat_g", n["fat_100g"]),
    fiber_g: measuredOrUnavailable("fiber_g", n["fiber_100g"]),
  };

  return {
    item,
    productName: product.product_name || `Prodotto ${product.code}`,
    brand: product.brands,
    productUrl: product.productUrl,
    measuredFields,
    approximatedFields,
    unavailableFields,
  };
}
