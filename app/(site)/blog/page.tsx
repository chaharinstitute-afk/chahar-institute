import { Metadata } from "next";
import Link from "next/link";
import { blogs } from "@/data/blogs";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read latest articles about distance education, career guidance, and admission tips from Chahar Institute.",
};

export default function BlogPage() {
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
            {blogs.map((blog) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group">
                <article className="rounded-xl border border-[#E8E4DC] overflow-hidden bg-white hover:border-[#C5A059]/40 transition-colors">
                  <div className="aspect-video bg-[#E8F0ED] flex items-center justify-center">
                    <span className="text-5xl">ðŸ“š</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 text-xs text-[#6B7280] mb-3">
                      <span>{new Date(blog.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>{blog.author}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#013220] transition-colors line-clamp-2">{blog.title}</h2>
                    <p className="text-sm text-[#6B7280] line-clamp-2 mb-5">{blog.excerpt}</p>
                    <span className="btn-pill" style={{ fontSize: "0.78rem", padding: "4px 4px 4px 14px", display: "inline-flex" }}>
                      <span className="btn-pill-label" style={{ paddingRight: "10px" }}>Read More</span>
                      <span className="btn-pill-circle" style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}>â†’</span>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

