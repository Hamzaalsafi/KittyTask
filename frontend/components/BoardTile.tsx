"use client";

import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import type { Board } from "@/lib/types";

// A larger, friendlier board card for the dashboard.
export function BoardTile({ board }: { board: Board }) {
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const bgStyle =
    inView && board.backgroundImage
      ? { backgroundImage: `url('${board.backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

  return (
    <button
      ref={ref}
      onClick={() => router.push(`/board/${board.id}`)}
      style={bgStyle}
      className={`group relative h-32 w-full overflow-hidden rounded-xl text-left shadow-md ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-xl ${board.background}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex justify-end">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[0.7rem] font-medium text-white/90 backdrop-blur">
            {board.visibility === "shareable" ? "👥 Shared" : "🔒 Private"}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-white drop-shadow">{board.title}</h3>
          <div className="flex -space-x-2">
            {board.members.slice(0, 3).map((m) => (
              <span
                key={m.id}
                title={m.name}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ring-2 ring-black/30"
                style={{ backgroundColor: m.avatarColor, color: "#27272a" }}
              >
                {m.avatarInitials.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
