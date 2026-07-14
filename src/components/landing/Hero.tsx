import React from "react";
import { Play } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-transparent">
      {/* Soft overlay gradient circle for visual texture depth */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gamebees-accent-blue/5 blur-3xl pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Play Has No Limits. <br />
              <span className="text-gamebees-accent-lavender">
                Rented Instantly.
              </span>
            </h1>

            <p className="max-w-lg mx-auto lg:mx-0 text-base sm:text-lg text-white/50 leading-relaxed font-light">
              Experience the power of the PlayStation 5 Pro starting from just $12/day. Zero security deposits on weekly rentals. Delivered and set up same-day with your favorite games pre-installed.
            </p>

            {/* Clean CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onRentClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full btn-polished font-bold text-white transition-all duration-300"
              >
                Rent Your Console
              </button>
              <a
                href="#consoles"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:border-gamebees-accent-blue/50 hover:bg-white/5 font-semibold text-white transition-all text-center flex items-center justify-center gap-2 group"
              >
                View Gear
                <Play className="h-4 w-4 text-gamebees-accent-lavender group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 flex justify-center items-center">
            
            {/* Minimalist Grainy Console Card with 3D Assets */}
            <div className="relative w-full max-w-md rounded-[24px] card-polished p-6 sm:p-8 flex flex-col items-center group overflow-hidden">
              {/* Soft glow in card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gamebees-accent-blue/10 rounded-full blur-2xl group-hover:bg-gamebees-accent-blue/20 transition-all duration-500"></div>
              
              {/* Stage container with perspective */}
              <div 
                className="relative aspect-square w-full rounded-2xl bg-white/[0.01] flex items-center justify-center border border-white/5 overflow-visible"
                style={{ perspective: "1000px" }}
              >
                {/* PS5 Console */}
                <div 
                  className="absolute left-[15%] w-[48%] h-[82%] transition-all duration-700 ease-out filter drop-shadow-[0_15px_30px_rgba(62,84,247,0.25)]"
                  style={{ transform: "rotateY(-15deg)" }}
                >
                  <Image 
                    src="/ps5.png" 
                    alt="PS5 Pro" 
                    fill 
                    priority
                    className="object-contain" 
                  />
                </div>

                {/* Controller */}
                <div 
                  className="absolute right-[10%] bottom-[15%] w-[48%] h-[38%] transition-all duration-700 ease-out delay-75 filter drop-shadow-[0_10px_20px_rgba(209,178,250,0.3)]"
                  style={{ transform: "rotateX(10deg) rotateY(15deg)" }}
                >
                  <Image 
                    src="/controller.png" 
                    alt="DualSense Controller" 
                    fill 
                    priority
                    className="object-contain" 
                  />
                </div>
              </div>

              {/* pricing footer */}
              <div className="mt-6 w-full flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/40 block tracking-wider uppercase font-semibold">PlayStation 5 Pro Bundle</span>
                  <span className="text-sm font-bold text-white/80">From $12/day</span>
                </div>
                <button
                  onClick={onRentClick}
                  className="px-6 py-2.5 rounded-full btn-polished text-xs font-bold text-white transition-all duration-300"
                >
                  Rent Bundle
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
