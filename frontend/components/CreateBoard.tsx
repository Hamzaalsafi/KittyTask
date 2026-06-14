"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { api } from "@/lib/api";
import type { Visibility } from "@/lib/types";

const imgBackground = Array.from({ length: 19 }, (_, i) =>
  i + 1 === 18 ? "/BoardBackground/18.png" : `/BoardBackground/${i + 1}.jpg`
);

const gradientOptions = [
  "bg-gradient-to-r from-teal-400 to-blue-500",
  "bg-gradient-to-r from-blue-800 to-blue-400",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-purple-400 to-blue-300",
  "bg-gradient-to-r from-orange-400 to-yellow-300",
  "bg-gradient-to-r from-pink-400 to-pink-200",
  "bg-gradient-to-r from-teal-400 to-green-500",
  "bg-gradient-to-r from-blue-800 to-blue-400",
  "bg-gradient-to-r from-red-800 to-brown-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-300",
  "bg-cyan-500",
  "bg-gray-500",
];

function LazyImageTile({ img, onClick }: { img: string; onClick: () => void }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <div
      ref={ref}
      style={{
        backgroundImage: inView ? `url('${img}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "rgba(255,255,255,0)",
      }}
      onClick={onClick}
      className="border-gray-100 cursor-pointer text-opacity-0 bg-black p-4 py-3 sm:py-4 px-5 sm:px-6 select-none rounded-sm"
    >
      Board
    </div>
  );
}

export function CreateBoard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [background, setBackground] = useState("");
  const [images, setImages] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [boardVisibility, setBoardVisibility] = useState("Board Visibility");
  const [failed, setFailed] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (failed === "Make sure you fill the board title") setFailed("");
    setBoardTitle(e.target.value);
  };

  const previewStyle =
    background === ""
      ? {
          backgroundImage: `url('${images}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "rgba(255,255,255,0)",
        }
      : {};

  const createBoard = async () => {
    if (boardTitle === "") {
      setFailed("Make sure you fill the board title");
      return;
    }
    if (background === "" && images === "") {
      setFailed("Make sure you choose a background or images");
      return;
    }
    if (boardVisibility === "Board Visibility") {
      setFailed("Make sure you choose a visibility option");
      return;
    }
    const visibility: Visibility = boardVisibility === "Shareable Board" ? "shareable" : "private";
    try {
      const board = await api.boards.create({
        title: boardTitle,
        background,
        backgroundImage: images,
        visibility,
      });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      router.push(`/board/${board.id}`);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "Failed to create board");
    }
  };

  return (
    <div className="flex items-center z-10 sm:mt-10 w-screen h-screen px-7 flex-col justify-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        draggable={false}
        style={previewStyle}
        alt="preview"
        src="https://trello.com/assets/14cda5dc635d1f13bc48.svg"
        className={`w-[50%] p-1 px-2 max-w-[210px] mb-5 mt-[-27%] select-none sm:mt-[-50px] ${background}`}
      />

      <div className="flex w-[80%] max-w-[470px] justify-center gap-4 md:gap-10 items-center">
        <div className="main">
          <input onChange={handleTitle} required type="text" className="input" />
          <label>
            {["B", "o", "a", "r", "d", "T", "i", "t", "l", "e"].map((ch, i) => (
              <span key={i} style={{ transitionDelay: `${i * 75}ms`, left: `${10 + i * 12}px` }}>
                {ch}
              </span>
            ))}
            <p className="absolute left-[18px] top-[4px] text-2xl m-2 text-gray-300 transition duration-500 cursor-pointer pointer-events-none">
              Board Title
            </p>
          </label>
        </div>
        <div>
          <div className="relative inline-block text-left text-slate-300" ref={dropdownRef}>
            <button onClick={() => setIsOpen((v) => !v)} className="button2" style={isOpen ? { borderColor: "lightblue" } : {}}>
              {boardVisibility}
            </button>
            {isOpen && (
              <div className="origin-top-right absolute right-[-10%] sm:right-[-15%] mt-2 z-[1000] w-72 rounded-2xl shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    style={{ borderColor: boardVisibility === "Private Board" ? "lightblue" : "" }}
                    onClick={() => setBoardVisibility("Private Board")}
                    className="block w-full border-2 border-zinc-800 text-left px-4 py-2 text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  >
                    <span className="text-[1.1rem] text-gray-200">Private Board</span> - A personal board where all tasks and data are private and only visible to you.
                  </button>
                  <button
                    style={{ borderColor: boardVisibility === "Shareable Board" ? "lightblue" : "" }}
                    onClick={() => setBoardVisibility("Shareable Board")}
                    className="block border-2 border-zinc-800 w-full text-left px-4 py-2 text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  >
                    <span className="text-[1.1rem] text-gray-200">Shareable Board</span> - A collaborative board that allows you to share tasks with others for group work.
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="self-center">
        <h1 className="text-xl mt-4 mb-1 opacity-90 text-gray-300 text-center">Background</h1>
        <div className="color max-h-[20vh] sm:max-h-[17vh] mb-4 rounded-md px-3 overflow-y-auto bg-neutral-800">
          <div className="grid grid-cols-3 sm:grid-cols-2 mt-1 md:grid-cols-3 p-1 lg:grid-cols-4 gap-5">
            {gradientOptions.map((cls, i) => (
              <div
                key={i}
                onClick={() => {
                  setBackground(cls);
                  setImages("");
                  if (failed === "Make sure you choose a background or images") setFailed("");
                }}
                className={`cursor-pointer ${cls} py-6 sm:py-7 rounded-sm`}
              />
            ))}
          </div>
        </div>
        <div className="color max-h-[20vh] sm:max-h-[17vh] rounded-md sm:px-3 px-2 overflow-y-scroll bg-neutral-800">
          <div className="grid grid-cols-3 sm:grid-cols-2 mt-1 md:grid-cols-3 p-1 lg:grid-cols-4 gap-5">
            {imgBackground.map((img) => (
              <LazyImageTile
                key={img}
                img={img}
                onClick={() => {
                  setBackground("");
                  setImages(img);
                  if (failed === "Make sure you choose a background or images") setFailed("");
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button onClick={createBoard} type="submit" className="bg-blue-600 hover:bg-blue-500 text-gray-100 mb-1 py-1.5 px-20 mt-[6%] sm:mt-8 rounded-lg text-md">
            Create
          </button>
        </div>
        <div className="text-red-600 text-sm text-center">{failed}</div>
      </div>
    </div>
  );
}
