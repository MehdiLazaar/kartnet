// Point d'entrée : démarre le serveur HTTP.
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🗺️  API Kartnet prête sur http://localhost:${env.PORT}/api/v1`);
});

// Arrêt propre (Ctrl+C, redéploiement) : on finit les requêtes en cours,
// puis on ferme la connexion à la base.
async function shutdown(signal: string) {
  logger.info(`${signal} reçu, arrêt du serveur…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Au-delà de 10 s, on force l'arrêt.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
