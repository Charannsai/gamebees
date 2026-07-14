"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header className="relative z-10 w-full overflow-hidden flex flex-col justify-between items-center py-24 sm:py-28" style={{ height: "100vh", minHeight: 680 }}>
      
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
          style={{ fontSize: "clamp(68px, 12vw, 190px)" }}
        >
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* spacer to push visual element below navbar */}
      <div className="h-8 w-full z-10"></div>

      {/* ---- PS5 CONSOLE CENTERED ---- */}
      <div className="flex-1 flex items-center justify-center z-[2] relative w-full">
        <div
          className="relative animate-float"
          style={{ width: "clamp(220px, 24vw, 320px)", height: "clamp(290px, 32vw, 420px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_12px_45px_rgba(94, 159, 208, 0.22)]"
          />
        </div>
      </div>

      {/* ---- BRAND TEXT CONTAINER AT THE BOTTOM (Inside Hero Viewport) ---- */}
      <div className="w-full text-center relative z-10 px-6 mt-4">
        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(20,20,20,0.9)]">
            Rent Your Experience
          </h1>
          <p className="text-sm sm:text-base text-gamebees-accent-lavender/60 font-light leading-relaxed drop-shadow-[0_2px_8px_rgba(20,20,20,0.9)]">
            Shipped same-day in a premium travel case.
          </p>
        </div>
      </div>

    </header>
  );
}
