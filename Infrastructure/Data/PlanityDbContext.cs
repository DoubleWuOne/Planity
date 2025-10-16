using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class PlanityDbContext : DbContext
    {
        public PlanityDbContext(DbContextOptions<PlanityDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RoutineEntity>()
                .HasOne(x => x.User)
                .WithMany(u => u.Routines)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskEntity>()
                .HasOne(x => x.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CalendarEventEntity>()
                .HasOne(x => x.User)
                .WithMany(u => u.CalendarEvents)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        public DbSet<UserEntity> Users { get; set; }
        public DbSet<RoutineEntity> Routines { get; set; }
        public DbSet<CalendarEventEntity> CalendarEvents { get; set; }
        public DbSet<TaskEntity> Tasks { get; set; }
    }
}
