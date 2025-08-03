import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function PotSplitPage() {
  const router = useRouter();

  // State for the main pot
  const [mainPotValue, setMainPotValue] = useState('');
  const [mainPotPlayers, setMainPotPlayers] = useState('');

  // State for the side pots array
  const [sidePots, setSidePots] = useState([]);
  const sidePotIdCounter = useRef(0);

  const handleAddPot = () => {
    sidePotIdCounter.current += 1;
    const newPot = { id: sidePotIdCounter.current, value: '', players: '' };
    setSidePots(currentPots => [...currentPots, newPot]);
  };

  const handleDeletePot = (id) => {
    setSidePots(currentPots => currentPots.filter(p => p.id !== id));
  };
  
  const handleSidePotChange = (id, field, text) => {
    setSidePots(currentPots =>
      currentPots.map(p => 
        p.id === id ? { ...p, [field]: text } : p
      )
    );
  };

  const handleCalculate = () => {
    // 1. Create a data object with all the state
    const potData = {
      mainPot: {
        value: mainPotValue,
        players: mainPotPlayers,
      },
      sidePots: sidePots,
    };

    // 2. Navigate to the results page, passing the data as a string
    router.push({
      pathname: '/resultPotSplit',
      params: { data: JSON.stringify(potData) } // 'data' is the key, value is the string
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>ChipChop</Text>
          
          <Card style={styles.card}>
            <Card.Title title="Main Pot" />
            <Card.Content style={styles.potRow}>
              <TextInput
                label="Main Pot Value"
                value={mainPotValue}
                onChangeText={setMainPotValue}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Players"
                value={mainPotPlayers}
                onChangeText={setMainPotPlayers}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            </Card.Content>
          </Card>
          
          {sidePots.map((pot, index) => (
            <Card key={pot.id} style={styles.card}>
              <Card.Title 
                title={`Side Pot ${index + 1}`}
                right={(props) => (
                  <IconButton {...props} icon="delete" onPress={() => handleDeletePot(pot.id)} />
                )}
              />
              <Card.Content style={styles.potRow}>
                <TextInput
                  label="Side Pot Value"
                  value={pot.value}
                  onChangeText={(text) => handleSidePotChange(pot.id, 'value', text)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Players"
                  value={pot.players}
                  onChangeText={(text) => handleSidePotChange(pot.id, 'players', text)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained-tonal"
            icon="plus-circle-outline"
            onPress={handleAddPot}
            style={styles.addButton}
          >
            Add Side Pot
          </Button>

          <Button
            mode="contained"
            onPress={handleCalculate}
            style={styles.calculateButton}
          >
            Split Pots
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
    marginVertical: 8,
  },
  potRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10, // Adds space between the two inputs
  },
  input: {
    flex: 1,
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
  calculateButton: {
    marginTop: 40,
    paddingVertical: 8,
  },
});