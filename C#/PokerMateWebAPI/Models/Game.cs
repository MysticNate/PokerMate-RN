namespace PokerMateWebAPI.Models
{
    public class Game
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime GameDate { get; set; }
        public string? Location { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties for EF Core
        public User User { get; set; }
        public ICollection<GamePlayer> GamePlayers { get; set; }
    }
}
