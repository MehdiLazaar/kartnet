// On indique à TypeScript que, après le middleware d'authentification,
// chaque requête peut porter l'utilisateur connecté dans req.user.
import type { AuthUser } from '../middlewares/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
