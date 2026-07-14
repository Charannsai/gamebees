"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Terminal } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import BookingModal from "@/components/landing/BookingModal";

interface ProductData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  specs: string[];
  widthClass: string;
  cardName: string;
}

const PRODUCTS: Record<string, ProductData> = {
  ps5: {
    id: "ps5-pro",
    name: "PlayStation 5 Pro Bundle",
    subtitle: "Play Has No Limits",
    description: "Next-generation PS5 Pro console and haptic accessories, redefining how you see, feel, and interact with virtual worlds.",
    price: 12,
    image: "/ps5.png",
    specs: ["2TB SSD Storage", "4K 120Hz Output", "2 Haptic Controllers", "Liquid Metal Cooling"],
    widthClass: "w-[48%] h-[82%]",
    cardName: "Active PS5 Pro Bundle",
  },
  controller: {
    id: "dualsense-extra",
    name: "DualSense Extra Controller",
    subtitle: "Feel the Action",
    description: "Immersive DualSense control with haptic feedback, adaptive triggers, and built-in mic that changes how you feel games.",
    price: 3,
    image: "/controller.png",
    specs: ["Dynamic Haptics", "Adaptive Triggers", "Charging Dock Included", "Sanitized & Sealed"],
    widthClass: "w-[60%] h-[50%]",
    cardName: "DualSense Wireless Extra",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("ps5");
  const [booking, setBooking] = useState({
    isOpen: false,
    consoleName: "PlayStation 5 Pro Bundle",
    duration: 3,
    total: 36,
  });

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Handle 3D Tilt on Mouse Move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const rotateY = ((e.clientX / width) - 0.5) * 25; // Tilt Y (-12.5 to 12.5 deg)
      const rotateX = ((e.clientY / height) - 0.5) * -25; // Tilt X (-12.5 to 12.5 deg)
      setTilt({ rotateX, rotateY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const activeProduct = PRODUCTS[activeTab] || PRODUCTS.ps5;

  const handleOpenBooking = (product: ProductData) => {
    setBooking({
      isOpen: true,
      consoleName: product.name,
      duration: 3,
      total: product.price * 3,
    });
  };

  const handleCloseBooking = () => {
    setBooking((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black text-white selection:bg-gamebees-accent-blue selection:text-white grainy-overlay overflow-hidden relative">
      
      {/* 1. Navbar */}
      <Navbar 
        onRentClick={() => handleOpenBooking(activeProduct)} 
        activeSection={activeTab}
        onSectionChange={(section) => setActiveTab(section)}
      />

      {/* 2. Main Hero / Interactive 3D Stage Section */}
      <main className="flex-1 flex items-center justify-center relative py-12 px-6 lg:px-8">
        
        {/* Cinematic Dual Glow Auras (Warm vs. Cool) */}
        <div className="absolute top-[48%] left-[26%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full warm-aura opacity-70 z-0 pointer-events-none"></div>
        <div className="absolute top-[42%] left-[62%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full cool-aura opacity-80 z-0 pointer-events-none"></div>
        
        {/* Neon Ring Backdrop */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full neon-ring opacity-25 z-0 pointer-events-none"></div>

        {/* Starburst Conic Gradient Rays */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] starburst-rays opacity-55 z-0 animate-pulse-slow pointer-events-none"></div>

        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative pointer-events-none">
          
          {/* LEFT COLUMN: Stacked Bold Typography (Inspired by Reference Design) */}
          <div className="lg:col-span-4 flex flex-col justify-center text-center lg:text-left pointer-events-auto">
            <div className="flex flex-col text-[48px] sm:text-[64px] md:text-[80px] font-light leading-[0.9] tracking-tight uppercase select-none text-white/95">
              <span>Beyond</span>
              <span className="font-extrabold text-white">gaming</span>
              <span>beyond</span>
              <span className="font-extrabold text-gamebees-accent-blue">limits</span>
              <span>beyond</span>
            </div>
            
            {/* Specs mini logs */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              {activeProduct.specs.slice(0, 2).map((spec, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5 text-[10px] text-white/50 font-medium">
                  <Terminal className="h-3 w-3 text-gamebees-accent-blue" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE COLUMN: Giant 3D Display Stage */}
          <div className="lg:col-span-5 flex justify-center items-center h-[420px] sm:h-[500px] relative overflow-visible">
            
            {/* Main Active 3D Render Image Container */}
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-visible"
              style={{ perspective: "1200px" }}
            >
              {/* Particle Sparks Trailing Effect */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                {/* Gold spark 1 */}
                <div className="absolute top-[25%] left-[28%] w-1.5 h-1.5 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800] animate-float opacity-75"></div>
                {/* Magenta spark 2 */}
                <div className="absolute top-[18%] right-[24%] w-2 h-2 rounded-full bg-[#D11AFF] shadow-[0_0_10px_#D11AFF] animate-float opacity-60" style={{ animationDelay: "1.5s" }}></div>
                {/* Gold spark 3 */}
                <div className="absolute bottom-[28%] left-[22%] w-1 h-1 rounded-full bg-[#FFB800] shadow-[0_0_6px_#FFB800] animate-float opacity-80" style={{ animationDelay: "0.8s" }}></div>
                {/* Magenta spark 4 */}
                <div className="absolute bottom-[24%] right-[20%] w-1.5 h-1.5 rounded-full bg-[#D11AFF] shadow-[0_0_8px_#D11AFF] animate-float opacity-50" style={{ animationDelay: "2.2s" }}></div>
                {/* Small gold spark 5 */}
                <div className="absolute top-[48%] left-[16%] w-1 h-1 rounded-full bg-[#FFB800] shadow-[0_0_5px_#FFB800] animate-float opacity-90" style={{ animationDelay: "1.9s" }}></div>
              </div>

              <div
                className="relative transition-all duration-700 ease-out filter drop-shadow-[0_20px_50px_rgba(91,59,245,0.4)] flex items-center justify-center z-10"
                style={{
                  transform: `rotateY(${tilt.rotateY}deg) rotateX(${tilt.rotateX}deg) translateZ(50px)`,
                  width: "100%",
                  height: "100%",
                  willChange: "transform",
                }}
              >
                <div className={`relative ${activeProduct.widthClass} transition-all duration-500`}>
                  <Image
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Description & Floating Layout Details */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center text-center lg:text-right pointer-events-auto space-y-6">
            
            {/* Right Sub-Description */}
            <p className="max-w-[280px] text-xs sm:text-sm text-gamebees-accent-lavender leading-relaxed font-light">
              {activeProduct.description}
            </p>

            {/* Float Card: Inspired directly by active-glass info panel in the monitor */}
            <div className="w-full max-w-[280px] card-polished p-4 sm:p-5 flex flex-col gap-4 text-left select-none relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gamebees-accent-blue/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 block font-bold">New Collection</span>
                  <span className="text-xs font-bold text-white block truncate max-w-[160px]">{activeProduct.cardName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                {/* Neon Blue Price Pill */}
                <div className="bg-white/5 border border-white/10 text-white/90 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wide shadow-sm">
                  ${activeProduct.price}/day
                </div>
                <button
                  onClick={() => handleOpenBooking(activeProduct)}
                  className="btn-glow-pill px-5 py-2.5 rounded-full text-[10px] font-bold tracking-wide shadow-md flex items-center gap-1.5 group/btn"
                >
                  <span>Rent Now</span>
                  <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Thumbnails to toggle active items (bottom-left area in the screen) */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => setActiveTab("ps5")}
                className={`relative h-12 w-12 rounded-xl border p-1.5 flex items-center justify-center transition-all ${
                  activeTab === "ps5"
                    ? "bg-white/[0.04] border-gamebees-accent-blue/60 scale-105"
                    : "bg-white/[0.01] border-white/5 opacity-50 hover:opacity-100"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/ps5.png"
                    alt="PS5 Thumbnail"
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
              <button
                onClick={() => setActiveTab("controller")}
                className={`relative h-12 w-12 rounded-xl border p-1.5 flex items-center justify-center transition-all ${
                  activeTab === "controller"
                    ? "bg-white/[0.04] border-gamebees-accent-blue/60 scale-105"
                    : "bg-white/[0.01] border-white/5 opacity-50 hover:opacity-100"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/controller.png"
                    alt="Controller Thumbnail"
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="py-8 border-t border-white/5 z-10 pointer-events-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/30">
          <span>© {new Date().getFullYear()} GameBees Rental. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => handleOpenBooking(activeProduct)}>Rentals</span>
            <span>•</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</span>
          </div>
        </div>
      </footer>

      {/* Booking Form Overlay */}
      <BookingModal
        isOpen={booking.isOpen}
        onClose={handleCloseBooking}
        initialConsoleName={booking.consoleName}
        initialDuration={booking.duration}
        initialTotal={booking.total}
      />
    </div>
  );
}
