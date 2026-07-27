"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge, BadgeTone, Card, Field, FormSection, controlClass } from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type Submission = {
  id: string;
  amountPaid: string | null;
  utrNumber: string | null;
  status: "pending_verification" | "approved" | "rejected";
  submittedBy: { fullName: string };
  submittedAt: string;
  admission: {
    totalFee: string | null;
    receivedAmount: string | null;
    dueAmount: string | null;
  };
};

const STATUS_TONE: Record<string, BadgeTone> = {
  pending_verification: "warn",
  approved: "success",
  rejected: "danger",
};

/**
 * Shown on an admission's payment tab to a Super Admin for each submission that
 * still needs a decision. Mirrors ReviewPanel's approve/reject pattern but adds
 * the BRD's approval-time fields (Total Fee / Received / Due / Next Due Date / Remarks).
 */
export function PaymentReviewPanel({
  submission,
  onChanged,
}: {
  submission: Submission;
  onChanged: () => void;
}) {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [totalFee, setTotalFee] = useState(submission.admission.totalFee ?? "");
  const [receivedAmount, setReceivedAmount] = useState(
    submission.admission.receivedAmount ?? submission.amountPaid ?? ""
  );
  const [dueAmount, setDueAmount] = useState(submission.admission.dueAmount ?? "");
  const [nextDueDate, setNextDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recalcDue(total: string, received: string) {
    const t = Number(total);
    const r = Number(received);
    if (!Number.isNaN(t) && !Number.isNaN(r)) {
      setDueAmount(Math.max(t - r, 0).toString());
    }
  }

  async function handleReject() {
    setBusy(true);
    setError(null);

    const res = await apiFetch(`/api/admin/payments/${submission.id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "rejected", remarks: remarks.trim() || undefined }),
    });

    setBusy(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not reject this payment.");
      return;
    }

    onChanged();
  }

  async function handleApprove() {
    if (!totalFee || Number.isNaN(Number(totalFee))) {
      setError("Enter a valid Total Fee.");
      return;
    }
    if (!receivedAmount || Number.isNaN(Number(receivedAmount))) {
      setError("Enter a valid Received Amount.");
      return;
    }

    setBusy(true);
    setError(null);

    const res = await apiFetch(`/api/admin/payments/${submission.id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: "approved",
        totalFee,
        receivedAmount,
        dueAmount: dueAmount || undefined,
        nextPaymentDueDate: nextDueDate || undefined,
        remarks: remarks.trim() || undefined,
      }),
    });

    setBusy(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not approve this payment.");
      return;
    }

    onChanged();
  }

  if (submission.status !== "pending_verification") {
    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[#374151]">
            Submission by <span className="font-medium">{submission.submittedBy.fullName}</span>
            {" · "}
            <span className="text-[#9CA3AF]">
              {new Date(submission.submittedAt).toLocaleString("en-IN")}
            </span>
          </div>
          <Badge tone={STATUS_TONE[submission.status]}>{submission.status.replace(/_/g, " ")}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <FormSection
        title="Pending Verification"
        actions={<Badge tone="warn">pending verification</Badge>}
      >
        <p className="-mt-1 mb-4 text-sm text-[#6B7280]">
          Submitted by <span className="font-medium text-[#374151]">{submission.submittedBy.fullName}</span> ·{" "}
          {new Date(submission.submittedAt).toLocaleString("en-IN")} · Amount paid:{" "}
          <span className="font-medium text-[#374151]">₹{submission.amountPaid}</span>
          {submission.utrNumber && (
            <>
              {" "}
              · UTR: <span className="font-medium text-[#374151]">{submission.utrNumber}</span>
            </>
          )}
        </p>

        {decision !== "approved" && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setDecision("approved")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-700 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
            >
              <ThumbsUp className="size-4" />
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleReject}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <ThumbsDown className="size-4" />
              {busy ? "Working…" : "Reject"}
            </button>
            <a
              href={`/api/admin/payments/${submission.id}/screenshot`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
            >
              <Eye className="size-4" />
              View Screenshot
            </a>
          </div>
        )}

        {decision === "approved" && (
          <div className="rounded-xl border border-[#E5E1D8] bg-[#FDFBF7] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                Approve &amp; Update Balance
              </span>
              <a
                href={`/api/admin/payments/${submission.id}/screenshot`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#8a6d31] hover:underline"
              >
                <Eye className="size-3.5" />
                View Screenshot
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Total Fee" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={controlClass}
                  value={totalFee}
                  onChange={(e) => {
                    setTotalFee(e.target.value);
                    recalcDue(e.target.value, receivedAmount);
                  }}
                />
              </Field>
              <Field label="Received Amount" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={controlClass}
                  value={receivedAmount}
                  onChange={(e) => {
                    setReceivedAmount(e.target.value);
                    recalcDue(totalFee, e.target.value);
                  }}
                />
              </Field>
              <Field label="Due Amount" hint="Auto-calculated, editable">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={controlClass}
                  value={dueAmount}
                  onChange={(e) => setDueAmount(e.target.value)}
                />
              </Field>
              <Field label="Next Payment Due Date" hint="Optional">
                <input
                  type="date"
                  className={controlClass}
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Remarks" hint="Optional">
                  <input
                    className={controlClass}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setDecision(null)}
                className="inline-flex h-9 items-center rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleApprove}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-700 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
              >
                <CheckCircle2 className="size-4" />
                {busy ? "Working…" : "Confirm Approval"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </FormSection>
    </Card>
  );
}
