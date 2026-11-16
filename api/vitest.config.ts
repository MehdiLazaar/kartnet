import { readFileSync } from 'node:fs';

import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Les tests utilisent .env.test (base kartnet_test), jamais le .env de développement.
const testEnv = parse(readFileSync(new URL('.env.test', import.meta.url)));

export default defineConfig({
  test: {
    env: testEnv,
    globalSetup: ['tests/global-setup.ts'],
    // Les fichiers de test partagent la même base : on les lance l'un après l'autre.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
