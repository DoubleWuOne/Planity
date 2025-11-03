using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class TaskService : ITaskService
    {
        private readonly PlanityDbContext _context;

        public TaskService(PlanityDbContext context)
        {
            _context = context;
        }

        public async Task CreateTaskAsync(CreateTaskDto createTaskDto, string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new InvalidOperationException("User not found");

            var task = new TaskEntity
            {
                Title = createTaskDto.Title,
                Description = createTaskDto.Description,
                DueDate = createTaskDto.DueDate,
                IsCompleted = false,
                Color = createTaskDto.Color,
                Type = createTaskDto.Type,
                User = user,
                UserId = user.Id,
            };
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TaskEntity>> GetTasksAsync(string userId)
        {
            var list = await _context.Tasks.Where(x => x.UserId == userId).ToListAsync();
            return list;
        }

        public async Task<List<TaskEntity>> GetNotDoneTasksAsync(string userId)
        {
            var list = await _context.Tasks.Where(x => x.UserId == userId && !x.IsCompleted).ToListAsync();
            return list;
        }

        public async Task<List<TaskEntity>> GetDoneTasksAsync(string userId)
        {
            var list = await _context.Tasks.Where(x => x.UserId == userId && x.IsCompleted).ToListAsync();
            return list;
        }

        public async Task<bool> RemoveTaskAsync(string userId, int taskId)
        {
            var task = await GetTaskAsync(taskId, userId);
            if (task == null)
                return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeTaskStatusAsync(string userId, int taskId, StatusDto status)
        {
            var task = await GetTaskAsync(taskId, userId);
            if (task == null)
                return false;

            task.IsCompleted = status.IsCompleted;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TaskEntity?> EditTaskAsync(string userId, int taskId, EditTaskDto editTaskDto)
        {
            var task = await GetTaskAsync(taskId, userId);
            if (task == null)
                return null;

            if (!string.IsNullOrWhiteSpace(editTaskDto.Title)) task.Title = editTaskDto.Title;
            task.Description = editTaskDto.Description;
            task.Color = editTaskDto.Color;
            task.Type = editTaskDto.Type;

            await _context.SaveChangesAsync();
            return task;
        }

        private async Task<TaskEntity?> GetTaskAsync(int id, string userId)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (task == null)
                return null;
            return task;
        }
    }
}
