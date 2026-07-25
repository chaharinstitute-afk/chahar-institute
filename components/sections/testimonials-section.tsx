import { SectionTitle } from "@/components/shared/section-title";
import { getPublicTestimonials } from "@/lib/public-testimonials";

const palette = [
  { bg: "#E8F0ED", dot: "#013220" },
  { bg: "#F5EFE0", dot: "#C5A059" },
  { bg: "#E8F0ED", dot: "#013220" },
];

export async function TestimonialsSection() {
  const testimonials = await getPublicTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ background: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="Student Stories"
          subtitle="Real outcomes from students we've guided"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.slice(0, 3).map((t, i) => (
            <div
              key={t.id}
              className="flex flex-col bg-white rounded-2xl p-7 border border-[#E5E1D8] hover:shadow-[0_8px_32px_rgba(1,50,32,0.07)] transition-shadow duration-300"
            >
              {/* Quote mark */}
              <div
                className="text-[2.8rem] leading-none font-serif mb-3 select-none"
                style={{ color: "#C5A059", lineHeight: 0.85 }}
              >
                &ldquo;
              </div>

              <p className="text-[0.875rem] text-[#4B5563] leading-relaxed flex-1 mb-6">
                {t.review}
              </p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span
                    key={si}
                    className="text-[0.9rem]"
                    style={{ color: si < t.rating ? "#C5A059" : "#E5E1D8" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#F0EDE7]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[0.85rem] flex-shrink-0"
                  style={{ background: palette[i % palette.length].bg, color: palette[i % palette.length].dot }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[0.85rem] font-semibold text-[#1A1A1A]">{t.name}</p>
                  <p className="text-[0.72rem] text-[#9CA3AF]">{t.course}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
