import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Ecran, EnteteEcran, TitreEcran } from '@/components/interface-kartnet';
import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';

function SettingToggle({ title, description, value, onValueChange }: { title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.texteReglage}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: C.line, true: C.ocean }} thumbColor={C.paper} accessibilityLabel={title} />
    </View>
  );
}

export default function EcranParametres() {
  const [usePhotoLocation, setUsePhotoLocation] = useState(true);
  const [reminders, setReminders] = useState(false);

  return (
    <Ecran>
      <EnteteEcran back="/profil" />
      <TitreEcran eyebrow={Textes.parametres.surtitre} title={Textes.parametres.titre} subtitle={Textes.parametres.sousTitre} />
      <View style={styles.panel}>
        <SettingToggle title={Textes.parametres.titreLocalisation} description={Textes.parametres.descriptionLocalisation} value={usePhotoLocation} onValueChange={setUsePhotoLocation} />
        <View style={styles.divider} />
        <SettingToggle title={Textes.parametres.titreNotifications} description={Textes.parametres.descriptionNotifications} value={reminders} onValueChange={setReminders} />
      </View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>{Textes.parametres.titreConfidentialite}</Text><Text style={styles.infoBody}>{Textes.parametres.descriptionConfidentialite}</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>{Textes.parametres.titreAPropos}</Text><Text style={styles.infoBody}>{Textes.parametres.descriptionAPropos}</Text></View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 18, backgroundColor: C.paper, paddingHorizontal: 15 },
  settingRow: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  texteReglage: { flex: 1 },
  settingTitle: { color: C.ink, fontSize: 13, fontWeight: '700' },
  settingDescription: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.line },
  infoCard: { borderRadius: 17, backgroundColor: C.mapTint, padding: 15, marginTop: 14 },
  infoTitle: { color: C.ocean, fontSize: 13, fontWeight: '700' },
  infoBody: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
});
