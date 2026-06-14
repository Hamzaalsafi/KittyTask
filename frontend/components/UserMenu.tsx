"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface UserMenuProps {
  avatarColor: string;
  avatarInitials: string;
  userName: string;
  userEmail: string;
}

export function UserMenu({ avatarColor, avatarInitials, userName, userEmail }: UserMenuProps) {
  const { logout } = useAuth();

  return (
    <div
      style={{ backgroundColor: "#37393C" }}
      className="h-fit gap-2 flex flex-col w-64 text-gray-300 py-4 shadow-xl fixed z-[10000] rounded-md top-12 right-1"
    >
      <p className="text-sm mb-2 px-5">ACCOUNT</p>
      <div className="flex px-4">
        <div className="flex justify-center items-center hover:opacity-85 cursor-pointer">
          <div
            className="pointer-events-none mr-2 select-none mb-1"
            style={{
              backgroundColor: avatarColor,
              color: "rgb(39, 39, 42)",
              width: "40px",
              height: "40px",
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
          <p className="text-md mb-[-4px]">{userName}</p>
          <p className="text-sm opacity-90">{userEmail}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <hr className="border-0 border-b w-[95%] opacity-25" />
      </div>
      <Link href="/archive">
        <div className="flex items-center cursor-pointer px-5 py-1.5 hover:bg-zinc-800 w-full justify-between">
          <p className="text-[.9rem]">Cards Archive</p>
        </div>
      </Link>
      <div className="flex justify-center">
        <hr className="border-0 border-b w-[95%] opacity-25" />
      </div>
      <div className="flex items-center cursor-pointer px-5 py-1.5 hover:bg-zinc-800 w-full justify-between">
        <p onClick={logout} className="text-[.9rem]">
          Log out
        </p>
      </div>
    </div>
  );
}
