using System.ComponentModel.DataAnnotations;

namespace PokerMateWebAPI.DTOs
{

    public class UserRegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Nickname { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }
    }
}
