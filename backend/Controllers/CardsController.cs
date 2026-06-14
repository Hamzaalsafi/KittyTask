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
public class CardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly BoardAccess _access;
    private readonly IHubContext<BoardHub> _hub;

    public CardsController(AppDbContext db, BoardAccess access, IHubContext<BoardHub> hub)
    {
        _db = db;
        _access = access;
        _hub = hub;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private Task Broadcast(string boardId, string ev, object payload) =>
        _hub.Clients.Group(BoardHub.GroupName(boardId)).SendAsync(ev, payload);

    [HttpPost("lists/{listId}/cards")]
    public async Task<ActionResult<CardDto>> Create(string listId, CreateCardDto dto)
    {
        var boardId = await _access.BoardIdForList(listId);
        if (boardId is null) return NotFound();
        if (!await _access.IsMember(boardId, UserId)) return Forbid();

        var count = await _db.Cards.CountAsync(c => c.ListId == listId && !c.IsArchived);
        var card = new Card { ListId = listId, Title = dto.Title, Order = count };
        _db.Cards.Add(card);
        await _db.SaveChangesAsync();

        var result = CardDto.From(card);
        await Broadcast(boardId, "CardCreated", result);
        return result;
    }

    // Archive a card: hide it from the board but keep it for the archive view.
    [HttpPost("cards/{id}/archive")]
    public async Task<IActionResult> Archive(string id)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        var boardId = await _access.BoardIdForCard(id);
        if (boardId is null || !await _access.IsMember(boardId, UserId)) return Forbid();

        card.IsArchived = true;
        card.ArchivedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await Broadcast(boardId, "CardDeleted", new { boardId, listId = card.ListId, cardId = id });
        return NoContent();
    }

    // Restore an archived card back onto its list.
    [HttpPost("cards/{id}/restore")]
    public async Task<ActionResult<CardDto>> Restore(string id)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        var boardId = await _access.BoardIdForCard(id);
        if (boardId is null || !await _access.IsMember(boardId, UserId)) return Forbid();

        card.IsArchived = false;
        card.ArchivedAt = null;
        card.Order = await _db.Cards.CountAsync(c => c.ListId == card.ListId && !c.IsArchived);
        await _db.SaveChangesAsync();

        var result = CardDto.From(card);
        await Broadcast(boardId, "CardCreated", result);
        return result;
    }

    // All archived cards across boards the current user belongs to.
    [HttpGet("cards/archived")]
    public async Task<ActionResult<List<ArchivedCardDto>>> Archived()
    {
        var cards = await _db.Cards
            .Where(c => c.IsArchived && c.List!.Board!.Members.Any(m => m.UserId == UserId))
            .Include(c => c.List!).ThenInclude(l => l.Board!)
            .OrderByDescending(c => c.ArchivedAt)
            .ToListAsync();

        return cards.Select(c => new ArchivedCardDto(
            c.Id, c.Title, c.Background, c.Labels,
            c.ListId, c.List!.Title,
            c.List.BoardId, c.List.Board!.Title,
            c.ArchivedAt)).ToList();
    }

    [HttpPatch("cards/{id}")]
    public async Task<ActionResult<CardDto>> Update(string id, UpdateCardDto dto)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        var boardId = await _access.BoardIdForCard(id);
        if (boardId is null || !await _access.IsMember(boardId, UserId)) return Forbid();

        if (dto.Title is not null) card.Title = dto.Title;
        if (dto.Background is not null) card.Background = dto.Background;
        if (dto.Labels is not null && dto.Labels.Length == 8) card.Labels = dto.Labels;
        await _db.SaveChangesAsync();

        var result = CardDto.From(card);
        await Broadcast(boardId, "CardUpdated", result);
        return result;
    }

    [HttpDelete("cards/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        var boardId = await _access.BoardIdForCard(id);
        if (boardId is null || !await _access.IsMember(boardId, UserId)) return Forbid();

        _db.Cards.Remove(card);
        await _db.SaveChangesAsync();

        await Broadcast(boardId, "CardDeleted", new { boardId, listId = card.ListId, cardId = id });
        return NoContent();
    }

    // Bulk reorder cards within a list.
    [HttpPut("lists/{listId}/cards/order")]
    public async Task<IActionResult> Reorder(string listId, ReorderDto dto)
    {
        var boardId = await _access.BoardIdForList(listId);
        if (boardId is null) return NotFound();
        if (!await _access.IsMember(boardId, UserId)) return Forbid();

        var cards = await _db.Cards.Where(c => c.ListId == listId).ToListAsync();
        foreach (var card in cards)
        {
            var idx = dto.OrderedIds.IndexOf(card.Id);
            if (idx >= 0) card.Order = idx;
        }
        await _db.SaveChangesAsync();

        await Broadcast(boardId, "CardsReordered", new { boardId, listId, orderedIds = dto.OrderedIds });
        return NoContent();
    }

    // Move a card to another list (within the same board).
    [HttpPost("cards/{id}/move")]
    public async Task<ActionResult<CardDto>> Move(string id, MoveCardDto dto)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        var boardId = await _access.BoardIdForCard(id);
        if (boardId is null || !await _access.IsMember(boardId, UserId)) return Forbid();

        var targetBoardId = await _access.BoardIdForList(dto.TargetListId);
        if (targetBoardId != boardId) return BadRequest(new { message = "Target list must be on the same board." });

        var fromListId = card.ListId;
        card.ListId = dto.TargetListId;
        card.Order = dto.NewOrder ?? await _db.Cards.CountAsync(c => c.ListId == dto.TargetListId && !c.IsArchived);
        await _db.SaveChangesAsync();

        var result = CardDto.From(card);
        await Broadcast(boardId, "CardMoved", new { boardId, fromListId, card = result });
        return result;
    }

    // Copy a card into a target list (replaces the old "copy card link" feature).
    [HttpPost("cards/copy")]
    public async Task<ActionResult<CardDto>> Copy(CopyCardDto dto)
    {
        var source = await _db.Cards.FindAsync(dto.SourceCardId);
        if (source is null) return NotFound(new { message = "Source card not found." });

        var sourceBoardId = await _access.BoardIdForCard(dto.SourceCardId);
        if (sourceBoardId is null || !await _access.IsMember(sourceBoardId, UserId)) return Forbid();

        var targetBoardId = await _access.BoardIdForList(dto.TargetListId);
        if (targetBoardId is null) return NotFound(new { message = "Target list not found." });
        if (!await _access.IsMember(targetBoardId, UserId)) return Forbid();

        var count = await _db.Cards.CountAsync(c => c.ListId == dto.TargetListId && !c.IsArchived);
        var copy = new Card
        {
            ListId = dto.TargetListId,
            Title = source.Title,
            Background = source.Background,
            Labels = (bool[])source.Labels.Clone(),
            Order = count,
        };
        _db.Cards.Add(copy);
        await _db.SaveChangesAsync();

        var result = CardDto.From(copy);
        await Broadcast(targetBoardId, "CardCreated", result);
        return result;
    }
}
