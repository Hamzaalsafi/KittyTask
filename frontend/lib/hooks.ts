"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "./auth";

// Fetches all boards the current user owns or is a member of.
export function useBoards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => api.boards.list(),
    enabled: !!user,
  });
}
