import * as ImagePicker from 'expo-image-picker';

// Ouvre la galerie et renvoie les photos choisies (tableau vide si l'utilisateur annule).
//On fais une promise car l'utilisateur peut rester plusieurs secondes dans sa galerie.
//Await mets la fonction en pause jusqu'à ce qu'il ait choisi, du coup on bloque pas l'app.
//Promise<ImagePicker.ImagePickerAsset[]>. Si on renvoyait resultat.assets sans vérifier,
//on renverrait parfois null, et l'écran planterait en faisant assets.length
export async function choisirPhotosGalerie(): Promise<ImagePicker.ImagePickerAsset[]> {
  const resultat = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: 5,
    quality: 0.9,
    exif: true,
  });
  
  //si l'utilisateur a annulé, renvoie []
  if (resultat.canceled) return [];
  //Ici narrowing, si TypeScript sait que canceled vaut false donc assets est un vrai tableau
  //On traite d'abord le cas particulier et on en sort tout de suite. Pas besoin de else.
  return resultat.assets;
}
