using Core.Entities;
using Core.Entities.DTO;
using Microsoft.AspNetCore.Mvc;

namespace Core.Interfaces
{
    public interface ITaskService
    {
        Task<IActionResult> CreateTask(TaskDto taskDto, string userId);
        Task<List<TaskEntity>> GetTasks(string userId);
        Task<bool> RemoveTask(string userId, int taskId);
        Task<bool> ChangeTaskStatus(string userId, int taskId, bool status);
        Task<TaskEntity> EditTask(string userId, int taskId, TaskDto taskDto);
    }
}
