import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { api, at, createTrip, createUser, fakeJpeg, resetDatabase } from './helpers.js';

async function createStep(auth: Record<string, string>, tripId: string, city: string, order: number) {
  const id = randomUUID();
  await api()
    .put(`/api/v1/steps/${id}`)
    .set(auth)
    .send({ tripId, city, country: 'Portugal', order, updatedAt: at() })
    .expect(201);
  return id;
}

function postMemory(auth: Record<string, string>, fields: Record<string, string>, withPhoto = true) {
  const req = api().post('/api/v1/memories').set(auth);
  for (const [key, value] of Object.entries(fields)) {
    req.field(key, value);
  }
  if (withPhoto) {
    req.attach('photo', fakeJpeg, { filename: 'photo.jpg', contentType: 'image/jpeg' });
  }
  return req;
}

beforeEach(resetDatabase);

describe('Souvenirs', () => {
  it('enregistre une photo géolocalisée et la rend accessible', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    const stepId = await createStep(auth, tripId, 'Lisbonne', 0);
    const id = randomUUID();

    const res = await postMemory(auth, {
      id,
      tripId,
      stepId,
      latitude: '38.7139',
      longitude: '-9.1334',
      takenAt: '2026-07-02T10:15:00.000Z',
      note: 'Vue depuis le Miradouro da Graça',
      updatedAt: at(),
    }).expect(201);

    expect(res.body).toMatchObject({ id, tripId, stepId, latitude: 38.7139, longitude: -9.1334 });
    expect(res.body).not.toHaveProperty('photoKey');
    expect(res.body.photoUrl).toMatch(/\/uploads\/.+\.jpg$/);

    const photoPath = new URL(res.body.photoUrl as string).pathname;
    await api().get(photoPath).expect(200);
  });

  it('exige une photo pour créer un souvenir, mais pas pour modifier sa note', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    const id = randomUUID();
    const base = { id, tripId, latitude: '41.14', longitude: '-8.61', takenAt: '2026-07-05T18:00:00.000Z' };

    const missing = await postMemory(auth, { ...base, updatedAt: at(-30) }, false).expect(400);
    expect(missing.body.error.message).toMatch(/photo/i);

    await postMemory(auth, { ...base, updatedAt: at(-30) }).expect(201);
    const updated = await postMemory(auth, { ...base, note: 'Coucher de soleil', updatedAt: at() }, false).expect(200);
    expect(updated.body.note).toBe('Coucher de soleil');
  });

  it('refuse un fichier qui n\'est pas une image', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);

    const res = await api()
      .post('/api/v1/memories')
      .set(auth)
      .field('id', randomUUID())
      .field('tripId', tripId)
      .field('latitude', '41.14')
      .field('longitude', '-8.61')
      .field('takenAt', '2026-07-05T18:00:00.000Z')
      .field('updatedAt', at())
      .attach('photo', Buffer.from('bonjour'), { filename: 'notes.txt', contentType: 'text/plain' })
      .expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('refuse une étape qui appartient à un autre voyage', async () => {
    const { auth } = await createUser();
    const tripA = await createTrip(auth);
    const tripB = await createTrip(auth, { name: 'Autre voyage' });
    const stepOfB = await createStep(auth, tripB, 'Porto', 0);

    await postMemory(auth, {
      id: randomUUID(),
      tripId: tripA,
      stepId: stepOfB,
      latitude: '41.14',
      longitude: '-8.61',
      takenAt: '2026-07-05T18:00:00.000Z',
      updatedAt: at(),
    }).expect(400);
  });

  it('retrace le voyage : étapes dans l\'ordre et trajet chronologique', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    const porto = await createStep(auth, tripId, 'Porto', 1);
    const lisbonne = await createStep(auth, tripId, 'Lisbonne', 0);

    const points = [
      { stepId: porto, latitude: '41.1406', longitude: '-8.6110', takenAt: '2026-07-06T09:00:00.000Z' },
      { stepId: lisbonne, latitude: '38.7139', longitude: '-9.1334', takenAt: '2026-07-02T10:00:00.000Z' },
      { stepId: lisbonne, latitude: '38.6916', longitude: '-9.2160', takenAt: '2026-07-03T15:00:00.000Z' },
    ];
    for (const point of points) {
      await postMemory(auth, { id: randomUUID(), tripId, ...point, updatedAt: at() }).expect(201);
    }

    const res = await api().get(`/api/v1/trips/${tripId}`).set(auth).expect(200);

    expect(res.body.steps.map((s: { city: string }) => s.city)).toEqual(['Lisbonne', 'Porto']);
    expect(res.body.steps[0].memories).toHaveLength(2);
    expect(res.body.path.map((p: { latitude: number }) => p.latitude)).toEqual([38.7139, 38.6916, 41.1406]);
  });

  it('détache les souvenirs quand on supprime leur étape', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    const stepId = await createStep(auth, tripId, 'Lagos', 0);
    await postMemory(auth, {
      id: randomUUID(),
      tripId,
      stepId,
      latitude: '37.10',
      longitude: '-8.67',
      takenAt: '2026-07-10T12:00:00.000Z',
      updatedAt: at(),
    }).expect(201);

    await api().delete(`/api/v1/steps/${stepId}`).set(auth).expect(204);

    const res = await api().get(`/api/v1/trips/${tripId}`).set(auth).expect(200);
    expect(res.body.steps).toEqual([]);
    expect(res.body.unassignedMemories).toHaveLength(1);
  });
});
