import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Surface, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { Image } from 'react-native';

const API_BASE_URL = 'http://PokerMate.somee.com/api'; 

export default function ProfilePage() {
  const theme = useTheme();
  const { user, logout, uploadPfp, changeNickname  } = useAuth(); 
  const username = user?.nickname || "Player";

  // STATE TO HOLD THE SELECTED IMAGE URI 
  const [pickedImageUri, setPickedImageUri] = useState(null);

  // FUNCTION TO OPEN THE CAMERA/IMAGE GALLERY
  const pickImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select your profile picture',
      [
        {
          text: 'Camera',
          onPress: () => takePhoto(),
        },
        {
          text: 'Gallery',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };


  // Function to pick from gallery and upload
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need permissions to open gallery');
        return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
    });

    if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPickedImageUri(uri); 
        
        try {
        await uploadPfp(uri); // Upload to server
        setPickedImageUri(null); // Clear picked image since it's now uploaded
        } catch (error) {
        // Keep the picked image visible if upload fails
        console.error('Failed to upload:', error);
        }
    }
  };

  // Function to take a photo with camera and upload
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos!');
        return;
    }

    let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
    });

    if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPickedImageUri(uri);
        
        try {
        await uploadPfp(uri);
        setPickedImageUri(null);
        } catch (error) {
        console.error('Failed to upload:', error);
        }
    }
  };

  const handlePressChangeNickname = () => {
    // Alert.prompt is a simple iOS-only feature
    Alert.prompt(
      "Change Nickname",
      "Enter your new nickname:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          // The text the user entered is passed to the onPress function
          onPress: (newNickname) => {
            if (newNickname && newNickname.trim() !== "") {
              // Call the function 
              changeNickname(newNickname.trim());
            }
          },
        },
      ],
      'plain-text', // Input type
      user?.nickname || '' // Default text in the input box
    );
  };
  
  // Default image source
  let avatarSource = require('../../assets/images/default-pfp.png'); 
  if (pickedImageUri) {
    avatarSource = { uri: pickedImageUri };
  } else if (user?.profilePictureBase64) {
  avatarSource = { uri: user.profilePictureBase64 };
  }


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {/* Profile Header */}
      <View style={styles.header}>
        <Surface style={[styles.avatarContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Avatar.Image 
            size={120} 
            source={avatarSource}
            style={styles.avatar} 
          />
        </Surface>
        
        <Text variant="headlineMedium" style={[styles.greeting, { color: theme.colors.text }]}> 
          Hello {username}
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}> 
          Manage your profile settings
        </Text>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button 
          icon="camera" 
          mode="contained" 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          onPress={pickImage}
        >
          Change Picture
        </Button>
        
        <Button 
          icon="account-edit" 
          mode="outlined" 
          style={[styles.button, { borderColor: theme.colors.outline }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          textColor={theme.colors.onSurface}
          onPress={handlePressChangeNickname}
        >
          Change Username
        </Button>
        
        <Link href="/gameHistory" asChild>
          <Button 
            icon="history" 
            mode="outlined" 
            style={[styles.button, { borderColor: theme.colors.outline }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            textColor={theme.colors.onSurface}
          >
            Game History
          </Button>
        </Link>
        
        <Link href="/viewStats" asChild>
          <Button 
            icon="chart-bar" 
            mode="outlined" 
            style={[styles.button, { borderColor: theme.colors.outline }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            textColor={theme.colors.onSurface}
          >
            View Stats
          </Button>
        </Link>
        <Button 
          icon="logout"
          mode="outlined"
          style={[styles.button, { borderColor: theme.colors.error }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          textColor={theme.colors.error}
          onPress={logout}
        >
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  avatarContainer: {
    borderRadius: 70,
    padding: 10,
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    width: '90%',
    gap: 12,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});