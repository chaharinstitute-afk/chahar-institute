import Link from "next/link";
import { ChevronRight, Printer } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui";

/**
 * Mobile-only card representation of an admission row. Tables are hard to read
 * on narrow screens even with hidden columns, so below `md` we swap to these
 * cards instead (see admissions list + dashboard "Recent Admissions").
 */
export function AdmissionCard({
  id,
  admissionNo,
  admissionStatus,
  studentName,
  studentCode,
  mobile,
  courseName,
  categoryName,
  sessionLabel,
  filledBy,
  date,
}: {
  id: string;
  admissionNo: string;
  admissionStatus: string;
  studentName: string;
  studentCode: string;
  mobile?: string | null;
  courseName: string;
  categoryName?: string;
  sessionLabel: string;
  filledBy?: string | null;
  date: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(1,50,32,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/admissions/${id}`}
            className="font-medium text-[#1A1A1A] hover:text-[#C5A059] hover:underline"
          >
            {admissionNo}
          </Link>
          <div className="mt-0.5 text-sm text-[#1A1A1A]">{studentName}</div>
          <div className="text-xs text-[#9CA3AF]">{studentCode}</div>
        </div>
        <StatusBadge status={admissionStatus} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F0EDE7] pt-3 text-xs">
        <div>
          <dt className="text-[#9CA3AF]">Course</dt>
          <dd className="mt-0.5 truncate text-[#374151]">{courseName}</dd>
        </div>
        {categoryName && (
          <div>
            <dt className="text-[#9CA3AF]">Category</dt>
            <dd className="mt-0.5 truncate text-[#374151]">{categoryName}</dd>
          </div>
        )}
        <div>
          <dt className="text-[#9CA3AF]">Session</dt>
          <dd className="mt-0.5 truncate text-[#374151]">{sessionLabel}</dd>
        </div>
        {mobile && (
          <div>
            <dt className="text-[#9CA3AF]">Mobile</dt>
            <dd className="mt-0.5 truncate text-[#374151]">{mobile}</dd>
          </div>
        )}
        {filledBy && (
          <div>
            <dt className="text-[#9CA3AF]">Filled By</dt>
            <dd className="mt-0.5 truncate text-[#374151]">{filledBy}</dd>
          </div>
        )}
        <div>
          <dt className="text-[#9CA3AF]">Date</dt>
          <dd className="mt-0.5 truncate text-[#374151]">{date}</dd>
        </div>
      </dl>

      <div className="mt-3 flex gap-2 border-t border-[#F0EDE7] pt-3">
        <Link
          href={`/admin/admissions/${id}/print`}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E1D8] text-xs font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
        >
          <Printer className="size-3.5" />
          Print
        </Link>
        <Link
          href={`/admin/admissions/${id}`}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] text-xs font-semibold text-white transition-colors hover:bg-[#013220]"
        >
          Open
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
