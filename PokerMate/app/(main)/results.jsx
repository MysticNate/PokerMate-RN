import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, DataTable, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

// This is our placeholder data for now.
// Later, this will be calculated from the data passed from the previous screen.
const MOCK_RESULTS = [
  { id: 1, name: 'Giora', buyin: 100, cashout: 350, pl: 250 },
  { id: 2, name: 'Nati', buyin: 200, cashout: 0, pl: -200 },
  { id: 3, name: 'Kuku', buyin: 100, cashout: 50, pl: -50 },
];

export default function ResultsPage() {
  const router = useRouter();

  const handleDone = () => {
    // Navigate back to the main menu, clearing the game creation history.
    router.replace('/main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
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

                {MOCK_RESULTS.map(player => (
                  <DataTable.Row key={player.id}>
                    <DataTable.Cell>{player.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{player.buyin}</DataTable.Cell>
                    <DataTable.Cell numeric>{player.cashout}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={{ color: player.pl >= 0 ? '#4CAF50' : '#F44336' }}>
                        {player.pl > 0 ? `+${player.pl}` : player.pl}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}

              </DataTable>
            </Card.Content>
          </Card>

          {/* We can add another card here for Game Info if needed */}
          {/* 
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Game Info</Text>
              <Text>Type: Texas Holdem</Text>
              <Text>Location: Home</Text>
            </Card.Content>
          </Card>
          */}

          <Button
            mode="contained"
            onPress={handleDone}
            style={styles.doneButton}
          >
            Done
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  table: {
    marginTop: 10,
  },
  doneButton: {
    marginTop: 40,
    paddingVertical: 8,
  },
});