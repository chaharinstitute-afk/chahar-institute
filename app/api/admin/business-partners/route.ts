import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/** Business Partner leads are Super Admin only — manage_business_partners gates every route here. */
async function requireManageBusinessPartners() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_BUSINESS_PARTNERS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

export async function GET() {
  const { error } = await requireManageBusinessPartners();
  if (error) return error;

  const leads = await prisma.businessPartnerLead.findMany({ orderBy: { createdAt: "desc" } });

  return NextResponse.json(
    leads.map((l) => ({
      id: l.id.toString(),
      fullName: l.fullName,
      mobile: l.mobile,
      email: l.email,
      city: l.city,
      message: l.message,
      status: l.status,
      remarks: l.remarks,
      createdAt: l.createdAt,
    }))
  );
}
