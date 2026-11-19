import { GeoPoint, Timestamp } from "firebase/firestore";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Textes } from "@/constants/textes";
import { useAuth } from "@/hooks/use-auth";
import { createMemory, removeMemoryRecord, watchMemories } from "@/repositories/memoryRepository";
import { createTrip, deleteTrip, updateTrip, watchTrips } from "@/repositories/tripRepository";
import type { Memory, Trip } from "@/types/model";

export type Voyage = {
  id: string;
  title: string;
  destination: string;
  dateLabel: string;
  photoCount: number;
  souvenirs: SouvenirVoyage[];
};

export type SouvenirVoyage = {
  id: string;
  cheminPhoto: string;
  datePrise: string;
  position: { latitude: number; longitude: number } | null;
  placeName: string | null;
};

type ContexteVoyagesValue = {
  trips: Voyage[];
  creerVoyage: (title: string, destination: string) => Voyage;
  modifierVoyage: (id: string, title: string, destination: string) => void;
  supprimerVoyage: (id: string) => void;
  obtenirVoyage: (id: string) => Voyage | undefined;
  ajouterSouvenir: (idVoyage: string, souvenir: SouvenirVoyage) => void;
  supprimerSouvenir: (idVoyage: string, idSouvenir: string) => void;
};

const ContexteVoyages = createContext<ContexteVoyagesValue | null>(null);
const VOYAGES_VIDES: Trip[] = [];
const SOUVENIRS_VIDES: Record<string, Memory[]> = {};

export function FournisseurVoyages({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [tripsState, setTripsState] = useState<{
    uid: string | undefined;
    trips: Trip[];
  }>({ uid: undefined, trips: [] });
  const [souvenirsState, setSouvenirsState] = useState<{
    uid: string | undefined;
    parVoyage: Record<string, Memory[]>;
  }>({ uid: undefined, parVoyage: {} });
  const tripsFirestore =
    tripsState.uid === uid ? tripsState.trips : VOYAGES_VIDES;
  const souvenirsParVoyage =
    souvenirsState.uid === uid ? souvenirsState.parVoyage : SOUVENIRS_VIDES;

  // S’abonne aux voyages du compte actif ; l’uid dans l’état empêche d’afficher les données d’un autre compte.
  useEffect(() => {
    if (!uid) return;

    return watchTrips(uid, (trips) => setTripsState({ uid, trips }));
  }, [uid]);

  const idsVoyages = tripsFirestore.map((trip) => trip.id).join(",");

  // Garde les souscriptions aux souvenirs synchronisées avec les voyages visibles.
  useEffect(() => {
    if (!uid || !idsVoyages) {
      return;
    }

    const unsubscribeMemories = idsVoyages.split(",").map((idVoyage) =>
      watchMemories(uid, idVoyage, (memories) =>
        setSouvenirsState((current) => ({
          uid,
          parVoyage: {
            ...(current.uid === uid ? current.parVoyage : {}),
            [idVoyage]: memories,
          },
        })),
      ),
    );

    return () => unsubscribeMemories.forEach((unsubscribe) => unsubscribe());
  }, [uid, idsVoyages]);

  const trips = useMemo(
    () =>
      tripsFirestore.map((trip) =>
        versVoyage(trip, souvenirsParVoyage[trip.id] ?? []),
      ),
    [tripsFirestore, souvenirsParVoyage],
  );

  // createTrip renvoie l'id sans attendre le serveur car Firestore le génère sur le téléphone.
  // Sans destination, on enregistre null : le texte de remplacement n'existe qu'à l'affichage.
  const creerVoyage = useCallback((title: string, destination: string): Voyage => {
    if (!uid) throw new Error("Il faut être connecté pour créer un voyage.");
    const id = createTrip(uid, {
      title: title.trim(),
      destination: destination.trim() || null,
      description: null,
      startDate: Timestamp.now(),
      endDate: null,
    });
    return {
      id,
      title: title.trim(),
      destination: destination.trim() || Textes.voyage.destinationParDefaut,
      dateLabel: "Aujourd’hui",
      photoCount: 0,
      souvenirs: [],
    };
  }, [uid]);

  const modifierVoyage = useCallback((id: string, title: string, destination: string) => {
    if (!uid) return;
    updateTrip(uid, id, {
      title: title.trim(), // le trim enlève les espaces en trop au début et à la fin
      destination: destination.trim(),
    });
  }, [uid]);

  // deleteTrip est async (il lit d'abord les souvenirs à effacer) : il renvoie une Promise,
  // on attrape donc l'erreur éventuelle pour l'afficher dans la console.
  const supprimerVoyage = useCallback((id: string) => {
    if (!uid) return;
    deleteTrip(uid, id).catch((error) => console.error("[voyages] suppression", error));
  }, [uid]);

  const obtenirVoyage = useCallback(
    (id: string) => trips.find((trip) => trip.id === id),
    [trips],
  );

  // Enregistre la fiche du souvenir : le fichier photo est déjà dans le stockage local.
  const ajouterSouvenir = useCallback(
    (idVoyage: string, souvenir: SouvenirVoyage) => {
      if (!uid) return;

      createMemory(uid, idVoyage, souvenir.id, souvenir.cheminPhoto, {
        takenAt: Timestamp.fromDate(new Date(souvenir.datePrise)),
        location: souvenir.position
          ? new GeoPoint(
              souvenir.position.latitude,
              souvenir.position.longitude,
            )
          : null,
        placeName: souvenir.placeName,
        stepId: null,
        note: null,
      });
    },
    [uid],
  );

  // Retire uniquement la fiche Firestore : le fichier photo local est conservé.
  const supprimerSouvenir = useCallback(
    (idVoyage: string, idSouvenir: string) => {
      if (!uid) return;
      removeMemoryRecord(uid, idVoyage, idSouvenir);
    },
    [uid],
  );

  const value = useMemo(
    () => ({
      trips,
      creerVoyage,
      modifierVoyage,
      supprimerVoyage,
      obtenirVoyage,
      ajouterSouvenir,
      supprimerSouvenir,
    }),
    [trips, creerVoyage, modifierVoyage, supprimerVoyage, obtenirVoyage, ajouterSouvenir, supprimerSouvenir],
  );

  return (
    <ContexteVoyages.Provider value={value}>
      {children}
    </ContexteVoyages.Provider>
  );
}

export function useVoyages() {
  const context = useContext(ContexteVoyages);
  if (!context) {
    throw new Error(
      "useVoyages doit être utilisé à l’intérieur de FournisseurVoyages.",
    );
  }
  return context;
}

function versSouvenir(memory: Memory): SouvenirVoyage {
  return {
    id: memory.id,
    cheminPhoto: memory.localPhotoPath,
    datePrise: memory.takenAt.toDate().toISOString(),
    placeName: memory.placeName,
    position: memory.location
      ? {
          latitude: memory.location.latitude,
          longitude: memory.location.longitude,
        }
      : null,
  };
}

function versVoyage(trip: Trip, memories: Memory[]): Voyage {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? Textes.voyage.destinationParDefaut,
    dateLabel: trip.startDate.toDate().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    photoCount: memories.length,
    souvenirs: memories.map(versSouvenir),
  };
}
