import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/** Every route here requires the manage_admin_users permission (Super Admin only). */
async function requireManageUsers() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMIN_USERS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null, userId: session.user.id };
}

export async function GET() {
  const { error } = await requireManageUsers();
  if (error) return error;

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id.toString(),
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile,
      status: u.status,
      roleId: u.roleId.toString(),
      roleName: u.role.roleName,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { error } = await requireManageUsers();
  if (error) return error;

  const body = await req.json();
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const roleId = body.roleId;

  if (!fullName || !email || !password || !roleId) {
    return NextResponse.json(
      { error: "Full name, email, password and role are all required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      fullName,
      email,
      mobile: body.mobile || null,
      password: await bcrypt.hash(password, 10),
      roleId: BigInt(roleId),
      status: body.status === "inactive" ? "inactive" : "active",
    },
    include: { role: true },
  });

  return NextResponse.json(
    {
      id: created.id.toString(),
      fullName: created.fullName,
      email: created.email,
      mobile: created.mobile,
      status: created.status,
      roleId: created.roleId.toString(),
      roleName: created.role.roleName,
    },
    { status: 201 }
  );
}
