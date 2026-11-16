// Lecture et validation des variables d'environnement.
// Si une variable obligatoire manque ou est invalide, l'API refuse de démarrer
// avec un message clair, au lieu de planter plus tard au milieu d'une requête.
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est obligatoire'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PUBLIC_URL: z.url().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('*'),
  STORAGE_DRIVER: z.enum(['local']).default('local'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides :');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')} : ${issue.message}`);
  }
  console.error('   Vérifie ton fichier .env (modèle : .env.example).');
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
