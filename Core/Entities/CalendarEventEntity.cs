namespace Core.Entities
{
    public class CalendarEventEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string UserId { get; set; }
        public UserEntity User { get; set; }

    }
}
