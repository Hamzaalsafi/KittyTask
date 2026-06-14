using System.Security.Claims;
using KittyTask.Api.Data;
using KittyTask.Api.Domain;
using KittyTask.Api.Dtos;
using KittyTask.Api.Hubs;
using KittyTask.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace KittyTask.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/boards")]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly BoardAccess _access;
    private readonly IHubContext<BoardHub> _hub;

    public BoardsController(AppDbContext db, BoardAccess access, IHubContext<BoardHub> hub)
    {
        _db = db;
        _access = access;
        _hub = hub;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // All boards the current user owns or is a member of.
    [HttpGet]
    public async Task<ActionResult<List<BoardDto>>> List()
    {
        var boards = await _db.Boards
            .Where(b => b.Members.Any(m => m.UserId == UserId))
            .Include(b => b.Members).ThenInclude(m => m.User)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return boards.Select(BoardDto.From).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BoardDetailDto>> Get(string id)
    {
        if (!await _access.IsMember(id, UserId)) return Forbid();

        var board = await _db.Boards
            .Include(b => b.Members).ThenInclude(m => m.User)
            .Include(b => b.Lists).ThenInclude(l => l.Cards)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board is null) return NotFound();
        return BoardDetailDto.From(board);
    }

    [HttpPost]
    public async Task<ActionResult<BoardDto>> Create(CreateBoardDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Board title is required." });

        var board = new Board
        {
            OwnerId = UserId,
            Title = dto.Title,
            Background = dto.Background,
            BackgroundImage = dto.BackgroundImage,
            Visibility = dto.Visibility,
        };
        board.Members.Add(new BoardMember { BoardId = board.Id, UserId = UserId });

        _db.Boards.Add(board);
        await _db.SaveChangesAsync();

        await _db.Entry(board).Collection(b => b.Members).Query().Include(m => m.User).LoadAsync();
        return BoardDto.From(board);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<BoardDto>> Update(string id, UpdateBoardDto dto)
    {
        if (!await _access.IsOwner(id, UserId)) return Forbid();

        var board = await _db.Boards.Include(b => b.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (board is null) return NotFound();

        if (dto.Title is not null) board.Title = dto.Title;
        if (dto.Visibility is not null) board.Visibility = dto.Visibility.Value;
        if (dto.Background is not null) board.Background = dto.Background;
        if (dto.BackgroundImage is not null) board.BackgroundImage = dto.BackgroundImage;
        await _db.SaveChangesAsync();

        var result = BoardDto.From(board);
        await _hub.Clients.Group(BoardHub.GroupName(id)).SendAsync("BoardUpdated", result);
        return result;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!await _access.IsOwner(id, UserId)) return Forbid();

        var board = await _db.Boards.FindAsync(id);
        if (board is null) return NotFound();

        _db.Boards.Remove(board);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(BoardHub.GroupName(id)).SendAsync("BoardDeleted", id);
        return NoContent();
    }

    // ----- Members -----

    [HttpPost("{id}/members")]
    public async Task<ActionResult<BoardDto>> AddMember(string id, AddMemberDto dto)
    {
        if (!await _access.IsOwner(id, UserId)) return Forbid();

        var board = await _db.Boards.Include(b => b.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (board is null) return NotFound();
        if (board.Visibility != BoardVisibility.Shareable)
            return BadRequest(new { message = "This board is private. Make it shareable first." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == dto.Email.ToUpperInvariant());
        if (user is null) return NotFound(new { message = "No user with that email." });

        if (board.Members.All(m => m.UserId != user.Id))
        {
            board.Members.Add(new BoardMember { BoardId = id, UserId = user.Id, User = user });
            await _db.SaveChangesAsync();
        }

        var result = BoardDto.From(board);
        await _hub.Clients.Group(BoardHub.GroupName(id)).SendAsync("BoardUpdated", result);
        return result;
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(string id, string userId)
    {
        if (!await _access.IsOwner(id, UserId)) return Forbid();

        var board = await _db.Boards.FindAsync(id);
        if (board is null) return NotFound();
        if (userId == board.OwnerId) return BadRequest(new { message = "The owner cannot be removed." });

        var member = await _db.BoardMembers.FindAsync(id, userId);
        if (member is null) return NotFound();

        _db.BoardMembers.Remove(member);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(BoardHub.GroupName(id)).SendAsync("MemberRemoved", new { boardId = id, userId });
        return NoContent();
    }
}
