"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header className="relative z-10 w-full overflow-hidden flex items-center justify-center" style={{ height: "100vh", minHeight: 720 }}>
      
      {/* ---- SMOOTH SCATTERED GLOW ---- */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(94, 159, 208, 0.25) 0%, rgba(36, 101, 150, 0.14) 30%, rgba(29, 73, 107, 0.05) 55%, transparent 80%)"
        }}
      ></div>

      {/* Pulsing glow animation spot */}
      <div 
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full animate-pulse-glow pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.1) 0%, rgba(36, 101, 150, 0.02) 50%, transparent 80%)"
        }}
      ></div>

      {/* ---- BEHIND-TEXT: sits behind the PS5, centered ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none">
        <div 
          className="text-behind text-center px-4"
          style={{ fontSize: "clamp(80px, 14vw, 220px)" }}
        >
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* ---- PS5 CONSOLE CENTERED (Large size preserved, static - no animation) ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        <div
          className="relative pointer-events-auto"
          style={{ width: "clamp(320px, 35vw, 480px)", height: "clamp(420px, 45vw, 640px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_15px_60px_rgba(94, 159, 208, 0.20)]"
          />
        </div>
      </div>

      {/* ---- OVERLAYED BRAND TITLE & SUPPORTING TEXT IN HERO VIEWPORT (Absolute bottom center) ---- */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[3] text-center w-full max-w-2xl px-6 pointer-events-none select-none animate-fadeInUp">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none title-glow">
            Rent Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-gamebees-accent-lavender/45 font-light leading-relaxed max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(20,20,20,0.8)]">
            Play the latest next-gen titles on premium console setups.<br />
            Same-day local dispatch, zero deposits, zero hassle.
          </p>
        </div>
      </div>

    </header>
  );
}
