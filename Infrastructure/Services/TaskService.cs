using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public class TaskService : ITaskService
    {
        private readonly PlanityDbContext _context;

        public TaskService(PlanityDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> CreateTask(TaskDto taskDto, string userId)
        {

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var task = new TaskEntity
            {
                Description = taskDto.Description,
                Title = taskDto.Title,
                DueDate = DateTime.Today,
                IsCompleted = false,
                User = user,
                UserId = user.Id,
            };
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
            return new OkObjectResult("Task created successfully");
        }

        public async Task<List<TaskEntity>> GetTasks(string userId)
        {
            var list = _context.Tasks.Where(x => x.UserId == userId).ToList();
            return list;
        }

        public async Task<bool> RemoveTask(string userId, int taskId)
        {
            var task = await GetTask(taskId, userId);
            if (task == null)
                return false;
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeTaskStatus(string? userId, int taskId, bool status)
        {
            var task = await GetTask(taskId, userId);
            if (task == null)
                return false;
            task.IsCompleted = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TaskEntity> EditTask(string? userId, int taskId, TaskDto taskDto)
        {
            var task = await GetTask(taskId, userId);
            if (task == null)
                return null;
            if (!taskDto.Description.IsNullOrEmpty())
                task.Description = taskDto.Description;
            if (!taskDto.Title.IsNullOrEmpty())
                task.Title = taskDto.Title;
            await _context.SaveChangesAsync();
            return task;
        }

        private async Task<TaskEntity> GetTask(int id, string userId)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (task == null)
                return null;
            return task;
        }

        private async Task<List<TaskEntity>> GetTodayTasks(string userId)
        {
            return await _context.Tasks.Where(x => x.DueDate.Date == DateTime.Today && x.UserId == userId).ToListAsync();
        }
    }
}
