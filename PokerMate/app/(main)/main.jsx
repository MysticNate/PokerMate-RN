import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { Link, useNavigation } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function MainPage() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAuth();
  
  React.useEffect(() => {
    navigation.setOptions({ title: 'Main Menu' }); 
  }, [navigation]);

  const username = user?.nickname || "Player"; // in case failed to fetch user nickname 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineLarge" style={[styles.greeting, { color: theme.colors.text }]}>
          Hello {username}
        </Text>
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Pick an Option Boss
        </Text>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonContainer}>
        <Link href="/recordGame" asChild>
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Record Game
          </Button>
        </Link>
        
        <Link href="/potSplit" asChild>
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Pot Split
          </Button>
        </Link>
        
        <Link href="/time" asChild>
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Timer
          </Button>
        </Link>
      </View>

      {/* Config Button */}
      <View style={styles.configButtonContainer}>
         <Link href="/config" asChild>
            <Button 
              icon="cog" 
              mode="text"
              textColor={theme.colors.onSurfaceVariant}
            >
              Settings
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
    marginTop: 90,
    marginBottom: 60,
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
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  configButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});