import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

const DEFAULT_TIME = 30; // Default time unless changed by user

export default function TimePage() {
  const router = useRouter();
  
  // State Management
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false); // Is the timer running?
  
  // useRef is used to hold the interval ID. It doesn't re-render the component when it changes.
  const intervalRef = useRef(null);

  // The core timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // When timer hits 0, stop it.
            clearInterval(intervalRef.current);
            setIsActive(false);
            return 0;
          }
        });
      }, 1000); // 1000ms = 1 second
    } else {
      clearInterval(intervalRef.current);
    }
    // Cleanup function: This runs when the component unmounts (e.g., user navigates away)
    // or when the dependencies (isActive) change.
    return () => clearInterval(intervalRef.current);
  }, [isActive]); // This effect re-runs only when `isActive` changes.

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(DEFAULT_TIME);
  };
  
  const adjustTime = (amount) => {
    setTime(prevTime => Math.max(0, prevTime + amount)); // Prevent negative time
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Default Time: {DEFAULT_TIME} seconds
      </Text>
      
      <Card style={styles.timerCard}>
        <Card.Content style={styles.timerContent}>
          <IconButton icon="minus" size={30} onPress={() => adjustTime(-5)} />
          <Text variant="displayLarge" style={styles.timerText}>{time}</Text>
          <IconButton icon="plus" size={30} onPress={() => adjustTime(5)} />
        </Card.Content>
      </Card>
      
      <View style={styles.controls}>
        <Button 
          mode="contained" 
          onPress={handleStartStop}
          icon={isActive ? 'pause' : 'play'}
          style={styles.controlButton}
        >
          {isActive ? 'Stop' : 'Start'}
        </Button>
        <Button 
          mode="outlined" 
          onPress={handleReset}
          icon="restart"
          style={styles.controlButton}
        >
          Reset Time
        </Button>
      </View>

      <Button
        mode="text"
        onPress={() => router.replace('/main')} // Use 'replace' so user can't go "back" to the timer
        style={styles.mainMenuButton}
      >
        Main Menu
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    color: 'gray',
    marginBottom: 20,
  },
  timerCard: {
    width: '100%',
    marginVertical: 30,
  },
  timerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    width: '45%',
    paddingVertical: 5,
  },
  mainMenuButton: {
    marginTop: 50,
  },
});