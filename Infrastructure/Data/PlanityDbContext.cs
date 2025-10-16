using Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class PlanityDbContext(DbContextOptions options) : IdentityDbContext<UserEntity>(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

        public DbSet<RoutineEntity> Routines { get; set; }
        public DbSet<CalendarEventEntity> CalendarEvents { get; set; }
        public DbSet<TaskEntity> Tasks { get; set; }
    }
}
