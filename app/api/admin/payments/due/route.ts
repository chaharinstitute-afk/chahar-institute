import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/payments/due
 * Due Payments — admissions with an outstanding balance (dueAmount > 0).
 * Filters: dueDate (exact/upto date), q (student name / admission no),
 * status (currentPaymentStatus), createdBy (Super Admin only, filter by submitting Admin).
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const status = req.nextUrl.searchParams.get("status");
  const dueDate = req.nextUrl.searchParams.get("dueDate");
  const createdByParam = req.nextUrl.searchParams.get("createdBy");

  const where: Record<string, unknown> = { dueAmount: { gt: 0 } };
  if (!canViewAll) {
    where.createdBy = BigInt(session.user.id);
  } else if (createdByParam) {
    where.createdBy = BigInt(createdByParam);
  }
  if (status) where.currentPaymentStatus = status;
  if (dueDate) {
    const day = new Date(dueDate);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    where.nextPaymentDueDate = { gte: day, lt: nextDay };
  }
  if (q) {
    where.OR = [
      { admissionNo: { contains: q } },
      { student: { fullName: { contains: q } } },
    ];
  }

  const admissions = await prisma.admission.findMany({
    where,
    select: {
      id: true,
      admissionNo: true,
      totalFee: true,
      receivedAmount: true,
      dueAmount: true,
      nextPaymentDueDate: true,
      lastPaymentDate: true,
      currentPaymentStatus: true,
      student: { select: { fullName: true, studentCode: true } },
      creator: { select: { id: true, fullName: true } },
    },
    orderBy: [{ nextPaymentDueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    admissions.map((a) => ({
      id: a.id.toString(),
      admissionNo: a.admissionNo,
      student: { fullName: a.student.fullName, studentCode: a.student.studentCode },
      totalFee: a.totalFee ? a.totalFee.toString() : null,
      receivedAmount: a.receivedAmount ? a.receivedAmount.toString() : null,
      dueAmount: a.dueAmount ? a.dueAmount.toString() : null,
      nextPaymentDueDate: a.nextPaymentDueDate,
      lastPaymentDate: a.lastPaymentDate,
      currentPaymentStatus: a.currentPaymentStatus,
      createdBy: a.creator ? { id: a.creator.id.toString(), fullName: a.creator.fullName } : null,
    }))
  );
}
