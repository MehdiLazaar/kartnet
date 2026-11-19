import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranCarteVoyage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage } = useVoyages();
  const voyage = obtenirVoyage(id);
  const souvenirsLocalises = voyage?.souvenirs.filter((souvenir) => souvenir.position) ?? [];
  const points = souvenirsLocalises.map((souvenir) => souvenir.position!);
  const region = points.length > 0
    ? {
        latitude: points.reduce((total, point) => total + point.latitude, 0) / points.length,
        longitude: points.reduce((total, point) => total + point.longitude, 0) / points.length,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }
    : { latitude: 46.603354, longitude: 1.888334, latitudeDelta: 8, longitudeDelta: 8 };

  return (
    <Ecran>
      <EnteteEcran back={voyage ? `/voyage/${voyage.id}` : '/voyages'} />
      <TitreEcran eyebrow={Textes.carte.surtitre} title={Textes.carte.titre} subtitle={voyage?.destination ?? Textes.carte.sousTitre} />
      <View style={styles.mapFrame}>
        <MapView
          style={styles.map}
          initialRegion={region}
          accessibilityLabel={`Carte du voyage ${voyage?.destination ?? ''}`}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {souvenirsLocalises.map((souvenir) => (
            <Marker
              key={souvenir.id}
              coordinate={souvenir.position!}
              title={voyage?.destination ?? Textes.carte.titre}
              description={new Date(souvenir.datePrise).toLocaleDateString('fr-FR')}
              pinColor={C.coral}
            />
          ))}
        </MapView>
        {souvenirsLocalises.length === 0 ? (
          <View pointerEvents="none" style={styles.mapNotice}>
            <View style={styles.pinCircle}><Text style={styles.pinGlyph}>⌖</Text></View>
            <Text style={styles.emptyTitle}>{Textes.carte.titreCarteVide}</Text>
            <Text style={styles.emptyText}>{Textes.carte.noteCarteVide}</Text>
          </View>
        ) : null}
      </View>
      {voyage ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.dismissTo({ pathname: '/voyage/[id]', params: { id: voyage.id } })}
          style={styles.backLink}
        >
          <Text style={styles.backLinkText}>{Textes.carte.retourAuCarnet}</Text>
        </Pressable>
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  mapFrame: { height: 420, overflow: 'hidden', borderRadius: 20, backgroundColor: C.mapLand },
  map: { flex: 1 },
  mapNotice: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255, 253, 248, 0.78)', alignItems: 'center', justifyContent: 'center', padding: 25 },
  pinCircle: { width: 54, height: 54, borderRadius: 20, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  pinGlyph: { color: C.ocean, fontSize: 27 },
  emptyTitle: { color: C.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7, maxWidth: 260 },
  backLink: { padding: 16, alignItems: 'center' },
  backLinkText: { color: C.ocean, fontWeight: '700', fontSize: 13 },
});
