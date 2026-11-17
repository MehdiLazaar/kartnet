import { Stack } from 'expo-router';

// Partie connectée de l'app (protégée par le RootNavigator).
// Une pile d'écrans : les onglets (tabs) en dessous, et les autres écrans
// (création, détail d'un voyage, photos, carte, profil, paramètres) qui s'ouvrent par-dessus.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
