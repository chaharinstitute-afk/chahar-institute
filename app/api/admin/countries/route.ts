import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(countries.map((c) => ({ ...c, id: c.id.toString() })));
}
