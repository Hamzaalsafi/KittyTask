using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace KittyTask.Api.Hubs;

[Authorize]
public class BoardHub : Hub
{
    // Clients call these to join/leave the realtime group for a board.
    public Task JoinBoard(string boardId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GroupName(boardId));

    public Task LeaveBoard(string boardId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(boardId));

    public static string GroupName(string boardId) => $"board:{boardId}";
}
