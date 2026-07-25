"use client";

import type { PublicTestimonial } from "@/lib/public-testimonials";

const palette = [
  { bg: "#E8F0ED", dot: "#013220" },
  { bg: "#F5EFE0", dot: "#C5A059" },
  { bg: "#E8F0ED", dot: "#013220" },
];

function TestimonialCard({ t, i }: { t: PublicTestimonial; i: number }) {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl p-7 border border-[#E5E1D8] hover:shadow-[0_8px_32px_rgba(1,50,32,0.07)] transition-shadow duration-300 flex-shrink-0"
      style={{ width: "360px" }}
    >
      {/* Quote mark */}
      <div
        className="text-[2.8rem] leading-none font-serif mb-3 select-none"
        style={{ color: "#C5A059", lineHeight: 0.85 }}
      >
        &ldquo;
      </div>

      <p className="text-[0.875rem] text-[#4B5563] leading-relaxed flex-1 mb-6">{t.review}</p>

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
  );
}

/**
 * Continuously auto-scrolling row of testimonial cards, left to right.
 * The track renders the list twice back-to-back and animates from 0 to -50%,
 * which loops seamlessly since the second copy picks up exactly where the
 * first one ends. Pauses on hover so visitors can actually read a card.
 */
export function TestimonialsMarquee({ testimonials }: { testimonials: PublicTestimonial[] }) {
  // Need enough cards for the loop to look continuous rather than repeating too soon.
  const track = testimonials.length < 4 ? [...testimonials, ...testimonials] : testimonials;
  const duration = Math.max(track.length * 6, 20); // seconds — scales with card count

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges so cards don't hard-cut at the container boundary */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16"
        style={{ background: "linear-gradient(to right, #FDFBF7, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16"
        style={{ background: "linear-gradient(to left, #FDFBF7, transparent)" }}
      />

      <div
        className="flex gap-5 testimonials-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {[...track, ...track].map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} i={i} />
        ))}
      </div>

      <style jsx>{`
        .testimonials-track {
          width: max-content;
          animation-name: testimonials-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .testimonials-track:hover {
          animation-play-state: paused;
        }
        /* Slides left → right: starts shifted back by one full track-width
           and animates toward 0, so cards visibly travel rightward. */
        @keyframes testimonials-scroll {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
