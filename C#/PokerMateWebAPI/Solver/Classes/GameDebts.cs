namespace PokerMateWebAPI.Solver.Classes
{
    public class GameDebts
    {
        // C# properties with automatic getters and setters
        public string Debtor { get; set; }
        public string Creditor { get; set; }
        public double Amount { get; set; }
        public string PaymentType { get; set; }

        // Constructor
        public GameDebts(string debtor, string creditor, double amount, string paymentType)
        {
            Debtor = debtor;
            Creditor = creditor;
            Amount = amount;
            PaymentType = paymentType;
        }

        // Override ToString method (C# convention)
        public override string ToString()
        {
            return $"GameDebts [Debtor={Debtor}, Creditor={Creditor}, Amount={Amount}, PaymentType={PaymentType}]";
        }
    }
}
