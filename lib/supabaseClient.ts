// lib/supabaseClient.ts
//
// Client Supabase con la chiave ANON (pubblica) — rispetta la RLS.
// Questo e' il client da importare in qualunque componente 'use client'
// (browser) o Server Component che deve solo LEGGERE dati di riferimento
// non personali (foods_raw, nutrient_values, sources, food_matrices_master,
// retention_factors). Quelle tabelle hanno policy RLS "solo lettura per
// chiunque" (vedi commento in lib/supabaseAdmin.ts) — usare questo client,
// mai supabaseAdmin, per qualunque pagina/componente che finisce nel
// bundle inviato al browser: la service role key di supabaseAdmin bypassa
// la RLS e non deve MAI arrivare al client.
//
// Variabili d'ambiente richieste (pubbliche, prefisso NEXT_PUBLIC_
// necessario perche' Next.js le includa nel bundle browser):
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...   <- dalla sezione "anon public" di
//                                          Supabase > Project Settings > API.
//                                          NON e' la stessa chiave
//                                          "service_role" usata da
//                                          lib/supabaseAdmin.ts.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devono essere impostate.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
