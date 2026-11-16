// Middleware d'authentification : vérifie l'en-tête « Authorization: Bearer <token> »
// et place l'utilisateur dans req.user. Sans token valide : erreur 401.
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/app-error.js';
import { verifyToken } from '../lib/jwt.js';

export type AuthUser = { id: string; email: string };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized();
  }

  const payload = verifyToken(header.slice('Bearer '.length));
  if (!payload) {
    throw AppError.unauthorized('Session expirée, reconnecte-toi');
  }

  req.user = { id: payload.sub, email: payload.email };
  next();
}

/** À utiliser dans les contrôleurs placés derrière requireAuth. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}
