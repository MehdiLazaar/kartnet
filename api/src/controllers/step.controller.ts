import type { Request, Response } from 'express';

import { currentUser } from '../middlewares/auth.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { stepInputSchema } from '../schemas/step.schema.js';
import * as stepService from '../services/step.service.js';

export async function upsert(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = stepInputSchema.parse(req.body);
  const { step, created } = await stepService.upsertStep(currentUser(req).id, id, input);
  res.status(created ? 201 : 200).json(step);
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await stepService.deleteStep(currentUser(req).id, id);
  res.status(204).end();
}
