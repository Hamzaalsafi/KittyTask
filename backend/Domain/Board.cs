namespace KittyTask.Api.Domain;

public enum BoardVisibility
{
    Private,
    Shareable
}

public class Board
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OwnerId { get; set; } = "";
    public ApplicationUser? Owner { get; set; }

    public string Title { get; set; } = "";
    public string Background { get; set; } = "";
    public string BackgroundImage { get; set; } = "";
    public BoardVisibility Visibility { get; set; } = BoardVisibility.Private;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BoardMember> Members { get; set; } = new List<BoardMember>();
    public ICollection<BoardList> Lists { get; set; } = new List<BoardList>();
}
