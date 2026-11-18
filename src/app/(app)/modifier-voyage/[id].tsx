import { router, useLocalSearchParams } from 'expo-router';

import { FormulaireVoyage } from '@/components/formulaire-voyage';
import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranModificationVoyage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { obtenirVoyage, modifierVoyage } = useVoyages();
    const voyage = obtenirVoyage(id);

    // Mauvais id (ou voyage supprimé) : on affiche un message au lieu de planter.
    if (!voyage) {
        return (
            <Ecran>
                <EnteteEcran back="/voyages" />
                <TitreEcran title={Textes.voyage.introuvable} subtitle={Textes.voyage.retourListe} />
            </Ecran>
        );
    }

    // Fonction fléchée déclarée APRÈS le if : TypeScript sait que voyage existe.
    const handleSave = (title: string, destination: string) => {
        modifierVoyage(voyage.id, title, destination); // enregistre dans Firestore
        router.back(); //on retire l'écran du dessus, retour sur la page du voyage
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
            <FormulaireVoyage
                titreInitial={voyage.title}
                destinationInitiale={destinationActuelle}
                libelleBouton={Textes.modifierVoyage.bouton}
                onValider={handleSave}
            />
        </Ecran>
    );
}
