import {
  Ecran,
  EnteteEcran,
  TitreEcran
} from "@/components/interface-kartnet";
import { CouleursMarque as C } from "@/constants/identite-visuelle";
import { Textes } from "@/constants/textes";
import { useVoyages } from "@/features/voyages/contexte-voyages";
import { getPhotoUri } from "@/repositories/photoStorage";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EcranDetailVoyage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage, supprimerVoyage, supprimerSouvenir } = useVoyages();
  const [photoApercue, setPhotoApercue] = useState<string | null>(null);
  const voyage = obtenirVoyage(id);

  if (!voyage) {
    return (
      <Ecran>
        <EnteteEcran back="/voyages" />
        <TitreEcran
          title={Textes.voyage.introuvable}
          subtitle={Textes.voyage.retourListe}
        />
      </Ecran>
    );
  }

  const voyageId = voyage.id;

  // Supprimer le voyage entier (bouton en bas de la page).
  const confirmerSuppressionVoyage = () => {
    Alert.alert(
      Textes.voyage.titreSuppression,
      Textes.voyage.messageSuppression,
      [
        { text: Textes.voyage.annuler, style: "cancel" },
        {
          text: Textes.voyage.confirmerSuppression,
          style: "destructive",
          onPress: () => {
            router.back(); // on quitte d'abord la page
            supprimerVoyage(voyageId); // puis on supprime le voyage dans Firestore
          },
        },
      ],
    );
  };

  // Supprimer une seule photo (la croix) : retire la fiche du carnet, le fichier reste sur l’appareil.
  const confirmerSuppressionPhoto = (idSouvenir: string) => {
    Alert.alert(
      Textes.photos.titreSuppression,
      Textes.photos.confirmationSuppression,
      [
        { text: Textes.photos.annulerSuppression, style: "cancel" },
        {
          text: Textes.photos.confirmerSuppression,
          style: "destructive",
          onPress: () => supprimerSouvenir(voyageId, idSouvenir),
        },
      ],
    );
  };

  return (
    <Ecran>
      <EnteteEcran
        back="/voyages"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Textes.voyage.libelleAccessibiliteModifier}
            onPress={() => router.push({ pathname: "/modifier-voyage/[id]", params: { id: voyageId } })}
            style={styles.boutonModifier}
          >
            <Text style={styles.texteModifier}>✎</Text>
          </Pressable>
        }
      />
      <TitreEcran
        eyebrow={voyage.destination.toUpperCase()}
        title={voyage.title}
        subtitle={`${voyage.dateLabel}  ·  ${voyage.photoCount} ${Textes.voyage.motPhotos}`}
      />
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>
            {Textes.voyage.titreSectionPhotos}
          </Text>
          <Text style={styles.sectionTitle}>
            {Textes.voyage.libelleNombrePhotos}
          </Text>
        </View>
        <Link
          href={{ pathname: "/ajouter-photos/[id]", params: { id: voyage.id } }}
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Textes.voyage.boutonAjouterPhotos}
            hitSlop={8}
            style={styles.addButton}
          >
            <Text style={styles.addText}>＋</Text>
          </Pressable>
        </Link>
      </View>
      {voyage.souvenirs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.souvenirs}
        >
          {voyage.souvenirs.map((souvenir) => (
            <View key={souvenir.id} style={styles.carteSouvenir}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={Textes.photos.libelleOuvrirPhoto}
                onPress={() =>
                  setPhotoApercue(getPhotoUri(souvenir.cheminPhoto))
                }
              >
                <Image
                  source={{ uri: getPhotoUri(souvenir.cheminPhoto) }}
                  contentFit="cover"
                  style={styles.photoSouvenir}
                  accessibilityLabel={Textes.photos.photosAssociees}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={Textes.photos.libelleSupprimerPhoto}
                onPress={() =>
                  confirmerSuppressionPhoto(souvenir.id)
                }
                hitSlop={8}
                style={styles.boutonSupprimer}
              >
                <Text style={styles.texteSupprimer}>×</Text>
              </Pressable>
              <Text style={styles.legendeSouvenir}>
                {souvenir.placeName ?? (souvenir.position
                  ? Textes.photos.lieuIndisponible
                  : Textes.photos.positionIndisponible)}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyPhotos}>
          <Text style={styles.emptyIcon}>▧</Text>
          <Text style={styles.emptyText}>{Textes.voyage.texteSansPhoto}</Text>
        </View>
      )}
      <Link
        href={{ pathname: "/carte-voyage/[id]", params: { id: voyage.id } }}
        asChild
      >
        <Pressable accessibilityRole="button" style={styles.mapCard}>
          <View style={styles.mapPin}>
            <Text style={styles.pinGlyph}>⌖</Text>
          </View>
          <View style={styles.mapCopy}>
            <Text style={styles.mapTitle}>{Textes.voyage.titreCarte}</Text>
            <Text style={styles.mapSubtitle}>
              {Textes.voyage.sousTitreCarte}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </Link>
      <Pressable
        accessibilityRole="button"
        onPress={confirmerSuppressionVoyage}
        style={styles.boutonSupprimerVoyage}
      >
        <Text style={styles.texteSupprimerVoyage}>{Textes.voyage.boutonSupprimer}</Text>
      </Pressable>
      <Modal
        visible={photoApercue !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoApercue(null)}
      >
        <View style={styles.vuePhotoPleinEcran}>
          {photoApercue ? (
            <Image
              source={{ uri: photoApercue }}
              contentFit="contain"
              style={StyleSheet.absoluteFill}
              accessibilityLabel={Textes.photos.photosAssociees}
            />
          ) : null}
          <SafeAreaView
            style={styles.enteteApercu}
            edges={["top", "right"]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={Textes.photos.libelleFermerPhoto}
              onPress={() => setPhotoApercue(null)}
              hitSlop={8}
              style={styles.boutonFermerApercu}
            >
              <Text style={styles.texteFermerApercu}>×</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionEyebrow: {
    color: C.ocean,
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: "800",
  },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: "700", marginTop: 4 },
  addButton: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: C.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: C.paper, fontSize: 24, lineHeight: 26 },
  emptyPhotos: {
    minHeight: 150,
    borderRadius: 17,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  souvenirs: { gap: 12, paddingBottom: 4 },
  carteSouvenir: {
    width: 170,
    padding: 7,
    borderRadius: 16,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
  },
  photoSouvenir: {
    width: "100%",
    height: 150,
    borderRadius: 11,
    backgroundColor: C.photoPlaceholder,
  },
  boutonSupprimer: {
    position: "absolute",
    top: 11,
    right: 11,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(16,20,20,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  texteSupprimer: { color: C.paper, fontSize: 22, lineHeight: 25 },
  vuePhotoPleinEcran: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  enteteApercu: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 12,
  },
  boutonFermerApercu: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(30,30,30,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  texteFermerApercu: { color: "#fff", fontSize: 30, lineHeight: 33 },
  legendeSouvenir: {
    color: C.muted,
    fontSize: 10,
    marginTop: 8,
    marginHorizontal: 3,
    marginBottom: 2,
  },
  emptyIcon: { color: C.coral, fontSize: 26, marginBottom: 8 },
  emptyText: {
    color: C.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.paper,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginTop: 18,
    marginBottom: 13,
  },
  mapPin: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: C.mapTint,
    alignItems: "center",
    justifyContent: "center",
  },
  pinGlyph: { color: C.ocean, fontSize: 21 },
  mapCopy: { flex: 1, paddingHorizontal: 12 },
  mapTitle: { color: C.ink, fontSize: 13, fontWeight: "700" },
  mapSubtitle: { color: C.muted, fontSize: 11, marginTop: 4 },
  arrow: { color: C.coral, fontSize: 20 },
  boutonSupprimerVoyage: { alignItems: "center", marginTop: 20, paddingVertical: 12 },
  texteSupprimerVoyage: { color: C.coralDeep, fontSize: 13, fontWeight: "700" },
  boutonModifier: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  texteModifier: { color: C.ink, fontSize: 18 },
});


