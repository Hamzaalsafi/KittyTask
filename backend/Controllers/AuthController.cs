using System.Security.Claims;
using KittyTask.Api.Domain;
using KittyTask.Api.Dtos;
using KittyTask.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace KittyTask.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly TokenService _tokens;

    public AuthController(UserManager<ApplicationUser> users, TokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Please fill in name, email, and password." });

        if (await _users.FindByEmailAsync(dto.Email) is not null)
            return Conflict(new { message = "An account with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name,
            AvatarColor = ColorFromName(dto.Name),
            AvatarInitials = InitialsFromName(dto.Name),
            CreatedAt = DateTime.UtcNow,
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return new AuthResponseDto(_tokens.CreateToken(user), UserDto.From(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null || !await _users.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        return new AuthResponseDto(_tokens.CreateToken(user), UserDto.From(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id is null) return Unauthorized();
        var user = await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();
        return UserDto.From(user);
    }

    // Ports getColorFromName from the original frontend (src/Login.jsx).
    private static string ColorFromName(string name)
    {
        int hash = 0;
        foreach (var ch in name)
            hash = ch + ((hash << 5) - hash);
        int hue = ((hash % 360) + 360) % 360;
        return $"hsl({hue}, 70%, 80%)";
    }

    // Ports getInitials from the original frontend (src/Login.jsx).
    private static string InitialsFromName(string name) =>
        string.Concat(name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part[0]));
}
