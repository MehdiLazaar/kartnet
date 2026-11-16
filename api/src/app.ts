// Crée l'application Express, sans la démarrer.
// Séparer la création (ici) du démarrage (index.ts) permet aux tests d'utiliser l'app
// sans ouvrir de port réseau.
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { apiRouter } from './routes/index.js';
import { uploadDirectory } from './storage/index.js';

export function createApp() {
  const app = express();

  // Derrière un hébergeur (Render, Railway…), l'adresse IP réelle du client est dans X-Forwarded-For.
  app.set('trust proxy', 1);

  // Sécurité : en-têtes HTTP protecteurs. « cross-origin » pour que les photos s'affichent partout.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((o) => o.trim()) }));

  app.use(express.json({ limit: '1mb' }));
  // Une ligne de log par requête : méthode, adresse, code de réponse et durée.
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== 'test',
      serializers: {
        req: (req: { method: string; url: string }) => ({ method: req.method, url: req.url }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );

  // Les photos enregistrées en local sont servies telles quelles.
  app.use('/uploads', express.static(uploadDirectory, { maxAge: '7d', immutable: true }));

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
