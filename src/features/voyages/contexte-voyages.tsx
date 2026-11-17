import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

export type Voyage = {
  id: string;
  title: string;
  destination: string;
  dateLabel: string;
  photoCount: number;
};

type ContexteVoyagesValue = {
  trips: Voyage[];
  creerVoyage: (title: string, destination: string) => Voyage;
  obtenirVoyage: (id: string) => Voyage | undefined;
};

const ContexteVoyages = createContext<ContexteVoyagesValue | null>(null);

export function FournisseurVoyages({ children }: PropsWithChildren) {
  const [trips, setVoyages] = useState<Voyage[]>([]);

  const creerVoyage = useCallback((title: string, destination: string) => {
    const trip: Voyage = {
      id: `${Date.now()}`,
      title: title.trim(),
      destination: destination.trim() || 'Destination à préciser',
      dateLabel: 'Aujourd’hui',
      photoCount: 0,
    };
    setVoyages((current) => [trip, ...current]);
    return trip;
  }, []);

  const obtenirVoyage = useCallback((id: string) => trips.find((trip) => trip.id === id), [trips]);
  const value = useMemo(() => ({ trips, creerVoyage, obtenirVoyage }), [trips, creerVoyage, obtenirVoyage]);

  return <ContexteVoyages.Provider value={value}>{children}</ContexteVoyages.Provider>;
}

export function useVoyages() {
  const context = useContext(ContexteVoyages);
  if (!context) throw new Error('useVoyages doit être utilisé à l’intérieur de FournisseurVoyages.');
  return context;
}
