"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Inbox, AlertCircle, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { MastersTabs } from "@/components/admin/masters-tabs";
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
  selectClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type Faq = { question: string; answer: string };

type Course = {
  id: string;
  courseName: string;
  eligibility: string | null;
  duration: string | null;
  semesters: number | null;
  yearlyFee: string | null;
  status: "active" | "inactive";
  admissionCategoryId: string;
  admissionCategoryName: string;
  courseTypeId: string | null;
  courseTypeName: string | null;
  facultyId: string | null;
  facultyName: string | null;
  description: string | null;
  overview: string | null;
  requiredDocuments: string[];
  careerOpportunities: string[];
  faqs: Faq[];
};

type Option = { id: string; name: string };
type CategoryOption = { id: string; categoryName: string };

const emptyForm = {
  courseName: "",
  admissionCategoryId: "",
  courseTypeId: "",
  facultyId: "",
  eligibility: "",
  duration: "",
  semesters: "",
  yearlyFee: "",
  description: "",
  overview: "",
  requiredDocuments: [] as string[],
  careerOpportunities: [] as string[],
  faqs: [] as Faq[],
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [courseTypes, setCourseTypes] = useState<Option[]>([]);
  const [faculties, setFaculties] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState("");
  const [newCareer, setNewCareer] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCourses = useCallback(async (categoryId?: string) => {
    setLoading(true);
    const url = categoryId
      ? `/api/admin/courses?categoryId=${categoryId}`
      : "/api/admin/courses";
    const res = await apiFetch(url);
    if (res?.ok) setCourses(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const [catRes, typeRes, facultyRes] = await Promise.all([
        apiFetch("/api/admin/admission-categories"),
        apiFetch("/api/admin/masters/course-types"),
        apiFetch("/api/admin/masters/faculties"),
      ]);
      if (catRes?.ok) setCategories(await catRes.json());
      if (typeRes?.ok) setCourseTypes(await typeRes.json());
      if (facultyRes?.ok) setFaculties(await facultyRes.json());
    })();
    loadCourses();
  }, [loadCourses]);

  function handleFilterChange(categoryId: string) {
    setFilterCategoryId(categoryId);
    loadCourses(categoryId || undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.courseName.trim() || !form.admissionCategoryId) {
      setError("Course name and category are required.");
      return;
    }

    const payload = {
      courseName: form.courseName.trim(),
      admissionCategoryId: form.admissionCategoryId,
      courseTypeId: form.courseTypeId || null,
      facultyId: form.facultyId || null,
      eligibility: form.eligibility || null,
      duration: form.duration || null,
      semesters: form.semesters || null,
      yearlyFee: form.yearlyFee || null,
      description: form.description || null,
      overview: form.overview || null,
      requiredDocuments: form.requiredDocuments,
      careerOpportunities: form.careerOpportunities,
      faqs: form.faqs,
    };

    const url = editingId ? `/api/admin/courses/${editingId}` : "/api/admin/courses";
    const method = editingId ? "PATCH" : "POST";

    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save course");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setNewDocument("");
    setNewCareer("");
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    loadCourses(filterCategoryId || undefined);
  }

  function handleEdit(course: Course) {
    setEditingId(course.id);
    setError(null);
    setForm({
      courseName: course.courseName,
      admissionCategoryId: course.admissionCategoryId,
      courseTypeId: course.courseTypeId || "",
      facultyId: course.facultyId || "",
      eligibility: course.eligibility || "",
      duration: course.duration || "",
      semesters: course.semesters?.toString() || "",
      yearlyFee: course.yearlyFee || "",
      description: course.description || "",
      overview: course.overview || "",
      requiredDocuments: course.requiredDocuments || [],
      careerOpportunities: course.careerOpportunities || [],
      faqs: course.faqs || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addDocument() {
    const value = newDocument.trim();
    if (!value) return;
    setForm((f) => ({ ...f, requiredDocuments: [...f.requiredDocuments, value] }));
    setNewDocument("");
  }

  function removeDocument(index: number) {
    setForm((f) => ({ ...f, requiredDocuments: f.requiredDocuments.filter((_, i) => i !== index) }));
  }

  function addCareer() {
    const value = newCareer.trim();
    if (!value) return;
    setForm((f) => ({ ...f, careerOpportunities: [...f.careerOpportunities, value] }));
    setNewCareer("");
  }

  function removeCareer(index: number) {
    setForm((f) => ({ ...f, careerOpportunities: f.careerOpportunities.filter((_, i) => i !== index) }));
  }

  function addFaq() {
    const question = newFaqQuestion.trim();
    const answer = newFaqAnswer.trim();
    if (!question || !answer) return;
    setForm((f) => ({ ...f, faqs: [...f.faqs, { question, answer }] }));
    setNewFaqQuestion("");
    setNewFaqAnswer("");
  }

  function removeFaq(index: number) {
    setForm((f) => ({ ...f, faqs: f.faqs.filter((_, i) => i !== index) }));
  }

  async function handleToggleStatus(course: Course) {
    const res = await apiFetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: course.status === "active" ? "inactive" : "active" }),
    });
    if (!res) return;
    loadCourses(filterCategoryId || undefined);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/courses/${pendingDelete.id}`, { method: "DELETE" });

    setDeleting(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error || "Delete failed");
      return;
    }

    setPendingDelete(null);
    loadCourses(filterCategoryId || undefined);
  }

  return (
    <div>
      <PageHeader
        title="Course Names"
        subtitle={loading ? undefined : `${courses.length} course${courses.length === 1 ? "" : "s"}`}
      />
      <MastersTabs />

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormSection
            title={editingId ? "Edit Course" : "Add New Course"}
            actions={
              editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setError(null);
                    setNewDocument("");
                    setNewCareer("");
                    setNewFaqQuestion("");
                    setNewFaqAnswer("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A059] hover:underline"
                >
                  <X className="size-3.5" />
                  Cancel edit
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Course Name" required>
                <input
                  className={controlClass}
                  placeholder="e.g. BCA"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                />
              </Field>

              <Field label="Admission Category" required>
                <select
                  className={selectClass}
                  value={form.admissionCategoryId}
                  onChange={(e) => setForm({ ...form, admissionCategoryId: e.target.value })}
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Course Type">
                <select
                  className={selectClass}
                  value={form.courseTypeId}
                  onChange={(e) => setForm({ ...form, courseTypeId: e.target.value })}
                >
                  <option value="">Select</option>
                  {courseTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Faculty">
                <select
                  className={selectClass}
                  value={form.facultyId}
                  onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                >
                  <option value="">Select</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Eligibility">
                <input
                  className={controlClass}
                  placeholder="e.g. 12th Pass"
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                />
              </Field>
              <Field label="Duration">
                <input
                  className={controlClass}
                  placeholder="e.g. 3 Years"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </Field>
              <Field label="Semesters">
                <input
                  className={controlClass}
                  type="number"
                  value={form.semesters}
                  onChange={(e) => setForm({ ...form, semesters: e.target.value })}
                />
              </Field>
              <Field label="Yearly Fee" hint="Leave blank if configurable">
                <input
                  className={controlClass}
                  placeholder="e.g. 20000"
                  value={form.yearlyFee}
                  onChange={(e) => setForm({ ...form, yearlyFee: e.target.value })}
                />
              </Field>
            </div>

            {/* Public website content — shown on the course detail page */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Short Description" hint="Shown on course cards and the detail page banner">
                <textarea
                  className={`${controlClass} h-auto py-2`}
                  rows={2}
                  placeholder="One-line summary shown on course cards"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
              <Field label="Overview" hint="Longer paragraph shown on the course detail page">
                <textarea
                  className={`${controlClass} h-auto py-2`}
                  rows={2}
                  placeholder="Detailed overview of the course"
                  value={form.overview}
                  onChange={(e) => setForm({ ...form, overview: e.target.value })}
                />
              </Field>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Required Documents */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#374151]">Required Documents</label>
                <div className="mb-2 flex gap-1.5">
                  <input
                    className={controlClass}
                    placeholder="e.g. 12th Marksheet"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDocument();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addDocument}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A1A1A] text-white transition-colors hover:bg-[#013220]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {form.requiredDocuments.map((doc, i) => (
                    <li
                      key={`${doc}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#374151]"
                    >
                      <span className="truncate">{doc}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(i)}
                        className="shrink-0 text-[#9CA3AF] hover:text-red-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career Opportunities */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#374151]">Career Opportunities</label>
                <div className="mb-2 flex gap-1.5">
                  <input
                    className={controlClass}
                    placeholder="e.g. Software Developer"
                    value={newCareer}
                    onChange={(e) => setNewCareer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCareer();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCareer}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A1A1A] text-white transition-colors hover:bg-[#013220]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {form.careerOpportunities.map((career, i) => (
                    <li
                      key={`${career}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#374151]"
                    >
                      <span className="truncate">{career}</span>
                      <button
                        type="button"
                        onClick={() => removeCareer(i)}
                        className="shrink-0 text-[#9CA3AF] hover:text-red-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQs */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#374151]">FAQs</label>
                <div className="mb-2 flex flex-col gap-1.5">
                  <input
                    className={controlClass}
                    placeholder="Question"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                  />
                  <div className="flex gap-1.5">
                    <input
                      className={controlClass}
                      placeholder="Answer"
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFaq();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addFaq}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A1A1A] text-white transition-colors hover:bg-[#013220]"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {form.faqs.map((faq, i) => (
                    <li
                      key={`${faq.question}-${i}`}
                      className="flex items-start justify-between gap-2 rounded-lg bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#374151]"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{faq.question}</div>
                        <div className="truncate text-[#9CA3AF]">{faq.answer}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFaq(i)}
                        className="shrink-0 text-[#9CA3AF] hover:text-red-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
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
                {editingId ? "Save Changes" : <><Plus className="size-4" /> Add Course</>}
              </button>
            </div>
          </FormSection>
        </form>
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#6B7280]">Filter by category</span>
        <select
          className={`${selectClass} w-auto min-w-40`}
          value={filterCategoryId}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.categoryName}
            </option>
          ))}
        </select>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Course</Th>
            <Th className="hidden sm:table-cell">Category</Th>
            <Th className="hidden md:table-cell">Type</Th>
            <Th className="hidden lg:table-cell">Faculty</Th>
            <Th className="hidden lg:table-cell">Eligibility</Th>
            <Th className="hidden md:table-cell">Duration</Th>
            <Th className="hidden sm:table-cell">Yearly Fee</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-28 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading && <TableEmpty colSpan={9}>Loading…</TableEmpty>}
          {!loading && courses.length === 0 && (
            <TableEmpty colSpan={9} icon={<Inbox className="size-6" />}>
              No courses yet. Add the first one above.
            </TableEmpty>
          )}
          {!loading &&
            courses.map((course) => (
              <Tr key={course.id}>
                <Td className="font-medium text-[#1A1A1A]">{course.courseName}</Td>
                <Td className="hidden text-[#6B7280] sm:table-cell">{course.admissionCategoryName}</Td>
                <Td className="hidden text-[#6B7280] md:table-cell">{course.courseTypeName || "—"}</Td>
                <Td className="hidden text-[#6B7280] lg:table-cell">{course.facultyName || "—"}</Td>
                <Td className="hidden text-[#6B7280] lg:table-cell">{course.eligibility || "—"}</Td>
                <Td className="hidden whitespace-nowrap text-[#6B7280] md:table-cell">
                  {course.duration || "—"}
                </Td>
                <Td className="hidden whitespace-nowrap text-[#6B7280] sm:table-cell">
                  {course.yearlyFee
                    ? `₹${Number(course.yearlyFee).toLocaleString("en-IN")}`
                    : "Configurable"}
                </Td>
                <Td>
                  <StatusToggle
                    active={course.status === "active"}
                    onClick={() => handleToggleStatus(course)}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => handleEdit(course)}
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
                        setPendingDelete(course);
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
        title={pendingDelete ? `Delete ${pendingDelete.courseName}?` : "Delete course?"}
        description="This cannot be undone. If any admission already uses this course, the delete will be blocked."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
