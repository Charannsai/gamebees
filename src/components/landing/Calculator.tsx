"use client";

import React, { useState, useMemo } from "react";
import { Calculator as CalcIcon, Percent, ShieldCheck } from "lucide-react";

interface CalculatorProps {
  onBook: (config: {
    console: string;
    duration: number;
    accessories: string[];
    total: number;
  }) => void;
}

const CONSOLE_PRICES: Record<string, number> = {
  "PlayStation 5 Pro": 12,
  "Xbox Series X": 9,
  "Nintendo Switch OLED": 7,
  "Meta Quest 3 (128GB)": 14,
};

const ACCESSORY_PRICES: Record<string, number> = {
  "Extra Controller": 2,
  "Deluxe Gaming Headset": 3,
  "Pro Gaming Monitor (27\" 144Hz)": 8,
};

export default function Calculator({ onBook }: CalculatorProps) {
  const [selectedConsole, setSelectedConsole] = useState("PlayStation 5 Pro");
  const [duration, setDuration] = useState(3);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  // Toggle accessories
  const toggleAccessory = (accName: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accName) ? prev.filter((a) => a !== accName) : [...prev, accName]
    );
  };

  // Compute prices
  const stats = useMemo(() => {
    const baseDaily = CONSOLE_PRICES[selectedConsole] || 10;
    const accessoryDaily = selectedAccessories.reduce(
      (sum, acc) => sum + (ACCESSORY_PRICES[acc] || 0),
      0
    );
    const dailyRate = baseDaily + accessoryDaily;
    const subtotal = dailyRate * duration;

    // Apply discount
    let discountPct = 0;
    if (duration >= 30) discountPct = 40;
    else if (duration >= 14) discountPct = 30;
    else if (duration >= 7) discountPct = 20;
    else if (duration >= 3) discountPct = 10;

    const discountAmount = Math.round((subtotal * discountPct) / 100);
    const total = subtotal - discountAmount;

    // Waiver security deposit if 7+ days
    const deposit = duration >= 7 ? 0 : 50;

    return {
      baseDaily,
      accessoryDaily,
      dailyRate,
      subtotal,
      discountPct,
      discountAmount,
      total,
      deposit,
    };
  }, [selectedConsole, duration, selectedAccessories]);

  const handleBook = () => {
    onBook({
      console: selectedConsole,
      duration,
      accessories: selectedAccessories,
      total: stats.total,
    });
  };

  return (
    <section id="estimator" className="py-24 relative overflow-hidden bg-gamebees-bg">
      {/* Background neon decoration */}
      <div className="absolute top-1/2 right-1/4 -z-10 h-96 w-96 rounded-full mesh-glow-pink pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <CalcIcon className="h-8 w-8 text-gamebees-pink-accent" />
            Interactive <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">Price Estimator</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg">
            Configure your setup below and instantly calculate the estimated rental costs. Long-term rentals automatically receive significant volume discounts!
          </p>
        </div>

        {/* Calculator Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Controls Panel */}
          <div className="lg:col-span-7 card-glow-pink p-6 sm:p-8 rounded-[24px] space-y-8">
            
            {/* 1. Select Console */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-extrabold tracking-wider text-gamebees-pink-accent block">
                1. Select Console
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(CONSOLE_PRICES).map((console) => (
                  <button
                    key={console}
                    onClick={() => setSelectedConsole(console)}
                    className={`p-4 rounded-xl text-left border text-sm font-semibold transition-all ${
                      selectedConsole === console
                        ? "bg-gamebees-pink-highlight/10 border-gamebees-pink-accent text-white shadow-[0_0_15px_rgba(232,62,140,0.4)]"
                        : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{console}</span>
                      <span className="text-xs text-gamebees-pink-accent font-bold">${CONSOLE_PRICES[console]}/day</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Rental Duration Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-extrabold tracking-wider text-gamebees-pink-accent block">
                  2. Rental Duration
                </label>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-white">
                  {duration} {duration === 1 ? "Day" : "Days"}
                </span>
              </div>
              
              <div className="relative pt-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg bg-white/10 appearance-none cursor-pointer accent-gamebees-pink-accent"
                />
                <div className="flex justify-between text-[10px] text-white/40 pt-2 font-semibold">
                  <span>1 Day</span>
                  <span>7 Days (20% Off)</span>
                  <span>14 Days (30% Off)</span>
                  <span>30 Days (40% Off)</span>
                </div>
              </div>

              {/* Discount Alert Banner */}
              {stats.discountPct > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gamebees-pink-accent/10 border border-gamebees-pink-accent/30 text-xs font-semibold text-gamebees-pink-accent shadow-[0_0_10px_rgba(232,62,140,0.15)]">
                  <Percent className="h-4 w-4" />
                  <span>Congrats! You qualify for a {stats.discountPct}% long-term discount.</span>
                </div>
              )}
            </div>

            {/* 3. Add Accessories */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-extrabold tracking-wider text-gamebees-pink-accent block">
                3. Optional Upgrades
              </label>
              <div className="space-y-2">
                {Object.keys(ACCESSORY_PRICES).map((acc) => {
                  const isChecked = selectedAccessories.includes(acc);
                  return (
                    <button
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm font-semibold transition-all ${
                        isChecked
                          ? "bg-gamebees-pink-accent/10 border-gamebees-pink-accent text-white"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isChecked ? "bg-gamebees-pink-accent border-transparent" : "border-white/30"
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span>{acc}</span>
                      </div>
                      <span className="text-xs text-white/50">+${ACCESSORY_PRICES[acc]}/day</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Results / Receipt Panel */}
          <div className="lg:col-span-5 card-glow-pink p-6 sm:p-8 rounded-[24px] relative overflow-hidden flex flex-col justify-between self-stretch shadow-[0_0_30px_rgba(232,62,140,0.15)]">
            
            {/* Visual shine card overlay */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>

            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Configured Setup</span>
                <h3 className="text-xl font-extrabold text-white">{selectedConsole}</h3>
                <p className="text-xs text-white/50">{duration} days rental period</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3.5 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Base Console Daily Rate</span>
                  <span className="font-semibold text-white">${stats.baseDaily}/day</span>
                </div>

                {stats.accessoryDaily > 0 && (
                  <div className="flex justify-between">
                    <span>Upgrades Daily Rate</span>
                    <span className="font-semibold text-white">+${stats.accessoryDaily}/day</span>
                  </div>
                )}

                <div className="h-px bg-white/10 my-2"></div>

                <div className="flex justify-between text-xs text-white/50">
                  <span>Subtotal ({duration} days × ${stats.dailyRate})</span>
                  <span>${stats.subtotal}</span>
                </div>

                {stats.discountAmount > 0 && (
                  <div className="flex justify-between text-gamebees-pink-accent font-semibold">
                    <span className="flex items-center gap-1">Discount ({stats.discountPct}%)</span>
                    <span>-${stats.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    Refundable Security Deposit
                    {stats.deposit === 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gamebees-pink-highlight/20 text-gamebees-pink-accent animate-pulse">Waiver</span>
                    )}
                  </span>
                  <span>{stats.deposit === 0 ? "FREE" : `$${stats.deposit}`}</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-8 border-t border-white/10 pt-6 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-white/50 block">ESTIMATED TOTAL</span>
                  {stats.deposit > 0 && <span className="text-[10px] text-white/40 block">+ ${stats.deposit} refundable deposit</span>}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white glow-pink-intense">${stats.total}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full py-4 rounded-xl btn-shiny-pink text-sm font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Book This Setup</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-white/50 text-[10px] text-center pt-2">
                <ShieldCheck className="h-4.5 w-4.5 text-gamebees-pink-accent" />
                <span>Cancel free up to 24 hours before delivery</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
