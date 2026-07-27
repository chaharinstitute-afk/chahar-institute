"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, QrCode, Smartphone, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, controlClass, selectClass } from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type PaymentMethod = {
  id: string;
  type: "upi" | "bank_transfer";
  label: string;
  upiId: string | null;
  upiNumber: string | null;
  hasQrCode: boolean;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
};

export function PaymentPopup({
  open,
  onOpenChange,
  admissionId,
  dueAmount,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionId: string;
  /** Prefills the amount field with the admission's current outstanding balance, if known. */
  dueAmount?: string | null;
  onSubmitted: () => void;
}) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMethods = useCallback(async () => {
    const res = await apiFetch("/api/admin/payment-methods");
    if (res?.ok) setMethods(await res.json());
  }, []);

  useEffect(() => {
    if (open) {
      loadMethods();
      setAmount(dueAmount && Number(dueAmount) > 0 ? dueAmount : "");
      setUtr("");
      setScreenshot(null);
      setError(null);
    }
  }, [open, dueAmount, loadMethods]);

  const selectedMethod = methods.find((m) => m.id === methodId);

  async function handleSubmit() {
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!screenshot) {
      setError("A payment screenshot is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("amountPaid", amount);
    if (methodId) fd.append("paymentMethodId", methodId);
    if (utr.trim()) fd.append("utrNumber", utr.trim());
    fd.append("screenshot", screenshot);

    const res = await apiFetch(`/api/admin/admissions/${admissionId}/payments`, {
      method: "POST",
      body: fd,
    });

    setSubmitting(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not submit the payment.");
      return;
    }

    onOpenChange(false);
    onSubmitted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field label="Payment method">
            <select
              className={selectClass}
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
            >
              <option value="">Select a method…</option>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          {selectedMethod && (
            <div className="rounded-xl border border-[#E5E1D8] bg-[#FDFBF7] p-3.5">
              {selectedMethod.hasQrCode && (
                <div className="mb-3 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/admin/payment-methods/${selectedMethod.id}/qr-code`}
                    alt={`${selectedMethod.label} QR code`}
                    className="h-40 w-40 rounded-lg border border-[#E5E1D8] bg-white object-contain p-1.5"
                  />
                </div>
              )}
              {selectedMethod.type === "upi" ? (
                <div className="flex flex-col gap-1 text-sm">
                  {selectedMethod.upiId && (
                    <div className="flex items-center gap-1.5 text-[#374151]">
                      <Smartphone className="size-3.5 shrink-0 text-[#9CA3AF]" />
                      UPI ID: <span className="font-medium">{selectedMethod.upiId}</span>
                    </div>
                  )}
                  {selectedMethod.upiNumber && (
                    <div className="flex items-center gap-1.5 text-[#374151]">
                      <QrCode className="size-3.5 shrink-0 text-[#9CA3AF]" />
                      UPI Number: <span className="font-medium">{selectedMethod.upiNumber}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-sm text-[#374151]">
                  {selectedMethod.bankName && (
                    <div>
                      Bank: <span className="font-medium">{selectedMethod.bankName}</span>
                    </div>
                  )}
                  {selectedMethod.accountNumber && (
                    <div>
                      A/C No: <span className="font-medium">{selectedMethod.accountNumber}</span>
                    </div>
                  )}
                  {selectedMethod.ifscCode && (
                    <div>
                      IFSC: <span className="font-medium">{selectedMethod.ifscCode}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Field label="Amount Paid" required>
            <input
              type="number"
              min="0"
              step="0.01"
              className={controlClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>

          <Field label="UTR / Transaction ID" hint="Optional">
            <input
              className={controlClass}
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 401234567890"
            />
          </Field>

          <Field label="Payment Screenshot" required hint="JPG, PNG or WEBP · max 5MB">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="block w-full text-xs text-[#6B7280] file:mr-2 file:rounded-md file:border-0 file:bg-[#F3F4F6] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[#374151] hover:file:bg-[#E5E7EB]"
            />
          </Field>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="inline-flex h-9 items-center rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
          >
            <Upload className="size-3.5" />
            {submitting ? "Submitting…" : "Submit for Verification"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
