"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarClock, Inbox, Mail, Megaphone, Phone, Search, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Badge,
  BadgeTone,
  Card,
  Field,
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

type LeadStatus = "new" | "contacted" | "converted" | "closed";

type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  interestedCourse: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  remarks: string | null;
  followUpDate: string | null;
  followUpNote: string | null;
  createdAt: string;
};

/** Today at midnight, local time — used to compare against a lead's followUpDate. */
function todayDateOnly(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isFollowUpDue(followUpDate: string | null): boolean {
  if (!followUpDate) return false;
  const due = new Date(followUpDate);
  due.setHours(0, 0, 0, 0);
  return due <= todayDateOnly();
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: "info",
  contacted: "warn",
  converted: "success",
  closed: "neutral",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<Lead | null>(null);
  const [followUpDateInput, setFollowUpDateInput] = useState("");
  const [followUpNoteInput, setFollowUpNoteInput] = useState("");
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [showDueOnly, setShowDueOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/leads");
    if (res?.ok) setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dueCount = useMemo(() => leads.filter((l) => isFollowUpDue(l.followUpDate)).length, [leads]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (statusFilter && l.status !== statusFilter) return false;
        if (showDueOnly && !isFollowUpDue(l.followUpDate)) return false;
        if (!q) return true;
        return [l.fullName, l.phone, l.email ?? "", l.interestedCourse ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      // Due follow-ups float to the top so they're impossible to miss.
      .sort((a, b) => Number(isFollowUpDue(b.followUpDate)) - Number(isFollowUpDue(a.followUpDate)));
  }, [leads, statusFilter, query, showDueOnly]);

  function openFollowUpDialog(lead: Lead) {
    setFollowUpError(null);
    setFollowUpDateInput(lead.followUpDate ? lead.followUpDate.slice(0, 10) : "");
    setFollowUpNoteInput(lead.followUpNote ?? "");
    setFollowUpTarget(lead);
  }

  async function handleSaveFollowUp() {
    if (!followUpTarget) return;
    if (!followUpDateInput) {
      setFollowUpError("Pick a follow-up date.");
      return;
    }

    setFollowUpSaving(true);
    setFollowUpError(null);

    const res = await apiFetch(`/api/admin/leads/${followUpTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: followUpDateInput, followUpNote: followUpNoteInput }),
    });

    setFollowUpSaving(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFollowUpError(body.error || "Failed to save follow-up");
      return;
    }

    setFollowUpTarget(null);
    load();
  }

  async function handleClearFollowUp() {
    if (!followUpTarget) return;
    setFollowUpSaving(true);
    setFollowUpError(null);

    const res = await apiFetch(`/api/admin/leads/${followUpTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: null }),
    });

    setFollowUpSaving(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFollowUpError(body.error || "Failed to clear follow-up");
      return;
    }

    setFollowUpTarget(null);
    load();
  }

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    const res = await apiFetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res?.ok) load(); // revert to server truth on failure
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/leads/${pendingDelete.id}`, { method: "DELETE" });

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
        title="Leads"
        subtitle={
          loading
            ? undefined
            : `${leads.length} enquir${leads.length === 1 ? "y" : "ies"} from the website`
        }
      />

      {dueCount > 0 && (
        <button
          type="button"
          onClick={() => setShowDueOnly((v) => !v)}
          className={`mb-4 flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-colors ${
            showDueOnly
              ? "border-amber-400 bg-amber-50"
              : "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
          }`}
        >
          <CalendarClock className="size-4 shrink-0 text-amber-700" />
          <span className="text-sm font-medium text-amber-900">
            {dueCount} follow-up{dueCount === 1 ? "" : "s"} due for a call today or earlier.
          </span>
          <span className="ml-auto text-xs font-semibold text-amber-700 underline">
            {showDueOnly ? "Show all" : "View due"}
          </span>
        </button>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 w-full flex-1 sm:min-w-64 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
            className={`${controlClass} pl-9`}
          />
        </div>
        <select
          className={`${selectClass} w-full sm:w-auto sm:min-w-40`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Below md: cards — same pattern used for admissions on small screens. */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6 text-center text-sm text-[#9CA3AF]">
            Loading…
          </div>
        )}
        {!loading && visible.length === 0 && (
          <EmptyState hasFilters={!!(query || statusFilter)} />
        )}
        {!loading &&
          visible.map((l) => {
            const due = isFollowUpDue(l.followUpDate);
            return (
              <Card
                key={l.id}
                padded={false}
                className={`p-4 ${due ? "border-amber-400 bg-amber-50/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1A1A]">{l.fullName}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <Phone className="size-3" />
                      {l.phone}
                    </div>
                    {l.email && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <Mail className="size-3" />
                        {l.email}
                      </div>
                    )}
                  </div>
                  <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
                </div>

                {l.interestedCourse && (
                  <p className="mt-2 text-xs text-[#374151]">
                    <span className="text-[#9CA3AF]">Course: </span>
                    {l.interestedCourse}
                  </p>
                )}
                {l.message && <p className="mt-1 text-xs text-[#374151] line-clamp-2">{l.message}</p>}

                {l.followUpDate && (
                  <div
                    className={`mt-2 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                      due ? "bg-amber-100 text-amber-900" : "bg-[#F3F4F6] text-[#374151]"
                    }`}
                  >
                    <CalendarClock className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {due ? "Due: " : "Follow up: "}
                      {new Date(l.followUpDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {l.followUpNote ? ` — ${l.followUpNote}` : ""}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 border-t border-[#F0EDE7] pt-3">
                  <select
                    className={`${selectClass} h-8 flex-1 text-xs`}
                    value={l.status}
                    onChange={(e) => handleStatusChange(l, e.target.value as LeadStatus)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Schedule follow-up"
                    aria-label="Schedule follow-up"
                    onClick={() => openFollowUpDialog(l)}
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      l.followUpDate
                        ? "text-amber-700 hover:bg-amber-50"
                        : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <CalendarClock className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    aria-label="Delete"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(l);
                    }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            );
          })}
      </div>

      {/* md and up: full table. */}
      <div className="hidden md:block">
        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Interested Course</Th>
              <Th className="hidden lg:table-cell">Message</Th>
              <Th className="hidden sm:table-cell">Date</Th>
              <Th className="w-48">Follow-up</Th>
              <Th className="w-40">Status</Th>
              <Th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {loading && <TableEmpty colSpan={8}>Loading…</TableEmpty>}
            {!loading && visible.length === 0 && (
              <TableEmpty colSpan={8} icon={<Inbox className="size-6" />}>
                <EmptyState hasFilters={!!(query || statusFilter)} inline />
              </TableEmpty>
            )}
            {!loading &&
              visible.map((l) => {
                const due = isFollowUpDue(l.followUpDate);
                return (
                  <Tr key={l.id} className={due ? "bg-amber-50/60" : undefined}>
                    <Td className="font-medium text-[#1A1A1A]">{l.fullName}</Td>
                    <Td>
                      <div className="text-[#374151]">{l.phone}</div>
                      {l.email && <div className="text-xs text-[#9CA3AF]">{l.email}</div>}
                    </Td>
                    <Td className="text-[#6B7280]">{l.interestedCourse || "—"}</Td>
                    <Td className="hidden max-w-xs truncate text-[#6B7280] lg:table-cell">
                      {l.message || "—"}
                    </Td>
                    <Td className="hidden whitespace-nowrap text-[#6B7280] sm:table-cell">
                      {new Date(l.createdAt).toLocaleDateString("en-IN")}
                    </Td>
                    <Td>
                      {l.followUpDate ? (
                        <button
                          type="button"
                          onClick={() => openFollowUpDialog(l)}
                          title={l.followUpNote ?? ""}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            due
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                              : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                          }`}
                        >
                          <CalendarClock className="size-3.5 shrink-0" />
                          {new Date(l.followUpDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openFollowUpDialog(l)}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                        >
                          <CalendarClock className="size-3.5 shrink-0" />
                          Schedule
                        </button>
                      )}
                    </Td>
                    <Td>
                      <select
                        className={`${selectClass} h-8 text-xs`}
                        value={l.status}
                        onChange={(e) => handleStatusChange(l, e.target.value as LeadStatus)}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(l);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
          </tbody>
        </TableWrap>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={`Delete enquiry from ${pendingDelete?.fullName ?? ""}?`}
        description="This cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />

      {/* Schedule / edit follow-up */}
      <Dialog
        open={followUpTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFollowUpTarget(null);
            setFollowUpError(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule follow-up{followUpTarget ? ` — ${followUpTarget.fullName}` : ""}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Follow-up date" required hint="Lead is highlighted once this date arrives">
              <input
                type="date"
                className={controlClass}
                value={followUpDateInput}
                onChange={(e) => setFollowUpDateInput(e.target.value)}
              />
            </Field>
            <Field label="Remark" hint="e.g. Asked to call back after 10 days">
              <textarea
                className={`${controlClass} h-auto py-2`}
                rows={3}
                placeholder="Why this follow-up is scheduled"
                value={followUpNoteInput}
                onChange={(e) => setFollowUpNoteInput(e.target.value)}
              />
            </Field>

            {followUpError && (
              <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {followUpError}
              </p>
            )}
          </div>

          <DialogFooter>
            {followUpTarget?.followUpDate && (
              <button
                type="button"
                onClick={handleClearFollowUp}
                disabled={followUpSaving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60 sm:mr-auto"
              >
                <X className="size-3.5" />
                Clear follow-up
              </button>
            )}
            <button
              type="button"
              onClick={() => setFollowUpTarget(null)}
              disabled={followUpSaving}
              className="inline-flex h-9 items-center rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFollowUp}
              disabled={followUpSaving}
              className="inline-flex h-9 items-center rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
            >
              {followUpSaving ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ hasFilters, inline = false }: { hasFilters: boolean; inline?: boolean }) {
  const text = hasFilters
    ? "No leads match your filters."
    : "No enquiries yet. Submissions from the website's \"Send an Enquiry\" form will show up here.";

  if (inline) return <>{text}</>;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E1D8] bg-white p-8 text-center text-[#9CA3AF]">
      <Megaphone className="size-6" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
