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
    <section id="estimator" className="py-24 bg-gamebees-bg relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <CalcIcon className="h-6 w-6 text-gamebees-pink-accent" />
            Price <span className="bg-gradient-to-r from-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent glow-pink-intense">Estimator</span>
          </h2>
          <p className="text-white/50 text-sm font-light">
            Configure your console setup and calculate real-time estimates with volume discounts.
          </p>
        </div>

        {/* Calculator Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="md:col-span-7 card-glow-pink p-6 sm:p-8 rounded-[20px] space-y-8">
            
            {/* 1. Select Console */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gamebees-pink-accent">
                1. Select Console
              </label>
              <select
                value={selectedConsole}
                onChange={(e) => setSelectedConsole(e.target.value)}
                className="w-full rounded-xl bg-gamebees-bg border border-white/10 px-4 py-3.5 text-sm text-white focus:border-gamebees-pink-accent outline-none appearance-none cursor-pointer"
              >
                {Object.keys(CONSOLE_PRICES).map((console) => (
                  <option key={console} value={console} className="bg-gamebees-bg text-white">
                    {console} (${CONSOLE_PRICES[console]}/day)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Rental Duration Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gamebees-pink-accent">
                  2. Rental Duration
                </label>
                <span className="text-sm font-bold text-white">
                  {duration} {duration === 1 ? "Day" : "Days"}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-gamebees-pink-accent rounded"
                />
                <div className="flex justify-between text-[9px] text-white/40 pt-2 font-medium">
                  <span>1d</span>
                  <span>7d (20% off)</span>
                  <span>14d (30% off)</span>
                  <span>30d (40% off)</span>
                </div>
              </div>
            </div>

            {/* 3. Add Accessories */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gamebees-pink-accent">
                3. Optional Upgrades
              </label>
              <div className="space-y-2">
                {Object.keys(ACCESSORY_PRICES).map((acc) => {
                  const isChecked = selectedAccessories.includes(acc);
                  return (
                    <button
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isChecked
                          ? "bg-gamebees-pink-accent/10 border-gamebees-pink-accent/40 text-white"
                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                          isChecked ? "bg-gamebees-pink-accent border-transparent" : "border-white/20"
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span>{acc}</span>
                      </div>
                      <span className="text-white/40">+${ACCESSORY_PRICES[acc]}/day</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Results Panel */}
          <div className="md:col-span-5 card-glow-pink p-6 sm:p-8 rounded-[20px] flex flex-col justify-between self-stretch">
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Rental Plan</span>
                <h3 className="text-base font-bold text-white">{selectedConsole}</h3>
                <p className="text-xs text-white/50">{duration} days duration</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Base Daily Rate</span>
                  <span>${stats.baseDaily}/day</span>
                </div>

                {stats.accessoryDaily > 0 && (
                  <div className="flex justify-between">
                    <span>Upgrades Daily Rate</span>
                    <span>+${stats.accessoryDaily}/day</span>
                  </div>
                )}

                <div className="h-px bg-white/5 my-2"></div>

                {stats.discountAmount > 0 && (
                  <div className="flex justify-between text-gamebees-pink-accent font-semibold">
                    <span>Discount ({stats.discountPct}%)</span>
                    <span>-${stats.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/50">
                  <span>Refundable Deposit</span>
                  <span>{stats.deposit === 0 ? "FREE" : `$${stats.deposit}`}</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-8 border-t border-white/5 pt-6 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-white/40 block font-semibold">ESTIMATED TOTAL</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white glow-pink-intense">${stats.total}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full py-3.5 rounded-xl btn-shiny-pink text-xs font-bold text-white transition-all duration-300"
              >
                Book This Setup
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
