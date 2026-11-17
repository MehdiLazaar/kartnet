import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran, BoutonPrincipal } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranCreationVoyage() {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const { creerVoyage } = useVoyages();

  function handleCreate() {
    if (!title.trim()) {
      setError(Textes.creerVoyage.erreurNomObligatoire);
      return;
    }
    const trip = creerVoyage(title, destination);
    router.replace({ pathname: '/voyage/[id]', params: { id: trip.id } });
  }

  return (
    <Ecran>
      <EnteteEcran back="/(tabs)/voyages" />
      <TitreEcran eyebrow={Textes.creerVoyage.surtitre} title={Textes.creerVoyage.titre} subtitle={Textes.creerVoyage.sousTitre} />
      <View style={styles.field}>
        <Text style={styles.label}>{Textes.creerVoyage.libelleNom}</Text>
        <TextInput
          accessibilityLabel={Textes.creerVoyage.libelleNom}
          autoCapitalize="sentences"
          maxLength={48}
          onChangeText={(value) => { setTitle(value); setError(''); }}
          placeholder={Textes.creerVoyage.exempleNom}
          placeholderTextColor={C.muted}
          returnKeyType="next"
          style={styles.input}
          value={title}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{Textes.creerVoyage.libelleDestination}</Text>
        <TextInput
          accessibilityLabel={Textes.creerVoyage.libelleDestination}
          autoCapitalize="words"
          maxLength={64}
          onChangeText={setDestination}
          placeholder={Textes.creerVoyage.exempleDestination}
          placeholderTextColor={C.muted}
          returnKeyType="done"
          style={styles.input}
          value={destination}
        />
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.formNote}>
        <Text style={styles.noteIcon}>✦</Text>
        <Text style={styles.noteText}>{Textes.creerVoyage.noteEtapeSuivante}</Text>
      </View>
      <BoutonPrincipal label={Textes.creerVoyage.boutonValider} onPress={handleCreate} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 19 },
  label: { color: C.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 54, borderRadius: 15, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 15, color: C.ink, fontSize: 15 },
  error: { color: '#B84E3D', fontSize: 12, marginTop: -8, marginBottom: 12 },
  formNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.mapTint, borderRadius: 14, padding: 14, marginTop: 3, marginBottom: 23, gap: 10 },
  noteIcon: { color: C.ocean, fontSize: 17 },
  noteText: { color: C.ocean, fontSize: 12, lineHeight: 18, flex: 1 },
});
