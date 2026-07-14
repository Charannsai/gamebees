"use client";

import React from "react";
import { ShoppingBag, LayoutDashboard } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface NavbarProps {
  onRentClick: () => void;
}

export default function Navbar({ onRentClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Image */}
          <div className="flex items-center">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gamebeeslogo.png"
                alt="GAMEBEES"
                className="h-22 w-auto object-contain select-none cursor-pointer"
              />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={onRentClick}
              className="btn-glow-pill flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-white/80" />
              <span>Rent Now</span>
            </button>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-4 py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="px-4 py-2.5 rounded-full bg-gamebees-dark-navy/40 hover:bg-gamebees-dark-navy/60 border border-gamebees-accent-blue/20 hover:border-gamebees-accent-blue/40 text-xs font-semibold text-gamebees-glow-blue flex items-center gap-1.5 transition-all">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>
          </div>

        </div>
      </div>
    </nav>
  );
}
