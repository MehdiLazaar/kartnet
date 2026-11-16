// Le contrat que doit respecter tout système de stockage de photos.
// Aujourd'hui : un dossier local (local-storage.ts). Demain : Cloudinary.
// Les services n'utilisent que cette interface : changer de stockage ne les touche pas.

export type IncomingFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

export type StoredFile = {
  /** Identifiant du fichier dans le stockage, pour pouvoir le supprimer. */
  key: string;
  /** Adresse publique à laquelle l'app mobile peut afficher la photo. */
  url: string;
};

export interface StorageService {
  save(file: IncomingFile): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}
