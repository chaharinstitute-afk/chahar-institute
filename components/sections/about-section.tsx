"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/shared/section-title";

// Different from hero stats — focus on quality & outcomes
const stats = [
  {
    number: "100%",
    label: "Admission Success Rate",
    desc: "Students successfully enrolled",
    accent: "#013220",
  },
  {
    number: "20+",
    label: "Courses Offered",
    desc: "Regular & distance programs",
    accent: "#C5A059",
  },
  {
    number: "100%",
    label: "UGC Recognised",
    desc: "All partner universities verified",
    accent: "#013220",
  },
  {
    number: "24hr",
    label: "Response Time",
    desc: "Quick counsellor turnaround",
    accent: "#C5A059",
  },
];

export function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left — text ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionTitle
              title="About Chahar Institute"
              subtitle="Your trusted partner in education since 2014."
              align="left"
            />
            <p className="text-[#6B7280] text-[0.95rem] leading-relaxed mb-5">
              Based in Agra, Uttar Pradesh, Chahar Institute provides end-to-end
              admission support for students enrolling in UGC‑recognised
              universities across India — from course selection and document
              verification to final confirmation.
            </p>
            <p className="text-[#6B7280] text-[0.95rem] leading-relaxed">
              As a leading UP B.Ed college and D.El.Ed college admission partner,
              our experienced counsellors have helped over 5,000 students across
              Agra and Uttar Pradesh navigate distance courses and online
              education with confidence and clarity.
            </p>
          </motion.div>

          {/* ── Right — stat cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative bg-white rounded-xl border border-[#E5E1D8] overflow-hidden group hover:shadow-[0_4px_24px_rgba(1,50,32,0.08)] transition-shadow duration-300 flex flex-col items-center justify-center text-center py-5 px-3"
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: s.accent }}
                />

                {/* Number */}
                <div
                  className="font-bold"
                  style={{
                    fontSize: "1.45rem",
                    color: s.accent,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.number}
                </div>

                {/* Label */}
                <div className="font-semibold text-[0.75rem] text-[#1A1A1A] mt-1 mb-0.5">
                  {s.label}
                </div>

                {/* Description */}
                <div className="text-[0.65rem] text-[#9CA3AF] leading-snug">
                  {s.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
