import React from 'react';
import { Appbar, Avatar } from 'react-native-paper';
import { Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// This component receives the title of the current screen as a prop
export default function MainAppbar({ title }) {
  const router = useRouter();

  return (
    <Appbar.Header style={styles.appbar}>
      {/* This empty action is a spacer to help center the logo */}
      <Appbar.Action icon="" size={24} /> 
      
      <Image source={require('../assets/images/pokerlogo2removebg.png')} style={styles.logo} />

      <Appbar.Action
        icon="account-circle" // Placeholder icon for the profile picture
        size={32}
        onPress={() => router.push('/profile')} // Navigates to the profile page
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    elevation: 0, 
  },
  logo: {
    height: 40,
    width: 100,
    resizeMode: 'contain',
  },
});