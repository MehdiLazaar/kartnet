import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { api, at, createTrip, createUser, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

describe('Voyages', () => {
  it('crée un voyage avec l\'id fourni par le téléphone', async () => {
    const { auth } = await createUser();
    const id = randomUUID();

    const res = await api()
      .put(`/api/v1/trips/${id}`)
      .set(auth)
      .send({ name: 'Japon', startDate: '2026-04-01', endDate: '2026-04-20', updatedAt: at() })
      .expect(201);

    expect(res.body).toMatchObject({ id, name: 'Japon', startDate: '2026-04-01', endDate: '2026-04-20', deletedAt: null });
  });

  it('applique la règle « la dernière modification gagne »', async () => {
    const { auth } = await createUser();
    const id = await createTrip(auth, { updatedAt: at(-60) });

    // Une modification plus récente est appliquée…
    await api()
      .put(`/api/v1/trips/${id}`)
      .set(auth)
      .send({ name: 'Portugal (nouveau nom)', startDate: '2026-07-01', updatedAt: at(-10) })
      .expect(200);

    // … une modification plus ancienne est ignorée, et on renvoie la version du serveur.
    const stale = await api()
      .put(`/api/v1/trips/${id}`)
      .set(auth)
      .send({ name: 'Ancien nom', startDate: '2026-07-01', updatedAt: at(-30) })
      .expect(200);

    expect(stale.body.name).toBe('Portugal (nouveau nom)');
  });

  it('refuse une date de fin avant la date de début', async () => {
    const { auth } = await createUser();
    const res = await api()
      .put(`/api/v1/trips/${randomUUID()}`)
      .set(auth)
      .send({ name: 'Voyage', startDate: '2026-07-10', endDate: '2026-07-01', updatedAt: at() })
      .expect(400);
    expect(res.body.error.details[0].field).toBe('endDate');
  });

  it('liste les voyages avec leurs compteurs', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);
    await api()
      .put(`/api/v1/steps/${randomUUID()}`)
      .set(auth)
      .send({ tripId, city: 'Lisbonne', country: 'Portugal', order: 0, updatedAt: at() })
      .expect(201);

    const res = await api().get('/api/v1/trips').set(auth).expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: tripId, stepCount: 1, memoryCount: 0 });
  });

  it('cache les voyages des autres utilisateurs', async () => {
    const alice = await createUser();
    const bob = await createUser();
    const tripId = await createTrip(alice.auth);

    await api().get(`/api/v1/trips/${tripId}`).set(bob.auth).expect(404);
    await api()
      .put(`/api/v1/trips/${tripId}`)
      .set(bob.auth)
      .send({ name: 'Piraté', startDate: '2026-07-01', updatedAt: at(60) })
      .expect(404);
    await api().delete(`/api/v1/trips/${tripId}`).set(bob.auth).expect(404);

    const list = await api().get('/api/v1/trips').set(bob.auth).expect(200);
    expect(list.body).toEqual([]);
  });

  it('supprime un voyage (suppression douce, requête idempotente)', async () => {
    const { auth } = await createUser();
    const tripId = await createTrip(auth);

    await api().delete(`/api/v1/trips/${tripId}`).set(auth).expect(204);
    await api().delete(`/api/v1/trips/${tripId}`).set(auth).expect(204);
    await api().get(`/api/v1/trips/${tripId}`).set(auth).expect(404);

    // Une modification arrivée après la suppression ne fait pas « revivre » le voyage.
    await api()
      .put(`/api/v1/trips/${tripId}`)
      .set(auth)
      .send({ name: 'Revenant', startDate: '2026-07-01', updatedAt: at(60) })
      .expect(200);
    const list = await api().get('/api/v1/trips').set(auth).expect(200);
    expect(list.body).toEqual([]);
  });

  it('refuse un id qui n\'est pas un UUID', async () => {
    const { auth } = await createUser();
    const res = await api().get('/api/v1/trips/123').set(auth).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
