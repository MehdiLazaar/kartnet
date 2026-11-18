import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Memory, NewMemory } from '@/types/model';
import { deletePhoto } from './photoStorage';

// ---------- Adresses Firestore ----------

const memoriesCol = (uid: string, tripId: string) =>
  collection(db, 'users', uid, 'trips', tripId, 'memories');
const memoryDoc = (uid: string, tripId: string, memoryId: string) =>
  doc(db, 'users', uid, 'trips', tripId, 'memories', memoryId);

const logError = (action: string) => (error: unknown) =>
  console.error(`[memoryRepository] ${action}`, error);

// ---------- Lecture (en temps réel) ----------

// Écoute les souvenirs d'un voyage, du plus ancien au plus récent.
// Renvoie la fonction qui arrête l'écoute (à retourner dans useEffect).
export function watchMemories(
  uid: string,
  tripId: string,
  onChange: (memories: Memory[]) => void,
): Unsubscribe {
  const q = query(memoriesCol(uid, tripId), orderBy('takenAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onChange(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Memory,
        ),
      ),
    logError('watchMemories'),
  );
}

// ---------- Écriture ----------

// Enregistre la fiche d'un souvenir dont la photo est DÉJÀ copiée par savePhoto().
// `memoryId` est le même identifiant que celui utilisé pour nommer le fichier.
// Pas d'await : hors ligne, Firestore garde l'écriture et l'envoie au retour du réseau,
// et onSnapshot affiche le souvenir immédiatement.
export function createMemory(
  uid: string,
  tripId: string,
  memoryId: string,
  localPhotoPath: string,
  input: NewMemory,
): void {
  setDoc(memoryDoc(uid, tripId, memoryId), {
    ...input,
    localPhotoPath,
    photoStoragePath: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(logError('createMemory'));
}

// Supprime la fiche, puis le fichier photo une fois la suppression confirmée par Firestore.
export function deleteMemory(uid: string, tripId: string, memory: Memory): void {
  deleteDoc(memoryDoc(uid, tripId, memory.id))
    .then(() => deletePhoto(memory.localPhotoPath))
    .catch(logError('deleteMemory'));
}

// Retire la fiche du carnet tout en conservant le fichier photo local sur l’appareil.
export function removeMemoryRecord(
  uid: string,
  tripId: string,
  memoryId: string,
): void {
  deleteDoc(memoryDoc(uid, tripId, memoryId)).catch(logError('removeMemoryRecord'));
}
