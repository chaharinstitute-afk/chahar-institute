import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";

function serialize(m: {
  id: bigint;
  type: string;
  label: string;
  upiId: string | null;
  upiNumber: string | null;
  qrCodeImage: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  isActive: boolean;
  sortOrder: number;
}) {
  return {
    id: m.id.toString(),
    type: m.type,
    label: m.label,
    upiId: m.upiId,
    upiNumber: m.upiNumber,
    hasQrCode: !!m.qrCodeImage,
    bankName: m.bankName,
    accountNumber: m.accountNumber,
    ifscCode: m.ifscCode,
    isActive: m.isActive,
    sortOrder: m.sortOrder,
  };
}

/**
 * GET /api/admin/payment-methods
 * Any authenticated admin user can list methods — Admins need this for the
 * "Pay" popup. Pass ?all=1 to include inactive methods (Super Admin management page).
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const includeInactive = req.nextUrl.searchParams.get("all") === "1";
  if (includeInactive) {
    const granted = await getPermissionsForRole(BigInt(session.user.roleId));
    if (!granted.has(PERMISSIONS.MANAGE_PAYMENT_METHODS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const methods = await prisma.paymentMethod.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(methods.map(serialize));
}

/**
 * POST /api/admin/payment-methods
 * Multipart form: label, type, upiId?, upiNumber?, bankName?, accountNumber?,
 * ifscCode?, qrCode? (file). Requires manage_payment_methods (Super Admin only).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_PAYMENT_METHODS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const label = formData.get("label");
  const type = formData.get("type");

  if (typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }
  if (type !== "upi" && type !== "bank_transfer") {
    return NextResponse.json({ error: "A valid type is required" }, { status: 400 });
  }

  const qrCode = formData.get("qrCode");
  let qrCodeImage: string | null = null;

  try {
    if (qrCode instanceof File && qrCode.size > 0) {
      qrCodeImage = await saveUploadedFile(qrCode, "payment-methods");
    }

    const method = await prisma.paymentMethod.create({
      data: {
        label: label.trim(),
        type,
        upiId: (formData.get("upiId") as string) || null,
        upiNumber: (formData.get("upiNumber") as string) || null,
        qrCodeImage,
        bankName: (formData.get("bankName") as string) || null,
        accountNumber: (formData.get("accountNumber") as string) || null,
        ifscCode: (formData.get("ifscCode") as string) || null,
      },
    });

    return NextResponse.json(serialize(method), { status: 201 });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to create payment method:", err);
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
  }
}
