import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { paymentSubmissionInclude, serializeSubmission } from "@/lib/payments";

/**
 * GET /api/admin/payments
 * Global Payment History — both roles can view, scoped like Admissions
 * (Admin sees only submissions against admissions they created).
 * Filters: q (student name / admission no), status, from, to (submittedAt range),
 * submittedBy (Super Admin only — filter by which admin recorded the payment).
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const status = req.nextUrl.searchParams.get("status");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const submittedByParam = req.nextUrl.searchParams.get("submittedBy");

  const where: Record<string, unknown> = {};
  if (!canViewAll) {
    where.admission = { createdBy: BigInt(session.user.id) };
  } else if (submittedByParam) {
    where.submittedBy = BigInt(submittedByParam);
  }
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { admission: { admissionNo: { contains: q } } },
      { admission: { student: { fullName: { contains: q } } } },
    ];
  }
  if (from || to) {
    where.submittedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
    };
  }

  const submissions = await prisma.paymentSubmission.findMany({
    where,
    include: paymentSubmissionInclude,
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions.map(serializeSubmission));
}
