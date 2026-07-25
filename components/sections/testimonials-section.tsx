import { SectionTitle } from "@/components/shared/section-title";
import { getPublicTestimonials } from "@/lib/public-testimonials";
import { TestimonialsMarquee } from "@/components/sections/testimonials-marquee";

export async function TestimonialsSection() {
  const testimonials = await getPublicTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 overflow-hidden" style={{ background: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="Student Stories"
          subtitle="Real outcomes from students we've guided"
        />
      </div>

      <div className="mt-4">
        <TestimonialsMarquee testimonials={testimonials} />
      </div>
    </section>
  );
}
