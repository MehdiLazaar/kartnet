import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { CouleursMarque } from '@/constants/identite-visuelle';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={CouleursMarque.cream}
      indicatorColor={CouleursMarque.captionTint}
      labelStyle={{ selected: { color: CouleursMarque.ink } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="voyages">
        <NativeTabs.Trigger.Label>Voyages</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
