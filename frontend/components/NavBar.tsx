"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useBoards } from "@/lib/hooks";
import { CatLogo } from "./CatLogo";
import { UserMenu } from "./UserMenu";
import { MiniBoard } from "./MiniBoard";

export function NavBar() {
  const { user } = useAuth();
  const { data: boards = [] } = useBoards();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const boardMenuRef = useRef<HTMLDivElement>(null);
  const [boardMenu, setBoardMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) setBoardMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarColor = user?.avatarColor || "#111827";
  const avatarInitials = user?.avatarInitials || "A";
  const userName = user?.name || "Guest";
  const userEmail = user?.email || "example@example.com";

  return (
    <div>
      {isOpen && (
        <div ref={dropdownRef}>
          <UserMenu avatarColor={avatarColor} avatarInitials={avatarInitials} userName={userName} userEmail={userEmail} />
        </div>
      )}
      <nav className="border-b-2 border-gray-500 h-[46px] sm:h-[47.5px] bg-zinc-800 text-lg absolute w-screen z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link href="/home">
              <div className="text-zinc-50 cursor-pointer flex gap-5 cat catlogo items-center font-bold">
                <CatLogo />
                KittyTask
              </div>
            </Link>
            <div className="text-gray-200 relative text-md flex items-center">
              {boardMenu && (
                <div ref={boardMenuRef} className="w-[200px] h-fit left-[-55px] absolute p-2 px-3 rounded-md shadow-xl bg-zinc-700 top-10">
                  <div className="flex flex-col">
                    <h1 className="text-center"> All Boards</h1>
                    <hr className="w-full border-0 border-b border-gray-300 border-opacity-85 my-2" />
                    <div className="max-h-[200px] overflow-y-auto">
                      {boards.map((board) => (
                        <div key={board.id} className="hover:bg-neutral-600 rounded-md p-1">
                          <MiniBoard board={board} variant="nav" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="px-3 flex items-center cursor-pointer rounded-md py-.5 hover:bg-zinc-700" onClick={() => setBoardMenu((v) => !v)}>
                Boards
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.4" stroke="currentColor" className="size-5 ml-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
            <Link href="/create-board">
              <button className="ml-[-.5em] px-3 py-.5 bg-pink-500 hover:bg-pink-700 text-gray-50 rounded-md">Create</button>
            </Link>
          </div>
          <div onClick={() => setIsOpen((v) => !v)} className="flex mr-2 justify-center items-center hover:opacity-85 cursor-pointer">
            <div
              className="select-none mb-1 border-2"
              style={{
                backgroundColor: avatarColor,
                color: "rgb(39, 39, 42)",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                border: "0 solid #555",
              }}
            >
              {avatarInitials.toUpperCase()}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
