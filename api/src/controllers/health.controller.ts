import type { Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';

/** GET /health : l'API répond-elle, et arrive-t-elle à joindre la base ? */
export async function health(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable', time: new Date().toISOString() });
  }
}
