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
  title: "Chahar Institute — UP B.Ed & D.El.Ed College | Distance Courses, Agra",
  description:
    "Chahar Institute, Agra offers expert guidance for admissions to UP B.Ed college, D.El.Ed college, MBA, BCA, MCA and other distance courses through UGC-recognised universities.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Chahar Institute — UP B.Ed & D.El.Ed College, Agra",
    description: "Your trusted partner for B.Ed, D.El.Ed and distance course admissions in Agra, Uttar Pradesh.",
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
