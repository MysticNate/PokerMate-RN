namespace PokerMateWebAPI.Solver.Classes
{
    public class SolutionSuggestions
    {

        // Removed resolved as if there isn't a problem the obj Problem will not exist
        // boolean resolved; // PROGRAM WILL SET 

        // C# properties with automatic getters and setters
        public string? SolutionString { get; set; }
        public string? RemainderString { get; set; }


        public SolutionSuggestions(string? solutionString, string? remainderString = "")
        {
            SolutionString = solutionString;
            RemainderString = remainderString;
        }


        public override string ToString()
        {
            return $"SolutionSuggestions [SolutionString={SolutionString}, RemainderString={RemainderString}]";
        }
    }


}
