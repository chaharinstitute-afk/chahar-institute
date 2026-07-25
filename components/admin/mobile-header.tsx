"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/admin/sidebar-content";

/**
 * Top bar shown only below the lg breakpoint — a hamburger button that opens
 * the sidebar as a slide-in drawer, since the fixed sidebar is hidden on mobile.
 */
export function MobileHeader({
  canManageUsers,
  userName,
  roleName,
  initials,
}: {
  canManageUsers: boolean;
  userName: string | null | undefined;
  roleName: string | null | undefined;
  initials: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E1D8] bg-white px-4 py-2.5 print:hidden">
      <Link href="/admin" className="flex items-center">
        <Image
          src="/logoWTR.png"
          alt="Chahar Institute"
          width={130}
          height={80}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg border border-[#E5E1D8] text-[#374151] transition-colors hover:bg-[#F3F4F6]"
        >
          <Menu className="size-5" />
        </button>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-xs" showCloseButton>
          {/* Visually hidden but present for accessibility — the logo above already
              identifies the panel, this just gives the sheet a proper title. */}
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarContent
              canManageUsers={canManageUsers}
              userName={userName}
              roleName={roleName}
              initials={initials}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
