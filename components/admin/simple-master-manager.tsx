"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Inbox, AlertCircle, Check, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Card,
  StatusToggle,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
  controlClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type MasterItem = {
  id: string;
  name: string;
  status: "active" | "inactive";
};

export function SimpleMasterManager({
  masterKey,
  label,
}: {
  masterKey: string;
  label: string;
}) {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MasterItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const singular = label.replace(/ies$/, "y").replace(/s$/, "");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch(`/api/admin/masters/${masterKey}`);
    if (res?.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  }, [masterKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = newName.trim();
    if (!name) return;

    const res = await apiFetch(`/api/admin/masters/${masterKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to create");
      return;
    }

    setNewName("");
    load();
  }

  async function handleToggleStatus(item: MasterItem) {
    const nextStatus = item.status === "active" ? "inactive" : "active";
    const res = await apiFetch(`/api/admin/masters/${masterKey}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res) return;
    load();
  }

  async function handleSaveEdit(id: string) {
    const name = editingName.trim();
    if (!name) return;
    const res = await apiFetch(`/api/admin/masters/${masterKey}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res) return;
    setEditingId(null);
    load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/masters/${masterKey}/${pendingDelete.id}`, {
      method: "DELETE",
    });

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

  function openDeleteDialog(item: MasterItem) {
    setDeleteError(null);
    setPendingDelete(item);
  }

  return (
    <div>
      <Card className="mb-5 p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-56">
            <label className="text-xs font-medium text-[#374151]">Add {singular}</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`e.g. new ${singular.toLowerCase()} name`}
              className={controlClass}
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Add
          </button>
        </form>
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
            <Th>{label}</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-32 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <TableEmpty colSpan={3}>Loading…</TableEmpty>
          )}
          {!loading && items.length === 0 && (
            <TableEmpty colSpan={3} icon={<Inbox className="size-6" />}>
              No {label.toLowerCase()} yet. Add the first one above.
            </TableEmpty>
          )}
          {!loading &&
            items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-[#1A1A1A]">
                  {editingId === item.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className={`${controlClass} max-w-xs`}
                    />
                  ) : (
                    item.name
                  )}
                </Td>
                <Td>
                  <StatusToggle
                    active={item.status === "active"}
                    onClick={() => handleToggleStatus(item)}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    {editingId === item.id ? (
                      <>
                        <IconButton
                          label="Save"
                          onClick={() => handleSaveEdit(item.id)}
                          tone="confirm"
                        >
                          <Check className="size-4" />
                        </IconButton>
                        <IconButton label="Cancel" onClick={() => setEditingId(null)}>
                          <X className="size-4" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          label="Edit"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditingName(item.name);
                          }}
                        >
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Delete"
                          tone="danger"
                          onClick={() => openDeleteDialog(item)}
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </>
                    )}
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
        title={`Delete ${pendingDelete?.name ?? ""}?`}
        description="This cannot be undone. If any record already references it, the delete will be blocked."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  tone = "neutral",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "confirm";
}) {
  const tones = {
    neutral: "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]",
    danger: "text-[#9CA3AF] hover:bg-red-50 hover:text-red-600",
    confirm: "text-green-700 hover:bg-green-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex size-8 items-center justify-center rounded-lg transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
