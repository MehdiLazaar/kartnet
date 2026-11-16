import { z } from 'zod';

import './common.schema.js';

const email = z.email('Adresse email invalide').trim().toLowerCase();

export const registerSchema = z.object({
  email,
  // bcrypt ne prend en compte que les 72 premiers octets d'un mot de passe.
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères').max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
