"use client";

import React from "react";
import { MousePointerClick, Truck, Flame, RefreshCcw } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      number: "01",
      title: "Book Online",
      description: "Pick your console, games, and select rental dates using our calculator.",
      icon: <MousePointerClick className="h-5 w-5 text-gamebees-pink-accent" />,
    },
    {
      number: "02",
      title: "Same-Day Delivery",
      description: "We hand-deliver, connect, and set up the console directly on your TV.",
      icon: <Truck className="h-5 w-5 text-gamebees-pink-accent" />,
    },
    {
      number: "03",
      title: "Play Your Games",
      description: "Play pre-installed blockbuster hits with controllers and cables supplied.",
      icon: <Flame className="h-5 w-5 text-gamebees-pink-accent" />,
    },
    {
      number: "04",
      title: "Easy Pickup",
      description: "Once your rental ends, we pick it up from your house. No repackaging.",
      icon: <RefreshCcw className="h-5 w-5 text-gamebees-pink-accent" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-transparent relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            How It <span className="text-gamebees-pink-accent">Works</span>
          </h2>
          <p className="text-white/50 text-sm font-light">
            Rent next-gen console setups in just four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              {/* Step Icon Container */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm group-hover:border-gamebees-pink-accent/40 group-hover:shadow-[0_0_15px_rgba(232,62,140,0.15)] transition-all duration-300">
                {step.icon}
                
                {/* Step Number Badge */}
                <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-r from-gamebees-pink-highlight to-gamebees-pink-accent text-[9px] font-black text-white flex items-center justify-center border border-gamebees-bg shadow-sm">
                  {step.number}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-white/50 text-xs max-w-[200px] leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
