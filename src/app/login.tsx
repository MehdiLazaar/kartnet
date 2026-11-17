import { useState } from 'react';
import { router } from 'expo-router';

import { AuthLayout } from '@/components/auth-layout';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { authErrorMessage, signIn } from '@/repositories/authRepository';

// Écran de connexion — version simple et fonctionnelle, le design viendra plus tard.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { submit, submitting, error, setError } = useFormSubmit(
    async () => {
      await signIn(email, password);
      router.replace('/(app)');
    },
    authErrorMessage,
  );

  function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Remplissez tous les champs.');
      return;
    }
    // `void` : on lance la promesse sans l'attendre, volontairement.
    // Les erreurs sont déjà gérées dans useFormSubmit (try / catch).
    void submit();
  }

  return (
    <AuthLayout
      title="Connexion"
      footerLink={{ href: '/signup', label: 'Pas encore de compte ? Créer un compte' }}>
      <TextField
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton label="Se connecter" onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
}
