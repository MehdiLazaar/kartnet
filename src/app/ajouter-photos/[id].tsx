import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran, BoutonPrincipal } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranAjoutPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage } = useVoyages();
  const trip = obtenirVoyage(id);

  function afficherGalerieIndisponible() {
    Alert.alert(Textes.photos.titreGalerieIndisponible, Textes.photos.texteSelectionIndisponible);
  }

  function afficherCameraIndisponible() {
    Alert.alert(Textes.photos.titreCameraIndisponible, Textes.photos.texteCameraIndisponible);
  }

  return (
    <Ecran>
      <EnteteEcran back={trip ? `/voyage/${trip.id}` : '/voyages'} />
      <TitreEcran eyebrow={Textes.photos.surtitre} title={Textes.photos.titre} subtitle={trip ? `${Textes.photos.phraseAjoutVoyage} « ${trip.title} »` : Textes.photos.sousTitre} />
      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.photos.boutonChoisirGalerie}
          onPress={afficherGalerieIndisponible}
          style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
          <View style={styles.iconCircle}><Text style={styles.photoIcon}>＋</Text></View>
          <Text style={styles.pickerTitle}>{Textes.photos.boutonChoisirGalerie}</Text>
          <Text style={styles.pickerSubtitle}>{Textes.photos.texteSelectionIndisponible}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.photos.boutonCamera}
          onPress={afficherCameraIndisponible}
          style={({ pressed }) => [styles.actionCard, styles.cameraCard, pressed && styles.pressed]}>
          <View style={styles.iconCircle}><View style={styles.cameraIcon}><View style={styles.cameraTop} /><View style={styles.cameraLens} /></View></View>
          <Text style={styles.pickerTitle}>{Textes.photos.boutonCamera}</Text>
          <Text style={styles.pickerSubtitle}>{Textes.photos.texteCameraIndisponible}</Text>
        </Pressable>
      </View>
      <View style={styles.permissionCard}>
        <View style={styles.locationIcon}><Text style={styles.locationGlyph}>⌖</Text></View>
        <View style={styles.texteAutorisation}>
          <Text style={styles.permissionTitle}>{Textes.photos.titreLocalisation}</Text>
          <Text style={styles.permissionBody}>{Textes.photos.descriptionLocalisation}</Text>
        </View>
      </View>
      <View style={styles.privacyNote}><Text style={styles.privacyMark}>i</Text><Text style={styles.privacyText}>{Textes.photos.confidentialite}</Text></View>
      {trip ? <BoutonPrincipal label={Textes.photos.boutonRetourVoyage} onPress={() => router.replace({ pathname: '/voyage/[id]', params: { id: trip.id } })} /> : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, minHeight: 177, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: C.coral, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', padding: 13 },
  cameraCard: { borderStyle: 'solid', borderColor: C.line },
  iconCircle: { width: 58, height: 58, borderRadius: 20, backgroundColor: C.captionTint, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  photoIcon: { color: C.coral, fontSize: 32, lineHeight: 36 },
  cameraIcon: { width: 34, height: 25, borderRadius: 7, backgroundColor: C.ocean, alignItems: 'center', justifyContent: 'center' },
  cameraTop: { position: 'absolute', width: 13, height: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: C.ocean, top: -4, left: 6 },
  cameraLens: { width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: C.paper },
  pickerTitle: { color: C.ink, fontSize: 15, fontWeight: '700' },
  pickerSubtitle: { color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 7 },
  permissionCard: { flexDirection: 'row', backgroundColor: C.mapTint, borderRadius: 17, padding: 15, marginTop: 17, alignItems: 'flex-start' },
  locationIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  locationGlyph: { color: C.ocean, fontSize: 21 },
  texteAutorisation: { flex: 1, paddingLeft: 11 },
  permissionTitle: { color: C.ink, fontSize: 13, fontWeight: '700' },
  permissionBody: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  privacyNote: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 21 },
  privacyMark: { color: C.ocean, fontWeight: '800', fontSize: 13 },
  privacyText: { color: C.muted, fontSize: 10, lineHeight: 15, flex: 1 },
  pressed: { opacity: 0.75 },
});
