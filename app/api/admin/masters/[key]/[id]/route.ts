import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { isSimpleMasterKey, SIMPLE_MASTERS } from "@/lib/masters";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

async function requireManageMasters() {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_MASTERS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { error: null };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string; id: string }> }
) {
  const { error } = await requireManageMasters();
  if (error) return error;

  const { key, id } = await params;
  if (!isSimpleMasterKey(key)) {
    return NextResponse.json({ error: "Unknown master" }, { status: 404 });
  }

  const body = await req.json();
  const data: { name?: string; status?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (body.status === "active" || body.status === "inactive") data.status = body.status;

  const delegate = SIMPLE_MASTERS[key].delegate();
  try {
    // Map explicitly — the raw record's BigInt id is not JSON-serializable.
    const updated = (await delegate.update({ where: { id: BigInt(id) }, data })) as {
      id: bigint;
      name: string;
      status: string;
    };
    return NextResponse.json({
      id: updated.id.toString(),
      name: updated.name,
      status: updated.status,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json({ error: "A record with this name already exists" }, { status: 409 });
    }
    console.error(`Failed to update ${key}:`, err);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string; id: string }> }
) {
  const { error } = await requireManageMasters();
  if (error) return error;

  const { key, id } = await params;
  if (!isSimpleMasterKey(key)) {
    return NextResponse.json({ error: "Unknown master" }, { status: 404 });
  }

  const delegate = SIMPLE_MASTERS[key].delegate();
  try {
    await delegate.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete — this record is likely referenced elsewhere" },
      { status: 409 }
    );
  }
}
