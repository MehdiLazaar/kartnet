import { useState } from 'react';
import { router } from 'expo-router';

import { AuthLayout } from '@/components/auth-layout';
import { FormError } from '@/components/ui/form-error';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Textes } from '@/constants/textes';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { authErrorMessage, signIn } from '@/repositories/authRepository';

const T = Textes.connexion;

// Écran de connexion, aux couleurs de la charte Kartnet.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { submit, submitting, error, setError } = useFormSubmit(
    async () => {
      await signIn(email, password);
      router.replace('/');
    },
    authErrorMessage,
  );

  function handleSubmit() {
    if (!email.trim() || !password) {
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
      footerLink={{ href: '/signup', question: T.questionPied, action: T.actionPied }}>
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
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton label={T.bouton} onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
}
