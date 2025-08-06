namespace PokerMateWebAPI.DTOs
{
    public class PotDto
    {
        public decimal Value { get; set; }
        public int Players { get; set; }
    }

    public class PotSplitRequestDto
    {
        public PotDto MainPot { get; set; }
        public List<PotDto> SidePots { get; set; }
        public decimal MinimumChip { get; set; } 
    }
}
