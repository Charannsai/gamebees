"use client";

import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun, Moon } from "lucide-react";
import { 
  DashboardSquare01Icon, 
  ShoppingBag01Icon, 
  Compass01Icon, 
  Shield01Icon, 
  Settings01Icon, 
  Logout01Icon, 
  UserIcon, 
  CallingIcon, 
  Location01Icon, 
  CheckmarkCircle01Icon, 
  AlertCircleIcon, 
  DeliveryTruck01Icon, 
  ArrowRight01Icon, 
  RefreshIcon, 
  Camera01Icon,
  PackageIcon,
  Time01Icon,
  File01Icon
} from "@hugeicons/core-free-icons";
import { fetchItems, fetchBookings, getKycStatus, saveKyc } from "@/app/actions";
import BookingModal from "@/components/landing/BookingModal";
import Link from "next/link";

type TabType = "overview" | "bookings" | "track" | "kyc" | "settings";

export default function UserDashboard() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [items, setItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // KYC State
  const [kycVerified, setKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycProfile, setKycProfile] = useState<any>(null);
  
  // Local Aadhaar Verification Form (in KYC Tab)
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Read theme preference on mount
    const savedTheme = (localStorage.getItem("gamebees-theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("gamebees-theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  // Booking modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConsoleName, setModalConsoleName] = useState("");
  const [modalItemId, setModalItemId] = useState("");
  const [modalDailyPrice, setModalDailyPrice] = useState(12);
  const [modalDuration, setModalDuration] = useState(3);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [itemsRes, bookingsRes, kycRes] = await Promise.all([
        fetchItems(),
        fetchBookings(),
        getKycStatus()
      ]);

      if (itemsRes.success) setItems(itemsRes.data || []);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      
      if (kycRes.success) {
        setKycVerified(kycRes.verified);
        setKycProfile(kycRes.profile);
      } else {
        // LocalStorage fallback for sandbox testing if DB fails/is missing
        const cachedKyc = localStorage.getItem(`kyc_verified_${user?.id}`);
        if (cachedKyc) {
          setKycVerified(true);
          setKycProfile(JSON.parse(cachedKyc));
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
      setKycLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      loadDashboardData();
    }
  }, [isLoaded, user]);

  const handleOpenBooking = (item: any) => {
    setModalConsoleName(item.name);
    setModalItemId(item.id);
    setModalDailyPrice(Number(item.price));
    setModalDuration(3);
    setModalOpen(true);
  };

  // Local Aadhaar Sandbox Handlers
  const handleSendAadhaarOtp = () => {
    if (aadhaarNum.length !== 12 || !/^\d+$/.test(aadhaarNum)) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setAadhaarError("");
    setVerifyingAadhaar(true);
    
    setTimeout(() => {
      setVerifyingAadhaar(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyAadhaarOtp = async () => {
    if (aadhaarOtp !== "123456") {
      setAadhaarError("Invalid OTP. Enter '123456' for sandbox verification.");
      return;
    }
    setAadhaarError("");
    setVerifyingAadhaar(true);

    const profileData = {
      fullName: user?.fullName || "Verified User",
      phone: user?.primaryPhoneNumber?.phoneNumber || "9988776655",
      aadhaarNumber: aadhaarNum,
      aadhaarVerified: true,
      selfieUrl: "data:image/png;base64,mockselfie"
    };

    try {
      const res = await saveKyc(profileData);
      
      // Save locally in all cases for safety & immediate use
      localStorage.setItem(`kyc_verified_${user?.id}`, JSON.stringify(profileData));
      
      setKycVerified(true);
      setKycProfile(profileData);
    } catch (err) {
      console.error("KYC save error:", err);
    } finally {
      setVerifyingAadhaar(false);
    }
  };

  const handleTriggerRedirectToKyc = () => {
    setModalOpen(false);
    setActiveTab("kyc");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "dispatched": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "discarded": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const activeBooking = bookings.find(b => b.status !== "completed" && b.status !== "discarded");
  const displayBookingForTrack = activeBooking || bookings[0];

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 border-4 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-x-hidden w-full pb-28 lg:pb-10">
      {/* Background glow backdrops */}
      <div 
        className="absolute w-[600px] h-[600px] right-[-200px] top-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.1) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(140px)",
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] left-[-200px] bottom-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.08) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(140px)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#141414]/85 backdrop-blur-md border-b border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-11 sm:h-14 w-auto object-contain select-none" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.04] text-xs text-white/70">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Signed in as: <strong>{user?.primaryEmailAddress?.emailAddress}</strong></span>
            </div>
            
            <SignOutButton>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all border border-red-500/20 cursor-pointer">
                <HugeiconsIcon icon={Logout01Icon} size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
        
        {/* Navigation Sidebar (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-3">
          <div className="card-polished p-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold px-3 pb-2 border-b border-white/[0.04] mb-2">
              Navigation
            </p>
            
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "bookings"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
              <span>Available Gear</span>
            </button>

            <button
              onClick={() => setActiveTab("track")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "track"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={Compass01Icon} size={18} />
              <span>Track Orders</span>
              {activeBooking && (
                <span className="ml-auto h-2 w-2 rounded-full bg-gamebees-glow-blue animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "kyc"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={Shield01Icon} size={18} />
              <span>Identity KYC</span>
              {kycVerified ? (
                <span className="ml-auto text-green-400 text-[10px] font-bold">Verified</span>
              ) : (
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={Settings01Icon} size={18} />
              <span>Settings</span>
            </button>
          </div>

          {/* Quick Stats Widget */}
          <div className="card-polished p-5 space-y-4">
            <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-bold border-b border-white/[0.04] pb-2">
              Rental Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 block">Total Bookings</span>
                <span className="text-xl font-black text-white">{bookings.length}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 block">Active Rentals</span>
                <span className="text-xl font-black text-gamebees-glow-blue">
                  {bookings.filter(b => ["booked", "dispatched", "delivered"].includes(b.status)).length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Content Window */}
        <main className="lg:col-span-3 space-y-6">
          {loadingData ? (
            <div className="card-polished p-20 flex justify-center items-center">
              <div className="h-6 w-6 border-2 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeInUp">
                  {/* Hero banner / Marketing callout */}
                  <div className="card-gradient-border p-5 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-3 text-left z-10 max-w-md">
                      <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-gamebees-glow-blue block">
                        EXCLUSIVE LOADOUTS AVAILABLE
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        Elevate Your Playtime With Pre-Installed Top Titles!
                      </h3>
                      <p className="text-xs text-white/55 font-light leading-relaxed">
                        Ready to play Fortnite, GTA V, or FC 26? Rent premium custom console configurations with zero security deposit!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="btn-glow-pill px-5 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap z-10 cursor-pointer self-start md:self-auto"
                    >
                      <span>Rent More Gear</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                    </button>
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-gamebees-accent-blue/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Active Booking status overview */}
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider pl-1">
                      Active Reservations
                    </h3>
                    
                    {bookings.filter(b => b.status !== "completed" && b.status !== "discarded").length === 0 ? (
                      <div className="card-polished p-8 text-center space-y-4">
                        <HugeiconsIcon icon={PackageIcon} size={40} className="text-white/20 mx-auto" />
                        <div>
                          <p className="text-xs sm:text-sm text-white/60 font-semibold">No active rentals found</p>
                          <p className="text-[11px] text-white/40 mt-1 font-light">Choose from our catalog to book your first setup!</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("bookings")}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Explore Gear Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings
                          .filter(b => b.status !== "completed" && b.status !== "discarded")
                          .map((b) => (
                            <div key={b.id} className="card-polished p-5 space-y-4 border border-white/[0.02]">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] text-white/40 font-mono">ID: #{b.id.slice(-6).toUpperCase()}</span>
                                  <h4 className="text-sm font-bold text-white mt-0.5">
                                    {b.items?.name || "Gaming Console Setup"}
                                  </h4>
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold border rounded px-2 py-0.5 ${getStatusColor(b.status)}`}>
                                  {b.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/[0.04] pt-3 font-light">
                                <div>
                                  <span className="text-[9px] text-white/30 block">Duration</span>
                                  <span className="text-white/80">{b.duration_days} Days</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-white/30 block">Total Due</span>
                                  <span className="text-gamebees-glow-blue font-bold">${b.total_price}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-[9px] text-white/30 block">Delivery Address</span>
                                  <span className="text-white/60 truncate block">{b.address}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => { setActiveTab("track"); }}
                                className="w-full py-2 bg-gamebees-dark-navy/30 hover:bg-gamebees-dark-navy/60 border border-gamebees-accent-blue/20 hover:border-gamebees-accent-blue/40 rounded-lg text-[10px] font-semibold text-gamebees-glow-blue flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <HugeiconsIcon icon={Compass01Icon} size={14} />
                                <span>Track Live Delivery</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Bookings */}
              {activeTab === "bookings" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Available Gaming Stations
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Browse available items propagated directly from our warehouse.
                    </p>
                  </div>

                  {items.length === 0 ? (
                    <div className="card-polished p-16 text-center space-y-3">
                      <HugeiconsIcon icon={ShoppingBag01Icon} size={40} className="text-white/10 mx-auto" />
                      <p className="text-xs sm:text-sm text-white/50 font-light">No gear setups listed currently. Check back later!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {items.map((item) => (
                        <div key={item.id} className="card-polished p-5 flex flex-col justify-between h-[230px] border border-white/[0.03] group hover:border-gamebees-accent-blue/30 transition-all">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-gamebees-glow-blue bg-gamebees-dark-navy/35 border border-gamebees-accent-blue/20 px-2 py-0.5 rounded-full">
                                {item.category}
                              </span>
                              <div className="text-right">
                                <span className="text-lg font-black text-white">${item.price}</span>
                                <span className="text-[9px] text-white/30 block">/ day</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-gamebees-glow-blue transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-xs text-white/40 font-light mt-1.5 leading-relaxed line-clamp-3">
                                {item.description || "Fully configured console with active game library ready for plug-and-play."}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenBooking(item)}
                            className="w-full mt-4 py-2.5 bg-gamebees-accent-blue/70 hover:bg-gamebees-accent-blue border border-gamebees-accent-blue/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(36,101,150,0.15)] cursor-pointer"
                          >
                            <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
                            <span>Rent Now</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Track */}
              {activeTab === "track" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Live Delivery Tracking
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Track the real-time shipping progress coordinates updated by our dispatch team.
                    </p>
                  </div>

                  {!displayBookingForTrack ? (
                    <div className="card-polished p-16 text-center space-y-3">
                      <HugeiconsIcon icon={Compass01Icon} size={40} className="text-white/10 mx-auto" />
                      <p className="text-xs sm:text-sm text-white/50 font-light">No bookings found to track. Rent a console first!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Progression tracker */}
                      <div className="lg:col-span-1 card-polished p-5 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <div className="border-b border-white/[0.04] pb-3">
                            <span className="text-[10px] text-white/40 font-mono block">Order ID: #{displayBookingForTrack.id.slice(-8).toUpperCase()}</span>
                            <h4 className="text-sm font-bold text-white mt-1">
                              {displayBookingForTrack.items?.name || "Gaming Console Setup"}
                            </h4>
                          </div>

                          <div className="relative pl-6 space-y-6">
                            <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-white/5" />
                            <div 
                              className="absolute left-[7px] top-1 w-[2px] bg-gamebees-glow-blue transition-all duration-700" 
                              style={{
                                height: displayBookingForTrack.tracking_status === "preparing" ? "0%" 
                                      : displayBookingForTrack.tracking_status === "shipped" ? "33%" 
                                      : displayBookingForTrack.tracking_status === "delivered" ? "66%" : "100%"
                              }}
                            />

                            {/* Steps */}
                            <div className="relative flex gap-3.5 items-start">
                              <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center z-10 bg-[#141414] border-green-400 text-green-400">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-white block">Order Confirmed</span>
                                <span className="text-[10px] text-white/40 block font-light">Booking verified.</span>
                              </div>
                            </div>

                            <div className="relative flex gap-3.5 items-start">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center z-10 bg-[#141414] ${
                                ["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-400 text-green-400"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={Time01Icon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-white block">Pre-Installing Games</span>
                                <span className="text-[10px] text-white/40 block font-light">Preparing hardware.</span>
                              </div>
                            </div>

                            <div className="relative flex gap-3.5 items-start">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center z-10 bg-[#141414] ${
                                ["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-400 text-green-400"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-white block">Out for Delivery</span>
                                <span className="text-[10px] text-white/40 block font-light">Driver dispatched.</span>
                              </div>
                            </div>

                            <div className="relative flex gap-3.5 items-start">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center z-10 bg-[#141414] ${
                                ["delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-400 text-green-400 bg-green-400/10"
                                  : "border-white/10 text-white/20"
                              }`}>
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-white block">Delivered & Set up</span>
                                <span className="text-[10px] text-white/40 block font-light">Arrived at destination.</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-[10px] text-white/50 space-y-1.5">
                          <div className="flex justify-between"><span>Courier Status:</span><span className="font-semibold text-white uppercase tracking-wider">{displayBookingForTrack.tracking_status}</span></div>
                          <div className="flex justify-between"><span>Dest Link:</span><a href={displayBookingForTrack.map_link} target="_blank" rel="noopener noreferrer" className="text-gamebees-glow-blue underline truncate max-w-[120px]">View Google Maps</a></div>
                        </div>
                      </div>

                      {/* Right: Map simulation view */}
                      <div className="lg:col-span-2 card-polished overflow-hidden h-[300px] lg:h-[380px] relative border border-white/[0.03]">
                        <svg className="w-full h-full absolute inset-0 bg-[#0e0e0e]" viewBox="0 0 400 300">
                          <path d="M 0 50 L 400 50 M 0 150 L 400 150 M 0 250 L 400 250 M 80 0 L 80 300 M 200 0 L 200 300 M 320 0 L 320 300" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
                          <path d="M 80,250 L 200,250 L 200,150 L 320,150 L 320,50" fill="none" stroke="rgba(94, 159, 208, 0.15)" strokeWidth="3" strokeDasharray="5 4" />
                          <path 
                            d="M 80,250 L 200,250 L 200,150 L 320,150 L 320,50" 
                            fill="none" 
                            stroke="#5E9FD0" 
                            strokeWidth="3" 
                            className="stroke-dash" 
                            style={{
                              strokeDasharray: "400",
                              strokeDashoffset: displayBookingForTrack.tracking_status === "preparing" ? "400" : displayBookingForTrack.tracking_status === "shipped" ? "200" : "0",
                              transition: "stroke-dashoffset 2s ease-out-in"
                            }}
                          />
                          <circle cx="80" cy="250" r="6" fill="#1D496B" stroke="white" strokeWidth="1.5" />
                          <circle cx="320" cy="50" r="6" fill="#10B981" stroke="white" strokeWidth="1.5" />
                        </svg>

                        <div className="absolute bottom-[35px] left-[55px] flex flex-col items-center">
                          <span className="text-[8px] bg-black/80 px-1.5 py-0.5 rounded border border-white/10 text-white/50">Hub</span>
                        </div>
                        <div className="absolute top-[25px] right-[55px] flex flex-col items-center">
                          <span className="text-[8px] bg-black/80 px-1.5 py-0.5 rounded border border-green-500/20 text-green-400 font-bold">Delivery Dest</span>
                        </div>

                        {displayBookingForTrack.tracking_status === "shipped" && (
                          <div className="absolute p-1.5 bg-gamebees-accent-blue rounded-lg text-white border border-white/20 animate-bounce" style={{ bottom: "135px", left: "185px" }}>
                            <HugeiconsIcon icon={DeliveryTruck01Icon} size={16} />
                          </div>
                        )}
                        {displayBookingForTrack.tracking_status === "preparing" && (
                          <div className="absolute p-2 bg-gamebees-dark-navy/80 rounded-xl text-white border border-white/10 flex items-center gap-1.5" style={{ bottom: "25px", left: "125px" }}>
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-[9px] font-semibold">Packaging at Warehouse...</span>
                          </div>
                        )}
                        {displayBookingForTrack.tracking_status === "delivered" && (
                          <div className="absolute p-2 bg-green-500/80 rounded-xl text-white border border-white/10 flex items-center gap-1.5" style={{ top: "65px", right: "75px" }}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-white" />
                            <span className="text-[9px] font-bold">Courier Arrived!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Identity KYC */}
              {activeTab === "kyc" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Identity KYC Verification
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Verify your identity to lock in quick checkouts and avoid submitting documents on every single order.
                    </p>
                  </div>

                  {kycVerified ? (
                    <div className="card-polished p-8 text-center space-y-5 border border-green-500/10 bg-green-500/[0.01]">
                      <div className="mx-auto h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                        <HugeiconsIcon icon={Shield01Icon} size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Your Identity is KYC Verified</h4>
                        <p className="text-white/50 text-xs mt-1 font-light">
                          Verified Name: <strong className="text-white/80">{kycProfile?.fullName || user?.fullName}</strong>
                        </p>
                      </div>

                      <div className="max-w-md mx-auto text-left text-xs text-white/50 space-y-2 p-4 bg-black/30 rounded-2xl border border-white/[0.04] font-light">
                        <div className="flex justify-between"><span>Aadhaar status:</span><span className="text-green-400 font-bold uppercase tracking-wider">SUCCESS</span></div>
                        <div className="flex justify-between"><span>Document ID:</span><span className="font-mono text-white/70">XXXXXXXX{kycProfile?.aadhaarNumber ? kycProfile.aadhaarNumber.slice(-4) : "XXXX"}</span></div>
                        <div className="flex justify-between"><span>KYC Verification Date:</span><span className="text-white/70">{new Date().toLocaleDateString()}</span></div>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="btn-glow-pill px-6 py-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Go Rent Consoles</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="card-polished p-5 sm:p-8 space-y-6">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <HugeiconsIcon icon={Shield01Icon} size={18} className="text-gamebees-glow-blue" />
                          <span>Aadhaar eKYC Sandbox</span>
                        </h4>
                        <p className="text-white/40 text-xs font-light">
                          Enter your 12-digit Aadhaar to simulate eKYC matching. Use sandbox test code <strong>123456</strong> when prompted.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 block">Aadhaar Card Number</label>
                          <input
                            type="text"
                            maxLength={12}
                            disabled={otpSent}
                            value={aadhaarNum}
                            onChange={(e) => setAadhaarNum(e.target.value.replace(/\D/g, ""))}
                            placeholder="1234 5678 9012"
                            className="form-input tracking-[0.2em] font-mono text-center text-base"
                          />
                        </div>

                        {otpSent && (
                          <div className="space-y-2 animate-fadeInUp">
                            <label className="text-xs font-semibold text-white/70 block">Enter 6-Digit OTP</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={aadhaarOtp}
                              onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ""))}
                              placeholder="------"
                              className="form-input tracking-[0.4em] font-mono text-center text-lg border-green-500/30"
                            />
                          </div>
                        )}

                        {aadhaarError && (
                          <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2 font-light">
                            <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                            <span>{aadhaarError}</span>
                          </p>
                        )}

                        <div className="pt-2">
                          {verifyingAadhaar ? (
                            <div className="flex justify-center py-2">
                              <div className="h-6 w-6 border-2 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : !otpSent ? (
                            <button
                              onClick={handleSendAadhaarOtp}
                              disabled={aadhaarNum.length !== 12}
                              className="w-full py-3.5 rounded-xl bg-gamebees-accent-blue/80 hover:bg-gamebees-accent-blue text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              Send OTP Code
                            </button>
                          ) : (
                            <div className="flex gap-3">
                              <button
                                onClick={() => { setOtpSent(false); setAadhaarOtp(""); }}
                                className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
                              >
                                Back
                              </button>
                              <button
                                onClick={handleVerifyAadhaarOtp}
                                disabled={aadhaarOtp.length !== 6}
                                className="flex-1 py-3.5 rounded-xl bg-green-500/80 hover:bg-green-500 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                Complete KYC
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Settings */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Account & Legal Settings
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Manage account details and review platforms legal information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-polished p-5 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-2 flex items-center gap-1.5">
                        <HugeiconsIcon icon={UserIcon} size={16} className="text-gamebees-glow-blue" />
                        <span>Profile Information</span>
                      </h4>

                      <div className="space-y-3 text-xs font-light">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-white/40">Username</span>
                          <span className="text-white font-semibold">{user?.fullName || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-white/[0.02]">
                          <span className="text-white/40">Contact Email</span>
                          <span className="text-white font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-polished p-5 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-2 flex items-center gap-1.5">
                        <HugeiconsIcon icon={File01Icon} size={16} className="text-gamebees-glow-blue" />
                        <span>Rental Agreement & Policies</span>
                      </h4>

                      <div className="space-y-2.5 text-[11px] text-white/50 leading-relaxed font-light">
                        <p>
                          <strong>1. Fair Usage:</strong> Standard console rentals are intended for residential private usage. Commercial gaming setups require custom license configurations.
                        </p>
                        <p>
                          <strong>2. Hardware Protection:</strong> All console kits include damage warranty buffers. High gravity falls or liquid exposure will incur fee coverage up to actual device replacement rates.
                        </p>
                        <p>
                          <strong>3. Timely Return:</strong> Extensions must be logged in the system at least 24 hours prior to the return window check.
                        </p>
                      </div>
                    </div>

                    <div className="card-polished p-5 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-2 flex items-center gap-1.5">
                        <Sun className="h-4 w-4 text-gamebees-glow-blue" />
                        <span>Display Theme</span>
                      </h4>

                      <p className="text-white/50 text-[11px] font-light leading-relaxed">
                        Customize the visual aesthetic of the platform. Choose between the premium dark immersive interface or the clean light layout.
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            theme === "dark"
                              ? "bg-gamebees-accent-blue/20 border-gamebees-accent-blue text-gamebees-glow-blue shadow-[0_0_12px_rgba(36,101,150,0.15)]"
                              : "bg-white/[0.015] border-white/[0.04] text-white/50 hover:text-white hover:border-white/[0.08]"
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                          <span>Dark Theme</span>
                        </button>

                        <button
                          onClick={() => handleThemeChange("light")}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            theme === "light"
                              ? "bg-gamebees-accent-blue/20 border-gamebees-accent-blue text-gamebees-glow-blue shadow-[0_0_12px_rgba(36,101,150,0.15)]"
                              : "bg-white/[0.015] border-white/[0.04] text-white/50 hover:text-white hover:border-white/[0.08]"
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                          <span>White Theme</span>
                        </button>
                      </div>
                    </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Glass Dock Bottom Navbar (Mobile Only) */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 bg-zinc-950/80 border border-white/10 backdrop-blur-xl lg:hidden flex justify-around items-center py-2 px-1 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors cursor-pointer ${
            activeTab === "overview" ? "text-gamebees-glow-blue" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HugeiconsIcon icon={DashboardSquare01Icon} size={20} />
          <span className="text-[9px] mt-1 font-medium">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors cursor-pointer ${
            activeTab === "bookings" ? "text-gamebees-glow-blue" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
          <span className="text-[9px] mt-1 font-medium">Rent</span>
        </button>

        <button
          onClick={() => setActiveTab("track")}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors cursor-pointer relative ${
            activeTab === "track" ? "text-gamebees-glow-blue" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HugeiconsIcon icon={Compass01Icon} size={20} />
          <span className="text-[9px] mt-1 font-medium">Track</span>
          {activeBooking && (
            <span className="absolute top-1 right-5 h-1.5 w-1.5 rounded-full bg-gamebees-glow-blue" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors cursor-pointer relative ${
            activeTab === "kyc" ? "text-gamebees-glow-blue" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HugeiconsIcon icon={Shield01Icon} size={20} />
          <span className="text-[9px] mt-1 font-medium">KYC</span>
          {kycVerified && (
            <span className="absolute top-1 right-5 text-[8px] font-bold text-green-400">•</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors cursor-pointer ${
            activeTab === "settings" ? "text-gamebees-glow-blue" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HugeiconsIcon icon={Settings01Icon} size={20} />
          <span className="text-[9px] mt-1 font-medium">Settings</span>
        </button>
      </nav>

      {/* Booking Modal container */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); loadDashboardData(); }}
        initialConsoleName={modalConsoleName}
        initialDuration={modalDuration}
        initialTotal={modalDailyPrice * modalDuration}
        selectedItemId={modalItemId}
        availableItems={items}
        kycVerifiedProp={kycVerified}
        onRedirectToKyc={handleTriggerRedirectToKyc}
      />
    </div>
  );
}
