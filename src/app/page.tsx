"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ShoppingBag, Check, ShieldCheck, MapPin, Truck, Smartphone, Terminal } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BookingModal from "@/components/landing/BookingModal";

// --- Scroll Reveal Helper Component ---
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isRevealed ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// --- Gear Loadout Types & Options ---
interface GearItem {
  id: string;
  name: string;
  price: number;
  image: string;
  required?: boolean;
}

const GEAR_OPTIONS: GearItem[] = [
  { id: "ps5", name: "PlayStation 5 Pro Console", price: 12, image: "/ps5.png", required: true },
  { id: "controller", name: "Extra DualSense Controller", price: 3, image: "/controller.png" },
  { id: "headset", name: "Pulse 3D Wireless Headset", price: 2, image: "/controller.png" },
  { id: "case", name: "Premium Travel Case", price: 1, image: "/ps5.png" }
];

export default function Home() {
  const [selectedGear, setSelectedGear] = useState<string[]>(["ps5"]);
  const [booking, setBooking] = useState({
    isOpen: false,
    consoleName: "PlayStation 5 Pro Bundle",
    duration: 3,
    total: 36,
  });

  // Mobile App Simulation State
  const [phoneStep, setPhoneStep] = useState(0);
  const [typingText, setTypingText] = useState("");

  // Cycle Phone Screen Animations
  useEffect(() => {
    const interval = setInterval(() => {
      setPhoneStep((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animate Typing during Step 0
  useEffect(() => {
    if (phoneStep === 0) {
      setTypingText("");
      const text = "Charan Sai";
      let index = 0;
      const typeTimer = setInterval(() => {
        if (index < text.length) {
          setTypingText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(typeTimer);
        }
      }, 1500 / text.length);

      return () => clearInterval(typeTimer);
    }
  }, [phoneStep]);

  // Handle loadout checkbox changes
  const handleToggleGear = (gearId: string) => {
    if (gearId === "ps5") return; // console is required
    setSelectedGear((prev) =>
      prev.includes(gearId) ? prev.filter((id) => id !== gearId) : [...prev, gearId]
    );
  };

  // Calculate dynamic loadout daily price
  const calculateDailyPrice = () => {
    return GEAR_OPTIONS.reduce((acc, item) => {
      return selectedGear.includes(item.id) ? acc + item.price : acc;
    }, 0);
  };

  const currentDailyTotal = calculateDailyPrice();

  const handleOpenBooking = (title: string, dailyPrice: number) => {
    setBooking({
      isOpen: true,
      consoleName: title,
      duration: 3,
      total: dailyPrice * 3,
    });
  };

  const handleCloseBooking = () => {
    setBooking((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gamebees-bg text-white selection:bg-gamebees-accent-blue selection:text-white relative">
      
      {/* Navbar */}
      <Navbar onRentClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)} />

      {/* Hero */}
      <Hero onRentClick={() => handleOpenBooking("PlayStation 5 Pro Console", 12)} />

      {/* ============================================================
          SECTION 1: CHOOSE YOUR LOADOUT
          Background: subtle dark-to-blue fade
          ============================================================ */}
      <main className="flex-1">
        <RevealSection className="py-28 relative section-fade-blue">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-gamebees-glow-blue/70">
                CHOOSE YOUR LOADOUT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Pick Your Choice
              </h2>
              <p className="text-white/35 text-sm font-light max-w-lg mx-auto">
                Pick any of your choice of combination at reasonable prices. Custom setup made for you.
              </p>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
              
              {/* Left Selector Controls */}
              <div className="lg:col-span-6 space-y-3">
                {GEAR_OPTIONS.map((item) => {
                  const isChecked = selectedGear.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleGear(item.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                        isChecked
                          ? "bg-white/[0.03] border-gamebees-accent-blue/30"
                          : "bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox circle */}
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-gamebees-accent-blue border-gamebees-accent-blue text-white"
                            : "border-white/15"
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-sm font-semibold block text-white">{item.name}</span>
                          {item.required && <span className="text-[10px] text-gamebees-glow-blue/60 font-semibold">REQUIRED</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white/90">${item.price}</span>
                        <span className="text-[10px] text-white/30 block">/ day</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Showcase Card */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-md card-polished p-8 flex flex-col gap-6 relative">

                  <h3 className="text-base font-bold text-white border-b border-white/[0.04] pb-4">
                    Your Configuration
                  </h3>

                  {/* Selected items list */}
                  <div className="space-y-3.5 my-2">
                    {GEAR_OPTIONS.map((item) => {
                      if (!selectedGear.includes(item.id)) return null;
                      return (
                        <div key={item.id} className="flex justify-between items-center text-xs text-white/40 font-light">
                          <span>{item.name}</span>
                          <span className="text-white font-semibold">${item.price}/day</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-px bg-white/[0.06] my-1"></div>

                  {/* Summary Rate */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase text-white/30 font-semibold block">Combined Rate</span>
                      <span className="text-2xl font-black text-gamebees-glow-blue">${currentDailyTotal}</span>
                      <span className="text-[10px] text-white/25"> / day</span>
                    </div>
                    <button
                      onClick={() => handleOpenBooking(`Custom Loadout Bundle (${selectedGear.length} Items)`, currentDailyTotal)}
                      className="btn-glow-pill px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Book Loadout</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </RevealSection>

        {/* ============================================================
            SECTION 2: QUICK & EASY BOOKING (Mobile mockup)
            Background: deeper blue tint
            ============================================================ */}
        <RevealSection className="py-28 relative section-deep-blue">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center max-w-5xl mx-auto">
              
              {/* Left Column: Descriptive text */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-gamebees-glow-blue/70">
                  MOBILE TRACKING & DISPATCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Quick & Easy Booking
                </h2>
                <p className="text-white/35 text-sm sm:text-base leading-relaxed font-light">
                  You can just book from your mobile and track the delivery in real-time. No complicated setups, zero deposits, and continuous updates.
                </p>

                {/* Tracking Steps list */}
                <div className="space-y-5 pt-4 text-left max-w-md mx-auto lg:mx-0">
                  <div className="flex gap-4 items-start">
                    <div className="h-9 w-9 rounded-lg bg-gamebees-dark-navy/60 border border-white/[0.06] flex items-center justify-center text-gamebees-glow-blue/70 flex-shrink-0">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">1. Reserve Instantly</span>
                      <span className="text-[11px] text-white/30 font-light">Select loadout, specify dates, and book in 15 seconds.</span>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-9 w-9 rounded-lg bg-gamebees-dark-navy/60 border border-white/[0.06] flex items-center justify-center text-gamebees-glow-blue/70 flex-shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">2. Track Delivery Route</span>
                      <span className="text-[11px] text-white/30 font-light">Observe the courier route from our hub directly to your coordinates.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup Simulation */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-[280px] h-[540px] bg-gamebees-bg border border-white/[0.08] rounded-[36px] overflow-hidden p-3 flex flex-col justify-between select-none">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-white/10 rounded-b-2xl z-20"></div>

                  {/* Phone Screen Area */}
                  <div className="relative flex-1 rounded-[28px] overflow-hidden bg-gamebees-dark-navy/40 p-4 flex flex-col justify-between border border-white/[0.04]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center text-[10px] text-white/30 pt-2 border-b border-white/[0.04] pb-2">
                      <span className="font-semibold text-white/60">GAMEBEES App</span>
                      <span>12:54 PM</span>
                    </div>

                    {/* SCREEN FLOW CONTENT */}
                    <div className="flex-1 flex flex-col justify-center py-4">
                      
                      {/* Step 0: Typing form simulation */}
                      {phoneStep === 0 && (
                        <div className="space-y-4 animate-fadeInUp">
                          <h4 className="text-xs font-semibold text-white text-center mb-4">Submit Rental Booking</h4>
                          <div className="space-y-2">
                            <label className="text-[8px] text-white/30 block">FULL NAME</label>
                            <div className="h-9 w-full bg-white/[0.02] border border-white/[0.06] rounded-lg flex items-center px-3 text-[10px]">
                              <span>{typingText}</span>
                              <span className="h-4 w-[1px] bg-gamebees-glow-blue/60 ml-0.5 animate-pulse"></span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] text-white/30 block">RENTAL ITEM</label>
                            <div className="h-9 w-full bg-white/[0.02] border border-white/[0.06] rounded-lg flex items-center px-3 text-[10px] text-white/50">
                              <span>PS5 Pro Bundle</span>
                            </div>
                          </div>
                          <button className="w-full py-2 bg-gamebees-accent-blue/50 rounded-lg text-[10px] font-semibold text-white mt-4">
                            Book Gear
                          </button>
                        </div>
                      )}

                      {/* Step 1: Confirmation success checklist screen */}
                      {phoneStep === 1 && (
                        <div className="space-y-4 text-center animate-fadeInUp">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gamebees-dark-navy/60 border border-white/[0.06] flex items-center justify-center text-gamebees-glow-blue/70">
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-white">Order Confirmed!</h4>
                            <span className="text-[9px] text-white/30 block mt-1">Receipt ID: #GB-89240</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg text-left text-[9px] text-white/40 space-y-1">
                            <div className="flex justify-between"><span className="font-semibold">Console:</span><span>PS5 Pro Bundle</span></div>
                            <div className="flex justify-between"><span>Duration:</span><span>3 Days</span></div>
                            <div className="flex justify-between font-semibold text-white border-t border-white/[0.04] pt-1.5 mt-1"><span>Total:</span><span>$36</span></div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Live Tracking map route */}
                      {phoneStep === 2 && (
                        <div className="space-y-4 animate-fadeInUp flex flex-col h-full justify-between">
                          <div className="text-center">
                            <h4 className="text-[10px] font-semibold text-white">Live Tracking courier</h4>
                            <span className="text-[8px] text-gamebees-glow-blue/60 font-semibold uppercase tracking-wider block mt-0.5">EN ROUTE • SAME DAY</span>
                          </div>

                          {/* Map Simulation SVG */}
                          <div className="flex-1 bg-white/[0.01] border border-white/[0.04] rounded-xl my-2 overflow-hidden relative flex items-center justify-center p-2">
                            <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 150">
                              <path
                                d="M 30,120 Q 80,40 120,90 T 170,30"
                                fill="none"
                                stroke="rgba(36, 101, 150, 0.2)"
                                strokeWidth="2"
                                strokeDasharray="4 3"
                              />
                            </svg>

                            {/* Warehouse Start Pin */}
                            <div className="absolute bottom-[20px] left-[25px] flex flex-col items-center">
                              <div className="h-4 w-4 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/10"><Terminal className="h-2 w-2 text-white/40" /></div>
                              <span className="text-[7px] text-white/30 mt-0.5">Hub</span>
                            </div>

                            {/* Delivery truck */}
                            <div className="absolute top-[80px] left-[85px] p-1.5 bg-gamebees-accent-blue/60 rounded-lg text-white animate-bounce">
                              <Truck className="h-3 w-3" />
                            </div>

                            {/* Home Destination Pin */}
                            <div className="absolute top-[20px] right-[25px] flex flex-col items-center">
                              <div className="h-5 w-5 rounded-full bg-gamebees-dark-navy/60 flex items-center justify-center border border-gamebees-accent-blue/20 text-gamebees-glow-blue/70"><MapPin className="h-3 w-3" /></div>
                              <span className="text-[7px] font-semibold text-white/50 mt-0.5">You</span>
                            </div>
                          </div>

                          {/* Delivery info */}
                          <div className="flex justify-between items-center text-[9px] border-t border-white/[0.04] pt-2 text-white/30">
                            <span>ETA: <strong className="text-white/70">15 Mins</strong></span>
                            <span>Distance: <strong className="text-white/70">2.4 mi</strong></span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Mobile App Tabs */}
                    <div className="flex justify-around items-center border-t border-white/[0.04] pt-3 text-[8px] text-white/25">
                      <span className={phoneStep === 0 ? "text-gamebees-glow-blue/70 font-semibold" : ""}>Book</span>
                      <span className={phoneStep === 1 ? "text-gamebees-glow-blue/70 font-semibold" : ""}>Status</span>
                      <span className={phoneStep === 2 ? "text-gamebees-glow-blue/70 font-semibold" : ""}>Track</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </RevealSection>

        {/* ============================================================
            SECTION 3: BOOK NOW CTA
            Background: deepest blue glow
            ============================================================ */}
        <RevealSection className="py-28 relative section-glow-blue">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">

            <div className="card-gradient-border p-12 sm:p-16 flex flex-col items-center justify-center gap-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-gamebees-glow-blue/70 block">
                READY TO EXPERIENCE POWER
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Secure Your Loadout Today
              </h2>
              <p className="max-w-md text-sm text-white/35 leading-relaxed font-light">
                Rent complete PS5 Pro bundles and accessories with same-day setup. Start playing instantly.
              </p>
              <button
                onClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)}
                className="btn-glow-pill px-8 py-4 rounded-full text-xs font-semibold flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Book Your Rental Now</span>
              </button>
            </div>
          </div>
        </RevealSection>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.04] pointer-events-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/30 font-light">
          <span>© {new Date().getFullYear()} GameBees Rental. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)}>Rentals</span>
            <span className="text-white/15">•</span>
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
