"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ShoppingBag, ShieldCheck, MapPin, Truck, Smartphone, Terminal, Star } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchItems } from "@/app/actions";
import { addToCart } from "@/lib/cart";

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

const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: "ps5-pro-bundle",
    name: "PlayStation 5 Pro Console Bundle",
    category: "Console",
    price: 499,
    image_url: "/ps5.png",
    description: "Next-gen PS5 Pro console with ultra-high-speed SSD, preloaded PS Plus games, and 1 DualSense controller."
  },
  {
    id: "dualsense-extra",
    name: "Extra DualSense Wireless Controller",
    category: "Controller",
    price: 149,
    image_url: "/controller.png",
    description: "Haptic feedback, dynamic adaptive triggers, and built-in microphone for instant multiplayer action."
  },
  {
    id: "pulse-3d-headset",
    name: "Pulse 3D Wireless Headset",
    category: "Audio",
    price: 119,
    image_url: "/controller.png",
    description: "3D audio tailored for PS5 console gaming with dual noise-cancelling microphones and refined earpads."
  }
];

export default function Home() {
  const router = useRouter();
  const [phoneStep, setPhoneStep] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemDurations, setItemDurations] = useState<Record<string, number>>({});
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    fetchItems().then((itemsRes) => {
      if (itemsRes.success && itemsRes.data && itemsRes.data.length > 0) {
        setDbProducts(itemsRes.data);
      } else {
        setDbProducts(DEFAULT_FALLBACK_PRODUCTS);
      }
      setLoadingItems(false);
    }).catch(() => {
      setDbProducts(DEFAULT_FALLBACK_PRODUCTS);
      setLoadingItems(false);
    });
  }, []);

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

  const handleAddToCart = (prod: any) => {
    const duration = itemDurations[prod.id] ?? 3;
    addToCart({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: Number(prod.price) || 0,
      price_3_days: Number(prod.price_3_days) || undefined,
      price_extra_day: Number(prod.price_extra_day) || undefined,
      image_url: prod.image_url || (Array.isArray(prod.image_urls) ? prod.image_urls[0] : undefined),
      duration,
    });
    setCartNotice(`${prod.name} added to cart (${duration} days)`);
    window.setTimeout(() => setCartNotice(""), 2600);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gamebees-bg selection:bg-gamebees-accent-blue selection:text-white relative overflow-x-hidden">
      {cartNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/30 bg-[#0f1b16]/95 px-4 py-3 shadow-2xl backdrop-blur-md text-xs text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{cartNotice}</span>
        </div>
      )}
      
      {/* Background glow effects */}
      <div 
        className="absolute w-[600px] h-[600px] left-[-200px] top-[95vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.16) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(140px)",
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] right-[-100px] top-[145vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.12) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(120px)",
        }}
      />
      <div 
        className="absolute w-[700px] h-[700px] right-[-250px] top-[225vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.18) 0%, rgba(20, 20, 20, 0) 80%)",
          filter: "blur(150px)",
        }}
      />

      {/* Navbar & Hero */}
      <Navbar />
      <Hero />

      <main className="flex-1 relative z-10">

        {/* ================================================================
            SECTION 1: PRODUCT CATALOGUE (CHOOSE YOUR LOADOUT)
            ================================================================ */}
        <section id="loadout-section" className="relative py-20 sm:py-28">
          <RevealSection>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              
              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-gamebees-glow-blue">
                  CHOOSE YOUR LOADOUT
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Available Gear & Stations
                </h2>
                <p className="text-gamebees-accent-lavender/40 text-sm sm:text-base font-light max-w-lg mx-auto">
                  Select your rental period, customize your setup, and add directly to your cart with zero security deposit.
                </p>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {dbProducts.map((prod) => {
                  const currentDays = itemDurations[prod.id] ?? 3;
                  return (
                    <div
                      key={prod.id}
                      className="card-polished p-5 flex flex-col justify-between border border-white/[0.04] group hover:border-gamebees-accent-blue/40 transition-all duration-400 rounded-2xl"
                    >
                      <div className="space-y-4">
                        {/* Product Image */}
                        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black/40 border border-white/5 group-hover:border-gamebees-accent-blue/30 transition-all flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.image_url || (Array.isArray(prod.image_urls) && prod.image_urls[0]) || "/ps5.png"}
                            alt={prod.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/ps5.png";
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-gamebees-glow-blue bg-gamebees-dark-navy/85 backdrop-blur-md border border-gamebees-accent-blue/30 px-2.5 py-1 rounded-full shadow-md">
                              {prod.category || "Console"}
                            </span>
                          </div>
                          {Array.isArray(prod.image_urls) && prod.image_urls.length > 1 && (
                            <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-0.5 rounded-md border border-white/10 shadow-sm">
                              📷 {prod.image_urls.length} Photos
                            </div>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <Link href={`/product/${prod.id}`} className="text-base font-bold text-white group-hover:text-gamebees-glow-blue transition-colors truncate hover:underline">
                              {prod.name}
                            </Link>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-black text-gamebees-glow-blue">₹{prod.price}</span>
                              <span className="text-[9px] text-white/40 block">/ day</span>
                            </div>
                          </div>
                          <p className="text-xs text-white/50 font-light leading-relaxed line-clamp-2">
                            {prod.description || "High-performance setup preloaded with popular titles and active controller accessories."}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Duration Selector + Add to Cart */}
                      <div className="mt-5 space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gamebees-glow-blue">Select Rental Duration</p>
                            <span className="text-[9px] text-white/40">{currentDays} days selected</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[3, 7, 14, 30].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => setItemDurations(prev => ({ ...prev, [prod.id]: days }))}
                                className={`py-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  currentDays === days
                                    ? "bg-gamebees-accent-blue border-gamebees-accent-blue text-white shadow-sm"
                                    : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5"
                                }`}
                              >
                                {days}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <Link
                            href={`/product/${prod.id}`}
                            className="w-full py-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/80 flex items-center justify-center transition-all text-center"
                          >
                            View Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            className="w-full py-3 bg-gradient-to-r from-gamebees-accent-blue/80 to-gamebees-medium-blue/60 hover:from-gamebees-accent-blue hover:to-gamebees-medium-blue border border-gamebees-accent-blue/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(36,101,150,0.25)] cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all button if more listings */}
              <div className="text-center mt-12">
                <Link
                  href="/dashboard"
                  className="btn-glow-pill inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold"
                >
                  <span>Explore Full Warehouse Inventory</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          </RevealSection>
        </section>

        {/* ================================================================
            SECTION 2: QUICK & EASY BOOKING
            ================================================================ */}
        <section className="relative border-t border-white/[0.04]">
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
                        <span className="text-xs text-gamebees-accent-lavender/30 font-light leading-relaxed">Select loadout, specify duration, and add to cart in seconds.</span>
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
                  <div className="relative w-[280px] h-[550px] rounded-[40px] overflow-hidden select-none dark-theme-container"
                    style={{
                      background: "rgba(20, 20, 20, 0.6)",
                      border: "1px solid rgba(94, 159, 208, 0.15)"
                    }}
                  >
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gamebees-bg rounded-b-2xl z-20"></div>

                    {/* Phone Screen */}
                    <div className="relative h-full p-4 pt-8 flex flex-col justify-between">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center text-[10px] text-white/25 border-b border-white/[0.04] pb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-3 w-auto object-contain opacity-50 select-none" />
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
                              Add to Cart
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
                              <div className="flex justify-between font-semibold text-white border-t border-white/[0.04] pt-1.5 mt-1"><span>Total:</span><span>₹36</span></div>
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
            SECTION 3: CTA — EXPLORE LISTINGS
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
                <Link
                  href="/dashboard"
                  className="btn-glow-pill px-8 py-4 rounded-full text-sm font-semibold flex items-center gap-2.5 mt-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Browse Available Gear</span>
                </Link>
              </div>
            </div>
          </RevealSection>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gamebees-accent-lavender/30 font-light">
          <span>© {new Date().getFullYear()} GameBees Rental. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-white/60 transition-colors font-semibold">Rentals</Link>
            <span className="text-white/10">•</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
