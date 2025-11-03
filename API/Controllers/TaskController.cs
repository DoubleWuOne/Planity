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
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            await _taskService.CreateTask(taskDto, userId);
            return Ok();
        }

        [Authorize]
        [HttpGet("Tasks")]
        public async Task<IActionResult> GetTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var tasks = await _taskService.GetTasks(userId);
            if (!tasks.Any())
                return NotFound("No tasks found for the user.");

            return Ok(tasks);
        }

        [Authorize]
        [HttpGet("Tasks/done")]
        public async Task<IActionResult> GetDoneTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var task = await _taskService.GetDoneTasks(userId);
            return Ok(task);
        }

        [Authorize]
        [HttpGet("Tasks/notdone")]
        public async Task<IActionResult> GetNotDoneTasks()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var task = await _taskService.GetNotDoneTasks(userId);
            return Ok(task);
        }

        [Authorize]
        [HttpPut("EditTask/{id}")]
        public async Task<IActionResult> EditTask(int id, [FromBody] TaskDto taskDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var task = await _taskService.EditTask(userId, id, taskDto);
            return Ok(task);
        }

        [Authorize]
        [HttpPut("StatusTask/{id}")]
        public async Task<IActionResult> EditTask(int id, [FromBody] StatusDto status)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var task = await _taskService.ChangeTaskStatus(userId, id, status);
            return Ok(task);
        }

        [Authorize]
        [HttpDelete("RemoveTask/{id}")]
        public async Task<IActionResult> RemoveTask(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var task = await _taskService.RemoveTask(userId, id);
            return Ok(task);
        }

        private string? GetUserIdByClaimTypes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }
    }
}
