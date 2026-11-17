import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './firebase-config';

// Connexion au projet karnet-9f172
const app = initializeApp(firebaseConfig);
// La session s'enregistre sur le téléphone : l'utilisateur reste connecté quand il rouvre l'app
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
