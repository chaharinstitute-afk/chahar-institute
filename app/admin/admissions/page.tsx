"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, FileText, ChevronRight, Printer, Inbox } from "lucide-react";
import { AdmissionCard } from "@/components/admin/admission-card";
import {
  PageHeader,
  StatusBadge,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
  controlClass,
  selectClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type AdmissionRow = {
  id: string;
  admissionNo: string;
  admissionStatus: string;
  paymentStatus: string;
  createdAt: string;
  student: { studentCode: string; fullName: string; mobile: string | null };
  course: { courseName: string };
  admissionCategory: { categoryName: string };
  admissionSession: { session: string; sessionType: string };
  university: { universityName: string } | null;
  createdBy: { fullName: string; email: string } | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_verification", label: "Under Verification" },
  { value: "documents_pending", label: "Documents Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export default function AdmissionsListPage() {
  const [admissions, setAdmissions] = useState<AdmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    const url = status ? `/api/admin/admissions?status=${status}` : "/api/admin/admissions";
    const res = await apiFetch(url);
    if (res?.ok) setAdmissions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleFilterChange(status: string) {
    setStatusFilter(status);
    load(status || undefined);
  }

  // Client-side search across the fields an admin is most likely to look up by.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admissions;
    return admissions.filter((a) =>
      [a.admissionNo, a.student.fullName, a.student.studentCode, a.student.mobile ?? "", a.course.courseName]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [admissions, query]);

  return (
    <div>
      <PageHeader
        title="Admissions"
        subtitle={
          loading
            ? undefined
            : `${admissions.length} record${admissions.length === 1 ? "" : "s"}${
                statusFilter ? " in this status" : ""
              }`
        }
        actions={
          <Link
            href="/admin/admissions/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
          >
            <Plus className="size-4" />
            New Admission
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 w-full flex-1 sm:min-w-64 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, admission no, mobile…"
            className={`${controlClass} pl-9`}
          />
        </div>
        <select
          className={`${selectClass} w-full sm:w-auto sm:min-w-44`}
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Below md: cards. A table with hidden columns is still hard to scan on
          a phone, so admissions render as stacked cards instead. */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6 text-center text-sm text-[#9CA3AF]">
            Loading…
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E1D8] bg-white p-8 text-center text-[#9CA3AF]">
            <Inbox className="size-6" />
            <span className="text-sm">
              {query || statusFilter
                ? "No admissions match your filters."
                : "No admissions yet. Create the first one to get started."}
            </span>
          </div>
        )}
        {!loading &&
          visible.map((a) => (
            <AdmissionCard
              key={a.id}
              id={a.id}
              admissionNo={a.admissionNo}
              admissionStatus={a.admissionStatus}
              studentName={a.student.fullName}
              studentCode={a.student.studentCode}
              mobile={a.student.mobile}
              courseName={a.course.courseName}
              categoryName={a.admissionCategory.categoryName}
              sessionLabel={`${a.admissionSession.session} · ${a.admissionSession.sessionType}`}
              filledBy={a.createdBy?.fullName}
              date={new Date(a.createdAt).toLocaleDateString("en-IN")}
            />
          ))}
      </div>

      {/* md and up: full table. */}
      <div className="hidden md:block">
        <TableWrap>
          <thead>
            <tr>
              <Th>Admission No</Th>
              <Th>Student</Th>
              <Th className="hidden sm:table-cell">Mobile</Th>
              <Th>Course</Th>
              <Th>Category</Th>
              <Th className="hidden lg:table-cell">Session</Th>
              <Th>Status</Th>
              <Th className="hidden lg:table-cell">Filled By</Th>
              <Th className="hidden sm:table-cell">Date</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {loading && <TableEmpty colSpan={10}>Loading…</TableEmpty>}
            {!loading && visible.length === 0 && (
              <TableEmpty colSpan={10} icon={<FileText className="size-6" />}>
                {query || statusFilter
                  ? "No admissions match your filters."
                  : "No admissions yet. Create the first one to get started."}
              </TableEmpty>
            )}
            {!loading &&
              visible.map((a) => (
                <Tr key={a.id}>
                  <Td className="whitespace-nowrap font-medium text-[#1A1A1A]">
                    <Link href={`/admin/admissions/${a.id}`} className="hover:text-[#C5A059] hover:underline">
                      {a.admissionNo}
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-[#1A1A1A]">{a.student.fullName}</span>
                    <div className="text-xs text-[#9CA3AF]">{a.student.studentCode}</div>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-[#6B7280] sm:table-cell">
                    {a.student.mobile || "—"}
                  </Td>
                  <Td className="text-[#6B7280]">{a.course.courseName}</Td>
                  <Td className="text-[#6B7280]">{a.admissionCategory.categoryName}</Td>
                  <Td className="hidden whitespace-nowrap text-[#6B7280] lg:table-cell">
                    {a.admissionSession.session} · {a.admissionSession.sessionType}
                  </Td>
                  <Td>
                    <StatusBadge status={a.admissionStatus} />
                  </Td>
                  <Td className="hidden text-[#6B7280] lg:table-cell">
                    {a.createdBy ? a.createdBy.fullName : "—"}
                  </Td>
                  <Td className="hidden whitespace-nowrap text-[#6B7280] sm:table-cell">
                    {new Date(a.createdAt).toLocaleDateString("en-IN")}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/admissions/${a.id}/print`}
                        title="Print form"
                        aria-label="Print form"
                        className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                      >
                        <Printer className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/admissions/${a.id}`}
                        title="Open admission"
                        aria-label="Open admission"
                        className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}
