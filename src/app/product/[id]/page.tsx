"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowLeft01Icon, 
  ShoppingBag01Icon, 
  Shield01Icon
} from "@hugeicons/core-free-icons";
import { Star, Shield, Package, Laptop, Award, Layers } from "lucide-react";
import { fetchItemAvailability } from "@/app/actions";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(3);
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Sync theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLightTheme(document.documentElement.classList.contains("light"));
      
      const observer = new MutationObserver(() => {
        setIsLightTheme(document.documentElement.classList.contains("light"));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }
  }, []);

  // Fetch product details
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchItemAvailability(id)
        .then((res) => {
          if (res.success && res.item) {
            setItem(res.item);
            setActiveImage(res.item.image_url || (Array.isArray(res.item.image_urls) && res.item.image_urls[0]) || "/ps5.png");
          } else {
            console.error("Failed to load product:", res.error);
          }
        })
        .catch((err) => console.error("Error fetching product:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 border-4 border-[#246596] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141414] text-white space-y-4">
        <h3 className="text-xl font-bold">Product Not Found</h3>
        <p className="text-white/50 text-sm">The console or gear configuration could not be retrieved.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-[#246596] rounded-xl text-xs font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate pricing dynamically
  const baseRate = item.price_3_days || (item.price * 3);
  const extraRate = item.price_extra_day || item.price;
  const totalPrice = selectedDuration <= 3 ? baseRate : baseRate + (selectedDuration - 3) * extraRate;

  // Image list
  const imageUrls = Array.isArray(item.image_urls) && item.image_urls.length > 0 
    ? item.image_urls 
    : [item.image_url || "/ps5.png"];

  // Page styling helpers
  const textTitle = isLightTheme ? "text-neutral-900" : "text-white";
  const textSub = isLightTheme ? "text-neutral-500" : "text-white/50";
  const textBody = isLightTheme ? "text-neutral-700" : "text-white/80";
  const cardStyle = isLightTheme ? "bg-white border-neutral-200 shadow-md" : "bg-[#10324d]/10 border-white/5 shadow-2xl";

  const handleBookNow = () => {
    router.push(`/book?itemId=${item.id}&name=${encodeURIComponent(item.name)}&price=${item.price}&duration=${selectedDuration}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gamebees-bg selection:bg-gamebees-accent-blue selection:text-white relative overflow-x-hidden pb-12">
      {/* Background glow backdrops */}
      <div 
        className="absolute w-[600px] h-[600px] right-[-200px] top-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.12) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(140px)",
        }}
      />

      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isLightTheme
          ? "bg-white/90 border-neutral-200 text-neutral-900 shadow-xs"
          : "bg-[#141414]/85 border-white/[0.04] text-white"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-11 sm:h-14 w-auto object-contain select-none" />
          </Link>
          
          <button 
            onClick={() => router.push("/dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isLightTheme
                ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
            <span>Go Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 mt-8 sm:mt-12 relative z-10">
        <div className={`w-full rounded-[24px] p-6 sm:p-8 md:p-12 border ${cardStyle} grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 transition-all`}>
          
          {/* LEFT COLUMN: Gallery & Specs */}
          <div className="md:col-span-6 space-y-6">
            
            {/* Gallery Main Image */}
            <div className="relative w-full aspect-video sm:aspect-square md:max-h-[460px] rounded-2xl overflow-hidden bg-black/45 border border-white/5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={item.name}
                className="w-full h-full object-contain p-6 transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/ps5.png";
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gamebees-glow-blue bg-gamebees-dark-navy/80 backdrop-blur-md border border-gamebees-accent-blue/30 px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {imageUrls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(url)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-black/30 border transition-all shrink-0 cursor-pointer ${
                      activeImage === url 
                        ? "border-[#246596] ring-2 ring-[#246596]/20 scale-95" 
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs & Hardware Features */}
            <div className={`p-5 rounded-2xl border ${isLightTheme ? "bg-neutral-50/60 border-neutral-200" : "bg-white/[0.02] border-white/5"} space-y-4`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-[#246596]" : "text-gamebees-glow-blue"}`}>
                Console Specifications & Setup
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#246596] shrink-0" />
                  <span className={textBody}>1x PlayStation 5 Console</span>
                </li>
                <li className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-[#246596] shrink-0" />
                  <span className={textBody}>1x DualSense Controller</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#246596] shrink-0" />
                  <span className={textBody}>Preloaded Game Library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#246596] shrink-0" />
                  <span className={textBody}>HDMI 2.1 & Power Cables</span>
                </li>
              </ul>

              <div className="h-[1px] bg-white/5 my-2" />

              <div className="flex items-start gap-2.5 text-[11px] text-white/60">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className={textSub}>
                  <strong className="text-emerald-500 font-semibold">Security Warranty buffer included:</strong> Regular cosmetic wear is not charged. Only physical damage or unapproved software modifications are liable.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Calculator */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Product Header */}
              <div>
                <h2 className={`text-2xl sm:text-3xl font-black ${textTitle} leading-tight`}>
                  {item.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20`}>
                    4.9 / 5.0 Rating
                  </span>
                </div>
              </div>

              {/* Main Price Card */}
              <div className={`p-4 rounded-2xl border ${isLightTheme ? "bg-neutral-50 border-neutral-200" : "bg-black/30 border-white/5"} flex justify-between items-center`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLightTheme ? "text-neutral-400" : "text-white/35"}`}>Rental Charge</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-3xl font-black ${isLightTheme ? "text-neutral-950" : "text-gamebees-glow-blue"}`}>₹{item.price}</span>
                    <span className={textSub}>/ day</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-500 font-bold block">Security Deposit</span>
                  <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Waived (eKYC)</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-[#246596]" : "text-gamebees-glow-blue"}`}>
                  Description & Library Info
                </h4>
                <p className={`${textBody} text-xs leading-relaxed font-light`}>
                  {item.description || "Immerse yourself in next-gen console gaming. Experience lightning-fast loading speeds with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games."}
                </p>
                <p className={`${textBody} text-xs leading-relaxed font-light mt-1.5`}>
                  Our console setup is preloaded with accounts containing active PS Plus Deluxe access, enabling offline and online multiplayer modes. Delivery is fully handled by our express transport agents.
                </p>
              </div>

              {/* Interactive Duration Selector */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-[#246596]" : "text-gamebees-glow-blue"}`}>
                  Select Rental Duration
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 5, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedDuration(days)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedDuration === days
                          ? "bg-[#246596] border-[#246596] text-white shadow-sm"
                          : isLightTheme
                            ? "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Price Summary Breakdown */}
              <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isLightTheme ? "bg-neutral-50 border-neutral-200" : "bg-black/40 border-white/5"}`}>
                <div className="flex justify-between">
                  <span className={textSub}>Base 3-Day Package Rate</span>
                  <span className="font-semibold">₹{baseRate}</span>
                </div>
                {selectedDuration > 3 && (
                  <div className="flex justify-between">
                    <span className={textSub}>Extra Days ({selectedDuration - 3} days × ₹{extraRate})</span>
                    <span className="font-semibold">+₹{(selectedDuration - 3) * extraRate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={textSub}>Delivery, Setup & Pickup</span>
                  <span className="text-emerald-500 font-bold">FREE</span>
                </div>
                <div className="h-[1px] bg-white/5 my-1" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className={`text-xs uppercase font-extrabold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>Estimated Total</span>
                  <span className={`text-2xl font-black ${isLightTheme ? "text-neutral-950" : "text-gamebees-glow-blue"}`}>₹{totalPrice}</span>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleBookNow}
                className="w-full py-4 bg-gradient-to-r from-gamebees-accent-blue/80 to-gamebees-medium-blue/60 hover:from-gamebees-accent-blue hover:to-gamebees-medium-blue border border-gamebees-accent-blue/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(36,101,150,0.3)] cursor-pointer"
              >
                <HugeiconsIcon icon={ShoppingBag01Icon} size={16} />
                <span>Book Console Now</span>
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className={`w-full py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isLightTheme
                    ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>Return to Dashboard</span>
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
