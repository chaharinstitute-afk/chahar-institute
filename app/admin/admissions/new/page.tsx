"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Monitor, Radio, School } from "lucide-react";
import {
  Card,
  Field,
  FormSection,
  PageHeader,
  controlClass,
  selectClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };
type CategoryOption = { id: string; categoryName: string };
type CourseOption = {
  id: string;
  courseName: string;
  admissionCategoryId: string;
  courseTypeId: string | null;
  facultyId: string | null;
};
type StreamOption = { id: string; name: string; facultyId: string | null };
type SessionOption = { id: string; session: string; sessionType: string; isActive: boolean };

const ADMISSION_TYPES = ["Fresh", "Lateral"];
const EMPLOYMENT_STATUS_OPTIONS = ["Employed", "Unemployed", "Self-Employed", "Student"];
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// Regular runs a single yearly intake. Online/ODL run two intakes per year.
function sessionTypesForCategory(categoryName: string | undefined): string[] {
  if (!categoryName) return [];
  return categoryName === "Regular" ? ["Annual"] : ["January", "July"];
}

const CATEGORY_META: Record<string, { icon: typeof School; blurb: string }> = {
  Regular: { icon: School, blurb: "On-campus programs, one intake a year" },
  Online: { icon: Monitor, blurb: "Fully online, Jan & July intakes" },
  ODL: { icon: Radio, blurb: "Open & distance learning, Jan & July intakes" },
};

const emptyForm = {
  // Basic Details
  fullName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "",
  casteCategoryId: "",
  employmentStatus: "",
  maritalStatus: "",
  religionId: "",
  aadhaar: "",
  countryId: "",
  abcId: "",
  debId: "",
  // Personal Details
  address: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  email: "",
  alternateEmail: "",
  mobile: "",
  alternateMobile: "",
  // Applying For
  admissionCategoryId: "",
  admissionSessionId: "",
  admissionType: "",
  facultyId: "",
  courseTypeId: "",
  courseId: "",
  streamId: "",
  semester: "",
};

export default function NewAdmissionPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseTypes, setCourseTypes] = useState<Option[]>([]);
  const [faculties, setFaculties] = useState<Option[]>([]);
  const [allStreams, setAllStreams] = useState<StreamOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [religions, setReligions] = useState<Option[]>([]);
  const [casteCategories, setCasteCategories] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [catRes, courseRes, courseTypeRes, facultyRes, streamRes, religionRes, casteRes, countryRes] =
        await Promise.all([
          apiFetch("/api/admin/admission-categories"),
          apiFetch("/api/admin/courses"),
          apiFetch("/api/admin/masters/course-types"),
          apiFetch("/api/admin/masters/faculties"),
          apiFetch("/api/admin/streams"),
          apiFetch("/api/admin/masters/religions"),
          apiFetch("/api/admin/masters/caste-categories"),
          apiFetch("/api/admin/countries"),
        ]);
      if (catRes?.ok) setCategories(await catRes.json());
      if (courseRes?.ok) setCourses(await courseRes.json());
      if (courseTypeRes?.ok) setCourseTypes(await courseTypeRes.json());
      if (facultyRes?.ok) setFaculties(await facultyRes.json());
      if (streamRes?.ok) setAllStreams(await streamRes.json());
      if (religionRes?.ok) setReligions(await religionRes.json());
      if (casteRes?.ok) setCasteCategories(await casteRes.json());
      if (countryRes?.ok) setCountries(await countryRes.json());
    })();
  }, []);

  const selectedCategory = categories.find((c) => c.id === form.admissionCategoryId);

  // Sessions depend on the category: Regular = single "Annual" intake per year,
  // Online/ODL = "January"/"July" intakes per year. Re-fetched whenever category changes.
  useEffect(() => {
    if (!selectedCategory) {
      setSessions([]);
      return;
    }
    const types = sessionTypesForCategory(selectedCategory.categoryName);
    (async () => {
      const res = await apiFetch(`/api/admin/sessions?sessionType=${types.join(",")}`);
      if (res?.ok) {
        const s: SessionOption[] = await res.json();
        setSessions(s);
        const active = s.find((x) => x.isActive);
        setForm((f) => ({ ...f, admissionSessionId: active ? active.id : "" }));
      }
    })();
  }, [selectedCategory]);

  // Category is a hard filter. Faculty and course type only narrow the list when
  // the course actually has that value set — courses left unassigned in Masters
  // stay selectable instead of silently disappearing from the dropdown.
  const filteredCourses = courses.filter((c) => {
    if (form.admissionCategoryId && c.admissionCategoryId !== form.admissionCategoryId) return false;
    if (form.facultyId && c.facultyId && c.facultyId !== form.facultyId) return false;
    if (form.courseTypeId && c.courseTypeId && c.courseTypeId !== form.courseTypeId) return false;
    return true;
  });

  // Same rule for streams: a stream with no faculty assigned stays available.
  const filteredStreams = form.facultyId
    ? allStreams.filter((s) => !s.facultyId || s.facultyId === form.facultyId)
    : allStreams;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !form.fullName.trim() ||
      !form.mobile.trim() ||
      !form.admissionCategoryId ||
      !form.courseId ||
      !form.admissionSessionId
    ) {
      setError("Please fill in name, mobile, category, course, and session.");
      return;
    }

    setSubmitting(true);
    const res = await apiFetch("/api/admin/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);

    // apiFetch returns null when the session expired and it already redirected to login.
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to create admission");
      return;
    }

    const data = await res.json();
    setSuccess(`Admission created: ${data.admissionNo}. Redirecting to upload documents…`);
    setTimeout(() => router.push(`/admin/admissions/${data.id}`), 1000);
  }

  return (
    <div className="w-full">
      <PageHeader title="New Admission" subtitle="Capture student details and create an admission record" />

      {/* Step 1 — pick the admission category first. Nothing else renders until this is chosen. */}
      <Card className="mb-5">
        <FormSection title="Select Admission Category">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {categories.map((c) => {
              const isSelected = form.admissionCategoryId === c.id;
              const meta = CATEGORY_META[c.categoryName];
              const Icon = meta?.icon ?? School;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      admissionCategoryId: c.id,
                      facultyId: "",
                      courseTypeId: "",
                      courseId: "",
                      streamId: "",
                    })
                  }
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-[#C5A059] bg-[#FDFBF7] ring-2 ring-[#C5A059]/25"
                      : "border-[#E5E1D8] hover:border-[#C5A059] hover:bg-[#FDFBF7]/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isSelected ? "bg-[#013220]" : "bg-[#F3F4F6]"
                      )}
                    >
                      <Icon className={cn("size-4", isSelected ? "text-[#C5A059]" : "text-[#6B7280]")} />
                    </span>
                    {isSelected && <CheckCircle2 className="size-4 shrink-0 text-[#C5A059]" />}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#1A1A1A]">{c.categoryName}</div>
                  {meta && <div className="mt-0.5 text-xs text-[#9CA3AF]">{meta.blurb}</div>}
                </button>
              );
            })}
          </div>
        </FormSection>
      </Card>

      {!selectedCategory && (
        <p className="flex items-center gap-1.5 text-sm text-[#9CA3AF]">
          <AlertCircle className="size-4" />
          Select a category above to continue with the admission form.
        </p>
      )}

      {selectedCategory && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* ── Applying For ─────────────────────────────────────────── */}
          <Card>
            <FormSection
              title="Applying For"
              actions={
                <button
                  type="button"
                  onClick={() => setForm({ ...emptyForm, admissionCategoryId: "" })}
                  className="text-xs font-medium text-[#C5A059] hover:underline"
                >
                  Change category ({selectedCategory.categoryName})
                </button>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Admission Session" required>
                  <select
                    className={selectClass}
                    value={form.admissionSessionId}
                    onChange={(e) => setForm({ ...form, admissionSessionId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.session} - {s.sessionType} {s.isActive ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Admission Type">
                  <select
                    className={selectClass}
                    value={form.admissionType}
                    onChange={(e) => setForm({ ...form, admissionType: e.target.value })}
                  >
                    <option value="">Select</option>
                    {ADMISSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Faculty Name" hint="Narrows course & stream options">
                  <select
                    className={selectClass}
                    value={form.facultyId}
                    onChange={(e) =>
                      setForm({ ...form, facultyId: e.target.value, courseId: "", streamId: "" })
                    }
                  >
                    <option value="">Select</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Course Type">
                  <select
                    className={selectClass}
                    value={form.courseTypeId}
                    onChange={(e) => setForm({ ...form, courseTypeId: e.target.value, courseId: "" })}
                  >
                    <option value="">Select</option>
                    {courseTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Course Name"
                  required
                  hint={
                    filteredCourses.length === 0
                      ? "No courses match — add one under Courses, or clear the faculty/type filter"
                      : undefined
                  }
                >
                  <select
                    className={selectClass}
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Stream Name" required>
                  <select
                    className={selectClass}
                    value={form.streamId}
                    onChange={(e) => setForm({ ...form, streamId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {filteredStreams.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Admission Semester">
                  <input
                    className={controlClass}
                    type="number"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* ── Basic Details ────────────────────────────────────────── */}
          <Card>
            <FormSection title="Basic Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Full Name" required>
                  <input
                    className={controlClass}
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </Field>
                <Field label="Father Name">
                  <input
                    className={controlClass}
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  />
                </Field>
                <Field label="Mother Name">
                  <input
                    className={controlClass}
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                  />
                </Field>

                <Field label="DOB">
                  <input
                    className={controlClass}
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    className={selectClass}
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Category">
                  <select
                    className={selectClass}
                    value={form.casteCategoryId}
                    onChange={(e) => setForm({ ...form, casteCategoryId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {casteCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Employment Status">
                  <select
                    className={selectClass}
                    value={form.employmentStatus}
                    onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                  >
                    <option value="">Select</option>
                    {EMPLOYMENT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Marital Status">
                  <select
                    className={selectClass}
                    value={form.maritalStatus}
                    onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                  >
                    <option value="">Select</option>
                    {MARITAL_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Religion">
                  <select
                    className={selectClass}
                    value={form.religionId}
                    onChange={(e) => setForm({ ...form, religionId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {religions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Aadhar">
                  <input
                    className={controlClass}
                    value={form.aadhaar}
                    onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
                  />
                </Field>
                <Field label="Country">
                  <select
                    className={selectClass}
                    value={form.countryId}
                    onChange={(e) => setForm({ ...form, countryId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ABC ID">
                  <input
                    className={controlClass}
                    value={form.abcId}
                    onChange={(e) => setForm({ ...form, abcId: e.target.value })}
                  />
                </Field>

                <Field label="DEB ID">
                  <input
                    className={controlClass}
                    value={form.debId}
                    onChange={(e) => setForm({ ...form, debId: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* ── Personal Details ─────────────────────────────────────── */}
          <Card>
            <FormSection title="Personal Details">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Address">
                    <input
                      className={controlClass}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      className={controlClass}
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="City">
                    <input
                      className={controlClass}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </Field>
                  <Field label="District">
                    <input
                      className={controlClass}
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className={controlClass}
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email">
                    <input
                      className={controlClass}
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Alternate Email">
                    <input
                      className={controlClass}
                      type="email"
                      value={form.alternateEmail}
                      onChange={(e) => setForm({ ...form, alternateEmail: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Mobile" required>
                    <input
                      className={controlClass}
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    />
                  </Field>
                  <Field label="Alternate Mobile">
                    <input
                      className={controlClass}
                      value={form.alternateMobile}
                      onChange={(e) => setForm({ ...form, alternateMobile: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>
          </Card>

          {/* ── Submit bar ───────────────────────────────────────────── */}
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              {error && (
                <p className="flex items-center gap-1.5 text-sm text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </p>
              )}
              {success && (
                <p className="flex items-center gap-1.5 text-sm text-green-700">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {success}
                </p>
              )}
              {!error && !success && (
                <p className="text-xs text-[#9CA3AF]">
                  Documents are uploaded on the next screen after saving.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save & Continue to Documents"}
            </button>
          </Card>
        </form>
      )}
    </div>
  );
}
