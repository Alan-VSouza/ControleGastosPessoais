using System;
using System.ComponentModel.DataAnnotations;

namespace ControleGastosPessoais.Api.Models
{
    public class TransactionRequest
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(255, MinimumLength = 3,
            ErrorMessage = "A descrição deve ter entre 3 e 255 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser positivo.")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "O tipo de transação é obrigatório (Income/Expense).")]
        public string Type { get; set; } = string.Empty; // Usamos string aqui e convertemos no Service

        [Required(ErrorMessage = "A data da transação é obrigatória.")]
        public DateTime TransactionDate { get; set; }
    }
    
    public class TransactionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}