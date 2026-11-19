import * as Location from "expo-location";

import type { SouvenirVoyage } from "@/features/voyages/contexte-voyages";
import { savePhoto } from "@/repositories/photoStorage";

// Prépare les métadonnées et copie le fichier durablement avant de l’ajouter au carnet.
export async function creerSouvenirDepuisPhoto(
  photoUri: string,
): Promise<SouvenirVoyage> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const datePrise = new Date().toISOString();
  const [cheminPhoto, localisation] = await Promise.all([
    savePhoto(photoUri, id),
    obtenirPositionActuelle(),
  ]);

  return {
    id,
    cheminPhoto,
    datePrise,
    position: localisation?.position ?? null,
    placeName: localisation?.placeName ?? null,
  };
}

// La géolocalisation est facultative : son indisponibilité ne bloque pas le souvenir.
async function obtenirPositionActuelle(): Promise<{
  position: { latitude: number; longitude: number };
  placeName: string | null;
} | null> {
  try {
    const autorisation = await Location.requestForegroundPermissionsAsync();
    if (!autorisation.granted) return null;

    const gpsPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const position = {
      latitude: gpsPosition.coords.latitude,
      longitude: gpsPosition.coords.longitude,
    };
    let placeName: string | null = null;
    try {
      const [adresse] = await Location.reverseGeocodeAsync(position);
      if (adresse) {
        const ville = adresse.city ?? adresse.subregion ?? adresse.region;
        placeName = [ville, adresse.country].filter(Boolean).join(', ') || null;
      }
    } catch {
      // Le GPS reste exploitable si le service de géocodage est indisponible.
    }
    return { position, placeName };
  } catch {
    return null;
  }
}
