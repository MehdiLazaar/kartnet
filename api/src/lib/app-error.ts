// Une erreur « prévue » par l'application : elle porte un code HTTP et un code lisible
// par l'app mobile. Le middleware d'erreurs la transforme en réponse
// { error: { code, message, details? } }.
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentification requise') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static notFound(message = 'Ressource introuvable') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }
}
