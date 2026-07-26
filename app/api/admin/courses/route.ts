import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const facultyId = req.nextUrl.searchParams.get("facultyId");

  const where: Record<string, unknown> = {};
  if (categoryId) where.admissionCategoryId = BigInt(categoryId);
  if (facultyId) where.facultyId = BigInt(facultyId);

  const courses = await prisma.course.findMany({
    where,
    include: { admissionCategory: true, courseType: true, faculty: true },
    orderBy: { courseName: "asc" },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id.toString(),
      courseName: c.courseName,
      eligibility: c.eligibility,
      duration: c.duration,
      semesters: c.semesters,
      universityFee: c.universityFee ? c.universityFee.toString() : null,
      totalAdminFee: c.totalAdminFee ? c.totalAdminFee.toString() : null,
      status: c.status,
      admissionCategoryId: c.admissionCategoryId.toString(),
      admissionCategoryName: c.admissionCategory.categoryName,
      courseTypeId: c.courseTypeId?.toString() ?? null,
      courseTypeName: c.courseType?.name ?? null,
      facultyId: c.facultyId?.toString() ?? null,
      facultyName: c.faculty?.name ?? null,
      description: c.description,
      overview: c.overview,
      requiredDocuments: Array.isArray(c.requiredDocuments) ? c.requiredDocuments : [],
      careerOpportunities: Array.isArray(c.careerOpportunities) ? c.careerOpportunities : [],
      faqs: Array.isArray(c.faqs) ? c.faqs : [],
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_COURSES)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";
  const admissionCategoryId = body.admissionCategoryId;
  if (!courseName || !admissionCategoryId) {
    return NextResponse.json(
      { error: "courseName and admissionCategoryId are required" },
      { status: 400 }
    );
  }

  const created = await prisma.course.create({
    data: {
      courseName,
      admissionCategoryId: BigInt(admissionCategoryId),
      courseTypeId: body.courseTypeId ? BigInt(body.courseTypeId) : null,
      facultyId: body.facultyId ? BigInt(body.facultyId) : null,
      eligibility: body.eligibility || null,
      duration: body.duration || null,
      semesters: body.semesters ? Number(body.semesters) : null,
      universityFee: body.universityFee ? String(body.universityFee) : null,
      totalAdminFee: body.totalAdminFee ? String(body.totalAdminFee) : null,
      description: body.description || null,
      overview: body.overview || null,
      requiredDocuments: Array.isArray(body.requiredDocuments) ? body.requiredDocuments : undefined,
      careerOpportunities: Array.isArray(body.careerOpportunities) ? body.careerOpportunities : undefined,
      faqs: Array.isArray(body.faqs) ? body.faqs : undefined,
    },
  });

  return NextResponse.json(
    {
      id: created.id.toString(),
      courseName: created.courseName,
      eligibility: created.eligibility,
      duration: created.duration,
      semesters: created.semesters,
      universityFee: created.universityFee ? created.universityFee.toString() : null,
      totalAdminFee: created.totalAdminFee ? created.totalAdminFee.toString() : null,
      status: created.status,
      admissionCategoryId: created.admissionCategoryId.toString(),
      courseTypeId: created.courseTypeId?.toString() ?? null,
      facultyId: created.facultyId?.toString() ?? null,
      description: created.description,
      overview: created.overview,
      requiredDocuments: Array.isArray(created.requiredDocuments) ? created.requiredDocuments : [],
      careerOpportunities: Array.isArray(created.careerOpportunities) ? created.careerOpportunities : [],
      faqs: Array.isArray(created.faqs) ? created.faqs : [],
    },
    { status: 201 }
  );
}
