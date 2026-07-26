import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * Course data shown on the public marketing site — sourced live from the
 * admin panel's Course Names catalog instead of hardcoded content, so
 * whatever Super Admin manages under Admin > Course Names is what visitors
 * see on the homepage and /courses page.
 */
export type CourseFaq = { question: string; answer: string };

export type PublicCourse = {
  id: string;
  courseName: string;
  /** "Regular" | "Online" | "ODL" */
  categoryName: string;
  duration: string | null;
  eligibility: string | null;
  facultyName: string | null;
  courseTypeName: string | null;
  /** Unique per course across the whole catalog — see getPublicCourses(). */
  slug: string;
  description: string | null;
  overview: string | null;
  requiredDocuments: string[];
  careerOpportunities: string[];
  faqs: CourseFaq[];
};

/** Parses a JSON column that should hold string[] — tolerates null/malformed data. */
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/** Parses a JSON column that should hold CourseFaq[] — tolerates null/malformed data. */
function asFaqArray(value: unknown): CourseFaq[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is CourseFaq =>
      typeof v === "object" && v !== null && typeof v.question === "string" && typeof v.answer === "string"
  );
}

export async function getPublicCourses(): Promise<PublicCourse[]> {
  const courses = await prisma.course.findMany({
    // ODL is not shown on the public site — only Regular (on-campus) and
    // Online (marketed as "Distance Courses") are visitor-facing.
    where: { status: "active", admissionCategory: { categoryName: { in: ["Regular", "Online"] } } },
    include: { admissionCategory: true, faculty: true, courseType: true },
    orderBy: [{ admissionCategoryId: "asc" }, { courseName: "asc" }],
  });

  // Slugs are derived from the course name, disambiguated by category since
  // the same course (e.g. "Bachelor of Arts (BA)") can legitimately exist
  // under both Online and ODL — those must not collapse into one slug.
  const usedSlugs = new Map<string, number>();
  const withSlug = (courseName: string, categoryName: string) => {
    const base =
      categoryName === "Regular" ? slugify(courseName) : `${slugify(courseName)}-${slugify(categoryName)}`;
    const count = usedSlugs.get(base) ?? 0;
    usedSlugs.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  return courses.map((c) => ({
    id: c.id.toString(),
    courseName: c.courseName,
    categoryName: c.admissionCategory.categoryName,
    duration: c.duration,
    eligibility: c.eligibility,
    facultyName: c.faculty?.name ?? null,
    courseTypeName: c.courseType?.name ?? null,
    slug: withSlug(c.courseName, c.admissionCategory.categoryName),
    description: c.description,
    overview: c.overview,
    requiredDocuments: asStringArray(c.requiredDocuments),
    careerOpportunities: asStringArray(c.careerOpportunities),
    faqs: asFaqArray(c.faqs),
  }));
}

/** Category accent color used on course cards and badges across the public site. */
export function categoryAccent(categoryName: string): string {
  if (categoryName === "Regular") return "#013220";
  if (categoryName === "Online") return "#C5A059";
  return "#6B7280"; // ODL
}

/** Look up a single course by its generated slug — used by the course detail page. */
export async function getPublicCourseBySlug(slug: string): Promise<PublicCourse | null> {
  const all = await getPublicCourses();
  return all.find((c) => c.slug === slug) ?? null;
}

/**
 * Finds the live course that best matches a blog post's `relatedCourse` hint
 * (a plain-text fragment like "BCA" or "B.Ed"). Case-insensitive substring
 * match against courseName, preferring an exact match if one exists.
 */
export async function findRelatedCourse(hint: string): Promise<PublicCourse | null> {
  const all = await getPublicCourses();
  const needle = hint.trim().toLowerCase();
  const exact = all.find((c) => c.courseName.toLowerCase() === needle);
  if (exact) return exact;
  return all.find((c) => c.courseName.toLowerCase().includes(needle)) ?? null;
}

/**
 * Display label for a course — plain course name, no category tag. The
 * enquiry form's dropdown and course cards just list the name; the delivery
 * mode (Regular/Online) is shown separately via section headings, not baked
 * into the option text.
 */
export function courseOptionLabel(course: Pick<PublicCourse, "courseName" | "categoryName">) {
  return course.courseName;
}

/**
 * Splits the catalog the way the public site presents it:
 * - "Regular" category → on-campus courses.
 * - "Online" category → shown to visitors as "Distance Courses".
 * (ODL is excluded from the public site entirely — see getPublicCourses().)
 */
export function splitByDeliveryMode(courses: PublicCourse[]) {
  const regular = courses.filter((c) => c.categoryName === "Regular");
  const distance = courses.filter((c) => c.categoryName === "Online");
  return { regular, distance };
}
