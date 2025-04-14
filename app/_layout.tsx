import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import { Audio } from 'expo-av';

import { store, persistor } from '@/redux/store';

import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Dialog.Button"
]);

export default function RootLayout() {

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio mode configured successfully.');
      } catch (e) {
        console.error('Failed to set audio mode', e);
      }
    };
    configureAudio();
  }, []);

  return(
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="album/[album]"
            options={{
              presentation: "modal",
            }}
          />
          <Stack.Screen name="test" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
