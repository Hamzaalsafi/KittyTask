using KittyTask.Api.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KittyTask.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardMember> BoardMembers => Set<BoardMember>();
    public DbSet<BoardList> Lists => Set<BoardList>();
    public DbSet<Card> Cards => Set<Card>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Board>(b =>
        {
            b.HasOne(x => x.Owner)
                .WithMany(u => u.OwnedBoards)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(x => x.Lists)
                .WithOne(l => l.Board!)
                .HasForeignKey(l => l.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BoardMember>(m =>
        {
            m.HasKey(x => new { x.BoardId, x.UserId });

            m.HasOne(x => x.Board)
                .WithMany(b => b.Members)
                .HasForeignKey(x => x.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            m.HasOne(x => x.User)
                .WithMany(u => u.Memberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BoardList>(l =>
        {
            l.HasMany(x => x.Cards)
                .WithOne(c => c.List!)
                .HasForeignKey(c => c.ListId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Card>(c =>
        {
            c.Property(x => x.Labels).HasColumnType("boolean[]");
        });
    }
}
