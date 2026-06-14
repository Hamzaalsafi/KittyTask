"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ThreeDot } from "react-loading-indicators";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { useBoardRealtime } from "@/lib/realtime";
import * as bs from "@/lib/boardState";
import type { Board, BoardDetail, Card, List, Visibility } from "@/lib/types";
import { BoardList } from "./BoardList";
import { ShareMenu } from "./ShareMenu";

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
  "bg-blue-500", "bg-orange-500", "bg-green-500", "bg-red-500",
  "bg-purple-500", "bg-pink-500", "bg-green-300", "bg-cyan-500", "bg-gray-500",
];

const menuVariants = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: "0%" },
};

export function BoardView({ boardId }: { boardId: string }) {
  const router = useRouter();
  useRequireAuth();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isOpen, setIsOpen] = useState(false); // visibility dropdown
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [boardMenu, setBoardMenu] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(false);
  const [createList, setCreateList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const addingListRef = useRef<HTMLDivElement>(null);

  // Load board detail.
  useEffect(() => {
    let active = true;
    api.boards
      .get(boardId)
      .then((b) => active && setBoard(b))
      .catch(() => active && setNotFound(true))
      .finally(() => active && setTimeout(() => setLoading(false), 600));
    return () => {
      active = false;
    };
  }, [boardId]);

  // Refetch the whole board (used to reconcile after a realtime reconnect).
  const refetchBoard = useCallback(() => {
    api.boards.get(boardId).then(setBoard).catch(() => {});
  }, [boardId]);

  // Realtime: merge incoming events into the board tree.
  useBoardRealtime(board ? boardId : undefined, {
    ListCreated: (p) => setBoard((b) => (b ? bs.upsertList(b, p as List) : b)),
    ListUpdated: (p) => setBoard((b) => (b ? bs.upsertList(b, p as List) : b)),
    ListDeleted: (p) => setBoard((b) => (b ? bs.removeList(b, (p as { listId: string }).listId) : b)),
    ListsReordered: (p) => setBoard((b) => (b ? bs.reorderLists(b, (p as { orderedIds: string[] }).orderedIds) : b)),
    CardCreated: (p) => setBoard((b) => (b ? bs.upsertCard(b, p as Card) : b)),
    CardUpdated: (p) => setBoard((b) => (b ? bs.upsertCard(b, p as Card) : b)),
    CardDeleted: (p) => setBoard((b) => { const d = p as { listId: string; cardId: string }; return b ? bs.removeCard(b, d.listId, d.cardId) : b; }),
    CardsReordered: (p) => setBoard((b) => { const d = p as { listId: string; orderedIds: string[] }; return b ? bs.reorderCards(b, d.listId, d.orderedIds) : b; }),
    CardMoved: (p) => setBoard((b) => { const d = p as { fromListId: string; card: Card }; return b ? bs.moveCard(b, d.fromListId, d.card) : b; }),
    BoardUpdated: (p) => setBoard((b) => { const d = p as Board; return b ? { ...b, title: d.title, background: d.background, backgroundImage: d.backgroundImage, visibility: d.visibility, members: d.members } : b; }),
    BoardDeleted: () => router.push("/home"),
  }, refetchBoard);

  // Outside-click handlers.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(t)) setIsOpen(false);
      if (shareRef.current && !shareRef.current.contains(t)) setIsShareOpen(false);
      if (deleteRef.current && !deleteRef.current.contains(t)) setDeleteMenu(false);
      if (menuRef.current && !menuRef.current.contains(t)) setBoardMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!createList) return;
    const handler = (e: MouseEvent) => {
      if (addingListRef.current && !addingListRef.current.contains(e.target as Node)) setCreateList(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [createList]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // ----- Board meta mutations -----
  const updateBoardTitle = (title: string) => {
    setBoard((b) => (b ? { ...b, title } : b));
    api.boards.update(boardId, { title }).catch(() => {});
  };
  const setVisibility = (visibility: Visibility) => {
    setBoard((b) => (b ? { ...b, visibility } : b));
    api.boards.update(boardId, { visibility }).catch(() => {});
  };
  const privateButton = () => {
    if (board?.visibility === "shareable" && board.members.length < 2) setVisibility("private");
  };
  const shareableButton = () => {
    if (board?.visibility === "private") setVisibility("shareable");
  };
  const setBackground = (background: string) => {
    setBoard((b) => (b ? { ...b, background, backgroundImage: "" } : b));
    api.boards.update(boardId, { background, backgroundImage: "" }).catch(() => {});
  };
  const setBackgroundImage = (backgroundImage: string) => {
    setBoard((b) => (b ? { ...b, background: "", backgroundImage } : b));
    api.boards.update(boardId, { background: "", backgroundImage }).catch(() => {});
  };
  const deleteBoard = () => {
    api.boards.remove(boardId).catch(() => {});
    router.push("/home");
  };

  // ----- List mutations -----
  const addList = async () => {
    setCreateList(false);
    const title = newListTitle;
    setNewListTitle("");
    try {
      const list = await api.lists.create(boardId, title);
      setBoard((b) => (b ? bs.upsertList(b, list) : b));
    } catch {
      /* ignore */
    }
  };
  const onListUpdate = (list: List) => setBoard((b) => (b ? bs.patchList(b, list.id, { title: list.title }) : b));
  const onListDelete = (listId: string) => setBoard((b) => (b ? bs.removeList(b, listId) : b));

  const handleListDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    if (!board || !over || active.id === over.id) return;
    const oldIndex = board.lists.findIndex((l) => l.id === active.id);
    const newIndex = board.lists.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const orderedIds = arrayMove(board.lists, oldIndex, newIndex).map((l) => l.id);
    setBoard((b) => (b ? bs.reorderLists(b, orderedIds) : b));
    api.lists.reorder(boardId, orderedIds).catch(() => {});
  };

  // ----- Card mutations (state only; api called inside child components) -----
  const onCardCreate = (card: Card) => setBoard((b) => (b ? bs.upsertCard(b, card) : b));
  const onCardChange = (card: Card) => setBoard((b) => (b ? bs.upsertCard(b, card) : b));
  const onCardDelete = (listId: string, cardId: string) => setBoard((b) => (b ? bs.removeCard(b, listId, cardId) : b));
  const onCardMove = (fromListId: string, card: Card) => setBoard((b) => (b ? bs.moveCard(b, fromListId, card) : b));
  const onCardsReorder = (listId: string, orderedIds: string[]) => setBoard((b) => (b ? bs.reorderCards(b, listId, orderedIds) : b));

  if (loading || !board) {
    if (notFound) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-800 text-gray-300">Board not found.</div>;
    return (
      <div className="flex h-screen w-screen overflow-hidden flex-col justify-center items-center gap-6 p-4">
        <ThreeDot variant="bounce" color="#d33dad" size="large" text="" textColor="#f8f8f8" />
        <p className="text-[1.3rem] font-bold text-center text-gray-900" style={{ maxWidth: "350px" }}>
          Hang tight! We&apos;re preparing everything for you...
        </p>
      </div>
    );
  }

  const style = board.background === ""
    ? { backgroundImage: `url('${board.backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", height: "auto", width: "100%", color: "rgba(255,255,255,0)" }
    : {};

  return (
    <div>
      <div style={style} className={`h-screen max-h-screen overflow-hidden flex flex-col box-border ${board.background}`}>
        {isOpen && (
          <div ref={dropdownRef} className="absolute top-[5.3em] left-[2.3%] mt-1.5 shareMenu z-[1000000] w-72 rounded-2xl bg-zinc-800 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <button onClick={privateButton} style={{ borderColor: board.visibility === "private" ? "lightblue" : "" }} className="block w-full border-2 border-zinc-800 rounded-2xl text-left px-4 py-2 text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700">
                <span className="text-[1.1rem] text-gray-200">Private Board</span> - A personal board where all tasks and data are private and only visible to you.
              </button>
              <button onClick={shareableButton} style={{ borderColor: board.visibility === "shareable" ? "lightblue" : "" }} className="block border-2 border-zinc-800 w-full text-left px-4 rounded-2xl py-2 text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700">
                <span className="text-[1.1rem] text-gray-200">Shareable Board</span> - A collaborative board that allows you to share tasks with others for group work.
              </button>
            </div>
          </div>
        )}

        <nav className="bg-gray-400 bg-opacity-55 sm:bg-opacity-50 py-2 pl-3.5 pr-2 sm:pr-5 text-md absolute w-screen items-center top-11">
          <div className="flex justify-between">
            <div className="flex gap-5">
              <p className="text-white font-bold text-2xl cursor-pointer">{board.title}</p>
              <div className="relative inline-block text-left">
                <button title="Change who can see this board (private or shareable)" onClick={() => setIsOpen((v) => !v)} className="sm:text-lg text-slate-100 text-md px-1.5 mt-1 sm:mt-0.5 flex gap-1 hover:text-gray-900 rounded-md hover:bg-slate-100 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <p>{typeof window !== "undefined" && window.innerWidth > 650 ? "Workspace visible" : "Visibility"}</p>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div title="Share this board with teammates by email" onClick={() => setIsShareOpen((v) => !v)} className="bg-slate-100 text-zinc-950 flex items-center gap-1 px-1.5 rounded-md hover:bg-slate-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.4" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
                Share
              </div>
              <button title="Board menu: rename, change background, delete" onClick={() => setBoardMenu((v) => !v)} className="text-zinc-100 flex items-center ml-2 rounded-md hover:text-zinc-300 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {deleteMenu && (
          <div className="flex justify-center items-center w-screen h-screen fixed bg-gray-700 bg-opacity-35 z-[1000000]">
            <div ref={deleteRef} className="relative flex flex-col z-[10000] justify-center items-center border-t-2 border-red-600 p-2 pb-5 px-4 sm:px-5 rounded-lg bg-gray-900 w-fit max-w-[90%] h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 z-50 text-gray-200 bg-red-600 rounded-full p-1.5 absolute top-[-33px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <h1 className="text-xl text-center mb-2 font-bold mt-10 text-gray-300">Delete Board?</h1>
              <p className="text-sm text-center text-gray-300">Are you sure? This action will delete the board for all shared users and cannot be undone.</p>
              <div className="flex justify-center mt-7 gap-10">
                <button onClick={() => setDeleteMenu(false)} className="px-8 rounded-lg p-1.5 hover:bg-zinc-600 text-gray-100 bg-zinc-500">Cancel</button>
                <button onClick={deleteBoard} className="px-8 rounded-lg p-1.5 text-gray-100 bg-red-600 hover:bg-red-800">Delete</button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {boardMenu && (
            <motion.div ref={menuRef} className="h-full p-4 px-3 top-11 flex flex-col w-60 sm:w-72 fixed z-[10000] right-0 bg-gray-800" initial="hidden" animate="visible" exit="hidden" variants={menuVariants} transition={{ duration: 0.3 }}>
              <div className="w-full relative flex items-start justify-between">
                <h1 className="text-center text-xl flex-grow text-gray-300">Menu</h1>
                <button onClick={() => setBoardMenu(false)} className="absolute right-0 top-0 text-slate-300 py-1 px-1 rounded-md text-md hover:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <hr className="border-0 border-b bg-gray-300 w-full opacity-35 my-2" />
              <input onChange={(e) => updateBoardTitle(e.target.value)} value={board.title} className="text-xl my-2 p-1.5 px-2 rounded-md text-center w-full border-solid border-slate-400 focus:border-solid focus:border-blue-500 focus:box-shadow border-2 focus:outline-none bg-gray-900 text-slate-300" />
              <h3 className="text-center my-3 text-lg text-gray-300">Change Background</h3>
              <div className="color max-h-[20vh] sm:max-h-[17vh] mb-4 rounded-md px-3 pt-1 overflow-y-auto bg-gray-900">
                <div className="grid grid-cols-2 mt-1 p-1 gap-5">
                  {gradientOptions.map((cls, index) => (
                    <div key={index} onClick={() => setBackground(cls)} className={`py-6 sm:py-7 cursor-pointer rounded-sm ${cls}`} />
                  ))}
                </div>
              </div>
              <div className="color max-h-[20vh] mt-1 sm:max-h-[17vh] pt-1 rounded-md sm:px-3 px-2 overflow-y-scroll bg-gray-900">
                <div className="grid grid-cols-2 mt-1 p-1 gap-5">
                  {imgBackground.map((img) => (
                    <div key={img} onClick={() => setBackgroundImage(img)} className="cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} loading="lazy" alt="Background" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex mt-8 justify-center">
                <button onClick={() => { setDeleteMenu(true); setBoardMenu(false); }} className="text-gray-300 text-md flex gap-1 p-1.5 px-4 rounded-xl shadow-lg bg-gray-900 border-2 border-slate-400 hover:border-red-600 hover:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-0.5 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isShareOpen && (
          <div ref={shareRef}>
            <ShareMenu boardId={boardId} visibility={board.visibility} members={board.members} onMembersChange={(b) => setBoard((prev) => (prev ? { ...prev, members: b.members, visibility: b.visibility } : prev))} />
          </div>
        )}

        <div className={`ml-6 sm:pl-6 md:ml-0 overflow-x-auto BOARDS overflow-y-hidden h-screen max-h-screen over px-3 sm:gap-10 flex gap-12 pt-28 ${!isDragging ? "BordContainer" : " "}`}>
          <DndContext onDragStart={() => setIsDragging(true)} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleListDragEnd}>
            <SortableContext items={board.lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {board.lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  lists={board.lists}
                  dragging={isDragging}
                  onListUpdate={onListUpdate}
                  onListDelete={onListDelete}
                  onCardCreate={onCardCreate}
                  onCardChange={onCardChange}
                  onCardDelete={onCardDelete}
                  onCardMove={onCardMove}
                  onCardsReorder={onCardsReorder}
                />
              ))}
            </SortableContext>
          </DndContext>

          {!createList && board.lists.length === 0 && (
            <div className="btn self-start rounded-xl border border-dashed border-white/30 bg-black/40 p-5 text-zinc-100">
              <p className="mb-1 font-semibold">This board is empty 🐱</p>
              <p className="mb-3 text-sm text-zinc-300">Add your first list — try <b>To&nbsp;Do</b>, <b>Doing</b>, and <b>Done</b>.</p>
              <button onClick={(e) => { e.stopPropagation(); setIsDragging(false); setCreateList(true); }} className="rounded-md bg-pink-500 px-4 py-1.5 font-medium text-white hover:bg-pink-600">
                ＋ Add a list
              </button>
            </div>
          )}
          {!createList && board.lists.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setIsDragging(false); setCreateList(true); }} className="btn p-4 text-md py-2.5 rounded-lg bg-zinc-800 bg-opacity-50 text-left text-zinc-50 self-start mt-1">
              + Add another list
            </button>
          )}
          {createList && (
            <div className="bg-black mr-10 btn p-5 px-3 pt-3 rounded-xl h-fit" ref={addingListRef}>
              <div className="mt-1">
                <input onChange={(e) => setNewListTitle(e.target.value)} type="text" placeholder="Enter List name..." className="text:xl p-1 px-2.5 rounded-md w-full border-solid border-slate-400 focus:border-solid focus:border-blue-500 focus:box-shadow border-2 focus:outline-none bg-gray-800 text-md text-slate-300" />
                <div className="mt-3 flex justify-start gap-1.5">
                  <button onClick={addList} className="bg-blue-600 hover:bg-blue-700 mr-1.5 text-gray-950 py-1 px-2 rounded-md text-m">Add List</button>
                  <button onClick={() => setCreateList(false)} className="justify-self-end text-slate-300 py-1 px-1 rounded-md text-md hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
