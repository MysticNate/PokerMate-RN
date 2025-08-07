using PokerMateWebAPI.Solver.Classes;

namespace PokerMateWebAPI.DTOs
{
    // This DTO will carry all the data for BOTH calls
    public class SolveGameRequestDto
    {
        // Data from the first screen
        public string GameString { get; set; }
        public DateTime GameStart { get; set; }
        public DateTime GameEnd { get; set; }
        public string GameType { get; set; } 
        public string? Location { get; set; }
        public string? Note { get; set; }

        // Data for the SECOND call
        public string? SolutionChoice { get; set; } // e.g., "1", "2"
        public GameResult? ProblematicGame { get; set; } // The previous result object
    }
}
