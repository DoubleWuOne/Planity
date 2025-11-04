namespace Core.Entities
{
    public class RoutineCompletionEntity
    {
        public int Id { get; set; }
        public int RoutineId { get; set; }
        public DateTime Date { get; set; }
        public bool IsCompleted { get; set; }

        public RoutineEntity? RoutineEntity { get; set; }
    }
}
