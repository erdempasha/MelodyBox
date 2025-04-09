import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from '@/redux/store';

export default function RootLayout() {
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
