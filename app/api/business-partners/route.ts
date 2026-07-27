import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint — the "Become a Business Partner" form on the marketing site
 * posts here. No auth: public lead-capture form. Every submission lands under
 * Business Partners in the admin panel, visible to the Super Admin only.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!fullName || !mobile) {
    return NextResponse.json({ error: "Full name and mobile number are required" }, { status: 400 });
  }

  await prisma.businessPartnerLead.create({
    data: {
      fullName,
      mobile,
      email: email || null,
      city: city || null,
      message: message || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
