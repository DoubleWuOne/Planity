using Core.Entities.DTO;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            return Ok($"{status}");
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var status = await _accountService.Logout();
            return Ok($"{status}");
        }

        //not working, just for testing purpose
        [HttpGet("login")]
        public async Task<IActionResult> Login()
        {
            var login = await _accountService.Login();
            return Ok($"{login}");
        }
    }
}
