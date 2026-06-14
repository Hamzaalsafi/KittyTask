import type { BoardDetail, Card, List } from "./types";

// Pure helpers that update a BoardDetail immutably. Shared by both local
// action handlers and incoming SignalR events so the two stay consistent and
// idempotent (applying the same change twice is a no-op).

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

export function upsertList(board: BoardDetail, list: List): BoardDetail {
  const exists = board.lists.some((l) => l.id === list.id);
  const lists = exists
    ? board.lists.map((l) => (l.id === list.id ? { ...l, ...list, cards: l.cards } : l))
    : [...board.lists, { ...list, cards: list.cards ?? [] }];
  return { ...board, lists: sortByOrder(lists) };
}

export function patchList(board: BoardDetail, listId: string, patch: Partial<List>): BoardDetail {
  return {
    ...board,
    lists: board.lists.map((l) => (l.id === listId ? { ...l, ...patch } : l)),
  };
}

export function removeList(board: BoardDetail, listId: string): BoardDetail {
  return { ...board, lists: board.lists.filter((l) => l.id !== listId) };
}

export function reorderLists(board: BoardDetail, orderedIds: string[]): BoardDetail {
  const lists = board.lists.map((l) => {
    const idx = orderedIds.indexOf(l.id);
    return idx >= 0 ? { ...l, order: idx } : l;
  });
  return { ...board, lists: sortByOrder(lists) };
}

function withListCards(board: BoardDetail, listId: string, fn: (cards: Card[]) => Card[]): BoardDetail {
  return {
    ...board,
    lists: board.lists.map((l) => (l.id === listId ? { ...l, cards: fn(l.cards) } : l)),
  };
}

export function upsertCard(board: BoardDetail, card: Card): BoardDetail {
  return withListCards(board, card.listId, (cards) => {
    const exists = cards.some((c) => c.id === card.id);
    const next = exists ? cards.map((c) => (c.id === card.id ? card : c)) : [...cards, card];
    return sortByOrder(next);
  });
}

export function removeCard(board: BoardDetail, listId: string, cardId: string): BoardDetail {
  return withListCards(board, listId, (cards) => cards.filter((c) => c.id !== cardId));
}

export function reorderCards(board: BoardDetail, listId: string, orderedIds: string[]): BoardDetail {
  return withListCards(board, listId, (cards) =>
    sortByOrder(
      cards.map((c) => {
        const idx = orderedIds.indexOf(c.id);
        return idx >= 0 ? { ...c, order: idx } : c;
      })
    )
  );
}

// Moves a card out of its previous list and into the one indicated by card.listId.
export function moveCard(board: BoardDetail, fromListId: string, card: Card): BoardDetail {
  const removed = removeCard(board, fromListId, card.id);
  return upsertCard(removed, card);
}
