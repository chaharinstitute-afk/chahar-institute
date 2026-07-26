import { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Chahar Institute services.",
};

export default function TermsPage() {
  return (
    <div>
      <PageBanner title="Terms & Conditions" subtitle="Last updated: July 2026" />

      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Acceptance of Terms</h2>
            <p className="text-[#6B7280] leading-relaxed">By accessing and using our website and services, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Services</h2>
            <p className="text-[#6B7280] leading-relaxed">Chahar Institute provides admission guidance and counselling for recognized universities. We facilitate the process but do not guarantee admission to any specific institution.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Student Responsibilities</h2>
            <p className="text-[#6B7280] leading-relaxed">Students must provide accurate information during the admission process. Misrepresentation may result in cancellation of admission.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Fee Policy</h2>
            <p className="text-[#6B7280] leading-relaxed">All fees must be paid as communicated during enrollment. Refund policies are governed by the respective universities.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Limitation of Liability</h2>
            <p className="text-[#6B7280] leading-relaxed">Chahar Institute shall not be liable for any indirect or consequential damages arising from the use of our services.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Contact</h2>
            <p className="text-[#6B7280] leading-relaxed">For questions regarding these terms, contact us at chaharinstitute@gmail.com.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

