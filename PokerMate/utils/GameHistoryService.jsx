// utils/GameHistoryService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_HISTORY_KEY = '@PokerMate:gameHistory';

export const GameHistoryService = {
  
  // Save a completed game to local storage
  async saveGame(gameResult, gameDetails, players) {
    try {
      console.log('Saving game to local storage...');
      
      // Create the game object
      const gameData = {
        id: Date.now(), // Unique ID based on timestamp
        timestamp: new Date().toISOString(),
        gameDetails: {
          gameType: gameDetails.gameType,
          gameStart: gameDetails.gameStart,
          gameEnd: gameDetails.gameEnd,
          location: gameDetails.location,
          note: gameDetails.gameNote,
        },
        players: players.map(p => ({
          name: p.name,
          buyIn: parseFloat(p.buyin) || 0,
          cashOut: parseFloat(p.cashout) || 0,
          profitLoss: (parseFloat(p.cashout) || 0) - (parseFloat(p.buyin) || 0),
        })),
        debts: gameResult.GameDebts?.map(d => ({
          debtor: d.Debtor,
          creditor: d.Creditor,
          amount: d.Amount,
        })) || [],
        totalPot: players.reduce((sum, p) => sum + (parseFloat(p.buyin) || 0), 0),
        gameDuration: this.calculateDuration(gameDetails.gameStart, gameDetails.gameEnd),
      };
      
      // Get existing games
      const existingGames = await this.getAllGames();
      
      // Add new game
      const updatedGames = [gameData, ...existingGames]; // Most recent first
      
      // Save back to storage
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updatedGames));
      
      console.log('Game saved successfully with ID:', gameData.id);
      return gameData.id;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  },

  // Get all saved games
  async getAllGames() {
    try {
      const gamesJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
      if (!gamesJson) return [];
      
      const games = JSON.parse(gamesJson);
      // Sort by timestamp (most recent first)
      return games.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error loading games:', error);
      return [];
    }
  },

  // Get game statistics
  async getGameStats() {
    try {
      const games = await this.getAllGames();
      
      if (games.length === 0) {
        return {
          totalGames: 0,
          totalHoursPlayed: 0,
          totalMoneyInPlay: 0,
          biggestWinner: null,
          biggestLoser: null,
          highestPotGame: null,
          longestGame: null,
          favoriteLocation: null,
          playerStats: {},
          recentActivity: [],
        };
      }

      // Calculate all stats
      const stats = {
        totalGames: games.length,
        totalHoursPlayed: games.reduce((sum, game) => sum + game.gameDuration, 0),
        totalMoneyInPlay: games.reduce((sum, game) => sum + game.totalPot, 0),
        biggestWinner: this.findBiggestWinner(games),
        biggestLoser: this.findBiggestLoser(games),
        highestPotGame: this.findHighestPotGame(games),
        longestGame: this.findLongestGame(games),
        favoriteLocation: this.findFavoriteLocation(games),
        playerStats: this.calculatePlayerStats(games),
        recentActivity: games.slice(0, 5), // Last 5 games
      };

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return null;
    }
  },

  // Helper functions for statistics
  findBiggestWinner(games) {
    let biggestWin = { amount: 0, player: null, game: null };
    
    games.forEach(game => {
      game.players.forEach(player => {
        if (player.profitLoss > biggestWin.amount) {
          biggestWin = {
            amount: player.profitLoss,
            player: player.name,
            game: game,
          };
        }
      });
    });
    
    return biggestWin.amount > 0 ? biggestWin : null;
  },

  findBiggestLoser(games) {
    let biggestLoss = { amount: 0, player: null, game: null };
    
    games.forEach(game => {
      game.players.forEach(player => {
        if (Math.abs(player.profitLoss) > biggestLoss.amount && player.profitLoss < 0) {
          biggestLoss = {
            amount: Math.abs(player.profitLoss),
            player: player.name,
            game: game,
          };
        }
      });
    });
    
    return biggestLoss.amount > 0 ? biggestLoss : null;
  },

  findHighestPotGame(games) {
    return games.reduce((highest, game) => 
      game.totalPot > (highest?.totalPot || 0) ? game : highest, null);
  },

  findLongestGame(games) {
    return games.reduce((longest, game) => 
      game.gameDuration > (longest?.gameDuration || 0) ? game : longest, null);
  },

  findFavoriteLocation(games) {
    const locationCounts = {};
    games.forEach(game => {
      if (game.gameDetails.location) {
        locationCounts[game.gameDetails.location] = (locationCounts[game.gameDetails.location] || 0) + 1;
      }
    });
    
    return Object.entries(locationCounts).reduce((favorite, [location, count]) => 
      count > (favorite?.count || 0) ? { location, count } : favorite, null);
  },

  calculatePlayerStats(games) {
    const playerStats = {};
    
    games.forEach(game => {
      game.players.forEach(player => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = {
            gamesPlayed: 0,
            totalProfit: 0,
            totalWinnings: 0,
            totalLosses: 0,
            biggestWin: 0,
            biggestLoss: 0,
            winRate: 0,
          };
        }
        
        const stats = playerStats[player.name];
        stats.gamesPlayed++;
        stats.totalProfit += player.profitLoss;
        
        if (player.profitLoss > 0) {
          stats.totalWinnings += player.profitLoss;
          stats.biggestWin = Math.max(stats.biggestWin, player.profitLoss);
        } else if (player.profitLoss < 0) {
          stats.totalLosses += Math.abs(player.profitLoss);
          stats.biggestLoss = Math.max(stats.biggestLoss, Math.abs(player.profitLoss));
        }
        
        // Calculate win rate (games with positive profit / total games)
        const winningGames = games.filter(g => 
          g.players.find(p => p.name === player.name && p.profitLoss > 0)
        ).length;
        stats.winRate = (winningGames / stats.gamesPlayed) * 100;
      });
    });
    
    return playerStats;
  },

  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    return durationMs / (1000 * 60 * 60); // Return hours as decimal
  },

  // Clear all game history (for testing or reset)
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(GAME_HISTORY_KEY);
      console.log('Game history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },

  // Delete a specific game
  async deleteGame(gameId) {
    try {
      const games = await this.getAllGames();
      const updatedGames = games.filter(game => game.id !== gameId);
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updatedGames));
      console.log('Game deleted:', gameId);
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  },
};