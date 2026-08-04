import Link from "next/link";
import { getPublicCourses } from "@/lib/public-courses";

const quickLinks = [
  { href: "/courses",          label: "Courses"                },
  { href: "/about",            label: "About Us"               },
  { href: "/blog",             label: "Blog"                   },
  { href: "/contact",          label: "Contact"                },
  { href: "/business-partner", label: "Become a Business Partner" },
];

export async function Footer() {
  const courses = await getPublicCourses();
  // A handful of well-known names, whichever delivery mode they happen to be
  // listed under first — this is just a footer shortcut list, not exhaustive.
  const featured = ["B.Ed", "D.El.Ed", "MBA", "BCA", "MCA", "BA"];
  const popularCourses = featured
    .map((name) => courses.find((c) => c.courseName.toLowerCase().includes(name.toLowerCase())))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ href: `/courses/${c.slug}`, label: c.courseName }));

  return (
    <footer className="relative overflow-hidden" style={{ background: "#011a12" }}>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(to right, #013220, #C5A059, #013220)" }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            {/* Logo — white filter so it shows on dark bg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logoWTB.png"
              alt="Chahar Institute"
              style={{
                height: "52px", width: "auto",
                objectFit: "contain",
                marginBottom: "16px",
                filter: "brightness(0) invert(1)",
              }}
            />
 <p
  style={{
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.83rem",
    lineHeight: 1.8,
  }}
>
  Your trusted partner for Regular, Online & Distance Education admissions
  since 2016.
  <br />
  <strong>🎓 Up to 20% scholarship support for girls & women.</strong>
  <br />
  <strong>🤝 100% free admission assistance for Chahar families students</strong> — pay
  only the official university fees.
</p>
            {/* Contact highlight */}
            <div className="mt-5 space-y-2">
              <a
                href="tel:+919917281887"
                className="flex items-center gap-2 text-[0.82rem] font-semibold hover:text-white transition-colors"
                style={{ color: "#C5A059" }}
              >
                <span>📞</span> +91 99172 81887
              </a>
              <a
                href="mailto:chaharinstitute@gmail.com"
                className="flex items-center gap-2 text-[0.82rem] hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                <span>✉</span> chaharinstitute@gmail.com
              </a>
            </div>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/chaharinstitute?igsh=M2cwdWdja2Q4eDZt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chahar Institute on Instagram"
                className="footer-social-icon flex items-center justify-center rounded-lg"
                style={{ width: "34px", height: "34px" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/17rxncukkm/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chahar Institute on Facebook"
                className="footer-social-icon flex items-center justify-center rounded-lg"
                style={{ width: "34px", height: "34px" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/chaharinst"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chahar Institute on X (Twitter)"
                className="footer-social-icon flex items-center justify-center rounded-lg"
                style={{ width: "34px", height: "34px" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-[0.68rem] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: "#C5A059" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.875rem] font-medium hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 group-hover:bg-[#C5A059] transition-colors"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4
              className="text-[0.68rem] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: "#C5A059" }}
            >
              Popular Courses
            </h4>
            <ul className="space-y-3">
              {popularCourses.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.875rem] font-medium hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 group-hover:bg-[#C5A059] transition-colors"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Office info */}
          <div>
            <h4
              className="text-[0.68rem] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: "#C5A059" }}
            >
              Office Hours
            </h4>
            <div className="space-y-3 text-[0.875rem]" style={{ color: "rgba(255,255,255,0.65)" }}>
              <div>
                <p className="font-semibold text-white text-[0.82rem]">Mon – Sat</p>
                <p>9:00 AM – 6:00 PM</p>
              </div>
              <div>
                <p className="font-semibold text-white text-[0.82rem]">Address</p>
                <p>Agra, Uttar Pradesh, India</p>
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.72rem] font-semibold"
                style={{ background: "rgba(197,160,89,0.12)", color: "#C5A059", border: "1px solid rgba(197,160,89,0.2)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Admissions Open 2026
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "20px" }} />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
            © {new Date().getFullYear()} Chahar Institute. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}
            >
              Terms
            </Link>

            {/* Developer credit — small badge with a subtle gold glow on hover */}
            <a
              href="https://arundevstudio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-300"
              style={{
                border: "1px solid rgba(197,160,89,0.25)",
                background: "rgba(197,160,89,0.06)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.76rem" }}>
                Design and developed with
              </span>
              <span className="animate-pulse" style={{ color: "#e0507a", fontSize: "0.8rem" }}>
                ❤
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/arun_dev_stuido_logo.webp"
                alt="Arun Dev Studio"
                className="transition-transform duration-500 group-hover:rotate-[8deg]"
                style={{ height: "16px", width: "auto", objectFit: "contain" }}
              />
              <span
                className="font-semibold transition-colors"
                style={{ color: "#C5A059", fontSize: "0.76rem" }}
              >
                Arun Dev Studio
              </span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
