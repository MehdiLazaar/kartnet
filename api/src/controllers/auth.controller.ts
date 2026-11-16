// Les contrôleurs sont volontairement courts :
// 1. valider ce qui arrive (schéma Zod), 2. appeler le service, 3. répondre.
// Une erreur levée ici est automatiquement transmise au middleware d'erreurs (Express 5).
import type { Request, Response } from 'express';

import { currentUser } from '../middlewares/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await authService.register(input));
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  res.json(await authService.login(input));
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getProfile(currentUser(req).id));
}
