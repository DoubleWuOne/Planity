using Core.Entities.DTO;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class RoutineController : BaseApiController
    {
        private readonly IRoutineService _routineService;

        public RoutineController(IRoutineService routineService)
        {
            _routineService = routineService;
        }

        [Authorize]
        [HttpPost("CreateRoutine")]
        public async Task<IActionResult> CreateRoutine([FromBody] RoutineDto routineDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            await _routineService.CreateRoutineAsync(routineDto, userId);
            return CreatedAtAction(nameof(GetRoutines), null);
        }

        [Authorize]
        [HttpGet("Routines")]
        public async Task<IActionResult> GetRoutines()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var routineList = await _routineService.GetUserRoutines(userId);
            if (!routineList.Any())
                return NoContent();

            return Ok(routineList);
        }

        [Authorize]
        [HttpPut("EditRoutine/{id}")]
        public async Task<IActionResult> EditRoutine(int id, [FromBody] RoutineUpdateDto dto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var edited = await _routineService.EditRoutine(userId, id, dto);
            return edited is null ? NotFound() : Ok(edited);
        }

        [Authorize]
        [HttpDelete("DeleteRoutine/{id}")]
        public async Task<IActionResult> DeleteRoutine(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var success = await _routineService.DeleteRoutine(userId, id);
            return success ? Ok(success) : NotFound();
        }

        [Authorize]
        [HttpPut("Completion/{id}")]
        public async Task<IActionResult> ChangeRoutineCompletion(int id, [FromBody] RoutineCompletionDto dto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var success = await _routineService.ChangeRoutineCompletion(userId, id, dto);
            return success ? Ok(success) : NotFound();
        }

        private string? GetUserIdByClaimTypes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }
    }
}
