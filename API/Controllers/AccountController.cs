using Core.Entities.DTO;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto user)
        {
            var status = await _accountService.Register(user);
            if (status == null)
                return BadRequest("User with this email already exists.");
            return Ok(status);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var status = await _accountService.Logout();
            return Ok(status);
        }

        [HttpGet("user")]
        public async Task<IActionResult> UserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return NotFound();

            var userDto = await _accountService.GetUserInfo(userId);
            if (userDto == null)
                return NotFound();
            return Ok(userDto);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto, [FromQuery] bool useCookies = false)
        {
            var login = await _accountService.Login(loginDto, useCookies);
            if (login == null)
                return Unauthorized();

            return Ok(login);
        }
    }
}
