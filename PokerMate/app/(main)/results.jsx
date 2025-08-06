import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, DataTable, Card, Button, RadioButton, ActivityIndicator, useTheme, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

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

  useEffect(() => {
    // This runs once when the page loads, setting the initial state
    if (params.result) {
      setGameResult(JSON.parse(params.result));
    }
    if (params.originalRequest) {
      setOriginalRequest(JSON.parse(params.originalRequest));
    }
  }, [params]);

  const handleApplySolution = async () => {
    if (!chosenSolution) {
      Alert.alert("Selection Required", "Please choose a solution to apply.");
      return;
    }
    setIsSolving(true);

    const secondRequestBody = {
      ...originalRequest,
      solutionChoice: chosenSolution,
      problematicGame: gameResult, // Send back the entire problematic game object
    };
    
    try {
      const response = await fetch(`${API_URL}/games/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(secondRequestBody),
      });

      const finalResultData = await response.json();
      if (!response.ok) {
        throw new Error(finalResultData.message || "Failed to apply the solution.");
      }

      // Success. Update the state with the final, solved result.
      setGameResult(finalResultData);
      setOriginalRequest(null); // Clear the original request as we are done

    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSolving(false);
    }
  };

  const handleDone = () => {
    router.replace('/(main)/main');
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
              <Text variant="titleMedium">Please choose a suggested solution:</Text>
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
            onPress={handleApplySolution}
            style={styles.doneButton}
            loading={isSolving}
            disabled={isSolving}
          >
            Apply Solution
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // RENDER STATE 2: The game is solved and final results are available
  const players = gameResult.gamePlayers || gameResult.GamePlayers || [];
  const debts = gameResult.gameDebts || gameResult.GameDebts || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineLarge" style={styles.pageTitle}>Game Summary</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Player Stats</Text>
            <DataTable style={styles.table}>
              <DataTable.Header>
                <DataTable.Title>Player</DataTable.Title>
                <DataTable.Title numeric>Buy-in</DataTable.Title>
                <DataTable.Title numeric>Cash-out</DataTable.Title>
                <DataTable.Title numeric>P/L</DataTable.Title>
              </DataTable.Header>

              {players.map((player, index) => {
                const p = { // Normalize properties to avoid case issues
                  name: player.playerName || player.PlayerName,
                  buyin: player.buyIn || player.BuyIn,
                  cashout: player.cashOut || player.CashOut,
                  pl: player.profitLoss || player.ProfitLoss,
                };
                return (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{p.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{p.buyin}</DataTable.Cell>
                    <DataTable.Cell numeric>{p.cashout}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={{ color: p.pl >= 0 ? theme.colors.tertiary : theme.colors.error }}>
                        {p.pl >= 0 ? `+${p.pl}` : p.pl}
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
                const d = { // Normalize properties
                  debtor: debt.debtor || debt.Debtor,
                  creditor: debt.creditor || debt.Creditor,
                  amount: debt.amount || debt.Amount,
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
  );
}

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