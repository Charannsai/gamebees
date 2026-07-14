"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface NavbarProps {
  onRentClick: () => void;
}

export default function Navbar({ onRentClick }: NavbarProps) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo - Minimalist tracked uppercase */}
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-[0.25em] text-white select-none">
              GAMEBEES
            </span>
          </div>

          {/* Action Button - Glow Pill */}
          <div className="flex items-center">
            <button
              onClick={onRentClick}
              className="btn-glow-pill flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-white/80" />
              <span>Rent Now</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
