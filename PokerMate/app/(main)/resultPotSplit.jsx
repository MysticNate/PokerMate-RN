import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResultPotSplitPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // Get the parameters from the URL
  const params = useLocalSearchParams();
  
  // State will now hold the array of PotResult objects directly
  const [potResults, setPotResults] = useState([]);

  useEffect(() => {
    // This effect runs when the page loads
    if (params.data) {
      try {
        // The data is now a direct array of results from the server
        const resultsFromServer = JSON.parse(params.data);
        setPotResults(resultsFromServer);
      } catch (e) {
        console.error("Failed to parse results data:", e);
        // Handle error, maybe navigate back or show a message
      }
    }
  }, [params.data]);


  const handleDone = () => {
    router.replace('/(main)/main');
  };
  
  const RemainderMessage = ({ remainder }) => {
    // The property name from C#: 'remainder'
    const remainderValue = remainder || 0;
    if (remainderValue <= 0) return null;
    
    return (
      <View style={[styles.remainderBox, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant="bodyLarge">Heads up! There is a remainder of {remainderValue}.</Text>
      </View>
    );
  };

  // If results haven't loaded yet
  if (potResults.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator animating={true} size="large" />
      </SafeAreaView>
    );
  }

  // Render the results by mapping over the array
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>Pot Results</Text>
          
          {potResults.map((pot, index) => (
            <Card key={index} style={styles.card}>
              <Card.Title title={pot.potName || pot.PotName} /> 
              <Card.Content>
                <Text style={styles.resultText}>Pot Value: {pot.potAmount || pot.PotAmount}</Text>
                <Text style={styles.resultText}>Players: {pot.playerAmount || pot.PlayerAmount}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.finalResult}>Each Player gets: {pot.ppr || pot.PPR}</Text>
                <RemainderMessage remainder={pot.remainder || pot.Remainder} />
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
    justifyContent: 'center',
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