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
    <section id="faq" className="py-24 relative overflow-hidden bg-gamebees-bg">
      {/* Radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-gamebees-pink-highlight/5 blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-gamebees-pink-accent" />
            Frequently Asked <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">Questions</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg">
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
                className={`rounded-2xl border bg-gamebees-bg/50 overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-gamebees-pink-accent shadow-[0_0_15px_rgba(232,62,140,0.15)]" : "border-white/5"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:text-gamebees-pink-accent transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gamebees-pink-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/50 flex-shrink-0" />
                  )}
                </button>

                {/* Answer with smooth height reveal transition */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[200px] border-t border-white/5" : "max-h-0 pointer-events-none"
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-white/70 leading-relaxed bg-white/[0.01]">
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
