"use client";

import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";

/**
 * Toolbar shown above the printable form. Hidden when printing via `print:hidden`
 * so it never appears on the paper output.
 */
export function PrintActions({ backHref }: { backHref: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A]"
      >
        <ChevronLeft className="size-4" />
        Back to admission
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
      >
        <Printer className="size-4" />
        Print
      </button>
    </div>
  );
}
