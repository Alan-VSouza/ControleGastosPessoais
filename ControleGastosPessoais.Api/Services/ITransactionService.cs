using System.Collections.Generic;
using System.Threading.Tasks;
using ControleGastosPessoais.Api.Models;

namespace ControleGastosPessoais.Api.Services
{
    public interface ITransactionService
    {
        Task<TransactionResponse> AddTransactionAsync(int userId, TransactionRequest request);

        decimal CalcularSaldo(int userId);
        Task AtualizarSaldoUsuario(int userId);

        Task<IEnumerable<Transaction>> GetUserTransactionsAsync(int userId);
        Task<TransactionResponse> UpdateTransactionAsync(int userId, int transactionId, TransactionRequest request);
        Task<TransactionResponse> DeleteTransactionAsync(int userId, int transactionId);
    }
}
