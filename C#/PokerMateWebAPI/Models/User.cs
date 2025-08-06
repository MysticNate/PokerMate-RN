using System.ComponentModel.DataAnnotations.Schema;

namespace PokerMateWebAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10, 2)")] 
        public decimal MinimumChip { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string? GoogleId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
