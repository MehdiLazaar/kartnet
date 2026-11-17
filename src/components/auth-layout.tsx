import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';

type AuthLayoutProps = {
  eyebrow: string;          // petit surtitre en capitales (ex. « BON RETOUR »)
  title: string;            // grand titre en serif
  subtitle: string;         // phrase d'accroche sous le titre
  children: ReactNode;      // les champs et le bouton du formulaire
  footerLink: { href: Href; question: string; action: string }; // lien vers l'autre écran
};

// Mise en page commune aux écrans de connexion et d'inscription, aux couleurs de la charte Kartnet.
export function AuthLayout({ eyebrow, title, subtitle, children, footerLink }: Readonly<AuthLayoutProps>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* La marque, comme sur l'accueil */}
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <View style={styles.brandLens} />
            </View>
            <Text style={styles.brandName}>{Textes.nomMarque}</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.card}>{children}</View>

          <Link href={footerLink.href} replace asChild>
            <Pressable accessibilityRole="link" style={styles.footer}>
              <Text style={styles.footerText}>
                {footerLink.question} <Text style={styles.footerAction}>{footerLink.action}</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  flex: { flex: 1 },
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 31, height: 31, borderRadius: 16, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  brandLens: { width: 12, height: 12, borderRadius: 7, borderWidth: 2, borderColor: C.paper },
  brandName: { color: C.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.8 },
  titleBlock: { paddingTop: 34, paddingBottom: 24 },
  eyebrow: { color: C.ocean, fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginBottom: 9 },
  title: { color: C.ink, fontSize: 33, lineHeight: 39, fontWeight: '700', letterSpacing: -1, fontFamily: 'Georgia' },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  card: {
    backgroundColor: C.paper,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    gap: 16,
  },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: C.muted, fontSize: 13 },
  footerAction: { color: C.coral, fontWeight: '700' },
});
