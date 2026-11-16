// Lance Vitest depuis le bon dossier.
// Sous Windows, un terminal ouvert sur « c:\… » (lettre de lecteur en minuscule, fréquent dans VS Code)
// fait charger Vitest deux fois et tous les tests échouent avec « Vitest failed to find the runner ».
// On relance donc Vitest avec la lettre de lecteur en majuscule. Sans effet sur macOS et Linux.
import { spawnSync } from 'node:child_process';

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const result = spawnSync('npx', ['vitest', ...process.argv.slice(2)], { cwd, stdio: 'inherit', shell: true });

process.exit(result.status ?? 1);
