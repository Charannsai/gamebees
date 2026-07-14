"use client";

import React, { useState, useEffect } from "react";
import { X, User, Phone, MapPin, Gamepad, CheckCircle } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConsoleName?: string;
  initialDuration?: number;
  initialAccessories?: string[];
  initialTotal?: number;
}

const CONSOLE_OPTIONS = [
  "PlayStation 5 Pro Bundle",
  "Extra DualSense Controller",
];

export default function BookingModal({
  isOpen,
  onClose,
  initialConsoleName = "PlayStation 5 Pro Bundle",
  initialDuration = 3,
  initialAccessories = [],
  initialTotal = 36,
}: BookingModalProps) {
  const [consoleName, setConsoleName] = useState(initialConsoleName);
  const [duration, setDuration] = useState(initialDuration);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [games, setGames] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamically calculate price based on consoleName selection and duration
  const dailyPrice = consoleName.includes("Controller") ? 3 : 12;
  const rawTotal = dailyPrice * duration;
  const calculatedTotal = duration >= 7 ? Math.round(rawTotal * 0.9) : rawTotal;

  // Sync state with props when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      setConsoleName(initialConsoleName);
      setDuration(initialDuration);
      setIsSuccess(false);
      setName("");
      setPhone("");
      setAddress("");
      setGames("");
    }
  }, [isOpen, initialConsoleName, initialDuration]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-[24px] card-polished p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn z-10">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Book Your <span className="text-gamebees-accent-lavender">Gaming Station</span>
              </h3>
              <p className="text-white/50 text-xs sm:text-sm mt-1 font-light">
                Enter your details to initiate your rental. No credit card required.
              </p>
            </div>

            {/* Quick summary card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs sm:text-sm font-light">
              <div className="flex justify-between font-bold text-white">
                <span>Console:</span>
                <span className="text-gamebees-accent-lavender">{consoleName}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Duration:</span>
                <span>{duration} days</span>
              </div>
              {duration >= 7 && (
                <div className="flex justify-between text-gamebees-accent-lavender text-xs">
                  <span>Discount:</span>
                  <span>10% Off Applied</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between font-bold text-white text-base">
                <span>Estimated Price:</span>
                <span className="text-gamebees-accent-lavender">${calculatedTotal}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Select Console */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">Change Console</label>
                <div className="relative">
                  <select
                    value={consoleName}
                    onChange={(e) => setConsoleName(e.target.value)}
                    className="w-full rounded-xl bg-gamebees-bg border border-white/10 px-4 py-3 text-sm text-white focus:border-gamebees-accent-blue outline-none appearance-none cursor-pointer"
                  >
                    {CONSOLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-gamebees-bg text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Duration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">Rental Duration (3 to 30 Days)</label>
                <div className="flex items-center gap-4 bg-black border border-white/10 rounded-xl px-4 py-3">
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1 accent-gamebees-accent-blue cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                  <span className="text-sm font-bold text-white w-16 text-right flex-shrink-0">
                    {duration} days
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl bg-black border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-gamebees-accent-blue outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">Phone Number (WhatsApp Preferred)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full rounded-xl bg-black border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-gamebees-accent-blue outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">Delivery Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    className="w-full rounded-xl bg-black border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-gamebees-accent-blue outline-none"
                  />
                </div>
              </div>

              {/* Requested Games */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">
                  Requested Games (Free Pre-installation)
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 pointer-events-none text-white/40">
                    <Gamepad className="h-4 w-4" />
                  </span>
                  <textarea
                    value={games}
                    onChange={(e) => setGames(e.target.value)}
                    placeholder="E.g., GTA VI, Spiderman 2, FC 26 (List any specific titles)"
                    rows={2}
                    className="w-full rounded-xl bg-black border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-gamebees-accent-blue outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl btn-polished text-sm font-bold text-white transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Submit Booking Request</span>
              )}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gamebees-accent-blue/10 border border-gamebees-accent-blue/20">
              <CheckCircle className="h-10 w-10 text-gamebees-accent-blue" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Request Received!</h3>
              <p className="text-white/75 text-sm">
                Thank you for choosing GameBees, <span className="text-gamebees-accent-lavender font-bold">{name}</span>!
              </p>
            </div>

            <p className="text-white/55 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-light">
              We have received your request to rent the <span className="text-white font-semibold">{consoleName}</span> for {duration} days. Our customer rep will message or call you on <span className="text-white font-semibold">{phone}</span> within <span className="text-gamebees-accent-lavender font-semibold">15 minutes</span> to confirm your same-day delivery slots.
            </p>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors"
            >
              Back To Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
