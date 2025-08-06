using Microsoft.AspNetCore.Mvc;
using PokerMateWebAPI.Solver.Classes;

namespace PokerMateWebAPI.Solver.Util
{
    public static class FuncHelper
    {

        // WAYPOINT: Pot Calc Functions
        public static PotResult[] AnalyzePotsString(string stats, double minGameChip)
        {
            string[] potsStrings = stats.Split(',');
            int potCounter = 0;
            PotResult[] potsToReturn = new PotResult[0];

            for (int i = 0; i < potsStrings.Length; i++)
            {
                // Order strings
                string[] potStatsTest = TrimWordsInString(potsStrings[i]);

                // Check if length is correct, else get a proper length
                // If blank ',   ' is put into the string, skip it.
                if (potStatsTest.Length == 0) continue;

                // Set variables for the stats we need and reset them every time
                double potSize = Convert.ToDouble(potStatsTest[0]);
                int players = Convert.ToInt32(potStatsTest[1]);

                string potSplit = SplitThatPot(potSize, players, minGameChip);

                double chipsPerPlayer = Convert.ToDouble(potSplit.Split(',')[0]);
                double remainder = Convert.ToDouble(potSplit.Split(',')[1]);

                // This variable will be used to count the pots and display a proper name of the pot
                potCounter++;

                string potName = "";

                if (potCounter == 1) potName = "MAIN POT";
                else potName = $"Side pot {potCounter - 1}";


                // [X] Create the pot
                PotResult newPot = new PotResult(potName, potSize, players, chipsPerPlayer, remainder);
                // [X] Add to the array 
                potsToReturn = AddOneToArray(potsToReturn);
                potsToReturn[potsToReturn.Length - 1] = newPot;
            }
            return potsToReturn;
        }

        static string SplitThatPot(double potValue, int playerForSplit, double minGameChip)
        {
            double remainder = 0;
            while (potValue / playerForSplit % minGameChip != 0)
            {
                remainder += minGameChip;
                potValue -= minGameChip;
                if (potValue <= 0) return "0,0";
            }

            return $"{potValue / playerForSplit},{remainder}";
        }



        // WAYPOINT: Game Solver Functions













        // WAYPOINT: Game Solver UTIL Functions
        public static List<GamePlayers> GetPlayersFromString(string gameString)
        {
            List<GamePlayers> players = new List<GamePlayers>();

            string[] gameStringSplit = gameString.Split(",");

            for (int i = 0; i < gameStringSplit.Length; i++) // "Name Buyin Cashout"
            {
                if (gameStringSplit[i].Trim() == "" || gameStringSplit[i] == null) continue;

                string[] gameStringSplitTrim = TrimWordsInString(gameStringSplit[i]);

                GamePlayers p = new GamePlayers(gameStringSplitTrim[0], Convert.ToDouble(gameStringSplitTrim[1]), Convert.ToDouble(gameStringSplitTrim[2]));
                players.Add(p);
            }
            return players;
        }

        public static List<GamePlayers> AddHourlyRate(List<GamePlayers> players, DateTime gameStart, DateTime gameEnd)
        {
            TimeSpan duration = gameEnd - gameStart;
            double durationHours = duration.TotalHours;

            foreach (GamePlayers p in players)
            {
                double hourlyRate = durationHours > 0 ? p.ProfitLoss / durationHours : 0;
                // Set GainPerHour using C# property
                p.GainPerHour = Math.Round(hourlyRate, 2); // Round to the second decimal point
            }

            return players;
        }

        public static List<GamePlayers> SortPlayers(List<GamePlayers> players, bool winnersAtTop)
        {
            List<GamePlayers> playersClone = new List<GamePlayers>(players);
            List<GamePlayers> sorted = new List<GamePlayers>();

            while (playersClone.Count != 0)
            {
                if (winnersAtTop)
                {
                    // Find largest value (P/L)
                    double? bigW = FindMaxPorL(playersClone, true);
                    GamePlayers? temp = null;
                    int toRemove = 0;
                    // Go over the list and RemoveAt the player
                    for (int i = 0; i < playersClone.Count; i++)
                    {
                        if (playersClone[i].ProfitLoss == bigW)
                        {
                            temp = playersClone[i];
                            toRemove = i;
                            break;
                        }
                    }
                    playersClone.RemoveAt(toRemove);
                    if (temp != null) sorted.Add(temp);
                }
                else
                {
                    // Find largest value (P/L)
                    double? bigL = FindMaxPorL(playersClone, false);
                    GamePlayers? temp = null;
                    int toRemove = 0;
                    // Go over the list and RemoveAt the player
                    for (int i = 0; i < playersClone.Count; i++)
                    {
                        if (playersClone[i].ProfitLoss == bigL)
                        {
                            temp = playersClone[i];
                            toRemove = i;
                            break;
                        }
                    }
                    playersClone.RemoveAt(toRemove);
                    if (temp != null) sorted.Add(temp);
                }
            }

            return sorted;
        }
        public static double? FindMaxPorL(List<GamePlayers> players, bool maxWin)
        {
            double? v = null;

            if (maxWin)
            {
                // Find largest value (P/L)
                for (int i = 0; i < players.Count; i++)
                {
                    if (i == 0)
                    {
                        v = players[i].ProfitLoss;
                        continue;
                    }
                    if (players[i].ProfitLoss > v) v = players[i].ProfitLoss;
                }
            }
            else
            {
                // Find smallest value (P/L)
                for (int i = 0; i < players.Count; i++)
                {
                    if (i == 0)
                    {
                        v = players[i].ProfitLoss;
                        continue;
                    }
                    if (players[i].ProfitLoss < v) v = players[i].ProfitLoss;
                }
            }
            return v;
        }


        // IMPORTANT: Base solver func
        public static GameResult AnalyzeGameString(string userID, int userGameID, string type, string gameString, DateTime gameStart, DateTime gameEnd, string userNote, string AINote, string location, double minTransfer, string[] priorityPlayers, string solutionAnswer, GameResult problematicGame)
        {
            GameResult gameResult = null;
            if (problematicGame != null)
            {
                gameResult = problematicGame;
            }
            else
            {
                gameResult = new GameResult(userID, userGameID, type, gameStart, gameEnd, new DateTime(), location, null, gameString, userNote, AINote, 0);
            }

            // TODO
            // Check for problems 
            // Return a Problem object with possible solutions if a problem exists
            Problem problem = DetectProblem(gameString, gameStart, gameEnd);

            // If user chose a solution apply it
            if (solutionAnswer != "" && solutionAnswer != null)
            {
                SolveProblem(gameResult, solutionAnswer);
            }
            // If there is a problem return it
            else if (problem != null)
            {
                gameResult.Problem = problem;
                return gameResult;
            }

            // Create a list of all of the player (GamePlayers)
            List<GamePlayers> players = new List<GamePlayers>();
            if (gameResult.Problem != null && solutionAnswer != "" && solutionAnswer != null)
            {
                players = GetPlayers(gameResult.Problem.NewGameString, gameStart, gameEnd);
            }
            else
            {
                players = GetPlayers(gameString, gameStart, gameEnd);
            }

            // Create Losers and Winner lists
            List<GamePlayers> winners = new List<GamePlayers>();
            List<GamePlayers> losers = new List<GamePlayers>();
            foreach (GamePlayers p in players)
            {
                if (p.ProfitLoss < 0)
                {
                    losers.Add(p);
                }
                // We use else if because we do not want to include players that ended up even on the game (profitLoss == 0)
                else if (p.ProfitLoss > 0)
                {
                    winners.Add(p);
                }
            }

            // After check passed set the totalCashOnTable
            double totalBuyin = 0;
            foreach (GamePlayers p in players)
            {
                totalBuyin += p.BuyIn;
            }
            gameResult.TotalCashOnTable = totalBuyin;

            gameResult.GamePlayers = players;

            // Make copies of list to avoid changing the original objects
            List<GamePlayers> winnersCopy = new List<GamePlayers>();
            foreach (GamePlayers p in winners)
                winnersCopy.Add(new GamePlayers(p));
            List<GamePlayers> losersCopy = new List<GamePlayers>();
            foreach (GamePlayers p in losers)
                losersCopy.Add(new GamePlayers(p));

            // Adding debts
            List<GameDebts> gameDebts = AddDebts(winnersCopy, losersCopy, minTransfer, priorityPlayers);
            gameDebts = SortDebts(gameDebts, losers); // NOT THE COPY - Copy will become empty (profitLoss == 0)
                                                      // Set the debts
            gameResult.GameDebts = gameDebts;

            return gameResult;
        }

        static List<GamePlayers> GetPlayers(string gameString, DateTime gameStart, DateTime gameEnd)
        {
            List<GamePlayers> players = GetPlayersFromString(gameString);

            // Add to each player the gain loss per hour
            List<GamePlayers> playersWithHR = AddHourlyRate(players, gameStart, gameEnd);


            // Organize and set GamePlayers
            playersWithHR = SortPlayers(playersWithHR, true);
            // Randomize same P/L players
            playersWithHR = RandomizeEqualPlayers(playersWithHR); // If players have the same P/L set them randomly in the least (50% to change spots)

            return playersWithHR;
        }

        public static List<GamePlayers> RandomizeEqualPlayers(List<GamePlayers> players)
        {
            Random random = new Random();
            int size = players.Count;
            for (int i = 0; i < size; i++)
            {
                for (int j = i + 1; j < size; j++)
                {
                    // If both players are equal, randomly swap them
                    if (players[i].ProfitLoss == players[j].ProfitLoss)
                    {
                        int randomNumber = random.Next(101); // 0 to 100
                        if (randomNumber >= 50)
                        {
                            // Swap players at i and j
                            GamePlayers temp = players[i];
                            players[i] = players[j];
                            players[j] = temp;
                        }
                    }
                }
            }
            return players;
        }




        // WAYPOINT Solver: Problems Functions


        static void SolveProblem(GameResult gameResult, string solutionAnswer)
        {
            string gameString = gameResult.GameString;
            DateTime gameStart = gameResult.GameStart;
            DateTime gameEnd = gameResult.GameEnd;

            List<GamePlayers> players = GetPlayers(gameString, gameStart, gameEnd);

            // Create Losers and Winner lists
            List<GamePlayers> winners = new List<GamePlayers>();
            List<GamePlayers> losers = new List<GamePlayers>();
            foreach (GamePlayers p in players)
            {
                if (p.ProfitLoss < 0)
                {
                    losers.Add(p);
                }
                // We use else if because we do not want to include players that ended up even on the game (profitLoss == 0)
                else if (p.ProfitLoss > 0)
                {
                    winners.Add(p);
                }
            }

            // Get the difference in chips (Check if there is a problem)
            double losersSum = 0;
            double winnersSum = 0;
            foreach (GamePlayers l in losers)
            {
                losersSum += l.ProfitLoss;
            }
            foreach (GamePlayers w in winners)
            {
                winnersSum += w.ProfitLoss;
            }
            double differenceChips = Math.Round(Math.Abs(losersSum) - winnersSum, 2);

            // Make copies of list to avoid changing the original objects
            // [X] Clones
            List<GamePlayers> winnersCopy = new List<GamePlayers>();
            foreach (GamePlayers p in winners) winnersCopy.Add(new GamePlayers(p));
            List<GamePlayers> losersCopy = new List<GamePlayers>();
            foreach (GamePlayers p in losers) losersCopy.Add(new GamePlayers(p));
            List<GamePlayers> playersCopy = new List<GamePlayers>();
            foreach (GamePlayers p in players) playersCopy.Add(new GamePlayers(p));

            winnersCopy = SortPlayers(winnersCopy, true);
            losersCopy = SortPlayers(losersCopy, false);


            // [X] Min Max Winner Loser
            double biggestWinnerValue = winnersCopy[0].ProfitLoss; // Get biggest winner win
            double biggestWinnerCashout = winnersCopy[0].CashOut;

            double biggestLoserValue = Math.Abs(losersCopy[0].ProfitLoss); // Get biggest loser loss
            double biggestLoserCashout = losersCopy[0].CashOut;

            // Names of the biggest loser and winner
            string biggestWinnerName = winnersCopy[0].PlayerName;
            string biggestLoserName = losersCopy[0].PlayerName;

            string smallestWinnerName = winnersCopy[winnersCopy.Count - 1].PlayerName;
            string smallestLoserName = losersCopy[losersCopy.Count - 1].PlayerName;

            // [X] Count losers and winners
            int countLosers = losersCopy.Count;
            int countWinners = winnersCopy.Count;
            int countRemainingLosers = countLosers - 1;
            int countRemainingWinners = countWinners - 1;


            double losersListSum = 0;
            foreach (GamePlayers p in losersCopy) losersListSum += Math.Abs(p.ProfitLoss); // Sums the buy-in of the game

            double winnersListSum = 0;
            foreach (GamePlayers p in winnersCopy) winnersListSum += p.ProfitLoss; // Sums the cash-out of the game 


            // Losers for solution \\
            // (%In percentage%) Biggest LOSER discount for solution 2.
            double biggestLoserDiscountPercent = Math.Ceiling(biggestLoserValue / losersListSum * 100);
            // ($In value$) Biggest LOSER discount for solution 2.
            double biggestLoserDiscountValue = Math.Round(differenceChips * (biggestLoserDiscountPercent / 100), 2);
            // ($In value$) left over chips for solution 2.
            double leftOverPerLoser = Math.Round((differenceChips - (differenceChips * (biggestLoserDiscountPercent / 100))) / countRemainingLosers, 2);

            // Winners for solution \\
            // (%In percentage%) Biggest WINNER forfeits for solution 2.
            double biggestWinnerForfeitPercent = Math.Ceiling(biggestWinnerValue / winnersListSum * 100);
            // ($In value$) Biggest WINNER forfeits for solution 2.
            double biggestWinnerForfeitValue = Math.Abs(Math.Round(differenceChips * (biggestWinnerForfeitPercent / 100), 2));
            // ($In value$) left over chips for solution 2.
            double leftOverPerWinner = Math.Abs(Math.Round((differenceChips - (differenceChips * (biggestWinnerForfeitPercent / 100))) / countRemainingWinners, 2));

            double sumBuyIn = 0;
            foreach (GamePlayers p in playersCopy) sumBuyIn += p.BuyIn; // Sums the buy-in of the game
            sumBuyIn = Math.Round(sumBuyIn, 2);

            double sumCashOut = 0;
            foreach (GamePlayers p in playersCopy) sumCashOut += p.CashOut; // Sums the cash-out of the game 
            sumCashOut = Math.Round(sumCashOut, 2);


            // [X] Set values for remainders in case of a... remainder! :D
            string remainderPlayer2 = "";
            double remainder2 = 0;

            string remainderPlayer3 = "";
            double remainder3 = 0;

            // Will be used like to Add remainder only once! 
            bool addRemainderOnce = false;
            // Will be used like to Add value to biggest winner/loser only once! 
            bool addBiggestOnce = false;


            // When losers lost less then the buy-ins ### MISSING CHIPS ### AKA PrintLosersGain()
            #region Losers GAIN
            #region Chips > 0, 1 Loser
            if (differenceChips > 0 && countLosers == 1) // If there is only one loser
            {
                differenceChips = Math.Abs(differenceChips);
                if (solutionAnswer == "1")
                {
                    foreach (GamePlayers p in players)
                    {
                        if (p.PlayerName == biggestLoserName)
                        {
                            p.CashOut = Math.Round(biggestLoserCashout + differenceChips, 2);
                        }
                    }

                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    // IMPORTANT Problem setting
                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[0];
                    mp.NewGameString = newGameString;
                }
            }
            #endregion
            #region Chips > 0 Many Losers
            else if (differenceChips > 0)
            {
                differenceChips = Math.Abs(differenceChips);

                #region ML Remainder sol 2
                // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                double split = Math.Round(differenceChips / countLosers, 2);
                double total = Math.Round(split * countLosers, 2);
                if (total != differenceChips)
                {
                    double remainder = Math.Round(differenceChips - total, 2);
                    // The remainder should be give to the biggest loser (increases profit => less to pay)
                    if (remainder > 0)
                    {
                        remainderPlayer2 = biggestLoserName;
                        remainder2 = remainder;
                    }
                    else
                    {
                        remainderPlayer2 = smallestLoserName;
                        remainder2 = remainder;
                    }
                }
                #endregion
                #region ML Remainder sol 3
                // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                double sum = Math.Round(biggestLoserDiscountValue + Math.Round(leftOverPerLoser * countRemainingLosers, 2), 2);
                if (sum != differenceChips)
                {
                    double remainder = Math.Round(differenceChips - (biggestLoserDiscountValue + leftOverPerLoser * countRemainingLosers), 2);
                    // The remainder should be give to the biggest loser (increases profit => less to pay)
                    if (remainder > 0)
                    {
                        remainderPlayer3 = biggestLoserName;
                        remainder3 = remainder;
                    }
                    else
                    {
                        remainderPlayer3 = smallestLoserName;
                        remainder3 = remainder;
                    }
                }
                #endregion
                if (solutionAnswer == "1")
                {
                    foreach (GamePlayers p in players)
                    {
                        if (p.PlayerName == biggestLoserName)
                        {
                            p.CashOut = Math.Round(biggestLoserCashout + differenceChips, 2);
                        }
                    }
                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[0];
                    mp.NewGameString = newGameString;
                }
                else if (solutionAnswer == "2")
                {
                    // [ ] Many L Sol 2
                    addRemainderOnce = false;
                    foreach (GamePlayers p in players)
                    {
                        foreach (GamePlayers l in losers)
                        {
                            if (p.PlayerName == l.PlayerName)
                            {
                                p.CashOut = Math.Round(p.CashOut + split, 2);
                            }
                            if (p.PlayerName == remainderPlayer2 && !addRemainderOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut + remainder2, 2); // if there is a remainder, add it to the designated player
                                addRemainderOnce = true;
                            }
                        }
                    }
                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[1];
                    mp.NewGameString = newGameString;
                }
                #endregion
                else if (solutionAnswer == "3")
                {
                    addRemainderOnce = false;
                    addBiggestOnce = false;
                    foreach (GamePlayers p in players)
                    {
                        foreach (GamePlayers l in losers)
                        {
                            if (p.PlayerName == biggestLoserName && !addBiggestOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut + biggestLoserDiscountValue, 2);
                                addBiggestOnce = true;
                            }
                            else if (p.PlayerName == l.PlayerName && !(p.PlayerName == biggestLoserName))
                            {
                                p.CashOut = Math.Round(p.CashOut + leftOverPerLoser, 2);
                            }
                            if (p.PlayerName == remainderPlayer3 && !addRemainderOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut + remainder3, 2); // if there is a remainder, add it to the designated player
                                addRemainderOnce = true;
                            }
                        }
                    }
                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[2];
                    mp.NewGameString = newGameString;

                }



            }
            #endregion Losers GAIN END











            #region Winners LOSE

            #region chips < 0, 1 W



            // When winners won more then the buy-ins ### OVER CHIPS ###
            if (differenceChips < 0 && countWinners == 1) // If there is only one winner
            {
                differenceChips = Math.Abs(differenceChips);

                if (solutionAnswer == "1")
                {
                    foreach (GamePlayers p in players)
                    {
                        if (p.PlayerName == biggestWinnerName)
                        {
                            p.CashOut = Math.Round(biggestWinnerCashout - differenceChips, 2);
                        }
                    }

                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[0];
                    mp.NewGameString = newGameString;
                }

            }
            else if (differenceChips < 0)
            {
                differenceChips = Math.Abs(differenceChips);


                // [ ] Winners Sol 1 & 2 print string was here

                // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                double split = Math.Round(differenceChips / countWinners, 2);
                double total = Math.Round(split * countWinners, 2);
                if (total != differenceChips)
                {
                    double remainder = Math.Round(differenceChips - total, 2);

                    // The remainder should be give to the biggest loser (increases profit => less to pay)
                    if (remainder < 0)
                    {
                        remainderPlayer2 = smallestWinnerName;
                        remainder2 = remainder;
                    }
                    else
                    {
                        remainderPlayer2 = biggestWinnerName;
                        remainder2 = remainder;
                    }
                }

                // [ ] Winners Sol 3 print string was here


                // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                double sum = Math.Round(biggestWinnerForfeitValue + Math.Round(leftOverPerWinner * countRemainingWinners, 2), 2);
                if (sum != differenceChips)
                {
                    double remainder = Math.Round(differenceChips - Math.Round(biggestWinnerForfeitValue + leftOverPerWinner * countRemainingWinners, 2), 2);
                    // The remainder should be give to the biggest loser (increases profit => less to pay)
                    if (remainder < 0)
                    {
                        remainderPlayer3 = smallestWinnerName;
                        remainder3 = remainder;
                    }
                    else
                    {
                        remainderPlayer3 = biggestWinnerName;
                        remainder3 = remainder;
                    }
                }

                if (solutionAnswer == "1")
                {
                    foreach (GamePlayers p in players)
                    {
                        if (p.PlayerName == biggestWinnerName)
                        {
                            p.CashOut = Math.Round(biggestWinnerCashout - differenceChips, 2);
                        }
                    }

                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[0];
                    mp.NewGameString = newGameString;
                }
                else if (solutionAnswer == "2")
                {
                    // [ ] Many W Sol 2
                    addRemainderOnce = false;
                    foreach (GamePlayers p in players)
                    {
                        foreach (GamePlayers w in winners)
                        {
                            if (p.PlayerName == w.PlayerName)
                            {
                                p.CashOut = Math.Round(p.CashOut - split, 2);
                            }
                            if (p.PlayerName == remainderPlayer2 && !addRemainderOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut - remainder2, 2); // if there is a remainder, add it to the designated player
                                addRemainderOnce = true;
                            }
                        }
                    }
                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));

                    // Create the problem
                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[1];
                    mp.NewGameString = newGameString;
                }
                else if (solutionAnswer == "3")
                {
                    addRemainderOnce = false;
                    addBiggestOnce = false;

                    foreach (GamePlayers p in players)
                    {
                        foreach (GamePlayers w in winners)
                        {
                            if (p.PlayerName == biggestWinnerName && !addBiggestOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut - biggestWinnerForfeitValue, 2);
                                addBiggestOnce = true;
                            }
                            else if (p.PlayerName == w.PlayerName && !(p.PlayerName == biggestWinnerName))
                            {
                                p.CashOut = Math.Round(p.CashOut - leftOverPerWinner, 2);
                            }
                            if (p.PlayerName == remainderPlayer3 && !addRemainderOnce)
                            {
                                p.CashOut = Math.Round(p.CashOut - remainder3, 2); // if there is a remainder, add it to the designated player
                                addRemainderOnce = true;
                            }
                        }
                    }
                    // Extract new Game string
                    string newGameString = OrderStatsString(ExtractGameStringFromList(players));


                    Problem mp = gameResult.Problem;
                    mp.ChosenSolution = mp.SolutionsSuggested[2];
                    mp.NewGameString = newGameString;

                }
            }
        }
        static Problem DetectProblem(string gameString, DateTime gameStart, DateTime gameEnd)
        {
            Problem problem = null;

            List<GamePlayers> players = GetPlayers(gameString, gameStart, gameEnd);

            // Create Losers and Winner lists
            List<GamePlayers> winners = new List<GamePlayers>();
            List<GamePlayers> losers = new List<GamePlayers>();
            foreach (GamePlayers p in players)
            {
                if (p.ProfitLoss < 0)
                {
                    losers.Add(p);
                }
                // We use else if because we do not want to include players that ended up even on the game (profitLoss == 0)
                else if (p.ProfitLoss > 0)
                {
                    winners.Add(p);
                }
            }

            // Check if game can be solved
            // If not will return the problem with only errorMessage
            if (winners.Count == 0 && losers.Count == 0)
            {
                problem = new Problem();
                problem.ErrorMessage = "CODE 0: No winners && No losers error, Cannot continue.";
                return problem;
            }
            else if (winners.Count == 0)
            {
                problem = new Problem();
                problem.ErrorMessage = "CODE 1: No winners, Cannot continue.";
                return problem;
            }
            else if (losers.Count == 0)
            {
                problem = new Problem();
                problem.ErrorMessage = "CODE 2: No Losers, Cannot continue.";
                return problem;
            }

            // Get the difference in chips (Check if there is a problem)
            double losersSum = 0;
            double winnersSum = 0;
            foreach (GamePlayers l in losers)
            {
                losersSum += l.ProfitLoss;
            }
            foreach (GamePlayers w in winners)
            {
                winnersSum += w.ProfitLoss;
            }
            double differenceChips = Math.Round(Math.Abs(losersSum) - winnersSum, 2);

            if (differenceChips == 0)
            {
                return problem; // will return null
            }
            else // (differenceChips != 0) // [ ] There is a problem!
            {
                problem = new Problem();

                // Make copies of list to avoid changing the original objects
                // [X] Clones
                List<GamePlayers> winnersCopy = new List<GamePlayers>();
                foreach (GamePlayers p in winners) winnersCopy.Add(new GamePlayers(p));
                List<GamePlayers> losersCopy = new List<GamePlayers>();
                foreach (GamePlayers p in losers) losersCopy.Add(new GamePlayers(p));
                List<GamePlayers> playersCopy = new List<GamePlayers>();
                foreach (GamePlayers p in players) playersCopy.Add(new GamePlayers(p));

                winnersCopy = SortPlayers(winnersCopy, true);
                losersCopy = SortPlayers(losersCopy, false);


                // [X] Min Max Winner Loser
                double biggestWinnerValue = winnersCopy[0].ProfitLoss; // Get biggest winner win
                double biggestWinnerCashout = winnersCopy[0].CashOut;

                double biggestLoserValue = Math.Abs(losersCopy[0].ProfitLoss); // Get biggest loser loss
                double biggestLoserCashout = losersCopy[0].CashOut;

                // Names of the biggest loser and winner
                string biggestWinnerName = winnersCopy[0].PlayerName;
                string biggestLoserName = losersCopy[0].PlayerName;

                string smallestWinnerName = winnersCopy[winnersCopy.Count - 1].PlayerName;
                string smallestLoserName = losersCopy[losersCopy.Count - 1].PlayerName;

                // [X] Count losers and winners
                int countLosers = losersCopy.Count;
                int countWinners = winnersCopy.Count;
                int countRemainingLosers = countLosers - 1;
                int countRemainingWinners = countWinners - 1;


                double losersListSum = 0;
                foreach (GamePlayers p in losersCopy) losersListSum += Math.Abs(p.ProfitLoss); // Sums the buy-in of the game

                double winnersListSum = 0;
                foreach (GamePlayers p in winnersCopy) winnersListSum += p.ProfitLoss; // Sums the cash-out of the game 

                // Losers for solution \\
                // (%In percentage%) Biggest LOSER discount for solution 2.
                double biggestLoserDiscountPercent = Math.Ceiling(biggestLoserValue / losersListSum * 100);
                // ($In value$) Biggest LOSER discount for solution 2.
                double biggestLoserDiscountValue = Math.Round(differenceChips * (biggestLoserDiscountPercent / 100), 2);
                // ($In value$) left over chips for solution 2.
                double leftOverPerLoser = Math.Round((differenceChips - (differenceChips * (biggestLoserDiscountPercent / 100))) / countRemainingLosers, 2);

                // Winners for solution \\
                // (%In percentage%) Biggest WINNER forfeits for solution 2.
                double biggestWinnerForfeitPercent = Math.Ceiling(biggestWinnerValue / winnersListSum * 100);
                // ($In value$) Biggest WINNER forfeits for solution 2.
                double biggestWinnerForfeitValue = Math.Abs(Math.Round(differenceChips * (biggestWinnerForfeitPercent / 100), 2));
                // ($In value$) left over chips for solution 2.
                double leftOverPerWinner = Math.Abs(Math.Round((differenceChips - (differenceChips * (biggestWinnerForfeitPercent / 100))) / countRemainingWinners, 2));


                double sumBuyIn = 0;
                foreach (GamePlayers p in playersCopy) sumBuyIn += p.BuyIn; // Sums the buy-in of the game
                sumBuyIn = Math.Round(sumBuyIn, 2);

                double sumCashOut = 0;
                foreach (GamePlayers p in playersCopy) sumCashOut += p.CashOut; // Sums the cash-out of the game 
                sumCashOut = Math.Round(sumCashOut, 2);


                // [X] Set values for remainders in case of a... remainder! :D
                string remainderPlayer2 = "";
                double remainder2 = 0;

                string remainderPlayer3 = "";
                double remainder3 = 0;

                // Will be used like to Add remainder only once! 
                bool addRemainderOnce = false;
                // Will be used like to Add value to biggest winner/loser only once! 
                bool addBiggestOnce = false;


                // When losers lost less then the buy-ins ### MISSING CHIPS ### AKA PrintLosersGain()
                #region Losers GAIN
                #region Chips > 0, 1 Loser
                if (differenceChips > 0 && countLosers == 1) // If there is only one loser
                {
                    differenceChips = Math.Abs(differenceChips);

                    // Create the problem
                    // [ ] One L ("1")
                    problem = CreateProblem(problem, true, "1", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, "", "", "", 0.0, "");

                    return problem;
                }
                #endregion
                #region Chips > 0 Many Losers
                else if (differenceChips > 0)
                {
                    differenceChips = Math.Abs(differenceChips);

                    #region ML Remainder sol 2
                    // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                    double split = Math.Round(differenceChips / countLosers, 2);
                    double total = Math.Round(split * countLosers, 2);
                    if (total != differenceChips)
                    {
                        double remainder = Math.Round(differenceChips - total, 2);
                        // The remainder should be give to the biggest loser (increases profit => less to pay)
                        if (remainder > 0)
                        {
                            remainderPlayer2 = biggestLoserName;
                            remainder2 = remainder;
                        }
                        else
                        {
                            remainderPlayer2 = smallestLoserName;
                            remainder2 = remainder;
                        }
                    }
                    #endregion
                    #region ML Remainder sol 3
                    // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                    double sum = Math.Round(biggestLoserDiscountValue + leftOverPerLoser * countRemainingLosers, 2);
                    if (sum != differenceChips)
                    {
                        double remainder = Math.Round(differenceChips - (biggestLoserDiscountValue + leftOverPerLoser * countRemainingLosers), 2);
                        // The remainder should be give to the biggest loser (increases profit => less to pay)
                        if (remainder > 0)
                        {
                            remainderPlayer3 = biggestLoserName;
                            remainder3 = remainder;
                        }
                        else
                        {
                            remainderPlayer3 = smallestLoserName;
                            remainder3 = remainder;
                        }
                    }
                    // [ ] M L ("1")
                    // Create the problem
                    problem = CreateProblem(problem, true, "1", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, "", "", "", 0.0, "");

                    // [ ] M L ("2")
                    problem = CreateProblem(problem, true, "2", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, Convert.ToString(split), "", "", remainder2, remainderPlayer2);

                    // [ ] M L ("3") // Adjusted split!
                    problem = CreateProblem(problem, true, "3", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, Convert.ToString(Math.Round((differenceChips - biggestLoserDiscountValue) / (countLosers - 1), 2)), Convert.ToString(Math.Round(biggestLoserDiscountValue, 2)), Convert.ToString(biggestLoserDiscountPercent), remainder3, remainderPlayer3);

                    return problem;
                    #endregion
                }
                #endregion


                // When winners won more then the buy-ins ### OVER CHIPS ###
                if (differenceChips < 0 && countWinners == 1) // If there is only one winner
                {
                    differenceChips = Math.Abs(differenceChips);

                    // Create the problem
                    // [ ] One W ("1")
                    problem = CreateProblem(problem, false, "1", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, "", "", "", 0.0, "");
                    return problem;
                }
                else if (differenceChips < 0)
                {
                    differenceChips = Math.Abs(differenceChips);
                    // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                    double split = Math.Round(differenceChips / countWinners, 2);
                    double total = Math.Round(split * countWinners, 2);
                    if (total != differenceChips)
                    {
                        double remainder = Math.Round(differenceChips - total, 2);

                        // The remainder should be give to the biggest loser (increases profit => less to pay)
                        if (remainder < 0)
                        {
                            remainderPlayer2 = smallestWinnerName;
                            remainder2 = remainder;
                        }
                        else
                        {
                            remainderPlayer2 = biggestWinnerName;
                            remainder2 = remainder;
                        }
                    }

                    // Remainder should be extremely small if at all, I've implemented the logic below to handle it.
                    double sum = Math.Round(biggestWinnerForfeitValue + leftOverPerWinner * countRemainingWinners, 2);
                    if (sum != differenceChips)
                    {
                        double remainder = Math.Round(differenceChips - (biggestWinnerForfeitValue + leftOverPerWinner * countRemainingWinners), 2);
                        // The remainder should be give to the biggest loser (increases profit => less to pay)
                        if (remainder < 0)
                        {
                            remainderPlayer3 = smallestWinnerName;
                            remainder3 = remainder;
                        }
                        else
                        {
                            remainderPlayer3 = biggestWinnerName;
                            remainder3 = remainder;
                        }
                    }
                    // [ ] M W ("1")
                    // Create the problem
                    problem = CreateProblem(problem, false, "1", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, "", "", "", 0.0, "");
                    // [ ] M W ("2")
                    problem = CreateProblem(problem, false, "2", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, Convert.ToString(split), "", "", remainder2, remainderPlayer2);

                    // [ ] M W ("3") // Adjusted split!
                    problem = CreateProblem(problem, false, "3", Convert.ToString(differenceChips), biggestLoserName, biggestWinnerName, Convert.ToString(Math.Round((differenceChips - biggestWinnerForfeitValue) / (countWinners - 1), 2)), Convert.ToString(Math.Round(biggestWinnerForfeitValue, 2)), Convert.ToString(biggestWinnerForfeitPercent), remainder3, remainderPlayer3);
                    return problem;

                }
            }
            return problem;
        }

        public static Problem CreateProblem(Problem problem, bool losersGainSolutionType, string typeSolution, string differenceChips, string biggestLoser, string biggestWinner, string equalSplit, string percentageSplit, string percentOfSolution3, double remainder, string remainderPlayer)
        {
            if (problem == null)
            {
                problem = new Problem();
            }

            switch (typeSolution)
            {
                case "1":
                    typeSolution = losersGainSolutionType
                            ? $"1 - The biggest loser '{biggestLoser}' gets all of the extra chips to his cashout ({Convert.ToDouble(differenceChips)})"
                            : $"1 - The biggest winner '{biggestWinner}' covers all of the missing chips from his cashout ({Convert.ToDouble(differenceChips)})";
                    break;
                case "2":
                    typeSolution = losersGainSolutionType
                            ? $"2 - All extra chips are added equally to each loser's cashout ({Convert.ToDouble(equalSplit)})"
                            : $"2 - All missing chips are deducted equally from each winner's cashout ({Convert.ToDouble(equalSplit)})";
                    break;
                case "3":
                    typeSolution = losersGainSolutionType
                            ? $"3 - The biggest loser '{biggestLoser}' gets {percentOfSolution3}% of the extra chips added to his cashout ({Convert.ToDouble(percentageSplit)}), while the rest is added equally to each loser's cashout ({Convert.ToDouble(equalSplit)})"
                            : $"3 - The biggest winner '{biggestWinner}' covers {percentOfSolution3}% of the missing chips from to his cashout ({Convert.ToDouble(percentageSplit)}), while the remainder is deducted equally from each winner's cashout ({Convert.ToDouble(equalSplit)})";
                    break;
            }
            if (problem.SolutionsSuggested == null)
            {
                problem.SolutionsSuggested = new List<SolutionSuggestions>();
            }
            string probString = losersGainSolutionType
                ? $"Missing chips ({differenceChips}) - Losers Gain Error - Total cash-out is less than total buy-in - Losers gain unclaimed chips"
                : $"Extra chips ({differenceChips}) - Winners Lose Error - Total cash-out exceeds total buy-in - Winners forfeit excess winnings";
            problem.ProblemDescriptionString = probString;
            // Add remainder if there was one
            string remainderSentence = "";
            if (remainder != 0)
            {
                if (losersGainSolutionType == true)
                {
                    if (remainder >= 0)
                    {
                        remainderSentence = $"{remainderPlayer} (biggest loser) gets an extra ({remainder})";
                    }
                    else
                    {
                        remainderSentence = $"{remainderPlayer} (smallest loser) misses out on ({remainder})";
                    }
                }
                else
                {
                    if (remainder >= 0)
                    {
                        remainderSentence = $"{remainderPlayer} (biggest winner) forfeits an extra ({remainder * -1})";
                    }
                    else
                    {
                        remainderSentence = $"{remainderPlayer} (smallest winner) keeps an extra ({Math.Abs(remainder)})";
                    }
                }
            }
            SolutionSuggestions solution = new SolutionSuggestions(typeSolution, remainderSentence);
            problem.SolutionsSuggested.Add(solution);

            return problem;
        }


        // WAYPOINT Debt Settle Functions "Who Owes Who"
        public static List<GameDebts> AddDebts(List<GamePlayers> winners, List<GamePlayers> losers, double minTransfer, string[] priorityPlayers)
        {
            List<GameDebts> gameDebts = new List<GameDebts>();
            List<GamePlayers> winnersSorted = SortPlayers(winners, true); // Max winner at top
            List<GamePlayers> losersSorted = SortPlayers(losers, false); // Max loser at top

            #region Equal Pay
            for (int loser = 0; loser < losersSorted.Count; loser++)
            {
                for (int winner = 0; winner < winnersSorted.Count; winner++)
                {
                    if (winnersSorted[winner].ProfitLoss == losersSorted[loser].ProfitLoss && losersSorted[loser].ProfitLoss != 0 && winnersSorted[winner].ProfitLoss != 0)
                    {
                        // Create the debt
                        GameDebts gd = new GameDebts(losersSorted[loser].PlayerName, winnersSorted[winner].PlayerName, winnersSorted[winner].ProfitLoss, "null");
                        // Add the debt
                        gameDebts.Add(gd);
                        // RemoveAt both winner and loser
                        winnersSorted.RemoveAt(winner);
                        losersSorted.RemoveAt(loser);
                    }
                }
            }
            #endregion


            #region DFS Pay
            // Using DFS, try and find "perfect matches" losers(1 or more).Value == winner.Value
            for (int winner = 0; winner < winnersSorted.Count; winner++)
            {
                // Make a list that will store a found 'prefect match'
                List<GamePlayers> foundCombo = new List<GamePlayers>();

                foundCombo = DFSettleWinner(losersSorted, winnersSorted[winner].ProfitLoss);

                if (foundCombo.Count != 0)
                {
                    for (int fc = 0; fc < foundCombo.Count; fc++)
                    {
                        // Create the debt
                        GameDebts gd = new GameDebts(foundCombo[fc].PlayerName, winnersSorted[winner].PlayerName, Math.Abs(foundCombo[fc].ProfitLoss), "null");
                        // Add the debt
                        gameDebts.Add(gd);
                        // RemoveAt all losers
                        losersSorted.RemoveAt(fc);
                    }
                    // RemoveAt the winner
                    winnersSorted.RemoveAt(winner);
                    // if a perfect match was found winner-- so it will not overflow and check the next one
                    winner--;
                }
            }
            #endregion

            // After all "prefect pairings" have been made, We Add out priorityPlayers to the lists
            losersSorted = SetPriorityPlayers(losersSorted, priorityPlayers);
            winnersSorted = SetPriorityPlayers(winnersSorted, priorityPlayers);

            #region Default Pay
            // Sort the rest with the following logic => Biggest loser pays Biggest winner.....
            for (int loser = 0; loser < losersSorted.Count; loser++)
            {
                for (int winner = 0; winner < winnersSorted.Count; winner++)
                {
                    if (winnersSorted[winner].ProfitLoss == 0) continue; // Skip if debt has been paid

                    while (losersSorted[loser].ProfitLoss != 0 && winnersSorted[winner].ProfitLoss > 0)
                    {
                        string winnerName = winnersSorted[winner].PlayerName;
                        string loserName = losersSorted[loser].PlayerName;
                        double winnerPayAmount = winnersSorted[winner].ProfitLoss; // How much needs to be paid
                        double loserPayAmount = Math.Abs(losersSorted[loser].ProfitLoss); // How much loser has to pay

                        bool atLeast1MoreLoserAndWinner = loser < (losersSorted.Count - 1) && winner < (winnersSorted.Count - 1);
                        double rawDifferenceForMinTransfer = Math.Abs(winnerPayAmount - loserPayAmount);

                        if (winnerPayAmount > loserPayAmount)
                        {
                            if (loserPayAmount > minTransfer && rawDifferenceForMinTransfer < minTransfer && rawDifferenceForMinTransfer < minTransfer && atLeast1MoreLoserAndWinner == true) // If after the transfer the amount is too small for the 'Bit' minimum payment
                            {
                                if (winnersSorted[winner + 1].ProfitLoss >= minTransfer) //  && losersList[loser+1].Value >= minTransfer
                                {
                                    // Find the value until loser has 'minTransfer' at least and winner has 'minTransfer' at least
                                    loserPayAmount -= minTransfer; // Pay one min transfer less so the next lose can cover the biggest winner with a minTransfer value.

                                    // Create the debt
                                    GameDebts gd2 = new GameDebts(loserName, winnerName, loserPayAmount, "null");
                                    // Add the debt
                                    gameDebts.Add(gd2);

                                    winnersSorted[winner].ProfitLoss = winnerPayAmount - loserPayAmount;
                                    losersSorted[loser].ProfitLoss = losersSorted[loser].ProfitLoss + loserPayAmount;

                                    if (winner < winnersSorted.Count) winner++; // Pay the min amount to the next winner (if there is only 1 winner the issue will not occur)
                                    continue;
                                }
                            }

                            // Create the debt
                            GameDebts gd = new GameDebts(loserName, winnerName, loserPayAmount, "null");
                            // Add the debt
                            gameDebts.Add(gd);

                            winnersSorted[winner].ProfitLoss = winnerPayAmount - loserPayAmount;
                            losersSorted[loser].ProfitLoss = 0;
                        }
                        else  // (loserPayAmount > winnerPayAmount)
                        {
                            // if ((loserPayAmount - winnerPayAmount) < minTransfer && winnerPayAmount > minTransfer) // If after the transfer the amount is too small for the 'Bit' minimum payment
                            if (loserPayAmount > minTransfer && rawDifferenceForMinTransfer < minTransfer && rawDifferenceForMinTransfer < minTransfer && atLeast1MoreLoserAndWinner == true) // If after the transfer the amount is too small for the 'Bit' minimum payment
                            {
                                // Pay exact amount less so you will have a 1 minTransfer value left
                                double leftOver = minTransfer + Math.Abs(loserPayAmount - winnerPayAmount);
                                // Find the value until loser has 'minTransfer' at least and winner has 'minTransfer' at least
                                if (winnersSorted[winner + 1].ProfitLoss >= leftOver) //  && losersList[loser+1].Value >= minTransfer
                                {
                                    // RemoveAt the minTransfer + leftOver so that the winner can get a minTransfer from the next loser 
                                    loserPayAmount -= leftOver;

                                    // Create the debt
                                    GameDebts gd2 = new GameDebts(loserName, winnerName, loserPayAmount, "null");
                                    // Add the debt
                                    gameDebts.Add(gd2);

                                    losersSorted[loser].ProfitLoss = losersSorted[loser].ProfitLoss + loserPayAmount;
                                    winnersSorted[winner].ProfitLoss = winnersSorted[winner].ProfitLoss - loserPayAmount;

                                    if (winner < winnersSorted.Count) winner++;
                                    continue;
                                }
                            }
                            // Create the debt
                            GameDebts gd = new GameDebts(loserName, winnerName, winnerPayAmount, "null");
                            // Add the debt
                            gameDebts.Add(gd);

                            losersSorted[loser].ProfitLoss = (loserPayAmount - winnerPayAmount) * -1; // *-1 to make it negative
                            winnersSorted[winner].ProfitLoss = 0;
                        }
                    }
                }
            }
            #endregion
            return gameDebts;
        }

        public static List<GamePlayers> SetPriorityPlayers(List<GamePlayers> players, string[] priorityPlayers)
        {
            int priorityIndex = 0;
            for (int i = 0; i < priorityPlayers.Length; i++)
            {
                // Check if name appears in the priority array
                for (int j = 0; j < players.Count; j++)
                {
                    if (players[j].PlayerName == priorityPlayers[i])
                    {
                        // If name appears set it on top (Based on priorityIndex) of the List
                        GamePlayers playerToMove = players[j];
                        players.RemoveAt(j);
                        players.Insert(priorityIndex, playerToMove);
                        priorityIndex++;
                        break;
                    }
                }
            }

            return players;
        }

        // Method to find all combinations of losers that sum to the winner's amount
        public static List<GamePlayers> DFSettleWinner(List<GamePlayers> losers, double winnerSum)
        {
            List<GamePlayers> currentCombination = new List<GamePlayers>();
            List<GamePlayers> combinationFound = new List<GamePlayers>();
            FindCombinations(losers, winnerSum, 0, currentCombination, combinationFound);
            return combinationFound;
        }

        // Recursive helper method to find combinations
        public static void FindCombinations(List<GamePlayers> losers, double targetSum, int startIndex, List<GamePlayers> currentCombination, List<GamePlayers> combinationFound)
        {
            double currentSum = 0;
            foreach (GamePlayers p in currentCombination)
            {
                currentSum += p.ProfitLoss;
            }

            // Check if the current combination sums to the target
            if (Math.Abs(currentSum - targetSum) < 0.001) // Adding a small tolerance for floating point accuracy
            {
                // If a combination has been found
                foreach (GamePlayers p in currentCombination)
                {
                    combinationFound.Add(p);
                }
                return;
            }

            // If the current sum exceeds the target or we have exhausted the list, backtrack
            if (currentSum >= targetSum || startIndex >= losers.Count)
            {
                return;
            }

            // Explore further by adding each subsequent loser one by one to the combination
            for (int i = startIndex; i < losers.Count; i++)
            {
                currentCombination.Add(losers[i]);
                FindCombinations(losers, targetSum, i + 1, currentCombination, combinationFound);
                currentCombination.RemoveAt(currentCombination.Count - 1); // Backtrack
            }
        }

        public static List<GameDebts> SortDebts(List<GameDebts> gameDebts, List<GamePlayers> losers)
        {
            List<GameDebts> sortDebtsFinal = new List<GameDebts>();
            List<GamePlayers> losersSorted = SortPlayers(losers, false); // Max loser at top

            // Sort the entire debts
            List<GameDebts> sortDebtsBubble = new List<GameDebts>(gameDebts);
            sortDebtsBubble.Sort((d1, d2) => d2.Amount.CompareTo(d1.Amount)); // Example: sort by amount descending (Biggest transfers on top)

            // Go one name at a time (loserSorted ArrayList and add his debt to sortDebtsFinal)
            for (int i = 0; i < losersSorted.Count; i++)
            {
                string name = losersSorted[i].PlayerName;

                for (int j = 0; j < sortDebtsBubble.Count; j++)
                {
                    if (sortDebtsBubble[j].Debtor == name) // If debtor == current loser
                    {
                        GameDebts debtToMove = sortDebtsBubble[j];
                        sortDebtsBubble.RemoveAt(j);
                        sortDebtsFinal.Add(debtToMove);
                        // Re-run
                        i--;
                        break;
                    }
                }
            }

            return sortDebtsFinal;
        }














        // WAYPOINT: Other Utility Functions

        static string[] TrimWordsInString(string str)
        {
            // Trim all of the strings for uniformity
            str = str.Trim();                                          // Trim of each long string   "  H   200 200"   => "H   200 200"

            string[] playerStatsTest = str.Split(' ');

            string[] newArr = new string[0];

            // Trim all words for uniformity
            int trimCounter = 0;
            for (int j = 0; j < playerStatsTest.Length; j++)
            {
                if (playerStatsTest[j].Trim() == "" || playerStatsTest[j] == null) continue;
                else
                {
                    newArr = AddOneToArray(newArr);
                    newArr[trimCounter++] = playerStatsTest[j].Trim(); // Trim of each string inside "H" "  200" "200" => "H" "200" "200"
                }
            }
            return newArr;
        }

        // T Makes the function a General function allowing it to accept types of any kind so it can be more dynamic
        static T[] AddOneToArray<T>(T[] arr)
        {
            T[] temp = new T[arr.Length + 1];

            for (int i = 0; i < arr.Length; i++)
            {
                temp[i] = arr[i];
            }

            return temp;
        }

        static string OrderStatsString(string statsString)
        {
            // Normalize data string (readable and by value)
            // "Osher 75 247.5, Pardo 150 407, Idan 400 474, " => "Pardo 150 407 , Osher 75 247.5 , Idan 400 474"

            string temp = "";

            // // Add ',' for SortValuesInStatsString(temp) calculation as well as " , " calculation.
            // if (!statsString.Contains(',')) statsString += ",";

            string[] players = statsString.Split(',');

            for (int i = 0; i < players.Length; i++)
            {
                // Add only strings that are valid
                string[] tempPlayer = TrimWordsInString(players[i]);
                if (tempPlayer.Length != 3) continue;
                for (int j = 0; j < tempPlayer.Length; j++)
                {
                    temp += tempPlayer[j];
                    if (j < tempPlayer.Length - 1) temp += " ";
                }

                // Ignore the empty " ," in the original 'statsString' so in the new string you will not have a ',' in the end
                if (i != players.Length - 1 && players.Length > 1)
                    //players[i+1].Length > 3 = If next player is an actual playerString and not " "
                    if (players[i + 1].Length > 3) temp += " , "; // players.Length > 1 to avoid adding a " , " when there is only 1 player 
            }

            temp = SortValuesInStatsString(temp);

            return temp;
        }

        static string SortValuesInStatsString(string statsString)
        {
            /// Sort players in data string from top to bottom in value 100 => -100 (cashout - buyin)
            string temp = "";

            string[] players = statsString.Split(',');
            for (int i = 0; i < players.Length; i++)
            {
                players[i] = players[i].Trim();
            }
            // Go amount of times there are strings
            while (players.Length >= 1)
            {
                // If no more players, exit the loop
                if (players.Length == 1)
                {
                    temp += players[0];
                    break;
                }

                // // Delete a playerString if an empty playerString is given
                // {

                // }

                double largestValue = 0;
                string largestValuePlayer = "";
                // Find largest value
                for (int i = 0; i < players.Length; i++)
                {
                    // Cashout - Buyin == Value;
                    double value = Convert.ToDouble(players[i].Split(' ')[2]) - Convert.ToDouble(players[i].Split(' ')[1]);
                    if (i == 0)
                    {
                        largestValue = value;
                        continue;
                    }
                    if (value > largestValue) largestValue = value;
                }
                // Go again add largest value to temp
                for (int i = 0; i < players.Length; i++)
                {
                    double value = Convert.ToDouble(players[i].Split(' ')[2]) - Convert.ToDouble(players[i].Split(' ')[1]);
                    if (value == largestValue)
                    {
                        largestValuePlayer = players[i];
                        break;
                    }
                }

                // Add target value to temp
                temp += largestValuePlayer;
                temp += " , ";

                // Remove largest value
                int indexForTempPlayers = 0;
                string[] tempPlayers = new string[players.Length - 1];
                for (int i = 0; i < players.Length; i++)
                {
                    if (players[i] == largestValuePlayer) continue;
                    tempPlayers[indexForTempPlayers++] = players[i];
                }
                players = tempPlayers;
            }

            return temp;
        }

        static string ExtractGameStringFromList(List<GamePlayers> players)
        {
            string temp = "";

            foreach (GamePlayers p in players)
            {
                if (p.BuyIn == 0 && p.CashOut == 0) continue;
                temp += p.PlayerName;
                temp += " ";
                temp += p.BuyIn;
                temp += " ";
                temp += p.CashOut;
                temp += " , ";
            }

            return temp.Substring(0, temp.Length - 3); // -3 removes " , "
        }
        #endregion
        #endregion
        #endregion
    }
}
