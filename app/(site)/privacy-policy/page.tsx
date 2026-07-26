import { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy of Chahar Institute.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageBanner title="Privacy Policy" subtitle="Last updated: July 2026" />

      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Information We Collect</h2>
            <p className="text-[#6B7280] leading-relaxed">When you use our services, we may collect personal information such as your name, phone number, email address, educational qualifications, and other details necessary for the admission process.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">How We Use Your Information</h2>
            <p className="text-[#6B7280] leading-relaxed">We use the collected information to provide admission counselling, process your applications, communicate updates about your admission status, and send relevant information about courses and universities.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Data Protection</h2>
            <p className="text-[#6B7280] leading-relaxed">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Information Sharing</h2>
            <p className="text-[#6B7280] leading-relaxed">We may share your information with partner universities solely for the purpose of processing your admission. We do not sell or rent your personal information to third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Your Rights</h2>
            <p className="text-[#6B7280] leading-relaxed">You have the right to access, correct, or delete your personal information. Contact us at chaharinstitute@gmail.com.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

