import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogs } from "@/data/blogs";
import Link from "next/link";
import { CheckCircle2, Clock, User } from "lucide-react";
import { PillButton } from "@/components/shared/pill-button";
import { findRelatedCourse } from "@/lib/public-courses";
import { resolveBlogImage } from "@/lib/blog-images";
import { blogPostingJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `/blog/${blog.slug}`,
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) notFound();

  const course = await findRelatedCourse(blog.relatedCourse);
  const readingMinutes = Math.max(4, Math.round(blog.sections.reduce((n, s) => n + s.body.split(" ").length, 0) / 180));
  const postIndex = blogs.findIndex((b) => b.slug === blog.slug);
  const heroImage = resolveBlogImage(blog.relatedCourse, postIndex);

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd({ ...blog, image: heroImage })) }}
      />
      {/* ── Banner ── */}
      <section className="bg-[#013220] py-16 sm:py-20 text-white">
        <div className="max-w-3xl mx-auto px-5">
          <Link href="/blog" className="text-[#C5A059] hover:text-white mb-5 text-sm inline-flex items-center gap-1">
            ← Back to Blog
          </Link>
          <h1 className="text-[1.8rem] sm:text-4xl font-bold mb-5 leading-tight">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" />
              {blog.author}
            </span>
            <span>
              {new Date(blog.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {readingMinutes} min read
            </span>
          </div>
        </div>
      </section>

      <article className="py-16 sm:py-20 bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          {/* Hero image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-[#E8F0ED]">
            <Image src={heroImage} alt={blog.title} fill className="object-cover" unoptimized priority />
          </div>

          {/* Intro */}
          <p className="text-[1.05rem] text-[#374151] leading-relaxed mb-8">{blog.intro}</p>

          {/* Key takeaways */}
          <div className="rounded-2xl border border-[#E5E1D8] bg-white p-6 mb-10">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#C5A059] mb-3">
              Key Takeaways
            </p>
            <ul className="space-y-2.5">
              {blog.keyTakeaways.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[0.9rem] text-[#374151] leading-relaxed">
                  <CheckCircle2 className="size-[18px] shrink-0 mt-0.5 text-[#013220]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {blog.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-2.5">{section.heading}</h2>
                <p className="text-[0.95rem] text-[#6B7280] leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          {/* Related course */}
          {course && (
            <div className="mt-12 rounded-2xl border border-[#E5E1D8] bg-white p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-1">
                  Related Course
                </p>
                <p className="font-semibold text-[#1A1A1A]">{course.courseName}</p>
              </div>
              <PillButton href={`/courses/${course.slug}`} variant="light" arrow="→">
                View Course
              </PillButton>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-[#E8E4DC]">
            <PillButton href="/contact" variant="dark" arrow="↗">
              Get Admission Guidance
            </PillButton>
          </div>
        </div>
      </article>
    </div>
  );
}
