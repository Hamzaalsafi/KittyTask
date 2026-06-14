namespace KittyTask.Api.Domain;

public class Card
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ListId { get; set; } = "";
    public BoardList? List { get; set; }

    public string Title { get; set; } = "";
    public int Order { get; set; }
    public string Background { get; set; } = "bg-gray-800";

    // 8 label toggles, stored as a PostgreSQL boolean[] column.
    public bool[] Labels { get; set; } = new bool[8];
}
