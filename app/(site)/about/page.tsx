import { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PageBanner } from "@/components/shared/page-banner";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Chahar Institute — 10+ years of experience in distance education with 5000+ students enrolled.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Chahar Institute",
    description: "10+ years of experience in distance education with 5000+ students enrolled.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      <PageBanner title="About Chahar Institute" subtitle="Your trusted partner in education since 2014" />
      <AboutSection />
      <WhyChooseUs />
      <ContactCTA />
    </div>
  );
}
