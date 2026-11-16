// Lancé une fois avant tous les tests : applique les migrations sur la base de test.
import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';

import { parse } from 'dotenv';

export default function setup() {
  const testEnv = parse(readFileSync('.env.test'));

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, ...testEnv },
    stdio: 'inherit',
  });

  // Après les tests : on supprime les photos envoyées pendant les tests.
  return () => {
    rmSync(testEnv['UPLOAD_DIR'] ?? '.uploads-test', { recursive: true, force: true });
  };
}
