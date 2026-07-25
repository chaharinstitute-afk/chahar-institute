import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/profile — the signed-in user's own account details. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: BigInt(session.user.id) },
    include: { role: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [admissionsCreated] = await Promise.all([
    prisma.admission.count({ where: { createdBy: user.id } }),
  ]);

  return NextResponse.json({
    id: user.id.toString(),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    roleName: user.role.roleName,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    admissionsCreated,
  });
}

/**
 * PATCH /api/admin/profile
 * Users may update their own name/mobile, and change their password by
 * supplying the current one. Role and status are deliberately not editable here.
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: BigInt(session.user.id) } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.fullName === "string" && body.fullName.trim()) {
    data.fullName = body.fullName.trim();
  }
  if (typeof body.mobile === "string") {
    data.mobile = body.mobile.trim() || null;
  }

  // Password change requires proving knowledge of the current password.
  if (body.newPassword) {
    if (typeof body.currentPassword !== "string" || !body.currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password to set a new one" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(body.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (typeof body.newPassword !== "string" || body.newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    data.password = await bcrypt.hash(body.newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    include: { role: true },
  });

  return NextResponse.json({
    id: updated.id.toString(),
    fullName: updated.fullName,
    email: updated.email,
    mobile: updated.mobile,
    roleName: updated.role.roleName,
  });
}
