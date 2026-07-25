import { NextResponse } from "next/server";
import { getPublicCourses, courseOptionLabel } from "@/lib/public-courses";

/**
 * Public, unauthenticated endpoint — powers the "Interested Course" dropdown
 * on the marketing site's enquiry form and the /courses listing page.
 * Mirrors the admin's active Course Names catalog.
 */
export async function GET() {
  const courses = await getPublicCourses();

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      courseName: c.courseName,
      categoryName: c.categoryName,
      label: courseOptionLabel(c),
    }))
  );
}
