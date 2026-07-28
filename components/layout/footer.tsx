import Link from "next/link";
import { getPublicCourses } from "@/lib/public-courses";

const quickLinks = [
  { href: "/courses",          label: "Courses"                },
  { href: "/universities",     label: "Universities"           },
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
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.83rem", lineHeight: 1.7 }}>
              Your trusted partner for online and distance education admissions since 2014.
            </p>

            {/* Contact highlight */}
            <div className="mt-5 space-y-2">
              <a
                href="tel:+919050623550"
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
