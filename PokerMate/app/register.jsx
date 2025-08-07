import React, {useState} from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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

    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    const handleRegister = () => {
      if (!validateEmail(email)) {
        alert("Please enter a valid email address");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

    // console.log('registering with:', {
    //   email: email,
    //   nickname: nickname,
    //   password: password,
    // });

    // Call the register function 
    register(email, nickname, password);
  };

    return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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