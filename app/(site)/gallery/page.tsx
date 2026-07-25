import { Metadata } from "next";
import { GalleryPageClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery",
  description: "View photos from our campus events, student activities, and certificate ceremonies at Chahar Institute.",
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}
