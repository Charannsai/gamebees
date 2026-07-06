"use client";

import React, { useState } from "react";
import { Menu, X, Cpu } from "lucide-react";

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
    <nav className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gamebees-accent-blue shadow-md">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-wider text-gamebees-accent-lavender select-none">
              GAME<span className="text-white">BEES</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-gamebees-accent-lavender"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden md:block">
            <button
              onClick={onRentClick}
              className="btn-polished px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-300"
            >
              Rent A Console
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
        <div className="md:hidden bg-[#0A080F]/90 backdrop-blur-md border-t border-white/5 py-4 px-4 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-gamebees-accent-lavender"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onRentClick();
            }}
            className="w-full text-center block rounded-full btn-polished px-5 py-3 text-sm font-semibold text-white"
          >
            Rent A Console
          </button>
        </div>
      )}
    </nav>
  );
}
