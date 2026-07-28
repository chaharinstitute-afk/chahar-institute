import { Metadata } from "next";
import { Handshake, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { BusinessPartnerForm } from "@/components/shared/business-partner-form";

export const metadata: Metadata = {
  title: "Become a Business Partner",
  description:
    "Partner with Chahar Institute and earn by referring students for admission to UP B.Ed, D.El.Ed, and distance courses. Register your interest today.",
  alternates: { canonical: "/business-partner" },
  openGraph: {
    title: "Become a Business Partner — Chahar Institute",
    description:
      "Partner with Chahar Institute and earn by referring students for admission. Register your interest today.",
    url: "/business-partner",
  },
};

const benefits = [
  {
    icon: Handshake,
    title: "Simple Partnership",
    description: "No investment needed — just your network and trust in your community.",
  },
  {
    icon: TrendingUp,
    title: "Attractive Earnings",
    description: "Earn a commission for every student you refer who takes admission through us.",
  },
  {
    icon: Users,
    title: "Full Support",
    description: "Our counselling team handles the admission process end-to-end for your referrals.",
  },
  {
    icon: LayoutDashboard,
    title: "Dedicated Partner Panel",
    description: "Once onboarded, Access your own dashboard to add students, track admission status, monitor commissions, manage all your referrals and earning  from one place.",
  },
];

export default function BusinessPartnerPage() {
  return (
    <div>
      <PageBanner
        title="Become a Business Partner"
        subtitle="Partner with Chahar Institute and grow together"
      />

      <section className="py-16 md:py-20" style={{ background: "#F8F6F2" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* LEFT — benefits */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-[#013220] rounded-2xl p-7 text-white flex flex-col gap-5">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(197,160,89,0.18)" }}
                    >
                      <Icon className="size-[18px]" style={{ color: "#C5A059" }} />
                    </div>
                    <div>
                      <p className="text-[0.92rem] font-semibold mb-0.5">{title}</p>
                      <p className="text-[0.8rem] text-white/65 leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — form */}
            <div className="lg:col-span-3 self-start">
              <div className="bg-white rounded-2xl p-7" style={{ boxShadow: "0 4px 32px rgba(1,50,32,0.07)" }}>
                <h2 className="text-[1rem] font-bold text-[#1A1A1A] mb-1">Register Your Interest</h2>
                <p className="text-[0.78rem] text-[#9CA3AF] mb-6">
                  Share your details and our team will get in touch to explain the partnership.
                </p>
                <BusinessPartnerForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
