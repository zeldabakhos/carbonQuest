import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function TabsHomeScreen() {
  const { isSignedIn } = useAuth();

  // If user is signed in and accessing the tabs home, redirect to scan
  if (isSignedIn) {
    return <Redirect href="/scan" />;
  }

  // If not signed in, redirect to the main landing page
  return <Redirect href="/" />;
}
