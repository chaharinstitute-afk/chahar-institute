"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/masters/sessions", label: "Sessions" },
  { href: "/admin/masters/faculties", label: "Faculties" },
  { href: "/admin/masters/streams", label: "Streams" },
  { href: "/admin/masters/course-types", label: "Course Types" },
  // Course names live on their own page (they carry fee/duration/eligibility),
  // but belong in this nav group conceptually.
  { href: "/admin/courses", label: "Course Names" },
  { href: "/admin/masters/religions", label: "Religions" },
  { href: "/admin/masters/caste-categories", label: "Caste Categories" },
  { href: "/admin/masters/document-types", label: "Document Types" },
];

export function MastersTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[#E5E1D8] pb-3">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#013220] text-white"
                : "text-[#6B7280] hover:bg-white hover:text-[#1A1A1A] border border-transparent hover:border-[#E5E1D8]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
