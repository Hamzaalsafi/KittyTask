"use client";

import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { useEffect, useRef } from "react";
import { API_BASE } from "./api";
import { getToken } from "./token";

export type BoardEvent =
  | "ListCreated"
  | "ListUpdated"
  | "ListDeleted"
  | "ListsReordered"
  | "CardCreated"
  | "CardUpdated"
  | "CardDeleted"
  | "CardsReordered"
  | "CardMoved"
  | "BoardUpdated"
  | "BoardDeleted"
  | "MemberRemoved";

export type BoardEventHandlers = Partial<Record<BoardEvent, (payload: unknown) => void>>;

const EVENTS: BoardEvent[] = [
  "ListCreated", "ListUpdated", "ListDeleted", "ListsReordered",
  "CardCreated", "CardUpdated", "CardDeleted", "CardsReordered", "CardMoved",
  "BoardUpdated", "BoardDeleted", "MemberRemoved",
];

// Subscribes to realtime board updates over SignalR for the given board.
export function useBoardRealtime(boardId: string | undefined, handlers: BoardEventHandlers) {
  // Keep latest handlers in a ref so we don't reconnect on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!boardId) return;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/board`, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    let active = true;

    for (const ev of EVENTS) {
      connection.on(ev, (payload: unknown) => handlersRef.current[ev]?.(payload));
    }

    connection.onreconnected(() => {
      connection.invoke("JoinBoard", boardId).catch(() => {});
    });

    connection
      .start()
      .then(() => {
        if (active) return connection.invoke("JoinBoard", boardId);
      })
      .catch(() => {});

    return () => {
      active = false;
      connection.stop().catch(() => {});
    };
  }, [boardId]);
}
