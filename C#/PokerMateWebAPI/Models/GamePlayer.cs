using System.ComponentModel.DataAnnotations.Schema;

namespace PokerMateWebAPI.Models
{

    public class GamePlayer
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public string PlayerName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Buyin { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Cashout { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal ProfitLoss { get; set; } // Database will calculate this
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public Game Game { get; set; }
    }
}
