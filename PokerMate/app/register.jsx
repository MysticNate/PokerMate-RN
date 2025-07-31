import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import AppLogo from '../comp/AppLogo';

export default function Register() {
    return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppLogo />
        <Text variant="headlineMedium" style={styles.title}>Create an Account</Text>

        <TextInput label="Email" mode="outlined" style={styles.input} />
        <TextInput label="Nickname" mode="outlined" style={styles.input} />
        <TextInput label="Password" mode="outlined" style={styles.input} secureTextEntry />
        <TextInput label="Confirm Password" mode="outlined" style={styles.input} secureTextEntry />

        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => console.log('Register pressed')}
        >
          Register
        </Button>

        <Link href="/login" asChild>
          <Button mode="text">Already a user? Log In!</Button>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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