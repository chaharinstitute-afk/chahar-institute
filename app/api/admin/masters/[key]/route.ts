import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { isSimpleMasterKey, SIMPLE_MASTERS } from "@/lib/masters";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  if (!isSimpleMasterKey(key)) {
    return NextResponse.json({ error: "Unknown master" }, { status: 404 });
  }

  const delegate = SIMPLE_MASTERS[key].delegate();
  const items = await delegate.findMany({ orderBy: { name: "asc" } });

  // Map explicitly rather than spreading: some master tables carry extra BigInt
  // columns (e.g. streams.facultyId) which JSON.stringify cannot serialize.
  return NextResponse.json(
    items.map((i) => ({ id: i.id.toString(), name: i.name, status: i.status }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_MASTERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key } = await params;
  if (!isSimpleMasterKey(key)) {
    return NextResponse.json({ error: "Unknown master" }, { status: 404 });
  }

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const delegate = SIMPLE_MASTERS[key].delegate();
  try {
    // Map explicitly — the raw record's BigInt id is not JSON-serializable.
    const created = (await delegate.create({ data: { name } })) as {
      id: bigint;
      name: string;
      status: string;
    };
    return NextResponse.json(
      { id: created.id.toString(), name: created.name, status: created.status },
      { status: 201 }
    );
  } catch (err) {
    // Only a unique-constraint violation is an actual duplicate.
    if (isUniqueConstraintError(err)) {
      return NextResponse.json({ error: "A record with this name already exists" }, { status: 409 });
    }
    console.error(`Failed to create ${key}:`, err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
