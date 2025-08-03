import { Stack } from 'expo-router';
import { customTheme } from '../../constants/theme';
import MainAppbar from '../../comp/MainAppbar';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        // Use our custom component for the header
        header: (props) => <MainAppbar {...props} />,
        contentStyle: { backgroundColor: customTheme.colors.background }
      }}
    >
      {/* Define titles for each screen here for cleanliness */}
      <Stack.Screen name="main" options={{ title: 'Main Menu' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="config" options={{ title: 'Configuration' }} />
      <Stack.Screen name="time" options={{ title: 'Timer' }} />

      <Stack.Screen name="recordGame" options={{ title: 'Record a Game' }} />
      <Stack.Screen name="solveGame" options={{ title: 'Solve Game' }} />
      <Stack.Screen name="results" options={{ title: 'Game Results' }} />

      <Stack.Screen name="potSplit" options={{ title: 'ChipChop Pot Splitter' }} />
      <Stack.Screen name="resultPotSplit" options={{ title: 'Pot Split Results' }} />
    </Stack>
  );
}