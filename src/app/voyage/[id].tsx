import { Link, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran, BoutonPrincipal } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranDetailVoyage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage } = useVoyages();
  const voyage = obtenirVoyage(id);

  if (!voyage) {
    return (
      <Ecran>
        <EnteteEcran back="/voyages" />
        <TitreEcran title={Textes.voyage.introuvable} subtitle={Textes.voyage.retourListe} />
      </Ecran>
    );
  }

  return (
    <Ecran>
      <EnteteEcran back="/voyages" />
      <TitreEcran eyebrow={voyage.destination.toUpperCase()} title={voyage.title} subtitle={`${voyage.dateLabel}  ·  ${voyage.photoCount} ${Textes.voyage.motPhotos}`} />
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>{Textes.voyage.titreSectionPhotos}</Text>
          <Text style={styles.sectionTitle}>{Textes.voyage.libelleNombrePhotos}</Text>
        </View>
        <Link href={{ pathname: '/ajouter-photos/[id]', params: { id: voyage.id } }} asChild>
          <Pressable accessibilityRole="button" style={styles.addButton}><Text style={styles.addText}>＋</Text></Pressable>
        </Link>
      </View>
      <View style={styles.emptyPhotos}>
        <Text style={styles.emptyIcon}>▧</Text>
        <Text style={styles.emptyText}>{Textes.voyage.texteSansPhoto}</Text>
      </View>
      <Link href={{ pathname: '/carte-voyage/[id]', params: { id: voyage.id } }} asChild>
        <Pressable accessibilityRole="button" style={styles.mapCard}>
          <View style={styles.mapPin}><Text style={styles.pinGlyph}>⌖</Text></View>
          <View style={styles.mapCopy}>
            <Text style={styles.mapTitle}>{Textes.voyage.titreCarte}</Text>
            <Text style={styles.mapSubtitle}>{Textes.voyage.sousTitreCarte}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </Link>
      <BoutonPrincipal label={Textes.voyage.boutonAjouterPhotos} onPress={() => router.push({ pathname: '/ajouter-photos/[id]', params: { id: voyage.id } })} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionEyebrow: { color: C.ocean, fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '700', marginTop: 4 },
  addButton: { width: 37, height: 37, borderRadius: 13, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  addText: { color: C.paper, fontSize: 24, lineHeight: 26 },
  emptyPhotos: { minHeight: 150, borderRadius: 17, borderWidth: 1, borderStyle: 'dashed', borderColor: C.line, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyIcon: { color: C.coral, fontSize: 26, marginBottom: 8 },
  emptyText: { color: C.muted, textAlign: 'center', fontSize: 12, lineHeight: 18 },
  mapCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.paper, borderRadius: 17, borderWidth: 1, borderColor: C.line, padding: 14, marginTop: 18, marginBottom: 13 },
  mapPin: { width: 39, height: 39, borderRadius: 14, backgroundColor: C.mapTint, alignItems: 'center', justifyContent: 'center' },
  pinGlyph: { color: C.ocean, fontSize: 21 },
  mapCopy: { flex: 1, paddingHorizontal: 12 },
  mapTitle: { color: C.ink, fontSize: 13, fontWeight: '700' },
  mapSubtitle: { color: C.muted, fontSize: 11, marginTop: 4 },
  arrow: { color: C.coral, fontSize: 20 },
});
