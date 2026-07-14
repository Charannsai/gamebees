"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header className="relative z-10 w-full overflow-hidden" style={{ height: "100vh", minHeight: 720 }}>
      
      {/* ---- BACKGROUND SCATTERED GLOW LAYER (Centered under PS5) ---- */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(94, 159, 208, 0.28) 0%, rgba(36, 101, 150, 0.15) 35%, rgba(29, 73, 107, 0.05) 60%, transparent 80%)"
        }}
      ></div>

      {/* Pulsing secondary bright accent spot for rich animation */}
      <div 
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-glow pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.12) 0%, rgba(36, 101, 150, 0.03) 50%, transparent 70%)"
        }}
      ></div>

      {/* ---- BEHIND-TEXT: sits behind the PS5, vertically centered ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none">
        <div 
          className="text-behind text-center px-4"
          style={{ fontSize: "clamp(68px, 12vw, 190px)" }}
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
          style={{ width: "clamp(250px, 27vw, 360px)", height: "clamp(330px, 36vw, 480px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_10px_60px_rgba(94,159,208,0.25)]"
          />
        </div>

        {/* Text below the PS5 */}
        <div className="mt-8 sm:mt-10 space-y-3 text-center relative z-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-gamebees-glow-blue">
            PLAYSTATION 5 PRO
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-[0_2px_10px_rgba(20,20,20,0.8)]">
            Premium Next-Gen<br />Rental
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-gamebees-accent-lavender/60 font-light leading-relaxed drop-shadow-[0_2px_6px_rgba(20,20,20,0.8)]">
            Experience stunning 4K gaming at up to 120 FPS.<br className="hidden sm:block" /> Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

      {/* Bottom organic transition fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #141414 100%)"
        }}
      ></div>

    </header>
  );
}
