import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { isRecordNotFoundError } from "@/lib/prisma-errors";
import type { TestimonialStatus } from "@prisma/client";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageTestimonials();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const data: {
    name?: string;
    course?: string;
    review?: string;
    rating?: number;
    status?: TestimonialStatus;
    sortOrder?: number;
  } = {};

  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.course === "string" && body.course.trim()) data.course = body.course.trim();
  if (typeof body.review === "string" && body.review.trim()) data.review = body.review.trim();
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
    }
    data.rating = rating;
  }
  if (body.status === "active" || body.status === "inactive") data.status = body.status;
  if (Number.isInteger(body.sortOrder)) data.sortOrder = body.sortOrder;

  try {
    const updated = await prisma.testimonial.update({ where: { id: BigInt(id) }, data });
    return NextResponse.json({
      id: updated.id.toString(),
      name: updated.name,
      course: updated.course,
      review: updated.review,
      rating: updated.rating,
      status: updated.status,
      sortOrder: updated.sortOrder,
    });
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    console.error("Failed to update testimonial:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireManageTestimonials();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.testimonial.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
