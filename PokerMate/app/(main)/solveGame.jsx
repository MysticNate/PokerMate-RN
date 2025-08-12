import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, useTheme, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext';
import { GameHistoryService } from '../../utils/GameHistoryService';

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
  
  // If already solving, prevent duplicate calls
  if (isSolving) {
    return;
  }

  if (!params.gameDetails) {
    Alert.alert("Missing Game Data", "Could not find the details from the previous screen.");
    return;
  }

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

  try {
    
    const gameDetails = JSON.parse(params.gameDetails);
    const gameStringForBackend = players.map(p => `${p.name.trim()} ${p.buyin} ${p.cashout}`).join(',');
    
    
    const originalRequest = {
      gameString: gameStringForBackend,
      gameStart: gameDetails.gameStart,
      gameEnd: gameDetails.gameEnd,
      gameType: gameDetails.gameType,
      location: gameDetails.location,
      note: gameDetails.gameNote,
      solutionChoice: null,
      problematicGame: null,
    };

   const response = await fetch(`${API_URL}/games/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(originalRequest),
    });

  

    const responseText = await response.text();
    

    if (response.status === 200) {
      
      try {
        const result = JSON.parse(responseText);
        
        const gameDetails = JSON.parse(params.gameDetails);
    
        // Save the game
        await GameHistoryService.saveGame(result, gameDetails, players);
        
        router.push({
          pathname: '/results',
          params: { 
            result: JSON.stringify(result),
            originalRequest: JSON.stringify(originalRequest)
          }
        });
        
      } catch (parseError) {
        Alert.alert('Parse Error', 'Could not parse successful result');
      }
      
    } else if (response.status === 202) {
      
      try {
        const problemResult = JSON.parse(responseText);
       
        router.push({
          pathname: '/results',
          params: { 
            result: JSON.stringify(problemResult),
            originalRequest: JSON.stringify(originalRequest)
          }
        });
        
      } catch (parseError) {
        Alert.alert('Parse Error', 'Could not parse problem data');
      }
      
    } else if (response.status === 400) {
      
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.message || 'Invalid game data';
        Alert.alert('Invalid Game Data', errorMessage);
      } catch (parseError) {
        Alert.alert('Invalid Game', 'The game data is invalid');
      }
      
    } else {
      Alert.alert('Server Error', `Unexpected response: ${response.status}`);
    }

  } catch (error) {
    
    Alert.alert('Connection Error', `Network error: ${error.message}`);
    
  } finally {
   
    setIsSolving(false);
  }
  
};

  // Replace your handleSolve function with this step-by-step test:
// const handleSolve = async () => {
//   setIsSolving(true);

//   try {
//     console.log('=== STARTING STEP-BY-STEP TESTS ===');
//     console.log('API_URL:', API_URL);
    
//     // STEP 1: Test basic connectivity (no auth)
//     console.log('\n--- STEP 1: Testing basic connectivity ---');
//     try {
//       const pingResponse = await fetch(`${API_URL}/games/ping`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });
      
//       console.log('Ping Status:', pingResponse.status);
//       const pingText = await pingResponse.text();
//       console.log('Ping Response:', pingText);
      
//       if (!pingResponse.ok) {
//         throw new Error(`Step 1 failed: ${pingResponse.status}`);
//       }
//       console.log('✅ Step 1 PASSED: Basic connectivity works');
//     } catch (error) {
//       console.log('❌ Step 1 FAILED:', error.message);
//       Alert.alert('Connection Test Failed', `Cannot reach server: ${error.message}`);
//       return;
//     }

//     // STEP 2: Test authentication
//     console.log('\n--- STEP 2: Testing authentication ---');
//     try {
//       const authResponse = await fetch(`${API_URL}/games/auth-test`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//       });
      
//       console.log('Auth Status:', authResponse.status);
//       const authText = await authResponse.text();
//       console.log('Auth Response:', authText);
      
//       if (!authResponse.ok) {
//         throw new Error(`Step 2 failed: ${authResponse.status} - ${authText}`);
//       }
//       console.log('✅ Step 2 PASSED: Authentication works');
//     } catch (error) {
//       console.log('❌ Step 2 FAILED:', error.message);
//       Alert.alert('Auth Test Failed', `Authentication issue: ${error.message}`);
//       return;
//     }

//     // STEP 3: Test database
//     console.log('\n--- STEP 3: Testing database ---');
//     try {
//       const dbResponse = await fetch(`${API_URL}/games/db-test`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//       });
      
//       console.log('DB Status:', dbResponse.status);
//       const dbText = await dbResponse.text();
//       console.log('DB Response:', dbText);
      
//       if (!dbResponse.ok) {
//         throw new Error(`Step 3 failed: ${dbResponse.status} - ${dbText}`);
//       }
//       console.log('✅ Step 3 PASSED: Database works');
//     } catch (error) {
//       console.log('❌ Step 3 FAILED:', error.message);
//       Alert.alert('Database Test Failed', `Database issue: ${error.message}`);
//       return;
//     }

//     // Add this before your Step 4 test to check date parsing:
// console.log('\n--- DATE PARSING TEST ---');
// try {
//   const dateTestRequest = {
//     gameString: "A 5 10,B 5 0",
//     gameStart: gameDetails.gameStart,
//     gameEnd: gameDetails.gameEnd,
//     gameType: gameDetails.gameType,
//     location: gameDetails.location,
//     note: gameDetails.gameNote,
//   };
  
//   console.log('Sending dates:', {
//     gameStart: dateTestRequest.gameStart,
//     gameEnd: dateTestRequest.gameEnd
//   });
  
//   const dateResponse = await fetch(`${API_URL}/games/test-dates`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(dateTestRequest),
//   });
  
//   console.log('Date Test Status:', dateResponse.status);
//   const dateText = await dateResponse.text();
//   console.log('Date Test Response:', dateText);
  
//   const dateResult = JSON.parse(dateText);
//   if (dateResult.success) {
//     console.log('=== SERVER DATE DEBUG ===');
//     dateResult.debugInfo?.forEach((log, index) => {
//       console.log(`${index + 1}: ${log}`);
//     });
//     console.log('✅ Date parsing test completed');
//   } else {
//     console.log('❌ Date parsing test failed:', dateResult.error);
//   }
  
// } catch (error) {
//   console.log('❌ Date test failed:', error.message);
// }

//     console.log('\n--- STEP 4: Testing with ALL AnalyzeGameString parameters ---');
//   try {
//     const gameDetails = JSON.parse(params.gameDetails);
    
//     const gameStringForBackend = players
//       .map(p => `${p.name.trim()} ${p.buyin} ${p.cashout}`)
//       .join(',');

//     // Send ALL parameters that AnalyzeGameString expects
//     const completeTestRequest = {
//       // Core game data
//       gameString: gameStringForBackend,
//       gameStart: gameDetails.gameStart,
//       gameEnd: gameDetails.gameEnd,
//       gameType: gameDetails.gameType,
//       location: gameDetails.location || "",
//       note: gameDetails.gameNote || "",
//       solutionChoice: "",
//       problematicGame: null,
      
//       // Additional parameters that AnalyzeGameString needs
//       userID: "8", // Your user ID from the database test
//       userGameID: 0,
//       AINote: "",
//       minTransfer: 1.0, // Default min transfer value
//       priorityPlayers: [], // Empty array
//     };

//     console.log('Sending COMPLETE request with all AnalyzeGameString parameters:');
//     console.log(JSON.stringify(completeTestRequest, null, 2));

//     // Use a new test endpoint that accepts all parameters
//     const gameResponse = await fetch(`${API_URL}/games/complete-debug-solve`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify(completeTestRequest),
//     });

//     console.log('Complete Debug Solve Status:', gameResponse.status);
//     const gameText = await gameResponse.text();
//     console.log('Complete Debug Solve Response:', gameText);

//     if (gameResponse.status === 200) {
//       try {
//         const debugResult = JSON.parse(gameText);
        
//         // Show all debug logs from server
//         console.log('=== SERVER DEBUG LOGS ===');
//         debugResult.debugLog?.forEach((log, index) => {
//           console.log(`${index + 1}: ${log}`);
//         });
        
//         if (debugResult.success) {
//           console.log('✅ Step 4 PASSED: AnalyzeGameString works with ALL parameters!');
//           Alert.alert('Success!', 'AnalyzeGameString works perfectly with all parameters!');
//         } else {
//           console.log('❌ Step 4 FAILED:', debugResult.error);
          
//           if (debugResult.stackTrace) {
//             console.log('=== STACK TRACE ===');
//             console.log(debugResult.stackTrace);
//           }
          
//           Alert.alert(
//             'AnalyzeGameString Error', 
//             `Error: ${debugResult.error}\n\nCheck console for full details.`
//           );
//         }
        
//       } catch (parseError) {
//         console.log('Could not parse debug response:', parseError);
//         Alert.alert('Parse Error', 'Could not parse server response');
//       }
//     } else {
//       console.log('❌ Complete debug endpoint returned non-200 status');
//       Alert.alert('Debug Error', `Server returned status ${gameResponse.status}`);
//     }

//   } catch (error) {
//     console.log('❌ Step 4 FAILED:', error.message);
//     Alert.alert('Step 4 Failed', error.message);
//   }

//     console.log('🎉 ALL TESTS PASSED! The basic infrastructure is working.');

//   } catch (e) {
//     console.log('Unexpected error:', e);
//     Alert.alert('Unexpected Error', e.message);
//   } finally {
//     setIsSolving(false);
//   }
// };

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