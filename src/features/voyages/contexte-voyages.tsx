import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

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
  // Les voyages et leurs souvenirs sont partagés entre les écrans pendant la session.
  // Cette version du contexte est en mémoire ; elle ne les restaure pas après fermeture.
  const [trips, setVoyages] = useState<Voyage[]>([]);

  const creerVoyage = useCallback((title: string, destination: string) => {
    const trip: Voyage = {
      id: `${Date.now()}`,
      title: title.trim(),
      destination: destination.trim() || 'Destination à préciser',
      dateLabel: 'Aujourd’hui',
      photoCount: 0,
      souvenirs: [],
    };
    setVoyages((current) => [trip, ...current]);
    return trip;
  }, []);

  const obtenirVoyage = useCallback((id: string) => trips.find((trip) => trip.id === id), [trips]);
  const ajouterSouvenir = useCallback((idVoyage: string, souvenir: SouvenirVoyage) => {
    // Ajoute le souvenir au voyage et met à jour le compteur affiché dans le carnet.
    setVoyages((voyagesActuels) => voyagesActuels.map((voyage) =>
      voyage.id === idVoyage
        ? {
            ...voyage,
            souvenirs: [...voyage.souvenirs, souvenir],
            photoCount: voyage.photoCount + 1,
          }
        : voyage,
    ));
  }, []);
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
