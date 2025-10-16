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

        public AccountService(PlanityDbContext context, SignInManager<UserEntity> signInManager)
        {
            _context = context;
            _signInManager = signInManager;
        }

        public async Task<bool> Login()
        {
            return false;
        }

        public async Task<bool> Register(RegisterDto user)
        {
            var userEntity = new UserEntity
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.Email
            };
            userEntity.CreatedAt = DateTime.Now;
            await _signInManager.UserManager.CreateAsync(userEntity, user.Password);

            return true;
        }

        public async Task<bool> Logout()
        {
            await _signInManager.SignOutAsync();

            return true;
        }

        private async Task<bool> CheckIfUserWithMailExist(string userEmail)
        {
            return await _context.Users.AnyAsync(x => x.Email == userEmail);
        }
    }
}
