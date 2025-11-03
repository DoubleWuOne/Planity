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
                Time = routineDto.Time,
                User = user,
                UserId = user.Id,
                Deleted = false,
                Completions = new List<RoutineCompletionEntity>()
            };
            var completion = new RoutineCompletionEntity
            {
                RoutineId = routine.Id,
                Date = DateTime.Today,
                IsCompleted = false
            };
            routine.Completions.Add(completion);
            await _context.Routines.AddAsync(routine);

            await _context.SaveChangesAsync();
            return new OkObjectResult("Routine created successfully");
        }

        public async Task<List<RoutineDto>> GetUserRoutines(string userId)
        {
            var routines = await _context.Routines
                .Where(x => x.UserId == userId)
                .Include(y => y.Completions)
                .ToListAsync();

            var today = DateTime.Today;

            foreach (var routine in routines)
            {
                var lastCompletion = routine.Completions
                    .OrderByDescending(c => c.Date)
                    .FirstOrDefault();
                if (lastCompletion == null)
                    continue;
                var lastDate = lastCompletion.Date.Date;

                for (var date = lastDate.AddDays(1); date <= today; date = date.AddDays(1))
                {
                    if (!routine.Completions.Any(c => c.Date.Date == date) && !routine.Deleted)
                    {
                        routine.Completions.Add(new RoutineCompletionEntity
                        {
                            RoutineId = routine.Id,
                            Date = date,
                            IsCompleted = false
                        });
                    }
                }
            }
            await _context.SaveChangesAsync();

            var result = routines.Select(r => new RoutineDto
            {
                Id = r.Id,
                Title = r.Title,
                Time = r.Time,
                Deleted = r.Deleted,
                Completions = r.Completions.Select(c => new RoutineCompletionDto
                {
                    Id = c.Id,
                    Date = c.Date,
                    IsCompleted = c.IsCompleted
                }).ToList()
            }).ToList();

            return result;
        }

        public async Task<bool> DeleteRoutine(string userId, int routineId)
        {
            var routine = await GetRoutine(routineId, userId);
            if (routine == null)
                return false;

            routine.Deleted = true;
            // Remove only the completion that belongs to the routine being deleted for today.
            var routineCompletionToday = await _context.RoutineCompletions
                .FirstOrDefaultAsync(x => x.RoutineId == routine.Id && x.Date.Date == DateTime.Today);
            if (routineCompletionToday != null)
            {
                _context.RoutineCompletions.Remove(routineCompletionToday);
            }
            //_context.Routines.Remove(routine);
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

        public async Task<RoutineUpdateDto> EditRoutine(string userId, int routineId, RoutineUpdateDto routineDto)
        {
            var routine = await GetRoutine(routineId, userId);
            if (routine == null)
                return null;
            if (routineDto.Time != null)
                routine.Time = routineDto.Time;
            if (!routineDto.Title.IsNullOrEmpty())
                routine.Title = routineDto.Title;
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
