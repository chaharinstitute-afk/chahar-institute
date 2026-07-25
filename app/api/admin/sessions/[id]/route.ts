import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMISSION_SESSIONS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Setting a session active deactivates other sessions of the same type only —
  // "Annual", "January", and "July" are independent tracks, each with its own
  // active session, since a category can only use its own intake type.
  if (body.isActive === true) {
    const target = await prisma.admissionSession.findUniqueOrThrow({ where: { id: BigInt(id) } });
    await prisma.$transaction([
      prisma.admissionSession.updateMany({
        data: { isActive: false },
        where: { sessionType: target.sessionType },
      }),
      prisma.admissionSession.update({ where: { id: BigInt(id) }, data: { isActive: true } }),
    ]);
    return NextResponse.json({ success: true });
  }

  const data: { session?: string; sessionType?: string; isActive?: boolean } = {};
  if (typeof body.session === "string" && body.session.trim()) data.session = body.session.trim();
  if (typeof body.sessionType === "string" && body.sessionType.trim()) {
    data.sessionType = body.sessionType.trim();
  }
  if (body.isActive === false) data.isActive = false;

  try {
    const updated = await prisma.admissionSession.update({ where: { id: BigInt(id) }, data });
    // Map explicitly — the raw record's BigInt id is not JSON-serializable.
    return NextResponse.json({
      id: updated.id.toString(),
      session: updated.session,
      sessionType: updated.sessionType,
      isActive: updated.isActive,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: "A session with this year and intake type already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to update admission session:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMISSION_SESSIONS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.admissionSession.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete — this session is likely referenced by admissions" },
      { status: 409 }
    );
  }
}
