import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage, signUp } from '@/repositories/authRepository';

// Écran d'inscription — version simple et fonctionnelle, le design viendra plus tard.
export default function SignupScreen() {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const name = displayName.trim();
    if (!name || !email.trim() || !password) {
      setError('Remplissez tous les champs.');
      return;
    }
    if (name.length > 50) {
      setError('Le nom doit faire 50 caractères maximum.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Crée le compte (Authentication) ET le profil users/{uid} (Firestore).
      await signUp(email, password, name);
      // Pas de navigation ici : le RootNavigator bascule tout seul vers l'app.
    } catch (e) {
      setError(authErrorMessage(e));
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="subtitle">Créer un compte</ThemedText>

          <TextInput
            style={inputStyle}
            placeholder="Votre prénom"
            placeholderTextColor={theme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            textContentType="name"
            maxLength={50}
          />
          <TextInput
            style={inputStyle}
            placeholder="E-mail"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={inputStyle}
            placeholder="Mot de passe (6 caractères minimum)"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={handleSubmit}
          />

          {error && (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [styles.button, (pressed || submitting) && styles.pressed]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>Créer mon compte</ThemedText>
            )}
          </Pressable>

          <Link href="/login" replace asChild>
            <Pressable>
              <ThemedText type="linkPrimary" style={styles.center}>
                Déjà un compte ? Se connecter
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
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  error: {
    color: '#E5484D',
  },
  button: {
    backgroundColor: '#1F5F8B',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 700,
  },
  center: {
    textAlign: 'center',
  },
});
