namespace KittyTask.Api.Domain;

public class BoardList
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BoardId { get; set; } = "";
    public Board? Board { get; set; }

    public string Title { get; set; } = "";
    public int Order { get; set; }

    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
