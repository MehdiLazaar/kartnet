import { StyleSheet, Text, View } from 'react-native';

import { CouleursMarque as C } from '@/constants/identite-visuelle';

// Message d'erreur sous un formulaire. N'affiche rien si `message` est null.
export function FormError({ message }: Readonly<{ message: string | null }>) {
  if (!message) return null;

  return (
    <View style={styles.box}>
      <Text accessibilityRole="alert" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: C.captionTint, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 },
  text: { color: C.coralDeep, fontSize: 13, lineHeight: 18 },
});
