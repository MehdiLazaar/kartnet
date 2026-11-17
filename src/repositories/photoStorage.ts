import { Directory, File, Paths } from 'expo-file-system';

// Les photos sont copiées dans le dossier "documents" de l'app :
// iOS ne les supprime pas, contrairement au cache.
const MEMORIES_DIR = 'memories';

// Copie la photo temporaire (donnée par la caméra ou la galerie) dans l'app.
// Renvoie le chemin RELATIF à stocker dans Firestore, ex. "memories/abc.jpg".
export async function savePhoto(tempUri: string, memoryId: string): Promise<string> {
  const folder = new Directory(Paths.document, MEMORIES_DIR);
  folder.create({ idempotent: true, intermediates: true }); // ne plante pas si le dossier existe déjà

  const extension = tempUri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${memoryId}.${extension}`;
  await new File(tempUri).copy(new File(folder, fileName));

  return `${MEMORIES_DIR}/${fileName}`;
}

// Reconstruit l'URI complète au moment de l'affichage (<Image source={{ uri }} />).
export function getPhotoUri(relativePath: string): string {
  return new File(Paths.document, ...relativePath.split('/')).uri;
}

export function deletePhoto(relativePath: string): void {
  const file = new File(Paths.document, ...relativePath.split('/'));
  if (file.exists) file.delete();
}
