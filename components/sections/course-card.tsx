"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Single course card — the arc-corner hover style used across the courses
 * listing sections. Split into its own "use client" file so the parent
 * section can stay a Server Component and fetch course data directly.
 */
export function CourseCard({
  slug,
  name,
  duration,
  eligibility,
  description,
  accentColor,
  cardBg,
  index,
}: {
  slug: string;
  name: string;
  duration: string;
  eligibility: string;
  description: string;
  accentColor: string;
  cardBg: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.06, duration: 0.4 }}
    >
      <Link href={`/courses/${slug}`} className="block group h-full">
        <div
          className="relative h-full rounded-2xl overflow-hidden transition-all duration-300
                     group-hover:shadow-[0_16px_48px_rgba(1,50,32,0.14)]
                     group-hover:scale-[1.03]"
          style={{ background: cardBg }}
        >

          {/* ── Arc corner — top-right CTA bubble ── */}
          <div
            className="absolute top-0 right-0 z-10"
            style={{ width: "100px", height: "100px" }}
          >
            {/* Arc SVG mask */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              style={{ overflow: "visible" }}
            >
              <path
                d="M100,0 L100,100 L0,0 Z"
                fill={accentColor}
                className="transition-all duration-300"
              />
            </svg>

            {/* Arrow in corner — 3D lifted */}
            <div
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                         font-bold text-sm transition-all duration-300
                         group-hover:scale-110"
              style={{
                background: "#fff",
                color: accentColor,
                boxShadow: "2px 3px 10px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              ↗
            </div>
          </div>

          {/* ── Card content ── */}
          <div className="relative z-0 p-6 flex flex-col h-full">

            {/* Course name */}
            <h4
              className="font-bold text-[#1A1A1A] text-[1.05rem] leading-snug mb-3 pr-16"
            >
              {name}
            </h4>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {duration && (
                <span
                  className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.7)", color: "#4B5563" }}
                >
                  {duration}
                </span>
              )}
              {eligibility && (
                <span
                  className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.7)", color: "#4B5563" }}
                >
                  {eligibility}
                </span>
              )}
            </div>

            {/* Description */}
            <p
              className="text-[0.82rem] leading-relaxed flex-1"
              style={{ color: "#5a5a5a" }}
            >
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
