"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Inbox, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
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
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type Testimonial = {
  id: string;
  name: string;
  course: string;
  review: string;
  rating: number;
  status: "active" | "inactive";
  sortOrder: number;
};

const emptyForm = {
  name: "",
  course: "",
  review: "",
  rating: "5",
  sortOrder: "0",
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/testimonials");
    if (res?.ok) setTestimonials(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.course.trim() || !form.review.trim()) {
      setError("Name, course and review are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      course: form.course.trim(),
      review: form.review.trim(),
      rating: Number(form.rating),
      sortOrder: Number(form.sortOrder) || 0,
    };

    const url = editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials";
    const method = editingId ? "PATCH" : "POST";

    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save testimonial");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(t: Testimonial) {
    setEditingId(t.id);
    setError(null);
    setForm({
      name: t.name,
      course: t.course,
      review: t.review,
      rating: String(t.rating),
      sortOrder: String(t.sortOrder),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleToggleStatus(t: Testimonial) {
    const res = await apiFetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: t.status === "active" ? "inactive" : "active" }),
    });
    if (!res) return;
    load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/testimonials/${pendingDelete.id}`, { method: "DELETE" });

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
        title="Testimonials"
        subtitle={
          loading
            ? undefined
            : `${testimonials.length} testimonial${testimonials.length === 1 ? "" : "s"} — shown in Student Stories on the homepage`
        }
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormSection
            title={editingId ? "Edit Testimonial" : "Add New Testimonial"}
            actions={
              editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A059] hover:underline"
                >
                  <X className="size-3.5" />
                  Cancel edit
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student Name" required>
                <input
                  className={controlClass}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Course" required>
                <input
                  className={controlClass}
                  placeholder="e.g. B.Ed"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
              </Field>
              <Field label="Rating" required hint="1 to 5 stars">
                <input
                  className={controlClass}
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
              </Field>
              <Field label="Sort Order" hint="Lower shows first">
                <input
                  className={controlClass}
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Review" required>
                <textarea
                  className={`${controlClass} h-auto py-2`}
                  rows={3}
                  placeholder="What the student said about their experience"
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                />
              </Field>
            </div>

            {error && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-5">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
              >
                {editingId ? "Save Changes" : <><Plus className="size-4" /> Add Testimonial</>}
              </button>
            </div>
          </FormSection>
        </form>
      </Card>

      <TableWrap>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th className="hidden sm:table-cell">Course</Th>
            <Th className="hidden lg:table-cell">Review</Th>
            <Th className="w-24">Rating</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-28 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={6}>Loading…</TableEmpty>}
          {!loading && testimonials.length === 0 && (
            <TableEmpty colSpan={6} icon={<Inbox className="size-6" />}>
              No testimonials yet. Add the first one above.
            </TableEmpty>
          )}
          {!loading &&
            testimonials.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium text-[#1A1A1A]">{t.name}</Td>
                <Td className="hidden text-[#6B7280] sm:table-cell">{t.course}</Td>
                <Td className="hidden max-w-sm truncate text-[#6B7280] lg:table-cell">{t.review}</Td>
                <Td>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5"
                        style={{ color: i < t.rating ? "#C5A059" : "#E5E1D8" }}
                        fill={i < t.rating ? "#C5A059" : "none"}
                      />
                    ))}
                  </div>
                </Td>
                <Td>
                  <StatusToggle
                    active={t.status === "active"}
                    onClick={() => handleToggleStatus(t)}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => handleEdit(t)}
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
                        setPendingDelete(t);
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
        title={pendingDelete ? `Delete testimonial from ${pendingDelete.name}?` : "Delete testimonial?"}
        description="This cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
