// app/gameHistory.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, DataTable, Divider, ActivityIndicator, Button, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameHistoryService } from '../../utils/GameHistoryService';

export default function GameHistoryPage() {
  const router = useRouter();
  const theme = useTheme();
  
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGameHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('Loading game history from local storage...');
      const gameHistory = await GameHistoryService.getAllGames();
      console.log(`Found ${gameHistory.length} games`);
      setGames(gameHistory);
    } catch (error) {
      console.error('Error loading game history:', error);
      Alert.alert('Error', 'Failed to load game history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadGameHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours > 0 ? `${wholeHours}h ${minutes}m` : `${minutes}m`;
  };

  const handleDeleteGame = async (gameId) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await GameHistoryService.deleteGame(gameId);
              await loadGameHistory(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete game');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading game history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (games.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          contentContainerStyle={styles.center}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadGameHistory(true)} />
          }
        >
          <Text variant="headlineMedium" style={styles.noGamesText}>
            No games yet
          </Text>
          <Text variant="bodyLarge" style={[styles.noGamesSubtext, { color: theme.colors.onSurfaceVariant }]}>
            Your solved games will appear here
          </Text>
          <Button 
            mode="contained" 
            onPress={() => router.push('/recordGame')}
            style={styles.startGameButton}
          >
            Start Your First Game
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadGameHistory(true)} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.pageTitle}>
              Game History
            </Text>
            <Button 
              mode="outlined" 
              icon="chart-bar"
              onPress={() => router.push('/gameStats')}
              style={styles.statsButton}
            >
              View Stats
            </Button>
          </View>
          
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {games.length} game{games.length !== 1 ? 's' : ''} played
          </Text>

          {games.map((game, index) => (
            <Card key={game.id} style={styles.gameCard} elevation={2}>
              <Card.Content>
                {/* Game Header */}
                <View style={styles.gameHeader}>
                  <View>
                    <Text variant="titleLarge" style={styles.gameTitle}>
                      {game.gameDetails.gameType || 'Poker Game'}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Game #{games.length - index}
                    </Text>
                  </View>
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    size={20}
                    onPress={() => handleDeleteGame(game.id)}
                  />
                </View>

                {/* Game Info */}
                <View style={styles.gameInfo}>
                  <Text variant="bodyMedium">
                    📅 {formatDate(game.timestamp)}
                  </Text>
                  <Text variant="bodyMedium">
                    ⏱️ Duration: {formatDuration(game.gameDuration)}
                  </Text>
                  <Text variant="bodyMedium">
                    💰 Total Pot: {game.totalPot}
                  </Text>
                  {game.gameDetails.location && (
                    <Text variant="bodyMedium">
                      📍 {game.gameDetails.location}
                    </Text>
                  )}
                </View>

                {game.gameDetails.note && (
                  <View style={styles.noteSection}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Note: {game.gameDetails.note}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Players Table */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Players ({game.players.length})
                </Text>
                
                <DataTable style={styles.table}>
                  <DataTable.Header>
                    <DataTable.Title>Player</DataTable.Title>
                    <DataTable.Title numeric>Buy-in</DataTable.Title>
                    <DataTable.Title numeric>Cash-out</DataTable.Title>
                    <DataTable.Title numeric>P/L</DataTable.Title>
                  </DataTable.Header>

                  {game.players.map((player, playerIndex) => (
                    <DataTable.Row key={`${game.id}-player-${playerIndex}`}>
                      <DataTable.Cell>{player.name}</DataTable.Cell>
                      <DataTable.Cell numeric>{player.buyIn}</DataTable.Cell>
                      <DataTable.Cell numeric>{player.cashOut}</DataTable.Cell>
                      <DataTable.Cell numeric>
                        <Text style={{ 
                          color: player.profitLoss >= 0 ? theme.colors.tertiary : theme.colors.error 
                        }}>
                          {player.profitLoss >= 0 ? `+${player.profitLoss}` : player.profitLoss}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>

                {/* Debts Section */}
                {game.debts && game.debts.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Debts to Settle
                    </Text>
                    {game.debts.map((debt, debtIndex) => (
                      <Text key={`${game.id}-debt-${debtIndex}`} style={styles.debtText}>
                        💸 {debt.debtor} owes {debt.creditor} {debt.amount}
                      </Text>
                    ))}
                  </>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageTitle: {
    fontWeight: 'bold',
  },
  statsButton: {
    minWidth: 120,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  noGamesText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noGamesSubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  startGameButton: {
    marginTop: 16,
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameTitle: {
    fontWeight: 'bold',
  },
  gameInfo: {
    marginBottom: 8,
  },
  noteSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  table: {
    marginBottom: 8,
  },
  debtText: {
    fontSize: 14,
    marginTop: 4,
  },
});