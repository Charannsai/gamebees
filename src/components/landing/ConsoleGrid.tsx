"use client";

import React from "react";
import Image from "next/image";

interface Console {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  image: string;
  highlights: string[];
}

const CONSOLES: Console[] = [
  {
    id: "ps5-pro",
    name: "PlayStation 5 Pro Bundle",
    description: "The ultimate next-gen setup. Includes the PS5 Pro console (2TB SSD), two matching DualSense wireless controllers, power/HDMI cords, and top pre-installed games.",
    dailyPrice: 12,
    image: "/ps5.png",
    highlights: ["2TB High-Speed SSD", "2 Controllers Included", "Preloaded Game Package", "Premium Travel Case"],
  },
  {
    id: "dualsense-extra",
    name: "Extra DualSense Controller",
    description: "Add an additional controller for local couch co-op and party gaming. Fully sanitized and includes a dual controller charging dock.",
    dailyPrice: 3,
    image: "/controller.png",
    highlights: ["Haptic Feedback Support", "Adaptive Triggers", "Charging Dock Included", "Sanitized & Sealed"],
  },
];

interface ConsoleGridProps {
  onRentClick: (consoleName: string) => void;
}

export default function ConsoleGrid({ onRentClick }: ConsoleGridProps) {
  return (
    <section id="consoles" className="py-24 bg-transparent relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Choose Your <span className="text-gamebees-accent-lavender">Gear</span>
          </h2>
          <p className="text-white/50 text-sm font-light">
            Rent pristine, sanitized PlayStation 5 setups and extra controllers. Includes same-day setup and free game installations.
          </p>
        </div>

        {/* Console Grid - Centered 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {CONSOLES.map((console) => (
            <div
              key={console.id}
              className="flex flex-col rounded-[24px] card-polished p-6 sm:p-8 justify-between group"
            >
              <div>
                {/* Image Container */}
                <div className="relative w-full h-52 sm:h-60 rounded-2xl bg-white/[0.01] flex items-center justify-center border border-white/5 mb-6 overflow-hidden p-6">
                  <div className="relative w-full h-full transition-all duration-700 ease-out group-hover:scale-105 filter drop-shadow-[0_12px_25px_rgba(255,255,255,0.05)]">
                    <Image
                      src={console.image}
                      alt={console.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Title & Price */}
                <div className="mb-4 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-1">
                      {console.name}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed font-light mt-2">
                      {console.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-2xl font-black text-gamebees-accent-lavender">${console.dailyPrice}</span>
                    <span className="text-[10px] text-white/40">/ day</span>
                  </div>
                </div>

                {/* Key Highlights */}
                <ul className="space-y-2.5 my-6 border-t border-white/5 pt-5">
                  {console.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gamebees-accent-blue"></span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rent Action Button */}
              <button
                onClick={() => onRentClick(console.name)}
                className="w-full py-3.5 rounded-xl btn-polished text-xs font-bold text-white transition-all duration-300 shadow-md mt-2"
              >
                Rent This Gear
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
