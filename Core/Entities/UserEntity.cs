using Microsoft.AspNetCore.Identity;

namespace Core.Entities
{
    public class UserEntity : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<TaskEntity>? Tasks { get; set; }
        public ICollection<RoutineEntity>? Routines { get; set; }
        public ICollection<CalendarEventEntity>? CalendarEvents { get; set; }
    }
}
