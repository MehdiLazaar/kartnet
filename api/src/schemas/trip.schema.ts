import { z } from 'zod';

import { dateOnlySchema, dateTimeSchema } from './common.schema.js';

// Corps de PUT /trips/:id (création ou mise à jour ; l'id est dans l'URL).
export const tripInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Le nom du voyage est obligatoire').max(120),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema.nullish(),
    coverUrl: z.url().nullish(),
    // Heure de la modification sur le téléphone (sert à résoudre les conflits).
    updatedAt: dateTimeSchema,
  })
  .refine((trip) => !trip.endDate || trip.endDate >= trip.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  });

export type TripInput = z.infer<typeof tripInputSchema>;
