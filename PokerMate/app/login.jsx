import React, {useState} from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import AppLogo from '../comp/AppLogo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth(); // Get the login function

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
    
    return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <AppLogo />
            <Text variant="headlineMedium" style={styles.title}>Welcome Back!</Text>

            <TextInput
            label="Email"
            mode="outlined"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            />

            <TextInput
            label="Password"
            mode="outlined"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />

            <Button 
              mode="contained" 
              style={styles.button}
              onPress={() => login(email, password)}
            >
              Log In
            </Button>

            <Link href="/register" asChild>
              <Button mode="text">Not registered yet? Sign Up!</Button>
            </Link>

            
            {/* TODO: Temporary development button */}
            {/* <Link href="/(main)/main" asChild>
              <Button mode="outlined" style={[styles.button, styles.tempButton]}>
                Go to Main (Dev Only)
              </Button>
            </Link> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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