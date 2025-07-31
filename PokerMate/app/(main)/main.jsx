import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link, useNavigation } from 'expo-router';

export default function MainPage() {
  const navigation = useNavigation();
  // We set the title dynamically here. This overrides the one in _layout.jsx
  // It's useful for titles like "Hello {username}"
  React.useEffect(() => {
    navigation.setOptions({ title: 'Main Menu' }); 
  }, [navigation]);

  const username = "Player1"; // Placeholder for now

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Hello {username}</Text>
        <Text variant="titleLarge" style={styles.subtitle}>Pick an Option</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Link href="/recordGame" asChild>
          <Button mode="contained" style={styles.button}>Record Game</Button>
        </Link>
        <Link href="/potSplit" asChild>
          <Button mode="contained" style={styles.button}>Pot Split</Button>
        </Link>
        <Link href="/time" asChild>
          <Button mode="contained" style={styles.button}>Time</Button>
        </Link>
      </View>
      {/* Placeholder for Config button */}
      <View style={styles.configButtonContainer}>
         <Link href="/config" asChild>
            <Button icon="cog">Config</Button>
         </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 8,
    color: 'gray',
  },
  buttonContainer: {
    width: '90%',
  },
  button: {
    paddingVertical: 10,
    marginVertical: 10,
  },
  configButtonContainer: {
      position: 'absolute',
      top: 10,
      left: 10
  }
});