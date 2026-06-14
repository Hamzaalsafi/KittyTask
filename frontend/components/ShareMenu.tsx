"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Board, User, Visibility } from "@/lib/types";

interface ShareMenuProps {
  boardId: string;
  visibility: Visibility;
  members: User[];
  onMembersChange: (board: Board) => void;
}

export function ShareMenu({ boardId, visibility, members, onMembersChange }: ShareMenuProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const addMember = async () => {
    setError("");
    if (!email) return;
    try {
      const board = await api.boards.addMember(boardId, email);
      onMembersChange(board);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member.");
    }
  };

  return (
    <div className="bg-zinc-800 flex flex-col absolute sm:top-24 top-[5.55em] z-[10000] right-3 h-fit w-fit py-3 rounded-lg px-3.5 justify-start">
      {visibility === "private" && (
        <div className="w-[100%] top-[-.2%] p-1 right-[.1px] h-[100%] absolute rounded-lg bg-zinc-950 bg-opacity-85 flex justify-center items-center">
          <div className="flex flex-col">
            <h1 className="text-gray-300 text-center text-lg">This Board is private.</h1>
            <p className="text-gray-300 text-center text-sm">To share it with others, switch it to shareable mode.</p>
          </div>
        </div>
      )}
      <h1 className="text-gray-300 text-lg">Share Board</h1>
      <div>
        <div className="flex gap-2.5 mt-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
            placeholder="Enter Email address"
            className="text:xl p-1.5 px-2.5 pr-12 h-fit rounded-md border-solid border-slate-400 focus:border-solid focus:border-blue-500 focus:box-shadow border-2 focus:outline-none bg-gray-800 text-sm text-slate-300"
          />
          <button onClick={addMember} type="submit" className="text-zinc-800 bg-blue-500 hover:bg-blue-600 h-fit p-1.5 px-2 rounded-md">
            Share
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="mt-7">
        <h3 className="text-gray-300 text-[.9rem]">
          Board members <span className="rounded-[50%] w-fit h-fit p-.5 px-1 bg-slate-600 text-gray-300">{members.length}</span>
        </h3>
        <hr className="w-full h-px mt-1 bg-gray-200 border-0 dark:bg-gray-500 opacity-90" />
      </div>
      <div>
        {members.map((member, index) => (
          <div key={member.id} className="mt-1 flex items-center gap-2">
            <div>
              <div
                className="pointer-events-none select-none"
                style={{
                  backgroundColor: member.avatarColor,
                  color: "#fff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  border: "1.5px solid #555",
                }}
              >
                {member.avatarInitials.toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-gray-300 text-opacity-95">
                {member.name} {index === 0 ? "(you)" : ""}
              </h1>
              <p className="text-gray-300 text-sm -mt-1 text-opacity-85">@{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
