using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class TaskController : BaseApiController
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [Authorize]
        [HttpPost("CreateTask")]
        public async Task<IActionResult> CreateTask([FromBody] TaskDto taskDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await _taskService.CreateTask(taskDto, userId);
            return Ok("Task created successfully");
        }

        [Authorize]
        [HttpGet("tasks")]
        public async Task<List<TaskEntity>> GetTasks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var task = await _taskService.GetTasks(userId);
            return task;
        }

        [Authorize]
        [HttpPut("EditTask/{id}")]
        public async Task<TaskEntity> EditTask(int id, [FromBody] TaskDto taskDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var task = await _taskService.EditTask(userId, id, taskDto);
            return task;
        }

        [Authorize]
        [HttpPut("StatusTask/{id}")]
        public async Task<bool> EditTask([FromBody] bool status, int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var task = await _taskService.ChangeTaskStatus(userId, id, status);
            return task;
        }

        [Authorize]
        [HttpDelete("RemoveTask/{id}")]
        public async Task<bool> RemoveTask(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var task = await _taskService.RemoveTask(userId, id);
            return task;
        }
    }
}
