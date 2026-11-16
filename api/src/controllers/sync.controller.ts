import type { Request, Response } from 'express';

import { currentUser } from '../middlewares/auth.js';
import { syncQuerySchema } from '../schemas/sync.schema.js';
import * as syncService from '../services/sync.service.js';

export async function pull(req: Request, res: Response) {
  const { since } = syncQuerySchema.parse(req.query);
  res.json(await syncService.pullChanges(currentUser(req).id, since));
}
