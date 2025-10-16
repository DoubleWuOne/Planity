using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly PlanityDbContext _context;

        public AccountService(PlanityDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Login()
        {
            //check if user exists
            //check if password is correct

            return false;
        }

        public async Task<bool> Register(UserEntity user)
        {
            //check if email exists
            //hash password
            //save user
            bool existingUser = await CheckIfUserWithMailExist(user.Email);
            if (!existingUser)
                return false;

            user.CreatedAt = DateTime.Now;
            await _context.AddAsync(user);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<bool> CheckIfUserWithMailExist(string userEmail)
        {
            return await _context.Users.AnyAsync(x => x.Email == userEmail);
        }
    }
}
