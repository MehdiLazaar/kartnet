// Briques de validation réutilisées par tous les schémas.
import { z } from 'zod';

// Messages d'erreur de Zod en français (ceux qu'on n'a pas écrits nous-mêmes).
z.config(z.locales.fr());

/** Paramètre d'URL « :id », qui doit être un UUID. */
export const idParamSchema = z.object({ id: z.uuid('Identifiant invalide') });

/** Date-heure ISO 8601 avec fuseau, ex. "2026-07-14T09:30:00.000Z". Convertie en Date. */
export const dateTimeSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

/** Date seule, ex. "2026-07-14". Convertie en Date à minuit UTC. */
export const dateOnlySchema = z.iso.date().transform((value) => new Date(`${value}T00:00:00.000Z`));

/** Texte optionnel : une chaîne vide est traitée comme « pas de valeur » (null). */
export const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max).nullish(),
  );
