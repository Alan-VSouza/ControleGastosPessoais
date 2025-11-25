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

        [Authorize] 
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
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

        [Authorize] 
        [HttpGet("saldo/{userId}")]
        public IActionResult ObterSaldo(int userId)
        {
            var saldo = _transactionService.CalcularSaldo(userId);
            return Ok(saldo);
        }
    }
}
