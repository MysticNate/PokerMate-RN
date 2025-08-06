using System.Text;

namespace PokerMateWebAPI.Solver.Classes
{
    public class GameResult
    {
        // C# properties with automatic getters and setters
        public string UserID { get; set; }
        public int UserGameID { get; set; }
        public string Type { get; set; }
        public DateTime GameStart { get; set; }
        public DateTime GameEnd { get; set; }
        public DateTime ProgramRT { get; set; }
        public string Location { get; set; }
        public Problem Problem { get; set; }
        public string GameString { get; set; }
        public string GameUserNote { get; set; }
        public string GameAINote { get; set; }
        public double? TotalCashOnTable { get; set; }
        public List<GamePlayers> GamePlayers { get; set; }
        public List<GameDebts> GameDebts { get; set; }

        public GameResult(string userID, int userGameID, string type, DateTime gameStart, DateTime gameEnd, DateTime programRT, string location, Problem problem, string gameString, string gameUserNote, string gameAINote, double? totalCashOnTable, List<GamePlayers> gamePlayers, List<GameDebts> gameDebts)
        {
            UserID = userID;
            UserGameID = userGameID;
            Type = type;
            GameStart = gameStart;
            GameEnd = gameEnd;
            ProgramRT = programRT;
            Location = location;
            Problem = problem;
            GameString = gameString;
            GameUserNote = gameUserNote;
            GameAINote = gameAINote;
            TotalCashOnTable = totalCashOnTable;
            GamePlayers = gamePlayers;
            GameDebts = gameDebts;
        }

        public GameResult(string userID, int userGameID, string type, DateTime gameStart, DateTime gameEnd, DateTime programRT, string location, Problem problem, string gameString, string gameUserNote, string gameAINote, double? totalCashOnTable)
        {
            UserID = userID;
            UserGameID = userGameID;
            Type = type;
            GameStart = gameStart;
            GameEnd = gameEnd;
            ProgramRT = programRT;
            Location = location;
            Problem = problem;
            GameString = gameString;
            GameUserNote = gameUserNote;
            GameAINote = gameAINote;
            TotalCashOnTable = totalCashOnTable;
            GamePlayers = new List<GamePlayers>();
            GameDebts = new List<GameDebts>();
        }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("GameResult{");
            sb.Append("UserID=").Append(UserID);
            sb.Append(", UserGameID=").Append(UserGameID);
            sb.Append(", Type=").Append(Type);
            sb.Append(", GameStart=").Append(GameStart);
            sb.Append(", GameEnd=").Append(GameEnd);
            sb.Append(", ProgramRT=").Append(ProgramRT);
            sb.Append(", Location=").Append(Location);
            sb.Append(", Problem=").Append(Problem);
            sb.Append(", GameString=").Append(GameString);
            sb.Append(", GameUserNote=").Append(GameUserNote);
            sb.Append(", GameAINote=").Append(GameAINote);
            sb.Append(", TotalCashOnTable=").Append(TotalCashOnTable);
            sb.Append(", GamePlayers=").Append(GamePlayers);
            sb.Append(", GameDebts=").Append(GameDebts);
            sb.Append('}');
            return sb.ToString();
        }
    }
}
