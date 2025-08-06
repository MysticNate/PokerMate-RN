import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { customTheme } from '../constants/theme';
import { ActivityIndicator, View } from 'react-native';

function InitialLayout() {
  const { authenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't do anything until loading is false
    
    const inAuthGroup = segments[0] === '(main)';

    if (authenticated && !inAuthGroup) {
      router.replace('/(main)/main');
    } else if (!authenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [authenticated, isLoading]);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: customTheme.colors.background } }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={customTheme}>
        <InitialLayout />
      </PaperProvider>
    </AuthProvider>
  );
}