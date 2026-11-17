import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { CouleursMarque as C } from '@/constants/identite-visuelle';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean; // affiche un indicateur et désactive le bouton
};

// Bouton principal corail, dans le même style que BoutonPrincipal (interface-kartnet).
export function PrimaryButton({ label, onPress, loading = false }: Readonly<PrimaryButtonProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}>
      {loading ? (
        <ActivityIndicator color={C.paper} />
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.arrow}>→</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    paddingHorizontal: 17,
    borderRadius: 16,
    backgroundColor: C.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: C.coral,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  label: { color: C.paper, fontSize: 15, fontWeight: '700' },
  arrow: { color: C.paper, fontSize: 21, fontWeight: '600' },
});
