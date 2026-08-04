import { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { CoursesSection } from "@/components/sections/courses-section";
import { AdmissionProcess } from "@/components/sections/admission-process";
import { UniversitiesSection } from "@/components/sections/universities-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { BlogSection } from "@/components/sections/blog-section";
import { FAQSection } from "@/components/sections/faq-section";
import { ContactCTA } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title:
    "Regular & Distance Course Admissions in India | Chahar Institute",
  description:
    "Chahar Institute provides expert admission guidance for Regular, Distance, Online & ODL courses across India, including B.Ed, D.El.Ed, M.Ed, BCA, MCA, MBA, BA, B.Com, B.Sc, MA, M.Com and other UGC-recognised university programs.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Chahar Institute | Regular & Distance Course Admissions Across India",
    description:
      "Get expert guidance for admissions to Regular, Distance, Online & ODL programs from UGC-recognised universities across India. Chahar Institute is based in Agra and helps students choose the right course and university.",
    url: "/",
  },
};
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <WhyChooseUs />
      <CoursesSection />
      <AdmissionProcess />
      {/* <UniversitiesSection /> */}
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <ContactCTA />
    </>
  );
}
