import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type AuthLayoutProps = {
  title: string;
  children: ReactNode;                       // les champs et le bouton du formulaire
  footerLink: { href: Href; label: string }; // lien vers l'autre écran (connexion ↔ inscription)
};

// Mise en page commune aux écrans de connexion et d'inscription.
export function AuthLayout({ title, children, footerLink }: Readonly<AuthLayoutProps>) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="subtitle">{title}</ThemedText>

          {children}

          <Link href={footerLink.href} replace asChild>
            <Pressable>
              <ThemedText type="linkPrimary" style={styles.center}>
                {footerLink.label}
              </ThemedText>
            </Pressable>
          </Link>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth / 2,
    gap: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
});
