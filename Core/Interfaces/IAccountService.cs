using Core.Entities;

namespace Core.Interfaces
{
    public interface IAccountService
    {
        Task<bool> Login();
        Task<bool> Register(UserEntity user);
    }
}
