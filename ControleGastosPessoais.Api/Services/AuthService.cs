using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using ControleGastosPessoais.Api.Data;
using ControleGastosPessoais.Api.Models;
using BCrypt.Net;

namespace ControleGastosPessoais.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration config,
            ILogger<AuthService> logger)
        {
            _context = context;
            _config = config;
            _logger = logger;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                // Buscar usuário
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

                if (user == null)
                {
                    _logger.LogWarning($"Tentativa de login com email inexistente: {request.Email}");
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Email ou senha incorretos"
                    };
                }

                // Validar senha
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Tentativa de login com senha incorreta para: {request.Email}");
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Email ou senha incorretos"
                    };
                }

                // Gerar token JWT
                var token = GenerateJwtToken(user);
                var expiresAt = DateTime.UtcNow.AddHours(24);

                // Salvar sessão
                var session = new UserSession
                {
                    UserId = user.Id,
                    Token = token,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    IsValid = true
                };

                _context.UserSessions.Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Login bem-sucedido para: {user.Email}");

                return new AuthResponse
                {
                    Success = true,
                    Message = "Login realizado com sucesso",
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao autenticar: {ex.Message}");
                return new AuthResponse
                {
                    Success = false,
                    Message = "Erro ao processar login"
                };
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.Token == token
                        && s.IsValid
                        && s.ExpiresAt > DateTime.UtcNow);

                return session != null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao validar token: {ex.Message}");
                return false;
            }
        }

        public async Task LogoutAsync(int userId, string token)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.Token == token);

                if (session != null)
                {
                    session.IsValid = false;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Logout realizado para usuário: {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao fazer logout: {ex.Message}");
            }
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Verificar se email já existe
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    _logger.LogWarning($"Tentativa de registro com email já existente: {request.Email}");
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Este email já está registrado"
                    };
                }

                // Criar novo usuário
                var user = new User
                {
                    Email = request.Email,
                    FullName = request.FullName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Novo usuário registrado: {user.Email}");

                return new AuthResponse
                {
                    Success = true,
                    Message = "Registro realizado com sucesso. Faça login para continuar.",
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao registrar usuário: {ex.Message}");
                return new AuthResponse
                {
                    Success = false,
                    Message = "Erro ao processar registro"
                };
            }
        }
    }
}
