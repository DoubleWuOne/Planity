using Core.Entities.DTO;

namespace Core.Interfaces
{
    public interface IAccountService
    {
        Task<bool> Login();
        Task<bool> Register(RegisterDto user);
        Task<bool> Logout();
    }
}
