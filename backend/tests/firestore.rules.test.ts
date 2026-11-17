import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  GeoPoint,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Ces tests tournent contre l'emulator Firestore (lancé par `npm test`),
// jamais contre la vraie base.
//
// Chaque test vérifie explicitement le résultat :
//   - autorisé : la promesse se résout   → expect(...).resolves
//   - refusé   : elle est rejetée avec le code "permission-denied" → expect(...).rejects
let env: RulesTestEnvironment;

const DENIED = { code: 'permission-denied' };

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-kartnet',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

// ---------- Outils ------------------------------------------------------------

const db = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;
const anonymousDb = () => env.unauthenticatedContext().firestore() as unknown as Firestore;

const created = () => ({ createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

const validTrip = () => ({
  title: 'Japon 2026',
  destination: 'Japon',
  description: 'Deux semaines entre Tokyo et Kyoto',
  startDate: Timestamp.fromDate(new Date('2026-04-01')),
  endDate: Timestamp.fromDate(new Date('2026-04-15')),
  coverMemoryId: null,
  ...created(),
});

const validStep = () => ({
  city: 'Kyoto',
  country: 'Japon',
  note: 'Les temples sous la pluie',
  location: new GeoPoint(35.0116, 135.7681),
  order: 0,
  arrivedAt: Timestamp.fromDate(new Date('2026-04-05')),
  ...created(),
});

const validMemory = () => ({
  stepId: null,
  note: 'Fushimi Inari au lever du soleil',
  location: new GeoPoint(34.9671, 135.7727),
  placeName: 'Fushimi Inari-taisha',
  takenAt: Timestamp.fromDate(new Date('2026-04-06T06:30:00Z')),
  localPhotoPath: 'memories/m1.jpg',
  photoStoragePath: null,
  ...created(),
});

// Écrit des données sans passer par les règles (pour préparer un test).
async function seed(path: string, data: Record<string, unknown>) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const now = Timestamp.now();
    await setDoc(doc(ctx.firestore() as unknown as Firestore, path), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  });
}

const aliceTrip = 'users/alice/trips/trip1';
const seedAliceTrip = () => seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });

// ---------- Profil utilisateur -------------------------------------------------

describe('users/{uid}', () => {
  it('un utilisateur peut créer son propre profil', async () => {
    await expect(
      setDoc(doc(db('alice'), 'users/alice'), { displayName: 'Alice', ...created() }),
    ).resolves.toBeUndefined();
  });

  it("personne ne peut créer le profil de quelqu'un d'autre", async () => {
    await expect(
      setDoc(doc(db('bob'), 'users/alice'), { displayName: 'Bob', ...created() }),
    ).rejects.toMatchObject(DENIED);
  });

  it('un visiteur non connecté ne peut rien lire', async () => {
    await seed('users/alice', { displayName: 'Alice' });
    await expect(getDoc(doc(anonymousDb(), 'users/alice'))).rejects.toMatchObject(DENIED);
  });

  it('un champ inconnu est refusé', async () => {
    await expect(
      setDoc(doc(db('alice'), 'users/alice'), { displayName: 'Alice', isAdmin: true, ...created() }),
    ).rejects.toMatchObject(DENIED);
  });

  it("createdAt doit venir du serveur, pas de l'horloge du téléphone", async () => {
    await expect(
      setDoc(doc(db('alice'), 'users/alice'), {
        displayName: 'Alice',
        createdAt: Timestamp.now(),
        updatedAt: serverTimestamp(),
      }),
    ).rejects.toMatchObject(DENIED);
  });
});

// ---------- Voyages -------------------------------------------------------------

describe('trips', () => {
  it('le propriétaire peut créer un voyage valide', async () => {
    await expect(setDoc(doc(db('alice'), aliceTrip), validTrip())).resolves.toBeUndefined();
  });

  it("un autre utilisateur ne peut ni lire ni écrire les voyages d'Alice", async () => {
    await seedAliceTrip();
    await expect(getDoc(doc(db('bob'), aliceTrip))).rejects.toMatchObject(DENIED);
    await expect(
      setDoc(doc(db('bob'), 'users/alice/trips/trip2'), validTrip()),
    ).rejects.toMatchObject(DENIED);
  });

  it('un titre vide est refusé', async () => {
    await expect(
      setDoc(doc(db('alice'), aliceTrip), { ...validTrip(), title: '' }),
    ).rejects.toMatchObject(DENIED);
  });

  it('la destination ne peut pas dépasser 100 caractères', async () => {
    await expect(
      setDoc(doc(db('alice'), aliceTrip), { ...validTrip(), destination: 'x'.repeat(101) }),
    ).rejects.toMatchObject(DENIED);
  });

  it('la date de fin ne peut pas précéder la date de début', async () => {
    await expect(
      setDoc(doc(db('alice'), aliceTrip), {
        ...validTrip(),
        endDate: Timestamp.fromDate(new Date('2026-03-01')),
      }),
    ).rejects.toMatchObject(DENIED);
  });

  it('une mise à jour garde createdAt et rafraîchit updatedAt', async () => {
    await seedAliceTrip();
    const ref = doc(db('alice'), aliceTrip);
    await expect(
      updateDoc(ref, { title: 'Japon et Corée', updatedAt: serverTimestamp() }),
    ).resolves.toBeUndefined();
    await expect(
      updateDoc(ref, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    ).rejects.toMatchObject(DENIED);
  });

  it('le propriétaire peut supprimer son voyage', async () => {
    await seedAliceTrip();
    await expect(deleteDoc(doc(db('alice'), aliceTrip))).resolves.toBeUndefined();
  });
});

// ---------- Étapes ---------------------------------------------------------------

describe('steps', () => {
  it('on peut ajouter une étape à un voyage existant', async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), validStep()),
    ).resolves.toBeUndefined();
  });

  it("on ne peut pas ajouter d'étape à un voyage qui n'existe pas", async () => {
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), validStep()),
    ).rejects.toMatchObject(DENIED);
  });

  it('on peut créer le voyage et sa première étape dans le même batch', async () => {
    const aliceDb = db('alice');
    const batch = writeBatch(aliceDb);
    batch.set(doc(aliceDb, aliceTrip), validTrip());
    batch.set(doc(aliceDb, `${aliceTrip}/steps/s1`), validStep());
    await expect(batch.commit()).resolves.toBeUndefined();
  });

  it("l'ordre doit être un entier positif", async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), { ...validStep(), order: -1 }),
    ).rejects.toMatchObject(DENIED);
  });
});

// ---------- Souvenirs ----------------------------------------------------------

describe('memories', () => {
  it('on peut créer un souvenir sans étape', async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), validMemory()),
    ).resolves.toBeUndefined();
  });

  it('on peut rattacher un souvenir à une étape existante', async () => {
    await seedAliceTrip();
    await seed(`${aliceTrip}/steps/s1`, { city: 'Kyoto', order: 0 });
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), { ...validMemory(), stepId: 's1' }),
    ).resolves.toBeUndefined();
  });

  it("stepId ne peut pas pointer vers une étape qui n'existe pas", async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), { ...validMemory(), stepId: 'fantome' }),
    ).rejects.toMatchObject(DENIED);
  });

  it('la position doit être un GeoPoint', async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), {
        ...validMemory(),
        location: '35.0, 135.7',
      }),
    ).rejects.toMatchObject(DENIED);
  });

  it('la photo locale est obligatoire', async () => {
    await seedAliceTrip();
    const { localPhotoPath: _omitted, ...withoutPhoto } = validMemory();
    await expect(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), withoutPhoto),
    ).rejects.toMatchObject(DENIED);
  });

  it("Bob ne peut pas ajouter de souvenir dans le voyage d'Alice", async () => {
    await seedAliceTrip();
    await expect(
      setDoc(doc(db('bob'), `${aliceTrip}/memories/m1`), validMemory()),
    ).rejects.toMatchObject(DENIED);
  });
});
