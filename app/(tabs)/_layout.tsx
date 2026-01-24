import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          display: 'none', // Hide the tab bar
        },
        headerShown: false,
      }}
    >
  
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🔍</Text>
          ),
        }}
      />
    </Tabs>
  );
}
