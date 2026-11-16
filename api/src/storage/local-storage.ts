// Stockage des photos dans un dossier du serveur (par défaut : uploads/).
// Les fichiers sont servis par Express à l'adresse /uploads/<nom>.
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { IncomingFile, StorageService, StoredFile } from './storage.js';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

export class LocalStorage implements StorageService {
  constructor(
    private readonly directory: string,
    private readonly publicBaseUrl: string,
  ) {}

  async save(file: IncomingFile): Promise<StoredFile> {
    await mkdir(this.directory, { recursive: true });
    // Nom aléatoire : on n'utilise jamais le nom envoyé par le client (risque d'écrasement ou de chemin piégé).
    const key = `${randomUUID()}${EXTENSIONS[file.mimetype] ?? ''}`;
    await writeFile(path.join(this.directory, key), file.buffer);
    return { key, url: `${this.publicBaseUrl}/uploads/${key}` };
  }

  async remove(key: string): Promise<void> {
    // path.basename empêche de sortir du dossier avec une clé du type "../../fichier".
    await rm(path.join(this.directory, path.basename(key)), { force: true });
  }
}
