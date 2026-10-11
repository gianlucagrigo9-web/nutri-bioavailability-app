// lib/loadEnvLocal.ts
//
// Caricatore minimo di .env.local per SCRIPT STANDALONE eseguiti via
// `tsx` (scripts/*.ts), NON per Next.js -- Next carica .env.local da
// solo (next/env), uno script lanciato fuori da Next no. Scoperto il
// 2026-10-11 quando il primo run reale di verify_golden_set_batch.ts ha
// fallito con "SUPABASE_URL mancante" nonostante .env.local fosse
// compilato correttamente (vedi commit b34391f).
//
// Parser deliberatamente semplice (niente dipendenza da dotenv, non
// serve per un file KEY=VALUE come .env.local.example): variabili già
// presenti in process.env (es. impostate a mano nella shell) hanno
// sempre la precedenza sul file.
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export function loadEnvLocal() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = resolve(process.cwd(), filename);
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, "utf-8");
    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function requireEnv(name: string, hint?: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Variabile d'ambiente ${name} mancante. Controlla .env.local${hint ? ` (${hint})` : ""}.`);
  }
  return v;
}
