"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Is there a security deposit required?",
      answer: "We charge a small refundable security deposit of $50 for safety. However, for any rental of 7 days or longer, we completely waive the deposit as part of our Gamer Loyalty Program!",
    },
    {
      question: "Can I request specific games to be pre-installed?",
      answer: "Absolutely! When filling out your booking details, just mention which games you want to play. If we have them in our game license library, we will download and install them for free before delivery.",
    },
    {
      question: "What happens if a console or controller is damaged?",
      answer: "We offer an optional Accidental Damage Protection coverage for just $2/day. If you opt-in, it covers 100% of any accidental liquid spills, drops, or stick drift. Without it, you are liable for repair costs.",
    },
    {
      question: "What items are included in the rental package?",
      answer: "Each rental package comes complete with the console of your choice, 2 matching controllers (4 Joy-Cons for Nintendo Switch), power cable, HDMI cable, and a premium travel carrying case.",
    },
    {
      question: "How fast is delivery and pickup?",
      answer: "We support free same-day hand delivery if you book before 2 PM local time. Otherwise, your gear will arrive within 24 hours. Pickup is also scheduled at your convenience on the final day.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-transparent">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <HelpCircle className="h-6 w-6 text-gamebees-accent-lavender" />
            Frequently Asked <span className="text-gamebees-accent-lavender">Questions</span>
          </h2>
          <p className="text-white/50 text-sm font-light">
            Have questions about deposit waivers, games, or delivery? Find your answers below.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-gamebees-accent-lavender/40 bg-white/[0.03]" : "border-white/5"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:text-gamebees-accent-lavender transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4 font-semibold">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gamebees-accent-lavender" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/40 flex-shrink-0" />
                  )}
                </button>

                {/* Answer with smooth height reveal transition */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[200px] border-t border-white/5" : "max-h-0 pointer-events-none"
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-white/60 leading-relaxed font-light">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
