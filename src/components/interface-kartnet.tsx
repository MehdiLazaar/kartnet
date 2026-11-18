import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import type { Voyage } from '@/features/voyages/contexte-voyages';
import type { Href } from 'expo-router';
import { Link, router } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Ecran({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
//Si on peut revenir en arriere (router.canGoBack()) donc si il y à un écran sous la pile, on le fait (router.back()) : sinon (si il y a rien dessous) on remplace l'écran par back
export function EnteteEcran({ back = '/', action }: { back?: Href; action?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(back))} accessibilityRole="button" accessibilityLabel="Retour" style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.brand}>{Textes.nomMarque}</Text>
      <View style={styles.headerAction}>{action}</View>
    </View>
  );
}

export function TitreEcran({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.titleBlock}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function BoutonPrincipal({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <Text style={styles.primaryText}>{label}</Text>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

export function CarteVoyage({ trip }: { trip: Voyage }) {
  return (
    <Link href={{ pathname: '/voyage/[id]', params: { id: trip.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.tripCard, pressed && styles.pressed]}>
        <View style={styles.tripIcon}><Text style={styles.tripIconText}>⌖</Text></View>
        <View style={styles.tripInfo}>
          <Text style={styles.tripDestination}>{trip.destination}</Text>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripMeta}>{trip.dateLabel}  ·  {trip.photoCount} photos</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 34 },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  backText: { color: C.ink, fontSize: 30, lineHeight: 33, marginTop: -3 },
  brand: { color: C.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.6 },
  headerAction: { width: 38, alignItems: 'flex-end' },
  titleBlock: { paddingTop: 25, paddingBottom: 21 },
  eyebrow: { color: C.ocean, fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginBottom: 8 },
  title: { color: C.ink, fontSize: 30, lineHeight: 36, fontFamily: 'Georgia', fontWeight: '700' },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  primaryButton: { minHeight: 54, paddingHorizontal: 17, borderRadius: 16, backgroundColor: C.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryText: { color: C.paper, fontSize: 15, fontWeight: '700' },
  arrow: { color: C.paper, fontSize: 21, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.paper, borderRadius: 19, padding: 10, marginBottom: 13, borderWidth: 1, borderColor: C.line },
  tripIcon: { width: 70, height: 70, borderRadius: 18, backgroundColor: C.mapTint, alignItems: 'center', justifyContent: 'center' },
  tripIconText: { color: C.ocean, fontSize: 26 },
  tripInfo: { flex: 1, paddingHorizontal: 13 },
  tripDestination: { color: C.ocean, fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  tripTitle: { color: C.ink, fontSize: 16, fontWeight: '700', marginTop: 5 },
  tripMeta: { color: C.muted, fontSize: 11, marginTop: 7 },
  cardArrow: { color: C.coral, fontSize: 25, paddingRight: 5 },
});
