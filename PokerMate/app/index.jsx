import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { authenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading spinner while the auth state is being processed
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (authenticated) {
    // If the user is authenticated, redirect them to the main part of the app.
    return <Redirect href="/(main)/main" />;
  } else {
    // If the user is not authenticated, redirect them to the landing page.
    return <Redirect href="/landing" />;
  }
}