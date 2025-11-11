using System.Threading.Tasks;
using ControleGastosPessoais.Api.Models;

namespace ControleGastosPessoais.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<bool> ValidateTokenAsync(string token);
        Task LogoutAsync(int userId, string token);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
    }
}
