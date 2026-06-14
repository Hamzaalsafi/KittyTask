"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import type { ArchivedCard } from "@/lib/types";

export default function ArchivePage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["archived-cards"],
    queryFn: () => api.cards.archived(),
    enabled: !!user,
  });

  const restore = useMutation({
    mutationFn: (id: string) => api.cards.restore(id),
    onSuccess: () => {
      toast.success("Card restored to its board.");
      queryClient.invalidateQueries({ queryKey: ["archived-cards"] });
    },
    onError: () => toast.error("Couldn't restore the card."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.cards.remove(id),
    onSuccess: () => {
      toast.success("Card permanently deleted.");
      queryClient.invalidateQueries({ queryKey: ["archived-cards"] });
    },
    onError: () => toast.error("Couldn't delete the card."),
  });

  return (
    <div className="min-h-screen bg-zinc-900 px-4 pt-20 pb-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-slate-100">Cards Archive</h1>
        <p className="mb-6 text-sm text-slate-400">
          Archived cards are hidden from their boards but kept here. Restore them anytime, or delete them for good.
        </p>

        {isLoading ? (
          <p className="text-slate-400">Loading…</p>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-16 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat2.svg" alt="" className="mb-4 w-24 opacity-90" />
            <h2 className="mb-1 text-lg font-bold text-slate-100">Nothing archived</h2>
            <p className="max-w-sm text-sm text-slate-400">
              When you archive a card from a board (card menu → Archive), it will show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {cards.map((c: ArchivedCard) => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/60 p-3">
                <div className={`h-10 w-1.5 shrink-0 rounded-full ${c.background || "bg-gray-700"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-100">{c.title || "Empty Card"}</p>
                  <p className="truncate text-xs text-slate-500">
                    {c.boardTitle} · {c.listTitle}
                  </p>
                </div>
                <button
                  onClick={() => restore.mutate(c.id)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Restore
                </button>
                <button
                  onClick={() => remove.mutate(c.id)}
                  className="rounded-md bg-zinc-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
