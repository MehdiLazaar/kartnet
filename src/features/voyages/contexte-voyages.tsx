import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { createMemory, watchMemories } from '@/repositories/memoryRepository';
import { createTrip, watchTrips } from '@/repositories/tripRepository';
import type { Memory, Trip } from '@/types/model';
import { GeoPoint, Timestamp } from 'firebase/firestore';

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
};

type ContexteVoyagesValue = {
  trips: Voyage[];
  creerVoyage: (title: string, destination: string) => Voyage;
  obtenirVoyage: (id: string) => Voyage | undefined;
  ajouterSouvenir: (idVoyage: string, souvenir: SouvenirVoyage) => void;
};

const ContexteVoyages = createContext<ContexteVoyagesValue | null>(null);

export function FournisseurVoyages({ children }: PropsWithChildren) {
  const { user } = useAuth();
  // le user?.uid Renvoie undefined si user est null, ne plante pas
  const uid = user?.uid;

  //Copie en local de ce que firestor nous envoie
  const [tripsFirestore, setTripsFirestore] = useState<Trip[]>([]);
  //Record<string, Memory[]> est un object "dictionnaire" { "idVoyage1": [souvenirs...], "idVoyage2": [...] }.
  const [souvenirsParVoyage, setSouvenirsParVoyage] = useState<Record<string, Memory[]>>({});


  //sert à s'abonner a fireStore
  //fireBase retrouve la session, le uid passe de undefined a celui du user et l'effect s'execute
  // watchTrips appelle setTripsFirestore tout de suite avec les voyages deja enregistré, puis a chaque changement
  useEffect(() => {
    if (!uid) return; //personne est connecté, pas besoin d'écouter

    const arreter = watchTrips(uid, setTripsFirestore);
    //a la déco, le uid change, et react appelle en premier la fonction de nettoyage , on se désabonne et vide l'état
    return () => {
      arreter(); //on arrete l'écoute
      setTripsFirestore([]); //on vide : le prochain compte ne verra rien de celui-ci
      setSouvenirsParVoyage({});
    };
  }, [uid]);

  //
  const idsVoyages = tripsFirestore.map((trip) => trip.id).join(',');


  useEffect(() => {
    if (!uid || !idsVoyages) return;

    const arrets = idsVoyages.split(',').map((idVoyage) =>
      watchMemories(uid, idVoyage, (memories) =>
        setSouvenirsParVoyage((actuel) => ({ ...actuel, [idVoyage]: memories })),
      ),
    );
    return () => arrets.forEach((arreter) => arreter());
  }, [uid, idsVoyages]);

  //liste finale pour les écrans
  const trips = useMemo(
    () => tripsFirestore.map((trip) => versVoyage(trip, souvenirsParVoyage[trip.id] ?? [])),
    [tripsFirestore, souvenirsParVoyage],
  );
  //createTrip renvoie l'id sans attendre le serveur car Firestore le génere sur le tel. 
  const creerVoyage = useCallback((title: string, destination: string): Voyage => {
    if (!uid) throw new Error('Il faut etre connecté pour créer un voyage.');
    const id = createTrip(uid, {
      title: title.trim(),
      destination: destination.trim() || null,
      description: null,
      startDate: Timestamp.now(),
      endDate: null,
    });
    return {
      id, title: title.trim(), destination: destination.trim() || 'Destination à préciser',
      dateLabel: 'Aujourd’hui', photoCount: 0, souvenirs: []
    };
  }, [uid]);

  const obtenirVoyage = useCallback((id: string) => trips.find((trip) => trip.id === id), [trips]);

  const ajouterSouvenir = useCallback((idVoyage: string, souvenir: SouvenirVoyage) => {
    if (!uid) return;
    createMemory(uid, idVoyage, souvenir.id, souvenir.cheminPhoto, {
      takenAt: Timestamp.fromDate(new Date(souvenir.datePrise)),
      location: souvenir.position
        ? new GeoPoint(souvenir.position.latitude, souvenir.position.longitude)
        : null,
      placeName: null,
      stepId: null,
      note: null,
    });
  }, [uid]);

  const value = useMemo(
    () => ({ trips, creerVoyage, obtenirVoyage, ajouterSouvenir }),
    [trips, creerVoyage, obtenirVoyage, ajouterSouvenir],
  );


  return <ContexteVoyages.Provider value={value}>{children}</ContexteVoyages.Provider>;
}

export function useVoyages() {
  const context = useContext(ContexteVoyages);
  if (!context) throw new Error('useVoyages doit être utilisé à l’intérieur de FournisseurVoyages.');
  return context;
}

function versSouvenir(memory: Memory): SouvenirVoyage {
  return {
    id: memory.id,
    cheminPhoto: memory.localPhotoPath,
    datePrise: memory.takenAt.toDate().toISOString(),
    position: memory.location
      ? { latitude: memory.location.latitude, longitude: memory.location.longitude }
      : null,
  };
}

function versVoyage(trip: Trip, memories: Memory[]): Voyage {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? 'destination à préciser',
    dateLabel: trip.startDate.toDate().toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    photoCount: memories.length, //calculé, plus de compteurs à tenir a jour
    souvenirs: memories.map(versSouvenir),
  };
}