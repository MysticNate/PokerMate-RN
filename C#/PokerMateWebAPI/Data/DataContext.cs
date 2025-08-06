using Microsoft.EntityFrameworkCore;
using PokerMateWebAPI.Models;


namespace PokerMateWebAPI.Data
{

    

    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<GamePlayer> GamePlayers { get; set; }
    }
}
