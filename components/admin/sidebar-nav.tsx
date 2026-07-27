"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Database,
  Users,
  UserCircle,
  Plus,
  Megaphone,
  Star,
  Wallet,
  CalendarClock,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  linkTo?: string;
};

/** Shown to every signed-in admin. */
const BASE_LINKS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/admissions", label: "Admissions", icon: FileText },
  // View-only for a plain Admin (no add/edit/delete); full manage access for Super Admin.
  { href: "/admin/courses", label: "Course Names", icon: GraduationCap },
  { href: "/admin/payments/due", label: "Due Payments", icon: CalendarClock },
  { href: "/admin/payments", label: "Payment History", icon: Wallet, exact: true },
];

/** Reference-data management — Super Admin only. */
const MANAGE_LINKS: NavItem[] = [
  { href: "/admin/leads", label: "Leads", icon: Megaphone },
  { href: "/admin/business-partners", label: "Business Partners", icon: Briefcase },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/payment-methods", label: "Payment Methods", icon: CreditCard },
  { href: "/admin/masters", label: "Masters", icon: Database, linkTo: "/admin/masters/sessions" },
  { href: "/admin/users", label: "Admin Users", icon: Users },
];

const PROFILE_LINK: NavItem = { href: "/admin/profile", label: "My Profile", icon: UserCircle };

export function SidebarNav({
  canManageUsers = false,
  onNavigate,
}: {
  canManageUsers?: boolean;
  /** Called when any link is tapped — used to close the mobile drawer. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const renderLink = (item: NavItem) => {
    const active = isActive(item);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.linkTo ?? item.href}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-[#013220] text-white"
            : "text-[#6B7280] hover:bg-[#FDFBF7] hover:text-[#1A1A1A]"
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            active ? "text-[#C5A059]" : "text-[#9CA3AF] group-hover:text-[#1A1A1A]"
          )}
        />
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3">
      {/* Primary action — the task admins spend most of their time on. */}
      <Link
        href="/admin/admissions/new"
        onClick={onNavigate}
        className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
      >
        <Plus className="size-4" />
        New Admission
      </Link>

      <div className="flex flex-col gap-1">{BASE_LINKS.map(renderLink)}</div>

      {canManageUsers && (
        <>
          <div className="mt-5 mb-1.5 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Manage
          </div>
          <div className="flex flex-col gap-1">{MANAGE_LINKS.map(renderLink)}</div>
        </>
      )}

      <div className="mt-5 mb-1.5 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        Account
      </div>
      <div className="flex flex-col gap-1">{renderLink(PROFILE_LINK)}</div>
    </nav>
  );
}
