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
  // Brand
  "Chahar Institute",
  "Chahar",
  "Chaharwati",
  "Chaharkhap",

  // Education
  "distance education",
  "online education",
  "online degree",
  "distance learning",
  "ODL courses",
  "UGC recognised university",
  "NAAC accredited university",

  // Admissions
  "online admission",
  "college admission",
  "university admission",
  "distance admission",
  "education consultancy",
  "admission consultant",
  "career counselling",

  // Courses
  "B.Ed admission",
  "D.El.Ed admission",
  "M.Ed admission",
  "MBA distance",
  "MBA online",
  "BCA online",
  "BCA distance",
  "MCA online",
  "MCA distance",
  "BA distance",
  "B.Com distance",
  "B.Sc distance",
  "MA online",
  "M.Com online",
  "B.Lib admission",
  "B.P.Ed admission",
  "Special B.Ed",
  "Special D.El.Ed",

  // Locations
  "Agra distance education",
  "Agra college",
  "UP B.Ed college",
  "UP D.El.Ed college",
  "Bihar distance education",
  "Patna distance education",
  "Gaya distance education",
  "Muzaffarpur distance education",
  "Darbhanga distance education",
  "Rajasthan distance education",
  "Jaipur distance education",
  "Kota distance education",
  "Jodhpur distance education",
  "Lucknow distance education",
  "Kanpur distance education",
  "Prayagraj distance education",
  "Varanasi distance education",
  "Noida distance education",
  "Delhi NCR education consultant",

  // Search intent
  "admission 2026",
  "online admission 2026",
  "distance university admission",
  "best distance university",
  "distance education in Bihar",
  "distance education in UP",
  "distance education in Rajasthan",
  "apply online for B.Ed",
  "apply online for MBA",
  "UGC approved distance courses",
  "AICTE approved online courses",
  // Bihar
"Saharsa distance education",
"Saharsa college admission",
"Saharsa B.Ed admission",
"Saharsa D.El.Ed admission",

"Patna distance education",
"Patna college admission",
"Patna B.Ed admission",
"Patna MBA admission",

"Araria distance education",
"Araria college admission",
"Araria B.Ed admission",

"Darbhanga distance education",
"Darbhanga college admission",
"Darbhanga B.Ed admission",
"Darbhanga D.El.Ed admission",

// Uttar Pradesh
"Agra distance education",
"Agra B.Ed admission",
"Mathura distance education",
"Aligarh distance education",
"Lucknow distance education",
"Kanpur distance education",
"Varanasi distance education",
"Prayagraj distance education",

// Rajasthan
"Jaipur distance education",
"Jaipur B.Ed admission",
"Kota distance education",
"Jodhpur distance education",
"Udaipur distance education",
"Ajmer distance education",
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
