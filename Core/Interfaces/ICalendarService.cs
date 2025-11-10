using Core.Entities.DTO;

namespace Core.Interfaces
{
    public interface ICalendarService
    {
        Task<IEnumerable<CalendarEventDto>> GetCalendarEventsAsync(string userId);
        Task<CalendarEventDto?> GetCalendarEventByIdAsync(string userId, int eventId);
        Task<EditCalendarEventDto?> EditCalendarEventAsync(string userId, EditCalendarEventDto calendarEventDto, int eventId);
        Task AddCalendarEventAsync(CalendarEventDto calendarEventDto, string userId);
        Task<bool> DeleteCalendarEventAsync(string userId, int eventId);
    }
}
