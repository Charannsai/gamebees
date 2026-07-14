"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header className="relative z-10 w-full overflow-hidden" style={{ height: "100vh", minHeight: 700 }}>
      
      {/* ---- BACKGROUND LAYER: Radial blue glow ---- */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(36, 101, 150, 0.22) 0%, rgba(29, 73, 107, 0.08) 40%, transparent 70%)"
        }}
      ></div>

      {/* Pulsing secondary glow for life */}
      <div 
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-pulse-glow pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.08) 0%, transparent 70%)"
        }}
      ></div>

      {/* ---- BEHIND-TEXT: sits behind the PS5, vertically centered ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none">
        <div 
          className="text-behind text-center px-4"
          style={{ fontSize: "clamp(72px, 13vw, 200px)" }}
        >
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* ---- MAIN CONTENT: PS5 + text, vertically centered ---- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[2]">
        
        {/* PS5 Console — large and floating */}
        <div
          className="relative animate-float"
          style={{ width: "clamp(260px, 28vw, 380px)", height: "clamp(340px, 38vw, 500px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(36,101,150,0.25)]"
          />
        </div>

        {/* Text below the PS5 */}
        <div className="mt-8 sm:mt-10 space-y-3 text-center relative z-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-medium text-gamebees-glow-blue block">
            PLAYSTATION 5 PRO
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Premium Next-Gen<br />Rental
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-gamebees-accent-lavender/50 font-light leading-relaxed">
            Experience stunning 4K gaming at up to 120 FPS.<br className="hidden sm:block" /> Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

      {/* Bottom fade — dark into blue-tinted next section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(16, 50, 77, 0.10) 100%)"
        }}
      ></div>

    </header>
  );
}
