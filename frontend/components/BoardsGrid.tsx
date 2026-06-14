"use client";

import { useState } from "react";
import { useBoards } from "@/lib/hooks";
import type { Visibility } from "@/lib/types";
import { MiniBoard } from "./MiniBoard";
import { CreateBoard } from "./CreateBoard";

interface BoardsGridProps {
  title: string;
  visibility: Visibility;
}

// Renders the user's boards filtered by visibility, matching the original
// "Your Boards" (private) and "Shared Boards" (shareable) sections.
export function BoardsGrid({ title, visibility }: BoardsGridProps) {
  const { data: boards = [] } = useBoards();
  const [createBoard, setCreateBoard] = useState(false);
  const filtered = boards.filter((b) => b.visibility === visibility);

  return (
    <div>
      {createBoard && (
        <button
          onClick={() => setCreateBoard(false)}
          className="absolute text-slate-300 py-1 px-2 left-[90%] sm:left-[70%] sm:top-[-5%] top-[-10%] rounded-xl text-2xl hover:bg-zinc-900"
        >
          &#x2715;
        </button>
      )}
      {!createBoard && (
        <div>
          <h1 className="text-gray-300 mt-2 mb-2 p-1 rounded-md text-xl flex justify-center items-center gap-4">{title}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 px-0 sm:px-7 md:grid-cols-3 mt-7 mx-4 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[65vh] shadow-sm">
            {filtered.map((board) => (
              <MiniBoard key={board.id} board={board} />
            ))}
            <div
              onClick={() => setCreateBoard(true)}
              className="h-[70px] flex justify-center items-center w-[130px] bg-neutral-700 opacity-90 cursor-pointer hover:opacity-70 border-gray-200 p-5 rounded-sm"
            >
              <h2 className="text-zinc-300 text-center text-sm">Create new board</h2>
            </div>
          </div>
        </div>
      )}
      {createBoard && <CreateBoard />}
    </div>
  );
}
