import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { SectionTitle } from "@/components/shared/section-title";
import { PillButton } from "@/components/shared/pill-button";
import { getPublicCourses, categoryAccent } from "@/lib/public-courses";
import { resolveBlogImage } from "@/lib/blog-images";

/**
 * Homepage teaser for the blog — shows the 3 most recent posts, each tagged
 * with the real course it relates to (matched against the live catalog via
 * relatedCourse on the blog entry) so visitors can jump straight from an
 * article into that course's admission page.
 */
export async function BlogSection() {
  const courses = await getPublicCourses();
  const recent = [...blogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="From the Blog"
          subtitle="Admission tips, career guidance, and course comparisons"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recent.map((blog, i) => {
            const needle = blog.relatedCourse.trim().toLowerCase();
            const course =
              courses.find((c) => c.courseName.toLowerCase() === needle) ??
              courses.find((c) => c.courseName.toLowerCase().includes(needle));

            return (
              <article
                key={blog.slug}
                className="group flex flex-col rounded-2xl border border-[#E5E1D8] bg-[#FDFBF7] overflow-hidden hover:border-[#C5A059]/40 hover:shadow-[0_8px_32px_rgba(1,50,32,0.07)] transition-all duration-300"
              >
                <Link href={`/blog/${blog.slug}`} className="relative block aspect-video bg-[#E8F0ED]">
                  <Image
                    src={resolveBlogImage(blog.relatedCourse, i)}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  {/* Related course tag — links straight to that course's admission page */}
                  {course && (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="mb-3 self-start truncate max-w-full text-[0.68rem] font-semibold px-2.5 py-1 rounded-full transition-colors"
                      style={{
                        background: `${categoryAccent(course.categoryName)}12`,
                        color: categoryAccent(course.categoryName),
                      }}
                    >
                      {course.courseName}
                    </Link>
                  )}

                  <Link href={`/blog/${blog.slug}`} className="block flex-1">
                    <div className="flex items-center gap-3 text-[0.7rem] text-[#9CA3AF] mb-3">
                      <span>
                        {new Date(blog.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span className="truncate">{blog.author}</span>
                    </div>
                    <h3 className="text-[1rem] font-semibold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#013220] transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-[0.82rem] text-[#6B7280] line-clamp-2">{blog.excerpt}</p>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex justify-center">
          <PillButton href="/blog" variant="dark" arrow="↗">
            View All Articles
          </PillButton>
        </div>
      </div>
    </section>
  );
}
