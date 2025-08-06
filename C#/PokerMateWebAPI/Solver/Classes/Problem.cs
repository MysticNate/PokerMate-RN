namespace PokerMateWebAPI.Solver.Classes
{
    public class Problem
    {
        // Removed resolved as if there isn't a problem the obj Problem will not exist
        // boolean resolved; // PROGRAM WILL SET 

        // C# properties with automatic getters and setters
        public string? NewGameString { get; set; } // Players + buyin + cashout
        public string? ProblemDescriptionString { get; set; }
        public string? ErrorMessage { get; set; } // Will happen if not enough losers / winner / both
        public List<SolutionSuggestions> SolutionsSuggested { get; set; } // 1 / 3 total solutions (depending in many losers / winner or just 1)
        public SolutionSuggestions? ChosenSolution { get; set; }

        public Problem(string? newGameString, string? problemDescriptionString)
        {
            NewGameString = newGameString;
            ProblemDescriptionString = problemDescriptionString;
            SolutionsSuggested = new List<SolutionSuggestions>();
        }

        // Blank
        public Problem()
        { }

        public override string ToString()
        {
            return $"Problem [NewGameString={NewGameString}, ProblemDescriptionString={ProblemDescriptionString}, ErrorMessage={ErrorMessage}, SolutionsSuggested={SolutionsSuggested}, ChosenSolution={ChosenSolution}]";
        }
    }
}
