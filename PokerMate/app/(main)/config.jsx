import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. IMPORT

const CONFIG_STORAGE_KEY = '@PokerSolver:config'; // A unique key for our data

export default function ConfigPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // State for our form inputs
  const [minTransfer, setMinTransfer] = useState('');
  const [currency, setCurrency] = useState('₪');
  const [minChip, setMinChip] = useState('0.25');
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
          setMinChip(savedConfig.minChip || '0.25');
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge" style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading configuration...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineLarge" style={[styles.pageTitle, { color: theme.colors.text }]}>
                Settings
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Configure your preferences
              </Text>
            </View>

            {/* Solver Settings */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Game Solver
                </Text>
                <TextInput 
                  label="Minimum Transfer" 
                  value={minTransfer} 
                  onChangeText={setMinTransfer} 
                  keyboardType="numeric" 
                  mode="outlined" 
                  style={styles.input}
                  contentStyle={{ color: theme.colors.text }}
                />
                <View style={styles.currencySection}>
                  <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Currency Type
                  </Text>
                  <Button 
                    mode="outlined" 
                    style={[styles.currencyButton, { borderColor: theme.colors.outline }]}
                    textColor={theme.colors.onSurface}
                    contentStyle={styles.currencyButtonContent}
                    onPress={() => Alert.alert("Coming Soon", "T be implemented.")}
                  >
                    {`Current: ${currency}`}
                  </Button>
                </View>
              </Card.Content>
            </Card>
            
            {/* Pot Split Settings */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Pot Split
                </Text>
                <TextInput 
                  label="Minimum Chip" 
                  value={minChip} 
                  onChangeText={setMinChip} 
                  keyboardType="numeric" 
                  mode="outlined" 
                  style={styles.input}
                  contentStyle={{ color: theme.colors.text }}
                />
              </Card.Content>
            </Card>

            {/* Timer Settings */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Timer
                </Text>
                <TextInput 
                  label="Default Time (seconds)" 
                  value={defaultTime} 
                  onChangeText={setDefaultTime} 
                  keyboardType="numeric" 
                  mode="outlined" 
                  style={styles.input}
                  contentStyle={{ color: theme.colors.text }}
                />
              </Card.Content>
            </Card>

            {/* Save Button */}
            <Button 
              mode="contained" 
              onPress={handleSave} 
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.saveButtonContent}
              labelStyle={styles.saveButtonLabel}
            >
              Save Settings
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  pageTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  currencySection: {
    marginTop: 8,
  },
  label: {
    marginBottom: 8,
    opacity: 0.8,
  },
  currencyButton: {
    borderRadius: 8,
  },
  currencyButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});