import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { getPublicCourses, categoryAccent } from "@/lib/public-courses";
import { resolveBlogImage } from "@/lib/blog-images";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read latest articles about distance education, career guidance, and admission tips from Chahar Institute.",
};

export default async function BlogPage() {
  const courses = await getPublicCourses();

  return (
    <div>
      <section
        className="bg-[#013220] text-center text-white"
        style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.15 }}>
            Latest Articles
          </h1>
          <p className="text-white/75 text-[0.95rem]">Education trends and admission tips</p>
        </div>
      </section>

      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, i) => {
              const needle = blog.relatedCourse.trim().toLowerCase();
              const course =
                courses.find((c) => c.courseName.toLowerCase() === needle) ??
                courses.find((c) => c.courseName.toLowerCase().includes(needle));

              return (
                <article
                  key={blog.slug}
                  className="flex flex-col rounded-xl border border-[#E8E4DC] overflow-hidden bg-white hover:border-[#C5A059]/40 transition-colors"
                >
                  <Link href={`/blog/${blog.slug}`} className="group relative block aspect-video bg-[#E8F0ED]">
                    <Image
                      src={resolveBlogImage(blog.relatedCourse, i)}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    {course && (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="mb-3 self-start truncate max-w-full text-[0.68rem] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${categoryAccent(course.categoryName)}12`,
                          color: categoryAccent(course.categoryName),
                        }}
                      >
                        {course.courseName}
                      </Link>
                    )}
                    <Link href={`/blog/${blog.slug}`} className="group block flex-1">
                      <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
                        <span>{new Date(blog.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>·</span>
                        <span className="truncate">{blog.author}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#013220] transition-colors line-clamp-2">{blog.title}</h2>
                      <p className="text-sm text-[#6B7280] line-clamp-2 mb-5">{blog.excerpt}</p>
                    </Link>
                    <Link href={`/blog/${blog.slug}`} className="btn-pill self-start" style={{ fontSize: "0.78rem", padding: "4px 4px 4px 14px", display: "inline-flex" }}>
                      <span className="btn-pill-label" style={{ paddingRight: "10px" }}>Read More</span>
                      <span className="btn-pill-circle" style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

