import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran, CarteVoyage } from '@/components/interface-kartnet';
import { MotifParcours } from '@/components/marque-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranVoyages() {
  const { trips } = useVoyages();

  return (
    <Ecran>
      <EnteteEcran action={
        <Link href="/creer-voyage" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel={Textes.voyages.libelleAccessibiliteCreer} style={styles.addButton}>
            <Text style={styles.addText}>＋</Text>
          </Pressable>
        </Link>
      } />
      <View style={styles.motif}><MotifParcours /></View>
      <TitreEcran style={styles.titre} title={Textes.voyages.titre} subtitle={Textes.voyages.sousTitre} />
      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{trips.length}</Text>
        <Text style={styles.summaryLabel}>{trips.length > 1 ? Textes.voyages.voyagesPluriel : Textes.voyages.voyageSingulier}</Text>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryLabel}>{trips.reduce((sum, trip) => sum + trip.photoCount, 0)} {Textes.voyages.nombrePhotos}</Text>
      </View>
      {trips.map((trip) => <CarteVoyage key={trip.id} trip={trip} />)}
      {trips.length === 0 ? <Text style={styles.empty}>{Textes.voyages.texteListeVide}</Text> : null}
      <Link href="/creer-voyage" asChild>
        <Pressable accessibilityRole="button" style={styles.createLink}>
          <Text style={styles.createLinkText}>＋  {Textes.voyages.boutonCreer}</Text>
        </Pressable>
      </Link>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  // Bannière de la charte : le trajet en pointillés au-dessus du titre (jamais derrière le texte).
  motif: { marginTop: 8 },
  // Le motif occupe déjà l'espace du haut : on resserre le bloc titre.
  titre: { paddingTop: 12 },
  addButton: { width: 36, height: 36, borderRadius: 6, borderWidth: 2, borderColor: C.cadre, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  addText: { color: C.paper, fontSize: 23, lineHeight: 25 },
  summary: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  summaryNumber: { color: C.ink, fontSize: 14, fontWeight: '800' },
  summaryLabel: { color: C.muted, fontSize: 12 },
  // Petit carré doré (un « pixel de trésor ») entre les deux compteurs.
  summaryDot: { width: 5, height: 5, backgroundColor: C.sand, marginHorizontal: 2 },
  empty: { color: C.muted, textAlign: 'center', paddingVertical: 30 },
  createLink: { minHeight: 50, borderRadius: 6, borderWidth: 2, borderStyle: 'dashed', borderColor: C.coral, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  createLinkText: { color: C.coral, fontSize: 14, fontWeight: '700' },
});
