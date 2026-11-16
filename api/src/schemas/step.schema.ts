import { z } from 'zod';

import { dateTimeSchema, optionalText } from './common.schema.js';

// Corps de PUT /steps/:id (une étape = une ville du voyage).
export const stepInputSchema = z.object({
  tripId: z.uuid('Voyage invalide'),
  city: z.string().trim().min(1, 'La ville est obligatoire').max(120),
  country: optionalText(120),
  note: optionalText(5000),
  order: z.number().int().min(0).default(0),
  updatedAt: dateTimeSchema,
});

export type StepInput = z.infer<typeof stepInputSchema>;
