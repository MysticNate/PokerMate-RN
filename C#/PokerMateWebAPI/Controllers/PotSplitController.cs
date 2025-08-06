using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PokerMateWebAPI.Data;
using PokerMateWebAPI.DTOs;
using PokerMateWebAPI.Solver.Classes;
using PokerMateWebAPI.Solver.Util;
using System.Globalization;

namespace PokerMateWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PotSplitController : ControllerBase
    {

        public PotSplitController(DataContext context)
        {
            
        }

        [HttpPost("calculate")]
        public IActionResult CalculatePotSplit([FromBody] PotSplitRequestDto request)
        {
            double minChip = (double)request.MinimumChip;

            // 1. **Validation** 
            if (request.MainPot.Players <= 1)
            {
                return BadRequest(new { message = "Main pot must have at least two players." });
            }

            if (request.MainPot.Value < (decimal)minChip * request.MainPot.Players)
            {
                return BadRequest(new { message = $"Main pot value must be at least {minChip * request.MainPot.Players}." });
            }


            // 2. **CONVERT our DTO into the string format.**
            var potStatsBuilder = new StringBuilder();

            // Add main pot using CultureInfo.InvariantCulture for consistent decimal formatting
            potStatsBuilder.Append($"{request.MainPot.Value.ToString(CultureInfo.InvariantCulture)} {request.MainPot.Players}");

            // Add side pots
            foreach (var pot in request.SidePots)
            {
                potStatsBuilder.Append($" , {pot.Value.ToString(CultureInfo.InvariantCulture)} {pot.Players}");
            }

            string potStats = potStatsBuilder.ToString();

            try
            {
                // 3. **CALL FUNCTION.**
                // This is the core of the integration.
                PotResult[] thePotResults = FuncHelper.AnalyzePotsString(potStats, minChip);

                // 4. **RETURN the array of PotResult objects.**
                // The result will be automatically serialized to JSON for the front-end.
                return Ok(thePotResults);
            }
            catch (Exception ex)
            {
                // If code throws an error, we catch it and return a server error.
                return StatusCode(500, new { message = "An error occurred during calculation.", error = ex.Message });
            }
        }
    }
}
