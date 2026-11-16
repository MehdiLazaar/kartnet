import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { api, at, createTrip, createUser, fakeJpeg, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

describe('Synchronisation', () => {
  it('renvoie tout au premier appel, puis seulement ce qui a changé', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);

    const first = await api().get('/api/v1/sync').set(auth).expect(200);
    expect(first.body.trips).toHaveLength(1);
    expect(first.body.serverTime).toEqual(expect.any(String));

    // Rien n'a changé depuis : réponse vide.
    const nothing = await api().get('/api/v1/sync').query({ since: first.body.serverTime }).set(auth).expect(200);
    expect(nothing.body.trips).toEqual([]);

    // Un souvenir pris « hier » hors ligne mais envoyé maintenant est bien transmis.
    await api()
      .post('/api/v1/memories')
      .set(auth)
      .field('id', randomUUID())
      .field('tripId', tripId)
      .field('latitude', '38.71')
      .field('longitude', '-9.13')
      .field('takenAt', at(-86_400))
      .field('updatedAt', at(-86_400))
      .attach('photo', fakeJpeg, { filename: 'p.jpg', contentType: 'image/jpeg' })
      .expect(201);

    const next = await api().get('/api/v1/sync').query({ since: first.body.serverTime }).set(auth).expect(200);
    expect(next.body.memories).toHaveLength(1);
  });

  it('transmet les suppressions', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    const before = await api().get('/api/v1/sync').set(auth).expect(200);

    await api().delete(`/api/v1/trips/${tripId}`).set(auth).expect(204);

    const res = await api().get('/api/v1/sync').query({ since: before.body.serverTime }).set(auth).expect(200);
    expect(res.body.trips).toHaveLength(1);
    expect(res.body.trips[0].deletedAt).not.toBeNull();
  });

  it('ne mélange pas les données de deux utilisateurs', async () => {
    const alice = await createUser();
    const bob = await createUser();
    await createTrip(alice.auth);

    const res = await api().get('/api/v1/sync').set(bob.auth).expect(200);
    expect(res.body).toMatchObject({ trips: [], steps: [], memories: [] });
  });
});
