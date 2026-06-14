"use client";

import { useRequireAuth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth();
  return (
    <div className="app">
      <NavBar />
      {children}
    </div>
  );
}
