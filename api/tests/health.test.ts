import { beforeEach, describe, expect, it } from 'vitest';

import { api, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

describe('GET /api/v1/health', () => {
  it('répond ok quand la base est joignable', async () => {
    const res = await api().get('/api/v1/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'ok' });
  });
});

describe('Routes inconnues', () => {
  it('renvoie une erreur 404 au format standard', async () => {
    const res = await api().get('/api/v1/nexiste-pas').set('Authorization', 'Bearer x').expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');

    const outside = await api().get('/rien').expect(404);
    expect(outside.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('refuse un JSON mal formé', async () => {
    const res = await api()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ')
      .expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
});
