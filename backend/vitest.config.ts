import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tous les tests partagent le même emulator : on les lance l'un après l'autre.
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
