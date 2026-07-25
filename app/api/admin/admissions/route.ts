import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { generateAdmissionNumber, generateStudentCode } from "@/lib/sequences";

/**
 * GET /api/admin/admissions
 * Super Admin (view_all_admissions permission): sees every admission, filterable by createdBy.
 * Admin: only sees admissions they personally created.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const createdByParam = req.nextUrl.searchParams.get("createdBy");
  const statusParam = req.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (canViewAll) {
    if (createdByParam) where.createdBy = BigInt(createdByParam);
  } else {
    // Admins can only ever see their own submissions, regardless of query params.
    where.createdBy = BigInt(userId);
  }

  if (statusParam) where.admissionStatus = statusParam;

  const admissions = await prisma.admission.findMany({
    where,
    include: {
      student: true,
      course: true,
      admissionCategory: true,
      admissionSession: true,
      university: true,
      creator: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    admissions.map((a) => ({
      id: a.id.toString(),
      admissionNo: a.admissionNo,
      admissionStatus: a.admissionStatus,
      paymentStatus: a.paymentStatus,
      registrationFee: a.registrationFee ? a.registrationFee.toString() : null,
      semester: a.semester,
      remarks: a.remarks,
      createdAt: a.createdAt,
      student: {
        id: a.student.id.toString(),
        studentCode: a.student.studentCode,
        fullName: a.student.fullName,
        mobile: a.student.mobile,
        email: a.student.email,
      },
      course: { id: a.course.id.toString(), courseName: a.course.courseName },
      admissionCategory: {
        id: a.admissionCategory.id.toString(),
        categoryName: a.admissionCategory.categoryName,
      },
      admissionSession: {
        id: a.admissionSession.id.toString(),
        session: a.admissionSession.session,
        sessionType: a.admissionSession.sessionType,
      },
      university: a.university ? { id: a.university.id.toString(), universityName: a.university.universityName } : null,
      createdBy: a.creator ? { id: a.creator.id.toString(), fullName: a.creator.fullName, email: a.creator.email } : null,
    }))
  );
}

/**
 * POST /api/admin/admissions
 * Creates a new student (or reuses one by aadhaar/mobile+name match — kept simple: always
 * creates a fresh student for now, matching "one admission form => one student" for MVP)
 * plus the admission itself. Requires create_admission permission (both Super Admin and Admin
 * have this by default).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.CREATE_ADMISSION)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const requiredFields = ["fullName", "mobile", "admissionCategoryId", "courseId", "admissionSessionId"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  // Academic records — expects [{ qualification: "tenth"|"twelfth", boardUniversity, passingYear, percentage, cgpa, rollNo, registrationNo }]
  const academicRecords: Array<Record<string, unknown>> = Array.isArray(body.academicRecords)
    ? body.academicRecords
    : [];

  try {
    const admissionSession = await prisma.admissionSession.findUnique({
      where: { id: BigInt(body.admissionSessionId) },
    });
    if (!admissionSession) {
      return NextResponse.json({ error: "Invalid admission session" }, { status: 400 });
    }

    const studentCode = await generateStudentCode();
    // Label includes intake type (e.g. "2026JAN") for Online/ODL so numbers stay unique
    // and distinguishable per intake; Regular's single "Annual" intake omits the suffix.
    const sessionLabel =
      admissionSession.sessionType === "Annual"
        ? admissionSession.session
        : `${admissionSession.session}${admissionSession.sessionType.slice(0, 3).toUpperCase()}`;
    const admissionNo = await generateAdmissionNumber(admissionSession.id, sessionLabel);

    const created = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentCode,
          fullName: body.fullName,
          fatherName: body.fatherName || null,
          motherName: body.motherName || null,
          dob: body.dob ? new Date(body.dob) : null,
          gender: body.gender || null,
          casteCategoryId: body.casteCategoryId ? BigInt(body.casteCategoryId) : null,
          religionId: body.religionId ? BigInt(body.religionId) : null,
          maritalStatus: body.maritalStatus || null,
          employmentStatus: body.employmentStatus || null,
          aadhaar: body.aadhaar || null,
          abcId: body.abcId || null,
          debId: body.debId || null,
          mobile: body.mobile,
          alternateMobile: body.alternateMobile || null,
          email: body.email || null,
          alternateEmail: body.alternateEmail || null,
          address: body.address || null,
          city: body.city || null,
          district: body.district || null,
          state: body.state || null,
          countryId: body.countryId ? BigInt(body.countryId) : null,
          pincode: body.pincode || null,
          createdBy: BigInt(userId),
        },
      });

      for (const rec of academicRecords) {
        const qualification = rec.qualification;
        if (qualification !== "tenth" && qualification !== "twelfth") continue;
        // Skip fully-empty rows so we don't create junk records when the user left a row blank.
        if (!rec.boardUniversity && !rec.passingYear && !rec.percentage) continue;

        await tx.academicRecord.create({
          data: {
            studentId: student.id,
            qualification,
            boardUniversity: (rec.boardUniversity as string) || null,
            passingYear: rec.passingYear ? Number(rec.passingYear) : null,
            percentage: rec.percentage ? String(rec.percentage) : null,
            cgpa: rec.cgpa ? String(rec.cgpa) : null,
            result: (rec.result as string) || null,
            rollNo: (rec.rollNo as string) || null,
            registrationNo: (rec.registrationNo as string) || null,
          },
        });
      }

      const admission = await tx.admission.create({
        data: {
          admissionNo,
          studentId: student.id,
          universityId: body.universityId ? BigInt(body.universityId) : null,
          admissionCategoryId: BigInt(body.admissionCategoryId),
          courseId: BigInt(body.courseId),
          admissionSessionId: admissionSession.id,
          admissionType: body.admissionType || null,
          facultyId: body.facultyId ? BigInt(body.facultyId) : null,
          streamId: body.streamId ? BigInt(body.streamId) : null,
          semester: body.semester ? Number(body.semester) : null,
          registrationFee: body.registrationFee ? String(body.registrationFee) : null,
          remarks: body.remarks || null,
          admissionStatus: "draft",
          createdBy: BigInt(userId),
        },
      });

      await tx.admissionLog.create({
        data: {
          admissionId: admission.id,
          action: "created",
          newValue: { admissionStatus: "draft" },
          createdBy: BigInt(userId),
        },
      });

      return admission;
    });

    return NextResponse.json(
      { id: created.id.toString(), admissionNo: created.admissionNo },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create admission:", err);
    return NextResponse.json({ error: "Failed to create admission" }, { status: 500 });
  }
}
