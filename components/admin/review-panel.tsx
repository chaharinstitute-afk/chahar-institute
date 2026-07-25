"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileSearch, FileWarning, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, FormSection, controlClass } from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

/**
 * Verification actions available to a Super Admin, driven by the current status.
 * Mirrors the transition map enforced in the status API route.
 */
const ACTIONS_BY_STATUS: Record<
  string,
  { status: string; label: string; icon: typeof ThumbsUp; tone: "neutral" | "approve" | "reject" }[]
> = {
  submitted: [
    { status: "under_verification", label: "Start Verification", icon: FileSearch, tone: "neutral" },
    { status: "documents_pending", label: "Request Documents", icon: FileWarning, tone: "neutral" },
    { status: "approved", label: "Approve", icon: ThumbsUp, tone: "approve" },
    { status: "rejected", label: "Reject", icon: ThumbsDown, tone: "reject" },
  ],
  under_verification: [
    { status: "documents_pending", label: "Request Documents", icon: FileWarning, tone: "neutral" },
    { status: "approved", label: "Approve", icon: ThumbsUp, tone: "approve" },
    { status: "rejected", label: "Reject", icon: ThumbsDown, tone: "reject" },
  ],
  documents_pending: [
    { status: "under_verification", label: "Resume Verification", icon: FileSearch, tone: "neutral" },
    { status: "approved", label: "Approve", icon: ThumbsUp, tone: "approve" },
    { status: "rejected", label: "Reject", icon: ThumbsDown, tone: "reject" },
  ],
  approved: [
    { status: "completed", label: "Mark Completed", icon: CheckCircle2, tone: "approve" },
  ],
  rejected: [
    { status: "submitted", label: "Reopen as Submitted", icon: FileSearch, tone: "neutral" },
  ],
};

const TONE_CLASSES = {
  neutral: "border border-[#E5E1D8] bg-white text-[#374151] hover:bg-[#F3F4F6]",
  approve: "bg-green-700 text-white hover:bg-green-800",
  reject: "bg-red-600 text-white hover:bg-red-700",
} as const;

export function ReviewPanel({
  admissionId,
  currentStatus,
  onChanged,
}: {
  admissionId: string;
  currentStatus: string;
  onChanged: () => void;
}) {
  const [remarks, setRemarks] = useState("");
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const actions = ACTIONS_BY_STATUS[currentStatus] ?? [];

  // Draft admissions are still with the admin who created them, and completed
  // ones are final — no review actions apply in either case.
  if (actions.length === 0) return null;

  async function apply(status: string, label: string) {
    setBusyStatus(status);
    setError(null);
    setNotice(null);

    const res = await apiFetch(`/api/admin/admissions/${admissionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remarks: remarks.trim() || undefined }),
    });

    setBusyStatus(null);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || `Could not apply "${label}"`);
      return;
    }

    setRemarks("");
    setNotice(`${label} applied.`);
    onChanged();
  }

  return (
    <Card className="mb-5">
      <FormSection title="Verification">
        <div className="mb-4 max-w-xl">
          <label className="mb-1.5 block text-xs font-medium text-[#374151]">
            Remarks <span className="text-[#9CA3AF]">(optional, saved with the decision)</span>
          </label>
          <input
            className={controlClass}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. 10th marksheet is unclear, please re-upload"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map(({ status, label, icon: Icon, tone }) => (
            <button
              key={status}
              type="button"
              disabled={busyStatus !== null}
              onClick={() => apply(status, label)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors disabled:opacity-60 ${TONE_CLASSES[tone]}`}
            >
              <Icon className="size-4" />
              {busyStatus === status ? "Working…" : label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="size-4 shrink-0" />
            {notice}
          </p>
        )}
      </FormSection>
    </Card>
  );
}
