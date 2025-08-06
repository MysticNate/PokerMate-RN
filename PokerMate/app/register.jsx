import React, {useState} from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import AppLogo from '../comp/AppLogo';
import { useAuth } from '../context/AuthContext';

export default function Register() {

    const { register } = useAuth();

    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log('Attempting to register with:', {
      email: email,
      nickname: nickname,
      password: password,
    });

    // Call the register function from our context
    register(email, nickname, password);
  };

    return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppLogo />
        <Text variant="headlineMedium" style={styles.title}>Create an Account</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={text => setEmail(text)} // Correctly update the 'email' state
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Nickname"
          value={nickname}
          onChangeText={text => setNickname(text)} // Correctly update the 'nickname' state
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={text => setPassword(text)} // Correctly update the 'password' state
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={text => setConfirmPassword(text)} // Correctly update the 'confirmPassword' state
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <Button 
          mode="contained" 
          style={styles.button}
          onPress={handleRegister}
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