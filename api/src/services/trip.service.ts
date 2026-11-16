import type { Trip } from '../generated/prisma/client.js';
import { AppError } from '../lib/app-error.js';
import { prisma } from '../lib/prisma.js';
import type { TripInput } from '../schemas/trip.schema.js';
import { isLocked } from './sync-rules.js';

/** Les dates de voyage sont renvoyées au format "2026-07-14", sans heure. */
export function serializeTrip<T extends Pick<Trip, 'startDate' | 'endDate'>>(trip: T) {
  return {
    ...trip,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate ? trip.endDate.toISOString().slice(0, 10) : null,
  };
}

/** Renvoie le voyage s'il appartient à l'utilisateur et n'est pas supprimé, sinon erreur 404. */
export async function findOwnedTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId, deletedAt: null } });
  if (!trip) {
    throw AppError.notFound('Voyage introuvable');
  }
  return trip;
}

/** GET /trips : les voyages de l'utilisateur, du plus récent au plus ancien, avec leurs compteurs. */
export async function listTrips(userId: string) {
  const trips = await prisma.trip.findMany({
    where: { userId, deletedAt: null },
    orderBy: { startDate: 'desc' },
    include: {
      _count: {
        select: {
          steps: { where: { deletedAt: null } },
          memories: { where: { deletedAt: null } },
        },
      },
    },
  });

  return trips.map(({ _count, ...trip }) => ({
    ...serializeTrip(trip),
    stepCount: _count.steps,
    memoryCount: _count.memories,
  }));
}

/**
 * GET /trips/:id : le voyage complet, prêt à être « retracé » :
 * - steps : les étapes dans l'ordre, chacune avec ses souvenirs ;
 * - unassignedMemories : les souvenirs rattachés à aucune étape ;
 * - path : tous les points GPS dans l'ordre chronologique, pour dessiner le trajet sur la carte.
 */
export async function getTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId, deletedAt: null },
    include: {
      steps: { where: { deletedAt: null }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      memories: { where: { deletedAt: null }, orderBy: { takenAt: 'asc' } },
    },
  });
  if (!trip) {
    throw AppError.notFound('Voyage introuvable');
  }

  const { steps, memories, ...details } = trip;
  const stepIds = new Set(steps.map((step) => step.id));

  return {
    ...serializeTrip(details),
    steps: steps.map((step) => ({
      ...step,
      memories: memories.filter((memory) => memory.stepId === step.id),
    })),
    unassignedMemories: memories.filter((memory) => !memory.stepId || !stepIds.has(memory.stepId)),
    path: memories.map((memory) => ({
      memoryId: memory.id,
      latitude: memory.latitude,
      longitude: memory.longitude,
      takenAt: memory.takenAt,
    })),
  };
}

/** PUT /trips/:id : crée le voyage s'il n'existe pas, sinon le met à jour (si la version reçue est plus récente). */
export async function upsertTrip(userId: string, tripId: string, input: TripInput) {
  const existing = await prisma.trip.findUnique({ where: { id: tripId } });

  if (existing && existing.userId !== userId) {
    throw AppError.notFound('Voyage introuvable');
  }
  if (existing && isLocked(existing, input.updatedAt)) {
    return { trip: serializeTrip(existing), created: false };
  }

  const data = {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    coverUrl: input.coverUrl ?? null,
    updatedAt: input.updatedAt,
  };

  const trip = existing
    ? await prisma.trip.update({ where: { id: tripId }, data })
    : await prisma.trip.create({ data: { id: tripId, userId, ...data } });

  return { trip: serializeTrip(trip), created: !existing };
}

/** DELETE /trips/:id : suppression douce du voyage, de ses étapes et de ses souvenirs. */
export async function deleteTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) {
    throw AppError.notFound('Voyage introuvable');
  }
  if (trip.deletedAt) {
    return; // déjà supprimé : rien à faire (requête idempotente)
  }

  const now = new Date();
  const deleted = { deletedAt: now, updatedAt: now };

  // Transaction : soit tout est supprimé, soit rien.
  await prisma.$transaction([
    prisma.memory.updateMany({ where: { tripId, deletedAt: null }, data: deleted }),
    prisma.step.updateMany({ where: { tripId, deletedAt: null }, data: deleted }),
    prisma.trip.update({ where: { id: tripId }, data: deleted }),
  ]);
}
