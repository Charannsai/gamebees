"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header className="relative z-10 w-full overflow-hidden" style={{ height: "100vh", minHeight: 740 }}>
      
      {/* ---- SMOOTH SCATTERED GLOW (Centered under PS5, smooth falloff to avoid banding) ---- */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(94, 159, 208, 0.22) 0%, rgba(36, 101, 150, 0.12) 30%, rgba(29, 73, 107, 0.04) 55%, transparent 80%)"
        }}
      ></div>

      {/* Pulsing glow animation spot */}
      <div 
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full animate-pulse-glow pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.08) 0%, rgba(36, 101, 150, 0.02) 50%, transparent 80%)"
        }}
      ></div>

      {/* ---- BEHIND-TEXT: sits behind the PS5, vertically centered ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none">
        <div 
          className="text-behind text-center px-4"
          style={{ fontSize: "clamp(72px, 13vw, 210px)" }}
        >
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* ---- MAIN CONTENT: PS5 + text, vertically centered ---- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[2]">
        
        {/* PS5 Console — ENLARGED image size */}
        <div
          className="relative animate-float"
          style={{ width: "clamp(320px, 35vw, 480px)", height: "clamp(420px, 45vw, 640px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_15px_60px_rgba(94,159,208,0.20)]"
          />
        </div>

        {/* Brand New Simplified Text Layout */}
        <div className="mt-8 space-y-2.5 text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(20,20,20,0.9)]">
            Rent Your Experience
          </h1>
          <p className="max-w-md mx-auto text-sm sm:text-base text-gamebees-accent-lavender/60 font-light leading-relaxed drop-shadow-[0_2px_8px_rgba(20,20,20,0.9)]">
            Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

      {/* Bottom organic transition fade into constant background */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #141414 100%)"
        }}
      ></div>

    </header>
  );
}
