import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { isRecordNotFoundError } from "@/lib/prisma-errors";
import type { LeadStatus } from "@prisma/client";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "converted", "closed"];

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

/** PATCH /api/admin/business-partners/[id] — Body: { status?: LeadStatus, remarks?: string } */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageBusinessPartners();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const data: { status?: LeadStatus; remarks?: string | null } = {};
  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status as LeadStatus;
  }
  if (typeof body.remarks === "string") {
    data.remarks = body.remarks.trim() || null;
  }

  try {
    const updated = await prisma.businessPartnerLead.update({ where: { id: BigInt(id) }, data });
    return NextResponse.json({
      id: updated.id.toString(),
      fullName: updated.fullName,
      mobile: updated.mobile,
      email: updated.email,
      city: updated.city,
      message: updated.message,
      status: updated.status,
      remarks: updated.remarks,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Failed to update business partner lead:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

/** DELETE /api/admin/business-partners/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageBusinessPartners();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.businessPartnerLead.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
