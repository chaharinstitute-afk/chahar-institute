"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactForm } from "@/components/shared/contact-form";
import { PillButton } from "@/components/shared/pill-button";
import { categoryAccent, courseOptionLabel, type PublicCourse } from "@/lib/public-courses";

export function CourseDetailClient({ course }: { course: PublicCourse }) {
  const accent = categoryAccent(course.categoryName);

  return (
    <div>
      {/* ── Banner ── */}
      <section
        className="bg-[#013220] text-white"
        style={{ paddingTop: "calc(72px + 44px)", paddingBottom: "44px" }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Category label */}
            <span
              className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ color: "#C5A059" }}
            >
              {course.categoryName === "Regular" ? "Regular Course" : "Distance Course"}
            </span>

            {/* Course name — white, large */}
            <h1 className="text-[2.2rem] sm:text-[2.8rem] font-bold text-white mb-3 leading-tight">
              {course.courseName}
            </h1>

            {course.description ? (
              <p className="text-white/85 text-[0.95rem] max-w-2xl leading-relaxed">
                {course.description}
              </p>
            ) : course.facultyName ? (
              <p className="text-white/85 text-[0.95rem] max-w-2xl leading-relaxed">
                Faculty of {course.facultyName}
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Overview */}
            {course.overview && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-3">Course Overview</h2>
                <p className="text-[#6B7280] text-[0.9rem] leading-relaxed">{course.overview}</p>
              </motion.div>
            )}

            {/* Duration + Eligibility — compact inline cards with left/right borders */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="flex flex-col items-center justify-center text-center rounded-xl py-5 px-4"
                style={{
                  border: "1px solid #E5E1D8",
                  borderLeftWidth: "3px",
                  borderRightWidth: "3px",
                  borderLeftColor: accent,
                  borderRightColor: accent,
                  background: "#FAFAF8",
                }}
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9CA3AF" }}>
                  Duration
                </p>
                <p className="font-bold text-[#1A1A1A] text-[1.15rem]">{course.duration || "—"}</p>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center rounded-xl py-5 px-4"
                style={{
                  border: "1px solid #E5E1D8",
                  borderLeftWidth: "3px",
                  borderRightWidth: "3px",
                  borderLeftColor: "#C5A059",
                  borderRightColor: "#C5A059",
                  background: "#FAFAF8",
                }}
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9CA3AF" }}>
                  Eligibility
                </p>
                <p className="font-bold text-[#1A1A1A] text-[0.95rem] leading-snug">{course.eligibility || "—"}</p>
              </div>
            </div>

            {/* Course details */}
            <div>
              <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-3">Course Details</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-[#6B7280] text-[0.875rem]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                  Mode: {course.categoryName === "Regular" ? "Regular" : "Distance"}
                </li>
                {course.courseTypeName && (
                  <li className="flex items-center gap-3 text-[#6B7280] text-[0.875rem]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                    Type: {course.courseTypeName}
                  </li>
                )}
                {course.facultyName && (
                  <li className="flex items-center gap-3 text-[#6B7280] text-[0.875rem]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                    Faculty: {course.facultyName}
                  </li>
                )}
              </ul>
            </div>

            {/* Required Documents */}
            {course.requiredDocuments.length > 0 && (
              <div>
                <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-3">Required Documents</h2>
                <ul className="space-y-2">
                  {course.requiredDocuments.map((doc) => (
                    <li key={doc} className="flex items-center gap-3 text-[#6B7280] text-[0.875rem]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Career Opportunities */}
            {course.careerOpportunities.length > 0 && (
              <div>
                <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-3">Career Opportunities</h2>
                <div className="flex flex-wrap gap-2">
                  {course.careerOpportunities.map((career) => (
                    <span
                      key={career}
                      className="px-4 py-1.5 rounded-full text-[0.8rem] font-medium bg-[#E8F0ED] text-[#013220] border border-[#D1E0D9]"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {course.faqs.length > 0 && (
              <div>
                <h2 className="text-[1.2rem] font-bold text-[#1A1A1A] mb-3">FAQs</h2>
                <Accordion>
                  {course.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-[0.875rem] font-semibold text-[#1A1A1A]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-[0.85rem] text-[#6B7280] leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            <div className="sticky top-24 space-y-4">
              <div
                className="bg-white rounded-2xl p-6 border border-[#E5E1D8]"
                style={{ boxShadow: "0 4px 24px rgba(1,50,32,0.06)" }}
              >
                <h3 className="text-[1rem] font-bold text-[#1A1A1A] mb-1">
                  Interested in {course.courseName}?
                </h3>
                <p className="text-[0.78rem] text-[#9CA3AF] mb-5">
                  Fill the form — we reply within 24 hours.
                </p>
                <ContactForm
                  source={`course:${course.courseName}:${course.categoryName}`}
                  defaultCourse={courseOptionLabel(course)}
                />
              </div>

              <PillButton href="/contact" variant="dark" arrow="↗">
                Talk to a Counselor
              </PillButton>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
