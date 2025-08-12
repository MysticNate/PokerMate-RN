import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, DataTable, Divider, RadioButton, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { GameHistoryService } from '../../utils/GameHistoryService';

const API_URL = 'http://PokerMate.somee.com/api'; 

export default function ResultsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const { token } = useAuth();

  // State to hold the full GameResult object from the server
  const [gameResult, setGameResult] = useState(null);
  // State to hold the original request data for the second API call
  const [originalRequest, setOriginalRequest] = useState(null);
  // State for the user's selected solution
  const [chosenSolution, setChosenSolution] = useState('');
  // Loading state for the second API call
  const [isSolving, setIsSolving] = useState(false);

    // Add this debugging to your ResultsPage useEffect:
useEffect(() => {
  console.log('=== RESULTS PAGE DEBUG ===');
  console.log('Raw params.result:', params.result);
  
  if (params.result) {
    const parsedResult = JSON.parse(params.result);
    console.log('Parsed result object:', parsedResult);
    
    // The data is NOT nested - it's direct
    const actualGameData = parsedResult; // No nesting!
    
    console.log('=== PROBLEM CHECK ===');
    console.log('Problem object:', actualGameData.Problem);
    
    if (actualGameData.Problem) {
      console.log('✅ Problem found!');
      console.log('Problem description:', actualGameData.Problem.ProblemDescriptionString);
      console.log('Error message:', actualGameData.Problem.ErrorMessage);
      console.log('Solutions suggested:', actualGameData.Problem.SolutionsSuggested);
      
      if (actualGameData.Problem.SolutionsSuggested && actualGameData.Problem.SolutionsSuggested.length > 0) {
        console.log('First solution:', actualGameData.Problem.SolutionsSuggested[0]);
        console.log('Solution string:', actualGameData.Problem.SolutionsSuggested[0].SolutionString);
      }
    } else {
      console.log('❌ No problem found');
    }
    
    setGameResult(actualGameData);
    if (!actualGameData.Problem && actualGameData.GamePlayers && actualGameData.GamePlayers.length > 0) {
      saveGameToHistory();
    }
  }
  
  if (params.originalRequest) {
    setOriginalRequest(JSON.parse(params.originalRequest));
  }
}, [params.result, params.originalRequest]);

//   useEffect(() => {
//     // This runs once when the page loads, setting the initial state
//     if (params.result) {
//       setGameResult(JSON.parse(params.result));
//     }
//     if (params.originalRequest) {
//       setOriginalRequest(JSON.parse(params.originalRequest));
//     }
//   }, [params.result, params.originalRequest]);

  // Update your handleApplySolution to use the simplified approach:
const handleApplySolution = async () => {
  console.log('🔧 handleApplySolution started (simplified approach)');
  console.log('🔧 chosenSolution:', chosenSolution);
  
  if (!chosenSolution) {
    Alert.alert("Selection Required", "Please choose a solution to apply.");
    return;
  }
  
  setIsSolving(true);

  // Simply send the same original request, but with the solution choice
  const solutionRequest = {
    ...originalRequest, // This has all the original game parameters
    solutionChoice: chosenSolution, // Add the chosen solution
    // Remove problematicGame entirely - we don't need it!
    problematicGame: null
  };
  
  console.log('🔧 Solution request (simplified):', JSON.stringify(solutionRequest, null, 2));
  
  try {
    console.log('🔧 Making solution API call...');
    const response = await fetch(`${API_URL}/games/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(solutionRequest),
    });

    console.log('🔧 Solution response status:', response.status);
    const responseText = await response.text();
    console.log('🔧 Solution response text:', responseText);
    
    if (response.status === 200) {
      // Solution applied successfully
      const finalResult = JSON.parse(responseText);
      console.log('✅ Solution applied successfully!');
      
      // Update the state with the final, solved result
      setGameResult(finalResult);
      setOriginalRequest(null); // Clear since we're done
      // Save to history if fully solved and has players
      if (
        finalResult &&
        !finalResult.Problem &&
        finalResult.GamePlayers &&
        Array.isArray(finalResult.GamePlayers) &&
        finalResult.GamePlayers.length > 0
      ) {
        saveGameToHistory(finalResult);
      }
    } else {
      // Handle error
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || `Server returned status ${response.status}`);
      } catch (parseError) {
        throw new Error(`Server error: ${response.status}`);
      }
    }

  } catch (e) {
    console.log('💥 Error applying solution:', e);
    Alert.alert('Error', `Failed to apply solution: ${e.message}`);
  } finally {
    setIsSolving(false);
  }
};

  const handleDone = () => {
    router.replace('/(main)/main');
  };

  const saveGameToHistory = async () => {
  try {
    // Only save if gameResult is not null and is a fully solved game (no problems)
    if (
      gameResult &&
      !gameResult.Problem &&
      gameResult.GamePlayers &&
      Array.isArray(gameResult.GamePlayers) &&
      gameResult.GamePlayers.length > 0
    ) {
      console.log('Saving game to local history...');
      // Reconstruct the original players data from the gameResult
      const playersData = gameResult.GamePlayers.map(player => ({
        name: player.PlayerName,
        buyin: player.BuyIn.toString(),
        cashout: player.CashOut.toString(),
      }));
      // Reconstruct game details from originalRequest
      const gameDetails = {
        gameType: originalRequest?.gameType || 'Poker Game',
        gameStart: originalRequest?.gameStart || new Date().toISOString(),
        gameEnd: originalRequest?.gameEnd || new Date().toISOString(),
        location: originalRequest?.location || '',
        gameNote: originalRequest?.note || '',
      };
      await GameHistoryService.saveGame(gameResult, gameDetails, playersData);
      console.log('✅ Game saved to history successfully');
    }
  } catch (error) {
    console.error('Failed to save game to history:', error);
    // Don't show error to user - it's not critical
  }
};

  // --- RENDER LOGIC ---

  if (!gameResult) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  // RENDER STATE 1: A solvable problem was found
  const problem = gameResult.problem || gameResult.Problem;
  if (problem && !problem.errorMessage && !problem.ErrorMessage) {
    const solutions = problem.solutionsSuggested || problem.SolutionsSuggested || [];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <Card.Title title="Problem Found!" subtitle="The game is unbalanced." />
            <Card.Content>
              <Text variant="bodyLarge" style={styles.problemDescription}>
                {problem.problemDescriptionString || problem.ProblemDescriptionString}
              </Text>
              <Divider style={styles.divider} />
              <Text variant="titleMedium">Solutions:</Text>
              <RadioButton.Group onValueChange={setChosenSolution} value={chosenSolution}>
                {solutions.map((sol, index) => (
                  <RadioButton.Item
                    key={index}
                    label={sol.solutionString || sol.SolutionString}
                    value={(index + 1).toString()}
                  />
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
          <Button
            mode="contained"
            onPress={() => router.replace('/main')}
            style={styles.doneButton}
            loading={isSolving}
            disabled={isSolving}
          >
            Got it!
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  console.log('✅ Rendering normal results (no problem)');

  // RENDER STATE 2: The game is solved and final results are available
  const players = gameResult.gamePlayers || 
                gameResult.GamePlayers || 
                gameResult.players || 
                gameResult.Players || 
                [];

// Try all possible property names for debts  
const debts = gameResult.gameDebts || 
              gameResult.GameDebts || 
              gameResult.debts || 
              gameResult.Debts || 
              [];

console.log('=== RENDER DEBUG ===');
console.log('Players array length:', players.length);
console.log('Debts array length:', debts.length);

if (players.length > 0) {
  console.log('Sample player:', players[0]);
}

return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="headlineLarge" style={styles.pageTitle}>Game Summary</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Player Stats</Text>
          
          {/* Debug info - remove this after fixing */}
          <Text style={{ fontSize: 10, color: 'gray', marginBottom: 10 }}>
            {players.length} players, {debts.length} debts
          </Text>
          
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title>Player</DataTable.Title>
              <DataTable.Title numeric>Buy-in</DataTable.Title>
              <DataTable.Title numeric>Cash-out</DataTable.Title>
              <DataTable.Title numeric>P/L</DataTable.Title>
            </DataTable.Header>

            {players.map((player, index) => {
              // Try all possible property name combinations
              const p = {
                name: player.playerName || player.PlayerName || player.name || player.Name || `Player ${index + 1}`,
                buyin: player.buyIn || player.BuyIn || player.buyin || player.Buyin || 0,
                cashout: player.cashOut || player.CashOut || player.cashout || player.Cashout || 0,
                pl: player.profitLoss || player.ProfitLoss || player.pl || player.PL || 
                    ((player.cashOut || player.CashOut || player.cashout || 0) - 
                     (player.buyIn || player.BuyIn || player.buyin || 0))
              };
              
              console.log(`Player ${index + 1} processed:`, p);
              
              return (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{p.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{p.buyin}</DataTable.Cell>
                  <DataTable.Cell numeric>{p.cashout}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={{ color: p.pl > 0 ? '#4CD964' : theme.colors.error }}>
                      {p.pl > 0 ? `+${p.pl}` : p.pl}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        </Card.Content>
      </Card>

      {debts.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Debts to Settle</Text>
            {debts.map((debt, index) => {
              const d = {
                debtor: debt.debtor || debt.Debtor || 'Unknown',
                creditor: debt.creditor || debt.Creditor || 'Unknown',
                amount: debt.amount || debt.Amount || 0,
              };
              return (
                <Text key={index} style={styles.debtText}>
                  - {d.debtor} owes {d.creditor} {d.amount}
                </Text>
              );
            })}
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={handleDone} style={styles.doneButton}>
        Done
      </Button>
    </ScrollView>
  </SafeAreaView>
)};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 15, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { textAlign: 'center', marginBottom: 20 },
  card: { marginVertical: 10 },
  table: { marginTop: 10 },
  doneButton: { marginTop: 20, paddingVertical: 8 },
  divider: { marginVertical: 15 },
  problemDescription: { marginBottom: 10, lineHeight: 22 },
  debtText: { fontSize: 16, marginTop: 5 },
});