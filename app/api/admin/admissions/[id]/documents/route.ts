import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";

/**
 * POST /api/admin/admissions/[id]/documents
 * Multipart form upload: fields "documentTypeId" and "file".
 * Requires upload_documents permission. Saves the file outside the public web root
 * and records it against the admission's student.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.UPLOAD_DOCUMENTS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    select: { id: true, studentId: true, createdBy: true },
  });
  if (!admission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);
  if (!canViewAll && admission.createdBy?.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const documentTypeId = formData.get("documentTypeId");
  const file = formData.get("file");

  if (typeof documentTypeId !== "string" || !documentTypeId) {
    return NextResponse.json({ error: "documentTypeId is required" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  try {
    const relativePath = await saveUploadedFile(file, `students/${admission.studentId.toString()}`);

    const document = await prisma.studentDocument.create({
      data: {
        studentId: admission.studentId,
        admissionId: admission.id,
        documentTypeId: BigInt(documentTypeId),
        filePath: relativePath,
      },
    });

    return NextResponse.json(
      { id: document.id.toString(), filePath: document.filePath },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to upload document:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
