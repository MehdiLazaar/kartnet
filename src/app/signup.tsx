import { useState } from 'react';

import { AuthLayout } from '@/components/auth-layout';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { authErrorMessage, signUp } from '@/repositories/authRepository';

// Écran d'inscription — version simple et fonctionnelle, le design viendra plus tard.
export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Crée le compte (Authentication) ET le profil users/{uid} (Firestore).
  // Le RootNavigator bascule ensuite tout seul vers l'app.
  const { submit, submitting, error, setError } = useFormSubmit(
    () => signUp(email, password, displayName),
    authErrorMessage,
  );

  function handleSubmit() {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Remplissez tous les champs.');
      return;
    }
    submit();
  }

  return (
    <AuthLayout
      title="Créer un compte"
      footerLink={{ href: '/login', label: 'Déjà un compte ? Se connecter' }}>
      <TextField
        placeholder="Votre prénom"
        value={displayName}
        onChangeText={setDisplayName}
        autoComplete="name"
        textContentType="name"
        maxLength={50}
      />
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
        placeholder="Mot de passe (6 caractères minimum)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton label="Créer mon compte" onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
}
