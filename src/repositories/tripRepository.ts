import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { NewTrip, Trip } from '@/types/model';
import { deletePhoto } from './photoStorage';

// ---------- Adresses Firestore ----------

const tripsCol = (uid: string) => collection(db, 'users', uid, 'trips');
const tripDoc = (uid: string, tripId: string) => doc(db, 'users', uid, 'trips', tripId);

const logError = (action: string) => (error: unknown) =>
  console.error(`[tripRepository] ${action}`, error);

// ---------- Lecture (en temps réel) ----------

// Écoute la liste des voyages, du plus récent au plus ancien.
// Renvoie la fonction qui arrête l'écoute (à retourner dans useEffect).
export function watchTrips(uid: string, onChange: (trips: Trip[]) => void): Unsubscribe {
  const q = query(tripsCol(uid), orderBy('startDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onChange(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Trip,
        ),
      ),
    logError('watchTrips'),
  );
}

// Écoute un seul voyage (écran de détail). null = il n'existe pas ou plus.
export function watchTrip(uid: string, tripId: string, onChange: (trip: Trip | null) => void): Unsubscribe {
  return onSnapshot(
    tripDoc(uid, tripId),
    (d) => onChange(d.exists() ? ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) } as Trip) : null),
    logError('watchTrip'),
  );
}

// ---------- Écriture ----------

// Crée le voyage et renvoie son id tout de suite (même hors ligne).
export function createTrip(uid: string, input: NewTrip): string {
  const ref = doc(tripsCol(uid)); // id généré localement, avant l'écriture
  setDoc(ref, {
    ...input,
    coverMemoryId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(logError('createTrip'));
  return ref.id;
}

type TripChanges = Partial<NewTrip> & { coverMemoryId?: string | null };

export function updateTrip(uid: string, tripId: string, changes: TripChanges): void {
  updateDoc(tripDoc(uid, tripId), { ...changes, updatedAt: serverTimestamp() })
    .catch(logError('updateTrip'));
}

// Supprime le voyage AVEC ses étapes, ses souvenirs et les fichiers photo.
// Firestore ne supprime pas les sous-collections tout seul.
export async function deleteTrip(uid: string, tripId: string): Promise<void> {
  const tripRef = tripDoc(uid, tripId);
  const [steps, memories] = await Promise.all([
    getDocs(collection(tripRef, 'steps')),
    getDocs(collection(tripRef, 'memories')),
  ]);

  const batch = writeBatch(db); // tout ou rien
  steps.forEach((d) => batch.delete(d.ref));
  memories.forEach((d) => batch.delete(d.ref));
  batch.delete(tripRef);
  await batch.commit();

  // Les fichiers ne sont effacés qu'une fois la suppression Firestore réussie.
  memories.forEach((d) => deletePhoto(d.data().localPhotoPath));
}
