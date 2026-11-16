// Réception d'une photo envoyée en multipart/form-data (champ « photo »).
// Le fichier reste en mémoire : c'est le StorageService qui décide où l'écrire.
import multer from 'multer';

import { env } from '../config/env.js';
import { AppError } from '../lib/app-error.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(AppError.badRequest('Format de photo non supporté (JPEG, PNG, WebP ou HEIC)'));
    }
  },
}).single('photo');
