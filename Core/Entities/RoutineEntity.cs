namespace Core.Entities
{
    public class RoutineEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public TimeSpan? Time { get; set; }
        public string UserId { get; set; }
        public UserEntity User { get; set; }
        public ICollection<RoutineCompletionEntity> Completions { get; set; } = new List<RoutineCompletionEntity>();
    }
}
