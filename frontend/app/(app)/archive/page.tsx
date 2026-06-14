"use client";

import { useAuth } from "@/lib/auth";

export default function ArchivePage() {
  const { user } = useAuth();

  const avatarColor = user?.avatarColor || "#111827";
  const avatarInitials = user?.avatarInitials || "A";
  const userName = user?.name || "Guest";
  const userEmail = user?.email || "example@example.com";

  return (
    <div className="flex bg-zinc-800 w-screen h-screen pt-20 pb-10 justify-center text-gray-300">
      <div className="w-screen relative max-w-[1000px] rounded-lg pt-2 px-2 sm:p-7 bg-zinc-800 shadow-xl">
        <span className="CardsArchive">Cards Archive</span>
        <div className="flex mr-2 mt-[7em] hover:opacity-85 cursor-pointer w-fit">
          <div className="flex hover:opacity-85 cursor-pointer justify-center items-center">
            <div
              className="pointer-events-none mr-2 select-none mb-1"
              style={{
                backgroundColor: avatarColor,
                color: "rgb(39, 39, 42)",
                width: "43px",
                height: "43px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                border: "1px solid #555",
              }}
            >
              {avatarInitials.toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-xl mb-[-4px]">{userName}</p>
            <p className="text-md opacity-90">{userEmail}</p>
          </div>
        </div>
        <hr className="w-full mt-2 border-0 border-b border-gray-400 border-opacity-75" />
        <div className="flex w-full h-[30vh] text-3xl justify-center items-center">Come in the future! :)</div>
      </div>
    </div>
  );
}
