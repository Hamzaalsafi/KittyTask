using KittyTask.Api.Data;
using KittyTask.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KittyTask.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    // Lookup a user by email (used by the share dialog).
    [HttpGet]
    public async Task<ActionResult<UserDto>> ByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "email is required" });
        var user = await _db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant());
        if (user is null) return NotFound(new { message = "No user with that email." });
        return UserDto.From(user);
    }
}
