using Core.Entities.DTO;

namespace Core.Interfaces
{
    public interface IAccountService
    {
        Task<UserDto?> Login(LoginDto loginDto, bool cookies);
        Task<UserDto?> Register(RegisterDto user);
        Task<bool> Logout();
        Task<UserDto?> GetUserInfo(string userEmail);
    }
}
