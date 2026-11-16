import { z } from 'zod';

import { dateTimeSchema } from './common.schema.js';

// GET /sync?since=2026-07-14T10:00:00.000Z
// Sans « since » : on renvoie tout (premier lancement sur un nouveau téléphone).
export const syncQuerySchema = z.object({
  since: dateTimeSchema.optional(),
});
