import { BoutonPrincipal, Ecran, EnteteEcran, TitreEcran } from "@/components/interface-kartnet";
import { CouleursMarque as C } from "@/constants/identite-visuelle";
import { Textes } from "@/constants/textes";
import { choisirPhotosGalerie } from '@/features/photos/choisir-photos-galerie';
import { creerSouvenirDepuisGalerie } from '@/features/photos/creer-souvenir-photo';
import { useVoyages } from "@/features/voyages/contexte-voyages";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";


export default function EcranAjoutPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage, ajouterSouvenir } = useVoyages();
  const trip = obtenirVoyage(id);

  //async et try catch car des erreurs liés à la galerie, l'espace de stockage ou autre 
  //ne serait pas visualisables par le user si elles arrivaient. La il vois un message
  //on fais const ... = async () => au lieu de async fonction pour conserver 
  //le narrowing de trip. 
  const importerDepuisGalerie = async () => {
    //le voyage peut etre undefined si l'id est faux
    //permet a Typescript de savoir que le voyage existe dans la fonction
    if (!trip) return;
    try {
      const assets = await choisirPhotosGalerie();
      if (assets.length === 0) return; // l'utilisateur a annulé la galerie
      // On prépare toutes les photos en meme temps (copies indépendantes),
      // puis on attend qu'elles soient toutes prêtes avant de les enregistrer.
      const souvenirs = await Promise.all(assets.map(creerSouvenirDepuisGalerie));
      souvenirs.forEach((souvenir) => ajouterSouvenir(trip.id, souvenir));

      //revenir au voyage sans créer de copie dans la pile
      router.dismissTo({ pathname: "/voyage/[id]", params: { id: trip.id } })

    } catch {
      Alert.alert(Textes.photos.titreErreurImport, Textes.photos.erreurImport);
    }
  };

  function ouvrirAppareilPhoto() {
    if (!trip) {
      Alert.alert(Textes.voyage.introuvable, Textes.voyage.retourListe);
      return;
    }

    // L'identifiant transmis permet à l'écran caméra de classer la photo dans ce voyage.
    router.push({ pathname: "/appareil-photo/[id]", params: { id: trip.id } });
  }

  return (
    <Ecran>
      <EnteteEcran back={trip ? `/voyage/${trip.id}` : "/voyages"} />
      <TitreEcran
        eyebrow={Textes.photos.surtitre}
        title={Textes.photos.titre}
        subtitle={
          trip
            ? `${Textes.photos.phraseAjoutVoyage} « ${trip.title} »`
            : Textes.photos.sousTitre
        }
      />
      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.photos.boutonChoisirGalerie}
          onPress={importerDepuisGalerie}
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.photoIcon}>＋</Text>
          </View>
          <Text style={styles.pickerTitle}>
            {Textes.photos.boutonChoisirGalerie}
          </Text>
          <Text style={styles.pickerSubtitle}>
            {Textes.photos.texteGalerie}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.photos.boutonCamera}
          onPress={ouvrirAppareilPhoto}
          style={({ pressed }) => [
            styles.actionCard,
            styles.cameraCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <View style={styles.cameraIcon}>
              <View style={styles.cameraTop} />
              <View style={styles.cameraLens} />
            </View>
          </View>
          <Text style={styles.pickerTitle}>{Textes.photos.boutonCamera}</Text>
          <Text style={styles.pickerSubtitle}>
            {Textes.photos.texteCamera}
          </Text>
        </Pressable>
      </View>
      <View style={styles.permissionCard}>
        <View style={styles.locationIcon}>
          <Text style={styles.locationGlyph}>⌖</Text>
        </View>
        <View style={styles.texteAutorisation}>
          <Text style={styles.permissionTitle}>
            {Textes.photos.titreLocalisation}
          </Text>
          <Text style={styles.permissionBody}>
            {Textes.photos.descriptionLocalisation}
          </Text>
        </View>
      </View>
      <View style={styles.privacyNote}>
        <Text style={styles.privacyMark}>i</Text>
        <Text style={styles.privacyText}>{Textes.photos.confidentialite}</Text>
      </View>
      {trip ? (
        <BoutonPrincipal
          label={Textes.photos.boutonRetourVoyage}
          onPress={() =>
            router.dismissTo({
              pathname: "/voyage/[id]",
              params: { id: trip.id },
            })
          }
        />
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    minHeight: 177,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.coral,
    backgroundColor: C.paper,
    alignItems: "center",
    justifyContent: "center",
    padding: 13,
  },
  cameraCard: { borderStyle: "solid", borderColor: C.line },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: C.captionTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  photoIcon: { color: C.coral, fontSize: 32, lineHeight: 36 },
  cameraIcon: {
    width: 34,
    height: 25,
    borderRadius: 7,
    backgroundColor: C.ocean,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTop: {
    position: "absolute",
    width: 13,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: C.ocean,
    top: -4,
    left: 6,
  },
  cameraLens: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: C.paper,
  },
  pickerTitle: { color: C.ink, fontSize: 15, fontWeight: "700" },
  pickerSubtitle: {
    color: C.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 7,
  },
  permissionCard: {
    flexDirection: "row",
    backgroundColor: C.mapTint,
    borderRadius: 17,
    padding: 15,
    marginTop: 17,
    alignItems: "flex-start",
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: C.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  locationGlyph: { color: C.ocean, fontSize: 21 },
  texteAutorisation: { flex: 1, paddingLeft: 11 },
  permissionTitle: { color: C.ink, fontSize: 13, fontWeight: "700" },
  permissionBody: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  privacyNote: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 21,
  },
  privacyMark: { color: C.ocean, fontWeight: "800", fontSize: 13 },
  privacyText: { color: C.muted, fontSize: 10, lineHeight: 15, flex: 1 },
  pressed: { opacity: 0.75 },
});
