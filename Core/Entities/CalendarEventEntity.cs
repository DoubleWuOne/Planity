namespace Core.Entities
{
    public class CalendarEventEntity
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public required string UserId { get; set; }
        public required UserEntity User { get; set; }

    }
}
