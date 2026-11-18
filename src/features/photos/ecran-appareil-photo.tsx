import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CouleursMarque as C } from "@/constants/identite-visuelle";
import { Textes } from "@/constants/textes";
import { useVoyages } from "@/features/voyages/contexte-voyages";
import { savePhoto } from "@/repositories/photoStorage";

export default function EcranAppareilPhoto() {
  // L'identifiant transmis dans l'URL permet de rattacher le souvenir au bon voyage.
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ajouterSouvenir, obtenirVoyage } = useVoyages();
  const voyage = obtenirVoyage(id);

  // La référence donne accès à la caméra native pour déclencher la prise de vue.
  const cameraRef = useRef<CameraView>(null);
  const [autorisation, demanderAutorisation] = useCameraPermissions();
  const [cameraPrete, definirCameraPrete] = useState(false);
  const [priseEnCours, definirPriseEnCours] = useState(false);

  async function prendrePhoto() {
    // On attend la fin du chargement de l'aperçu et on bloque les doubles pressions.
    if (!cameraPrete || !cameraRef.current || !voyage || priseEnCours) return;

    definirPriseEnCours(true);
    try {
      // La caméra renvoie d'abord un fichier temporaire dans le cache de l'application.
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      const datePrise = new Date().toISOString();
      const position = await obtenirPositionActuelle();
      const idSouvenir = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      // On copie le fichier temporaire dans Documents avant de conserver son chemin.
      const cheminPhoto = await savePhoto(photo.uri, idSouvenir);

      // Le contexte met à jour le carnet et son compteur de photos.
      ajouterSouvenir(voyage.id, {
        id: idSouvenir,
        cheminPhoto,
        datePrise,
        position,
      });

      router.replace({ pathname: "/voyage/[id]", params: { id: voyage.id } });
    } catch {
      // La capture, la copie ou l'accès à la caméra peut échouer sur l'appareil.
      Alert.alert(Textes.camera.titre, Textes.camera.erreurCapture);
    } finally {
      definirPriseEnCours(false);
    }
  }

  if (!voyage) {
    return (
      <SafeAreaView style={styles.ecranAutorisation} edges={["top", "bottom"]}>
        <Text style={styles.titreAutorisation}>
          {Textes.voyage.introuvable}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.boutonSecondaire}
        >
          <Text style={styles.texteBoutonSecondaire}>
            {Textes.photos.boutonRetourVoyage}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Le hook charge d'abord l'état de permission avant qu'on puisse l'afficher.
  if (!autorisation) {
    return (
      <View style={styles.ecranChargement}>
        <ActivityIndicator color={C.coral} />
      </View>
    );
  }

  // L'aperçu reste masqué tant que l'utilisateur n'a pas autorisé la caméra.
  if (!autorisation.granted) {
    return (
      <SafeAreaView style={styles.ecranAutorisation} edges={["top", "bottom"]}>
        <Text style={styles.iconeAutorisation}>◎</Text>
        <Text style={styles.titreAutorisation}>{Textes.camera.titre}</Text>
        <Text style={styles.descriptionAutorisation}>
          {Textes.camera.descriptionAutorisation}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void demanderAutorisation()}
          style={styles.boutonPrincipal}
        >
          <Text style={styles.texteBoutonPrincipal}>
            {Textes.camera.boutonAutoriser}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.boutonSecondaire}
        >
          <Text style={styles.texteBoutonSecondaire}>
            {Textes.photos.boutonRetourVoyage}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.ecranCamera}>
      {/* Le déclencheur reste désactivé jusqu'à ce que l'aperçu soit prêt. */}
      <CameraView
        ref={cameraRef}
        facing="back"
        style={StyleSheet.absoluteFill}
        onCameraReady={() => definirCameraPrete(true)}
        onMountError={() =>
          Alert.alert(Textes.camera.titre, Textes.camera.erreurOuverture)
        }
      />
      <SafeAreaView
        pointerEvents="box-none"
        style={styles.superposition}
        edges={["top", "bottom"]}
      >
        <View style={styles.entete}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Textes.photos.boutonRetourVoyage}
            onPress={() => router.back()}
            style={styles.boutonFermer}
          >
            <Text style={styles.texteFermer}>×</Text>
          </Pressable>
          <Text style={styles.titreCamera}>{Textes.camera.titre}</Text>
          <View style={styles.espaceEntete} />
        </View>

        <View style={styles.commandes}>
          <Text style={styles.indicationPosition}>
            {Textes.photos.descriptionLocalisation}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Textes.camera.libelleAccessibilitePrendrePhoto}
            disabled={!cameraPrete || priseEnCours}
            onPress={() => void prendrePhoto()}
            style={({ pressed }) => [
              styles.declencheur,
              pressed && styles.declencheurPresse,
              (!cameraPrete || priseEnCours) && styles.declencheurDesactive,
            ]}
          >
            {priseEnCours ? (
              <ActivityIndicator color={C.paper} />
            ) : (
              <View style={styles.centreDeclencheur} />
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

async function obtenirPositionActuelle(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    // La localisation est facultative : la photo est conservée même sans autorisation GPS.
    const autorisation = await Location.requestForegroundPermissionsAsync();
    if (!autorisation.granted) return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    // La photo reste utilisable même si le GPS est indisponible.
    return null;
  }
}

const styles = StyleSheet.create({
  ecranCamera: { flex: 1, backgroundColor: "#101414" },
  superposition: { flex: 1, justifyContent: "space-between" },
  entete: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  boutonFermer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  texteFermer: { color: C.paper, fontSize: 29, lineHeight: 32 },
  titreCamera: { color: C.paper, fontSize: 16, fontWeight: "700" },
  espaceEntete: { width: 42 },
  commandes: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 20,
    gap: 20,
  },
  indicationPosition: {
    maxWidth: 310,
    color: C.paper,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowRadius: 5,
  },
  declencheur: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: C.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  declencheurPresse: { transform: [{ scale: 0.94 }] },
  declencheurDesactive: { opacity: 0.55 },
  centreDeclencheur: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.paper,
  },
  ecranChargement: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.cream,
  },
  ecranAutorisation: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: C.cream,
  },
  iconeAutorisation: { color: C.coral, fontSize: 54, marginBottom: 12 },
  titreAutorisation: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  descriptionAutorisation: {
    maxWidth: 330,
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  boutonPrincipal: {
    minHeight: 50,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: C.coral,
    paddingHorizontal: 18,
  },
  texteBoutonPrincipal: { color: C.paper, fontWeight: "800", fontSize: 14 },
  boutonSecondaire: { padding: 15, marginTop: 5 },
  texteBoutonSecondaire: { color: C.ocean, fontWeight: "700", fontSize: 13 },
});
