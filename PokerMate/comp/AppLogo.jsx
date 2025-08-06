import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function AppLogo() {
    const logoImage = require('../assets/images/pokerlogo2removebg.png');


  return (
    <Image 
      source={logoImage} 
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

