import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { tabsTitles } from '@/constants/strings';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#777777',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          boxShadow: "none",
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: tabsTitles.settingsTab,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: tabsTitles.homeTab,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: tabsTitles.libraryTab,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
