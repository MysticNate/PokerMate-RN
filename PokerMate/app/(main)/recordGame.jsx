import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button, Card, Text, TextInput } from 'react-native-paper';

export default function RecordGamePage() {
  const router = useRouter();
  
  // State for game data
  const [gameStart, setGameStart] = useState(new Date()); // Default to now
  const [gameEnd, setGameEnd] = useState(new Date());     // Default to now
  const [gameType, setGameType] = useState('Texas Holdem');
  const [gameNote, setGameNote] = useState('');
  const [location, setLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // State for the date picker modal
  const [isPickerVisible, setPickerVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState('start'); // 'start' or 'end'

  const getLocation = async () => {
    setIsFetchingLocation(true); // Show loading indicator on the button

    // Request permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      setIsFetchingLocation(false);
      return;
    }

    try {
      // Get GPS coordinates
      let currentPosition = await Location.getCurrentPositionAsync({});
      
      // Reverse geocode to get an address
      let address = await Location.reverseGeocodeAsync(currentPosition.coords);
      
      // Format the location string (e.g., "San Francisco, CA")
      if (address && address.length > 0) {
        const { city, region } = address[0];
        setLocation(city ? `${city}, ${region}` : 'Unknown Location');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Please enter it manually.');
      console.error('Location error:', error);
    } finally {
      setIsFetchingLocation(false); // Hide loading indicator
    }
  };

  const showDatePicker = (mode) => {
    setPickerMode(mode);
    setPickerVisibility(true);
  };

  const hideDatePicker = () => {
    setPickerVisibility(false);
  };

  const handleConfirm = (date) => {
    if (pickerMode === 'start') {
      setGameStart(date);
    } else {
      setGameEnd(date);
    }
    hideDatePicker();
  };

  // Function to format the date for display
  const formatDate = (date) => {
    return date.toLocaleString([], {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleSolveGame = () => {
    router.push('/solveGame'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text variant="headlineLarge" style={styles.pageTitle}>Input Game Data</Text>

            <Card style={styles.card}>
              <Card.Content>
                {/* We wrap the TextInput in a TouchableOpacity to trigger the picker */}
                <TouchableOpacity onPress={() => showDatePicker('start')}>
                  <View>
                    <TextInput
                      label="Game Start"
                      value={formatDate(gameStart)}
                      editable={false} // Prevent keyboard from showing up
                      mode="outlined"
                      right={<TextInput.Icon icon="calendar" />}
                    />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => showDatePicker('end')}>
                  <View style={styles.input}>
                    <TextInput
                      label="Game End"
                      value={formatDate(gameEnd)}
                      editable={false}
                      mode="outlined"
                      right={<TextInput.Icon icon="calendar" />}
                    />
                  </View>
                </TouchableOpacity>

                <Text variant="bodyLarge" style={styles.label}>Game Type</Text>
                <Button mode="outlined" style={styles.spinnerButton} onPress={() => console.log('Open game type picker')}>
                  {`Type: ${gameType}`}
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <TextInput label="Game Note" value={gameNote} onChangeText={setGameNote} mode="outlined" multiline numberOfLines={4} style={styles.input} />
                <TextInput
                  label="Location"
                  value={location}
                  onChangeText={setLocation}
                  mode="outlined"
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon="crosshairs-gps"
                      onPress={getLocation}
                      disabled={isFetchingLocation}
                    />
                  }
                />
              </Card.Content>
            </Card>
            
            <Button mode="contained" onPress={handleSolveGame} style={styles.solveButton}>
              Continue to Add Players
            </Button>
          </View>
        </ScrollView>
        {/* THE MODAL COMPONENT - It's invisible until isPickerVisible is true */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="datetime" // Can be "date", "time", or "datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles are mostly the same, just added 'input' for consistent spacing
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginVertical: 10,
  },
  input: {
    marginTop: 10,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
  },
  spinnerButton: {
    justifyContent: 'flex-start',
    paddingVertical: 5,
  },
  solveButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});