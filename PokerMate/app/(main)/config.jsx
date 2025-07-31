import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button, Divider, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ConfigPage() {
  const router = useRouter();
  
  // State for our form inputs
  const [minTransfer, setMinTransfer] = useState('');
  const [currency, setCurrency] = useState('₪');
  const [minChip, setMinChip] = useState('');
  const [defaultTime, setDefaultTime] = useState('30');

  const handleSave = () => {
    // Logic to save the data will go here.
    // For now, we just log it and navigate back.
    console.log('Saving Config:', { minTransfer, currency, minChip, defaultTime });
    router.back(); // Go back to the previous screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Edit Config</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Solver</Text>
              <TextInput
                label="Minimum Transfer"
                value={minTransfer}
                onChangeText={setMinTransfer}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <Text variant="bodyLarge" style={styles.label}>Currency Type</Text>
              <Button mode="outlined" style={styles.spinnerButton} onPress={() => console.log('Open currency picker')}>
                {`Current: ${currency}`}
              </Button>
            </Card.Content>
          </Card>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Pot Split</Text>
              <TextInput
                label="Minimum Chip"
                value={minChip}
                onChangeText={setMinChip}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Time</Text>
              <TextInput
                label="Default Time (seconds)"
                value={defaultTime}
                onChangeText={setDefaultTime}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
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
    backgroundColor: '#fff',
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