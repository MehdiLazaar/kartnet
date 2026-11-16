// Règle de résolution des conflits : « la dernière modification gagne » (last-write-wins).
//
// Chaque modification envoyée par le téléphone porte son heure (updatedAt).
// Si le serveur a déjà une version plus récente ou identique, on garde celle du serveur
// et on la renvoie : le téléphone se met alors à jour avec elle.
// « Identique » compte comme périmé : renvoyer deux fois la même requête
// (réseau coupé au mauvais moment) ne change donc rien. C'est ce qu'on appelle une requête idempotente.

export function isStale(existing: { updatedAt: Date }, incomingUpdatedAt: Date): boolean {
  return incomingUpdatedAt.getTime() <= existing.updatedAt.getTime();
}

/** Une ligne supprimée (deletedAt rempli) ne peut plus être modifiée : la suppression gagne. */
export function isLocked(existing: { updatedAt: Date; deletedAt: Date | null }, incomingUpdatedAt: Date) {
  return existing.deletedAt !== null || isStale(existing, incomingUpdatedAt);
}
