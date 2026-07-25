import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/streams?facultyId=123
 * Returns streams, optionally filtered to those belonging to a specific faculty.
 * Used by the admission form so selecting a Faculty narrows the Stream options.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const facultyId = req.nextUrl.searchParams.get("facultyId");

  const streams = await prisma.stream.findMany({
    where: facultyId ? { facultyId: BigInt(facultyId) } : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    streams.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      status: s.status,
      facultyId: s.facultyId?.toString() ?? null,
    }))
  );
}
