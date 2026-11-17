import { useState } from 'react';

// Gère l'envoi d'un formulaire asynchrone : état de chargement + message d'erreur.
//   action    : ce qu'il faut faire à l'envoi (ex. () => signIn(email, password))
//   toMessage : traduit une erreur en texte lisible (ex. authErrorMessage)
export function useFormSubmit(action: () => Promise<unknown>, toMessage: (error: unknown) => string) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      await action();
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error, setError };
}
