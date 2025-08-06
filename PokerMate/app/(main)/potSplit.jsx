import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext'; 

export default function PotSplitPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // Pot states
  const [mainPotValue, setMainPotValue] = useState('');
  const [mainPotPlayers, setMainPotPlayers] = useState('');
  const [sidePots, setSidePots] = useState([]);
  
  
  const [minChip, setMinChip] = useState('1'); // Default minimum chip value
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const sidePotIdCounter = useRef(0);

  // Load minChip from storage when page loads
  useEffect(() => {
    const loadMinChip = async () => {
      try {
        const configJson = await AsyncStorage.getItem('@PokerSolver:config');
        if (configJson) {
          const config = JSON.parse(configJson);
          if (config.minChip) {
            setMinChip(config.minChip);
          }
        }
      } catch (e) {
        // Use default
      } finally {
        setIsLoading(false);
      }
    };
    loadMinChip();
  }, []);
  
  const handleCalculate = async () => {
    setIsCalculating(true);
    const API_URL = 'http://PokerMate.somee.com/api';

    const requestBody = {
      mainPot: {
        value: Number(mainPotValue) || 0,
        players: Number(mainPotPlayers) || 0,
      },
      sidePots: sidePots.map(p => ({
        value: Number(p.value) || 0,
        players: Number(p.players) || 0,
      })),
      minimumChip: Number(minChip) || 1,
    };
    
    try {
      const response = await fetch(`${API_URL}/potsplit/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const resultData = await response.json();

      if (!response.ok) {
        // If server sent a validation error (400 Bad Request)
        Alert.alert('Validation Error', resultData.title || resultData.message || 'Invalid input.');
        return;
      }
      
      // If successful, navigate to the results page with the calculated data
      router.push({
        pathname: '/resultPotSplit',
        params: { data: JSON.stringify(resultData) }
      });

    } catch (e) {
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setIsCalculating(false);
    }
  };

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
  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  

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
            loading={isCalculating} // Show spinner when calculating
            disabled={isCalculating}
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