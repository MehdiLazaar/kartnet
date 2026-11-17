import type { GeoPoint, Timestamp } from 'firebase/firestore';

// Les champs `id` ne sont pas stockés dans les documents :
// ils viennent de d.id au moment de la lecture.
// Un champ facultatif est toujours écrit, avec `null` s'il est vide.

// ---------- Voyage : users/{uid}/trips/{tripId} ----------

export type Trip = {
  id: string;
  title: string;
  description: string | null;
  startDate: Timestamp;
  endDate: Timestamp | null;      // null = voyage en cours
  coverMemoryId: string | null;   // id du souvenir utilisé comme couverture
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Ce que l'écran de création fournit au repository
export type NewTrip = Pick<Trip, 'title' | 'description' | 'startDate' | 'endDate'>;

// ---------- Étape (une ville visitée) : trips/{tripId}/steps/{stepId} ----------

export type Step = {
  id: string;
  city: string;
  country: string | null;
  note: string | null;
  location: GeoPoint | null;      // centre de la ville
  order: number;                  // 0, 1, 2… : position dans le voyage
  arrivedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type NewStep = Pick<Step, 'city' | 'country' | 'note' | 'location' | 'order' | 'arrivedAt'>;

// ---------- Souvenir (une photo géolocalisée) : trips/{tripId}/memories/{memoryId} ----------

export type Memory = {
  id: string;
  localPhotoPath: string;         // chemin RELATIF dans le dossier de l'app, ex. "memories/abc.jpg"
  takenAt: Timestamp;             // moment de la prise de vue
  location: GeoPoint | null;      // position GPS au moment de la photo
  placeName: string | null;       // nom du lieu (géocodage inverse)
  stepId: string | null;          // étape à laquelle le souvenir est rattaché
  note: string | null;
  photoStoragePath: string | null; // réservé à Cloud Storage, toujours null pour l'instant
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Pas de localPhotoPath ni de photoStoragePath ici : c'est le repository qui les remplit.
export type NewMemory = Pick<Memory, 'takenAt' | 'location' | 'placeName' | 'stepId' | 'note'>;
