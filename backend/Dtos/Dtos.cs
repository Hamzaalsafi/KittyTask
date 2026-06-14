using System.ComponentModel.DataAnnotations;
using KittyTask.Api.Domain;

namespace KittyTask.Api.Dtos;

// ----- Auth -----
public record RegisterDto(
    [Required(ErrorMessage = "Name is required."), StringLength(60, MinimumLength = 1)] string Name,
    [Required(ErrorMessage = "Email is required."), EmailAddress(ErrorMessage = "Enter a valid email address.")] string Email,
    [Required(ErrorMessage = "Password is required."), MinLength(6, ErrorMessage = "Password must be at least 6 characters.")] string Password);
public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password);
public record AuthResponseDto(string Token, UserDto User);

// ----- Users -----
public record UserDto(string Id, string Name, string Email, string AvatarColor, string AvatarInitials)
{
    public static UserDto From(ApplicationUser u) =>
        new(u.Id, u.Name, u.Email ?? "", u.AvatarColor, u.AvatarInitials);
}

// ----- Boards -----
public record CreateBoardDto(
    [Required(ErrorMessage = "Board title is required."), StringLength(120, MinimumLength = 1)] string Title,
    string Background, string BackgroundImage, BoardVisibility Visibility);
public record UpdateBoardDto(string? Title, BoardVisibility? Visibility, string? Background, string? BackgroundImage);

public record BoardDto(
    string Id,
    string Title,
    string Background,
    string BackgroundImage,
    BoardVisibility Visibility,
    string OwnerId,
    List<UserDto> Members)
{
    public static BoardDto From(Board b) => new(
        b.Id, b.Title, b.Background, b.BackgroundImage, b.Visibility, b.OwnerId,
        b.Members.Where(m => m.User != null).Select(m => UserDto.From(m.User!)).ToList());
}

public record BoardDetailDto(
    string Id,
    string Title,
    string Background,
    string BackgroundImage,
    BoardVisibility Visibility,
    string OwnerId,
    List<UserDto> Members,
    List<ListDto> Lists)
{
    public static BoardDetailDto From(Board b) => new(
        b.Id, b.Title, b.Background, b.BackgroundImage, b.Visibility, b.OwnerId,
        b.Members.Where(m => m.User != null).Select(m => UserDto.From(m.User!)).ToList(),
        b.Lists.OrderBy(l => l.Order).Select(ListDto.From).ToList());
}

// ----- Members -----
public record AddMemberDto([Required, EmailAddress(ErrorMessage = "Enter a valid email address.")] string Email);

// ----- Lists -----
public record CreateListDto([Required(ErrorMessage = "List title is required."), StringLength(120, MinimumLength = 1)] string Title);
public record UpdateListDto(string Title);
public record ReorderDto(List<string> OrderedIds);

public record ListDto(string Id, string BoardId, string Title, int Order, List<CardDto> Cards)
{
    public static ListDto From(BoardList l) => new(
        l.Id, l.BoardId, l.Title, l.Order,
        l.Cards.OrderBy(c => c.Order).Select(CardDto.From).ToList());
}

// ----- Cards -----
public record CreateCardDto(string Title);
public record UpdateCardDto(string? Title, string? Background, bool[]? Labels);
public record MoveCardDto(string TargetListId, int? NewOrder);
public record CopyCardDto(string SourceCardId, string TargetListId);

public record CardDto(string Id, string ListId, string Title, int Order, string Background, bool[] Labels)
{
    public static CardDto From(Card c) => new(c.Id, c.ListId, c.Title, c.Order, c.Background, c.Labels);
}

public record ArchivedCardDto(
    string Id,
    string Title,
    string Background,
    bool[] Labels,
    string ListId,
    string ListTitle,
    string BoardId,
    string BoardTitle,
    DateTime? ArchivedAt);
