import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import AppLogo from '../comp/AppLogo';

export default function Login() {
    const handleLogin = () => {
    // TODO: Add real authentication logic here
    console.log('Login pressed');
    
    // For now, just navigate to main page
    router.replace('/(main)/main');
  };
    
    return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppLogo />
        <Text variant="headlineMedium" style={styles.title}>Welcome Back!</Text>

        <TextInput label="Email" mode="outlined" style={styles.input} />
        <TextInput label="Password" mode="outlined" style={styles.input} secureTextEntry />

        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => console.log('Login pressed')}
        >
          Log In
        </Button>

        <Link href="/register" asChild>
          <Button mode="text">Not registered yet? Sign Up!</Button>
        </Link>

        {/* Temporary development button */}
        <Link href="/(main)/main" asChild>
          <Button mode="outlined" style={[styles.button, styles.tempButton]}>
            🚧 Go to Main (Dev Only)
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
});