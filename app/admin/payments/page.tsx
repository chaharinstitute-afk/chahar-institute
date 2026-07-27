"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, History, Search } from "lucide-react";
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

type Submission = {
  id: string;
  admissionId: string;
  admission: {
    admissionNo: string;
    student: { fullName: string; studentCode: string };
  };
  paymentMethod: { label: string } | null;
  amountPaid: string | null;
  utrNumber: string | null;
  status: "pending_verification" | "approved" | "rejected";
  submittedBy: { fullName: string };
  submittedAt: string;
  verifiedBy: { fullName: string } | null;
  verifiedAt: string | null;
  // Snapshot of the admission's balance as it was right after THIS submission
  // was decided — not the admission's current/live balance, which keeps
  // changing as later submissions come in. Only set once a decision is made.
  totalFeeAtDecision: string | null;
  receivedAmountAtDecision: string | null;
  dueAmountAtDecision: string | null;
  nextDueDateSet: string | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<string, BadgeTone> = {
  pending_verification: "warn",
  approved: "success",
  rejected: "danger",
};

export default function PaymentHistoryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (statusParam?: string) => {
    setLoading(true);
    const url = statusParam
      ? `/api/admin/payments?status=${statusParam}`
      : "/api/admin/payments";
    const res = await apiFetch(url);
    if (res?.ok) setSubmissions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleStatusChange(value: string) {
    setStatus(value);
    load(value || undefined);
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      [s.admission.admissionNo, s.admission.student.fullName, s.admission.student.studentCode]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [submissions, query]);

  return (
    <div>
      <PageHeader
        title="Payment History"
        subtitle={loading ? undefined : `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`}
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
        <select
          className={`${selectClass} w-full sm:w-auto sm:min-w-48`}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
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
            <Th>Amount Paid</Th>
            <Th>Method</Th>
            <Th>UTR</Th>
            <Th>Status</Th>
            <Th>Due (after this payment)</Th>
            <Th>Submitted</Th>
            <Th>Verified By</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={10}>Loading…</TableEmpty>}
          {!loading && visible.length === 0 && (
            <TableEmpty colSpan={10} icon={<History className="size-6" />}>
              No payment submissions yet.
            </TableEmpty>
          )}
          {!loading &&
            visible.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium text-[#1A1A1A]">
                  {s.admission.student.fullName}
                  <div className="text-xs text-[#9CA3AF]">{s.admission.student.studentCode}</div>
                </Td>
                <Td>
                  <Link
                    href={`/admin/admissions/${s.admissionId}`}
                    className="text-[#1A1A1A] hover:text-[#C5A059] hover:underline"
                  >
                    {s.admission.admissionNo}
                  </Link>
                </Td>
                {/* This submission's own amount — every row keeps its own value,
                    never overwritten by later payments on the same admission. */}
                <Td className="font-medium text-[#1A1A1A]">
                  {s.amountPaid ? `₹${s.amountPaid}` : "—"}
                </Td>
                <Td className="text-[#6B7280]">{s.paymentMethod?.label || "—"}</Td>
                <Td className="text-[#6B7280]">{s.utrNumber || "—"}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[s.status]}>{s.status.replace(/_/g, " ")}</Badge>
                </Td>
                {/* Snapshot of the running balance right after this submission was
                    decided — not the admission's current live balance. */}
                <Td className="text-amber-700">
                  {s.status === "approved" && s.dueAmountAtDecision !== null
                    ? `₹${s.dueAmountAtDecision}`
                    : "—"}
                </Td>
                <Td className="whitespace-nowrap text-[#6B7280]">
                  {new Date(s.submittedAt).toLocaleDateString("en-IN")}
                </Td>
                <Td className="text-[#6B7280]">{s.verifiedBy?.fullName || "—"}</Td>
                <Td>
                  <a
                    href={`/api/admin/payments/${s.id}/screenshot`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View screenshot"
                    aria-label="View screenshot"
                    className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                  >
                    <Eye className="size-4" />
                  </a>
                </Td>
              </Tr>
            ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
