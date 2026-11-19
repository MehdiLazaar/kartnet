import type { SouvenirVoyage } from "@/features/voyages/contexte-voyages";
import { savePhoto } from "@/repositories/photoStorage";
import type { ImagePickerAsset } from "expo-image-picker";
import * as Location from "expo-location";


// Prépare les métadonnées et copie le fichier durablement avant de l’ajouter au carnet
export async function creerSouvenirDepuisPhoto(
  photoUri: string,
): Promise<SouvenirVoyage> {
  const id = genererIdSouvenir();
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

export async function creerSouvenirDepuisGalerie(
  asset: ImagePickerAsset,
): Promise<SouvenirVoyage> {
  //Appel de la fonction qui génere un ID aléatoire
  const id = genererIdSouvenir();
  //asset.uri est l'adresse du fichier temporaire renvoyé par la galerie
  const cheminPhoto = await savePhoto(asset.uri, id);

  return {
    id,
    cheminPhoto,
    datePrise: new Date().toISOString(),
    //le asset.exif renvoie au tableau avec la latitude et longitude
    position: lirePositionExif(asset.exif),
  }
}

// La géolocalisation est facultative, si on l'as pas ca ne bloque pas le souvenir
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
// Lit la position GPS enregistrée de l'exif de la photo, ou null si elle n'en contient pas.
function lirePositionExif(
  exif: Record<string, unknown> | null | undefined,
): { latitude: number; longitude: number } | null {
  if (!exif) return null;

  const latitude = exif.GPSLatitude;
  const longitude = exif.GPSLongitude;

  //si latitude OU longitude n'est pas un nombre → return null
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  return {
    //négatif si exif.GPSLatitudeRef vaut 'S'
    latitude: exif.GPSLatitudeRef === 'S' ? -latitude : latitude,
    //négatif si exif.GPSLongitudeRef vaut 'W' 
    longitude: exif.GPSLongitudeRef === 'W' ? -longitude : longitude,
  };
}

function genererIdSouvenir(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}