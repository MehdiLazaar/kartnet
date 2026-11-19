import { StyleSheet, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { CouleursMarque as C, PoliceEtiquette } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';

// Affichage indicatif : les autorisations appartiennent au système (iOS/Android).
// L'app peut les demander, mais seul l'utilisateur peut les changer, dans les Réglages du téléphone.
// Il n'y a donc volontairement aucun interrupteur ici.
const AUTORISATIONS = [
  { titre: Textes.parametres.titreCamera, description: Textes.parametres.descriptionCamera },
  { titre: Textes.parametres.titreLocalisation, description: Textes.parametres.descriptionLocalisation },
  { titre: Textes.parametres.titreGalerie, description: Textes.parametres.descriptionGalerie },
];

export default function EcranParametres() {
  return (
    <Ecran>
      <EnteteEcran back="/profil" />
      <TitreEcran eyebrow={Textes.parametres.surtitre} title={Textes.parametres.titre} subtitle={Textes.parametres.sousTitre} />
      <Text style={styles.section}>{Textes.parametres.titreAutorisations}</Text>
      <View style={styles.panel}>
        {AUTORISATIONS.map((autorisation, index) => (
          <View key={autorisation.titre} style={[styles.ligne, index > 0 && styles.ligneSeparee]}>
            <Text style={styles.titreLigne}>{autorisation.titre}</Text>
            <Text style={styles.descriptionLigne}>{autorisation.description}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>{Textes.parametres.noteReglages}</Text>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>{Textes.parametres.titreConfidentialite}</Text><Text style={styles.infoBody}>{Textes.parametres.descriptionConfidentialite}</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>{Textes.parametres.titreAPropos}</Text><Text style={styles.infoBody}>{Textes.parametres.descriptionAPropos}</Text></View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  section: { color: C.ocean, fontSize: 10, marginBottom: 10, ...PoliceEtiquette },
  // Charte « Carte au trésor » : boîte de dialogue à coins presque droits et cadre d'encre de 2 px.
  panel: { borderRadius: 6, borderWidth: 2, borderColor: C.cadre, backgroundColor: C.paper, paddingHorizontal: 15 },
  ligne: { paddingVertical: 14 },
  ligneSeparee: { borderTopWidth: 1, borderTopColor: C.line },
  titreLigne: { color: C.ink, fontSize: 14, fontWeight: '700' },
  descriptionLigne: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  note: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 10 },
  infoCard: { borderRadius: 6, backgroundColor: C.mapTint, padding: 15, marginTop: 14 },
  infoTitle: { color: C.ocean, fontSize: 13, fontWeight: '700' },
  infoBody: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 6 },
});
