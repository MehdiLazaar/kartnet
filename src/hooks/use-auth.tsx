import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { watchAuth } from '@/repositories/authRepository';

type AuthState = {
  user: User | null;  // null = personne n'est connecté
  loading: boolean;   // true tant que Firebase n'a pas encore répondu
};

// 1. Le Context : une « boîte » partagée par tous les composants en dessous du Provider.
const AuthContext = createContext<AuthState | null>(null);

// 2. Le Provider : à placer UNE fois, tout en haut de l'app (dans src/app/_layout.tsx).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase appelle ce callback au démarrage, puis à chaque connexion ou déconnexion.
    const unsubscribe = watchAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // React appellera unsubscribe() si le Provider disparaît : on arrête d'écouter.
    return unsubscribe;
  }, []); // [] = on ne s'abonne qu'une seule fois

  return <AuthContext value={{ user, loading }}>{children}</AuthContext>;
}

// 3. Le hook : n'importe quel écran peut faire `const { user, loading } = useAuth();`
export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth() doit être utilisé à l\'intérieur de <AuthProvider>.');
  }
  return value;
}

// 4. Raccourci pour les écrans de la partie connectée de l'app,
//    où l'on sait qu'un utilisateur existe (les routes sont protégées).
export function useUser(): User {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useUser() a été appelé alors que personne n\'est connecté.');
  }
  return user;
}
