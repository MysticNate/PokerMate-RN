import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, useTheme, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://PokerMate.somee.com/api';

// This is a single row for a player
function PlayerRow({ player, onPlayerChange, onDelete, canDelete, isDuplicate }) {
  return (
    <Card style={styles.playerCard}>
      <Card.Content style={styles.playerRow}>
        <View style={styles.inputContainer}>
          <TextInput
            label="Name"
            value={player.name}
            onChangeText={(text) => onPlayerChange(player.id, 'name', text)}
            mode="outlined"
            style={styles.input}
            error={isDuplicate} // Show red border if it's a duplicate
          />
          <HelperText type="error" visible={isDuplicate}>
            Duplicate name!
          </HelperText>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            label="Buyin"
            value={player.buyin}
            onChangeText={(text) => onPlayerChange(player.id, 'buyin', text)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="info" visible={false}>
            {/* Hidden helper text for consistent spacing */}
            .
          </HelperText>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            label="Cashout"
            value={player.cashout}
            onChangeText={(text) => onPlayerChange(player.id, 'cashout', text)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="info" visible={false}>
            {/* Hidden helper text for consistent spacing */}
            .
          </HelperText>
        </View>
        
        <IconButton
          icon="delete-circle"
          iconColor={useTheme().colors.error}
          size={30}
          onPress={() => onDelete(player.id)}
          disabled={!canDelete}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );
}

export default function SolveGamePage() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams(); // Get the params from the previous screen
  const { token } = useAuth(); // Get the auth token

  const [players, setPlayers] = useState([
    { id: 1, name: '', buyin: '', cashout: '' },
    { id: 2, name: '', buyin: '', cashout: '' },
  ]);
  const [duplicateNames, setDuplicateNames] = useState(new Set());
  const [isSolving, setIsSolving] = useState(false); // Add a loading state
  const playerIdCounter = useRef(2);

  // Function to check for duplicate names
  const checkForDuplicates = (currentPlayers) => {
    const names = currentPlayers.map(p => p.name.trim().toLowerCase()).filter(name => name); // Ignore empty names
    const seen = new Set();
    const duplicates = new Set();
    for (const name of names) {
      if (seen.has(name)) {
        duplicates.add(name);
      }
      seen.add(name);
    }
    setDuplicateNames(duplicates);
    return duplicates.size > 0; // Returns true if there are duplicates
  };

  const handlePlayerChange = (id, field, value) => {
    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setPlayers(updatedPlayers);
    // Check for duplicates on every change
    checkForDuplicates(updatedPlayers);
  };

  const handleAddPlayer = () => {
    playerIdCounter.current += 1;
    const newPlayer = { id: playerIdCounter.current, name: '', buyin: '', cashout: '' };
    setPlayers(currentPlayers => [...currentPlayers, newPlayer]);
  };

  const handleDeletePlayer = (id) => {
    if (players.length <= 2) return; 
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    checkForDuplicates(updatedPlayers);
  };
  
  const handleSolve = async () => {
    // Basic validation checks
    if (checkForDuplicates(players)) {
      Alert.alert("Duplicate Names", "Please ensure all player names are unique.");
      return;
    }
    if (players.some(p => !p.name || !p.buyin || !p.cashout)) {
      Alert.alert("Incomplete Data", "Please fill in Name, Buyin, and Cashout for all players.");
      return;
    }

    setIsSolving(true);

    // Get the game details passed from the recordGame page
    const gameDetails = JSON.parse(params.gameDetails);
    
    // Prepare the game string for the backend
    const gameStringForBackend = players
      .map(p => `${p.name.trim()} ${p.buyin} ${p.cashout}`)
      .join(',');

    // This is the object our API endpoint expects
    const originalRequest = {
      gameString: gameStringForBackend,
      gameStart: gameDetails.gameStart,
      gameEnd: gameDetails.gameEnd,
      location: gameDetails.location,
      note: gameDetails.gameNote,
      solutionChoice: null,
      problematicGame: null,
    };
    
    console.log('=== REQUEST DETAILS ===');
    console.log('API_URL:', API_URL);
    console.log('Token exists:', !!token);
    console.log('Request body:', JSON.stringify(originalRequest, null, 2));
    console.log('=====================');

    try {
      const response = await fetch(`${API_URL}/games/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(originalRequest),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
        console.log('Raw response:', responseText); 
        
        if (!responseText) {
            throw new Error("Server returned empty response");
        }

        let resultData;
        try {
            resultData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text:', responseText);
            throw new Error("Invalid JSON response from server");
        }

      if (response.status === 400) { // Unsolvable problem
        throw new Error(resultData.message || "The game data is invalid and cannot be solved.");
      }
      if (!response.ok && response.status !== 202) { // Any other server error
        throw new Error("An unexpected error occurred on the server.");
      }

      // SUCCESS. Navigate to the results page, passing the server's response
      // and the original request data for the potential second call.
      router.push({
        pathname: '/results',
        params: { 
          result: JSON.stringify(resultData),
          originalRequest: JSON.stringify(originalRequest)
        }
      });

    } catch (e) {
      console.log('Fetch error:', e);
      Alert.alert('Error', e.message);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={[styles.pageTitle, { color: theme.colors.text }]}>
            Add Players
          </Text>
          
          {players.map(player => (
            <PlayerRow
              key={player.id}
              player={player}
              onPlayerChange={handlePlayerChange}
              onDelete={handleDeletePlayer}
              canDelete={players.length > 2}
              isDuplicate={duplicateNames.has(player.name.trim().toLowerCase())}
            />
          ))}
          
          <Button 
            mode="outlined" 
            icon="plus" 
            onPress={handleAddPlayer} 
            style={[styles.addButton, { borderColor: theme.colors.outline }]}
            textColor={theme.colors.onSurface}
          >
            Add Player
          </Button>

          <Button 
            mode="contained" 
            onPress={handleSolve} 
            style={[styles.solveButton, { backgroundColor: theme.colors.primary }]}
            loading={isSolving}
            disabled={isSolving}
          >
            Solve Game
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: { 
    padding: 20 
  },
  pageTitle: { 
    textAlign: 'center', 
    marginBottom: 30,
    fontWeight: 'bold'
  },
  playerCard: { 
    marginVertical: 8,
    borderRadius: 12
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
    justifyContent: 'space-between',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    // flex: 1 is now on the container
  },
  deleteButton: {
    marginTop: 8, // Align with the text inputs
  },
  addButton: { 
    marginTop: 30, 
    paddingVertical: 8,
    borderRadius: 12
  },
  solveButton: { 
    marginTop: 20, 
    paddingVertical: 10,
    borderRadius: 12
  },
});