"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { href: "/",             label: "Home"          },
  { href: "/courses",      label: "Courses"       },
  // { href: "/universities", label: "Universities"  }, // commented out per request — Partner Universities hidden from header
  { href: "/about",        label: "About"         },
  // { href: "/blog",         label: "Blog"          }, // commented out per request — Blog hidden from header for now
  { href: "/contact",      label: "Contact"       },
];

export function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname              = usePathname();

  /* Only homepage gets the transparent-until-scrolled treatment */
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Show solid white: always on inner pages, or when scrolled on home */
  const solidBg = !isHome || scrolled;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:    solidBg ? "rgba(253,251,247,0.97)" : "transparent",
        backdropFilter: solidBg ? "blur(14px)" : "none",
        borderBottom:  solidBg ? "1px solid #E5E1D8" : "1px solid transparent",
        boxShadow:     solidBg ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between" style={{ height: "80px" }}>

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logoWTB.png"
              alt="Chahar Institute"
              style={{ height: "72px", width: "auto", objectFit: "contain", display: "block" }}
            />
            <span className="flex flex-col leading-tight">
              <span
                className="font-bold"
                style={{ fontSize: "1.05rem", color: "#2d2d2d", letterSpacing: "-0.01em" }}
              >
                Chahar
              </span>
              <span
                className="font-bold"
                style={{ fontSize: "1.05rem", color: "#C5A059", letterSpacing: "-0.01em" }}
              >
                Institute
              </span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-[0.85rem] font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? "#013220" : "#2d2d2d",
                    background: isActive ? "#EEF4F1" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#013220";
                      (e.currentTarget as HTMLElement).style.background = "#F0EDE7";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#2d2d2d";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Apply Now ── */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="btn-pill btn-pill-dark"
              style={{ padding: "5px 5px 5px 20px", fontSize: "0.82rem" }}
            >
              <span className="btn-pill-label" style={{ paddingRight: "13px", fontWeight: 600 }}>
                Apply Now
              </span>
              <span className="btn-pill-circle" style={{ width: "30px", height: "30px", fontSize: "0.85rem" }}>
                ↗
              </span>
            </Link>
          </div>

          {/* ── Mobile ── */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <span
                  className="flex items-center justify-center font-bold text-xl leading-none"
                  style={{
                    width: "40px", height: "40px",
                    border: "1.5px solid #1A1A1A",
                    borderRadius: "10px",
                    color: "#1A1A1A",
                    background: "rgba(255,255,255,0.9)",
                  }}
                >
                  ≡
                </span>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton>
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#E5E1D8]">
                  <SheetTitle>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logoWTB.png"
                      alt="Chahar Institute"
                      style={{ height: "48px", width: "auto", objectFit: "contain" }}
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-6 pt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="py-3.5 text-base font-semibold text-[#1A1A1A] border-b border-[#E5E1D8] hover:text-[#013220] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-6">
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="btn-pill btn-pill-dark w-full"
                    >
                      <span className="btn-pill-label">Apply Now</span>
                      <span className="btn-pill-circle">↗</span>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
