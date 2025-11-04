using Core.Entities;
using Core.Entities.DTO;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly PlanityDbContext _context;
        private readonly SignInManager<UserEntity> _signInManager;
        private readonly UserManager<UserEntity> _userManager;

        public AccountService(PlanityDbContext context, SignInManager<UserEntity> signInManager, UserManager<UserEntity> userManager)
        {
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        public async Task<UserDto?> Login(LoginDto loginDto, bool cookies)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                return null;

            var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, cookies, lockoutOnFailure: false);
            if (!result.Succeeded)
                return null;

            return new UserDto
            {
                Email = user.Email!,
                FirstName = user.FirstName!
            };
        }

        public async Task<UserDto?> Register(RegisterDto user)
        {
            var mail = await _userManager.FindByEmailAsync(user.Email);
            if (mail != null)
                return null;

            var userEntity = new UserEntity
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.Email,
                CreatedAt = DateTime.Now
            };
            await _signInManager.UserManager.CreateAsync(userEntity, user.Password);

            return new UserDto
            {
                Email = user.Email,
                FirstName = user.FirstName,
            };
        }

        public async Task<bool> Logout()
        {
            await _signInManager.SignOutAsync();

            return true;
        }

        public async Task<UserDto?> GetUserInfo(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userEmail);
            if (user == null)
                return null;

            return new UserDto
            {
                Email = user.Email!,
                FirstName = user.FirstName!,
            };
        }
    }
}
