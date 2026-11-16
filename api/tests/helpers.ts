import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

export const app = createApp();
export const api = () => request(app);

/** À appeler avant chaque test : base vide, pour que les tests ne dépendent pas les uns des autres. */
export async function resetDatabase() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Memory", "Step", "Trip", "User" CASCADE');
}

/** Crée un compte et renvoie l'en-tête d'authentification prêt à l'emploi. */
export async function createUser(email = `user-${randomUUID()}@kartnet.test`) {
  const res = await api().post('/api/v1/auth/register').send({ email, password: 'motdepasse123' });
  return { email, auth: { Authorization: `Bearer ${res.body.token as string}` } };
}

/** Heure de modification « côté téléphone », décalée de quelques secondes si besoin. */
export function at(offsetSeconds = 0) {
  return new Date(Date.now() + offsetSeconds * 1000).toISOString();
}

/** Crée un voyage et renvoie son id. */
export async function createTrip(auth: Record<string, string>, overrides: Record<string, unknown> = {}) {
  const id = randomUUID();
  await api()
    .put(`/api/v1/trips/${id}`)
    .set(auth)
    .send({ name: 'Road trip au Portugal', startDate: '2026-07-01', endDate: '2026-07-14', updatedAt: at(), ...overrides })
    .expect(201);
  return id;
}

/** Une « photo » minimale : l'en-tête d'un fichier JPEG suffit pour les tests. */
export const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);
