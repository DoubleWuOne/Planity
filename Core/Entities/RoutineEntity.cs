namespace Core.Entities
{
    public class RoutineEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public TimeSpan Time { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public string UserId { get; set; }
        public UserEntity User { get; set; }
    }
}
