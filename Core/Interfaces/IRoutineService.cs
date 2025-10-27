using Core.Entities.DTO;
using Microsoft.AspNetCore.Mvc;

namespace Core.Interfaces
{
    public interface IRoutineService
    {
        Task<IActionResult> CreateRoutine(RoutineDto routineDto, string userId);
        Task<List<RoutineDto>> GetUserRoutines(string userId);
        Task<bool> DeleteRoutine(string userId, int routineId);
        Task<bool> ChangeRoutineCompletion(string userId, int routineId, RoutineCompletionDto status);
        Task<RoutineUpdateDto> EditRoutine(string userId, int routineId, RoutineUpdateDto routineDto);
    }
}
