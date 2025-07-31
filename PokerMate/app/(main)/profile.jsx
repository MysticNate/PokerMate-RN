import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { Link } from 'expo-router';

export default function ProfilePage() {
  const username = "Player1"; // Placeholder

  return (
    <SafeAreaView style={styles.container}>
      <Avatar.Image 
        size={120} 
        source={{ uri: 'https://placehold.co/120x120' }} // Placeholder image
        style={styles.avatar} 
      />
      <Text variant="headlineMedium" style={styles.greeting}>Hello {username}</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          icon="camera" 
          mode="contained-tonal" 
          style={styles.button}
          onPress={() => console.log("Change Picture pressed")} // We'll add ImagePicker here
        >
          Change Picture
        </Button>
        <Button 
          icon="account-edit" 
          mode="contained-tonal" 
          style={styles.button}
          onPress={() => console.log("Change Username pressed")}
        >
          Change Username
        </Button>
        <Link href="/gameHistory" asChild>
          <Button icon="history" mode="contained-tonal" style={styles.button}>
            Game History
          </Button>
        </Link>
        <Link href="/viewStats" asChild>
          <Button icon="chart-bar" mode="contained-tonal" style={styles.button}>
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
    backgroundColor: '#fff',
    padding: 20,
  },
  avatar: {
    marginBottom: 20,
    backgroundColor: 'lightgrey',
  },
  greeting: {
    marginBottom: 40,
  },
  buttonContainer: {
    width: '90%',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 5,
  },
});