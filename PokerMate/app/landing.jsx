import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import AppLogo from '../comp/AppLogo';
import { useAuth } from '../context/AuthContext';


export default function Index() {
  const { googleSignIn } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <AppLogo />
      <View style={styles.content}>
        <Link href="/register" asChild>
          <Button mode="contained" style={styles.button}>
            Register
          </Button>
        </Link>
        <Link href="/login" asChild>
          <Button mode="contained" style={styles.button}>
            Log In
          </Button>
        </Link>
        <Button 
          mode="contained" 
          icon="google" 
          style={[styles.button, {backgroundColor: '#db4437'}]}
          onPress={googleSignIn} 
        >
          Sign In With Google
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginVertical: 8,
  },
});
