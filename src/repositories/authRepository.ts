import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type Unsubscribe,
    type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

// Écoute l'utilisateur connecté : appelée au démarrage, puis à chaque connexion ou déconnexion.
// null = personne n'est connecté.
export function watchAuth(onChange: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, onChange);
}

// Crée le compte, puis le profil users/{uid} attendu par les règles Firestore.
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const name = displayName.trim(); // les règles exigent 1 à 50 caractères
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await Promise.all([
    updateProfile(user, { displayName: name }),
    setDoc(doc(db, 'users', user.uid), {
      displayName: name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  ]);
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  return user;
}

export function logOut(): Promise<void> {
  return signOut(auth);
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

// Traduit les erreurs Firebase en messages à afficher à l'utilisateur.
export function authErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) return 'Une erreur inattendue est survenue.';
  switch (error.code) {
    case 'auth/invalid-email':
      return "L'adresse e-mail n'est pas valide.";
    case 'auth/invalid-credential':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet e-mail.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'auth/network-request-failed':
      return 'Pas de connexion internet.';
    default:
      return 'Impossible de se connecter. Réessayez.';
  }
}
