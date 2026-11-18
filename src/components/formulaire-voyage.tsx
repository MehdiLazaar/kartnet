import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BoutonPrincipal } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';

type Props = {
    titreInitial?: string;
    destinationInitiale?: string;
    libelleBouton: string;
    note?: string;
    onValider: (title: string, destination: string) => void;
};

export function FormulaireVoyage({
    titreInitial = '',
    destinationInitiale = '',
    libelleBouton,
    note,
    onValider,
}: Readonly<Props>) {
    const [title, setTitle] = useState(titreInitial);
    const [destination, setDestination] = useState(destinationInitiale);
    const [error, setError] = useState('');
    const valider = () => {
        if (!title.trim()) {
            setError(Textes.creerVoyage.erreurNomObligatoire)
            return;
        }
        onValider(title, destination);
    };

    return (
        <>
            {/* Champ 1 : le nom du voyage (obligatoire) */}
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

            {/* Champ 2 : la destination (facultative) */}
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

            {/* Le message d'erreur, seulement s'il y en a un */}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            {/* La note, seulement si l'écran parent en donne une */}
            {note ? (
                <View style={styles.formNote}>
                    <Text style={styles.noteIcon}>✦</Text>
                    <Text style={styles.noteText}>{note}</Text>
                </View>
            ) : null}

            <BoutonPrincipal label={libelleBouton} onPress={valider} />
        </>
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
