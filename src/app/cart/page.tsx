"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem, getCart, removeFromCart, updateCartItemDuration, getCartPromoCode, setCartPromoCode, clearCartPromoCode } from "@/lib/cart";
import { validateCoupon } from "@/app/actions";
import CartButton from "@/components/CartButton";

function rentalTotal(item: CartItem, days?: number) {
  const d = days ?? item.duration ?? 3;
  const base = item.price_3_days || item.price * 3;
  const extra = item.price_extra_day || item.price;
  return d <= 3 ? base : base + (d - 3) * extra;
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
    <main className="min-h-screen bg-gamebees-bg px-3.5 py-4 sm:px-6 lg:px-10 pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-6 sm:mb-10 relative">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Back to listings</span>
            <span className="xs:hidden sm:hidden">Back</span>
          </Link>
          <Link href="/" className="inline-flex items-center">
            <img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-9 sm:h-12 w-auto object-contain" />
          </Link>
          <CartButton />
        </header>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div>
            <div className="mb-5 sm:mb-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gamebees-glow-blue font-bold">Your selection</p>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">Rental Cart</h1>
              <p className="text-xs sm:text-sm text-white/50 mt-1">Choose duration for each gear item and checkout together.</p>
            </div>

            {cart.length === 0 ? (
              <div className="card-polished p-8 sm:p-12 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-white/20" />
                <h2 className="text-base sm:text-lg font-bold text-white mt-4">Your cart is empty</h2>
                <p className="text-xs text-white/45 mt-2">Add consoles or accessories to build your custom loadout.</p>
                <Link href="/dashboard" className="btn-glow-pill inline-flex mt-6 px-5 py-3 rounded-xl text-xs font-bold">Browse listings</Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => {
                  const currentDays = item.duration ?? 3;
                  return (
                    <article key={item.id} className="card-polished p-3.5 sm:p-5 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between rounded-2xl border border-white/[0.04]">
                      <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                        <div className="h-16 w-20 sm:h-20 sm:w-24 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={item.image_url || "/ps5.png"} alt={item.name} className="h-full w-full object-contain p-1.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] uppercase tracking-wider text-gamebees-glow-blue font-bold">{item.category || "Gaming gear"}</span>
                          <h2 className="text-xs sm:text-base font-bold text-white truncate mt-0.5">{item.name}</h2>
                          <p className="text-xs text-white/50 mt-1">
                            <span className="font-semibold text-white">₹{rentalTotal(item, currentDays)}</span>
                            <span className="text-white/40 text-[10px]"> for {currentDays} days</span>
                          </p>
                        </div>
                      </div>

                      {/* Duration selector inside cart */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                          {[3, 7, 14, 30].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => updateCartItemDuration(item.id, days)}
                              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                                currentDays === days
                                  ? "bg-gamebees-accent-blue text-white shadow-sm"
                                  : "text-white/50 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {days}d
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <aside className="card-polished p-4 sm:p-6 lg:sticky lg:top-6 rounded-2xl border border-white/[0.04]">
              <h2 className="text-base sm:text-lg font-black text-white">Checkout summary</h2>
              <div className="mt-4 rounded-2xl border border-gamebees-accent-blue/25 bg-gamebees-accent-blue/[0.06] p-3.5 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-white">Have a promo code?</span>
                    {appliedPromo && <span className="text-[10px] font-bold text-emerald-400">{appliedPromo.code} applied</span>}
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5">Apply your coupon here and see the savings before checkout.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                    placeholder="ENTER PROMO CODE"
                    disabled={!!appliedPromo}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none focus:border-gamebees-accent-blue/60"
                  />
                  <button
                    type="button"
                    onClick={appliedPromo ? handleRemovePromo : handleApplyPromo}
                    disabled={checkingPromo}
                    className="shrink-0 rounded-xl bg-gamebees-accent-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-gamebees-medium-blue disabled:opacity-50 active:scale-95"
                  >
                    {checkingPromo ? "Checking…" : appliedPromo ? "Remove" : "Apply"}
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-red-400">{promoError}</p>}
                {appliedPromo && <div className="flex justify-between text-xs text-emerald-400"><span>Coupon savings</span><span>-₹{appliedPromo.discount}</span></div>}
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="flex justify-between text-white/50"><span>{cart.length} listing{cart.length > 1 ? "s" : ""}</span><span>Multi-item bundle</span></div>
                <div className="flex justify-between text-white/50"><span>Delivery & pickup</span><span className="font-bold text-white">₹100</span></div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between"><span className="text-white/50">Listing total</span><span className="font-semibold text-white">₹{subtotal}</span></div>
                {appliedPromo && <div className="flex justify-between"><span className="text-emerald-400">Promo discount ({appliedPromo.code})</span><span className="font-bold text-emerald-400">-₹{appliedPromo.discount}</span></div>}
                <div className="flex justify-between items-baseline pt-1"><span className="text-white font-extrabold text-sm">Total</span><span className="text-xl sm:text-2xl font-black text-gamebees-glow-blue">₹{finalTotal}</span></div>
              </div>
              <Link href="/book?cart=1" className="btn-glow-pill w-full mt-5 py-3.5 sm:py-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-98">
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[10px] text-white/30 text-center mt-3">Your promo code will carry over to checkout.</p>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
}
