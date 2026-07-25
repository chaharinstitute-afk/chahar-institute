"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Inbox, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Badge,
  Card,
  Field,
  FormSection,
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

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
  status: "active" | "inactive";
  roleId: string;
  roleName: string;
  lastLoginAt: string | null;
  createdAt: string;
};

type Role = { id: string; roleName: string };

const emptyForm = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  roleId: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/users");
    if (res?.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/admin/roles");
      if (res?.ok) {
        const data: Role[] = await res.json();
        setRoles(data);
        // Default new users to the non-privileged "Admin" role when it exists.
        const adminRole = data.find((r) => r.roleName === "Admin");
        if (adminRole) setForm((f) => ({ ...f, roleId: f.roleId || adminRole.id }));
      }
    })();
    load();
  }, [load]);

  function resetForm() {
    const adminRole = roles.find((r) => r.roleName === "Admin");
    setForm({ ...emptyForm, roleId: adminRole?.id ?? "" });
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!form.fullName.trim() || !form.email.trim() || !form.roleId) {
      setError("Name, email and role are required.");
      return;
    }
    if (!editingId && !form.password) {
      setError("Password is required for a new user.");
      return;
    }

    const payload: Record<string, string> = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      roleId: form.roleId,
    };
    // On edit, only send the password when the admin actually typed a new one.
    if (form.password) payload.password = form.password;

    setSaving(true);
    const res = await apiFetch(
      editingId ? `/api/admin/users/${editingId}` : "/api/admin/users",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);

    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save user");
      return;
    }

    setNotice(editingId ? "User updated." : "User created.");
    resetForm();
    load();
  }

  function handleEdit(user: AdminUser) {
    setEditingId(user.id);
    setError(null);
    setNotice(null);
    setForm({
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile ?? "",
      password: "",
      roleId: user.roleId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggleStatus(user: AdminUser) {
    setError(null);
    const res = await apiFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: user.status === "active" ? "inactive" : "active" }),
    });
    if (!res) return;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not change status");
      return;
    }
    load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/users/${pendingDelete.id}`, { method: "DELETE" });

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
        title="Admin Users"
        subtitle="Create and manage accounts that can access this panel"
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormSection
            title={editingId ? "Edit User" : "Add New User"}
            actions={
              editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A059] hover:underline"
                >
                  <X className="size-3.5" />
                  Cancel edit
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Full Name" required>
                <input
                  className={controlClass}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </Field>
              <Field label="Email" required>
                <input
                  className={controlClass}
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Mobile">
                <input
                  className={controlClass}
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </Field>
              <Field label="Role" required>
                <select
                  className={selectClass}
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                >
                  <option value="">Select</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={editingId ? "New Password" : "Password"}
                required={!editingId}
                hint={
                  editingId
                    ? "Leave blank to keep the current password"
                    : "Minimum 8 characters"
                }
              >
                <input
                  className={controlClass}
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>
            </div>

            {error && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}
            {notice && (
              <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>
            )}

            <div className="mt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
              >
                {saving ? (
                  "Saving…"
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  <>
                    <Plus className="size-4" />
                    Add User
                  </>
                )}
              </button>
            </div>
          </FormSection>
        </form>
      </Card>

      <TableWrap>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th className="hidden sm:table-cell">Email</Th>
            <Th className="hidden md:table-cell">Mobile</Th>
            <Th>Role</Th>
            <Th className="w-32">Status</Th>
            <Th className="hidden lg:table-cell">Last Login</Th>
            <Th className="w-28 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={7}>Loading…</TableEmpty>}
          {!loading && users.length === 0 && (
            <TableEmpty colSpan={7} icon={<Inbox className="size-6" />}>
              No admin users yet.
            </TableEmpty>
          )}
          {!loading &&
            users.map((user) => (
              <Tr key={user.id}>
                <Td className="font-medium text-[#1A1A1A]">
                  {user.fullName}
                  <div className="text-xs text-[#9CA3AF] sm:hidden">{user.email}</div>
                </Td>
                <Td className="hidden text-[#6B7280] sm:table-cell">{user.email}</Td>
                <Td className="hidden whitespace-nowrap text-[#6B7280] md:table-cell">
                  {user.mobile || "—"}
                </Td>
                <Td>
                  <Badge tone={user.roleName === "Super Admin" ? "gold" : "neutral"}>
                    {user.roleName}
                  </Badge>
                </Td>
                <Td>
                  <StatusToggle
                    active={user.status === "active"}
                    onClick={() => handleToggleStatus(user)}
                  />
                </Td>
                <Td className="hidden whitespace-nowrap text-[#6B7280] lg:table-cell">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString("en-IN")
                    : "Never"}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => handleEdit(user)}
                      className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(user);
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

      <p className="mt-3 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
        <Users className="size-3.5" />
        Admins can create and manage their own admissions. Super Admins additionally manage users,
        courses, masters and see every admission.
      </p>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={pendingDelete ? `Delete ${pendingDelete.fullName}?` : "Delete user?"}
        description="This permanently removes the account. If the user has created records, deactivate them instead."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
