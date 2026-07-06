"use client";

import React from "react";
import { Cpu, Gamepad2, ShieldCheck, Flame, Info } from "lucide-react";

interface Console {
  id: string;
  name: string;
  description: string;
  dailyPrice: number;
  image: string;
  specs: string[];
  games: string[];
  badge?: string;
  badgeType?: "hot" | "popular" | "new";
}

interface ConsoleGridProps {
  onRentClick: (consoleName: string) => void;
}

const CONSOLES: Console[] = [
  {
    id: "ps5-pro",
    name: "PlayStation 5 Pro",
    description: "The ultimate power. Upgraded ray tracing, 4K at high frame rates, and 2TB SSD.",
    dailyPrice: 12,
    image: "🎮",
    specs: ["2TB High-Speed SSD", "Enhanced Ray Tracing", "DualSense Haptics"],
    games: ["GTA VI (Pre-Order)", "Spider-Man 2", "EA FC 26", "God of War Ragnarök"],
    badge: "Most Demanded",
    badgeType: "hot",
  },
  {
    id: "xbox-x",
    name: "Xbox Series X",
    description: "True 4K gaming powerhouse. Includes Xbox Game Pass Ultimate with 400+ titles ready.",
    dailyPrice: 9,
    image: "🕹️",
    specs: ["1TB SSD Storage", "Game Pass Ultimate", "Quick Resume"],
    games: ["Forza Motorsport", "Halo Infinite", "Starfield", "Call of Duty: Black Ops 6"],
    badge: "Best Value",
    badgeType: "popular",
  },
  {
    id: "nintendo-oled",
    name: "Nintendo Switch OLED",
    description: "Vibrant 7-inch OLED screen. Perfect for local couch co-op, parties, and portability.",
    dailyPrice: 7,
    image: "👾",
    specs: ["7-inch OLED Screen", "4 Joy-Cons Included", "Dock + HDMI Kit"],
    games: ["Mario Kart 8 Deluxe", "Super Smash Bros. Ultimate", "Zelda: Tears of the Kingdom"],
    badge: "Party Pack",
    badgeType: "new",
  },
  {
    id: "meta-quest",
    name: "Meta Quest 3 (128GB)",
    description: "Mixed reality gaming. No PC or wires needed. Pre-loaded with top VR games.",
    dailyPrice: 14,
    image: "🥽",
    specs: ["4K+ Infinite Display", "Full-color Passthrough", "Spatial Audio"],
    games: ["Asgard's Wrath 2", "Beat Saber", "Superhot VR", "Resident Evil 4 VR"],
    badge: "Next Gen VR",
    badgeType: "hot",
  },
];

export default function ConsoleGrid({ onRentClick }: ConsoleGridProps) {
  return (
    <section id="consoles" className="py-24 bg-gamebees-bg relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,62,140,0.08),transparent_50%)]"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Choose Your <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">Battle Station</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg">
            Select from our top-tier catalog. Every rental includes 2 controllers (4 for Switch), all necessary cords, and a premium catalog of pre-installed games.
          </p>
        </div>

        {/* Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CONSOLES.map((console) => (
            <div
              key={console.id}
              className="flex flex-col rounded-[24px] card-glow-pink p-6"
            >
              {/* Badge & Image Container */}
              <div className="relative w-full aspect-video rounded-xl bg-gamebees-bg/85 flex items-center justify-center border border-white/5 mb-6 overflow-hidden">
                {/* Custom Glow background for card */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,62,140,0.15)_0%,transparent_70%)]"></div>

                {console.badge && (
                  <span className={`absolute top-3 left-3 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                    console.badgeType === "hot"
                      ? "bg-gamebees-pink-highlight/20 text-gamebees-pink-accent border-gamebees-pink-accent/50 shadow-[0_0_10px_rgba(232,62,140,0.5)] animate-pulse"
                      : "bg-white/10 text-white border-white/20"
                  }`}>
                    {console.badge}
                  </span>
                )}
                
                <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(232,62,140,0.25)] select-none">
                  {console.image}
                </span>
              </div>

              {/* Title & Price */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gamebees-pink-accent transition-colors">
                  {console.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gamebees-pink-accent glow-pink-intense">${console.dailyPrice}</span>
                  <span className="text-xs text-white/50">/ day</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/60 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">
                {console.description}
              </p>

              {/* Specs List */}
              <div className="space-y-2.5 mb-6 border-t border-white/5 pt-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Specifications</span>
                {console.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Cpu className="h-3.5 w-3.5 text-gamebees-pink-accent flex-shrink-0" />
                    <span className="truncate">{spec}</span>
                  </div>
                ))}
              </div>

              {/* Games List */}
              <div className="space-y-2.5 mb-6 border-t border-white/5 pt-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Pre-installed Games</span>
                {console.games.map((game, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Gamepad2 className="h-3.5 w-3.5 text-gamebees-pink-accent flex-shrink-0" />
                    <span className="truncate font-medium">{game}</span>
                  </div>
                ))}
              </div>

              {/* Rent Action Button */}
              <button
                onClick={() => onRentClick(console.name)}
                className="w-full py-3 rounded-xl btn-shiny-pink text-xs font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                Rent This Console
              </button>
            </div>
          ))}
        </div>

        {/* Security & Support Badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-white/5 max-w-4xl mx-auto text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gamebees-pink-highlight/10 border border-gamebees-pink-accent/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(232,62,140,0.15)]">
              <ShieldCheck className="h-5 w-5 text-gamebees-pink-accent" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Full Sanitization</h4>
              <p className="text-xs text-white/50">Every console & controller deep cleaned between rentals</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gamebees-pink-highlight/10 border border-gamebees-pink-accent/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(232,62,140,0.15)]">
              <Gamepad2 className="h-5 w-5 text-gamebees-pink-accent" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Any Game on Request</h4>
              <p className="text-xs text-white/50">Don&apos;t see your game? Tell us, we&apos;ll pre-install it for free</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gamebees-pink-highlight/10 border border-gamebees-pink-accent/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(232,62,140,0.15)]">
              <Info className="h-5 w-5 text-gamebees-pink-accent" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Damage Coverage</h4>
              <p className="text-xs text-white/50">Optional accidental damage waiver for complete peace of mind</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
