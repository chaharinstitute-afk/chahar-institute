"use client";

import { motion } from "framer-motion";
import { universities } from "@/data/universities";
import { ContactCTA } from "@/components/sections/contact-cta";

const accents = [
  { bg: "#E8F0ED", text: "#013220" },
  { bg: "#F5EFE0", text: "#9A7232" },
  { bg: "#EEF4F1", text: "#013220" },
  { bg: "#FBF4E8", text: "#9A7232" },
  { bg: "#E8F0ED", text: "#013220" },
  { bg: "#F5EFE0", text: "#9A7232" },
  { bg: "#EEF4F1", text: "#013220" },
  { bg: "#FBF4E8", text: "#9A7232" },
  { bg: "#E8F0ED", text: "#013220" },
  { bg: "#F5EFE0", text: "#9A7232" },
  { bg: "#EEF4F1", text: "#013220" },
  { bg: "#FBF4E8", text: "#9A7232" },
];

export function UniversitiesPageClient() {
  return (
    <div>
      {/* Banner */}
      <section
        className="bg-[#013220] text-center text-white"
        style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
            Partner Universities
          </h1>
          <p className="text-white/75 text-[0.95rem]">UGC‑Recognised universities for quality education</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {universities.map((u, i) => {
              const a = accents[i % accents.length];
              return (
                <motion.div
                  key={u.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.38 }}
                  className="group bg-white rounded-2xl border border-[#E5E1D8] p-6
                             hover:shadow-[0_10px_40px_rgba(1,50,32,0.09)] hover:border-transparent
                             transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: `${a.bg}55` }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[1.1rem]"
                        style={{ background: a.bg, color: a.text }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span
                        className="text-[0.62rem] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                        style={{ background: a.bg, color: a.text }}
                      >
                        {u.recognition.split(",")[0].trim()}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1A1A1A] text-[0.95rem] leading-snug mb-2">{u.name}</h3>
                    <p className="text-[0.8rem] text-[#6B7280] leading-relaxed mb-4">{u.description}</p>

                    <div className="flex items-center gap-1.5 pt-4 border-t border-[#F0EDE7]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.text }} />
                      <span className="text-[0.72rem] font-medium" style={{ color: a.text }}>
                        {u.recognition}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}
