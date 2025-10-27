namespace Core.Entities.DTO
{
    public class RoutineUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public TimeSpan? Time { get; set; }
    }
}
