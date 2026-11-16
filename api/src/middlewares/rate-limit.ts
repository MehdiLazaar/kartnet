// Limite le nombre de tentatives de connexion / inscription,
// pour ralentir quelqu'un qui essaierait de deviner des mots de passe.
import { rateLimit } from 'express-rate-limit';

import { env } from '../config/env.js';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives, réessaie dans quelques minutes' },
    });
  },
});
