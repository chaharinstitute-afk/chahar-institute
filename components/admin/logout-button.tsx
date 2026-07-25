"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex w-full items-center gap-2 rounded-lg border border-[#E5E1D8] px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#FDFBF7] hover:text-[#1A1A1A]"
    >
      <LogOut className="size-4 shrink-0 text-[#9CA3AF]" />
      Sign out
    </button>
  );
}
