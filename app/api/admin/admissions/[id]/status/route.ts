import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { AdmissionStatus } from "@prisma/client";

/**
 * Allowed status transitions. Keeps the workflow from jumping states
 * (see admin/ADMIN_PANEL_PLAN.md § Admission Status Flow).
 */
const ALLOWED_TRANSITIONS: Record<AdmissionStatus, AdmissionStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_verification", "documents_pending", "approved", "rejected"],
  under_verification: ["documents_pending", "approved", "rejected"],
  documents_pending: ["under_verification", "approved", "rejected"],
  approved: ["completed"],
  rejected: ["submitted"],
  completed: [],
};

/**
 * PATCH /api/admin/admissions/[id]/status
 * Body: { status: AdmissionStatus, remarks?: string }
 * Records every change in admission_logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const { id } = await params;
  const body = await req.json();
  const nextStatus = body.status as AdmissionStatus | undefined;

  if (!nextStatus || !(nextStatus in ALLOWED_TRANSITIONS)) {
    return NextResponse.json({ error: "A valid status is required" }, { status: 400 });
  }

  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    select: { id: true, admissionStatus: true, createdBy: true },
  });
  if (!admission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Admins can only act on their own admissions.
  if (!canViewAll && admission.createdBy?.toString() !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Submitting an admission needs submit_admission (both roles have it).
  // Every later transition is a verification decision, reserved for Super Admin.
  if (nextStatus === "submitted") {
    if (!granted.has(PERMISSIONS.SUBMIT_ADMISSION)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!canViewAll) {
    return NextResponse.json(
      { error: "Only a Super Admin can change the verification status" },
      { status: 403 }
    );
  }

  const current = admission.admissionStatus;
  if (current === nextStatus) {
    return NextResponse.json({ error: `Admission is already ${current}` }, { status: 400 });
  }
  if (!ALLOWED_TRANSITIONS[current].includes(nextStatus)) {
    return NextResponse.json(
      { error: `Cannot move an admission from "${current}" to "${nextStatus}"` },
      { status: 400 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.admission.update({
      where: { id: admission.id },
      data: {
        admissionStatus: nextStatus,
        ...(typeof body.remarks === "string" && body.remarks.trim()
          ? { remarks: body.remarks.trim() }
          : {}),
      },
    });

    await tx.admissionLog.create({
      data: {
        admissionId: admission.id,
        action: `status_changed_to_${nextStatus}`,
        oldValue: { admissionStatus: current },
        newValue: { admissionStatus: nextStatus },
        createdBy: BigInt(userId),
      },
    });

    return result;
  });

  return NextResponse.json({
    id: updated.id.toString(),
    admissionNo: updated.admissionNo,
    admissionStatus: updated.admissionStatus,
  });
}
