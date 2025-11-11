using System.ComponentModel.DataAnnotations;

namespace ControleGastosPessoais.Api.Models
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(255, MinimumLength = 3,
            ErrorMessage = "Nome deve ter entre 3 e 255 caracteres")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Senha deve ter entre 6 e 100 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
        [Compare("Password", ErrorMessage = "As senhas não coincidem")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
