namespace KittyTask.Api.Domain;

// Join entity that normalizes board sharing: one board, many members.
// Replaces the old Firestore model that copied a board into every member's subtree.
public class BoardMember
{
    public string BoardId { get; set; } = "";
    public Board? Board { get; set; }

    public string UserId { get; set; } = "";
    public ApplicationUser? User { get; set; }
}
