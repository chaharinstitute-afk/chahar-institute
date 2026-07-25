"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Enquiry",
    desc: "Reach out by phone, form, or walk in. Share your background and goals with our team.",
  },
  {
    n: "02",
    title: "Counselling",
    desc: "Our expert counsellors match you with the ideal course and university for your career.",
  },
  {
    n: "03",
    title: "Verification",
    desc: "Submit your documents. We verify everything and prepare your complete application.",
  },
  {
    n: "04",
    title: "Confirmed",
    desc: "Admission confirmed. You receive your official university credentials and joining details.",
  },
];

export function AdmissionProcess() {
  return (
    <section className="py-24 md:py-32" style={{ background: "#FDFBF7" }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="h-[3px] w-10 rounded-full bg-[#C5A059]" />
          </div>
          <h2 className="text-[1.85rem] md:text-[2.4rem] font-bold text-[#1A1A1A] tracking-tight mb-3">
            Admission Process
          </h2>
          <p className="text-[#6B7280] text-[0.95rem]">
            Four simple steps from enquiry to enrollment
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-[2px]"
            style={{ background: "linear-gradient(to bottom, #013220, #C5A059)" }}
          />

          <div className="space-y-0">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative flex gap-8 pb-10 last:pb-0"
              >
                {/* Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[0.82rem]"
                    style={{
                      background: i === steps.length - 1 ? "#C5A059" : "#013220",
                      color: "#fff",
                      boxShadow: `0 0 0 4px #FDFBF7, 0 0 0 6px ${i === steps.length - 1 ? "rgba(197,160,89,0.3)" : "rgba(1,50,32,0.15)"}`,
                    }}
                  >
                    {s.n}
                  </div>
                </div>

                {/* Content card */}
                <div
                  className="flex-1 bg-white rounded-2xl px-7 py-6 border border-[#E5E1D8]
                             hover:shadow-[0_6px_28px_rgba(1,50,32,0.08)] hover:border-transparent
                             transition-all duration-300 mb-2"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1A1A1A] text-[1.05rem]">{s.title}</h3>
                    <span
                      className="text-[0.65rem] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{
                        background: i === steps.length - 1 ? "#F5EFE0" : "#E8F0ED",
                        color: i === steps.length - 1 ? "#9A7232" : "#013220",
                      }}
                    >
                      Step {s.n}
                    </span>
                  </div>
                  <p className="text-[0.85rem] text-[#6B7280] leading-relaxed">{s.desc}</p>

                  {/* Progress bar */}
                  <div className="mt-4 h-[3px] rounded-full overflow-hidden" style={{ background: "#F0EDE7" }}>
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${(i + 1) * 25}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.3, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: i === steps.length - 1
                          ? "linear-gradient(to right, #013220, #C5A059)"
                          : "#013220",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-14 rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ background: "#013220" }}
        >
          <div>
            <p className="font-bold text-white text-[1.05rem] mb-1">Ready to begin your journey?</p>
            <p className="text-white/55 text-[0.82rem]">Mon – Sat &nbsp;·&nbsp; 9 AM – 6 PM</p>
          </div>
          <a href="/contact" className="btn-pill flex-shrink-0"
            style={{ background: "#C5A059", borderColor: "#C5A059" }}>
            <span className="btn-pill-label" style={{ color: "#fff" }}>Start Now</span>
            <span className="btn-pill-circle" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>↗</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
