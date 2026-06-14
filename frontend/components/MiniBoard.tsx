"use client";

import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import type { Board } from "@/lib/types";

interface MiniBoardProps {
  board: Board;
  variant?: "card" | "nav";
}

// A clickable board tile that lazy-loads its background image when scrolled into view.
export function MiniBoard({ board, variant = "card" }: MiniBoardProps) {
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const style =
    inView && board.backgroundImage
      ? {
          backgroundImage: `url('${board.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "rgba(255,255,255,0)",
        }
      : {};

  const open = () => router.push(`/board/${board.id}`);

  if (variant === "nav") {
    return (
      <div onClick={open} className="flex items-center mb-0.5 gap-2 cursor-pointer">
        <div ref={ref} style={style} className={`p-5 h-[40px] w-[60px] hover:opacity-85 cursor-pointer rounded-sm ${board.background}`} />
        <h2 className="text-zinc-300 text-lg truncate whitespace-nowrap overflow-hidden">{board.title}</h2>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={style}
      onClick={open}
      className={`p-5 h-[70px] w-[130px] hover:opacity-85 cursor-pointer rounded-sm ${board.background}`}
    >
      <h2 className="text-zinc-300 font-bold text-lg truncate whitespace-nowrap overflow-hidden">{board.title}</h2>
    </div>
  );
}
