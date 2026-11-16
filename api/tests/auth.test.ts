import { beforeEach, describe, expect, it } from 'vitest';

import { api, createUser, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

describe('Authentification', () => {
  it('crée un compte et renvoie un token, sans jamais exposer le mot de passe', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'Lea@Kartnet.test', password: 'motdepasse123' })
      .expect(201);

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('lea@kartnet.test'); // email normalisé en minuscules
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('refuse un email déjà utilisé', async () => {
    await createUser('lea@kartnet.test');
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'lea@kartnet.test', password: 'motdepasse123' })
      .expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('valide les données et explique ce qui ne va pas', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'pas-un-email', password: 'court' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('connecte avec le bon mot de passe', async () => {
    await createUser('lea@kartnet.test');
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'lea@kartnet.test', password: 'motdepasse123' })
      .expect(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('donne le même message pour un mauvais mot de passe et un email inconnu', async () => {
    await createUser('lea@kartnet.test');
    const wrongPassword = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'lea@kartnet.test', password: 'mauvais' })
      .expect(401);
    const unknownEmail = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'inconnu@kartnet.test', password: 'mauvais' })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it('protège /auth/me', async () => {
    await api().get('/api/v1/auth/me').expect(401);
    await api().get('/api/v1/auth/me').set('Authorization', 'Bearer token-bidon').expect(401);

    const { auth, email } = await createUser();
    const res = await api().get('/api/v1/auth/me').set(auth).expect(200);
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('passwordHash');
  });
});
