"use client";

import React, { useState } from "react";
import { Menu, X, ShieldAlert, Cpu } from "lucide-react";

interface NavbarProps {
  onRentClick: () => void;
}

export default function Navbar({ onRentClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Consoles", href: "#consoles" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Price Estimator", href: "#estimator" },
    { name: "FAQs", href: "#faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gamebees-bg/75 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gamebees-pink-highlight to-gamebees-purple-accent box-glow-pink">
              <Cpu className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-gamebees-pink-accent to-gamebees-pink-highlight bg-clip-text text-transparent">
              GAME<span className="text-white">BEES</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-gamebees-pink-accent"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden md:block">
            <button
              onClick={onRentClick}
              className="relative group overflow-hidden rounded-full p-[2px] transition-all hover:scale-105 duration-300 active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gamebees-pink-highlight to-gamebees-purple-accent rounded-full"></span>
              <span className="relative block px-6 py-2.5 rounded-full bg-gamebees-bg text-sm font-semibold transition-colors group-hover:bg-transparent text-white">
                Rent A Console
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t-0 border-x-0 border-b border-white/10 py-4 px-4 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-gamebees-pink-accent"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onRentClick();
            }}
            className="w-full text-center block rounded-full bg-gradient-to-r from-gamebees-pink-highlight to-gamebees-purple-accent px-5 py-3 text-sm font-semibold text-white shadow-lg box-glow-pink"
          >
            Rent A Console
          </button>
        </div>
      )}
    </nav>
  );
}
