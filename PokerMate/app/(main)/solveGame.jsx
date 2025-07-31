import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

// This is a single row for a player
function PlayerRow({ player, onPlayerChange, onDelete, canDelete }) {
  return (
    <Card style={styles.playerCard}>
      <Card.Content style={styles.playerRow}>
        <TextInput
          label="Name"
          value={player.name}
          onChangeText={(text) => onPlayerChange(player.id, 'name', text)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="BuyIn"
          value={player.buyin}
          onChangeText={(text) => onPlayerChange(player.id, 'buyin', text)}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Cashout"
          value={player.cashout}
          onChangeText={(text) => onPlayerChange(player.id, 'cashout', text)}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <IconButton
          icon="delete-circle"
          iconColor={useTheme().colors.error}
          size={30}
          onPress={() => onDelete(player.id)}
          disabled={!canDelete} // Disable button if we can't delete
        />
      </Card.Content>
    </Card>
  );
}


export default function SolveGamePage() {
  const router = useRouter();
  
  // Use a ref to keep a consistent, non-rendering ID counter
  const playerIdCounter = useRef(2); 

  // Initial state with two default players
  const [players, setPlayers] = useState([
    { id: 1, name: '', buyin: '', cashout: '' },
    { id: 2, name: '', buyin: '', cashout: '' },
  ]);

  const handlePlayerChange = (id, field, value) => {
    setPlayers(currentPlayers => 
      currentPlayers.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleAddPlayer = () => {
    playerIdCounter.current += 1;
    const newPlayer = { id: playerIdCounter.current, name: '', buyin: '', cashout: '' };
    setPlayers(currentPlayers => [...currentPlayers, newPlayer]);
  };

  const handleDeletePlayer = (id) => {
    // Prevent deleting if only two players are left
    if (players.length <= 2) {
      return; 
    }
    setPlayers(currentPlayers => currentPlayers.filter(p => p.id !== id));
  };
  
  const handleSolve = () => {
    // Later, we'll pass the 'players' array to the results page
    console.log("Solving with players:", players);
    router.push('/results');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Add Players</Text>
          
          {players.map(player => (
            <PlayerRow
              key={player.id}
              player={player}
              onPlayerChange={handlePlayerChange}
              onDelete={handleDeletePlayer}
              canDelete={players.length > 2} // Pass down whether deletion is allowed
            />
          ))}
          
          <Button
            mode="contained-tonal"
            icon="plus"
            onPress={handleAddPlayer}
            style={styles.addButton}
          >
            Add Player
          </Button>

          <Button
            mode="contained"
            onPress={handleSolve}
            style={styles.solveButton}
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
    flex: 1,
  },
  content: {
    padding: 15,
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  playerCard: {
    marginVertical: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1, // Make inputs take up available space
    marginHorizontal: 4,
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
  solveButton: {
    marginTop: 40,
    paddingVertical: 8,
  },
});