import type { Request, Response } from 'express';

import { currentUser } from '../middlewares/auth.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { tripInputSchema } from '../schemas/trip.schema.js';
import * as tripService from '../services/trip.service.js';

export async function list(req: Request, res: Response) {
  res.json(await tripService.listTrips(currentUser(req).id));
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await tripService.getTrip(currentUser(req).id, id));
}

export async function upsert(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = tripInputSchema.parse(req.body);
  const { trip, created } = await tripService.upsertTrip(currentUser(req).id, id, input);
  res.status(created ? 201 : 200).json(trip);
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await tripService.deleteTrip(currentUser(req).id, id);
  res.status(204).end();
}
