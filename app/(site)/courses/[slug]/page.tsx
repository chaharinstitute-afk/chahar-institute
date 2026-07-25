import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCourseBySlug, getPublicCourses } from "@/lib/public-courses";
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
  return {
    title: `${course.courseName} - ${course.duration ?? course.categoryName}`,
    description: `${course.courseName} — ${course.categoryName} program at Chahar Institute.`,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  return <CourseDetailClient course={course} />;
}
