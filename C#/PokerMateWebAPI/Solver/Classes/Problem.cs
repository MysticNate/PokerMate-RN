namespace PokerMateWebAPI.Solver.Classes
{
    public class Problem
    {
        // Removed resolved as if there isn't a problem the obj Problem will not exist
        // boolean resolved; // PROGRAM WILL SET 

        // C# properties with automatic getters and setters
        public string? NewGameString { get; set; }
        public string? ProblemDescriptionString { get; set; }
        public string? RemainderString { get; set; } // If there is a remainder will be shown here
        public string? ErrorMessage { get; set; }
        public List<string> SolutionsSuggested { get; set; }
        public string? ChosenSolution { get; set; }

        public Problem(string? newGameString, string? problemDescriptionString, string? remainderString)
        {
            NewGameString = newGameString;
            ProblemDescriptionString = problemDescriptionString;
            RemainderString = remainderString;
            SolutionsSuggested = new List<string>();
        }

        // For when there is no remainder 
        public Problem(string? newGameString, string? problemDescriptionString)
            : this(newGameString, problemDescriptionString, null)
        {
        }

        // Blank
        public Problem()
            : this(null, null, null)
        {
        }

        public override string ToString()
        {
            return $"Problem [NewGameString={NewGameString}, ProblemDescriptionString={ProblemDescriptionString}, RemainderString={RemainderString}, ErrorMessage={ErrorMessage}, SolutionsSuggested={SolutionsSuggested}, ChosenSolution={ChosenSolution}]";
        }
    }
}
