import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/roles
 * Roles available when creating/editing an admin user. Restricted to users who
 * can manage admin accounts (Super Admin).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMIN_USERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roles = await prisma.role.findMany({ orderBy: { roleName: "asc" } });
  return NextResponse.json(
    roles.map((r) => ({ id: r.id.toString(), roleName: r.roleName }))
  );
}
