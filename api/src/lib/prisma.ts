// Un seul client Prisma pour toute l'application.
// Prisma 7 passe par un « adapter » : ici le driver PostgreSQL officiel (pg).
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '../config/env.js';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  // Ces champs internes ne sortent jamais de la base, sauf si on les demande explicitement :
  // le hash du mot de passe, et la clé de stockage des photos.
  omit: { user: { passwordHash: true }, memory: { photoKey: true } },
});
