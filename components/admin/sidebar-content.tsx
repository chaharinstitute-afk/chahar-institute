import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { LogoutButton } from "@/components/admin/logout-button";
import { SidebarNav } from "@/components/admin/sidebar-nav";

/**
 * The full sidebar body — logo, nav links, and the signed-in user footer.
 * Shared between the fixed desktop sidebar and the mobile drawer so the two
 * never drift apart.
 */
export function SidebarContent({
  canManageUsers,
  userName,
  roleName,
  initials,
  onNavigate,
}: {
  canManageUsers: boolean;
  userName: string | null | undefined;
  roleName: string | null | undefined;
  initials: string;
  /** Called when a nav link is tapped — used to close the mobile drawer. */
  onNavigate?: () => void;
}): ReactNode {
  return (
    <>
      <Link
        href="/admin"
        onClick={onNavigate}
        className="px-5 py-4 border-b border-[#E5E1D8] block hover:bg-[#FDFBF7] transition-colors"
      >
        <Image
          src="/logoWTR.png"
          alt="Chahar Institute"
          width={260}
          height={160}
          className="h-16 w-32 object-contain sm:h-20 sm:w-40"
          priority
        />
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="h-[2px] w-3 rounded-full bg-[#C5A059]" />
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
            Admin Panel
          </span>
        </div>
      </Link>

      <SidebarNav canManageUsers={canManageUsers} onNavigate={onNavigate} />

      <div className="p-3 border-t border-[#E5E1D8]">
        <div className="flex items-center gap-2.5 px-1 mb-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#013220] text-[0.7rem] font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-[#1A1A1A]">{userName}</div>
            <div className="truncate text-[0.68rem] text-[#9CA3AF]">{roleName}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </>
  );
}
