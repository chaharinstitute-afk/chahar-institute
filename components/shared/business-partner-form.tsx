"use client";

import { useState } from "react";

export function BusinessPartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/business-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          mobile: data.get("mobile"),
          email: data.get("email"),
          city: data.get("city"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #013220, #025c38)" }}
        >
          ✓
        </div>
        <p className="text-[1rem] font-bold text-[#013220] mb-1">Thank you!</p>
        <p className="text-[0.82rem] text-[#6B7280]">
          Our team will reach out to discuss the partnership within 24 hours.
        </p>
      </div>
    );
  }

  const field =
    "w-full px-4 py-3 rounded-xl border border-[#E5E1D8] bg-[#FDFBF7] text-[0.875rem] text-[#1A1A1A] placeholder:text-[#C0BBB2] focus:outline-none focus:border-[#013220] transition-colors duration-200";
  const label = "block text-[0.75rem] font-semibold text-[#4B5563] mb-1.5 tracking-wide uppercase";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Full Name</label>
          <input name="fullName" type="text" required placeholder="Your name" className={field} />
        </div>
        <div>
          <label className={label}>Mobile Number</label>
          <input name="mobile" type="tel" required placeholder="+91 XXXXX XXXXX" className={field} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Email (Optional)</label>
          <input name="email" type="email" placeholder="you@example.com" className={field} />
        </div>
        <div>
          <label className={label}>City</label>
          <input name="city" type="text" placeholder="Your city" className={field} />
        </div>
      </div>
      <div>
        <label className={label}>Message (Optional)</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Tell us a bit about yourself or your network..."
          className={`${field} resize-none`}
        />
      </div>

      {error && <p className="text-center text-[0.8rem] text-red-600">{error}</p>}

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={loading}
          className={["btn-pill btn-pill-dark w-full sm:w-auto", loading ? "opacity-70 cursor-not-allowed" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="btn-pill-label">{loading ? "Sending…" : "Submit"}</span>
          <span className="btn-pill-circle">
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              "↗"
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
