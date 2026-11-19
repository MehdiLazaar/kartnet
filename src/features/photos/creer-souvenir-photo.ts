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