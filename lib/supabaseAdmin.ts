// lib/supabaseAdmin.ts
//
// Client Supabase con la SERVICE ROLE KEY — bypassa la RLS.
// REGOLA FERREA: questo file si importa SOLO in Server Actions o Server
// Component (mai in un file con 'use client' in cima, mai nel bundle
// inviato al browser). È il modo corretto per far scrivere dati a un
// pannello admin SENZA dover allentare le policy RLS pubbliche di
// lettura già impostate su foods_raw/sources/food_matrices_master/
// retention_factors/nutrient_values (quelle restano "solo lettura" per
// chiunque, com'è giusto che sia per dati di riferimento non personali).
//
// Variabili d'ambiente richieste (server-only, NIENTE prefisso NEXT_PUBLIC_):
//   SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   <- dalla sezione "service_role" di
//                                      Supabase > Project Settings > API.
//                                      NON è la stessa chiave "anon" usata
//                                      da lib/supabaseClient.ts.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostate (server-only, mai NEXT_PUBLIC_).'
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
