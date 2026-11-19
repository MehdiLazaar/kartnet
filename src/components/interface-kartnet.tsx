import { CouleursMarque as C, PoliceTitre } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import type { Voyage } from '@/features/voyages/contexte-voyages';
import { getPhotoUri } from '@/repositories/photoStorage';
import { Image } from 'expo-image';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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

// `style` (facultatif) s'ajoute au bloc par défaut : un écran peut l'habiller sans toucher aux autres.
export function TitreEcran({ eyebrow, title, subtitle, style }: Readonly<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <View style={[styles.titleBlock, style]}>
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
    // Pas de <Link asChild> ici : Link fusionne son style avec celui de l'enfant dans un tableau,
    // et un style en fonction ({ pressed }) => … placé dans un tableau est ignoré par Pressable.
    // Résultat : la carte perdait fond, bordure, marges et espacements. router.push fait la même navigation.
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/voyage/[id]', params: { id: trip.id } })}
      style={({ pressed }) => [styles.tripCard, pressed && styles.pressed]}
    >
      {/* L'icône choisie dans l'écran de modification, sinon le ⌖ par défaut */}
      {trip.cheminCouverture ? (
        <Image
          source={{ uri: getPhotoUri(trip.cheminCouverture) }}
          contentFit="cover"
          style={styles.tripIcon}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.tripIcon}>
          <Text style={styles.tripIconText}>⌖</Text>
        </View>
      )}
      <View style={styles.tripInfo}>
        <Text style={styles.tripDestination}>{trip.destination}</Text>
        <Text style={styles.tripTitle}>{trip.title}</Text>
        <Text style={styles.tripMeta}>{trip.dateLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 34 },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  backText: { color: C.ink, fontSize: 30, lineHeight: 33, marginTop: -3 },
  brand: { color: C.ink, fontSize: 18, ...PoliceTitre },
  headerAction: { width: 38, alignItems: 'flex-end' },
  titleBlock: { paddingTop: 25, paddingBottom: 21 },
  eyebrow: { color: C.ocean, fontSize: 10, letterSpacing: 1.4, fontWeight: '800', marginBottom: 8 },
  title: { color: C.ink, fontSize: 30, lineHeight: 36, ...PoliceTitre },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  primaryButton: { minHeight: 54, paddingHorizontal: 17, borderRadius: 16, backgroundColor: C.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryText: { color: C.paper, fontSize: 15, fontWeight: '700' },
  arrow: { color: C.paper, fontSize: 21, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.paper, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.line },
  tripIcon: { width: 70, height: 70, borderRadius: 18, backgroundColor: C.mapTint, alignItems: 'center', justifyContent: 'center' },
  tripIconText: { color: C.ocean, fontSize: 26 },
  // Texte centré verticalement à côté de l'icône (alignItems: 'center' sur la carte), écart fixe de 14.
  tripInfo: { flex: 1, paddingLeft: 14 },
  tripDestination: { color: C.ocean, fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  tripTitle: { color: C.ink, fontSize: 16, fontWeight: '700', marginTop: 5 },
  tripMeta: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 6 }, // charte : caption
});
