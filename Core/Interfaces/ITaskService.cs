using Core.Entities;
using Core.Entities.DTO;

namespace Core.Interfaces
{
    public interface ITaskService
    {
        Task CreateTaskAsync(CreateTaskDto createTaskDto, string userId);
        Task<List<TaskEntity>> GetTasksAsync(string userId);
        Task<List<TaskEntity>> GetDoneTasksAsync(string userId);
        Task<List<TaskEntity>> GetNotDoneTasksAsync(string userId);
        Task<bool> RemoveTaskAsync(string userId, int taskId);
        Task<bool> ChangeTaskStatusAsync(string userId, int taskId, StatusDto status);
        Task<TaskEntity?> EditTaskAsync(string userId, int taskId, EditTaskDto editTaskDto);
    }
}
