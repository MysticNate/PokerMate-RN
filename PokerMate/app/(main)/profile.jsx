import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Text, Surface, useTheme } from 'react-native-paper';

export default function ProfilePage() {
  const username = "Player1"; // Placeholder
  const theme = useTheme();

  // ADD STATE TO HOLD THE SELECTED IMAGE URI
  const [imageUri, setImageUri] = useState(null);

  // CREATE THE FUNCTION TO OPEN THE CAMERA/IMAGE GALLERY
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
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Function to take a photo with camera
  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos!');
      return;
    }

    // Launch the camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    // If the user didn't cancel, update the image URI state
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Function to open gallery
  const openGallery = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    // If the user didn't cancel, update the image URI state
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Surface style={[styles.avatarContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Avatar.Image 
            size={120} 
            source={imageUri ? { uri: imageUri } : require('../../assets/images/default-pfp.png')}
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
          onPress={() => console.log("Change Username pressed")}
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