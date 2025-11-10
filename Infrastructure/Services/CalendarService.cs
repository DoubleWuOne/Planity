using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class CalendarService : ICalendarService
    {
        private readonly PlanityDbContext _context;

        public CalendarService(PlanityDbContext dbContext)
        {
            _context = dbContext;
        }

        public async Task<IEnumerable<CalendarEventDto>> GetCalendarEventsAsync(string userId)
        {
            var calendarEvents = await _context.CalendarEvents.Where(x => x.UserId == userId).ToListAsync();

            var results = calendarEvents.Select(c => new CalendarEventDto
            {
                Title = c.Title,
                Description = c.Description,
                StartTime = c.StartTime,
                EndTime = c.EndTime,
                AllDayEvent = c.AllDayEvent,
                Id = c.Id
            }).ToList();

            return results;
        }

        public async Task<CalendarEventDto?> GetCalendarEventByIdAsync(string userId, int eventId)
        {
            var calendarEvent = await _context.CalendarEvents.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == eventId);
            if (calendarEvent == null)
                return null;

            return new CalendarEventDto
            {
                Title = calendarEvent.Title,
                Description = calendarEvent.Description,
                StartTime = calendarEvent.StartTime,
                EndTime = calendarEvent.EndTime,
                AllDayEvent = calendarEvent.AllDayEvent,
                Id = calendarEvent.Id
            };
        }

        public async Task<EditCalendarEventDto?> EditCalendarEventAsync(string userId, EditCalendarEventDto calendarEventDto, int eventId)
        {
            var calendarEvent = await _context.CalendarEvents.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == eventId);
            if (calendarEvent == null)
                return null;

            if (calendarEventDto.Title != null)
                calendarEvent.Title = calendarEventDto.Title;
            if (calendarEventDto.Description != null)
                calendarEvent.Description = calendarEventDto.Description;
            if (calendarEventDto.StartTime != null)
                calendarEvent.StartTime = calendarEventDto.StartTime;
            if (calendarEventDto.EndTime != null)
                calendarEvent.EndTime = calendarEventDto.EndTime;
            if (calendarEventDto.AllDayEvent != null)
                calendarEvent.AllDayEvent = calendarEventDto.AllDayEvent;
            await _context.SaveChangesAsync();
            return calendarEventDto;
        }

        public async Task AddCalendarEventAsync(CalendarEventDto calendarEventDto, string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new InvalidOperationException("User not found");

            var calendarEvent = new CalendarEventEntity
            {
                Title = calendarEventDto.Title,
                Description = calendarEventDto.Description,
                StartTime = calendarEventDto.StartTime,
                EndTime = calendarEventDto.EndTime,
                AllDayEvent = calendarEventDto.AllDayEvent,
                User = user,
                UserId = user.Id
            };
            await _context.CalendarEvents.AddAsync(calendarEvent);
            await _context.SaveChangesAsync();
        }


        public async Task<bool> DeleteCalendarEventAsync(string userId, int eventId)
        {
            var calendarEvent = await _context.CalendarEvents.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == eventId);
            if (calendarEvent == null)
                return false;

            _context.CalendarEvents.Remove(calendarEvent);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
