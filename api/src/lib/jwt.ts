// Création et vérification des tokens JWT.
// Le token contient l'id de l'utilisateur (sub) et son email ; il est signé avec JWT_SECRET.
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export type TokenPayload = { sub: string; email: string };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/** Renvoie le contenu du token, ou null s'il est invalide ou expiré. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || typeof decoded['email'] !== 'string') {
      return null;
    }
    return { sub: decoded.sub, email: decoded['email'] };
  } catch {
    return null;
  }
}
