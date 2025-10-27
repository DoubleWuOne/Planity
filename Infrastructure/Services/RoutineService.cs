using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public class RoutineService : IRoutineService
    {
        private readonly PlanityDbContext _context;
        public RoutineService(PlanityDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> CreateRoutine(RoutineDto routineDto, string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            var routine = new RoutineEntity
            {
                Title = routineDto.Title,
                Description = routineDto.Description,
                Time = routineDto.Time,
                User = user,
                UserId = user.Id
            };
            await _context.Routines.AddAsync(routine);

            await _context.SaveChangesAsync();
            return new OkObjectResult("Task created successfully");
        }

        public async Task<List<RoutineDto>> GetUserRoutines(string userId)
        {
            var routines = await _context.Routines.Where(x => x.UserId == userId).Include(y => y.Completions).ToListAsync();

            var results = routines.Select(r => new RoutineDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Time = r.Time,
                Completions = r.Completions.Select(c => new RoutineCompletionDto
                {
                    Id = c.Id,
                    Date = c.Date,
                    IsCompleted = c.IsCompleted
                }).ToList()
            }).ToList();
            return results;
        }

        public Task<List<RoutineCompletionEntity>> GetUserCompletionRoutines(string userId)
        {
            throw new NotImplementedException(); //chyba niepotrzebne?
        }

        public async Task<bool> DeleteRoutine(string userId, int routineId)
        {
            var routine = await GetRoutine(routineId, userId);
            if (routine == null)
                return false;
            _context.Routines.Remove(routine);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeRoutineCompletion(string userId, int routineId, RoutineCompletionDto status)
        {
            var routine = await GetRoutine(routineId, userId);
            if (routine == null)
                return false;
            var rc = await _context.RoutineCompletions.FirstOrDefaultAsync(x => x.RoutineId == routine.Id && x.Date == DateTime.Today);
            if (rc == null)
            {
                RoutineCompletionEntity newCompletion = new()
                {
                    RoutineId = routine.Id,
                    IsCompleted = status.IsCompleted,
                    Date = DateTime.Today
                };
                await _context.RoutineCompletions.AddAsync(newCompletion);
                await _context.SaveChangesAsync();
                return true;
            }

            rc.IsCompleted = status.IsCompleted;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RoutineDto> EditRoutine(string userId, int routineId, RoutineDto routineDto)
        {
            var routine = await GetRoutine(routineId, userId);
            if (routine == null)
                return null;
            if (routineDto.Time != null)
                routine.Time = routineDto.Time;
            if (routineDto.Title.IsNullOrEmpty())
                routine.Title = routineDto.Title;
            if (routineDto.Description.IsNullOrEmpty())
                routine.Description = routineDto.Description;
            await _context.SaveChangesAsync();
            return routineDto;
        }

        private async Task<RoutineEntity> GetRoutine(int id, string userId)
        {
            var routine = await _context.Routines.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (routine == null)
                return null;
            return routine;
        }
    }
}
