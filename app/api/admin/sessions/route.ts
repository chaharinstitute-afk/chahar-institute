import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // sessionType filter lets the admission form request only the intakes relevant
  // to the selected category: "Annual" for Regular, "January,July" for Online & ODL.
  const sessionTypeParam = req.nextUrl.searchParams.get("sessionType");
  const sessionTypes = sessionTypeParam ? sessionTypeParam.split(",") : null;

  const sessions = await prisma.admissionSession.findMany({
    where: sessionTypes ? { sessionType: { in: sessionTypes } } : undefined,
    orderBy: [{ session: "desc" }, { sessionType: "asc" }],
  });
  return NextResponse.json(sessions.map((s) => ({ ...s, id: s.id.toString() })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_ADMISSION_SESSIONS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const sessionName = typeof body.session === "string" ? body.session.trim() : "";
  const sessionType = typeof body.sessionType === "string" && body.sessionType.trim()
    ? body.sessionType.trim()
    : "Annual";
  if (!sessionName) {
    return NextResponse.json({ error: "Session is required" }, { status: 400 });
  }

  try {
    const created = await prisma.admissionSession.create({
      data: { session: sessionName, sessionType, isActive: Boolean(body.isActive) },
    });
    // Map explicitly — the raw record's BigInt id is not JSON-serializable.
    return NextResponse.json(
      {
        id: created.id.toString(),
        session: created.session,
        sessionType: created.sessionType,
        isActive: created.isActive,
      },
      { status: 201 }
    );
  } catch (err) {
    // Only a unique-constraint violation is an actual duplicate.
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: "A session with this year and intake type already exists" },
        { status: 409 }
      );
    }
    console.error("Failed to create admission session:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
