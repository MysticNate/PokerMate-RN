namespace PokerMateWebAPI.Solver.Classes
{
    public class PotResult
    {
        // C# properties with automatic getters and setters
        public string PotName { get; set; }
        public double PotAmount { get; set; }
        public int PlayerAmount { get; set; }
        public double PPR { get; set; } // Pot Per Player (the split each player gets)
        public double Remainder { get; set; } // What is left over

        // Constructor
        public PotResult(string potName, double potAmount, int playerAmount, double ppr, double remainder)
        {
            PotName = potName;
            PotAmount = potAmount;
            PlayerAmount = playerAmount;
            PPR = ppr;
            Remainder = remainder;
        }

        // Override ToString method (C# convention)
        public override string ToString()
        {
            return $"PotResult [PotName={PotName}, PotAmount={PotAmount}, PlayerAmount={PlayerAmount}, PPR={PPR}, Remainder={Remainder}]";
        }
    }
}
