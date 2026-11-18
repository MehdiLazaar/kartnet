import { router } from 'expo-router';

import { FormulaireVoyage } from '@/components/formulaire-voyage';
import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { Textes } from '@/constants/textes';
import { useVoyages } from '@/features/voyages/contexte-voyages';

export default function EcranCreationVoyage() {
  const { creerVoyage } = useVoyages();

  function handleCreate(title: string, destination: string) {
    const trip = creerVoyage(title, destination);
    router.replace({ pathname: '/voyage/[id]', params: { id: trip.id } });
  }

  return (
    <Ecran>
      <EnteteEcran back="/" />
      <TitreEcran eyebrow={Textes.creerVoyage.surtitre} title={Textes.creerVoyage.titre} subtitle={Textes.creerVoyage.sousTitre} />
      <FormulaireVoyage
        libelleBouton={Textes.creerVoyage.boutonValider}
        note={Textes.creerVoyage.noteEtapeSuivante}
        onValider={handleCreate}
      />
    </Ecran>
  );
}
