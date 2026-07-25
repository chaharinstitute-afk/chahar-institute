import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/** Testimonials are Super Admin only — the manage_testimonials permission gates every route here. */
async function requireManageTestimonials() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (!granted.has(PERMISSIONS.MANAGE_TESTIMONIALS)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

export async function GET() {
  const { error } = await requireManageTestimonials();
  if (error) return error;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    testimonials.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      course: t.course,
      review: t.review,
      rating: t.rating,
      status: t.status,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { error } = await requireManageTestimonials();
  if (error) return error;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const course = typeof body.course === "string" ? body.course.trim() : "";
  const review = typeof body.review === "string" ? body.review.trim() : "";
  const rating = Number(body.rating);

  if (!name || !course || !review) {
    return NextResponse.json({ error: "Name, course and review are required" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
  }

  const created = await prisma.testimonial.create({
    data: {
      name,
      course,
      review,
      rating,
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
    },
  });

  return NextResponse.json(
    {
      id: created.id.toString(),
      name: created.name,
      course: created.course,
      review: created.review,
      rating: created.rating,
      status: created.status,
      sortOrder: created.sortOrder,
    },
    { status: 201 }
  );
}
