import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResultPotSplitPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // 1. Get the parameters from the URL
  const params = useLocalSearchParams();
  
  // 2. Create state to hold our calculated results
  const [results, setResults] = useState(null);

  useEffect(() => {
    // 3. This effect runs when the page loads
    if (params.data) {
      const potData = JSON.parse(params.data);
      const calculatedResults = {
        mainPot: null,
        sidePots: [],
      };

      // --- Calculate Main Pot ---
      const mainValue = Number(potData.mainPot.value) || 0;
      const mainPlayers = Number(potData.mainPot.players) || 1;
      calculatedResults.mainPot = {
        potValue: mainValue,
        players: mainPlayers,
        pprm: Math.floor(mainValue / mainPlayers), // Pot Per Player
        remainder: mainValue % mainPlayers,
      };

      // --- Calculate Side Pots ---
      potData.sidePots.forEach((pot, index) => {
        const sideValue = Number(pot.value) || 0;
        const sidePlayers = Number(pot.players) || 1;
        calculatedResults.sidePots.push({
          id: pot.id,
          potName: `Side Pot ${index + 1}`,
          potValue: sideValue,
          players: sidePlayers,
          pprm: Math.floor(sideValue / sidePlayers),
          remainder: sideValue % sidePlayers,
        });
      });
      
      setResults(calculatedResults);
    }
  }, [params.data]); // Re-run if the data changes


  const handleDone = () => {
    router.replace('/main');
  };
  
  const RemainderMessage = ({ remainder }) => {
    if (remainder <= 0) return null;
    return (
      <View style={[styles.remainderBox, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant="bodyLarge">Heads up! There is a remainder of {remainder}.</Text>
      </View>
    );
  };

  // 4. If results haven't been calculated yet, show a loading or empty state
  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Calculating results...</Text>
      </SafeAreaView>
    );
  }

  // 5. Render the calculated results
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Pot Results</Text>
          
          <Card style={styles.card}>
            <Card.Title title="Main Pot" />
            <Card.Content>
              <Text style={styles.resultText}>Main Pot: {results.mainPot.potValue}</Text>
              <Text style={styles.resultText}>Players: {results.mainPot.players}</Text>
              <Divider style={styles.divider} />
              <Text style={styles.finalResult}>Each Player gets {results.mainPot.pprm}</Text>
              <RemainderMessage remainder={results.mainPot.remainder} />
            </Card.Content>
          </Card>
          
          {results.sidePots.map(pot => (
            <Card key={pot.id} style={styles.card}>
              <Card.Title title={pot.potName} />
              <Card.Content>
                <Text style={styles.resultText}>{pot.potName}: {pot.potValue}</Text>
                <Text style={styles.resultText}>Players: {pot.players}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.finalResult}>Each Player gets {pot.pprm}</Text>
                <RemainderMessage remainder={pot.remainder} />
              </Card.Content>
            </Card>
          ))}
          
          <Button mode="contained" onPress={handleDone} style={styles.doneButton}>
            Done
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles are unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginVertical: 10,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 12,
  },
  finalResult: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainderBox: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  doneButton: {
    marginTop: 40,
    paddingVertical: 8,
  },
});