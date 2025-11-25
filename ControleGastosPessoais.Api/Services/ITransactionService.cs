using System.Threading.Tasks;
using ControleGastosPessoais.Api.Models;

namespace ControleGastosPessoais.Api.Services
{
    public interface ITransactionService
    {
        Task<TransactionResponse> AddTransactionAsync(int userId, TransactionRequest request);

        decimal CalcularSaldo(int userId);

        Task AtualizarSaldoUsuario(int userId);
    }
}