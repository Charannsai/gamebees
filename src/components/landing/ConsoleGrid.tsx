"use client";

import React from "react";

interface Console {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  image: string;
  highlights: string[];
}

interface ConsoleGridProps {
  onRentClick: (consoleName: string) => void;
}

const CONSOLES: Console[] = [
  {
    id: "ps5-pro",
    name: "PlayStation 5 Pro",
    description: "The ultimate power. Upgraded ray tracing, 4K at high frame rates, and 2TB SSD storage.",
    dailyPrice: 12,
    image: "🎮",
    highlights: ["2TB High-Speed SSD", "Spider-Man 2 & EA FC 26", "2 Controllers Included"],
  },
  {
    id: "xbox-x",
    name: "Xbox Series X",
    description: "True 4K gaming powerhouse. Includes Game Pass Ultimate with 400+ titles ready.",
    dailyPrice: 9,
    image: "🕹️",
    highlights: ["1TB SSD Storage", "Game Pass Ultimate Ready", "2 Controllers Included"],
  },
  {
    id: "nintendo-oled",
    name: "Nintendo Switch OLED",
    description: "Vibrant 7-inch OLED screen. Perfect for local couch co-op, parties, and portability.",
    dailyPrice: 7,
    image: "👾",
    highlights: ["OLED Display Panel", "Mario Kart 8 & Zelda", "4 Joy-Cons Included"],
  },
  {
    id: "meta-quest",
    name: "Meta Quest 3",
    description: "Mixed reality gaming. No PC or wires needed. Pre-loaded with top VR games.",
    dailyPrice: 14,
    image: "🥽",
    highlights: ["4K+ Infinite Display", "Passthrough Mixed Reality", "5 VR Games Preloaded"],
  },
];

export default function ConsoleGrid({ onRentClick }: ConsoleGridProps) {
  return (
    <section id="consoles" className="py-24 bg-gamebees-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,62,140,0.05),transparent_50%)] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Choose Your <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">Gear</span>
          </h2>
          <p className="text-white/50 text-sm font-light">
            Every rental includes clean matching controllers, power/HDMI accessories, and top pre-installed gaming packages.
          </p>
        </div>

        {/* Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CONSOLES.map((console) => (
            <div
              key={console.id}
              className="flex flex-col rounded-[20px] card-glow-pink p-6"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-video rounded-xl bg-gamebees-bg/50 flex items-center justify-center border border-white/5 mb-6 overflow-hidden">
                <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(232,62,140,0.15)] select-none">
                  {console.image}
                </span>
              </div>

              {/* Title & Price */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">
                  {console.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gamebees-pink-accent glow-pink-intense">${console.dailyPrice}</span>
                  <span className="text-xs text-white/40">/ day</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/50 text-xs mb-6 flex-grow leading-relaxed font-light">
                {console.description}
              </p>

              {/* Key Highlights */}
              <ul className="space-y-2 mb-6 border-t border-white/5 pt-4">
                {console.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gamebees-pink-accent"></span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Rent Action Button */}
              <button
                onClick={() => onRentClick(console.name)}
                className="w-full py-3 rounded-xl btn-shiny-pink text-xs font-bold text-white transition-all duration-300"
              >
                Rent This Console
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
