import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/admissions/[id]
 * Full admission detail: student, academic records, uploaded documents.
 * Admins can only view admissions they created; Super Admin (view_all_admissions) can view any.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    include: {
      student: {
        include: {
          academicRecords: true,
          documents: { include: { documentType: true } },
          religion: { select: { name: true } },
          casteCategory: { select: { name: true } },
          country: { select: { name: true } },
        },
      },
      course: true,
      admissionCategory: true,
      admissionSession: true,
      faculty: true,
      stream: true,
      university: true,
      creator: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!admission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canViewAll && admission.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: admission.id.toString(),
    admissionNo: admission.admissionNo,
    admissionStatus: admission.admissionStatus,
    // Lets the UI show verification actions without a second round-trip.
    canReview: canViewAll,
    paymentStatus: admission.paymentStatus,
    admissionType: admission.admissionType,
    semester: admission.semester,
    registrationFee: admission.registrationFee ? admission.registrationFee.toString() : null,
    remarks: admission.remarks,
    createdAt: admission.createdAt,
    totalFee: admission.totalFee ? admission.totalFee.toString() : null,
    receivedAmount: admission.receivedAmount ? admission.receivedAmount.toString() : null,
    dueAmount: admission.dueAmount ? admission.dueAmount.toString() : null,
    nextPaymentDueDate: admission.nextPaymentDueDate,
    currentPaymentStatus: admission.currentPaymentStatus,
    course: { id: admission.course.id.toString(), courseName: admission.course.courseName },
    admissionCategory: {
      id: admission.admissionCategory.id.toString(),
      categoryName: admission.admissionCategory.categoryName,
    },
    admissionSession: {
      id: admission.admissionSession.id.toString(),
      session: admission.admissionSession.session,
      sessionType: admission.admissionSession.sessionType,
    },
    faculty: admission.faculty ? { id: admission.faculty.id.toString(), name: admission.faculty.name } : null,
    stream: admission.stream ? { id: admission.stream.id.toString(), name: admission.stream.name } : null,
    university: admission.university
      ? { id: admission.university.id.toString(), universityName: admission.university.universityName }
      : null,
    createdBy: admission.creator
      ? { id: admission.creator.id.toString(), fullName: admission.creator.fullName, email: admission.creator.email }
      : null,
    student: {
      id: admission.student.id.toString(),
      studentCode: admission.student.studentCode,
      fullName: admission.student.fullName,
      fatherName: admission.student.fatherName,
      motherName: admission.student.motherName,
      dob: admission.student.dob,
      gender: admission.student.gender,
      maritalStatus: admission.student.maritalStatus,
      employmentStatus: admission.student.employmentStatus,
      religion: admission.student.religion?.name ?? null,
      casteCategory: admission.student.casteCategory?.name ?? null,
      mobile: admission.student.mobile,
      alternateMobile: admission.student.alternateMobile,
      email: admission.student.email,
      alternateEmail: admission.student.alternateEmail,
      address: admission.student.address,
      city: admission.student.city,
      district: admission.student.district,
      state: admission.student.state,
      country: admission.student.country?.name ?? null,
      pincode: admission.student.pincode,
      aadhaar: admission.student.aadhaar,
      abcId: admission.student.abcId,
      debId: admission.student.debId,
    },
    academicRecords: admission.student.academicRecords.map((r) => ({
      id: r.id.toString(),
      qualification: r.qualification,
      boardUniversity: r.boardUniversity,
      passingYear: r.passingYear,
      percentage: r.percentage ? r.percentage.toString() : null,
      cgpa: r.cgpa ? r.cgpa.toString() : null,
      result: r.result,
      rollNo: r.rollNo,
      registrationNo: r.registrationNo,
    })),
    documents: admission.student.documents.map((d) => ({
      id: d.id.toString(),
      documentTypeId: d.documentTypeId.toString(),
      documentTypeName: d.documentType.name,
      filePath: d.filePath,
      verified: d.verified,
      uploadedAt: d.uploadedAt,
    })),
  });
}
