// Point de passage unique de toutes les erreurs.
// Quelle que soit l'erreur, l'app mobile reçoit toujours le même format :
// { "error": { "code": "...", "message": "...", "details": ... } }
import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';

import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `Route introuvable : ${req.method} ${req.path}` },
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = toAppError(err);

  if (error.status >= 500) {
    logger.error({ err, method: req.method, path: req.path }, 'Erreur inattendue');
  }

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    },
  });
};

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }

  // Données invalides (schémas Zod)
  if (err instanceof ZodError) {
    return new AppError(
      400,
      'VALIDATION_ERROR',
      'Certaines données sont invalides',
      err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    );
  }

  // Erreurs d'upload (fichier trop gros, mauvais champ…)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError(413, 'FILE_TOO_LARGE', 'La photo est trop lourde');
    }
    return AppError.badRequest(`Envoi de fichier invalide : ${err.message}`);
  }

  // JSON mal formé dans le corps de la requête
  if (isBodyParserError(err)) {
    return AppError.badRequest('Le corps de la requête n\'est pas un JSON valide');
  }

  // Erreurs connues de la base de données
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return AppError.conflict('Cette ressource existe déjà');
    if (err.code === 'P2003') return AppError.badRequest('Référence vers une ressource inexistante');
    if (err.code === 'P2025') return AppError.notFound();
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Une erreur inattendue est survenue');
}

function isBodyParserError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: unknown }).type === 'entity.parse.failed'
  );
}
