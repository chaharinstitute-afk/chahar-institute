import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

async function requireManageCourses() {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_COURSES)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { error: null };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageCourses();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.courseName === "string" && body.courseName.trim()) data.courseName = body.courseName.trim();
  if (body.admissionCategoryId) data.admissionCategoryId = BigInt(body.admissionCategoryId);
  if (body.courseTypeId !== undefined) data.courseTypeId = body.courseTypeId ? BigInt(body.courseTypeId) : null;
  if (body.facultyId !== undefined) data.facultyId = body.facultyId ? BigInt(body.facultyId) : null;
  if (body.eligibility !== undefined) data.eligibility = body.eligibility || null;
  if (body.duration !== undefined) data.duration = body.duration || null;
  if (body.semesters !== undefined) data.semesters = body.semesters ? Number(body.semesters) : null;
  if (body.universityFee !== undefined) data.universityFee = body.universityFee ? String(body.universityFee) : null;
  if (body.totalAdminFee !== undefined) data.totalAdminFee = body.totalAdminFee ? String(body.totalAdminFee) : null;
  if (body.status === "active" || body.status === "inactive") data.status = body.status;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.overview !== undefined) data.overview = body.overview || null;
  if (body.requiredDocuments !== undefined) {
    data.requiredDocuments = Array.isArray(body.requiredDocuments) ? body.requiredDocuments : null;
  }
  if (body.careerOpportunities !== undefined) {
    data.careerOpportunities = Array.isArray(body.careerOpportunities) ? body.careerOpportunities : null;
  }
  if (body.faqs !== undefined) {
    data.faqs = Array.isArray(body.faqs) ? body.faqs : null;
  }

  const updated = await prisma.course.update({ where: { id: BigInt(id) }, data });
  return NextResponse.json({
    id: updated.id.toString(),
    courseName: updated.courseName,
    eligibility: updated.eligibility,
    duration: updated.duration,
    semesters: updated.semesters,
    universityFee: updated.universityFee ? updated.universityFee.toString() : null,
    totalAdminFee: updated.totalAdminFee ? updated.totalAdminFee.toString() : null,
    status: updated.status,
    admissionCategoryId: updated.admissionCategoryId.toString(),
    courseTypeId: updated.courseTypeId?.toString() ?? null,
    facultyId: updated.facultyId?.toString() ?? null,
    description: updated.description,
    overview: updated.overview,
    requiredDocuments: Array.isArray(updated.requiredDocuments) ? updated.requiredDocuments : [],
    careerOpportunities: Array.isArray(updated.careerOpportunities) ? updated.careerOpportunities : [],
    faqs: Array.isArray(updated.faqs) ? updated.faqs : [],
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageCourses();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.course.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete — this course is likely referenced by admissions" },
      { status: 409 }
    );
  }
}
