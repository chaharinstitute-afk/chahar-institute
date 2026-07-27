import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { paymentSubmissionInclude, serializeSubmission, deriveAdmissionPaymentStatus } from "@/lib/payments";

/**
 * PATCH /api/admin/payments/[submissionId]/verify
 * Body: { decision: "approved" | "rejected", totalFee?, receivedAmount?, dueAmount?,
 *         nextPaymentDueDate?, remarks? }
 * Requires verify_payment (Super Admin only). On approval, updates the
 * admission's running balance in a transaction and snapshots the decision
 * onto the submission row for the Payment History audit trail.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.VERIFY_PAYMENT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const body = await req.json();
  const decision = body.decision as string | undefined;

  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: 'decision must be "approved" or "rejected"' }, { status: 400 });
  }

  const submission = await prisma.paymentSubmission.findUnique({
    where: { id: BigInt(submissionId) },
    include: { admission: { select: { id: true, totalFee: true, receivedAmount: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (submission.status !== "pending_verification") {
    return NextResponse.json(
      { error: `This submission is already ${submission.status.replace(/_/g, " ")}` },
      { status: 400 }
    );
  }

  const verifierId = BigInt(session.user.id);

  if (decision === "rejected") {
    const [updatedSubmission] = await prisma.$transaction([
      prisma.paymentSubmission.update({
        where: { id: submission.id },
        data: {
          status: "rejected",
          verifiedBy: verifierId,
          verifiedAt: new Date(),
          remarks: typeof body.remarks === "string" ? body.remarks.trim() || null : null,
        },
        include: paymentSubmissionInclude,
      }),
      prisma.admission.update({
        where: { id: submission.admissionId },
        data: { currentPaymentStatus: "rejected" },
      }),
    ]);

    return NextResponse.json(serializeSubmission(updatedSubmission));
  }

  // Approval — resolve the new totals. Fall back to the admission's current
  // values so a Super Admin can approve without re-typing fields they're not changing.
  const totalFee =
    body.totalFee !== undefined && body.totalFee !== null && body.totalFee !== ""
      ? Number(body.totalFee)
      : submission.admission.totalFee
      ? Number(submission.admission.totalFee)
      : null;

  const receivedAmount =
    body.receivedAmount !== undefined && body.receivedAmount !== null && body.receivedAmount !== ""
      ? Number(body.receivedAmount)
      : submission.admission.receivedAmount
      ? Number(submission.admission.receivedAmount)
      : Number(submission.amountPaid);

  if (totalFee === null || Number.isNaN(totalFee) || totalFee < 0) {
    return NextResponse.json({ error: "A valid Total Fee is required to approve" }, { status: 400 });
  }
  if (Number.isNaN(receivedAmount) || receivedAmount < 0) {
    return NextResponse.json({ error: "A valid Received Amount is required to approve" }, { status: 400 });
  }

  // Due Amount: trust an explicit value from the Super Admin only if provided;
  // otherwise compute it server-side rather than trusting a stale client value.
  const dueAmount =
    body.dueAmount !== undefined && body.dueAmount !== null && body.dueAmount !== ""
      ? Number(body.dueAmount)
      : Math.max(totalFee - receivedAmount, 0);

  if (Number.isNaN(dueAmount) || dueAmount < 0) {
    return NextResponse.json({ error: "A valid Due Amount is required" }, { status: 400 });
  }

  const nextPaymentDueDate =
    typeof body.nextPaymentDueDate === "string" && body.nextPaymentDueDate
      ? new Date(body.nextPaymentDueDate)
      : null;
  const remarks = typeof body.remarks === "string" ? body.remarks.trim() || null : null;
  const admissionStatus = deriveAdmissionPaymentStatus(dueAmount);
  const now = new Date();

  const [updatedSubmission] = await prisma.$transaction([
    prisma.paymentSubmission.update({
      where: { id: submission.id },
      data: {
        status: "approved",
        verifiedBy: verifierId,
        verifiedAt: now,
        remarks,
        totalFeeAtDecision: String(totalFee),
        receivedAmountAtDecision: String(receivedAmount),
        dueAmountAtDecision: String(dueAmount),
        nextDueDateSet: nextPaymentDueDate,
      },
      include: paymentSubmissionInclude,
    }),
    prisma.admission.update({
      where: { id: submission.admissionId },
      data: {
        totalFee: String(totalFee),
        receivedAmount: String(receivedAmount),
        dueAmount: String(dueAmount),
        nextPaymentDueDate,
        lastPaymentDate: now,
        currentPaymentStatus: admissionStatus,
      },
    }),
    prisma.admissionLog.create({
      data: {
        admissionId: submission.admissionId,
        action: `payment_${admissionStatus}`,
        oldValue: {
          totalFee: submission.admission.totalFee?.toString() ?? null,
          receivedAmount: submission.admission.receivedAmount?.toString() ?? null,
        },
        newValue: { totalFee, receivedAmount, dueAmount, status: admissionStatus },
        createdBy: verifierId,
      },
    }),
  ]);

  return NextResponse.json(serializeSubmission(updatedSubmission));
}
