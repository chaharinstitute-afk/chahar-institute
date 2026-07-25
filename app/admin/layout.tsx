import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { SidebarContent } from "@/components/admin/sidebar-content";
import { MobileHeader } from "@/components/admin/mobile-header";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  // The login page renders its own full-screen layout with no chrome at all.
  // Every other /admin route gets the sidebar shell below.
  if (!session) {
    return <>{children}</>;
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canManageUsers = granted.has(PERMISSIONS.MANAGE_ADMIN_USERS);

  const initials = (session.user?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    // overflow-x-clip keeps a wide table from scrolling the whole page (and the
    // sidebar) sideways — tables manage their own horizontal scroll internally.
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row overflow-x-clip print:block print:bg-white print:overflow-visible">
      {/* Below lg: a slim top bar with a drawer trigger instead of a fixed rail. */}
      <MobileHeader
        canManageUsers={canManageUsers}
        userName={session.user?.name}
        roleName={session.user?.roleName}
        initials={initials}
      />

      {/* lg and up: the sidebar is always visible and pinned to the viewport height. */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E1D8] flex-col shrink-0 sticky top-0 h-screen print:hidden">
        <SidebarContent
          canManageUsers={canManageUsers}
          userName={session.user?.name}
          roleName={session.user?.roleName}
          initials={initials}
        />
      </aside>

      <main className="flex-1 min-w-0 max-w-full p-4 sm:p-6 lg:p-8 print:p-0">{children}</main>
    </div>
  );
}
