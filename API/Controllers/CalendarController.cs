using Core.Entities.DTO;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class CalendarController : BaseApiController
    {
        private readonly ICalendarService _calendarService;

        public CalendarController(ICalendarService calendarService)
        {
            _calendarService = calendarService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetCalendarEvents()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var events = await _calendarService.GetCalendarEventsAsync(userId);
            if (!events.Any())
                return NoContent();
            return Ok(events);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCalendarEvent(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var calendarEvent = await _calendarService.GetCalendarEventByIdAsync(userId, id);
            if (calendarEvent == null)
                return NoContent();
            return Ok(calendarEvent);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddCalendarEvent([FromBody] CalendarEventDto calendarEventDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            await _calendarService.AddCalendarEventAsync(calendarEventDto, userId);
            return CreatedAtAction(nameof(GetCalendarEvents), null);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCalendarEvent(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var deleted = await _calendarService.DeleteCalendarEventAsync(userId, id);
            return deleted ? NoContent() : NotFound();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditCalendarEvent(int id, [FromBody] EditCalendarEventDto dto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();
            var updatedEvent = await _calendarService.EditCalendarEventAsync(userId, dto, id);
            return updatedEvent is null ? NotFound() : Ok(updatedEvent);
        }

        private string? GetUserIdByClaimTypes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }
    }
}
