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
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createTaskDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            await _taskService.CreateTaskAsync(createTaskDto, userId);
            return CreatedAtAction(nameof(GetTasks), null);
        }

        [Authorize]
        [HttpGet("Tasks")]
        public async Task<IActionResult> GetTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var tasks = await _taskService.GetTasksAsync(userId);
            if (!tasks.Any())
                return NoContent();

            return Ok(tasks);
        }

        [Authorize]
        [HttpGet("Tasks/Done")]
        public async Task<IActionResult> GetDoneTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var task = await _taskService.GetDoneTasksAsync(userId);
            return Ok(task);
        }

        [Authorize]
        [HttpGet("Tasks/NotDone")]
        public async Task<IActionResult> GetNotDoneTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var task = await _taskService.GetNotDoneTasksAsync(userId);
            return Ok(task);
        }

        [Authorize]
        [HttpPut("EditTask/{id}")]
        public async Task<IActionResult> EditTask(int id, [FromBody] EditTaskDto editTaskDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var updated = await _taskService.EditTaskAsync(userId, id, editTaskDto);
            return updated is null ? NotFound() : Ok(updated);
        }

        [Authorize]
        [HttpPut("StatusTask/{id}")]
        public async Task<IActionResult> EditTask(int id, [FromBody] StatusDto status)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var success = await _taskService.ChangeTaskStatusAsync(userId, id, status);
            return success ? Ok() : NotFound();
        }

        [Authorize]
        [HttpDelete("RemoveTask/{id}")]
        public async Task<IActionResult> RemoveTask(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var success = await _taskService.RemoveTaskAsync(userId, id);
            return success ? Ok(success) : NotFound();
        }

        private string? GetUserIdByClaimTypes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }
    }
}
