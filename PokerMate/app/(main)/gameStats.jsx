// app/gameStats.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, DataTable, ActivityIndicator, useTheme, Divider } from 'react-native-paper';
import { GameHistoryService } from '../../utils/GameHistoryService';

export default function GameStatsPage() {
  const theme = useTheme();
  
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('Loading game statistics...');
      const gameStats = await GameHistoryService.getGameStats();
      console.log('Stats loaded:', gameStats);
      setStats(gameStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours > 0 ? `${wholeHours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing your games...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="headlineMedium" style={styles.noStatsText}>
            No statistics yet
          </Text>
          <Text variant="bodyLarge" style={[styles.noStatsSubtext, { color: theme.colors.onSurfaceVariant }]}>
            Play some games to see your statistics here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get top players by profit
  const topPlayers = Object.entries(stats.playerStats)
    .sort(([,a], [,b]) => b.totalProfit - a.totalProfit)
    .slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadStats(true)} />
        }
      >
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.pageTitle}>
            Game Statistics
          </Text>

          {/* Overview Stats */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>{stats.totalGames}</Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>Games Played</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>
                    {formatDuration(stats.totalHoursPlayed)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>Total Time</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>{stats.totalMoneyInPlay}</Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>Money in Play</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Records */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Records</Text>
              
              {stats.biggestWinner && (
                <View style={styles.recordItem}>
                  <Text variant="titleMedium" style={[styles.recordTitle, { color: theme.colors.tertiary }]}>
                    🏆 Biggest Single Win
                  </Text>
                  <Text variant="bodyLarge">{stats.biggestWinner.player}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    +{stats.biggestWinner.amount} on {formatDate(stats.biggestWinner.game.timestamp)}
                  </Text>
                </View>
              )}

              {stats.biggestLoser && (
                <View style={styles.recordItem}>
                  <Text variant="titleMedium" style={[styles.recordTitle, { color: theme.colors.error }]}>
                    💸 Biggest Single Loss
                  </Text>
                  <Text variant="bodyLarge">{stats.biggestLoser.player}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    -{stats.biggestLoser.amount} on {formatDate(stats.biggestLoser.game.timestamp)}
                  </Text>
                </View>
              )}

              {stats.highestPotGame && (
                <View style={styles.recordItem}>
                  <Text variant="titleMedium" style={styles.recordTitle}>
                    💰 Highest Pot Game
                  </Text>
                  <Text variant="bodyLarge">{stats.highestPotGame.totalPot}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {stats.highestPotGame.players.length} players on {formatDate(stats.highestPotGame.timestamp)}
                  </Text>
                </View>
              )}

              {stats.longestGame && (
                <View style={styles.recordItem}>
                  <Text variant="titleMedium" style={styles.recordTitle}>
                    ⏰ Longest Game
                  </Text>
                  <Text variant="bodyLarge">{formatDuration(stats.longestGame.gameDuration)}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    on {formatDate(stats.longestGame.timestamp)}
                  </Text>
                </View>
              )}

              {stats.favoriteLocation && (
                <View style={styles.recordItem}>
                  <Text variant="titleMedium" style={styles.recordTitle}>
                    📍 Favorite Location
                  </Text>
                  <Text variant="bodyLarge">{stats.favoriteLocation.location}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {stats.favoriteLocation.count} games played
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Top Players */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Top Players by Profit</Text>
              <DataTable style={styles.table}>
                <DataTable.Header>
                  <DataTable.Title>Player</DataTable.Title>
                  <DataTable.Title numeric>Games</DataTable.Title>
                  <DataTable.Title numeric>Win Rate</DataTable.Title>
                  <DataTable.Title numeric>Total P/L</DataTable.Title>
                </DataTable.Header>

                {topPlayers.map(([playerName, playerStats], index) => (
                  <DataTable.Row key={playerName}>
                    <DataTable.Cell>
                      <View style={styles.playerCell}>
                        <Text style={styles.playerRank}>#{index + 1}</Text>
                        <Text>{playerName}</Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{playerStats.gamesPlayed}</DataTable.Cell>
                    <DataTable.Cell numeric>{playerStats.winRate.toFixed(0)}%</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={{ 
                        color: playerStats.totalProfit >= 0 ? theme.colors.tertiary : theme.colors.error 
                      }}>
                        {playerStats.totalProfit >= 0 ? `+${playerStats.totalProfit}` : playerStats.totalProfit}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>

          {/* Recent Activity */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Recent Activity</Text>
              {stats.recentActivity.map((game, index) => (
                <View key={game.id} style={styles.recentGameItem}>
                  <View style={styles.recentGameHeader}>
                    <Text variant="titleMedium">{game.gameDetails.gameType}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDate(game.timestamp)}
                    </Text>
                  </View>
                  <Text variant="bodyMedium">
                    {game.players.length} players • Pot: {game.totalPot} • {formatDuration(game.gameDuration)}
                  </Text>
                  <View style={styles.recentGamePlayers}>
                    {game.players.slice(0, 3).map((player, pIndex) => (
                      <Text key={pIndex} style={[
                        styles.recentPlayerChip,
                        { 
                          backgroundColor: player.profitLoss >= 0 ? theme.colors.tertiary + '20' : theme.colors.error + '20',
                          color: player.profitLoss >= 0 ? theme.colors.tertiary : theme.colors.error
                        }
                      ]}>
                        {player.name} {player.profitLoss >= 0 ? `+${player.profitLoss}` : player.profitLoss}
                      </Text>
                    ))}
                    {game.players.length > 3 && (
                      <Text style={styles.morePlayersText}>+{game.players.length - 3} more</Text>
                    )}
                  </View>
                  {index < stats.recentActivity.length - 1 && <Divider style={styles.recentGameDivider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
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
  pageTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  noStatsText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noStatsSubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
    textAlign: 'center',
  },
  recordItem: {
    marginBottom: 16,
  },
  recordTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  table: {
    marginTop: 8,
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerRank: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 20,
  },
  recentGameItem: {
    marginBottom: 12,
  },
  recentGameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentGamePlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  recentPlayerChip: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  morePlayersText: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    opacity: 0.6,
  },
  recentGameDivider: {
    marginTop: 12,
  },
});