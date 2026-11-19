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
  //asset.exif contient les métadonnées de la photo, dont sa position GPS
  const position = lirePositionExif(asset.exif);
  //pas de position (ex. capture d'écran) : pas de nom de lieu, on n'appelle pas le service
  const placeName = position ? await obtenirNomLieu(position) : null;

  return {
    id,
    cheminPhoto,
    datePrise: new Date().toISOString(),
    position,
    placeName,
  };
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
    const placeName = await obtenirNomLieu(position);
    return { position, placeName };
  } catch {
    return null;
  }
}

// Transforme des coordonnées GPS en nom de lieu lisible (ex. "Brest, France"), ou null.
// Partagé par la caméra et la galerie. Facultatif : si le service de géocodage échoue,
// le souvenir reste valable avec sa position GPS, simplement sans nom.
async function obtenirNomLieu(position: {
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  try {
    const [adresse] = await Location.reverseGeocodeAsync(position);
    if (!adresse) return null;
    const ville = adresse.city ?? adresse.subregion ?? adresse.region;
    // filter(Boolean) retire les morceaux vides ; si tout est vide, join donne '' → null
    return [ville, adresse.country].filter(Boolean).join(', ') || null;
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