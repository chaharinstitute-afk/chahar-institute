"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/shared/section-title";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";

export function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <SectionTitle
          title="Frequently Asked Questions"
          subtitle="Everything you need to know before applying"
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Accordion>
            {faqs.slice(0, 7).map((faq, i) => (
              <AccordionItem
                key={i}
                value={String(i)}
                className="border-b border-[#E5E1D8] last:border-b-0"
              >
                <AccordionTrigger className="text-left text-[0.9rem] font-semibold text-[#1A1A1A] py-4 pr-2 hover:text-[#013220] transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-[0.85rem] text-[#6B7280] leading-relaxed pb-4">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
