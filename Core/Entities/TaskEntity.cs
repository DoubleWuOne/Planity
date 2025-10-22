namespace Core.Entities
{
    public class TaskEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Color { get; set; }
        public string? Type { get; set; }
        public string UserId { get; set; }
        public UserEntity User { get; set; }
    }
}
