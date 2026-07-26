import { Metadata } from "next";
import { ContactCTA } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Chahar Institute for admission enquiries. Call, WhatsApp, or fill our contact form.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Chahar Institute",
    description: "Get in touch for admission enquiries — call, WhatsApp, or fill our contact form.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div>
      <section
        className="bg-[#013220] text-center text-white"
        style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.15 }}>
            Contact Us
          </h1>
          <p className="text-white/75 text-[0.95rem]">We are here to help with your admission queries</p>
        </div>
      </section>
      <ContactCTA />

      {/* Map Placeholder */}
      <section className="pb-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl overflow-hidden border border-[#E8E4DC] h-72 bg-white flex items-center justify-center">
            <div className="text-center text-[#6B7280]">
              <p className="text-4xl mb-2">ðŸ“</p>
              <p className="font-medium text-[#1A1A1A]">Our Location</p>
              <p className="text-sm">Agra, Uttar Pradesh</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

