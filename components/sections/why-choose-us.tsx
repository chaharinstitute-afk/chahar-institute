"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/shared/section-title";

const features = [
  { img: "/ugc.png",         title: "UGC Recognised",     desc: "All universities fully approved by UGC and government bodies.",        accent: "#013220" },
  { img: "/expert.png",      title: "Expert Counselling", desc: "Dedicated counsellors guide you through each step personally.",        accent: "#C5A059" },
  { img: "/transparent.png", title: "Transparent Fees",   desc: "Clear, upfront pricing with absolutely no hidden charges.",             accent: "#013220" },
  { img: "/support.png",     title: "End-to-End Support", desc: "We stay with you from enquiry through to exam notifications.",          accent: "#C5A059" },
  { img: "/fast.png",        title: "Fast Processing",    desc: "Documents verified and admissions confirmed in days, not weeks.",       accent: "#013220" },
  { img: "/proven.png",      title: "Proven Results",     desc: "5,000+ students successfully enrolled across 10+ years.",              accent: "#C5A059" },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28" style={{ background: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="Why Choose Us"
          subtitle="What makes Chahar Institute the right choice for your education"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.42 }}
              className="relative bg-white rounded-2xl pt-5 px-6 pb-5 border border-[#E5E1D8] overflow-hidden hover:shadow-[0_8px_32px_rgba(1,50,32,0.07)] transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Bottom accent border */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{ background: f.accent }}
              />

              {/* Image — fixed square box, all same visual size */}
              <div
                className="flex items-center justify-center mb-3 flex-shrink-0"
                style={{ width: "108px", height: "108px" }}
              >
                <Image
                  src={f.img}
                  alt={f.title}
                  width={108}
                  height={108}
                  className="object-contain"
                  style={{ width: "108px", height: "108px" }}
                  unoptimized
                />
              </div>

              {/* Text */}
              <h3 className="text-[0.95rem] font-semibold text-[#1A1A1A] mb-1.5">{f.title}</h3>
              <p className="text-[0.82rem] text-[#6B7280] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
