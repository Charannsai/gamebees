"use client";

import React, { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

interface NavbarProps {
  onRentClick: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Navbar({ onRentClick, activeSection, onSectionChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "ps5", name: "Product" },
    { id: "controller", name: "Accessories" },
    { id: "rentals", name: "Rentals" },
    { id: "support", name: "Support" },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 w-full backdrop-blur-sm transition-all duration-300"
      style={{
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 65%, rgba(0, 0, 0, 0) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo - Sleek text, no icons, matches VYRO minimalist logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-[0.25em] text-white select-none">
              GAMEBEES
            </span>
          </div>

          {/* Desktop Nav Links - Centered rounded pill outline */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1.5 rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const isTabActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === "rentals") {
                      onRentClick();
                    } else if (link.id === "support") {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    } else {
                      onSectionChange(link.id);
                    }
                  }}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                    isTabActive
                      ? "bg-gamebees-pill text-white shadow-sm border border-white/5"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Action Button - Sleek dark pill with shopping bag icon */}
          <div className="hidden md:block">
            <button
              onClick={onRentClick}
              className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 hover:border-white/20 px-6 py-2.5 rounded-full text-xs font-semibold text-white transition-all duration-300"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-white/80" />
              <span>Rent Now</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden backdrop-blur-md py-4 px-6 space-y-3 shadow-lg border-b border-white/5"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
          }}
        >
          {navLinks.map((link) => {
            const isTabActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.id === "rentals") {
                    onRentClick();
                  } else if (link.id === "support") {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  } else {
                    onSectionChange(link.id);
                  }
                }}
                className={`w-full text-left block rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isTabActive
                    ? "bg-gamebees-pill text-white border border-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onRentClick();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3 text-sm font-bold shadow-md hover:bg-white/95 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Rent Now</span>
          </button>
        </div>
      )}
    </nav>
  );
}
