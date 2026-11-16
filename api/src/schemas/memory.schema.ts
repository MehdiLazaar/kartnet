import { z } from 'zod';

import { dateTimeSchema, optionalText } from './common.schema.js';

// Champs de POST /memories, envoyés en multipart/form-data avec la photo.
// En multipart tout arrive sous forme de texte : z.coerce convertit les nombres.
export const memoryInputSchema = z.object({
  id: z.uuid('Identifiant de souvenir invalide'),
  tripId: z.uuid('Voyage invalide'),
  stepId: z.preprocess((value) => (value === '' ? null : value), z.uuid('Étape invalide').nullish()),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  takenAt: dateTimeSchema,
  note: optionalText(5000),
  updatedAt: dateTimeSchema,
});

export type MemoryInput = z.infer<typeof memoryInputSchema>;
