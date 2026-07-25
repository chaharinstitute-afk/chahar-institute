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
  ".pdf": "application/pdf",
};

/**
 * GET /api/admin/documents/[docId]
 * Streams an uploaded document back to an authenticated, authorized admin user.
 * Files live outside the public web root, so this route is the only way to view them.
 *
 * Add ?download=1 to force a file download (Content-Disposition: attachment)
 * instead of rendering inline in the browser.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { docId } = await params;
  const doc = await prisma.studentDocument.findUnique({
    where: { id: BigInt(docId) },
    include: {
      documentType: { select: { name: true } },
      student: { select: { studentCode: true } },
      admission: { select: { createdBy: true, admissionNo: true } },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && doc.admission?.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const absolutePath = resolveUploadPath(doc.filePath);
    const buffer = await readFile(absolutePath);
    const ext = doc.filePath.slice(doc.filePath.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    };

    if (req.nextUrl.searchParams.get("download")) {
      // Build a readable filename: "CI2026-000001 - 10th Marksheet.jpg"
      const prefix = doc.admission?.admissionNo ?? doc.student.studentCode;
      const safeName = `${prefix} - ${doc.documentType.name}${ext}`.replace(/[/\\?%*:|"<>]/g, "-");
      headers["Content-Disposition"] = `attachment; filename="${safeName}"`;
    }

    return new NextResponse(buffer, { headers });
  } catch {
    return NextResponse.json({ error: "File could not be read" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.UPLOAD_DOCUMENTS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { docId } = await params;
  const doc = await prisma.studentDocument.findUnique({
    where: { id: BigInt(docId) },
    include: { admission: { select: { createdBy: true } } },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && doc.admission?.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.studentDocument.delete({ where: { id: BigInt(docId) } });
  return NextResponse.json({ success: true });
}
