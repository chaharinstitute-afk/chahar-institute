"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionTitle } from "@/components/shared/section-title";
import { PillButton } from "@/components/shared/pill-button";
import { universities } from "@/data/universities";

/* Alternating accent colours for variety */
const accents = [
  { bg: "#E8F0ED", text: "#013220", dot: "#013220" },
  { bg: "#F5EFE0", text: "#9A7232", dot: "#C5A059" },
  { bg: "#EEF4F1", text: "#013220", dot: "#013220" },
  { bg: "#FBF4E8", text: "#9A7232", dot: "#C5A059" },
  { bg: "#E8F0ED", text: "#013220", dot: "#013220" },
  { bg: "#F5EFE0", text: "#9A7232", dot: "#C5A059" },
];

export function UniversitiesSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="Partner Universities"
          subtitle="UGC‑recognised institutions trusted by thousands of students"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {universities.slice(0, 6).map((u, i) => {
            const a = accents[i % accents.length];
            return (
              <motion.div
                key={u.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="group relative bg-white rounded-2xl border border-[#E5E1D8] p-6
                           hover:shadow-[0_10px_40px_rgba(1,50,32,0.09)] hover:border-transparent
                           transition-all duration-300 overflow-hidden"
              >
                {/* Hover bg wash */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `${a.bg}55` }}
                />

                <div className="relative">
                  {/* Top row — avatar + badge */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Initial avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center
                                 font-bold text-[1.1rem] flex-shrink-0"
                      style={{ background: a.bg, color: a.text }}
                    >
                      {u.name.charAt(0)}
                    </div>

                    {/* Recognition badge */}
                    <span
                      className="text-[0.62rem] font-bold uppercase tracking-[0.12em] px-2.5 py-1
                                 rounded-full leading-none"
                      style={{
                        background: a.bg,
                        color: a.text,
                        border: `1px solid ${a.bg}`,
                      }}
                    >
                      {u.recognition.split(",")[0].trim()}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-[#1A1A1A] text-[0.95rem] leading-snug mb-2">
                    {u.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[0.8rem] text-[#6B7280] leading-relaxed mb-4">
                    {u.description}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#F0EDE7]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: a.dot }}
                      />
                      <span className="text-[0.72rem] font-medium" style={{ color: a.dot }}>
                        {u.recognition}
                      </span>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center
                                 text-xs font-bold transition-all duration-300
                                 group-hover:scale-110"
                      style={{ background: a.bg, color: a.text }}
                    >
                      →
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <PillButton href="/universities" variant="dark" arrow="↗">
            View All Universities
          </PillButton>
        </div>
      </div>
    </section>
  );
}
