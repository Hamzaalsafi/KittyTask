"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { api } from "@/lib/api";
import { useMenuContext } from "@/lib/menu";
import type { Card, List } from "@/lib/types";
import { BoardCard } from "./BoardCard";

interface BoardListProps {
  list: List;
  lists: List[];
  dragging: boolean;
  onListUpdate: (list: List) => void;
  onListDelete: (listId: string) => void;
  onCardCreate: (card: Card) => void;
  onCardChange: (card: Card) => void;
  onCardDelete: (listId: string, cardId: string) => void;
  onCardMove: (fromListId: string, card: Card) => void;
  onCardsReorder: (listId: string, orderedIds: string[]) => void;
}

export function BoardList({
  list,
  lists,
  dragging,
  onListUpdate,
  onListDelete,
  onCardCreate,
  onCardChange,
  onCardDelete,
  onCardMove,
  onCardsReorder,
}: BoardListProps) {
  const { menuOpen, setMenuOpen } = useMenuContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    disabled: menuOpen,
  });

  const [createCard, setCreateCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [linkInvalid, setLinkInvalid] = useState("");
  const [listTitle, setListTitle] = useState(list.title);
  const [menu, setMenu] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [copyButton, setCopyButton] = useState(false);

  const addingRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLButtonElement>(null);
  const listInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setListTitle(list.title), [list.title]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const listMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
    const rect = listRef.current!.getBoundingClientRect();
    setPosition({ x: rect.left + window.scrollX + 270, y: rect.top + window.scrollY - 6 });
    document.body.classList.add("MenuisOpen");
    setMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        listRef.current && !listRef.current.contains(t) &&
        (!listInputRef.current || !listInputRef.current.contains(t))
      ) {
        setMenu(false);
        setMenuOpen(false);
        document.body.classList.remove("MenuisOpen");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menu, setMenuOpen]);

  useEffect(() => {
    if (!createCard) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (addingRef.current && !addingRef.current.contains(event.target as Node)) setCreateCard(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [createCard]);

  const copyId = () => {
    navigator.clipboard?.writeText(list.id).catch(() => {});
    setCopyButton(true);
    setTimeout(() => setCopyButton(false), 1500);
  };

  const listInputUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    setListTitle(title);
    api.lists.update(list.id, title).then(onListUpdate).catch(() => {});
  };

  const addCard = async () => {
    const title = cardTitle;
    setCardTitle("");
    try {
      const card = await api.cards.create(list.id, title);
      onCardCreate(card);
    } catch {
      /* ignore */
    }
  };

  const addCardByLink = async () => {
    const sourceId = cardTitle.trim();
    setCardTitle("");
    try {
      setLinkInvalid("");
      const card = await api.cards.copy(sourceId, list.id);
      onCardCreate(card);
    } catch {
      setLinkInvalid("Please check the link and try again.");
      setTimeout(() => setLinkInvalid(""), 3000);
    }
  };

  const deleteList = () => {
    onListDelete(list.id);
    api.lists.remove(list.id).catch(() => {});
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.cards.findIndex((c) => c.id === active.id);
    const newIndex = list.cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const orderedIds = arrayMove(list.cards, oldIndex, newIndex).map((c) => c.id);
    onCardsReorder(list.id, orderedIds);
    api.cards.reorder(list.id, orderedIds).catch(() => {});
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, 0, 20px) rotate(${isDragging ? -2 : 0}deg)` : undefined,
    transition,
    backgroundColor: isDragging ? "rgba(0, 0, 0, 0.8)" : "",
    cursor: isDragging ? "grabbing" : "pointer",
    zIndex: isDragging ? 10 : "auto",
  } as const;

  return (
    <div className={`bg-black ListCssCustom px-2.5 py-2.5 shadow-xl rounded-xl h-fit ${dragging && !isDragging ? "swing" : ""} ${!dragging || !isDragging ? "snap-start" : ""} ${isDragging ? "dragList" : ""}`} style={style}>
      <div className={`overlay ${menu ? "visible" : ""}`}></div>
      {menu && (
        <div
          ref={menuRef}
          className="card flex item z-[10000] absolute flex-col gap-1"
          style={{
            top: `${position.y + 5}px`,
            left: typeof window !== "undefined" && window.innerWidth > 700 ? `${position.x - 225}px` : `${position.x - 335}px`,
            alignItems: typeof window !== "undefined" && window.innerWidth > 700 ? "start" : "end",
          }}
        >
          <button onClick={copyId} className={`flex text-gray-300 shadow-xl ${copyButton ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-700"} font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            </svg>
            {copyButton ? "Copied!" : "Copy"}
          </button>
          <button onClick={deleteList} className="flex text-gray-300 shadow-xl bg-gray-800 hover:bg-gray-700 font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}

      <div ref={setNodeRef} {...attributes} {...listeners} onContextMenu={(e) => e.preventDefault()}>
        <div className="flex relative overflow-x-hidden w-full h-10 justify-between items-start">
          <div className="focus:border-solid select-none focus:border-blue-500 focus:box-shadow focus:outline-none text-slate-300 px-1 text-lg mt-1.5 w-full mr-2">
            {listTitle.length > 22 ? `${listTitle.substring(0, 22)}...` : listTitle}
            {menu && (
              <div>
                <textarea
                  ref={listInputRef}
                  className="z-[1000] absolute sm:w-full w-[68%] h-10 left-0 sm:right-0 top-0 pb-2 pt-3 ri text-start px-2.5 rounded-md bg-gray-800 border-solid border-slate-400 border-0 focus:outline-none text-slate-300 resize-none overflow-hidden focus:text-slate-300"
                  value={listTitle}
                  rows={1}
                  onChange={listInputUpdate}
                />
              </div>
            )}
          </div>
          <button ref={listRef} onClick={listMenu} className="text-slate-300 p-1 hover:opacity-80 select-none text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>

        <div className="flex pr-1.5 flex-col justify-start kkkk my-3 items-center">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {list.cards.map((card) => (
                <BoardCard key={card.id} card={card} lists={lists} onChange={onCardChange} onDelete={onCardDelete} onMove={onCardMove} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div>
        {!createCard && (
          <button onClick={(e) => { e.stopPropagation(); setCreateCard(true); }} className="text-slate-300 select-none text-opacity-95 hover:opacity-100 hover:bg-zinc-800 hover:bg-opacity-90 hover:shadow-xl w-full text-start px-1.5 py-1 rounded-md">
            + Add a card
          </button>
        )}
        {createCard && (
          <div className="mt-1" ref={addingRef}>
            <textarea
              placeholder="Enter card title..."
              className="pb-5 pt-1 h-16 text-start px-2.5 rounded-md w-full border-solid border-slate-400 border-0 focus:outline-none bg-gray-800 text-slate-300 resize-none overflow-hidden"
              onChange={(e) => setCardTitle(e.target.value)}
              value={cardTitle}
              rows={1}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight + 15}px`;
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 flex justify-start gap-1.5">
              <button onClick={addCard} className="bg-blue-600 hover:bg-blue-700 mr-1.5 text-gray-950 py-1 px-2 rounded-md text-m">
                Add Card
              </button>
              <button onClick={addCardByLink} className="text-slate-300 py-1 px-1 rounded-md text-md hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              </button>
              <button onClick={() => setCreateCard(false)} className="text-slate-300 py-1 px-1 rounded-md text-md hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-red-500 text-sm text-center mt-1">{linkInvalid}</p>
          </div>
        )}
      </div>
    </div>
  );
}
