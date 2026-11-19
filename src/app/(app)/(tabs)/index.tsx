import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarteVoyage } from '@/components/interface-kartnet';
import { SymboleKartnet } from '@/components/marque-kartnet';
import { CouleursMarque as C, PoliceTitre } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranAccueil() {
  const { trips } = useVoyages();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <SymboleKartnet taille={42} />
            <Text style={styles.brandName}>{Textes.nomMarque}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Textes.accueil.libelleAccessibiliteProfil}
            onPress={() => router.push('/profil')}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
            <Text style={styles.avatarText}>{Textes.accueil.initialeProfil}</Text>
          </Pressable>
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>{Textes.accueil.accroche[0]}{'\n'}{Textes.accueil.accroche[1]}</Text>
          <Text style={styles.subtitle}>{Textes.accueil.slogan}</Text>
        </View>

        {trips.length > 0 ? (
          <View style={styles.tripSection}>
            <Text style={styles.sectionTitle}>{Textes.accueil.titreDernierVoyage}</Text>
            <CarteVoyage trip={trips[0]} />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIllustration}>
              <View style={styles.emptyPhoto}><View style={styles.emptyPhotoLine} /></View>
              <View style={styles.emptyPin}><Text style={styles.emptyPinText}>⌖</Text></View>
            </View>
            <Text style={styles.emptyTitle}>{Textes.accueil.titreCarnetVide}</Text>
            <Text style={styles.emptyText}>{Textes.accueil.texteCarnetVide}</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.accueil.libelleAccessibiliteCreerVoyage}
          onPress={() => router.push('/creer-voyage')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonIcon}>＋</Text>
          <Text style={styles.buttonText}>{Textes.accueil.boutonCreerVoyage}</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
        <Text style={styles.footerNote}>{Textes.accueil.piedDePage}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 30 },
  topBar: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { color: C.ink, fontSize: 28, ...PoliceTitre },
  avatar: { width: 34, height: 34, borderRadius: 18, backgroundColor: C.avatar, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.ink, fontSize: 13, fontWeight: '700' },
  intro: { paddingTop: 12, paddingBottom: 24 },
  title: { color: C.ink, fontSize: 35, lineHeight: 40, ...PoliceTitre },
  subtitle: { color: C.muted, fontSize: 14, marginTop: 9 },
  tripSection: { marginBottom: 7 },
  sectionTitle: { color: C.ink, fontSize: 16, fontWeight: '700', marginBottom: 11 },
  emptyCard: { minHeight: 260, backgroundColor: C.paper, borderRadius: 6, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.cadre },
  emptyIllustration: { width: 94, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyPhoto: { width: 66, height: 78, borderRadius: 8, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] },
  emptyPhotoLine: { position: 'absolute', bottom: 12, width: 35, height: 3, borderRadius: 2, backgroundColor: C.sand },
  emptyPin: { position: 'absolute', right: 0, top: 5, width: 36, height: 36, borderRadius: 18, backgroundColor: C.coral, borderWidth: 3, borderColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  emptyPinText: { color: C.paper, fontSize: 19 },
  emptyTitle: { color: C.ink, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7, maxWidth: 260 },
  // Bouton de menu de RPG : cadre de 2 px et bord inférieur plus épais en guise d'ombre dure.
  primaryButton: { height: 55, borderRadius: 6, borderWidth: 2, borderBottomWidth: 4, borderColor: C.cadre, marginTop: 18, paddingHorizontal: 16, backgroundColor: C.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonIcon: { color: C.paper, fontSize: 24, lineHeight: 27, marginRight: 9 },
  buttonText: { color: C.paper, fontSize: 15, fontWeight: '700', flex: 1 },
  buttonArrow: { color: C.paper, fontSize: 20, fontWeight: '600' },
  footerNote: { color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 13 },
  pressed: { opacity: 0.75 },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
