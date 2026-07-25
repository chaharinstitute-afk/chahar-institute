"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const categories = ["All", "Campus", "Events", "Students", "Certificates"];

const galleryItems = [
  { id: 1, category: "Campus", title: "Institute Main Office" },
  { id: 2, category: "Events", title: "Annual Seminar 2025" },
  { id: 3, category: "Students", title: "Student Counselling Session" },
  { id: 4, category: "Certificates", title: "Certificate Distribution" },
  { id: 5, category: "Campus", title: "Counselling Room" },
  { id: 6, category: "Events", title: "Education Fair 2025" },
  { id: 7, category: "Students", title: "Group Discussion" },
  { id: 8, category: "Certificates", title: "University Degree Ceremony" },
  { id: 9, category: "Campus", title: "Reception Area" },
  { id: 10, category: "Events", title: "Workshop on Career Guidance" },
  { id: 11, category: "Students", title: "Students at Study Center" },
  { id: 12, category: "Certificates", title: "Achievement Awards" },
];

export function GalleryPageClient() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = active === "All" ? galleryItems : galleryItems.filter((g) => g.category === active);

  return (
    <div>
      <section
        className="bg-[#013220] text-center text-white"
        style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>Gallery</h1>
          <p className="text-white/75 text-[0.95rem]">Capturing moments from our journey</p>
        </div>
      </section>

      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  active === cat
                    ? "bg-[#013220] text-white"
                    : "bg-white text-[#6B7280] border border-[#E8E4DC] hover:border-[#013220]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#E8F0ED] cursor-pointer"
                onClick={() => setLightbox(item.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">ðŸ“¸</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="p-3 w-full translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white text-2xl font-light" onClick={() => setLightbox(null)}>
            âœ•
          </button>
          <div className="max-w-2xl w-full aspect-video bg-[#E8F0ED] rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">ðŸ“·</span>
              <p className="mt-4 text-[#1A1A1A] font-medium">
                {galleryItems.find((g) => g.id === lightbox)?.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

