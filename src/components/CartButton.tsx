"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCart } from "@/lib/cart";

export default function CartButton({ light = false }: { light?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCart().length);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("gamebees-cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gamebees-cart-updated", sync);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={`Cart${count ? `, ${count} items` : ""}`}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
        light
          ? "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
          : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.09] hover:text-white"
      }`}
    >
      <ShoppingCart className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-gamebees-glow-blue text-[9px] font-black text-white flex items-center justify-center border-2 border-gamebees-bg">
          {count}
        </span>
      )}
    </Link>
  );
}
