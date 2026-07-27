import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * GET /api/admin/payment-methods/[id]/qr-code
 * Any authenticated admin user can view a method's QR code — Admins need this
 * in the "Pay" popup. No extra permission beyond being logged in.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const method = await prisma.paymentMethod.findUnique({ where: { id: BigInt(id) } });
  if (!method?.qrCodeImage) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const absolutePath = resolveUploadPath(method.qrCodeImage);
    const buffer = await readFile(absolutePath);
    const ext = method.qrCodeImage.slice(method.qrCodeImage.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "File could not be read" }, { status: 500 });
  }
}
