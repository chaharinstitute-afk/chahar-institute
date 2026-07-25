"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Confirmation dialog for destructive actions — replaces window.confirm/alert
 * so the admin panel keeps a consistent look and doesn't rely on browser modals.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  error = null,
  tone = "danger",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
  /** "danger" for destructive actions, "primary" for confirmations like submitting. */
  tone?: "danger" | "primary";
}) {
  const isDanger = tone === "danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-md">
        <div className="flex gap-3.5 p-5">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              isDanger ? "bg-red-50" : "bg-[#C5A059]/15"
            }`}
          >
            <AlertTriangle className={`size-4 ${isDanger ? "text-red-600" : "text-[#8a6d31]"}`} />
          </span>
          <DialogHeader className="gap-1.5">
            <DialogTitle className="leading-snug">{title}</DialogTitle>
            {description && (
              <DialogDescription className="leading-relaxed">{description}</DialogDescription>
            )}
            {error && (
              <p className="mt-1 flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
          </DialogHeader>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl">
          <button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#E5E1D8] bg-white px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex h-9 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 sm:w-auto ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-[#1A1A1A] hover:bg-[#013220]"
            }`}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
