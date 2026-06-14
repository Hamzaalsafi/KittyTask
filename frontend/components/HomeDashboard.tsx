"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useBoards } from "@/lib/hooks";
import type { Board } from "@/lib/types";
import { BoardTile } from "./BoardTile";

function WelcomeTip() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(localStorage.getItem("kt_welcome_dismissed") !== "1");
  }, []);
  if (!show) return null;
  return (
    <div className="relative mb-8 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-blue-500/10 p-5">
      <button
        onClick={() => {
          localStorage.setItem("kt_welcome_dismissed", "1");
          setShow(false);
        }}
        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <h2 className="mb-2 text-lg font-bold text-slate-100">👋 Welcome to KittyTask!</h2>
      <p className="mb-3 text-sm text-slate-300">Organize anything in three simple steps:</p>
      <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:gap-6">
        <span><b className="text-pink-400">1.</b> Create a <b>board</b> for a project</span>
        <span><b className="text-pink-400">2.</b> Add <b>lists</b> (e.g. To&nbsp;Do, Doing, Done)</span>
        <span><b className="text-pink-400">3.</b> Add <b>cards</b> for each task and drag them around</span>
      </div>
    </div>
  );
}

function Section({ title, hint, boards }: { title: string; hint: string; boards: Board[] }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        <span className="text-sm text-slate-500">{boards.length}</span>
      </div>
      {boards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-slate-500">{hint}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((b) => (
            <BoardTile key={b.id} board={b} />
          ))}
        </div>
      )}
    </section>
  );
}

export function HomeDashboard() {
  const { user } = useAuth();
  const { data: boards = [], isLoading } = useBoards();

  const owned = boards.filter((b) => b.visibility === "private");
  const shared = boards.filter((b) => b.visibility === "shareable");
  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="min-h-screen bg-zinc-900 px-4 pt-20 pb-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Hi {firstName} 👋</h1>
            <p className="text-sm text-slate-400">Here are your boards.</p>
          </div>
          <Link
            href="/create-board"
            className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-pink-600"
          >
            <span className="text-lg leading-none">＋</span> Create board
          </Link>
        </div>

        <WelcomeTip />

        {isLoading ? (
          <p className="text-slate-400">Loading your boards…</p>
        ) : boards.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-16 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat.svg" alt="" className="mb-4 w-28 opacity-90" />
            <h2 className="mb-1 text-xl font-bold text-slate-100">No boards yet</h2>
            <p className="mb-6 max-w-sm text-sm text-slate-400">
              Boards hold your lists and cards. Create your first board to start organizing your tasks.
            </p>
            <Link href="/create-board" className="rounded-lg bg-pink-500 px-6 py-2.5 font-semibold text-white shadow transition hover:bg-pink-600">
              ＋ Create your first board
            </Link>
          </div>
        ) : (
          <>
            <Section title="⭐ Your boards" hint="Private boards you create will appear here." boards={owned} />
            <Section title="👥 Shared boards" hint="Boards shared with you (or marked shareable) appear here." boards={shared} />
          </>
        )}
      </div>
    </div>
  );
}
