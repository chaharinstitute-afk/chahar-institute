"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, Search } from "lucide-react";
import {
  Badge,
  BadgeTone,
  PageHeader,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
  controlClass,
  selectClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type DueAdmission = {
  id: string;
  admissionNo: string;
  student: { fullName: string; studentCode: string };
  totalFee: string | null;
  receivedAmount: string | null;
  dueAmount: string | null;
  nextPaymentDueDate: string | null;
  lastPaymentDate: string | null;
  currentPaymentStatus: "pending_verification" | "partially_paid" | "paid" | "rejected" | null;
  createdBy: { id: string; fullName: string } | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<string, BadgeTone> = {
  pending_verification: "warn",
  partially_paid: "info",
  paid: "success",
  rejected: "danger",
};

/** Today's date, or earlier — used to flag overdue next-due-dates in the UI. */
function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}

export default function DuePaymentsPage() {
  const [rows, setRows] = useState<DueAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (dueDate) params.set("dueDate", dueDate);
    const url = params.toString() ? `/api/admin/payments/due?${params}` : "/api/admin/payments/due";
    const res = await apiFetch(url);
    if (res?.ok) setRows(await res.json());
    setLoading(false);
  }, [status, dueDate]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.admissionNo, r.student.fullName, r.student.studentCode].join(" ").toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      <PageHeader
        title="Due Payments"
        subtitle={loading ? undefined : `${rows.length} admission${rows.length === 1 ? "" : "s"} with an outstanding balance`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 w-full flex-1 sm:min-w-64 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student, admission no…"
            className={`${controlClass} pl-9`}
          />
        </div>
        <input
          type="date"
          className={`${controlClass} w-full sm:w-auto sm:min-w-40`}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          title="Filter by next due date"
        />
        <select
          className={`${selectClass} w-full sm:w-auto sm:min-w-48`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th>Admission No</Th>
            <Th>Total Fee</Th>
            <Th>Received</Th>
            <Th>Due</Th>
            <Th>Next Due Date</Th>
            <Th>Last Payment</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={9}>Loading…</TableEmpty>}
          {!loading && visible.length === 0 && (
            <TableEmpty colSpan={9} icon={<CalendarClock className="size-6" />}>
              No outstanding balances match your filters.
            </TableEmpty>
          )}
          {!loading &&
            visible.map((r) => {
              const overdue = isOverdue(r.nextPaymentDueDate);
              return (
                <Tr key={r.id} className={overdue ? "bg-amber-50/60" : undefined}>
                  <Td className="font-medium text-[#1A1A1A]">
                    {r.student.fullName}
                    <div className="text-xs text-[#9CA3AF]">{r.student.studentCode}</div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/admissions/${r.id}`}
                      className="text-[#1A1A1A] hover:text-[#C5A059] hover:underline"
                    >
                      {r.admissionNo}
                    </Link>
                  </Td>
                  <Td className="text-[#6B7280]">{r.totalFee ? `₹${r.totalFee}` : "—"}</Td>
                  <Td className="text-green-700">{r.receivedAmount ? `₹${r.receivedAmount}` : "—"}</Td>
                  <Td className="font-medium text-amber-700">{r.dueAmount ? `₹${r.dueAmount}` : "—"}</Td>
                  <Td className={overdue ? "font-medium text-amber-800" : "text-[#6B7280]"}>
                    {r.nextPaymentDueDate
                      ? new Date(r.nextPaymentDueDate).toLocaleDateString("en-IN")
                      : "—"}
                  </Td>
                  <Td className="text-[#6B7280]">
                    {r.lastPaymentDate ? new Date(r.lastPaymentDate).toLocaleDateString("en-IN") : "—"}
                  </Td>
                  <Td>
                    {r.currentPaymentStatus ? (
                      <Badge tone={STATUS_TONE[r.currentPaymentStatus]}>
                        {r.currentPaymentStatus.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/admissions/${r.id}`}
                      title="Open admission"
                      aria-label="Open admission"
                      className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </Td>
                </Tr>
              );
            })}
        </tbody>
      </TableWrap>
    </div>
  );
}
