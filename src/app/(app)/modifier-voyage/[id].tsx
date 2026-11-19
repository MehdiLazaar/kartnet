import { FormulaireVoyage } from '@/components/formulaire-voyage';
import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { SymboleKartnet } from '@/components/marque-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { choisirImageCouverture } from '@/features/photos/choisir-image-couverture';
import { useVoyages } from '@/features/voyages/contexte-voyages';
import { getPhotoUri } from '@/repositories/photoStorage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function EcranModificationVoyage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { obtenirVoyage, modifierVoyage, changerCouverture } = useVoyages();
    const voyage = obtenirVoyage(id);

    //Narrowing, si Mauvais id (ou voyage supprimé) on affiche un message au lieu de planter e
    //on continue pas
    if (!voyage) {
        return (
            <Ecran>
                <EnteteEcran back="/voyages" />
                <TitreEcran title={Textes.voyage.introuvable} subtitle={Textes.voyage.retourListe} />
            </Ecran>
        );
    }

    // Fonction fléchée déclarée APRÈS le if du coup TypeScript sait que voyage existe.
    const handleSave = (title: string, destination: string) => {
         // enregistre dans Firestore
        modifierVoyage(voyage.id, title, destination);
         //Retire l'écran du dessus du coup on retourne sur la page du voyag
        router.back();
    };

    //Appel la fonction pour choisir l'image icon du voyage dans la galerie
    const changerIcone = async () => {
        try {
            const chemin = await choisirImageCouverture();
            //si le chemin est null donc le user a arreter, on stop la fonction
            if (!chemin) return;
            //enregistre l'icône avec changerCouverture pas besoin de supprimer l'ancienne ca la remplaces
            changerCouverture(voyage.id, chemin);
        } catch {
            Alert.alert(Textes.modifierVoyage.libelleIcone, Textes.modifierVoyage.erreurIcone);
        }
    };


    // Le texte de remplacement n'est pas une vraie destination : champ vide.
    const destinationActuelle =
        voyage.destination === Textes.voyage.destinationParDefaut ? '' : voyage.destination;

    return (
        <Ecran>
            <EnteteEcran back="/voyages" />
            <TitreEcran
                eyebrow={Textes.modifierVoyage.surtitre}
                title={Textes.modifierVoyage.titre}
                subtitle={Textes.modifierVoyage.sousTitre}
            />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={Textes.modifierVoyage.libelleAccessibiliteIcone}
                onPress={changerIcone}
                style={({ pressed }) => [styles.blocIcone, pressed && styles.appuye]}
            >
                {voyage.cheminCouverture ? (
                    <Image
                        source={{ uri: getPhotoUri(voyage.cheminCouverture) }}
                        contentFit="cover"
                style={styles.icone}
                accessibilityIgnoresInvertColors
                    />
                ) : (
                <View style={[styles.icone, styles.iconeVide]}>
                    <SymboleKartnet taille={30} />
                </View>
                )}

                <View style={styles.texteIcone}>
                    <Text style={styles.libelleIcone}>{Textes.modifierVoyage.libelleIcone}</Text>
                    <Text style={styles.aideIcone}>{Textes.modifierVoyage.aideIcone}</Text>
                </View>

            </Pressable>

            <FormulaireVoyage
                titreInitial={voyage.title}
                destinationInitiale={destinationActuelle}
                libelleBouton={Textes.modifierVoyage.bouton}
                onValider={handleSave}
            />
        </Ecran>
    );
}

const styles = StyleSheet.create({
    // le bloc entier : l'icône à gauche, les textes à droite
    blocIcone: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
    // le carré de l'icône (image ou ⌖) : mêmes dimensions que tripIcon des cartes de voyage
    icone: { width: 70, height: 70, borderRadius: 4 },
    // ajouté au carré quand il n'y a pas d'image : fond coloré + ⌖ centré
    iconeVide: { backgroundColor: C.mapTint, alignItems: 'center', justifyContent: 'center' },
    // la colonne des deux textes prend toute la place restante
    texteIcone: { flex: 1 },
    libelleIcone: { color: C.ink, fontSize: 13, fontWeight: '700' },
    aideIcone: { color: C.muted, fontSize: 12, marginTop: 4 },
    // retour visuel pendant l'appui
    appuye: { opacity: 0.8 },
});

