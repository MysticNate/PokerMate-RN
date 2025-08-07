using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerMateWebAPI.Data;
using PokerMateWebAPI.DTOs;
using PokerMateWebAPI.Models;
using PokerMateWebAPI.Solver.Classes;
using PokerMateWebAPI.Solver.Util;

namespace PokerMateWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GamesController : ControllerBase
    {
        private readonly DataContext _context;

        public GamesController(DataContext context)
        {
            _context = context;
        }

        [HttpPost("solve")]
        public async Task<IActionResult> SolveGame([FromBody] SolveGameRequestDto request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            

            // get MinTransfer from the user's settings in the database
            var user = await _context.Users.FindAsync(int.Parse(userIdString!));
            if (user == null) return Unauthorized();
            double minTransfer = (double)user.MinimumChip; 

            //  logic
            GameResult gameResult = FuncHelper.AnalyzeGameString(
                userID: userIdString,
                userGameID: 0, 
                type: request.GameType, 
                gameString: request.GameString,
                gameStart: request.GameStart,
                gameEnd: request.GameEnd,
                userNote: request.Note,
                AINote: "", 
                location: request.Location,
                minTransfer: minTransfer,
                priorityPlayers: new string[0], 
                solutionAnswer: request.SolutionChoice ?? "",
                problematicGame: request.ProblematicGame
            );

            // Check if there is a problem that requires user interaction
            if (gameResult.Problem != null && gameResult.Problem.ErrorMessage == null)
            {
                // There's a solvable problem. Return the GameResult to the client so they can choose a solution.
                // We use a specific status code like 202 Accepted to signal this.
                return new ObjectResult(gameResult) { StatusCode = 202 };
            }

            // Check if there is an un-solvable problem
            if (gameResult.Problem != null && gameResult.Problem.ErrorMessage != null)
            {
                // There's a critical error. Return a 400 Bad Request with the message.
                return BadRequest(new { message = gameResult.Problem.ErrorMessage });
            }

            // --- If we reach here, the game is solved  ---
            // Now, we save the final solved data to our database.
            var newGame = new Game
            {
                UserId = int.Parse(userIdString!),
                GameDate = gameResult.GameStart,
                Location = gameResult.Location,
                Note = gameResult.GameUserNote,
                GamePlayers = new List<GamePlayer>()
            };

            foreach (var p in gameResult.GamePlayers)
            {
                newGame.GamePlayers.Add(new GamePlayer
                {
                    PlayerName = p.PlayerName,
                    Buyin = (decimal)p.BuyIn,
                    Cashout = (decimal)p.CashOut,
                    // ProfitLoss is calculated by the DB
                });
            }

            _context.Games.Add(newGame);
            await _context.SaveChangesAsync();

            // Return the final, solved GameResult object to the client.
            return Ok(gameResult);
        }
    }
}
