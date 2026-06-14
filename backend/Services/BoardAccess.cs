using KittyTask.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace KittyTask.Api.Services;

// Centralizes board membership/ownership authorization checks.
public class BoardAccess
{
    private readonly AppDbContext _db;

    public BoardAccess(AppDbContext db) => _db = db;

    public Task<bool> IsMember(string boardId, string userId) =>
        _db.BoardMembers.AnyAsync(m => m.BoardId == boardId && m.UserId == userId);

    public Task<bool> IsOwner(string boardId, string userId) =>
        _db.Boards.AnyAsync(b => b.Id == boardId && b.OwnerId == userId);

    // Resolves the board id that owns a given list.
    public Task<string?> BoardIdForList(string listId) =>
        _db.Lists.Where(l => l.Id == listId).Select(l => l.BoardId).FirstOrDefaultAsync();

    // Resolves the board id that owns a given card.
    public Task<string?> BoardIdForCard(string cardId) =>
        _db.Cards.Where(c => c.Id == cardId).Select(c => c.List!.BoardId).FirstOrDefaultAsync();
}
