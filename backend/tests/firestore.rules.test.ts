import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
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
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

// Ces tests tournent contre l'emulator Firestore (lancé par `npm test`),
// jamais contre la vraie base.
let env: RulesTestEnvironment;

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

// ---------- Profil utilisateur -------------------------------------------------

describe('users/{uid}', () => {
  it('un utilisateur peut créer son propre profil', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'users/alice'), { displayName: 'Alice', ...created() }));
  });

  it("personne ne peut créer le profil de quelqu'un d'autre", async () => {
    await assertFails(setDoc(doc(db('bob'), 'users/alice'), { displayName: 'Bob', ...created() }));
  });

  it('un visiteur non connecté ne peut rien lire', async () => {
    await seed('users/alice', { displayName: 'Alice' });
    await assertFails(getDoc(doc(anonymousDb(), 'users/alice')));
  });

  it('un champ inconnu est refusé', async () => {
    await assertFails(
      setDoc(doc(db('alice'), 'users/alice'), { displayName: 'Alice', isAdmin: true, ...created() }),
    );
  });

  it("createdAt doit venir du serveur, pas de l'horloge du téléphone", async () => {
    await assertFails(
      setDoc(doc(db('alice'), 'users/alice'), {
        displayName: 'Alice',
        createdAt: Timestamp.now(),
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

// ---------- Voyages -------------------------------------------------------------

describe('trips', () => {
  it('le propriétaire peut créer un voyage valide', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), aliceTrip), validTrip()));
  });

  it("un autre utilisateur ne peut ni lire ni écrire les voyages d'Alice", async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertFails(getDoc(doc(db('bob'), aliceTrip)));
    await assertFails(setDoc(doc(db('bob'), 'users/alice/trips/trip2'), validTrip()));
  });

  it('un titre vide est refusé', async () => {
    await assertFails(setDoc(doc(db('alice'), aliceTrip), { ...validTrip(), title: '' }));
  });

  it('la date de fin ne peut pas précéder la date de début', async () => {
    await assertFails(
      setDoc(doc(db('alice'), aliceTrip), {
        ...validTrip(),
        endDate: Timestamp.fromDate(new Date('2026-03-01')),
      }),
    );
  });

  it('une mise à jour garde createdAt et rafraîchit updatedAt', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    const ref = doc(db('alice'), aliceTrip);
    await assertSucceeds(updateDoc(ref, { title: 'Japon et Corée', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(ref, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  });

  it('le propriétaire peut supprimer son voyage', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertSucceeds(deleteDoc(doc(db('alice'), aliceTrip)));
  });
});

// ---------- Étapes ---------------------------------------------------------------

describe('steps', () => {
  it('on peut ajouter une étape à un voyage existant', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertSucceeds(setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), validStep()));
  });

  it("on ne peut pas ajouter d'étape à un voyage qui n'existe pas", async () => {
    await assertFails(setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), validStep()));
  });

  it('on peut créer le voyage et sa première étape dans le même batch', async () => {
    const aliceDb = db('alice');
    const batch = writeBatch(aliceDb);
    batch.set(doc(aliceDb, aliceTrip), validTrip());
    batch.set(doc(aliceDb, `${aliceTrip}/steps/s1`), validStep());
    await assertSucceeds(batch.commit());
  });

  it("l'ordre doit être un entier positif", async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertFails(setDoc(doc(db('alice'), `${aliceTrip}/steps/s1`), { ...validStep(), order: -1 }));
  });
});

// ---------- Souvenirs ----------------------------------------------------------

describe('memories', () => {
  it('on peut créer un souvenir sans étape', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertSucceeds(setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), validMemory()));
  });

  it('on peut rattacher un souvenir à une étape existante', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await seed(`${aliceTrip}/steps/s1`, { city: 'Kyoto', order: 0 });
    await assertSucceeds(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), { ...validMemory(), stepId: 's1' }),
    );
  });

  it("stepId ne peut pas pointer vers une étape qui n'existe pas", async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertFails(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), { ...validMemory(), stepId: 'fantome' }),
    );
  });

  it('la position doit être un GeoPoint', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertFails(
      setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), { ...validMemory(), location: '35.0, 135.7' }),
    );
  });

  it('la photo locale est obligatoire', async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    const { localPhotoPath: _omitted, ...withoutPhoto } = validMemory();
    await assertFails(setDoc(doc(db('alice'), `${aliceTrip}/memories/m1`), withoutPhoto));
  });

  it("Bob ne peut pas ajouter de souvenir dans le voyage d'Alice", async () => {
    await seed(aliceTrip, { title: 'Japon', startDate: Timestamp.now() });
    await assertFails(setDoc(doc(db('bob'), `${aliceTrip}/memories/m1`), validMemory()));
  });
});
