using Core.Entities;
using Core.Interfaces;
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
        public async Task<IActionResult> Register([FromBody] UserEntity user)
        {
            var status = await _accountService.Register(user);
            return Ok($"{status}");
        }

        [HttpGet("login")]
        public async Task<IActionResult> Login()
        {
            var login = await _accountService.Login();
            return Ok($"{login}");
        }
    }
}
