import { useState } from 'react';
import { router } from 'expo-router';

import { AuthLayout } from '@/components/auth-layout';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Textes } from '@/constants/textes';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { authErrorMessage, signUp } from '@/repositories/authRepository';

const T = Textes.inscription;

// Écran d'inscription, aux couleurs de la charte Kartnet.
export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Crée le compte (Authentication) ET le profil users/{uid} (Firestore).
  const { submit, submitting, error, setError } = useFormSubmit(
    async () => {
      await signUp(email, password, displayName);
      router.replace('/');
    },
    authErrorMessage,
  );

  function handleSubmit() {
    if (!displayName.trim() || !email.trim() || !password) {
      setError(T.erreurChampsVides);
      return;
    }
    // `void` : on lance la promesse sans l'attendre, volontairement.
    // Les erreurs sont déjà gérées dans useFormSubmit (try / catch).
    void submit();
  }

  return (
    <AuthLayout
      eyebrow={T.surtitre}
      title={T.titre}
      subtitle={T.sousTitre}
      footerLink={{ href: '/login', question: T.questionPied, action: T.actionPied }}>
      <TextField
        label={T.libellePrenom}
        placeholder={T.exemplePrenom}
        value={displayName}
        onChangeText={setDisplayName}
        autoComplete="name"
        textContentType="name"
        maxLength={50}
        returnKeyType="next"
      />
      <TextField
        label={T.libelleEmail}
        placeholder={T.exempleEmail}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label={T.libelleMotDePasse}
        placeholder={T.exempleMotDePasse}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton label={T.bouton} onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
}
