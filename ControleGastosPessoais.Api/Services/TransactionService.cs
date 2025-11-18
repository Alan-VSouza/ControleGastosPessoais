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
                // 1. Validar e converter o tipo de transação (Income/Expense)
                if (!Enum.TryParse(request.Type, true, out TransactionType type))
                {
                    return new TransactionResponse
                    {
                        Success = false,
                        Message = "Tipo de transação inválido. Use 'Income' (Receita) ou 'Expense' (Despesa)."
                    };
                }

                // 2. Criar a entidade de transação
                var transaction = new Transaction
                {
                    UserId = userId,
                    Description = request.Description,
                    Amount = request.Amount,
                    Type = type,
                    TransactionDate = request.TransactionDate.ToUniversalTime(),
                    CreatedAt = DateTime.UtcNow
                };

                // 3. Salvar no banco de dados
                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Transação adicionada com sucesso pelo Usuário {userId}. ID: {transaction.Id}");

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
    }
}