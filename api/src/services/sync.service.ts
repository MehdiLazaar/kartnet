import { prisma } from '../lib/prisma.js';
import { serializeTrip } from './trip.service.js';

/**
 * GET /sync?since=… : tout ce qui a changé sur le serveur depuis « since »,
 * y compris les suppressions (lignes avec deletedAt rempli), pour que le téléphone les applique.
 *
 * On filtre sur serverUpdatedAt (l'heure d'enregistrement sur le serveur) et non sur updatedAt
 * (l'heure du téléphone) : un souvenir créé hors ligne hier mais envoyé aujourd'hui doit
 * quand même être vu par un appareil qui s'est synchronisé ce matin.
 *
 * Le téléphone garde serverTime et le renvoie comme « since » à la prochaine synchronisation.
 */
export async function pullChanges(userId: string, since?: Date) {
  // Heure prise AVANT les lectures : une ligne modifiée pendant la requête sera renvoyée
  // une seconde fois au prochain appel plutôt que perdue.
  const serverTime = new Date();
  const changedSince = since ? { serverUpdatedAt: { gt: since } } : {};

  const [trips, steps, memories] = await Promise.all([
    prisma.trip.findMany({ where: { userId, ...changedSince }, orderBy: { serverUpdatedAt: 'asc' } }),
    prisma.step.findMany({ where: { trip: { userId }, ...changedSince }, orderBy: { serverUpdatedAt: 'asc' } }),
    prisma.memory.findMany({ where: { trip: { userId }, ...changedSince }, orderBy: { serverUpdatedAt: 'asc' } }),
  ]);

  return {
    serverTime: serverTime.toISOString(),
    trips: trips.map(serializeTrip),
    steps,
    memories,
  };
}
