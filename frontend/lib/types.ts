export type Visibility = "private" | "shareable";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarInitials: string;
}

export interface Board {
  id: string;
  title: string;
  background: string;
  backgroundImage: string;
  visibility: Visibility;
  ownerId: string;
  members: User[];
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  order: number;
  background: string;
  labels: boolean[];
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface BoardDetail extends Board {
  lists: List[];
}

export interface ArchivedCard {
  id: string;
  title: string;
  background: string;
  labels: boolean[];
  listId: string;
  listTitle: string;
  boardId: string;
  boardTitle: string;
  archivedAt: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
