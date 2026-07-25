"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Inbox, AlertCircle, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Badge,
  Card,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
  controlClass,
  selectClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type SessionItem = {
  id: string;
  session: string;
  sessionType: string;
  isActive: boolean;
};

const SESSION_TYPES = ["Annual", "January", "July"];

export default function SessionsPage() {
  const [items, setItems] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState("");
  const [newSessionType, setNewSessionType] = useState("Annual");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SessionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/sessions");
    if (res?.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const session = newSession.trim();
    if (!session) return;

    const res = await apiFetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, sessionType: newSessionType }),
    });

    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to create");
      return;
    }

    setNewSession("");
    load();
  }

  async function handleSetActive(id: string) {
    const res = await apiFetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (!res) return;
    load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/sessions/${pendingDelete.id}`, { method: "DELETE" });

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
      <Card className="mb-5 p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-40 sm:flex-none">
            <label className="text-xs font-medium text-[#374151]">Session Year</label>
            <input
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              placeholder="e.g. 2028"
              className={controlClass}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-40 sm:flex-none">
            <label className="text-xs font-medium text-[#374151]">Intake Type</label>
            <select
              className={selectClass}
              value={newSessionType}
              onChange={(e) => setNewSessionType(e.target.value)}
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!newSession.trim()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Add Session
          </button>
        </form>

        <p className="mt-3 text-xs text-[#9CA3AF]">
          <span className="font-medium text-[#6B7280]">Annual</span> is used by the Regular category
          (one intake per year). <span className="font-medium text-[#6B7280]">January</span> and{" "}
          <span className="font-medium text-[#6B7280]">July</span> are the two yearly intakes used by
          Online and ODL. Each intake type has its own active session.
        </p>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </Card>

      <TableWrap>
        <thead>
          <tr>
            <Th>Session</Th>
            <Th>Intake Type</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-44 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={4}>Loading…</TableEmpty>}
          {!loading && items.length === 0 && (
            <TableEmpty colSpan={4} icon={<Inbox className="size-6" />}>
              No sessions yet. Add the first one above.
            </TableEmpty>
          )}
          {!loading &&
            items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-[#1A1A1A]">{item.session}</Td>
                <Td className="text-[#6B7280]">{item.sessionType}</Td>
                <Td>
                  {item.isActive ? (
                    <Badge tone="success">
                      <CheckCircle2 className="mr-1 size-3" />
                      active
                    </Badge>
                  ) : (
                    <Badge tone="neutral">inactive</Badge>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    {!item.isActive && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(item.id)}
                        className="rounded-lg border border-[#E5E1D8] px-2.5 py-1 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#C5A059] hover:text-[#1A1A1A]"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(item);
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={
          pendingDelete
            ? `Delete session ${pendingDelete.session} - ${pendingDelete.sessionType}?`
            : "Delete session?"
        }
        description="This cannot be undone. If any admission already uses this session, the delete will be blocked."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
