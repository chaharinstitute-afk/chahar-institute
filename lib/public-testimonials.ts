import { prisma } from "@/lib/prisma";

export type PublicTestimonial = {
  id: string;
  name: string;
  course: string;
  review: string;
  rating: number;
};

/** Active testimonials for the public "Student Stories" section, in the order set by Super Admin. */
export async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "active" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return testimonials.map((t) => ({
    id: t.id.toString(),
    name: t.name,
    course: t.course,
    review: t.review,
    rating: t.rating,
  }));
}
