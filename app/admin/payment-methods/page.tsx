"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CreditCard, Landmark, Plus, QrCode, Smartphone, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  Field,
  PageHeader,
  StatusToggle,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
  controlClass,
  selectClass,
} from "@/components/admin/ui";
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
  isActive: boolean;
  sortOrder: number;
};

const EMPTY_FORM = {
  label: "",
  type: "upi" as "upi" | "bank_transfer",
  upiId: "",
  upiNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
};

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [removeQr, setRemoveQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/payment-methods?all=1");
    if (res?.ok) setMethods(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setQrFile(null);
    setRemoveQr(false);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(m: PaymentMethod) {
    setEditing(m);
    setForm({
      label: m.label,
      type: m.type,
      upiId: m.upiId ?? "",
      upiNumber: m.upiNumber ?? "",
      bankName: m.bankName ?? "",
      accountNumber: m.accountNumber ?? "",
      ifscCode: m.ifscCode ?? "",
    });
    setQrFile(null);
    setRemoveQr(false);
    setError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.label.trim()) {
      setError("Label is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.append("label", form.label.trim());
    fd.append("type", form.type);
    fd.append("upiId", form.upiId.trim());
    fd.append("upiNumber", form.upiNumber.trim());
    fd.append("bankName", form.bankName.trim());
    fd.append("accountNumber", form.accountNumber.trim());
    fd.append("ifscCode", form.ifscCode.trim());
    if (qrFile) fd.append("qrCode", qrFile);
    if (removeQr) fd.append("removeQrCode", "1");

    const res = editing
      ? await apiFetch(`/api/admin/payment-methods/${editing.id}`, { method: "PATCH", body: fd })
      : await apiFetch("/api/admin/payment-methods", { method: "POST", body: fd });

    setSaving(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not save this payment method.");
      return;
    }

    setDialogOpen(false);
    load();
  }

  async function handleToggleActive(m: PaymentMethod) {
    setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, isActive: !x.isActive } : x)));
    const fd = new FormData();
    fd.append("isActive", String(!m.isActive));
    const res = await apiFetch(`/api/admin/payment-methods/${m.id}`, { method: "PATCH", body: fd });
    if (!res?.ok) load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/payment-methods/${pendingDelete.id}`, { method: "DELETE" });

    setDeleting(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error || "Delete failed");
      return;
    }

    setPendingDelete(null);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Payment Methods"
        subtitle="QR codes and UPI/bank details shown to Admins when they record a payment."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
          >
            <Plus className="size-4" />
            Add Method
          </button>
        }
      />

      <TableWrap>
        <thead>
          <tr>
            <Th>Label</Th>
            <Th>Type</Th>
            <Th>Details</Th>
            <Th>QR Code</Th>
            <Th>Status</Th>
            <Th className="w-16" />
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={6}>Loading…</TableEmpty>}
          {!loading && methods.length === 0 && (
            <TableEmpty colSpan={6} icon={<CreditCard className="size-6" />}>
              No payment methods yet. Add a UPI ID or bank account so Admins can start recording payments.
            </TableEmpty>
          )}
          {!loading &&
            methods.map((m) => (
              <Tr key={m.id}>
                <Td className="font-medium text-[#1A1A1A]">{m.label}</Td>
                <Td className="text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    {m.type === "upi" ? (
                      <Smartphone className="size-3.5" />
                    ) : (
                      <Landmark className="size-3.5" />
                    )}
                    {m.type === "upi" ? "UPI" : "Bank Transfer"}
                  </span>
                </Td>
                <Td className="text-[#6B7280]">
                  {m.type === "upi" ? (
                    <>
                      {m.upiId && <div>{m.upiId}</div>}
                      {m.upiNumber && <div className="text-xs text-[#9CA3AF]">{m.upiNumber}</div>}
                      {!m.upiId && !m.upiNumber && "—"}
                    </>
                  ) : (
                    <>
                      {m.bankName && <div>{m.bankName}</div>}
                      {m.accountNumber && (
                        <div className="text-xs text-[#9CA3AF]">
                          {m.accountNumber} {m.ifscCode && `· ${m.ifscCode}`}
                        </div>
                      )}
                      {!m.bankName && !m.accountNumber && "—"}
                    </>
                  )}
                </Td>
                <Td>
                  {m.hasQrCode ? (
                    <a
                      href={`/api/admin/payment-methods/${m.id}/qr-code`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8a6d31] hover:underline"
                    >
                      <QrCode className="size-3.5" />
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">None</span>
                  )}
                </Td>
                <Td>
                  <StatusToggle active={m.isActive} onClick={() => handleToggleActive(m)} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(m);
                      }}
                      className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
        </tbody>
      </TableWrap>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label" required hint="e.g. Primary UPI, HDFC Current A/C">
                <input
                  className={controlClass}
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </Field>
              <Field label="Type" required>
                <select
                  className={selectClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "upi" | "bank_transfer" })}
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </Field>
            </div>

            {form.type === "upi" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="UPI ID" hint="e.g. chaharinstitute@upi">
                  <input
                    className={controlClass}
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  />
                </Field>
                <Field label="UPI Number">
                  <input
                    className={controlClass}
                    value={form.upiNumber}
                    onChange={(e) => setForm({ ...form, upiNumber: e.target.value })}
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bank Name">
                  <input
                    className={controlClass}
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  />
                </Field>
                <Field label="Account Number">
                  <input
                    className={controlClass}
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  />
                </Field>
                <Field label="IFSC Code">
                  <input
                    className={controlClass}
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                  />
                </Field>
              </div>
            )}

            <Field
              label="QR Code Image"
              hint={editing?.hasQrCode ? "Leave blank to keep the current QR code" : "JPG, PNG or WEBP · max 5MB"}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  setQrFile(e.target.files?.[0] || null);
                  setRemoveQr(false);
                }}
                className="block w-full text-xs text-[#6B7280] file:mr-2 file:rounded-md file:border-0 file:bg-[#F3F4F6] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[#374151] hover:file:bg-[#E5E7EB]"
              />
              {editing?.hasQrCode && !qrFile && (
                <button
                  type="button"
                  onClick={() => setRemoveQr((v) => !v)}
                  className={`mt-1 self-start text-xs font-medium ${
                    removeQr ? "text-red-600" : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {removeQr ? "Will remove current QR code on save — click to undo" : "Remove current QR code"}
                </button>
              )}
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
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="inline-flex h-9 items-center rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 items-center rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={`Delete "${pendingDelete?.label ?? ""}"?`}
        description="This cannot be undone. If it has payment history, deactivate it instead."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
