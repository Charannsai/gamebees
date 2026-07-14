"use client";

import React from "react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <header
      className="relative z-10 w-full flex items-center justify-center overflow-hidden"
      style={{ height: "90vh", flexShrink: 0 }}
    >
      
      {/* Soft Ice-Blue Backdrop Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ice-aura opacity-75 z-0 pointer-events-none"></div>
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full neon-ring opacity-20 z-0 pointer-events-none"></div>

      {/* Faint Background Text Overlay - GAMING BEYOND LIMITS */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
        <span className="text-[7.5vw] font-black tracking-[0.2em] text-gamebees-accent-blue/5 uppercase leading-none text-center block w-full whitespace-nowrap">
          GAMING BEYOND LIMITS
        </span>
      </div>

      {/* Main Stage Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center justify-center z-10 relative">
        
        {/* Centered PS5 image floating */}
        <div
          className="relative animate-float drop-shadow-[0_25px_60px_rgba(19,129,205,0.45)]"
          style={{ width: 300, height: 400 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Simple overlays below console */}
        <div className="mt-8 space-y-4 font-sans">
          <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-gamebees-accent-blue/80 block">
            PLAYSTATION 5 PRO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
            Premium Next-Gen Rental
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-gamebees-accent-lavender font-light">
            Experience stunning 4K gaming at up to 120 FPS. Shipped same-day in a premium travel case.
          </p>
        </div>

      </div>
    </header>
  );
}
