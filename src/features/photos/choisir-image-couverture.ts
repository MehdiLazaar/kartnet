import { savePhoto } from '@/repositories/photoStorage';
import * as ImagePicker from 'expo-image-picker';


// Ouvre la galerie pour choisir UNE image, recadrée en carré, et la copie dans l'app.
// Renvoie le chemin relatif de la copie (ex. "memories/couverture-1731….jpg"), ou null si l'utilisateur annule.
export async function choisirImageCouverture(): Promise<string | null> {
    const resultat = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    //L'utilisateur a fermé la galerie donc pas d'image, on renvoie nul
    if (resultat.canceled) return null;

    //Une seule image, mais assets est toujours un tableau : on prend la première.
    const image = resultat.assets[0];
    // Nom différent à chaque fois sinon on effacerait la nouvelle icon en effacant l'autre
    return savePhoto(image.uri, `couverture-${Date.now()}`);
}
