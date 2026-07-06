"use client";

import React from "react";
import { Play } from "lucide-react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-gamebees-bg">
      {/* Background Mesh Gradient */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full mesh-glow-pink pointer-events-none opacity-60"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Next-Gen Gaming. <br />
              <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">
                Rented Instantly.
              </span>
            </h1>

            <p className="max-w-lg mx-auto lg:mx-0 text-base sm:text-lg text-white/60 leading-relaxed font-light">
              Experience the power of the PS5 Pro, Xbox Series X, or Nintendo Switch starting from just $9/day. Zero security deposits on weekly rentals. Delivered and set up same-day.
            </p>

            {/* Clean CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onRentClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full btn-shiny-pink font-bold text-white transition-all duration-300"
              >
                Rent Your Console
              </button>
              <a
                href="#consoles"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:border-gamebees-pink-accent/50 hover:bg-white/5 font-semibold text-white transition-all text-center flex items-center justify-center gap-2 group"
              >
                View Catalog
                <Play className="h-4 w-4 text-gamebees-pink-accent group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 flex justify-center items-center">
            
            {/* Minimalist Glowing Console Card */}
            <div className="relative w-full max-w-sm rounded-[24px] card-glow-pink p-8 border-gamebees-pink-accent/20 shadow-[0_0_40px_rgba(232,62,140,0.1)] flex flex-col items-center">
              
              {/* Glowing Console Graphic Representation */}
              <div className="relative aspect-square w-full rounded-2xl bg-gamebees-bg/50 overflow-hidden flex items-center justify-center border border-white/5">
                
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,62,140,0.15)_0%,transparent_70%)]"></div>

                {/* CSS Drawn Stylized PS5 Console */}
                <div className="relative w-28 h-40 flex justify-center items-center">
                  {/* Left wing (White/Neon) */}
                  <div className="absolute left-0 w-7 h-full bg-gradient-to-t from-white via-white/95 to-white/60 rounded-tl-full rounded-bl-3xl border-r border-gamebees-pink-accent/20"></div>
                  
                  {/* Middle core (Black) */}
                  <div className="absolute w-10 h-[92%] bg-gradient-to-b from-zinc-800 to-black rounded-lg border-x border-white/5 flex flex-col items-center justify-between py-6 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-gamebees-pink-accent"></div>
                    <div className="w-0.5 h-10 bg-gamebees-pink-accent/60 rounded-full"></div>
                  </div>

                  {/* Right wing (White/Neon) */}
                  <div className="absolute right-0 w-7 h-full bg-gradient-to-t from-white via-white/95 to-white/60 rounded-tr-full rounded-br-3xl border-l border-gamebees-pink-accent/20"></div>

                  {/* Glowing pink interior strip */}
                  <div className="absolute w-[36px] h-[95%] bg-gamebees-pink-accent opacity-65 blur-[3px] z-0 shadow-[0_0_10px_#E83E8C]"></div>
                </div>
              </div>

              {/* Minimal pricing footer */}
              <div className="mt-6 w-full flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/40 block tracking-wider uppercase font-semibold">PlayStation 5 Pro</span>
                  <span className="text-sm text-white/70">From $12/day</span>
                </div>
                <button
                  onClick={onRentClick}
                  className="px-5 py-2.5 rounded-full btn-shiny-pink text-xs font-bold text-white transition-all"
                >
                  Rent Now
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
