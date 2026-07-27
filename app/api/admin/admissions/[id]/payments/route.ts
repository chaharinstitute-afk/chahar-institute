import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";
import { paymentSubmissionInclude, serializeSubmission } from "@/lib/payments";

/**
 * GET /api/admin/admissions/[id]/payments
 * Payment submission history for one admission. Scoped like the admission
 * itself — Admins only see admissions they created, Super Admin sees all.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    select: { id: true, createdBy: true },
  });
  if (!admission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && admission.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await prisma.paymentSubmission.findMany({
    where: { admissionId: admission.id },
    include: paymentSubmissionInclude,
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions.map(serializeSubmission));
}

/**
 * POST /api/admin/admissions/[id]/payments
 * Multipart form: amountPaid, paymentMethodId, utrNumber? (optional), screenshot (file, required).
 * Requires submit_payment. Admins can only submit against admissions they created;
 * Super Admin (view_all_admissions) can submit against any. Status starts at
 * pending_verification — see the [submissionId]/verify route for the approve/reject step.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.SUBMIT_PAYMENT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    select: { id: true, createdBy: true, currentPaymentStatus: true },
  });
  if (!admission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && admission.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const amountPaid = formData.get("amountPaid");
  const paymentMethodId = formData.get("paymentMethodId");
  const utrNumber = formData.get("utrNumber");
  const screenshot = formData.get("screenshot");

  const amount = Number(amountPaid);
  if (!amountPaid || Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
  }
  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return NextResponse.json({ error: "A payment screenshot is required" }, { status: 400 });
  }

  try {
    const relativePath = await saveUploadedFile(screenshot, `payments/${admission.id.toString()}`);

    const submission = await prisma.paymentSubmission.create({
      data: {
        admissionId: admission.id,
        paymentMethodId:
          typeof paymentMethodId === "string" && paymentMethodId ? BigInt(paymentMethodId) : null,
        amountPaid: String(amount),
        utrNumber: typeof utrNumber === "string" && utrNumber.trim() ? utrNumber.trim() : null,
        screenshotPath: relativePath,
        submittedBy: BigInt(session.user.id),
      },
      include: paymentSubmissionInclude,
    });

    // Only flip the admission-level status to pending_verification if it isn't
    // already tracking an approved balance — a new submission on a
    // "partially_paid" admission shouldn't blank that out until the Super
    // Admin actually decides on this submission.
    if (!admission.currentPaymentStatus || admission.currentPaymentStatus === "rejected") {
      await prisma.admission.update({
        where: { id: admission.id },
        data: { currentPaymentStatus: "pending_verification" },
      });
    }

    return NextResponse.json(serializeSubmission(submission), { status: 201 });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to submit payment:", err);
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 });
  }
}
