// Choisit l'implémentation du stockage selon STORAGE_DRIVER (.env).
// Pour ajouter Cloudinary : créer cloudinary-storage.ts qui implémente StorageService,
// ajouter 'cloudinary' dans env.ts, puis un case ici. Rien d'autre à changer.
import path from 'node:path';

import { env } from '../config/env.js';
import { LocalStorage } from './local-storage.js';
import type { StorageService } from './storage.js';

export const uploadDirectory = path.resolve(env.UPLOAD_DIR);

function createStorage(): StorageService {
  switch (env.STORAGE_DRIVER) {
    case 'local':
      return new LocalStorage(uploadDirectory, env.PUBLIC_URL.replace(/\/$/, ''));
  }
}

export const storage = createStorage();
export type { IncomingFile, StorageService, StoredFile } from './storage.js';
