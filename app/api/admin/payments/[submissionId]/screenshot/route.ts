import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * GET /api/admin/payments/[submissionId]/screenshot
 * Streams a payment proof screenshot back to an authenticated, authorized user.
 * Mirrors app/api/admin/documents/[docId]/route.ts.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { submissionId } = await params;
  const submission = await prisma.paymentSubmission.findUnique({
    where: { id: BigInt(submissionId) },
    include: { admission: { select: { createdBy: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && submission.admission.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const absolutePath = resolveUploadPath(submission.screenshotPath);
    const buffer = await readFile(absolutePath);
    const ext = submission.screenshotPath.slice(submission.screenshotPath.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "File could not be read" }, { status: 500 });
  }
}
