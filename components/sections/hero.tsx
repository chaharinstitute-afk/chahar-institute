"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
  { number: "10+",   label: "Years of Trust"    },
  { number: "5000+", label: "Students Placed"   },
  { number: "15+",   label: "Universities"      },
  { number: "20+",   label: "Courses Available" },
];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Mobile background — below sm only */}
      <div
        className="absolute inset-0 block sm:hidden"
        style={{
          backgroundImage: "url(/hero_mobile_bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Desktop background — sm and up, untouched from before */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          backgroundImage: "url(/heroBG.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-full">
        <div
          className="flex items-start"
          style={{ minHeight: "100vh" }}
        >

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center pt-36 sm:pt-40 lg:pt-44 pb-16 max-w-2xl"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="h-[2.5px] w-7 rounded-full" style={{ background: "#C5A059" }} />
              <span
                className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#C5A059" }}
              >
                Admissions Open 2026
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-bold mb-5 text-[#1A1A1A]"
              style={{ fontSize: "clamp(2.1rem, 4vw, 3.3rem)", lineHeight: 1.14, letterSpacing: "-0.02em" }}
            >
              Your Trusted Partner
              <br />
              for Regular{" "}
              <span style={{ color: "#C5A059" }}>&amp;</span>
              <br />
              Distance Education
            </h1>

            {/* Sub */}
            <p
              className="mb-10 max-w-[400px]"
              style={{ color: "#6B7280", fontSize: "0.975rem", lineHeight: 1.75 }}
            >
              Agra&apos;s trusted admission partner for Regular courses like
              B.Ed and D.El.Ed, plus 15+ Distance &amp; Online courses —
              BA, BCA, MBA, MCA and more — through UGC‑recognised universities.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-14">
              <Link href="/contact" className="btn-pill btn-pill-dark">
                <span className="btn-pill-label">Apply Now</span>
                <span className="btn-pill-circle">↗</span>
              </Link>
              <Link href="/courses" className="btn-pill">
                <span className="btn-pill-label">Explore Courses</span>
                <span className="btn-pill-circle">→</span>
              </Link>
            </div>

            {/* Stats — set on a soft translucent panel so they stay readable
                regardless of what's behind them in the background image. */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 px-5 py-5 rounded-2xl sm:px-7"
              style={{
                background: "rgba(253,251,247,0.72)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(1,50,32,0.1)",
                boxShadow: "0 8px 24px rgba(1,50,32,0.08)",
              }}
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span
                    className="font-bold tracking-tight"
                    style={{
                      fontSize: "1.5rem",
                      color: "#C5A059",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.number}
                  </span>
                  <span
                    className="text-[0.72rem] font-medium uppercase tracking-[0.1em]"
                    style={{ color: "#013220" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
