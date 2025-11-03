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
        [HttpGet("Routines")]
        public async Task<IActionResult> GetRoutines()
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var routineList = await _routineService.GetUserRoutines(userId);
            return Ok(routineList);
        }

        [Authorize]
        [HttpPost("CreateRoutine")]
        public async Task<IActionResult> CreateRoutine([FromBody] RoutineDto routineDto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            await _routineService.CreateRoutine(routineDto, userId);
            return Ok();
        }

        [Authorize]
        [HttpPut("EditRoutine/{id}")]
        public async Task<IActionResult> EditRoutine(int id, [FromBody] RoutineUpdateDto dto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var routine = await _routineService.EditRoutine(userId, id, dto);
            return Ok(routine);
        }

        [Authorize]
        [HttpDelete("DeleteRoutine/{id}")]
        public async Task<IActionResult> DeleteRoutine(int id)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var routine = await _routineService.DeleteRoutine(userId, id);
            return Ok(routine);
        }

        [Authorize]
        [HttpPut("completion/{id}")]
        public async Task<IActionResult> ChangeRoutineCompletion(int id, [FromBody] RoutineCompletionDto dto)
        {
            var userId = GetUserIdByClaimTypes();
            if (userId == null)
                return Unauthorized();

            var status = await _routineService.ChangeRoutineCompletion(userId, id, dto);
            return Ok(status);
        }

        private string? GetUserIdByClaimTypes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }
    }
}
