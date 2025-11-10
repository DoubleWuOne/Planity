namespace Core.Entities.DTO
{
    public class CalendarEventDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool? AllDayEvent { get; set; }
    }
}
