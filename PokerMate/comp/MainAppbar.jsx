import React, { useState } from 'react';
import { Appbar, Avatar, useTheme } from 'react-native-paper';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext'; // Import your auth context

// This component receives the title of the current screen as a prop
export default function MainAppbar({ title }) {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth(); // Get user data from context
  const [imageLoadError, setImageLoadError] = useState(false);
  const logoImage = require('../assets/images/pokerlogo2removebg.png');


  // Determine avatar source
  const getAvatarSource = () => {
    
    if (user?.profilePictureBase64 && !imageLoadError) {
      // The base64 is already a complete data URI, don't add prefix again
      return { uri: user.profilePictureBase64 };
    }
    return require('../assets/images/default-pfp.png');
  };

  const handleImageError = (error) => {
    console.log('Avatar load error:', error);
    setImageLoadError(true);
  };

  return (
    <Appbar.Header style={[styles.appbar, { backgroundColor: theme.colors.surface }]}>
      {/* This empty action is a spacer to help center the logo */}
      <Appbar.Action icon="" size={24} /> 
      
      <TouchableOpacity 
        onPress={() => router.push('/main')}
        style={styles.logoContainer}
      >
        <Image source={logoImage} style={styles.logo} />
      </TouchableOpacity>

      {/* Clickable Profile Picture */}
      <TouchableOpacity 
        onPress={() => router.push('/profile')}
        style={styles.avatarContainer}
      >
        <Avatar.Image 
          size={32} 
          source={getAvatarSource()}
          style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]}
          onError={handleImageError}
        />
      </TouchableOpacity>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 0, 
  },
  logo: {
    height: 40,
    width: 100,
    resizeMode: 'contain',
  },
  avatarContainer: {
    padding: 4, // Add some padding for easier tapping
  },
  avatar: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});