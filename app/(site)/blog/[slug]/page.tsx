import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogs } from "@/data/blogs";
import Link from "next/link";
import { PillButton } from "@/components/shared/pill-button";

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
  return { title: blog.title, description: blog.excerpt };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) notFound();

  return (
    <div>
      <section className="bg-[#013220] py-16 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="text-[#C5A059] hover:text-white mb-4 text-sm inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>{new Date(blog.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>{blog.author}</span>
          </div>
        </div>
      </section>

      <article className="py-20 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="aspect-video bg-[#E8F0ED] rounded-xl mb-8 flex items-center justify-center">
            <span className="text-7xl">📝</span>
          </div>
          <div className="prose prose-lg max-w-none text-[#6B7280] leading-relaxed">
            <p>{blog.content}</p>
          </div>
          <div className="mt-12 pt-8 border-t border-[#E8E4DC]">
            <PillButton href="/contact" variant="dark" arrow="↗">
              Get Admission Guidance
            </PillButton>
          </div>
        </div>
      </article>
    </div>
  );
}
