using System.Text;

namespace PokerMateWebAPI.Solver.Classes
{
    public class GamePlayers
    {
        // C# properties with automatic getters and setters
        public string PlayerName { get; set; }
        public double BuyIn { get; set; }
        public double CashOut { get; set; }
        public double ProfitLoss { get; set; }
        public double? GainPerHour { get; set; } // Nullable double

        public GamePlayers(string playerName, double buyIn, double cashOut, double? gainPerHour)
        {
            PlayerName = playerName;
            BuyIn = buyIn;
            CashOut = cashOut;
            ProfitLoss = cashOut - buyIn;
            GainPerHour = gainPerHour;
        }

        public GamePlayers(GamePlayers other)
        {
            PlayerName = other.PlayerName;
            BuyIn = other.BuyIn;
            CashOut = other.CashOut;
            ProfitLoss = other.ProfitLoss;
            GainPerHour = other.GainPerHour;
        }

        public GamePlayers(string playerName, double buyIn, double cashOut)
            : this(playerName, buyIn, cashOut, null)
        {
        }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("GamePlayers{");
            sb.Append("PlayerName=").Append(PlayerName);
            sb.Append(", BuyIn=").Append(BuyIn);
            sb.Append(", CashOut=").Append(CashOut);
            sb.Append(", ProfitLoss=").Append(ProfitLoss);
            sb.Append(", GainPerHour=").Append(GainPerHour);
            sb.Append('}');
            return sb.ToString();
        }
    }
}
