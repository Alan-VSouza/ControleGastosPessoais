using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleGastosPessoais.Api.Models
{
    // Define o tipo de transação (Receita ou Despesa)
    public enum TransactionType
    {
        Income, // Receita
        Expense // Despesa
    }

    [Table("transactions")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } // Chave estrangeira para o Usuário

        [Required]
        [MaxLength(255)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")] // Garante precisão para valores monetários
        public decimal Amount { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } // Data em que a transação ocorreu

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Propriedade de navegação
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}