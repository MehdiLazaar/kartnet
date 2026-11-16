import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import type { MemoryInput } from '../schemas/memory.schema.js';
import { type IncomingFile, storage } from '../storage/index.js';
import { isLocked } from './sync-rules.js';
import { findOwnedTrip } from './trip.service.js';

async function findMemoryWithOwner(memoryId: string) {
  return prisma.memory.findUnique({
    where: { id: memoryId },
    omit: { photoKey: false }, // on a besoin de la clé pour supprimer l'ancienne photo
    include: { trip: { select: { userId: true } } },
  });
}

/**
 * POST /memories : enregistre un souvenir (photo + position + date + note).
 * L'id vient du téléphone : renvoyer le même souvenir met à jour l'existant au lieu de créer un doublon.
 * La photo est obligatoire à la création, facultative pour une mise à jour (ex. changer la note).
 */
export async function saveMemory(userId: string, input: MemoryInput, file?: IncomingFile) {
  await findOwnedTrip(userId, input.tripId);

  if (input.stepId) {
    const step = await prisma.step.findFirst({
      where: { id: input.stepId, tripId: input.tripId, deletedAt: null },
    });
    if (!step) {
      throw AppError.badRequest('Cette étape n\'appartient pas à ce voyage');
    }
  }

  const existing = await findMemoryWithOwner(input.id);
  if (existing && existing.trip.userId !== userId) {
    throw AppError.notFound('Souvenir introuvable');
  }
  if (existing && existing.tripId !== input.tripId) {
    throw AppError.badRequest('Un souvenir ne peut pas changer de voyage');
  }
  if (existing && isLocked(existing, input.updatedAt)) {
    const { trip: _trip, photoKey: _photoKey, ...memory } = existing;
    return { memory, created: false };
  }
  if (!existing && !file) {
    throw AppError.badRequest('La photo est obligatoire pour créer un souvenir');
  }

  // 1. On enregistre la nouvelle photo…
  const stored = file ? await storage.save(file) : null;

  try {
    const data = {
      stepId: input.stepId ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      takenAt: input.takenAt,
      note: input.note ?? null,
      updatedAt: input.updatedAt,
      ...(stored && { photoUrl: stored.url, photoKey: stored.key }),
    };

    // 2. … puis la ligne en base.
    const memory = existing
      ? await prisma.memory.update({ where: { id: input.id }, data })
      : await prisma.memory.create({ data: { id: input.id, tripId: input.tripId, ...data } });

    // 3. Si la photo a été remplacée, on supprime l'ancienne.
    if (stored && existing?.photoKey) {
      await removeQuietly(existing.photoKey);
    }

    return { memory, created: !existing };
  } catch (error) {
    // La base a refusé : on ne laisse pas de photo orpheline sur le disque.
    if (stored) {
      await removeQuietly(stored.key);
    }
    throw error;
  }
}

/** DELETE /memories/:id : suppression douce (la photo est gardée pour pouvoir restaurer). */
export async function deleteMemory(userId: string, memoryId: string) {
  const existing = await findMemoryWithOwner(memoryId);
  if (!existing || existing.trip.userId !== userId) {
    throw AppError.notFound('Souvenir introuvable');
  }
  if (existing.deletedAt) {
    return;
  }

  const now = new Date();
  await prisma.memory.update({ where: { id: memoryId }, data: { deletedAt: now, updatedAt: now } });
}

async function removeQuietly(key: string) {
  try {
    await storage.remove(key);
  } catch (error) {
    logger.warn({ err: error, key }, 'Impossible de supprimer une photo');
  }
}
