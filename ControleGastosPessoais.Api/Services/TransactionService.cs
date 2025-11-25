using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using ControleGastosPessoais.Api.Data;
using ControleGastosPessoais.Api.Models;

namespace ControleGastosPessoais.Api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TransactionService> _logger;

        public TransactionService(ApplicationDbContext context, ILogger<TransactionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TransactionResponse> AddTransactionAsync(int userId, TransactionRequest request)
        {
            try
            {
                // Validação e criação da entidade conforme já tem
                if (!Enum.TryParse(request.Type, true, out TransactionType type))
                {
                    return new TransactionResponse
                    {
                        Success = false,
                        Message = "Tipo de transação inválido. Use 'Income' (Receita) ou 'Expense' (Despesa)."
                    };
                }

                var transaction = new Transaction
                {
                    UserId = userId,
                    Description = request.Description,
                    Amount = request.Amount,
                    Type = type,
                    TransactionDate = request.TransactionDate.ToUniversalTime(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Transação adicionada com sucesso pelo Usuário {userId}. ID: {transaction.Id}");

                // Atualize o saldo do usuário após salvar a transação
                await AtualizarSaldoUsuario(userId);

                return new TransactionResponse
                {
                    Success = true,
                    Message = "Transação registrada com sucesso.",
                    Data = new
                    {
                        Id = transaction.Id,
                        Description = transaction.Description,
                        Amount = transaction.Amount,
                        Type = transaction.Type.ToString(),
                        TransactionDate = transaction.TransactionDate,
                        UserId = transaction.UserId
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao adicionar transação para o Usuário {userId}: {ex.Message}");
                return new TransactionResponse
                {
                    Success = false,
                    Message = "Erro interno ao registrar transação."
                };
            }
        }


        public async Task AtualizarSaldoUsuario(int userId)
        {
            decimal saldoAtual = CalcularSaldo(userId);
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.Saldo = saldoAtual;
                await _context.SaveChangesAsync();
            }
        }

        public decimal CalcularSaldo(int userId)
        {
            var receitas = _context.Transactions
                .Where(t => t.UserId == userId && t.Type == TransactionType.Income)
                .Sum(t => t.Amount);

            var despesas = _context.Transactions
                .Where(t => t.UserId == userId && t.Type == TransactionType.Expense)
                .Sum(t => t.Amount);

            return receitas - despesas;
        }

    }
}