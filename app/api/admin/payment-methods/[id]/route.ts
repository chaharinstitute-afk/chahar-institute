import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";

/**
 * PATCH /api/admin/payment-methods/[id]
 * Multipart form, same fields as POST — all optional (only provided fields are updated).
 * Send qrCode file to replace the QR image, or removeQrCode=1 to clear it.
 * Requires manage_payment_methods.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_PAYMENT_METHODS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.paymentMethod.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const data: Record<string, unknown> = {};

  const label = formData.get("label");
  if (typeof label === "string" && label.trim()) data.label = label.trim();

  const type = formData.get("type");
  if (type === "upi" || type === "bank_transfer") data.type = type;

  for (const field of ["upiId", "upiNumber", "bankName", "accountNumber", "ifscCode"] as const) {
    if (formData.has(field)) data[field] = (formData.get(field) as string) || null;
  }

  const isActive = formData.get("isActive");
  if (isActive === "true" || isActive === "false") data.isActive = isActive === "true";

  const sortOrder = formData.get("sortOrder");
  if (typeof sortOrder === "string" && sortOrder !== "") data.sortOrder = Number(sortOrder);

  try {
    const qrCode = formData.get("qrCode");
    if (qrCode instanceof File && qrCode.size > 0) {
      data.qrCodeImage = await saveUploadedFile(qrCode, "payment-methods");
    } else if (formData.get("removeQrCode") === "1") {
      data.qrCodeImage = null;
    }

    const updated = await prisma.paymentMethod.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({
      id: updated.id.toString(),
      type: updated.type,
      label: updated.label,
      upiId: updated.upiId,
      upiNumber: updated.upiNumber,
      hasQrCode: !!updated.qrCodeImage,
      bankName: updated.bankName,
      accountNumber: updated.accountNumber,
      ifscCode: updated.ifscCode,
      isActive: updated.isActive,
      sortOrder: updated.sortOrder,
    });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to update payment method:", err);
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/payment-methods/[id]
 * Requires manage_payment_methods. Blocked if the method is referenced by
 * any payment submission (audit trail must stay intact) — deactivate instead.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_PAYMENT_METHODS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.paymentMethod.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const usageCount = await prisma.paymentSubmission.count({ where: { paymentMethodId: existing.id } });
  if (usageCount > 0) {
    return NextResponse.json(
      { error: "This method has payment history and can't be deleted. Deactivate it instead." },
      { status: 400 }
    );
  }

  await prisma.paymentMethod.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
