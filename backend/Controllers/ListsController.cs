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
[Route("api")]
public class ListsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly BoardAccess _access;
    private readonly IHubContext<BoardHub> _hub;

    public ListsController(AppDbContext db, BoardAccess access, IHubContext<BoardHub> hub)
    {
        _db = db;
        _access = access;
        _hub = hub;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private Task Broadcast(string boardId, string ev, object payload) =>
        _hub.Clients.Group(BoardHub.GroupName(boardId)).SendAsync(ev, payload);

    [HttpPost("boards/{boardId}/lists")]
    public async Task<ActionResult<ListDto>> Create(string boardId, CreateListDto dto)
    {
        if (!await _access.IsMember(boardId, UserId)) return Forbid();

        var count = await _db.Lists.CountAsync(l => l.BoardId == boardId);
        var list = new BoardList { BoardId = boardId, Title = dto.Title, Order = count };
        _db.Lists.Add(list);
        await _db.SaveChangesAsync();

        var result = ListDto.From(list);
        await Broadcast(boardId, "ListCreated", result);
        return result;
    }

    [HttpPatch("lists/{id}")]
    public async Task<ActionResult<ListDto>> Update(string id, UpdateListDto dto)
    {
        var list = await _db.Lists.Include(l => l.Cards.Where(c => !c.IsArchived)).FirstOrDefaultAsync(l => l.Id == id);
        if (list is null) return NotFound();
        if (!await _access.IsMember(list.BoardId, UserId)) return Forbid();

        list.Title = dto.Title;
        await _db.SaveChangesAsync();

        var result = ListDto.From(list);
        await Broadcast(list.BoardId, "ListUpdated", result);
        return result;
    }

    [HttpDelete("lists/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var list = await _db.Lists.FindAsync(id);
        if (list is null) return NotFound();
        if (!await _access.IsMember(list.BoardId, UserId)) return Forbid();

        _db.Lists.Remove(list);
        await _db.SaveChangesAsync();

        await Broadcast(list.BoardId, "ListDeleted", new { boardId = list.BoardId, listId = id });
        return NoContent();
    }

    // Bulk reorder: OrderedIds is the new left-to-right order of lists.
    [HttpPut("boards/{boardId}/lists/order")]
    public async Task<IActionResult> Reorder(string boardId, ReorderDto dto)
    {
        if (!await _access.IsMember(boardId, UserId)) return Forbid();

        var lists = await _db.Lists.Where(l => l.BoardId == boardId).ToListAsync();
        foreach (var list in lists)
        {
            var idx = dto.OrderedIds.IndexOf(list.Id);
            if (idx >= 0) list.Order = idx;
        }
        await _db.SaveChangesAsync();

        await Broadcast(boardId, "ListsReordered", new { boardId, orderedIds = dto.OrderedIds });
        return NoContent();
    }
}
