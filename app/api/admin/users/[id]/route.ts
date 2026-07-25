import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

async function requireManageUsers() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMIN_USERS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null, currentUserId: session.user.id };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, currentUserId } = await requireManageUsers();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  // Guard against a Super Admin locking themselves out of the panel.
  if (id === currentUserId && body.status === "inactive") {
    return NextResponse.json(
      { error: "You cannot deactivate your own account" },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (typeof body.fullName === "string" && body.fullName.trim()) data.fullName = body.fullName.trim();
  if (typeof body.mobile === "string") data.mobile = body.mobile.trim() || null;
  if (body.roleId) data.roleId = BigInt(body.roleId);
  if (body.status === "active" || body.status === "inactive") data.status = body.status;

  if (typeof body.email === "string" && body.email.trim()) {
    const email = body.email.trim().toLowerCase();
    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash && clash.id.toString() !== id) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    data.email = email;
  }

  if (typeof body.password === "string" && body.password) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    data.password = await bcrypt.hash(body.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: BigInt(id) },
    data,
    include: { role: true },
  });

  return NextResponse.json({
    id: updated.id.toString(),
    fullName: updated.fullName,
    email: updated.email,
    mobile: updated.mobile,
    status: updated.status,
    roleId: updated.roleId.toString(),
    roleName: updated.role.roleName,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, currentUserId } = await requireManageUsers();
  if (error) return error;

  const { id } = await params;

  if (id === currentUserId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Cannot delete — this user has created admissions or students. Deactivate the account instead.",
      },
      { status: 409 }
    );
  }
}
