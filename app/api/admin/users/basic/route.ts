import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users/basic
 * Lightweight { id, fullName } list of active admin users — used to populate
 * "submitted by" / "filled by" filter dropdowns (Payment History, Due Payments).
 * Gated by view_all_admissions (the same permission that already decides
 * whether someone sees every admission/payment vs only their own), rather
 * than manage_admin_users, so this stays scoped to the payments feature.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { status: "active" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(users.map((u) => ({ id: u.id.toString(), fullName: u.fullName })));
}
