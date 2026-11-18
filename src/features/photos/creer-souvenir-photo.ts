import * as Location from "expo-location";

import type { SouvenirVoyage } from "@/features/voyages/contexte-voyages";
import { savePhoto } from "@/repositories/photoStorage";

// Prépare les métadonnées et copie le fichier durablement avant de l’ajouter au carnet.
export async function creerSouvenirDepuisPhoto(
  photoUri: string,
): Promise<SouvenirVoyage> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const datePrise = new Date().toISOString();
  const [cheminPhoto, position] = await Promise.all([
    savePhoto(photoUri, id),
    obtenirPositionActuelle(),
  ]);

  return {
    id,
    cheminPhoto,
    datePrise,
    position,
  };
}

// La géolocalisation est facultative : son indisponibilité ne bloque pas le souvenir.
async function obtenirPositionActuelle(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const autorisation = await Location.requestForegroundPermissionsAsync();
    if (!autorisation.granted) return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}
