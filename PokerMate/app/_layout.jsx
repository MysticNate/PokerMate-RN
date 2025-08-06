import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { customTheme } from '../constants/theme';
import { ActivityIndicator, View } from 'react-native';

function ThemedStack() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: customTheme.colors.background } }} />
  );
}

export default function RootLayout() {
  return (
    // AuthProvider should be the outermost provider
    <AuthProvider>
      <PaperProvider theme={customTheme}>
        <ThemedStack />
      </PaperProvider>
    </AuthProvider>
  );
}