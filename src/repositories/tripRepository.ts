import {
  collection,
  doc,
  getDoc,
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
    coverPhotoPath: null, // pas d'icône à la création : elle se choisit dans l'écran de modification
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(logError('createTrip'));
  return ref.id;
}

type TripChanges = Partial<NewTrip> & {
  coverMemoryId?: string | null;
  coverPhotoPath?: string | null;
};

export function updateTrip(uid: string, tripId: string, changes: TripChanges): void {
  updateDoc(tripDoc(uid, tripId), { ...changes, updatedAt: serverTimestamp() })
    .catch(logError('updateTrip'));
}

// Change l'icône du voyage, puis efface le fichier de l'ancienne icône.
// Comme pour deleteTrip, le fichier n'est effacé qu'une fois l'écriture Firestore réussie :
// si elle échoue, le voyage pointe toujours vers l'ancienne image, qui doit donc rester.
export function setTripCover(
  uid: string,
  tripId: string,
  coverPhotoPath: string,
  previousCoverPhotoPath: string | null,
): void {
  updateDoc(tripDoc(uid, tripId), { coverPhotoPath, updatedAt: serverTimestamp() })
    .then(() => {
      if (previousCoverPhotoPath) deletePhoto(previousCoverPhotoPath);
    })
    .catch(logError('setTripCover'));
}

// Supprime le voyage AVEC ses étapes, ses souvenirs et les fichiers photo.
// Firestore ne supprime pas les sous-collections tout seul.
export async function deleteTrip(uid: string, tripId: string): Promise<void> {
  const tripRef = tripDoc(uid, tripId);
  // On lit aussi le voyage lui-même pour connaître le fichier de son icône avant de l'effacer.
  const [trip, steps, memories] = await Promise.all([
    getDoc(tripRef),
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
  // data() n'est pas typé : typeof vérifie que l'icône existe vraiment (anciens voyages : champ absent).
  const coverPhotoPath = trip.data()?.coverPhotoPath;
  if (typeof coverPhotoPath === 'string') deletePhoto(coverPhotoPath);
}
