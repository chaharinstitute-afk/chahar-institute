"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/shared/contact-form";

const contactDetails = [
  { icon: Phone, label: "Phone", value: "+91 99172 81887" },
  { icon: Mail, label: "Email", value: "chaharinstitute@gmail.com" },
  { icon: MapPin, label: "Address", value: "Agra, Uttar Pradesh, India" },
  { icon: Clock, label: "Office Hours", value: "Mon – Sat, 9 AM – 6 PM" },
];

export function ContactCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#F8F6F2" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-3">
            <div className="h-[3px] w-8 rounded-full bg-[#C5A059]" />
          </div>
          <h2 className="text-[1.75rem] md:text-[2.1rem] font-bold text-[#1A1A1A] tracking-tight mb-2">
            Get in Touch
          </h2>
          <p className="text-[#6B7280] text-[0.875rem]">
            Our counsellors are available Mon–Sat, 9 AM – 6 PM
          </p>
        </motion.div>

        {/* ── Two column layout — items-stretch so both columns match height ── */}
        <div className="grid lg:grid-cols-5 gap-8 items-stretch">

          {/* LEFT — contact info (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {/* Card */}
            <div className="bg-[#013220] rounded-2xl p-7 text-white flex flex-col gap-5">
              {contactDetails.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(197,160,89,0.18)" }}
                  >
                    <Icon className="size-[18px]" style={{ color: "#C5A059" }} />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">
                      {label}
                    </p>
                    <p className="text-[0.92rem] font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Admissions badge */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "#F5EFE0" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#C5A059" }}
              >
                <CheckCircle2 className="size-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A] text-[0.88rem]">Admissions Open 2026</p>
                <p className="text-[0.75rem] text-[#9A7232]">Limited seats available</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — form (3 cols). self-start so it sizes to its own (now
              shorter, without the email field) content instead of being
              stretched to match the taller left column with empty padding. */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-3 self-start"
          >
            <div
              className="bg-white rounded-2xl p-7"
              style={{ boxShadow: "0 4px 32px rgba(1,50,32,0.07)" }}
            >
              <h3 className="text-[1rem] font-bold text-[#1A1A1A] mb-1">Send an Enquiry</h3>
              <p className="text-[0.78rem] text-[#9CA3AF] mb-6">
                Fill in your details and we will call you back within 24 hours.
              </p>
              <ContactForm />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
