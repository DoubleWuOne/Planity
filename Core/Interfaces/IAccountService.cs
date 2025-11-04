using Core.Entities.DTO;
using Microsoft.AspNetCore.Identity;

namespace Core.Interfaces
{
    public interface IAccountService
    {
        Task<UserDto?> Login(LoginDto loginDto, bool cookies);
        Task<IdentityResult?> Register(RegisterDto user);
        Task<bool> Logout();
        Task<UserDto?> GetUserInfo(string userEmail);
    }
}
