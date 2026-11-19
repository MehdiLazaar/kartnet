import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { FournisseurVoyages } from "@/features/voyages/contexte-voyages";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Polices de la charte « Carte au trésor ». Les clés sont les noms utilisés dans fontFamily.
  const [policesChargees, erreurPolices] = useFonts({
    Jersey10: require("../../assets/fonts/Jersey10-Regular.ttf"),
    Silkscreen: require("../../assets/fonts/Silkscreen-Regular.ttf"),
  });

  // Tant que les polices chargent, l'écran de démarrage reste affiché (preventAutoHideAsync).
  // En cas d'erreur, on affiche quand même l'app avec la police système.
  if (!policesChargees && !erreurPolices) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <FournisseurVoyages>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </FournisseurVoyages>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Composant séparé : il doit être À L'INTÉRIEUR de <AuthProvider> pour pouvoir appeler useAuth().
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // Firebase n'a pas encore répondu : on n'affiche rien

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>

      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
