import { getToken } from "./token";
import type { ArchivedCard, AuthResponse, Board, BoardDetail, Card, List, User, Visibility } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5043";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const body = (data: unknown) => JSON.stringify(data);

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: body({ name, email, password }) }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: body({ email, password }) }),
    me: () => request<User>("/auth/me"),
  },

  users: {
    byEmail: (email: string) => request<User>(`/users?email=${encodeURIComponent(email)}`),
  },

  boards: {
    list: () => request<Board[]>("/boards"),
    get: (id: string) => request<BoardDetail>(`/boards/${id}`),
    create: (data: { title: string; background: string; backgroundImage: string; visibility: Visibility }) =>
      request<Board>("/boards", { method: "POST", body: body(data) }),
    update: (id: string, data: { title?: string; visibility?: Visibility; background?: string; backgroundImage?: string }) =>
      request<Board>(`/boards/${id}`, { method: "PATCH", body: body(data) }),
    remove: (id: string) => request<void>(`/boards/${id}`, { method: "DELETE" }),
    addMember: (id: string, email: string) =>
      request<Board>(`/boards/${id}/members`, { method: "POST", body: body({ email }) }),
    removeMember: (id: string, userId: string) =>
      request<void>(`/boards/${id}/members/${userId}`, { method: "DELETE" }),
  },

  lists: {
    create: (boardId: string, title: string) =>
      request<List>(`/boards/${boardId}/lists`, { method: "POST", body: body({ title }) }),
    update: (id: string, title: string) =>
      request<List>(`/lists/${id}`, { method: "PATCH", body: body({ title }) }),
    remove: (id: string) => request<void>(`/lists/${id}`, { method: "DELETE" }),
    reorder: (boardId: string, orderedIds: string[]) =>
      request<void>(`/boards/${boardId}/lists/order`, { method: "PUT", body: body({ orderedIds }) }),
  },

  cards: {
    create: (listId: string, title: string) =>
      request<Card>(`/lists/${listId}/cards`, { method: "POST", body: body({ title }) }),
    update: (id: string, data: { title?: string; background?: string; labels?: boolean[] }) =>
      request<Card>(`/cards/${id}`, { method: "PATCH", body: body(data) }),
    remove: (id: string) => request<void>(`/cards/${id}`, { method: "DELETE" }),
    reorder: (listId: string, orderedIds: string[]) =>
      request<void>(`/lists/${listId}/cards/order`, { method: "PUT", body: body({ orderedIds }) }),
    move: (id: string, targetListId: string, newOrder?: number) =>
      request<Card>(`/cards/${id}/move`, { method: "POST", body: body({ targetListId, newOrder }) }),
    copy: (sourceCardId: string, targetListId: string) =>
      request<Card>("/cards/copy", { method: "POST", body: body({ sourceCardId, targetListId }) }),
    archive: (id: string) => request<void>(`/cards/${id}/archive`, { method: "POST" }),
    restore: (id: string) => request<Card>(`/cards/${id}/restore`, { method: "POST" }),
    archived: () => request<ArchivedCard[]>("/cards/archived"),
  },
};
