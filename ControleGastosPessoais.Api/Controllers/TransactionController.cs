using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using ControleGastosPessoais.Api.Models;
using ControleGastosPessoais.Api.Services;

namespace ControleGastosPessoais.Api.Controllers
{
    [Authorize] // Rota protegida
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(ITransactionService transactionService, ILogger<TransactionController> logger)
        {
            _transactionService = transactionService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionRequest request)
        {
            // Tenta obter o ID do usuário dos claims do JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                // Isso não deve acontecer se a autenticação JWT estiver configurada corretamente, 
                // mas é uma boa prática defensiva.
                return Unauthorized(new TransactionResponse { Success = false, Message = "Usuário não autenticado ou ID inválido." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new TransactionResponse
                {
                    Success = false,
                    Message = "Dados de entrada inválidos."
                });
            }

            var result = await _transactionService.AddTransactionAsync(userId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Created(nameof(AddTransaction), result.Data);
        }
    }
}