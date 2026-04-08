"use client";

import { signOut } from "next-auth/react";
import type { SessionUser } from "@/lib/session";
import { LABELS_PERFIL } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

export function Header({ user }: { user: SessionUser }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{user.name}</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {LABELS_PERFIL[user.perfil]}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
