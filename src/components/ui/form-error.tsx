import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Message d'erreur sous un formulaire. N'affiche rien si `message` est null.
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <ThemedText type="small" style={styles.error}>
      {message}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  error: {
    color: '#E5484D',
  },
});
