namespace Core.Entities
{
    public class RoutineEntity
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public TimeSpan? Time { get; set; }
        public required string UserId { get; set; }
        public bool Deleted { get; set; }
        public required UserEntity User { get; set; }
        public ICollection<RoutineCompletionEntity> Completions { get; set; } = new List<RoutineCompletionEntity>();
    }
}
