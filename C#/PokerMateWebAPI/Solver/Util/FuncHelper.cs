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
    }
}
