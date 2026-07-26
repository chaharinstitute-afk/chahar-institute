import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";

// Font is now loaded via @import in globals.css — no variable needed
// NOTE: This root layout is intentionally minimal — it only provides <html>/<body>
// and shared metadata. The public marketing site's Navbar/Footer live in
// app/(site)/layout.tsx, and the admin panel has its own header in app/admin/layout.tsx.
// This keeps /admin completely free of the public site's chrome.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chahar Institute — Online & Distance Education Partner",
    template: "%s | Chahar Institute",
  },
  description:
    "Chahar Institute offers expert guidance for admissions to B.Ed, D.El.Ed, MBA, BCA, MCA and other courses through UGC-recognised universities.",
  keywords: [
    "distance education",
    "B.Ed admission",
    "online courses",
    "Chahar Institute",
    "MBA distance",
    "D.El.Ed",
    "university admission",
    "Agra distance education",
  ],
  authors: [{ name: "Chahar Institute" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Chahar Institute — Online & Distance Education",
    description: "Your trusted partner for quality education admissions in India.",
    url: SITE_URL,
    siteName: "Chahar Institute",
    images: [{ url: "/logoWTB.png", width: 1536, height: 1024, alt: "Chahar Institute" }],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chahar Institute — Online & Distance Education",
    description: "Your trusted partner for quality education admissions in India.",
    images: ["/logoWTB.png"],
  },
  icons: {
    icon: "/logoWTB.png",
    shortcut: "/logoWTB.png",
    apple: "/logoWTB.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/*
        Navbar is position:fixed — it overlays the page.
        No top padding needed here; each page's first section
        handles its own top spacing (hero uses pt-[88px]).
      */}
      <body suppressHydrationWarning className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
