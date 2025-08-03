import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. IMPORT

const CONFIG_STORAGE_KEY = '@PokerSolver:config'; // A unique key for our data

export default function ConfigPage() {
  const router = useRouter();
  
  // State for our form inputs
  const [minTransfer, setMinTransfer] = useState('');
  const [currency, setCurrency] = useState('₪');
  const [minChip, setMinChip] = useState('');
  const [defaultTime, setDefaultTime] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  // 2. LOAD settings when the component mounts
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
        if (jsonValue != null) {
          const savedConfig = JSON.parse(jsonValue);
          setMinTransfer(savedConfig.minTransfer || '');
          setCurrency(savedConfig.currency || '₪');
          setMinChip(savedConfig.minChip || '');
          setDefaultTime(savedConfig.defaultTime || '30');
        }
      } catch (e) {
        Alert.alert("Error", "Failed to load config.");
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []); // The empty array [] means this runs only once on mount

  // 3. SAVE settings when the button is pressed
  const handleSave = async () => {
    try {
      const config = { minTransfer, currency, minChip, defaultTime };
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, jsonValue);
      Alert.alert("Success", "Configuration saved!");
      router.back(); // Go back to the previous screen
    } catch (e) {
      Alert.alert("Error", "Failed to save config.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading configuration...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Edit Config</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Solver</Text>
              <TextInput label="Minimum Transfer" value={minTransfer} onChangeText={setMinTransfer} keyboardType="numeric" mode="outlined" style={styles.input} />
              <Text variant="bodyLarge" style={styles.label}>Currency Type</Text>
              <Button mode="outlined" style={styles.spinnerButton} onPress={() => Alert.alert("Coming Soon", "Currency picker will be implemented.")}>
                {`Current: ${currency}`}
              </Button>
            </Card.Content>
          </Card>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Pot Split</Text>
              <TextInput label="Minimum Chip" value={minChip} onChangeText={setMinChip} keyboardType="numeric" mode="outlined" style={styles.input} />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Time</Text>
              <TextInput label="Default Time (seconds)" value={defaultTime} onChangeText={setDefaultTime} keyboardType="numeric" mode="outlined" style={styles.input} />
            </Card.Content>
          </Card>

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Save Config
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
    padding: 20,
  },
  pageTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginVertical: 10,
  },
  input: {
    marginTop: 10,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    color: 'gray',
  },
  spinnerButton: {
    justifyContent: 'flex-start',
    paddingVertical: 5,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});