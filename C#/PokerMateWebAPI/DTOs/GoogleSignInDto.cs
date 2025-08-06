using System.ComponentModel.DataAnnotations;

namespace PokerMateWebAPI.DTOs
{
    public class GoogleSignInDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string GoogleId { get; set; } = string.Empty;
    }
}
