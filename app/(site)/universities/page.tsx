import { Metadata } from "next";
import { UniversitiesPageClient } from "./universities-client";

export const metadata: Metadata = {
  title: "Partner Universities",
  description: "Explore our partner universities - all UGC-recognized and NAAC-accredited institutions offering quality distance education.",
  alternates: { canonical: "/universities" },
  openGraph: {
    title: "Partner Universities — Chahar Institute",
    description: "All UGC-recognized and NAAC-accredited institutions offering quality distance education.",
    url: "/universities",
  },
};

export default function UniversitiesPage() {
  return <UniversitiesPageClient />;
}
