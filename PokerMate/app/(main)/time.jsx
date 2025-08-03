import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, Card, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

const DEFAULT_TIME = 30; // Default time unless changed by user

export default function TimePage() {
  const router = useRouter();
  const theme = useTheme();
  
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
    if (!isActive) { // Only allow adjustments when timer is not running
      setTime(prevTime => Math.max(0, prevTime + amount)); // Prevent negative time
    }
  };

  // Format time display (mm:ss for times over 60 seconds)
  const formatTime = (seconds) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return seconds.toString();
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (time === 0) return '#FF6B6B'; // Red when finished
    if (time <= 10) return '#FFA726'; // Orange when low
    return theme.colors.text; // Normal color
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text }]}>
          Timer
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Default: {DEFAULT_TIME} seconds
        </Text>
      </View>
      
      {/* Timer Display */}
      <Card style={[styles.timerCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content style={styles.timerContent}>
          <IconButton 
            icon="minus" 
            size={32} 
            onPress={() => adjustTime(-5)}
            disabled={isActive}
            iconColor={isActive ? theme.colors.onSurfaceVariant : theme.colors.primary}
            style={styles.adjustButton}
          />
          
          <View style={styles.timerDisplay}>
            <Text 
              variant="displayLarge" 
              style={[
                styles.timerText, 
                { 
                  color: getTimerColor(),
                  fontSize: time >= 100 ? 48 : 64 // Smaller font for 3+ digit numbers
                }
              ]}
            >
              {formatTime(time)}
            </Text>
            <Text variant="bodySmall" style={[styles.timerLabel, { color: theme.colors.onSurfaceVariant }]}>
              {time >= 60 ? 'minutes' : 'seconds'}
            </Text>
          </View>
          
          <IconButton 
            icon="plus" 
            size={32} 
            onPress={() => adjustTime(5)}
            disabled={isActive}
            iconColor={isActive ? theme.colors.onSurfaceVariant : theme.colors.primary}
            style={styles.adjustButton}
          />
        </Card.Content>
      </Card>
      
      {/* Control Buttons */}
      <View style={styles.controls}>
        <Button 
          mode="contained" 
          onPress={handleStartStop}
          icon={isActive ? 'pause' : 'play'}
          style={[styles.controlButton, { backgroundColor: isActive ? '#FF6B6B' : theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={handleReset}
          icon="restart"
          style={[styles.controlButton, { borderColor: theme.colors.outline }]}
          textColor={theme.colors.onSurface}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Reset
        </Button>
      </View>

      {/* Main Menu Button */}
      <Button
        mode="text"
        onPress={() => router.replace('/main')} 
        style={styles.mainMenuButton}
        textColor={theme.colors.onSurfaceVariant}
      >
        ← Back to Main Menu
      </Button>
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
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  timerCard: {
    width: '90%',
    borderRadius: 16,
    marginBottom: 32,
  },
  timerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  adjustButton: {
    margin: 0,
  },
  timerDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  timerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    width: '90%',
    marginBottom: 32,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainMenuButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  mainMenuButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});