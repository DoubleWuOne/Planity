namespace Core.Entities.DTO
{
    public class RoutineDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public TimeSpan? Time { get; set; }
        public List<RoutineCompletionDto> Completions { get; set; } = new();
    }
}
