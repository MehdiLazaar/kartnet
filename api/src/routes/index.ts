// Toutes les routes de la version 1 de l'API, montées sous /api/v1 dans app.ts.
import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { health } from '../controllers/health.controller.js';
import * as memoryController from '../controllers/memory.controller.js';
import * as stepController from '../controllers/step.controller.js';
import * as syncController from '../controllers/sync.controller.js';
import * as tripController from '../controllers/trip.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authRateLimit } from '../middlewares/rate-limit.js';
import { uploadPhoto } from '../middlewares/upload.js';

export const apiRouter = Router();

// ── Routes publiques ──────────────────────────────────────────
apiRouter.get('/health', health);
apiRouter.post('/auth/register', authRateLimit, authController.register);
apiRouter.post('/auth/login', authRateLimit, authController.login);

// ── À partir d'ici, un token JWT valide est obligatoire ───────
apiRouter.use(requireAuth);

apiRouter.get('/auth/me', authController.me);

apiRouter.get('/trips', tripController.list);
apiRouter.get('/trips/:id', tripController.getOne);
apiRouter.put('/trips/:id', tripController.upsert);
apiRouter.delete('/trips/:id', tripController.remove);

apiRouter.put('/steps/:id', stepController.upsert);
apiRouter.delete('/steps/:id', stepController.remove);

apiRouter.post('/memories', uploadPhoto, memoryController.save);
apiRouter.delete('/memories/:id', memoryController.remove);

apiRouter.get('/sync', syncController.pull);
