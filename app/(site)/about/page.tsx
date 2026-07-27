import { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PageBanner } from "@/components/shared/page-banner";

export const metadata: Metadata = {
  title: "About Us — UP B.Ed & D.El.Ed College Admission Partner in Agra",
  description:
    "Learn about Chahar Institute, Agra — 10+ years of experience guiding admissions to UP B.Ed college, D.El.Ed college, and distance courses through UGC-recognised universities. 5000+ students enrolled.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Chahar Institute — Agra College Admission Partner",
    description: "10+ years of experience in distance education with 5000+ students enrolled across Agra and Uttar Pradesh.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      <PageBanner
        title="About Chahar Institute"
        subtitle="Your trusted UP B.Ed & D.El.Ed college admission partner in Agra since 2014"
      />
      <AboutSection />
      <WhyChooseUs />
      <ContactCTA />
    </div>
  );
}
