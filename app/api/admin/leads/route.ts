import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/** Leads are Super Admin only — the manage_leads permission gates every route here. */
async function requireManageLeads() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_LEADS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

export async function GET() {
  const { error } = await requireManageLeads();
  if (error) return error;

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return NextResponse.json(
    leads.map((l) => ({
      id: l.id.toString(),
      fullName: l.fullName,
      phone: l.phone,
      email: l.email,
      interestedCourse: l.interestedCourse,
      message: l.message,
      source: l.source,
      status: l.status,
      remarks: l.remarks,
      createdAt: l.createdAt,
    }))
  );
}
