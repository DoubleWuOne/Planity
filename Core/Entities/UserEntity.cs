namespace Core.Entities
{
    public class UserEntity
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<TaskEntity>? Tasks { get; set; }
        public ICollection<RoutineEntity>? Routines { get; set; }
        public ICollection<CalendarEventEntity>? CalendarEvents { get; set; }
    }
}
