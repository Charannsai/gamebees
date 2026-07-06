"use client";

import React from "react";
import { Play, Sparkles, Trophy, Flame } from "lucide-react";

interface HeroProps {
  onRentClick: () => void;
}

export default function Hero({ onRentClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 lg:pb-40 bg-gamebees-bg">
      {/* Background Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full mesh-glow-pink pointer-events-none md:h-[600px] md:w-[600px]"></div>
      <div className="absolute top-0 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-gamebees-pink-highlight/5 blur-3xl pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gamebees-pink-accent/30 bg-gamebees-pink-accent/10 px-4 py-1.5 text-xs font-semibold text-gamebees-pink-accent md:text-sm animate-pulse-slow">
              <Sparkles className="h-4 w-4" />
              <span>Free Delivery & Same-Day Setup Included</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Dive into the <br />
              <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">
                future of gaming
              </span> <br />
              right now.
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-white/70 leading-relaxed">
              Why buy when you can rent? Experience the raw power of the PS5 Pro, Xbox Series X, and Nintendo Switch starting from <span className="text-white font-bold underline decoration-gamebees-pink-accent decoration-2">$9/day</span>. Loaded with premium games, ready to play.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onRentClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full btn-shiny-pink font-bold text-white transition-all duration-300"
              >
                Rent Your Console
              </button>
              <a
                href="#consoles"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:border-gamebees-pink-accent/50 hover:bg-white/5 font-semibold text-white transition-all text-center flex items-center justify-center gap-2 group"
              >
                Explore Gear
                <Play className="h-4 w-4 text-gamebees-pink-accent group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center lg:justify-start items-center gap-8 text-white/60">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
                    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80",
                  ].map((src, i) => (
                    <img
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-gamebees-bg object-cover"
                      src={src}
                      alt="User avatar"
                    />
                  ))}
                </div>
                <div className="text-left text-xs sm:text-sm">
                  <span className="font-semibold text-white block">1,500+ Gamers</span>
                  <span>Joined in your city</span>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gamebees-pink-accent" />
                <div className="text-left text-xs sm:text-sm">
                  <span className="font-semibold text-white block">Rated 4.9/5 Stars</span>
                  <span>Superfast delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Main Interactive Floating Screen/Card */}
            <div className="relative w-full max-w-sm rounded-[32px] card-glow-pink p-6 border-gamebees-pink-accent/40 shadow-[0_0_30px_rgba(232,62,140,0.15)] animate-float">
              
              {/* Top Banner inside card */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gamebees-pink-highlight/20 text-gamebees-pink-accent border border-gamebees-pink-accent/30 flex items-center gap-1.5">
                  <Flame className="h-3 w-3 animate-bounce" /> Hot Demand
                </span>
                <span className="text-xs text-white/50">STOCK: 12 Available</span>
              </div>

              {/* Glowing Console Graphic Representation */}
              <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-gamebees-bg-sec to-black overflow-hidden flex items-center justify-center border border-white/5 group">
                
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,62,140,0.25)_0%,transparent_70%)] group-hover:scale-110 transition-transform duration-500"></div>

                {/* Cyberpunk grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>

                {/* CSS Drawn Stylized PS5 Console */}
                <div className="relative w-32 h-44 flex justify-center items-center group-hover:scale-105 transition-transform duration-500">
                  {/* Left wing (White/Neon) */}
                  <div className="absolute left-0 w-8 h-full bg-gradient-to-t from-white via-white/90 to-white/40 rounded-tl-full rounded-bl-3xl border-r border-gamebees-pink-accent/40 shadow-[0_0_20px_rgba(255,255,255,0.25)]"></div>
                  
                  {/* Middle core (Black) */}
                  <div className="absolute w-12 h-[92%] bg-gradient-to-b from-zinc-800 to-black rounded-xl border-x border-white/5 flex flex-col items-center justify-between py-6 z-10">
                    <div className="w-2 h-2 rounded-full bg-gamebees-pink-accent animate-ping"></div>
                    <div className="w-1 h-12 bg-gamebees-pink-accent/80 rounded-full shadow-[0_0_10px_#E83E8C]"></div>
                  </div>

                  {/* Right wing (White/Neon) */}
                  <div className="absolute right-0 w-8 h-full bg-gradient-to-t from-white via-white/90 to-white/40 rounded-tr-full rounded-br-3xl border-l border-gamebees-pink-accent/40 shadow-[0_0_20px_rgba(255,255,255,0.25)]"></div>

                  {/* Glowing pink interior strip */}
                  <div className="absolute w-[44px] h-[95%] bg-gamebees-pink-accent opacity-75 blur-[4px] z-0 shadow-[0_0_15px_#E83E8C]"></div>
                </div>

                {/* Floating Game Badges */}
                <div className="absolute top-4 left-4 card-glow-pink px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white border-gamebees-pink-accent/30 shadow-lg">
                  🎮 GTA VI
                </div>
                <div className="absolute bottom-6 right-4 card-glow-pink px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white border-gamebees-pink-accent/30 shadow-lg">
                  ⚽ EA FC 26
                </div>
                <div className="absolute top-1/2 right-4 card-glow-pink px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white border-gamebees-pink-accent/30 shadow-lg">
                  🕷️ Spiderman 2
                </div>
              </div>

              {/* Pricing Tag Overlay */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <span className="text-xs text-white/50 block">PLAYSTATION 5 PRO</span>
                  <span className="text-lg font-bold text-white">Starting at <span className="text-gamebees-pink-accent glow-pink-intense font-extrabold">$12</span>/day</span>
                </div>
                <button
                  onClick={onRentClick}
                  className="px-4 py-2 rounded-xl btn-shiny-pink text-xs font-bold text-white transition-all shadow-md"
                >
                  Order
                </button>
              </div>

            </div>

            {/* Small absolute info card next to hero image */}
            <div className="absolute -bottom-6 -left-6 card-glow-pink py-3 px-4 rounded-2xl border-gamebees-pink-accent/30 hidden md:block max-w-[180px] shadow-[0_0_15px_rgba(232,62,140,0.2)]">
              <span className="text-[10px] uppercase font-bold text-gamebees-pink-accent tracking-widest block mb-1">Super Deal</span>
              <p className="text-xs text-white font-bold">Get $100 security deposit waiver on 7+ days rental</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
