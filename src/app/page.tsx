"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ShoppingBag, Check, ShieldCheck, MapPin, Truck, Smartphone, Terminal } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BookingModal from "@/components/landing/BookingModal";

// --- Scroll Reveal ---
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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${isRevealed ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}

// --- Gear Loadout ---
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
  const [phoneStep, setPhoneStep] = useState(0);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setPhoneStep((prev) => (prev + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phoneStep === 0) {
      setTypingText("");
      const text = "Charan Sai";
      let index = 0;
      const typeTimer = setInterval(() => {
        if (index < text.length) {
          setTypingText((prev) => prev + text.charAt(index));
          index++;
        } else clearInterval(typeTimer);
      }, 1500 / text.length);
      return () => clearInterval(typeTimer);
    }
  }, [phoneStep]);

  const handleToggleGear = (gearId: string) => {
    if (gearId === "ps5") return;
    setSelectedGear((prev) =>
      prev.includes(gearId) ? prev.filter((id) => id !== gearId) : [...prev, gearId]
    );
  };

  const calculateDailyPrice = () =>
    GEAR_OPTIONS.reduce((acc, item) => (selectedGear.includes(item.id) ? acc + item.price : acc), 0);

  const currentDailyTotal = calculateDailyPrice();

  const handleOpenBooking = (title: string, dailyPrice: number) => {
    setBooking({ isOpen: true, consoleName: title, duration: 3, total: dailyPrice * 3 });
  };

  const handleCloseBooking = () => {
    setBooking((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#141414] text-white selection:bg-gamebees-accent-blue selection:text-white relative overflow-x-hidden">
      
      {/* ================================================================
          SCATTERED GLOW BACKDROPS (Very diffuse, smooth opacity falloffs to prevent color banding)
          ================================================================ */}
      
      {/* Glow Spot 1: Under the Choose Your Loadout Section */}
      <div 
        className="absolute w-[600px] h-[600px] left-[-200px] top-[95vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.16) 0%, rgba(29, 73, 107, 0.05) 45%, transparent 75%)",
          filter: "blur(140px)",
        }}
      ></div>

      <div 
        className="absolute w-[500px] h-[500px] right-[-100px] top-[145vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.12) 0%, rgba(36, 101, 150, 0.03) 45%, transparent 75%)",
          filter: "blur(120px)",
        }}
      ></div>

      {/* Glow Spot 2: Behind Mobile Mockup Section */}
      <div 
        className="absolute w-[700px] h-[700px] right-[-250px] top-[225vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.18) 0%, rgba(29, 73, 107, 0.06) 50%, transparent 80%)",
          filter: "blur(150px)",
        }}
      ></div>

      <div 
        className="absolute w-[550px] h-[550px] left-[-150px] top-[285vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.14) 0%, rgba(36, 101, 150, 0.04) 45%, transparent 75%)",
          filter: "blur(130px)",
        }}
      ></div>

      {/* Glow Spot 3: Centered behind CTA Zone */}
      <div 
        className="absolute w-[800px] h-[500px] left-1/2 -translate-x-1/2 top-[345vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(36, 101, 150, 0.22) 0%, rgba(94, 159, 208, 0.08) 40%, rgba(29, 73, 107, 0.02) 65%, transparent 90%)",
          filter: "blur(130px)",
        }}
      ></div>

      {/* Navbar & Hero */}
      <Navbar onRentClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)} />
      <Hero onRentClick={() => handleOpenBooking("PlayStation 5 Pro Console", 12)} />

      <main className="flex-1 relative z-10">

        {/* ================================================================
            SECTION 1: CHOOSE YOUR LOADOUT
            ================================================================ */}
        <section className="relative">
          <RevealSection className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              
              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-gamebees-glow-blue">
                  CHOOSE YOUR LOADOUT
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Pick Your Choice
                </h2>
                <p className="text-gamebees-accent-lavender/40 text-sm sm:text-base font-light max-w-lg mx-auto">
                  Pick any of your choice of combination at reasonable prices. Custom setup made for you.
                </p>
              </div>

              {/* Selector Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
                
                {/* Left — Gear checklist */}
                <div className="space-y-3.5">
                  {GEAR_OPTIONS.map((item) => {
                    const isChecked = selectedGear.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleGear(item.id)}
                        className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-400 cursor-pointer select-none ${
                          isChecked
                            ? "bg-gradient-to-r from-gamebees-dark-navy/20 to-transparent border-gamebees-accent-blue/35 shadow-[inset_0_0_12px_rgba(94,159,208,0.04)]"
                            : "bg-white/[0.015] border-white/[0.04] opacity-50 hover:opacity-85 hover:border-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-gamebees-accent-blue border-gamebees-accent-blue text-white"
                              : "border-white/15"
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-white">{item.name}</span>
                            {item.required && (
                              <span className="text-[9px] uppercase tracking-wider text-gamebees-glow-blue font-semibold">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-white group-hover:text-gamebees-glow-blue transition-colors">${item.price}</span>
                          <span className="text-[10px] text-white/25 block">/ day</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right — Configuration summary card */}
                <div className="card-polished p-7 sm:p-8 flex flex-col gap-5 relative">
                  
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider border-b border-white/[0.05] pb-4">
                    Your Configuration
                  </h3>

                  <div className="space-y-3 my-1">
                    {GEAR_OPTIONS.map((item) => {
                      if (!selectedGear.includes(item.id)) return null;
                      return (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gamebees-accent-lavender/40 font-light">{item.name}</span>
                          <span className="text-white font-semibold">${item.price}/day</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gamebees-accent-blue/20 to-transparent"></div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-[10px] uppercase text-gamebees-accent-lavender/30 font-semibold tracking-wider block">
                        Combined Rate
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-black text-gamebees-glow-blue">${currentDailyTotal}</span>
                        <span className="text-xs text-white/20 font-light">/ day</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenBooking(`Custom Loadout Bundle (${selectedGear.length} Items)`, currentDailyTotal)}
                      className="btn-glow-pill px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      <span>Book Loadout</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </RevealSection>
        </section>

        {/* ================================================================
            SECTION 2: QUICK & EASY BOOKING
            ================================================================ */}
        <section className="relative">
          <RevealSection className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-5xl mx-auto">
                
                {/* Left — Text */}
                <div className="space-y-6 text-center lg:text-left">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-medium text-gamebees-glow-blue">
                    MOBILE TRACKING & DISPATCH
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                    Quick & Easy<br />Booking
                  </h2>
                  <p className="text-gamebees-accent-lavender/40 text-sm sm:text-base leading-relaxed font-light max-w-md mx-auto lg:mx-0">
                    Book from your mobile and track delivery in real-time. No complicated setups, zero deposits, continuous updates.
                  </p>

                  {/* Steps */}
                  <div className="space-y-5 pt-4 text-left max-w-md mx-auto lg:mx-0">
                    <div className="flex gap-4 items-start group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gamebees-dark-navy/60 to-gamebees-medium-blue/20 border border-gamebees-accent-blue/35 flex items-center justify-center text-gamebees-glow-blue flex-shrink-0">
                        <Smartphone className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">1. Reserve Instantly</span>
                        <span className="text-xs text-gamebees-accent-lavender/30 font-light leading-relaxed">Select loadout, specify dates, and book in 15 seconds.</span>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gamebees-dark-navy/60 to-gamebees-medium-blue/20 border border-gamebees-accent-blue/35 flex items-center justify-center text-gamebees-glow-blue flex-shrink-0">
                        <Truck className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">2. Track Delivery Route</span>
                        <span className="text-xs text-gamebees-accent-lavender/30 font-light leading-relaxed">Observe the courier route from our hub directly to your coordinates.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — Phone Mockup */}
                <div className="flex justify-center">
                  <div className="relative w-[280px] h-[550px] rounded-[40px] overflow-hidden select-none"
                    style={{
                      background: "rgba(20, 20, 20, 0.6)",
                      border: "1px solid rgba(94, 159, 208, 0.15)"
                    }}
                  >
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#141414] rounded-b-2xl z-20"></div>

                    {/* Phone Screen */}
                    <div className="relative h-full p-4 pt-8 flex flex-col justify-between">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center text-[10px] text-white/25 border-b border-white/[0.04] pb-2">
                        <span className="font-semibold text-white/50 tracking-wider text-[9px]">GAMEBEES</span>
                        <span>12:54 PM</span>
                      </div>

                      {/* Screen Content */}
                      <div className="flex-1 flex flex-col justify-center py-4">
                        
                        {phoneStep === 0 && (
                          <div className="space-y-4 animate-fadeInUp">
                            <h4 className="text-xs font-semibold text-white text-center mb-4">Submit Rental Booking</h4>
                            <div className="space-y-1.5">
                              <label className="text-[8px] text-white/25 block uppercase tracking-wider">Full Name</label>
                              <div className="h-9 w-full bg-gamebees-dark-navy/20 border border-white/[0.05] rounded-lg flex items-center px-3 text-[10px]">
                                <span className="text-white/70">{typingText}</span>
                                <span className="h-3.5 w-[1px] bg-gamebees-glow-blue/50 ml-0.5 animate-pulse"></span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8px] text-white/25 block uppercase tracking-wider">Rental Item</label>
                              <div className="h-9 w-full bg-gamebees-dark-navy/20 border border-white/[0.05] rounded-lg flex items-center px-3 text-[10px] text-white/40">
                                PS5 Pro Bundle
                              </div>
                            </div>
                            <button className="w-full py-2.5 bg-gradient-to-r from-gamebees-accent-blue/80 to-gamebees-medium-blue/60 rounded-lg text-[10px] font-semibold text-white mt-3 text-center">
                              Book Gear
                            </button>
                          </div>
                        )}

                        {phoneStep === 1 && (
                          <div className="space-y-4 text-center animate-fadeInUp">
                            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gamebees-dark-navy/50 to-gamebees-medium-blue/20 border border-gamebees-accent-blue/30 flex items-center justify-center text-gamebees-glow-blue">
                              <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-white">Order Confirmed!</h4>
                              <span className="text-[9px] text-white/25 block mt-1">Receipt ID: #GB-89240</span>
                            </div>
                            <div className="p-3 bg-gamebees-dark-navy/15 border border-white/[0.04] rounded-xl text-left text-[9px] text-white/35 space-y-1.5">
                              <div className="flex justify-between"><span className="font-semibold text-white/50">Console:</span><span>PS5 Pro Bundle</span></div>
                              <div className="flex justify-between"><span>Duration:</span><span>3 Days</span></div>
                              <div className="flex justify-between font-semibold text-white border-t border-white/[0.04] pt-1.5 mt-1"><span>Total:</span><span>$36</span></div>
                            </div>
                          </div>
                        )}

                        {phoneStep === 2 && (
                          <div className="space-y-3 animate-fadeInUp flex flex-col h-full justify-between">
                            <div className="text-center">
                              <h4 className="text-[10px] font-semibold text-white">Live Tracking</h4>
                              <span className="text-[8px] text-gamebees-glow-blue/60 font-semibold uppercase tracking-wider block mt-0.5">EN ROUTE • SAME DAY</span>
                            </div>
                            <div className="flex-1 bg-gamebees-dark-navy/12 border border-white/[0.04] rounded-xl my-2 overflow-hidden relative">
                              <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 150">
                                <path d="M 30,120 Q 80,40 120,90 T 170,30" fill="none" stroke="rgba(94, 159, 208, 0.25)" strokeWidth="2" strokeDasharray="4 3" />
                              </svg>
                              <div className="absolute bottom-[18px] left-[22px] flex flex-col items-center">
                                <div className="h-4 w-4 rounded-full bg-gamebees-dark-navy/40 flex items-center justify-center border border-white/[0.08]"><Terminal className="h-2 w-2 text-white/30" /></div>
                                <span className="text-[6px] text-white/20 mt-0.5">Hub</span>
                              </div>
                              <div className="absolute top-[75px] left-[85px] p-1.5 bg-gamebees-accent-blue/70 rounded-lg text-white animate-bounce">
                                <Truck className="h-3 w-3" />
                              </div>
                              <div className="absolute top-[18px] right-[22px] flex flex-col items-center">
                                <div className="h-5 w-5 rounded-full bg-gamebees-dark-navy/40 flex items-center justify-center border border-gamebees-accent-blue/20 text-gamebees-glow-blue/80"><MapPin className="h-3 w-3" /></div>
                                <span className="text-[6px] font-semibold text-white/40 mt-0.5">You</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] border-t border-white/[0.04] pt-2 text-white/25">
                              <span>ETA: <strong className="text-white/60">15 Mins</strong></span>
                              <span>Distance: <strong className="text-white/60">2.4 mi</strong></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom nav */}
                      <div className="flex justify-around items-center border-t border-white/[0.04] pt-3 text-[8px] text-white/20">
                        <span className={phoneStep === 0 ? "text-gamebees-glow-blue font-semibold" : ""}>Book</span>
                        <span className={phoneStep === 1 ? "text-gamebees-glow-blue font-semibold" : ""}>Status</span>
                        <span className={phoneStep === 2 ? "text-gamebees-glow-blue font-semibold" : ""}>Track</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ================================================================
            SECTION 3: CTA — BOOK NOW
            ================================================================ */}
        <section className="relative">
          <RevealSection className="py-24 sm:py-32">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
              <div className="card-gradient-border p-12 sm:p-16 lg:p-20 flex flex-col items-center justify-center gap-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-gamebees-glow-blue block">
                  READY TO EXPERIENCE POWER
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Secure Your Loadout<br />Today
                </h2>
                <p className="max-w-md text-sm text-gamebees-accent-lavender/35 leading-relaxed font-light">
                  Rent complete PS5 Pro bundles and accessories with same-day setup. Start playing instantly.
                </p>
                <button
                  onClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)}
                  className="btn-glow-pill px-8 py-4 rounded-full text-sm font-semibold flex items-center gap-2.5 mt-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Book Your Rental Now</span>
                </button>
              </div>
            </div>
          </RevealSection>
        </section>
      </main>

      {/* Footer (No border divider line, seamless page end) */}
      <footer className="py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gamebees-accent-lavender/30 font-light">
          <span>© {new Date().getFullYear()} GameBees Rental. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => handleOpenBooking("PlayStation 5 Pro Bundle", 12)}>Rentals</span>
            <span className="text-white/10">•</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</span>
          </div>
        </div>
      </footer>

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
