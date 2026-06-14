using Microsoft.AspNetCore.Identity;

namespace KittyTask.Api.Domain;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = "";
    public string AvatarColor { get; set; } = "";
    public string AvatarInitials { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BoardMember> Memberships { get; set; } = new List<BoardMember>();
    public ICollection<Board> OwnedBoards { get; set; } = new List<Board>();
}
