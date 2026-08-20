"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import CartButton from "@/components/CartButton";

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-[#141414]/70 backdrop-blur-lg border-b border-white/[0.05] transition-all duration-300">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          
          {/* Logo Image */}
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gamebeeslogo.png"
                alt="GAMEBEES"
                className="h-10 sm:h-14 md:h-16 w-auto object-contain select-none cursor-pointer"
              />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <CartButton />
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04] text-[11px] sm:text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Sign In
              </Link>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/dashboard"
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gamebees-dark-navy/50 hover:bg-gamebees-dark-navy/70 border border-gamebees-accent-blue/30 hover:border-gamebees-accent-blue/50 text-[11px] sm:text-xs font-semibold text-gamebees-glow-blue flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">Dashboard</span>
                </Link>
                <UserButton />
              </div>
            </Show>
          </div>

        </div>
      </div>
    </nav>
  );
}
