"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header
      className="relative z-10 w-full flex items-center justify-center overflow-hidden"
      style={{ height: "100vh", minHeight: 700, flexShrink: 0 }}
    >
      
      {/* Clean radial glow behind console */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[700px] h-[700px] hero-glow rounded-full z-0 pointer-events-none"></div>

      {/* ---- GIANT BEHIND-TEXT: GAMING / BEYOND / LIMITS ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none overflow-hidden">
        <div className="text-behind text-center" style={{ fontSize: "clamp(80px, 14vw, 220px)" }}>
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* ---- PS5 CONSOLE (large, floating, in front of behind-text) ---- */}
      <div className="relative z-[2] flex flex-col items-center justify-center">
        <div
          className="relative animate-float"
          style={{ width: "clamp(280px, 30vw, 420px)", height: "clamp(380px, 40vw, 560px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Console info below image */}
        <div className="mt-6 sm:mt-10 space-y-3 text-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-gamebees-glow-blue/70 block">
            PLAYSTATION 5 PRO
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
            Premium Next-Gen Rental
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-white/40 font-light leading-relaxed">
            Experience stunning 4K gaming at up to 120 FPS. Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

      {/* Bottom gradient fade — dark transitions into blue-tinted next section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(16, 50, 77, 0.06))"
        }}
      ></div>

    </header>
  );
}
