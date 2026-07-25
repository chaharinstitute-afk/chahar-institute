import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint — the "Send an Enquiry" form on the marketing site posts here.
 * No auth: this is a public lead-capture form. Every submission lands in the
 * Leads section of the admin panel for the Super Admin to follow up on.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const interestedCourse =
    typeof body.interestedCourse === "string" ? body.interestedCourse.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 100) : null;

  if (!fullName || !phone) {
    return NextResponse.json({ error: "Full name and phone are required" }, { status: 400 });
  }

  await prisma.lead.create({
    data: {
      fullName,
      phone,
      email: email || null,
      interestedCourse: interestedCourse || null,
      message: message || null,
      source,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
