// Données de démonstration : un compte et un voyage complet au Portugal.
// Lancement : npm run db:seed   (le compte démo est recréé à chaque fois)
//
// Compte : demo@kartnet.app / kartnet123
import { randomUUID } from 'node:crypto';

import { hash } from 'bcryptjs';

import { prisma } from '../src/lib/prisma.js';

const DEMO_EMAIL = 'demo@kartnet.app';
const DEMO_PASSWORD = 'kartnet123';

const steps = [
  {
    city: 'Lisbonne',
    note: 'Tram 28, pastéis de nata et coucher de soleil sur le Tage.',
    memories: [
      { lat: 38.7139, lng: -9.1334, at: '2026-07-01T18:40:00Z', note: 'Miradouro da Graça au coucher du soleil' },
      { lat: 38.6916, lng: -9.216, at: '2026-07-02T10:15:00Z', note: 'Tour de Belém, très peu de monde le matin' },
      { lat: 38.7107, lng: -9.1365, at: '2026-07-02T16:30:00Z', note: 'Le tram 28 dans les rues de l\'Alfama' },
    ],
  },
  {
    city: 'Porto',
    note: 'Ville de ponts. Croisière sur le Douro à ne pas manquer.',
    memories: [
      { lat: 41.1406, lng: -8.611, at: '2026-07-05T19:05:00Z', note: 'Vue sur le pont Dom-Luís depuis Gaia' },
      { lat: 41.1456, lng: -8.6146, at: '2026-07-06T11:00:00Z', note: 'Les azulejos de la gare São Bento' },
    ],
  },
  {
    city: 'Lagos',
    note: 'Falaises dorées et eau turquoise.',
    memories: [{ lat: 37.0889, lng: -8.6714, at: '2026-07-10T09:30:00Z', note: 'Ponta da Piedade en kayak' }],
  },
];

async function main() {
  // On repart de zéro pour le compte démo (la suppression du compte supprime ses voyages).
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const now = new Date();
  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, passwordHash: await hash(DEMO_PASSWORD, 10) },
  });

  const trip = await prisma.trip.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      name: 'Road trip au Portugal',
      startDate: new Date('2026-07-01T00:00:00Z'),
      endDate: new Date('2026-07-12T00:00:00Z'),
      updatedAt: now,
    },
  });

  for (const [order, step] of steps.entries()) {
    const created = await prisma.step.create({
      data: { id: randomUUID(), tripId: trip.id, city: step.city, country: 'Portugal', note: step.note, order, updatedAt: now },
    });

    await prisma.memory.createMany({
      data: step.memories.map((memory) => ({
        id: randomUUID(),
        tripId: trip.id,
        stepId: created.id,
        latitude: memory.lat,
        longitude: memory.lng,
        takenAt: new Date(memory.at),
        note: memory.note,
        photoUrl: null, // pas de photo dans les données de démo : à ajouter depuis l'app
        updatedAt: now,
      })),
    });
  }

  console.log(`✅ Données de démo créées. Compte : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
