import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { CouleursMarque as C } from '@/constants/identite-visuelle';

type TextFieldProps = TextInputProps & {
  label?: string; // libellé affiché au-dessus du champ
};

// Champ de saisie aux couleurs de la charte Kartnet.
// Accepte toutes les props d'un TextInput classique, plus un libellé facultatif.
export function TextField({ label, style, accessibilityLabel, ...props }: Readonly<TextFieldProps>) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={C.muted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: C.ink, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 54,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.paper,
    paddingHorizontal: 15,
    color: C.ink,
    fontSize: 15,
  },
});
