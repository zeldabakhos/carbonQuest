import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function TabsHomeScreen() {
  const { isSignedIn, loading } = useAuth();

  // Wait for auth to load
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If user is signed in and accessing the tabs home, redirect to scan
  if (isSignedIn) {
    return <Redirect href="/scan" />;
  }

  // If not signed in, redirect to the main landing page
  return <Redirect href="/" />;
}
