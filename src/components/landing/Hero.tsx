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

      {/* ---- BEHIND-TEXT: sits behind the PS5, centered ---- */}
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

      {/* ---- PS5 CONSOLE CENTERED (Large size preserved) ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        <div
          className="relative animate-float pointer-events-auto"
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

      {/* ---- CLEAN TEXT OVERLAY (No background, just pure minimal typography) ---- */}
      <div className="absolute bottom-16 left-6 sm:left-12 lg:left-24 max-w-[340px] z-10 animate-fadeInUp select-none pointer-events-none">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-[0_4px_16px_rgba(20,20,20,0.6)]">
            Rent Your Experience
          </h1>
          <p className="text-sm text-gamebees-accent-lavender/55 font-light leading-relaxed drop-shadow-[0_4px_12px_rgba(20,20,20,0.6)]">
            Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

    </header>
  );
}
