"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Mail, MapPin, Phone, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Badge,
  BadgeTone,
  Card,
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

type PartnerLead = {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  city: string | null;
  message: string | null;
  status: LeadStatus;
  remarks: string | null;
  createdAt: string;
};

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

export default function BusinessPartnersPage() {
  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PartnerLead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/business-partners");
    if (res?.ok) setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.fullName, l.mobile, l.email ?? "", l.city ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [leads, statusFilter, query]);

  async function handleStatusChange(lead: PartnerLead, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    const res = await apiFetch(`/api/admin/business-partners/${lead.id}`, {
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

    const res = await apiFetch(`/api/admin/business-partners/${pendingDelete.id}`, { method: "DELETE" });

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
        title="Business Partners"
        subtitle={
          loading
            ? undefined
            : `${leads.length} enquir${leads.length === 1 ? "y" : "ies"} from the "Become a Business Partner" form`
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 w-full flex-1 sm:min-w-64 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, mobile, email, city…"
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

      {/* Below md: cards. */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6 text-center text-sm text-[#9CA3AF]">
            Loading…
          </div>
        )}
        {!loading && visible.length === 0 && <EmptyState hasFilters={!!(query || statusFilter)} />}
        {!loading &&
          visible.map((l) => (
            <Card key={l.id} padded={false} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-[#1A1A1A]">{l.fullName}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <Phone className="size-3" />
                    {l.mobile}
                  </div>
                  {l.email && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <Mail className="size-3" />
                      {l.email}
                    </div>
                  )}
                  {l.city && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <MapPin className="size-3" />
                      {l.city}
                    </div>
                  )}
                </div>
                <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
              </div>

              {l.message && <p className="mt-2 text-xs text-[#374151] line-clamp-2">{l.message}</p>}

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
          ))}
      </div>

      {/* md and up: full table. */}
      <div className="hidden md:block">
        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th className="hidden lg:table-cell">City</Th>
              <Th className="hidden lg:table-cell">Message</Th>
              <Th className="hidden sm:table-cell">Date</Th>
              <Th className="w-40">Status</Th>
              <Th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {loading && <TableEmpty colSpan={7}>Loading…</TableEmpty>}
            {!loading && visible.length === 0 && (
              <TableEmpty colSpan={7} icon={<Briefcase className="size-6" />}>
                <EmptyState hasFilters={!!(query || statusFilter)} inline />
              </TableEmpty>
            )}
            {!loading &&
              visible.map((l) => (
                <Tr key={l.id}>
                  <Td className="font-medium text-[#1A1A1A]">{l.fullName}</Td>
                  <Td>
                    <div className="text-[#374151]">{l.mobile}</div>
                    {l.email && <div className="text-xs text-[#9CA3AF]">{l.email}</div>}
                  </Td>
                  <Td className="hidden text-[#6B7280] lg:table-cell">{l.city || "—"}</Td>
                  <Td className="hidden max-w-xs truncate text-[#6B7280] lg:table-cell">
                    {l.message || "—"}
                  </Td>
                  <Td className="hidden whitespace-nowrap text-[#6B7280] sm:table-cell">
                    {new Date(l.createdAt).toLocaleDateString("en-IN")}
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
              ))}
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
    </div>
  );
}

function EmptyState({ hasFilters, inline = false }: { hasFilters: boolean; inline?: boolean }) {
  const text = hasFilters
    ? "No enquiries match your filters."
    : "No business partner enquiries yet. Submissions from the website's \"Become a Business Partner\" form will show up here.";

  if (inline) return <>{text}</>;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E1D8] bg-white p-8 text-center text-[#9CA3AF]">
      <Briefcase className="size-6" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
