import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

// UPDATED MOCK DATA: Removed 'remainderOwedTo'
const MOCK_POT_RESULTS = {
  mainPot: {
    potValue: 1000,
    players: 5,
    pprm: 200,
    remainder: 0,
  },
  sidePots: [
    {
      id: 1,
      potName: 'Side Pot 1',
      potValue: 255,
      players: 3,
      pprm: 85,
      remainder: 0,
    },
    {
      id: 2,
      potName: 'Side Pot 2',
      potValue: 102,
      players: 2,
      pprm: 50,
      remainder: 2, // There is a remainder of 2
    },
  ],
};


export default function ResultPotSplitPage() {
  const router = useRouter();
  const theme = useTheme();

  const handleDone = () => {
    router.replace('/main');
  };
  
  // UPDATED HELPER COMPONENT: Simplified message
  const RemainderMessage = ({ remainder }) => {
    // If there's no remainder, don't render anything
    if (remainder <= 0) return null;
    
    return (
      <View style={[styles.remainderBox, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant="bodyLarge">Heads up! There is a remainder of {remainder}.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Pot Results</Text>
          
          {/* Main Pot Result Card */}
          <Card style={styles.card}>
            <Card.Title title="Main Pot" />
            <Card.Content>
              <Text style={styles.resultText}>Main Pot: {MOCK_POT_RESULTS.mainPot.potValue}</Text>
              <Text style={styles.resultText}>Players: {MOCK_POT_RESULTS.mainPot.players}</Text>
              <Divider style={styles.divider} />
              <Text style={styles.finalResult}>Each Player gets {MOCK_POT_RESULTS.mainPot.pprm}</Text>
              <RemainderMessage 
                remainder={MOCK_POT_RESULTS.mainPot.remainder} 
              />
            </Card.Content>
          </Card>
          
          {/* Side Pot Result Cards */}
          {MOCK_POT_RESULTS.sidePots.map(pot => (
            <Card key={pot.id} style={styles.card}>
              <Card.Title title={pot.potName} />
              <Card.Content>
                <Text style={styles.resultText}>{pot.potName}: {pot.potValue}</Text>
                <Text style={styles.resultText}>Players: {pot.players}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.finalResult}>Each Player gets {pot.pprm}</Text>
                <RemainderMessage 
                  remainder={pot.remainder} 
                />
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