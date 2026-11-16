import { AppError } from '../lib/app-error.js';
import { prisma } from '../lib/prisma.js';
import type { StepInput } from '../schemas/step.schema.js';
import { isLocked } from './sync-rules.js';
import { findOwnedTrip } from './trip.service.js';

async function findStepWithOwner(stepId: string) {
  return prisma.step.findUnique({
    where: { id: stepId },
    include: { trip: { select: { userId: true } } },
  });
}

/** PUT /steps/:id : crée ou met à jour une étape (une ville) et sa note. */
export async function upsertStep(userId: string, stepId: string, input: StepInput) {
  await findOwnedTrip(userId, input.tripId);

  const existing = await findStepWithOwner(stepId);
  if (existing && existing.trip.userId !== userId) {
    throw AppError.notFound('Étape introuvable');
  }
  if (existing && existing.tripId !== input.tripId) {
    throw AppError.badRequest('Une étape ne peut pas changer de voyage');
  }
  if (existing && isLocked(existing, input.updatedAt)) {
    const { trip: _trip, ...step } = existing;
    return { step, created: false };
  }

  const data = {
    city: input.city,
    country: input.country ?? null,
    note: input.note ?? null,
    order: input.order,
    updatedAt: input.updatedAt,
  };

  const step = existing
    ? await prisma.step.update({ where: { id: stepId }, data })
    : await prisma.step.create({ data: { id: stepId, tripId: input.tripId, ...data } });

  return { step, created: !existing };
}

/** DELETE /steps/:id : suppression douce. Les souvenirs de l'étape sont gardés, mais détachés. */
export async function deleteStep(userId: string, stepId: string) {
  const existing = await findStepWithOwner(stepId);
  if (!existing || existing.trip.userId !== userId) {
    throw AppError.notFound('Étape introuvable');
  }
  if (existing.deletedAt) {
    return;
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.memory.updateMany({ where: { stepId }, data: { stepId: null, updatedAt: now } }),
    prisma.step.update({ where: { id: stepId }, data: { deletedAt: now, updatedAt: now } }),
  ]);
}
