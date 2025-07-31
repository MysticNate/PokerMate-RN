import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { customTheme } from '../constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={customTheme}>
      <Stack
        screenOptions={{
          headerShown: false, 
        }}
      />
    </PaperProvider>
  );
}