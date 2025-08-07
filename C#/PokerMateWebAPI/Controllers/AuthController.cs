using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PokerMateWebAPI.Data;
using PokerMateWebAPI.DTOs;
using PokerMateWebAPI.Models;

namespace PokerMateWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(DataContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("User with this email already exists.");
            }

            // Hash the password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                Nickname = request.Nickname,
                PasswordHash = passwordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User successfully registered.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("Invalid credentials."); 
            }

            // Verify the password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Invalid credentials.");
            }

            // If credentials are valid, create a JWT token
            string token = CreateToken(user);

            // Return the token to the client
            return Ok(new { token });
        }


        [HttpPost("google-signin")]
        public async Task<IActionResult> GoogleSignIn(GoogleSignInDto request)
        {
            try
            {
                // Verify the Google ID token
                var validAudiences = new[]
                {
                    "1091977169961-3chhcjpsavp3jmmtndjdtfm0395p89lq.apps.googleusercontent.com", // Web
                    "1091977169961-n6ethd47hb9uqlt5p9op5i4oif9nc1gf.apps.googleusercontent.com", // iOS
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = validAudiences
                });

                // Check if user already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u =>
                    u.Email == payload.Email || u.GoogleId == payload.Subject);

                User user;

                if (existingUser != null)
                {
                    // User exists, update their Google ID if needed
                    if (string.IsNullOrEmpty(existingUser.GoogleId))
                    {
                        existingUser.GoogleId = payload.Subject;
                        await _context.SaveChangesAsync();
                    }
                    user = existingUser;
                }
                else
                {
                    // Create new user
                    user = new User
                    {
                        Email = payload.Email,
                        Nickname = payload.Name,
                        GoogleId = payload.Subject,
                        PasswordHash = string.Empty, // Google users don't need password hash
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                // Create JWT token
                string token = CreateToken(user);

                return Ok(new
                {
                    token = token,
                    nickname = user.Nickname,
                    email = user.Email
                });
            }
            catch (InvalidJwtException)
            {
                return BadRequest("Invalid Google token");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Google Sign-In error: {ex.Message}");
            }
        }

        // This is a helper method to create the JWT
        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim> {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nickname),
            new Claim(ClaimTypes.Email, user.Email)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1), // Token is valid for 1 day
                    signingCredentials: creds
                );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }
    }
}
