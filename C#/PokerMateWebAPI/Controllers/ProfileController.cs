using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokerMateWebAPI.Data;
using PokerMateWebAPI.Models;

namespace PokerMateWebAPI.Controllers
{
    public class ChangeNicknameDto
    {
        public string NewNickname { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Only logged-in users
    public class ProfileController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;

        public ProfileController(DataContext context, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
        }

        [HttpPost("change-nickname")]
        public async Task<IActionResult> ChangeNickname([FromBody] ChangeNicknameDto request)
        {
            // Get user ID from their JWT token
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            // Find the user in the database
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // Validate the new nickname
            if (string.IsNullOrWhiteSpace(request.NewNickname) || request.NewNickname.Length < 3)
            {
                return BadRequest("Nickname must be at least 3 characters long.");
            }

            // Update the nickname and save changes
            user.Nickname = request.NewNickname;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nickname updated successfully." });
        }

        




        // unnecessary for now

        

        [HttpPost("upload-pfp")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            // 1. Get User ID from token
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // 2. Validate the file
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            // 3. Define file path and name
            // The 'wwwroot' folder is publicly accessible by default in ASP.NET
            var uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath, "images", "profiles");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // Create a unique file name to avoid conflicts
            var uniqueFileName = $"{Guid.NewGuid().ToString()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Save the file to the server's disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 5. Save the URL path to the database
            user.ProfilePictureUrl = $"/images/profiles/{uniqueFileName}";
            await _context.SaveChangesAsync();

            // 6. Return the new URL to the client
            return Ok(new { profilePictureUrl = user.ProfilePictureUrl });
        }
    }
}
