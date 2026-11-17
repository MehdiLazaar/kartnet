import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CouleursMarque as C } from '@/constants/identite-visuelle';
import { Textes } from '@/constants/textes';
import { logOut } from '@/repositories/authRepository';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.contenu} />
      <TabList asChild>
        <BarreNavigation>
          <TabTrigger name="home" href="/" asChild>
            <BoutonOnglet>{Textes.navigation.accueil}</BoutonOnglet>
          </TabTrigger>
          <TabTrigger name="voyages" href="/voyages" asChild>
            <BoutonOnglet>{Textes.navigation.voyages}</BoutonOnglet>
          </TabTrigger>
        </BarreNavigation>
      </TabList>
    </Tabs>
  );
}

function BoutonOnglet({ children, isFocused, ref, ...proprietes }: TabTriggerSlotProps) {
  void ref;

  return (
    <Pressable
      {...proprietes}
      style={styles.boutonOnglet}
      accessibilityRole="tab"
    >
      <Text style={[styles.texteOnglet, isFocused && styles.texteOngletActif]}>
        {children}
      </Text>
    </Pressable>
  );
}

function BarreNavigation(props: TabListProps) {
  async function deconnecter() {
    try {
      await logOut();
    } catch {
      Alert.alert(
        Textes.navigation.erreurDeconnexion,
        Textes.navigation.messageErreurDeconnexion,
      );
    }
  }

  return (
    <SafeAreaView {...props} edges={['bottom']} style={styles.barreSecurisee}>
      <View style={styles.barre}>
        {props.children}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Textes.navigation.libelleAccessibiliteDeconnexion}
          onPress={() => void deconnecter()}
          style={styles.boutonDeconnexion}
        >
          <Text style={styles.texteDeconnexion}>{Textes.navigation.deconnexion}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenu: { flex: 1 },
  barreSecurisee: {
    backgroundColor: C.paper,
    borderTopColor: C.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barre: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    gap: 4,
  },
  boutonOnglet: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteOnglet: { color: C.muted, fontSize: 13, fontWeight: '600' },
  texteOngletActif: { color: C.ocean, fontWeight: '800' },
  boutonDeconnexion: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  texteDeconnexion: { color: C.coral, fontSize: 12, fontWeight: '700' },
});
