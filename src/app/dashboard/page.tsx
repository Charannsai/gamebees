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
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabType = "overview" | "bookings" | "track" | "kyc" | "settings";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [items, setItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // KYC State
  const [kycVerified, setKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycProfile, setKycProfile] = useState<any>(null);
  
  // New Manual KYC state
  const [kycName, setKycName] = useState("");
  const [kycPhone, setKycPhone] = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [kycError, setKycError] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Camera capture state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [settingsSubTab, setSettingsSubTab] = useState<"profile" | "orders" | "policies">("profile");

  useEffect(() => {
    // Read theme preference on mount
    const savedTheme = (localStorage.getItem("gamebees-theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (user) {
      setKycName(user.fullName || "");
      setKycPhone(user.primaryPhoneNumber?.phoneNumber || "");
    }
  }, [user]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

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
    if (initialLoad) setLoadingData(true);
    try {
      const [itemsRes, bookingsRes, kycRes] = await Promise.all([
        fetchItems(),
        fetchBookings(),
        getKycStatus()
      ]);

      if (itemsRes.success) setItems(itemsRes.data || []);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      
      if (kycRes.success && kycRes.profile) {
        setKycVerified(kycRes.verified);
        setKycProfile(kycRes.profile);
      } else {
        setKycVerified(false);
        setKycProfile(null);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
      setKycLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      loadDashboardData();
    }
  }, [isLoaded, user]);

  const handleOpenBooking = (item: any) => {
    router.push(`/book?itemId=${item.id}&name=${encodeURIComponent(item.name)}&price=${item.price}&duration=3`);
  };

  // Manual KYC Handlers
  const handleGetLocation = () => {
    setGettingLocation(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingLocation(false);
      },
      (err) => {
        console.error("Location error:", err);
        setLocationError("Permission denied or location lookup failed.");
        setGettingLocation(false);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 640;
          const MAX_HEIGHT = 480;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setter(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setKycError("Could not access camera. Please choose or drag-and-drop a selfie file instead.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.7);
        setSelfie(data);
        stopCamera();
      }
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycError("");
    if (!kycName || !kycPhone || !aadhaarNum || aadhaarNum.length !== 12 || !/^\d+$/.test(aadhaarNum)) {
      setKycError("Please provide all fields and a valid 12-digit Aadhaar number.");
      return;
    }
    if (latitude === null || longitude === null) {
      setKycError("Please allow live location tracking coordinates.");
      return;
    }
    if (!aadhaarFront || !aadhaarBack) {
      setKycError("Please upload both front and back sides of your Aadhaar card.");
      return;
    }
    if (!selfie) {
      setKycError("Please capture a live verification selfie.");
      return;
    }

    setSubmittingKyc(true);
    try {
      const res = await saveKyc({
        fullName: kycName,
        phone: kycPhone,
        aadhaarNumber: aadhaarNum,
        aadhaarVerified: false,
        selfieUrl: selfie,
        aadhaarFrontUrl: aadhaarFront,
        aadhaarBackUrl: aadhaarBack,
        latitude,
        longitude
      });

      if (res.success) {
        await loadDashboardData();
      } else {
        setKycError(res.error || "Failed to submit KYC data.");
      }
    } catch (err: any) {
      setKycError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmittingKyc(false);
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
      case "returned": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const activeBooking = bookings.find(b => b.status !== "completed" && b.status !== "returned" && b.status !== "discarded");
  const displayBookingForTrack = activeBooking || bookings[0];

  if (!isLoaded) {
    return (
      <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-[#141414]">
        <div suppressHydrationWarning className="h-8 w-8 border-4 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
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
                    
                    {bookings.filter(b => b.status !== "completed" && b.status !== "returned" && b.status !== "discarded").length === 0 ? (
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
                          .filter(b => b.status !== "completed" && b.status !== "returned" && b.status !== "discarded")
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
                                  <span className="text-gamebees-glow-blue font-bold">₹{b.total_price}</span>
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
                        <div key={item.id} className="card-polished p-5 flex flex-col justify-between border border-white/[0.03] group hover:border-gamebees-accent-blue/30 transition-all rounded-2xl">
                          <div className="space-y-3">
                            {/* Uploaded Product Image Container */}
                            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/40 border border-white/5 group-hover:border-gamebees-accent-blue/30 transition-all flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image_url || (Array.isArray(item.image_urls) && item.image_urls[0]) || "/ps5.png"}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/ps5.png";
                                }}
                              />
                              <div className="absolute top-2 left-2">
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-gamebees-glow-blue bg-gamebees-dark-navy/80 backdrop-blur-md border border-gamebees-accent-blue/30 px-2.5 py-1 rounded-full shadow-md">
                                  {item.category}
                                </span>
                              </div>

                              {Array.isArray(item.image_urls) && item.image_urls.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                                  📷 {item.image_urls.length} Photos
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className="text-base font-bold text-white group-hover:text-gamebees-glow-blue transition-colors truncate">
                                  {item.name}
                                </h4>
                                <div className="text-right shrink-0">
                                  <span className="text-lg font-black text-gamebees-glow-blue">₹{item.price}</span>
                                  <span className="text-[9px] text-white/30 block">/ day</span>
                                </div>
                              </div>
                              <p className="text-xs text-white/50 font-light leading-relaxed line-clamp-2">
                                {item.description || "Fully configured console with active game library ready for plug-and-play."}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenBooking(item)}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-gamebees-accent-blue/80 to-gamebees-medium-blue/60 hover:from-gamebees-accent-blue hover:to-gamebees-medium-blue border border-gamebees-accent-blue/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(36,101,150,0.25)] cursor-pointer"
                          >
                            <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
                            <span>Reserve Gear Now</span>
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
                    <div className="card-polished p-6 sm:p-10 flex flex-col justify-between border border-white/[0.03]">
                      
                      {/* Content Container */}
                      <div className="w-full space-y-8 flex-1 flex flex-col justify-between">
                        
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-gamebees-glow-blue bg-gamebees-accent-blue/10 px-2.5 py-1 rounded-full border border-gamebees-accent-blue/20">
                                Active Order
                              </span>
                              <span className="text-[10px] text-white/40 font-mono">
                                ID: #{displayBookingForTrack.id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-white mt-1.5">
                              {displayBookingForTrack.items?.name || "Gaming Console Setup"}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Status badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                              displayBookingForTrack.tracking_status === "delivered" 
                                ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                                : displayBookingForTrack.tracking_status === "shipped"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                : displayBookingForTrack.tracking_status === "returned"
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            }`}>
                              Status: {displayBookingForTrack.tracking_status}
                            </span>
                            
                            {/* Google Maps link if available */}
                            {displayBookingForTrack.map_link && (
                              <a 
                                href={displayBookingForTrack.map_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                              >
                                <HugeiconsIcon icon={Compass01Icon} size={12} />
                                <span>Google Maps</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Stepper progression (Responsive: Horizontal on desktop, Vertical on mobile) */}
                        <div className="py-4 my-auto">
                          
                          {/* Desktop Stepper */}
                          <div className="hidden md:flex items-stretch justify-between relative">
                            {/* Progress bar background */}
                            <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-white/[0.04] rounded-full -translate-y-1/2 z-0 overflow-hidden">
                              {/* Glowing active progress fill */}
                              <div 
                                className="h-full bg-gradient-to-r from-gamebees-accent-blue to-gamebees-glow-blue rounded-full transition-all duration-1000 ease-out" 
                                style={{
                                  width: displayBookingForTrack.tracking_status === "preparing" ? "25%" 
                                        : displayBookingForTrack.tracking_status === "shipped" ? "50%" 
                                        : displayBookingForTrack.tracking_status === "delivered" ? "75%" 
                                        : displayBookingForTrack.tracking_status === "returned" ? "100%" : "0%"
                                }}
                              />
                            </div>

                            {/* Step 1: Order Confirmed */}
                            <div className="relative flex flex-col items-center text-center w-1/5 z-10">
                              <div className="h-10 w-10 rounded-full border-2 bg-[#141414] border-green-500 text-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)] mx-auto">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="stroke-[3]" />
                              </div>
                              <span className="text-xs font-bold text-white mt-3 block">Order Confirmed</span>
                              <span className="text-[10px] text-white/40 mt-0.5 block font-light max-w-[130px] mx-auto">Booking verified</span>
                            </div>

                            {/* Step 2: Preparing */}
                            <div className="relative flex flex-col items-center text-center w-1/5 z-10">
                              <div className={`h-10 w-10 rounded-full border-2 bg-[#141414] flex items-center justify-center transition-all mx-auto ${
                                ["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={Time01Icon} size={16} />
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-3 block ${
                                ["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                              }`}>Pre-Installing Games</span>
                              <span className="text-[10px] text-white/40 mt-0.5 block font-light max-w-[130px] mx-auto">Preparing hardware</span>
                            </div>

                            {/* Step 3: Shipped */}
                            <div className="relative flex flex-col items-center text-center w-1/5 z-10">
                              <div className={`h-10 w-10 rounded-full border-2 bg-[#141414] flex items-center justify-center transition-all mx-auto ${
                                ["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={16} />
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-3 block ${
                                ["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                              }`}>Out for Delivery</span>
                              <span className="text-[10px] text-white/40 mt-0.5 block font-light max-w-[130px] mx-auto">Courier dispatched</span>
                            </div>

                            {/* Step 4: Delivered */}
                            <div className="relative flex flex-col items-center text-center w-1/5 z-10">
                              <div className={`h-10 w-10 rounded-full border-2 bg-[#141414] flex items-center justify-center transition-all mx-auto ${
                                ["delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={Shield01Icon} size={16} />
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-3 block ${
                                ["delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                              }`}>Delivered & Set up</span>
                              <span className="text-[10px] text-white/40 mt-0.5 block font-light max-w-[130px] mx-auto">Arrived at destination</span>
                            </div>

                            {/* Step 5: Returned */}
                            <div className="relative flex flex-col items-center text-center w-1/5 z-10">
                              <div className={`h-10 w-10 rounded-full border-2 bg-[#141414] flex items-center justify-center transition-all mx-auto ${
                                ["returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={RefreshIcon} size={16} />
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-3 block ${
                                ["returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                              }`}>Returned & Restored</span>
                              <span className="text-[10px] text-white/40 mt-0.5 block font-light max-w-[130px] mx-auto">Inventory returned</span>
                            </div>
                          </div>

                          {/* Mobile Stepper (Vertical Timeline) */}
                          <div className="md:hidden space-y-6 relative pl-6">
                            {/* Vertical connector line */}
                            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-white/[0.04] overflow-hidden">
                              {/* Glowing active progress fill */}
                              <div 
                                className="w-full bg-gradient-to-b from-gamebees-accent-blue to-gamebees-glow-blue transition-all duration-1000 ease-out" 
                                style={{
                                  height: displayBookingForTrack.tracking_status === "preparing" ? "25%" 
                                        : displayBookingForTrack.tracking_status === "shipped" ? "50%" 
                                        : displayBookingForTrack.tracking_status === "delivered" ? "75%" 
                                        : displayBookingForTrack.tracking_status === "returned" ? "100%" : "0%"
                                }}
                              />
                            </div>

                            {/* Step 1 */}
                            <div className="relative flex items-start gap-4">
                              <div className="h-5 w-5 rounded-full border-2 bg-[#141414] border-green-500 text-green-400 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-white block">Order Confirmed</span>
                                <span className="text-[10px] text-white/40 block font-light">Booking verified.</span>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex items-start gap-4">
                              <div className={`h-5 w-5 rounded-full border-2 bg-[#141414] flex items-center justify-center z-10 transition-all ${
                                ["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={Time01Icon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold block ${
                                  ["preparing", "shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                                }`}>Pre-Installing Games</span>
                                <span className="text-[10px] text-white/40 block font-light">Preparing hardware.</span>
                              </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex items-start gap-4">
                              <div className={`h-5 w-5 rounded-full border-2 bg-[#141414] flex items-center justify-center z-10 transition-all ${
                                ["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold block ${
                                  ["shipped", "delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                                }`}>Out for Delivery</span>
                                <span className="text-[10px] text-white/40 block font-light">Driver dispatched.</span>
                              </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative flex items-start gap-4">
                              <div className={`h-5 w-5 rounded-full border-2 bg-[#141414] flex items-center justify-center z-10 transition-all ${
                                ["delivered", "returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={Shield01Icon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold block ${
                                  ["delivered", "returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                                }`}>Delivered & Set up</span>
                                <span className="text-[10px] text-white/40 block font-light">Arrived at destination.</span>
                              </div>
                            </div>

                            {/* Step 5 */}
                            <div className="relative flex items-start gap-4">
                              <div className={`h-5 w-5 rounded-full border-2 bg-[#141414] flex items-center justify-center z-10 transition-all ${
                                ["returned"].includes(displayBookingForTrack.tracking_status)
                                  ? "border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                                  : "border-white/10 text-white/20"
                              }`}>
                                {["returned"].includes(displayBookingForTrack.tracking_status) ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                                ) : (
                                  <HugeiconsIcon icon={RefreshIcon} size={10} />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold block ${
                                  ["returned"].includes(displayBookingForTrack.tracking_status) ? "text-white" : "text-white/30"
                                }`}>Returned & Restored</span>
                                <span className="text-[10px] text-white/40 block font-light">Inventory returned.</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Footer Status Message / Courier details */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gamebees-glow-blue opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gamebees-glow-blue"></span>
                            </span>
                            <span className="text-[11px] text-white/60 font-light">
                              {displayBookingForTrack.tracking_status === "preparing" 
                                ? "Hardware check & game download in progress at the warehouse hub."
                                : displayBookingForTrack.tracking_status === "shipped"
                                ? "Courier agent has loaded your device and is traveling on the route."
                                : displayBookingForTrack.tracking_status === "delivered"
                                ? "Equipment successfully hand-delivered and set up in your room."
                                : displayBookingForTrack.tracking_status === "returned"
                                ? "Equipment returned and checked back into warehouse inventory."
                                : "Delivery status is currently updated by dispatcher."
                              }
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-white/40 font-light whitespace-nowrap self-end sm:self-center">
                            Last update: Just now
                          </div>
                        </div>

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

                  {kycProfile?.kyc_status === 'approved' ? (
                    <div className="card-polished p-8 text-center space-y-5 border border-green-500/10 bg-green-500/[0.01]">
                      <div className="mx-auto h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                        <HugeiconsIcon icon={Shield01Icon} size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Your Identity is KYC Verified</h4>
                        <p className="text-white/50 text-xs mt-1 font-light">
                          Verified Name: <strong className="text-white/80">{kycProfile?.full_name}</strong>
                        </p>
                      </div>

                      <div className="max-w-md mx-auto text-left text-xs text-white/50 space-y-2 p-4 bg-black/30 rounded-2xl border border-white/[0.04] font-light">
                        <div className="flex justify-between"><span>Aadhaar status:</span><span className="text-green-400 font-bold uppercase tracking-wider">APPROVED</span></div>
                        <div className="flex justify-between"><span>Document ID:</span><span className="font-mono text-white/70">XXXXXXXX{kycProfile?.aadhaar_number ? kycProfile.aadhaar_number.slice(-4) : "XXXX"}</span></div>
                        <div className="flex justify-between"><span>KYC Verification Date:</span><span className="text-white/70">{new Date(kycProfile?.updated_at || Date.now()).toLocaleDateString()}</span></div>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="btn-glow-pill px-6 py-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Go Rent Consoles</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </button>
                    </div>
                  ) : kycProfile?.kyc_status === 'pending' ? (
                    <div className="card-polished p-8 text-center space-y-5 border border-amber-500/10 bg-amber-500/[0.01]">
                      <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-pulse">
                        <HugeiconsIcon icon={Shield01Icon} size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">KYC Verification Pending</h4>
                        <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-light max-w-sm mx-auto">
                          Your application has been received and is currently under review by our administration team. Check back shortly.
                        </p>
                      </div>

                      <div className="max-w-md mx-auto text-left text-xs text-white/50 space-y-2 p-4 bg-black/30 rounded-2xl border border-white/[0.04] font-light">
                        <div className="flex justify-between"><span>Status:</span><span className="text-amber-400 font-bold uppercase tracking-wider">UNDER REVIEW</span></div>
                        <div className="flex justify-between"><span>Name:</span><span className="text-white/80">{kycProfile?.full_name}</span></div>
                        <div className="flex justify-between"><span>Aadhaar:</span><span className="font-mono text-white/70">XXXXXXXX{kycProfile?.aadhaar_number?.slice(-4)}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="card-polished p-5 sm:p-8 space-y-6">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <HugeiconsIcon icon={Shield01Icon} size={18} className="text-gamebees-glow-blue" />
                          <span>Manual KYC Submission Form</span>
                        </h4>
                        <p className="text-white/40 text-xs font-light">
                          {kycProfile?.kyc_status === 'declined' ? (
                            <span className="text-red-400 font-bold block mb-2 bg-red-500/10 p-2.5 rounded-lg border border-red-500/25">
                              Previous submission was declined. Please re-upload valid details.
                            </span>
                          ) : null}
                          Verify your identity manually by uploading your coordinates, Aadhaar card front/back, and a live webcam selfie.
                        </p>
                      </div>

                      <form onSubmit={handleSubmitKyc} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/70 block">Full Name</label>
                            <input
                              type="text"
                              required
                              value={kycName}
                              onChange={(e) => setKycName(e.target.value)}
                              placeholder="Enter your full name"
                              className="form-input"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/70 block">Contact Phone</label>
                            <input
                              type="tel"
                              required
                              value={kycPhone}
                              onChange={(e) => setKycPhone(e.target.value)}
                              placeholder="E.g., +91 99887 76655"
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 block">12-Digit Aadhaar Card Number</label>
                          <input
                            type="text"
                            maxLength={12}
                            required
                            value={aadhaarNum}
                            onChange={(e) => setAadhaarNum(e.target.value.replace(/\D/g, ""))}
                            placeholder="1234 5678 9012"
                            className="form-input tracking-[0.2em] font-mono text-center text-base"
                          />
                        </div>

                        {/* Live Location Block */}
                        <div className="p-4.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div>
                              <span className="text-xs font-bold text-white block">1. Live Location Coordinates</span>
                              <span className="text-[10px] text-white/30 font-light block mt-0.5">We must verify your current dispatch location.</span>
                            </div>
                            
                            {latitude !== null && longitude !== null ? (
                              <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[10px] text-center">
                                GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={gettingLocation}
                                className="px-4 py-2 bg-gamebees-accent-blue/80 hover:bg-gamebees-accent-blue text-xs font-semibold rounded-lg transition-all text-white flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {gettingLocation ? (
                                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <HugeiconsIcon icon={Location01Icon} size={14} />
                                    <span>Get GPS Coordinates</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {locationError && (
                            <p className="text-[10px] text-red-400 font-light">{locationError}</p>
                          )}
                        </div>

                        {/* Aadhaar Images Upload Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Aadhaar Front */}
                          <div className="p-4.5 rounded-xl bg-white/[0.015] border border-white/[0.04] flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
                            <span className="text-xs font-bold text-white block">2. Aadhaar Front Page</span>
                            {aadhaarFront ? (
                              <div className="relative h-20 w-32 border border-white/10 rounded-lg overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setAadhaarFront(null)}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-red-400 transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <label className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-all">
                                <span>Choose Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, setAadhaarFront)}
                                />
                              </label>
                            )}
                          </div>

                          {/* Aadhaar Back */}
                          <div className="p-4.5 rounded-xl bg-white/[0.015] border border-white/[0.04] flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
                            <span className="text-xs font-bold text-white block">3. Aadhaar Back Page</span>
                            {aadhaarBack ? (
                              <div className="relative h-20 w-32 border border-white/10 rounded-lg overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setAadhaarBack(null)}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-red-400 transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <label className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-all">
                                <span>Choose Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, setAadhaarBack)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Selfie Camera Capture Block */}
                        <div className="p-4.5 rounded-xl bg-white/[0.015] border border-white/[0.04] flex flex-col items-center justify-center gap-3 text-center min-h-[180px]">
                          <span className="text-xs font-bold text-white block">4. Live Camera Selfie</span>
                          {cameraActive ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative h-40 aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={captureSelfie}
                                  className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-[10px] font-bold text-white cursor-pointer"
                                >
                                  Take Photo
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : selfie ? (
                            <div className="relative h-28 aspect-video border border-white/10 rounded-lg overflow-hidden group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={selfie} alt="Selfie preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setSelfie(null)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-red-400 transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={startCamera}
                                className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-xs font-semibold text-white/80 hover:text-white cursor-pointer"
                              >
                                Capture Selfie Camera
                              </button>
                              <label className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-xs font-semibold text-white/80 hover:text-white cursor-pointer transition-all">
                                <span>Upload Selfie File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, setSelfie)}
                                />
                              </label>
                            </div>
                          )}
                          <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {kycError && (
                          <p className="text-xs text-red-400 font-light text-center">{kycError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submittingKyc || !kycName || !kycPhone || !aadhaarNum || latitude === null || !aadhaarFront || !aadhaarBack || !selfie}
                          className="w-full py-3.5 rounded-xl btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {submittingKyc ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span>Submit Manual KYC Application</span>
                          )}
                        </button>
                      </form>
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
                      Manage account details, billing history, and review platforms legal information.
                    </p>
                  </div>

                  {/* Sub Tabs Selection */}
                  <div className="flex border-b border-white/[0.06] gap-6 pb-2">
                    <button
                      onClick={() => setSettingsSubTab("profile")}
                      className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                        settingsSubTab === "profile" 
                          ? "text-gamebees-glow-blue" 
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Profile & Theme
                      {settingsSubTab === "profile" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gamebees-accent-blue" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setSettingsSubTab("orders")}
                      className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 ${
                        settingsSubTab === "orders" 
                          ? "text-gamebees-glow-blue" 
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      <span>Order History</span>
                      {bookings.length > 0 && (
                        <span className="bg-gamebees-accent-blue/20 text-gamebees-glow-blue border border-gamebees-accent-blue/30 text-[9px] font-mono px-1.5 py-0.2 rounded-md">
                          {bookings.length}
                        </span>
                      )}
                      {settingsSubTab === "orders" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gamebees-accent-blue" />
                      )}
                    </button>

                    <button
                      onClick={() => setSettingsSubTab("policies")}
                      className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                        settingsSubTab === "policies" 
                          ? "text-gamebees-glow-blue" 
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Rental Agreement
                      {settingsSubTab === "policies" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gamebees-accent-blue" />
                      )}
                    </button>
                  </div>

                  {/* Sub Tab: Profile */}
                  {settingsSubTab === "profile" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
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

                  {/* Sub Tab: Orders */}
                  {settingsSubTab === "orders" && (
                    <div className="space-y-4 animate-fadeInUp">
                      {bookings.length === 0 ? (
                        <div className="card-polished p-16 text-center space-y-3">
                          <HugeiconsIcon icon={ShoppingBag01Icon} size={40} className="text-white/10 mx-auto" />
                          <p className="text-xs sm:text-sm text-white/50 font-light">You have no order history yet.</p>
                          <button 
                            onClick={() => setActiveTab("bookings")}
                            className="btn-glow-pill px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            Rent a Console Now
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {bookings.map((booking: any) => {
                            const dailyPrice = booking.items?.price || 499;
                            const totalBasePrice = dailyPrice * booking.duration_days;
                            const gst = Math.round(totalBasePrice * 0.18);
                            const totalBillingPrice = totalBasePrice + gst;
                            
                            return (
                              <div key={booking.id} className="card-polished p-5 sm:p-6 space-y-5 border border-white/[0.03]">
                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-gamebees-glow-blue bg-gamebees-accent-blue/10 px-2.5 py-1 rounded border border-gamebees-accent-blue/20">
                                        {booking.items?.category || "Console"}
                                      </span>
                                      <span className="text-[10px] text-white/40 font-mono">
                                        ID: #{booking.id.slice(-8).toUpperCase()}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-bold text-white mt-1">
                                      {booking.items?.name || "Gaming Console Setup"}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                    <span className="text-[10px] text-white/40">
                                      {new Date(booking.created_at).toLocaleDateString("en-IN", {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>

                                {/* Order & Delivery Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-white/60">
                                  <div className="space-y-3">
                                    <div>
                                      <strong className="text-white/80 block mb-0.5 font-bold">Rental Window:</strong>
                                      <span>{booking.duration_days} Days ({booking.start_date || "Immediate"} to {booking.end_date || "Immediate"})</span>
                                    </div>
                                    <div>
                                      <strong className="text-white/80 block mb-0.5 font-bold">Delivery Address:</strong>
                                      <span className="line-clamp-2">{booking.address}</span>
                                    </div>
                                  </div>

                                  {/* Billing Breakdown (Order Summary) */}
                                  <div className="bg-black/35 rounded-xl border border-white/[0.04] p-4 space-y-2 text-xs">
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider block border-b border-white/[0.04] pb-1.5">
                                      Billing & Invoice Summary
                                    </span>
                                    
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Daily rental price</span>
                                      <span className="text-white font-mono">₹{dailyPrice} / day</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Base fare ({booking.duration_days} days)</span>
                                      <span className="text-white font-mono">₹{totalBasePrice}</span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-white/40">GST & Service Tax (18%)</span>
                                      <span className="text-white font-mono">₹{gst}</span>
                                    </div>

                                    <div className="flex justify-between text-green-400">
                                      <span>Security Deposit</span>
                                      <span className="font-mono">₹0 (WAIVED)</span>
                                    </div>

                                    <div className="flex justify-between border-t border-white/[0.06] pt-2 font-bold">
                                      <span className="text-white">Total Amount Paid</span>
                                      <span className="text-gamebees-glow-blue font-mono">₹{booking.total_price || totalBillingPrice}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub Tab: Policies */}
                  {settingsSubTab === "policies" && (
                    <div className="card-polished p-5 space-y-4 animate-fadeInUp">
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
                  )}
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

    </div>
  );
}
