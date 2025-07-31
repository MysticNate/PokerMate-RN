import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function AppLogo() {
  return (
    <Image 
      source={require('../assets/images/pokerlogo2removebg.png')} 
      style={styles.logo} 
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
});

