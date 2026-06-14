"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { api } from "@/lib/api";
import { useMenuContext } from "@/lib/menu";
import { useToast } from "@/lib/toast";
import type { Card, List } from "@/lib/types";

// label index -> tailwind class used in the label-picker menu and on the card chips.
const LABEL_MENU_CLASSES = [
  "bg-green-600 hover:bg-green-500",
  "bg-yellow-800 hover:bg-yellow-700",
  "bg-amber-600 hover:bg-amber-500",
  "bg-red-700 hover:bg-red-600",
  "bg-indigo-800 hover:bg-indigo-800",
  "bg-blue-700 hover:bg-blue-600",
  "bg-pink-800 hover:bg-pink-700",
  "bg-neutral-400 hover:bg-neutral-300",
];
const LABEL_CHIP_CLASSES = [
  "bg-green-600",
  "bg-yellow-800",
  "bg-amber-600",
  "bg-red-700",
  "bg-indigo-700",
  "bg-blue-800",
  "bg-pink-800",
  "bg-neutral-400",
];
const BACKGROUND_OPTIONS = [
  "bg-green-700",
  "bg-yellow-800",
  "bg-amber-700",
  "bg-red-800",
  "bg-indigo-800",
  "bg-blue-800",
  "bg-pink-900",
  "bg-gray-800",
];

interface BoardCardProps {
  card: Card;
  lists: List[];
  onChange: (card: Card) => void;
  onDelete: (listId: string, cardId: string) => void;
  onMove: (fromListId: string, card: Card) => void;
}

export function BoardCard({ card, lists, onChange, onDelete, onMove }: BoardCardProps) {
  const { setMenuOpen } = useMenuContext();
  const toast = useToast();

  const [title, setTitle] = useState(card.title);
  const [labels, setLabels] = useState<boolean[]>(card.labels);
  const [background, setBackground] = useState(card.background);

  const [menu, setMenu] = useState(false);
  const [labelMenu, setLabelMenu] = useState(false);
  const [backgroundMenu, setBackgroundMenu] = useState(false);
  const [moveMenu, setMoveMenu] = useState(false);
  const [copyButton, setCopyButton] = useState(false);
  const [menuFlexEnd, setMenuFlexEnd] = useState(false);
  const [menuForPhone, setMenuForPhone] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [position2, setPosition2] = useState({ x: 0, y: 0 });

  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const cardInputRef = useRef<HTMLTextAreaElement>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const moveRef = useRef<HTMLButtonElement>(null);
  const labelMenuRef = useRef<HTMLDivElement>(null);
  const backgroundMenuRef = useRef<HTMLDivElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  // Re-sync from props when an external (realtime) update arrives.
  useEffect(() => {
    setTitle(card.title);
    setLabels(card.labels);
    setBackground(card.background);
  }, [card.title, card.labels, card.background]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px,0) rotate(${isDragging ? -2 : 0}deg)` : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    zIndex: isDragging ? 10 : "auto",
  } as const;

  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    cardRef.current = el;
  };

  const persist = (patch: { title?: string; background?: string; labels?: boolean[] }) =>
    api.cards
      .update(card.id, patch)
      .then((updated) => onChange(updated))
      .catch(() => {});

  const cardMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
    const rect = cardRef.current!.getBoundingClientRect();
    const menux = rect.left + window.scrollX + 270;
    const menuy = rect.top + window.scrollY - 6;
    const w = window.innerWidth;
    setMenuFlexEnd(menux + 200 > w);
    setMenuForPhone(w < 650);
    setPosition({ x: menux + 200 > w ? menux - 535 : menux, y: menuy < 0 ? 0 : menuy });
    document.body.classList.add("MenuisOpen");
    setMenu(true);
  };

  const openSub = (ref: React.RefObject<HTMLElement | null>, setter: (v: boolean) => void) => {
    setter(true);
    const rect = ref.current!.getBoundingClientRect();
    setPosition2({ x: rect.left, y: rect.top });
  };

  const toggleLabel = (i: number) => {
    const next = labels.map((v, idx) => (idx === i ? !v : v));
    setLabels(next);
    persist({ labels: next });
  };

  const chooseBackground = (cls: string) => {
    setBackground(cls);
    persist({ background: cls });
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    persist({ title: e.target.value });
  };

  const copyId = () => {
    navigator.clipboard?.writeText(card.id).catch(() => {});
    setCopyButton(true);
    setTimeout(() => setCopyButton(false), 1500);
  };

  const deleteCard = () => {
    api.cards.remove(card.id).catch(() => toast.error("Couldn't delete the card."));
    onDelete(card.listId, card.id);
  };

  const archiveCard = () => {
    api.cards
      .archive(card.id)
      .then(() => toast.success("Card archived. Find it in Cards Archive."))
      .catch(() => toast.error("Couldn't archive the card."));
    onDelete(card.listId, card.id);
  };

  const moveCardTo = async (targetList: List) => {
    try {
      const moved = await api.cards.move(card.id, targetList.id);
      onMove(card.listId, moved);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && cardInputRef.current && !cardInputRef.current.contains(t)) {
        if (
          (!labelMenuRef.current || !labelMenuRef.current.contains(t)) &&
          (!backgroundMenuRef.current || !backgroundMenuRef.current.contains(t)) &&
          (!moveMenuRef.current || !moveMenuRef.current.contains(t))
        ) {
          setMenu(false);
          setMenuOpen(false);
          document.body.classList.remove("MenuisOpen");
        }
      }
      if (labelMenuRef.current && !labelMenuRef.current.contains(t) && labelRef.current && !labelRef.current.contains(t)) setLabelMenu(false);
      if (backgroundMenuRef.current && !backgroundMenuRef.current.contains(t) && backRef.current && !backRef.current.contains(t)) setBackgroundMenu(false);
      if (moveMenuRef.current && !moveMenuRef.current.contains(t) && moveRef.current && !moveRef.current.contains(t)) setMoveMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setMenuOpen]);

  const subStyle = {
    top: typeof window !== "undefined" && window.innerHeight > position2.y + 350 ? `${position2.y}px` : `${position2.y - 170}px`,
    left: !menuForPhone ? `${position2.x - 70}px` : "52%",
    maxWidth: menuForPhone ? "170px" : " ",
  };

  return (
    <div className="w-full">
      {backgroundMenu && (
        <div style={subStyle} ref={backgroundMenuRef} className="flex absolute flex-col z-[10001] p-1.5 rounded-md text-gray-300 pt-2 bg-gray-800 gap-1.5">
          <div className="flex justify-end align-top">
            <button onClick={(e) => { e.stopPropagation(); setBackgroundMenu(false); }} className="m-1 text-slate-300 px-1 rounded-md text-sm hover:bg-gray-600">
              &#x2715;
            </button>
          </div>
          <div className="flex justify-center gap-6">
            <h3 className="mb-3 -mt-[1.9rem] text-center">Background Cover</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {BACKGROUND_OPTIONS.map((cls, index) => (
              <div className="flex gap-1.5" key={cls}>
                <input
                  checked={background === cls}
                  onChange={() => chooseBackground(cls)}
                  id={`radio-group-${index + 1}-${card.id}`}
                  type="radio"
                  className="w-5 h-4 cursor-pointer border border-gray-300 rounded-md m-2 checked:bg-no-repeat checked:bg-center checked:border-indigo-500 checked:bg-indigo-100"
                />
                <label htmlFor={`radio-group-${index + 1}-${card.id}`} className={`w-44 rounded-sm mr-4 cursor-pointer border-2 border-opacity-40 border-gray-500 hover:bg-opacity-80 ${cls}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {moveMenu && (
        <div style={subStyle} ref={moveMenuRef} className="flex absolute flex-col z-[10001] w-[200px] rounded-md text-gray-300 pt-2 bg-gray-800 gap-1.5">
          <div className="flex justify-end align-top">
            <button onClick={(e) => { e.stopPropagation(); setMoveMenu(false); }} className="m-1 text-slate-300 px-1 rounded-md text-sm hover:bg-gray-600">
              &#x2715;
            </button>
          </div>
          <div className="flex justify-center gap-6">
            <h3 className="mb-3 -mt-[1.9rem] text-center">To List</h3>
          </div>
          <div className="flex flex-col gap-1">
            {lists.map((item, index) => (
              <div key={item.id} onClick={() => moveCardTo(item)} className="flex py-1 justify-start ga-1 text-gray-300 hover:bg-gray-700 px-4">
                <p className="text-lg">{index + 1}</p>
                <p className="text-lg">. {item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {labelMenu && (
        <div style={subStyle} ref={labelMenuRef} className="flex absolute flex-col z-[10001] p-1.5 rounded-md text-gray-300 pt-2 bg-gray-800 gap-1.5">
          <div className="flex justify-end align-top">
            <button onClick={(e) => { e.stopPropagation(); setLabelMenu(false); }} className="m-1 text-slate-300 px-1 rounded-md text-sm hover:bg-gray-600">
              &#x2715;
            </button>
          </div>
          <div className="flex justify-center gap-6">
            <h3 className="mb-3 -mt-[1.9rem] text-center">Labels</h3>
          </div>
          {LABEL_MENU_CLASSES.map((cls, i) => (
            <div className={`flex gap-1.5 ${i === 7 ? "mb-6" : ""}`} key={i}>
              <input
                checked={labels[i]}
                onChange={() => toggleLabel(i)}
                id={`checkbox-group-${i + 1}-${card.id}`}
                type="checkbox"
                className="w-5 h-4 cursor-pointer border border-gray-300 rounded-md m-2 checked:bg-no-repeat checked:bg-center checked:border-indigo-500 checked:bg-indigo-100"
              />
              <label htmlFor={`checkbox-group-${i + 1}-${card.id}`} className={`w-44 rounded-sm mr-4 cursor-pointer ${cls}`} />
            </div>
          ))}
        </div>
      )}

      <div className={`overlay ${menu ? "visible" : ""}`}></div>
      {menu && (
        <div
          ref={menuRef}
          className="card flex item z-[1001] absolute flex-col gap-[2.5px]"
          style={{
            top: typeof window !== "undefined" && window.innerHeight > position.y + 350 ? `${position.y + 7}px` : `${position.y - 180}px`,
            left: !menuForPhone ? `${position.x + 10}px` : "52.5%",
            alignItems: menuFlexEnd ? "end" : "start",
          }}
        >
          <button ref={labelRef} onClick={() => openSub(labelRef, setLabelMenu)} className="flex text-gray-300 shadow-xl bg-gray-800 hover:bg-gray-700 rounded-sm font-bold p-3 pr-3.5 py-2.5 w-fit text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            Edit labels
          </button>
          <button ref={backRef} onClick={() => openSub(backRef, setBackgroundMenu)} className="flex text-gray-300 shadow-xl bg-gray-800 hover:bg-gray-700 font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9" />
            </svg>
            Change cover
          </button>
          <button ref={moveRef} onClick={() => openSub(moveRef, setMoveMenu)} className="flex text-gray-300 shadow-xl bg-gray-800 hover:bg-gray-700 font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            Move
          </button>
          <button onClick={copyId} className={`flex text-gray-300 shadow-xl ${copyButton ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-700"} font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            </svg>
            {copyButton ? "Copied!" : "Copy"}
          </button>
          <button onClick={archiveCard} className="flex text-gray-300 shadow-xl bg-gray-800 hover:bg-gray-700 font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            Archive
          </button>
          <button onClick={deleteCard} className="flex text-gray-300 bg-gray-800 hover:bg-gray-700 font-bold rounded-sm p-3 pr-3.5 w-fit py-2.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}

      <div
        ref={combinedRef}
        style={style}
        {...attributes}
        {...listeners}
        onContextMenu={cardMenu}
        className={`CARD relative justify-center flex flex-col cursor-pointer focus:border-solid focus:border-blue-500 select-none focus:outline-none text-gray-300 text-md p-1 px-2.5 rounded-md w-full mx-0 my-1.5 ${background || "bg-gray-800"}`}
      >
        {menu && (
          <div>
            <textarea
              ref={cardInputRef}
              className={`z-[1000] absolute sm:w-full w-[70%] left-0 sm:right-0 top-0 pb-2 pt-3 ri text-start px-2.5 rounded-md border-solid border-slate-400 border-0 focus:outline-none text-slate-300 resize-none overflow-hidden ${background || "bg-gray-800"}`}
              onChange={onTitleChange}
              rows={1}
              value={title}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight + 15}px`;
              }}
            />
          </div>
        )}
        <div
          title="Card actions: labels, cover, move, archive, delete"
          className="absolute right-0 pointer-events-auto text-md p-2 pt-1.5 text-[1.2rem] text-gray-300 hover:opacity-65"
          onClick={(e) => {
            e.stopPropagation();
            cardMenu(e);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
          </svg>
        </div>
        <div className="flex flex-wrap gap-2">
          {labels.map((on, i) =>
            on ? <span key={i} className={`z-[1001] ${LABEL_CHIP_CLASSES[i]} w-11 rounded-2xl h-[.45rem] -ml-0.5 mb-0.5 -mt-1.5`} /> : null
          )}
        </div>
        {title ? title : "Empty Card"}
      </div>
    </div>
  );
}
