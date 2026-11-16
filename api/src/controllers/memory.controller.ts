import type { Request, Response } from 'express';

import { currentUser } from '../middlewares/auth.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { memoryInputSchema } from '../schemas/memory.schema.js';
import * as memoryService from '../services/memory.service.js';

/** POST /memories (multipart) : les champs texte sont dans req.body, la photo dans req.file (via multer). */
export async function save(req: Request, res: Response) {
  const input = memoryInputSchema.parse(req.body);
  const { memory, created } = await memoryService.saveMemory(currentUser(req).id, input, req.file);
  res.status(created ? 201 : 200).json(memory);
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await memoryService.deleteMemory(currentUser(req).id, id);
  res.status(204).end();
}
