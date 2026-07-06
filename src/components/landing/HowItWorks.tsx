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
      description: "Pick your console, customize games, add controllers, and select your rental dates using our calculator.",
      icon: <MousePointerClick className="h-6 w-6 text-gamebees-pink-accent" />,
    },
    {
      number: "02",
      title: "Same-Day Delivery",
      description: "Our tech expert hand-delivers, tests, and sets up the console directly on your TV. Ready to play instantly.",
      icon: <Truck className="h-6 w-6 text-gamebees-pink-accent" />,
    },
    {
      number: "03",
      title: "Play Your Heart Out",
      description: "No subscription required. Access top pre-installed blockbusters, multiplayer games, and exclusive bundles.",
      icon: <Flame className="h-6 w-6 text-gamebees-pink-accent" />,
    },
    {
      number: "04",
      title: "Easy Pickup",
      description: "Once your rental ends, we pick it up from your house. No repackaging, shipping, or cleaning necessary.",
      icon: <RefreshCcw className="h-6 w-6 text-gamebees-pink-accent" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-gamebees-bg-sec/20">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 -z-10 h-72 w-72 rounded-full bg-gamebees-purple-deep/10 blur-[80px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How It <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg">
            Rent next-gen console set ups in just four simple steps. We handle the heavy lifting, you handle the play.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[68px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gamebees-pink-accent/20 via-gamebees-purple-accent/30 to-gamebees-pink-accent/20 -z-10"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              {/* Step Icon Container with Number */}
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gamebees-bg-sec border border-white/10 box-glow-purple group-hover:border-gamebees-pink-accent group-hover:scale-105 transition-all duration-300">
                {step.icon}
                
                {/* Step Number Badge */}
                <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-r from-gamebees-pink-highlight to-gamebees-purple-accent text-[10px] font-black text-white flex items-center justify-center border border-gamebees-bg shadow-md">
                  {step.number}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gamebees-pink-accent transition-colors">
                {step.title}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm max-w-[240px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
