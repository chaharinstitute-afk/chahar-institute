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
