"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem, getCart, removeFromCart, getCartPromoCode, setCartPromoCode, clearCartPromoCode } from "@/lib/cart";
import { validateCoupon } from "@/app/actions";
import CartButton from "@/components/CartButton";

function rentalTotal(item: CartItem, days = 3) {
  const base = item.price_3_days || item.price * 3;
  const extra = item.price_extra_day || item.price;
  return days <= 3 ? base : base + (days - 3) * extra;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setPromoCode(getCartPromoCode());
    const sync = () => setCart(getCart());
    window.addEventListener("gamebees-cart-updated", sync);
    return () => window.removeEventListener("gamebees-cart-updated", sync);
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + rentalTotal(item), 0), [cart]);
  const deliveryFee = cart.length > 0 ? 100 : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - (appliedPromo?.discount || 0));

  useEffect(() => {
    if (cart.length === 0) {
      clearCartPromoCode();
      setPromoCode("");
      setAppliedPromo(null);
    }
  }, [cart.length]);

  useEffect(() => {
    const stored = getCartPromoCode();
    if (!stored || !subtotal) return;
    let cancelled = false;
    validateCoupon(stored, subtotal).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setAppliedPromo({ code: res.data.code, discount: res.data.discount });
      else clearCartPromoCode();
    });
    return () => { cancelled = true; };
  }, [subtotal]);

  async function handleApplyPromo() {
    setPromoError("");
    setAppliedPromo(null);
    if (!promoCode.trim()) { setPromoError("Enter a promo code."); return; }
    setCheckingPromo(true);
    try {
      const res = await validateCoupon(promoCode, subtotal);
      if (res.success && res.data) {
        setAppliedPromo({ code: res.data.code, discount: res.data.discount });
        setCartPromoCode(res.data.code);
      } else {
        setPromoError(res.error || "Invalid promo code.");
        clearCartPromoCode();
      }
    } finally {
      setCheckingPromo(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
    clearCartPromoCode();
  }

  return (
    <main className="min-h-screen bg-gamebees-bg px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"><ArrowLeft className="h-4 w-4" /> Back to listings</Link>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2"><img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-12 w-auto object-contain" /></Link>
          <CartButton />
        </header>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div>
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gamebees-glow-blue font-bold">Your selection</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Rental Cart</h1>
              <p className="text-sm text-white/45 mt-2">Combine consoles, controllers and other available gear into one checkout.</p>
            </div>

            {cart.length === 0 ? (
              <div className="card-polished p-12 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-white/20" />
                <h2 className="text-lg font-bold text-white mt-4">Your cart is empty</h2>
                <p className="text-xs text-white/45 mt-2">Add listings when you want a complete gaming setup.</p>
                <Link href="/dashboard" className="btn-glow-pill inline-flex mt-6 px-5 py-3 rounded-xl text-xs font-bold">Browse listings</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <article key={item.id} className="card-polished p-4 sm:p-5 flex gap-4 items-center">
                    <div className="h-20 w-24 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center overflow-hidden shrink-0"><img src={item.image_url || "/ps5.png"} alt={item.name} className="h-full w-full object-contain p-2" /></div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-gamebees-glow-blue font-bold">{item.category || "Gaming gear"}</span>
                      <h2 className="text-sm sm:text-base font-bold text-white truncate mt-1">{item.name}</h2>
                      <p className="text-xs text-white/40 mt-1">3-day package · ₹{rentalTotal(item)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="h-9 w-9 rounded-lg border border-red-500/15 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                  </article>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <aside className="card-polished p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-black text-white">Checkout summary</h2>
              <div className="mt-5 rounded-2xl border border-gamebees-accent-blue/25 bg-gamebees-accent-blue/[0.06] p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold text-white">Have a promo code?</span>
                    {appliedPromo && <span className="text-[10px] font-bold text-emerald-400">{appliedPromo.code} applied</span>}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Apply your coupon here and see the savings before checkout.</p>
                </div>
                <div className="flex gap-2">
                  <input value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }} placeholder="ENTER PROMO CODE" disabled={!!appliedPromo} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none focus:border-gamebees-accent-blue/60" />
                  <button type="button" onClick={appliedPromo ? handleRemovePromo : handleApplyPromo} disabled={checkingPromo} className="shrink-0 rounded-xl bg-gamebees-accent-blue px-4 py-2.5 text-xs font-bold text-white hover:bg-gamebees-medium-blue disabled:opacity-50">{checkingPromo ? "Checking…" : appliedPromo ? "Remove" : "Apply"}</button>
                </div>
                {promoError && <p className="text-[10px] text-red-400">{promoError}</p>}
                {appliedPromo && <div className="flex justify-between text-xs text-emerald-400"><span>Coupon savings</span><span>-₹{appliedPromo.discount}</span></div>}
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between text-white/50"><span>{cart.length} listing{cart.length > 1 ? "s" : ""}</span><span>3 days</span></div>
                <div className="flex justify-between text-white/50"><span>Delivery & pickup</span><span className="font-bold text-white">₹100</span></div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between"><span className="text-white/50">Listing total</span><span className="font-semibold text-white">₹{subtotal}</span></div>
                {appliedPromo && <div className="flex justify-between"><span className="text-emerald-400">Promo discount ({appliedPromo.code})</span><span className="font-bold text-emerald-400">-₹{appliedPromo.discount}</span></div>}
                <div className="flex justify-between items-baseline"><span className="text-white font-extrabold">Total</span><span className="text-2xl font-black text-gamebees-glow-blue">₹{finalTotal}</span></div>
              </div>
              <Link href="/book?cart=1" className="btn-glow-pill w-full mt-6 py-4 rounded-xl text-xs font-black flex items-center justify-center gap-2">Proceed to checkout <ArrowRight className="h-4 w-4" /></Link>
              <p className="text-[10px] text-white/30 text-center mt-3">Your promo code will carry over to checkout.</p>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
}
