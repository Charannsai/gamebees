"use client";

import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ConsoleGrid from "@/components/landing/ConsoleGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import Calculator from "@/components/landing/Calculator";
import FAQ from "@/components/landing/FAQ";
import BookingModal from "@/components/landing/BookingModal";

export default function Home() {
  const [booking, setBooking] = useState({
    isOpen: false,
    consoleName: "PlayStation 5 Pro",
    duration: 3,
    accessories: [] as string[],
    total: 36,
  });

  const handleOpenBooking = (
    consoleName: string = "PlayStation 5 Pro",
    duration: number = 3,
    accessories: string[] = [],
    total: number = 36
  ) => {
    setBooking({
      isOpen: true,
      consoleName,
      duration,
      accessories,
      total,
    });
  };

  const handleCloseBooking = () => {
    setBooking((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper mapping prices for direct grid bookings
  const consolePrices: Record<string, number> = {
    "PlayStation 5 Pro": 12,
    "Xbox Series X": 9,
    "Nintendo Switch OLED": 7,
    "Meta Quest 3 (128GB)": 14,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent text-white selection:bg-gamebees-pink-highlight selection:text-white">
      {/* Dynamic Header / Navigation */}
      <Navbar onRentClick={() => handleOpenBooking()} />

      {/* Main Page Layout - One smooth continuous page without cut borders */}
      <main className="flex-1">
        {/* Interactive Hero Banner */}
        <Hero onRentClick={() => handleOpenBooking()} />

        {/* Console Selection Grid */}
        <ConsoleGrid
          onRentClick={(consoleName) => {
            const daily = consolePrices[consoleName] || 10;
            // Defaulting grid clicks to 3 days booking with 10% discount included
            const total = Math.round(daily * 3 * 0.9);
            handleOpenBooking(consoleName, 3, [], total);
          }}
        />

        {/* How It Works Flow */}
        <HowItWorks />

        {/* Dynamic Calculator Panel */}
        <Calculator
          onBook={(config) =>
            handleOpenBooking(config.console, config.duration, config.accessories, config.total)
          }
        />

        {/* Frequently Asked Questions */}
        <FAQ />
      </main>

      {/* Footer Section */}
      <footer className="bg-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-gamebees-pink-accent select-none">
                GAME<span className="text-white">BEES</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/50">
              <a href="#consoles" className="hover:text-white transition-colors">
                Consoles
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#estimator" className="hover:text-white transition-colors">
                Price Estimator
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQs
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/40 text-center sm:text-left">
            <span>© {new Date().getFullYear()} GameBees Rental. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Form Overlay */}
      <BookingModal
        isOpen={booking.isOpen}
        onClose={handleCloseBooking}
        initialConsoleName={booking.consoleName}
        initialDuration={booking.duration}
        initialAccessories={booking.accessories}
        initialTotal={booking.total}
      />
    </div>
  );
}
