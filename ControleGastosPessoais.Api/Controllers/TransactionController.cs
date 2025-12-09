using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ControleGastosPessoais.Api.Models;
using ControleGastosPessoais.Api.Services;

namespace ControleGastosPessoais.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(ITransactionService transactionService, ILogger<TransactionController> logger)
        {
            _transactionService = transactionService;
            _logger = logger;
        }

        private int GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return 0;
            }
            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionRequest request)
        {
            var userId = GetUserIdFromClaims();
            if (userId == 0)
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

        [HttpGet]
        public async Task<IActionResult> GetMyTransactions()
        {
            var userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized();
            }

            var transactions = await _transactionService.GetUserTransactionsAsync(userId);
            return Ok(transactions);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionRequest request)
        {
            var userId = GetUserIdFromClaims();
            if (userId == 0)
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

            var result = await _transactionService.UpdateTransactionAsync(userId, id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized(new TransactionResponse { Success = false, Message = "Usuário não autenticado ou ID inválido." });
            }

            var result = await _transactionService.DeleteTransactionAsync(userId, id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("saldo")]
        public IActionResult ObterSaldo()
        {
            var userId = GetUserIdFromClaims();
            if (userId == 0)
            {
                return Unauthorized();
            }

            var saldo = _transactionService.CalcularSaldo(userId);
            return Ok(saldo);
        }
    }
}
