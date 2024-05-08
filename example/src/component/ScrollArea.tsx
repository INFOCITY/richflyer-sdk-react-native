import React from 'react';
import type { PropsWithChildren } from 'react';
import { useColorScheme, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { APPEARANCE_SETTING } from '../const';

export default function ScrollArea({ children }: PropsWithChildren) {
  const isDarkMode = useColorScheme() === APPEARANCE_SETTING.DARK;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
