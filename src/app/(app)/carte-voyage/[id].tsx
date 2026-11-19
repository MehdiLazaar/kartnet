import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranCarteVoyage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenirVoyage } = useVoyages();
  const voyage = obtenirVoyage(id);

  return (
    <Ecran>
      <EnteteEcran back={voyage ? `/voyage/${voyage.id}` : '/voyages'} />
      <TitreEcran eyebrow={Textes.carte.surtitre} title={Textes.carte.titre} subtitle={voyage?.destination ?? Textes.carte.sousTitre} />
      <View style={styles.emptyMap}>
        <View style={styles.pinCircle}><Text style={styles.pinGlyph}>⌖</Text></View>
        <Text style={styles.emptyTitle}>{Textes.carte.titreCarteVide}</Text>
        <Text style={styles.emptyText}>{Textes.carte.noteCarteVide}</Text>
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
  emptyMap: { minHeight: 280, backgroundColor: C.mapLand, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 25 },
  pinCircle: { width: 54, height: 54, borderRadius: 20, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  pinGlyph: { color: C.ocean, fontSize: 27 },
  emptyTitle: { color: C.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7, maxWidth: 260 },
  backLink: { padding: 16, alignItems: 'center' },
  backLinkText: { color: C.ocean, fontWeight: '700', fontSize: 13 },
});
