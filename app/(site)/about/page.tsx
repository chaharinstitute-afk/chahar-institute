import { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PageBanner } from "@/components/shared/page-banner";

export const metadata: Metadata = {
  title: "About Us — Regular & Distance Education Admission Partner in Agra",
  description:
    "Learn about Chahar Institute, Agra — 10+ years of experience guiding admissions to Regular courses (B.Ed, D.El.Ed) and 15+ Distance & Online courses through UGC-recognised universities. 5000+ students enrolled.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Chahar Institute — Agra College Admission Partner",
    description: "10+ years of experience in Regular and Distance education with 5000+ students enrolled across Agra and Uttar Pradesh.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      <PageBanner
        title="About Chahar Institute"
        subtitle="Your trusted Regular & Distance education admission partner in Agra since 2014"
      />
      <AboutSection />
      <WhyChooseUs />
      <ContactCTA />
    </div>
  );
}
