import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCourseBySlug, getPublicCourses } from "@/lib/public-courses";
import { courseJsonLd } from "@/lib/seo";
import { CourseDetailClient } from "./course-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const courses = await getPublicCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  const description =
    course.description ?? `${course.courseName} — ${course.categoryName} program at Chahar Institute.`;
  return {
    title: `${course.courseName} - ${course.duration ?? course.categoryName}`,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: `${course.courseName} — Chahar Institute`,
      description,
      url: `/courses/${course.slug}`,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd(course)) }}
      />
      <CourseDetailClient course={course} />
    </>
  );
}
