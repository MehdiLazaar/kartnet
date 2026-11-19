import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { CouleursMarque as C, PoliceEtiquette } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranProfil() {
  const { trips } = useVoyages();
  return (
    <Ecran>
      <EnteteEcran />
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{Textes.accueil.initialeProfil}</Text></View>
        <View><Text style={styles.name}>{Textes.profil.nomVisiteur}</Text><Text style={styles.member}>{Textes.profil.messageAccueil}</Text></View>
      </View>
      <TitreEcran eyebrow={Textes.profil.surtitre} title={Textes.profil.titre} subtitle={Textes.profil.sousTitre} />
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statValue}>{trips.length}</Text><Text style={styles.statLabel}>{Textes.profil.libelleVoyages}</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>{trips.reduce((sum, trip) => sum + trip.photoCount, 0)}</Text><Text style={styles.statLabel}>{Textes.profil.libellePhotos}</Text></View>
      </View>
      <Text style={styles.section}>{Textes.profil.preferences}</Text>
      <View style={styles.menu}>
        <Link href="/parametres" asChild>
          <Pressable accessibilityRole="button" style={styles.menuRow}><Text style={styles.menuIcon}>⚙</Text><Text style={styles.menuText}>{Textes.profil.lienParametres}</Text><Text style={styles.menuArrow}>›</Text></Pressable>
        </Link>
      </View>
      <Text style={styles.version}>{Textes.profil.version}</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  // Charte « Carte au trésor » : boîtes de dialogue à coins presque droits et cadre d'encre de 2 px.
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.paper, padding: 15, borderRadius: 6, borderWidth: 2, borderColor: C.cadre, marginTop: 16 },
  avatar: { width: 48, height: 48, borderRadius: 4, backgroundColor: C.captionTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.coral, fontSize: 18, fontWeight: '800' },
  name: { color: C.ink, fontSize: 15, fontWeight: '700' },
  member: { color: C.muted, fontSize: 11, marginTop: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: C.paper, paddingVertical: 17, borderRadius: 6, borderWidth: 2, borderColor: C.cadre, marginBottom: 24 },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { color: C.ink, fontSize: 20, fontWeight: '800' },
  statLabel: { color: C.muted, fontSize: 11 },
  statDivider: { height: 31, width: StyleSheet.hairlineWidth, backgroundColor: C.line },
  section: { color: C.ocean, fontSize: 10, marginBottom: 10, textTransform: 'uppercase', ...PoliceEtiquette },
  menu: { backgroundColor: C.paper, borderRadius: 6, borderWidth: 2, borderColor: C.cadre, paddingHorizontal: 14 },
  // Une seule ligne dans le menu : pas de trait de séparation en dessous.
  menuRow: { height: 56, flexDirection: 'row', alignItems: 'center' },
  menuIcon: { color: C.ocean, width: 31, fontSize: 17 },
  menuText: { color: C.ink, flex: 1, fontSize: 13, fontWeight: '600' },
  menuArrow: { color: C.muted, fontSize: 21 },
  version: { color: C.muted, fontSize: 10, textAlign: 'center', marginTop: 22 },
});
