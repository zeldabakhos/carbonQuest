import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check if user is authenticated
  // If authenticated, redirect to tabs
  // If not, redirect to signin
  
  // For now, always redirect to signin
  return <Redirect href="/signin" />;
}
