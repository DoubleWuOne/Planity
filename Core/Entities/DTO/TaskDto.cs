namespace Core.Entities.DTO
{
    public class TaskDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public string? Color { get; set; }
        public string? Type { get; set; }
    }
}
