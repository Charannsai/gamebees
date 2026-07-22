"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  UserIcon, 
  CallingIcon, 
  CheckmarkCircle01Icon, 
  Camera01Icon, 
  Shield01Icon, 
  AlertCircleIcon, 
  RefreshIcon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  Calendar01Icon
} from "@hugeicons/core-free-icons";
import { createBooking, getKycStatus, fetchItems, fetchItemAvailability } from "@/app/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getBookedCountOnDate(dateStr: string, bookings: any[]): number {
  let count = 0;
  const targetTime = parseDateStr(dateStr).getTime();

  for (const b of bookings) {
    let sTime: number;
    let eTime: number;

    if (b.start_date && b.end_date) {
      sTime = parseDateStr(b.start_date).getTime();
      eTime = parseDateStr(b.end_date).getTime();
    } else if (b.created_at) {
      const createdDate = new Date(b.created_at);
      const cStr = formatDateStr(createdDate);
      sTime = parseDateStr(cStr).getTime();
      const dur = b.duration_days || 3;
      const endDate = new Date(sTime + (dur - 1) * 86400000);
      eTime = endDate.getTime();
    } else {
      continue;
    }

    if (targetTime >= sTime && targetTime <= eTime) {
      count++;
    }
  }

  return count;
}

function isDateAvailable(dateStr: string, quantity: number, bookings: any[]): boolean {
  const count = getBookedCountOnDate(dateStr, bookings);
  return count < (quantity || 1);
}

function findEarliestAvailableDate(fromDate: Date, quantity: number, bookings: any[]): Date {
  let curr = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  for (let i = 0; i < 365; i++) {
    const dStr = formatDateStr(curr);
    if (isDateAvailable(dStr, quantity, bookings)) {
      return curr;
    }
    curr = new Date(curr.getTime() + 86400000);
  }
  return fromDate;
}

function isRangeAvailable(startStr: string, endStr: string, quantity: number, bookings: any[]): boolean {
  if (!startStr || !endStr) return true;
  let curr = parseDateStr(startStr);
  const end = parseDateStr(endStr);
  if (curr.getTime() > end.getTime()) return false;

  while (curr.getTime() <= end.getTime()) {
    const dStr = formatDateStr(curr);
    if (!isDateAvailable(dStr, quantity, bookings)) {
      return false;
    }
    curr = new Date(curr.getTime() + 86400000);
  }
  return true;
}

function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Params
  const selectedItemId = searchParams.get("itemId") || "";
  const initialConsoleName = searchParams.get("name") || "PlayStation 5 Pro Console";
  const initialDuration = Number(searchParams.get("duration")) || 3;
  const pricePerDay = Number(searchParams.get("price")) || 12;
  const initialTotal = pricePerDay * initialDuration;

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  
  // Step 1: Personal Details & Availability Calendar
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [kycAddress, setKycAddress] = useState("");
  const [kycMapLink, setKycMapLink] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customMapLink, setCustomMapLink] = useState("");
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [isCustomLocationConfirmed, setIsCustomLocationConfirmed] = useState(false);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Availability & Calendar state
  const [availabilityItem, setAvailabilityItem] = useState<any | null>(null);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [startDateStr, setStartDateStr] = useState<string>("");
  const [endDateStr, setEndDateStr] = useState<string>("");
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  
  // Step 2: Automated KYC status check
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [dbKycStatus, setDbKycStatus] = useState<"pending" | "approved" | "declined" | "not_applied">("not_applied");
  const [dbKycVerified, setDbKycVerified] = useState(false);

  const [isLightTheme, setIsLightTheme] = useState(false);
  
  // Step 3: Selfie Capture
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "streaming" | "captured" | "error">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Step 4: Final Consent & Total
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalChecked, setModalChecked] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Redirect to Clerk Sign In if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/sign-in?redirect_url=/book${window.location.search}`);
    }
  }, [isLoaded, isSignedIn, router]);

  // Load available items
  useEffect(() => {
    fetchItems().then((res) => {
      if (res.success && res.data) {
        setAvailableItems(res.data);
      }
    });
  }, []);

  // Fetch Availability & Booked Dates for selected item
  useEffect(() => {
    let targetId = selectedItemId;
    if (!targetId && availableItems.length > 0) {
      const match = availableItems.find((i) => i.name === initialConsoleName);
      if (match) targetId = match.id;
      else targetId = availableItems[0].id;
    }

    if (targetId) {
      setLoadingAvailability(true);
      fetchItemAvailability(targetId)
        .then((res) => {
          if (res.success && res.item) {
            setAvailabilityItem(res.item);
            setActiveBookings(res.bookings || []);
            
            const earliestStart = findEarliestAvailableDate(new Date(), res.item.quantity || 1, res.bookings || []);
            const startStr = formatDateStr(earliestStart);
            const endObj = new Date(earliestStart);
            endObj.setDate(endObj.getDate() + 2); // 3 days total
            const endStr = formatDateStr(endObj);
            
            setStartDateStr(startStr);
            setEndDateStr(endStr);
            setCurrentCalendarMonth(new Date(earliestStart.getFullYear(), earliestStart.getMonth(), 1));
          }
        })
        .catch((err) => console.error("fetchItemAvailability error:", err))
        .finally(() => setLoadingAvailability(false));
    }
  }, [selectedItemId, availableItems, initialConsoleName]);

  const durationDays = useMemo(() => {
    if (!startDateStr || !endDateStr) return 3;
    const start = parseDateStr(startDateStr);
    const end = parseDateStr(endDateStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / 86400000) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [startDateStr, endDateStr]);

  const computedTotalPrice = useMemo(() => {
    if (!availabilityItem) return initialTotal;
    const base3DayRate = availabilityItem.price_3_days || (availabilityItem.price ? availabilityItem.price * 3 : 1497);
    const extraDayRate = availabilityItem.price_extra_day || availabilityItem.price || 400;
    
    if (durationDays <= 3) {
      return base3DayRate;
    }
    return base3DayRate + (durationDays - 3) * extraDayRate;
  }, [availabilityItem, durationDays, initialTotal]);

  const isSelectionValid = useMemo(() => {
    if (!startDateStr || !endDateStr) return true;
    return isRangeAvailable(startDateStr, endDateStr, availabilityItem?.quantity || 1, activeBookings);
  }, [startDateStr, endDateStr, availabilityItem, activeBookings]);

  const earliestAvailableDateStr = useMemo(() => {
    if (!availabilityItem) return "";
    const d = findEarliestAvailableDate(new Date(), availabilityItem.quantity || 1, activeBookings);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [availabilityItem, activeBookings]);

  const calendarDaysGrid = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const todayStr = formatDateStr(new Date());
    const grid = [];

    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dObj = new Date(year, month, d);
      const dStr = formatDateStr(dObj);
      const isPast = dStr < todayStr;
      const isAvail = isDateAvailable(dStr, availabilityItem?.quantity || 1, activeBookings);
      const isStart = dStr === startDateStr;
      const isEnd = dStr === endDateStr;
      const isInRange = Boolean(
        startDateStr && 
        endDateStr && 
        dStr > startDateStr && 
        dStr < endDateStr
      );

      grid.push({
        dStr,
        dayNum: d,
        isPast,
        isAvail,
        isStart,
        isEnd,
        isInRange
      });
    }

    return grid;
  }, [currentCalendarMonth, startDateStr, endDateStr, availabilityItem, activeBookings]);

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

  // Clean up camera stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // Trigger camera on Step 3
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [step]);

  // Fetch KYC on mount/load
  useEffect(() => {
    if (isSignedIn) {
      setLoadingDetails(true);
      getKycStatus()
        .then((res) => {
          if (res.success && res.profile) {
            if (res.profile.full_name) {
              setName((prev) => prev || res.profile.full_name || "");
            }
            if (res.profile.phone) {
              setPhone((prev) => prev || res.profile.phone || "");
            }
            if (res.profile.latitude && res.profile.longitude) {
              const kAddr = `Live Location Coords: ${res.profile.latitude}, ${res.profile.longitude}`;
              const kMap = `https://www.google.com/maps/search/?api=1&query=${res.profile.latitude},${res.profile.longitude}`;
              setKycAddress(kAddr);
              setKycMapLink(kMap);
              setAddress((prev) => prev || kAddr);
              setMapLink((prev) => prev || kMap);
            }
            setDbKycStatus(res.profile.kyc_status || "pending");
            setDbKycVerified(res.verified);
          }
        })
        .catch((err) => {
          console.error("Booking KYC lookup error on load:", err);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [isSignedIn]);

  // Fetch actual KYC status from DB when reaching step 2
  useEffect(() => {
    if (step === 2) {
      setCheckingKyc(true);
      getKycStatus()
        .then((res) => {
          if (res.success && res.profile) {
            setDbKycStatus(res.profile.kyc_status || "pending");
            setDbKycVerified(res.verified);
            
            // Auto populate address & maps link from KYC coordinates if available
            if (res.profile.latitude && res.profile.longitude) {
              const kAddr = `Live Location Coords: ${res.profile.latitude}, ${res.profile.longitude}`;
              const kMap = `https://www.google.com/maps/search/?api=1&query=${res.profile.latitude},${res.profile.longitude}`;
              setKycAddress(kAddr);
              setKycMapLink(kMap);
              setAddress((prev) => prev || kAddr);
              setMapLink((prev) => prev || kMap);
            }
          } else {
            setDbKycStatus("not_applied");
            setDbKycVerified(false);
          }
          setCheckingKyc(false);
        })
        .catch((err) => {
          console.error("Booking KYC lookup error at step 2:", err);
          setCheckingKyc(false);
        });
    }
  }, [step]);

  function handleEnableCustomLocation() {
    setUseCustomLocation(true);
    setShowAddressEdit(true);
    setCustomAddress("");
    setCustomMapLink("");
    setIsCustomLocationConfirmed(false);
  }

  function handleConfirmCustomLocation(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (customAddress.trim() && customMapLink.trim()) {
      setIsCustomLocationConfirmed(true);
    }
  }

  function handleRevertToKycLocation() {
    setUseCustomLocation(false);
    setShowAddressEdit(false);
    setCustomAddress("");
    setCustomMapLink("");
    setIsCustomLocationConfirmed(false);
  }

  // Camera helpers
  async function startCamera() {
    try {
      setCameraStatus("idle");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStatus("streaming");
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraStatus("error");
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }

  function capturePhoto() {
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
        
        const photoData = canvas.toDataURL("image/jpeg", 0.85);
        setSelfieCaptured(photoData);
        setCameraStatus("captured");
        stopCamera();
      }
    }
  }

  function handleRetake() {
    setSelfieCaptured(null);
    setCameraStatus("idle");
    startCamera();
  }

  // Submit Booking
  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) return;

    setIsSubmitting(true);
    
    let itemId = selectedItemId;
    if (!itemId && availableItems.length > 0) {
      const match = availableItems.find(i => i.name === initialConsoleName);
      if (match) itemId = match.id;
    }

    try {
      const isVerified = dbKycVerified;
      const finalAddress = useCustomLocation ? customAddress : (kycAddress || address);
      const finalMapLink = useCustomLocation ? customMapLink : (kycMapLink || mapLink);

      const res = await createBooking({
        fullName: name,
        phone: phone,
        address: finalAddress,
        mapLink: finalMapLink,
        aadhaarNumber: isVerified ? "PROFILE_VERIFIED" : "UNVERIFIED_PENDING",
        aadhaarVerified: isVerified,
        selfieUrl: selfieCaptured || "data:image/png;base64,mockselfie",
        itemId: itemId || "d832c3f8-8fa3-4df4-8d48-8dfa1ad3943f",
        startDate: startDateStr,
        endDate: endDateStr,
        durationDays: durationDays,
        totalPrice: computedTotalPrice
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setSubmitError("Booking failed: " + res.error);
      }
    } catch (err: any) {
      console.error("Booking submit error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 border-4 border-[#246596] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Styling helpers
  const labelColor = isLightTheme ? "text-neutral-700 font-semibold" : "text-white/70 font-semibold";
  const subTextColor = isLightTheme ? "text-neutral-500" : "text-white/50";
  const headerColor = isLightTheme ? "text-neutral-900" : "text-white";
  const textBodyColor = isLightTheme ? "text-neutral-700" : "text-white/70";
  const cardBg = isLightTheme ? "bg-neutral-50 border border-neutral-200 text-neutral-800" : "bg-[#10324d]/10 border border-white/5 text-white";
  const separatorBg = isLightTheme ? "bg-neutral-200" : "bg-white/10";
  
  const backBtnClass = `flex-1 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
    isLightTheme
      ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
  }`;
  
  const inputClassName = `w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
    isLightTheme
      ? "bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-950 focus:bg-white"
      : "bg-[#10324d]/15 border border-[#5e9fd0]/10 text-white placeholder-white/20 focus:border-[#5e9fd0]/35 focus:bg-[#10324d]/25"
  }`;

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
      <div 
        className="absolute w-[600px] h-[600px] left-[-200px] bottom-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.08) 0%, rgba(20, 20, 20, 0) 75%)",
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
            onClick={() => router.back()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isLightTheme
                ? "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                : "bg-white/5 border-white/10 text-white/80 hover:text-white"
            }`}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
            <span>Go Back</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 mt-8 sm:mt-12 relative z-10">
        
        {/* Main Card */}
        <div className={`w-full rounded-[24px] pt-8 pb-8 px-6 sm:px-8 border transition-all ${
          isLightTheme 
            ? "bg-white border-neutral-200 text-neutral-850 shadow-2xl" 
            : "card-polished border-gamebees-accent-blue/30 text-white shadow-[0_0_50px_rgba(36,101,150,0.12)]"
        }`}>
          
          {/* Step Indicator */}
          {!isSuccess && (
            <div className={`mb-8 border-b pb-5 ${isLightTheme ? "border-neutral-200" : "border-white/[0.05]"}`}>
              <div className="flex items-center justify-between relative">
                {[
                  { num: 1, label: "Details" },
                  { num: 2, label: "KYC Status" },
                  { num: 3, label: "Selfie" },
                  { num: 4, label: "Confirm" },
                ].map((s, idx, arr) => (
                  <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.num
                          ? "bg-[#246596] text-white shadow-[0_0_14px_rgba(36,101,150,0.5)] scale-110"
                          : step > s.num
                          ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                          : isLightTheme
                          ? "bg-neutral-100 text-neutral-400 border border-neutral-200"
                          : "bg-white/5 text-white/40 border border-white/5"
                      }`}>
                        {step > s.num ? (
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="stroke-[3] text-emerald-600" />
                        ) : s.num}
                      </div>
                      <span className={`text-[10px] font-semibold tracking-wide ${
                        step === s.num
                          ? isLightTheme ? "text-[#246596]" : "text-[#5e9fd0]"
                          : step > s.num
                          ? "text-emerald-600"
                          : isLightTheme ? "text-neutral-400" : "text-white/30"
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`flex-1 h-[2px] mb-5 mx-1 transition-all ${
                        step > s.num
                          ? "bg-emerald-500/50" 
                          : isLightTheme 
                          ? "bg-neutral-200" 
                          : "bg-white/10"
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {!isSuccess ? (
            <div>
              {/* Step 1: Rental Dates, Availability Calendar & User details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black ${headerColor}`}>
                      Rental Dates & Information
                    </h3>
                    <p className={`${subTextColor} text-xs mt-1 font-light`}>
                      Select your rental dates from the availability calendar and provide contact details.
                    </p>
                  </div>

                  {/* Availability & Calendar Card */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isLightTheme ? "bg-neutral-50 border-neutral-200" : "bg-black/30 border-white/10"
                  }`}>
                    {/* Availability Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-neutral-200 dark:border-white/10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="p-2 rounded-xl bg-[#246596]/10 text-[#246596] shrink-0 mt-0.5 sm:mt-0">
                          <HugeiconsIcon icon={Calendar01Icon} size={18} />
                        </span>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold leading-tight ${headerColor}`}>{initialConsoleName}</h4>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                            <span>● Live Inventory Availability</span>
                          </span>
                        </div>
                      </div>

                      {earliestAvailableDateStr && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0 self-start sm:self-center">
                          Earliest: {earliestAvailableDateStr}
                        </span>
                      )}
                    </div>

                    {/* Date Pickers Row */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className={`text-[10px] font-semibold block mb-1 ${labelColor}`}>Start Date (From)</label>
                        <input
                          type="date"
                          value={startDateStr}
                          min={formatDateStr(new Date())}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStartDateStr(val);
                            if (val) {
                              const d = parseDateStr(val);
                              if (!isNaN(d.getTime())) {
                                setCurrentCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                              }
                            }
                            if (endDateStr && val > endDateStr) {
                              setEndDateStr("");
                            }
                          }}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className={`text-[10px] font-semibold block mb-1 ${labelColor}`}>End Date (To)</label>
                        <input
                          type="date"
                          value={endDateStr}
                          min={startDateStr || formatDateStr(new Date())}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEndDateStr(val);
                            if (val && (!startDateStr || startDateStr > val)) {
                              setStartDateStr(val);
                            }
                          }}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    {/* Interactive Calendar Month Grid */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold px-1">
                        <button
                          type="button"
                          onClick={() => {
                            const prev = new Date(currentCalendarMonth);
                            prev.setMonth(prev.getMonth() - 1);
                            setCurrentCalendarMonth(prev);
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isLightTheme 
                              ? "border-neutral-200 hover:bg-neutral-200 text-neutral-700" 
                              : "border-white/10 hover:bg-white/10 text-white"
                          }`}
                        >
                          ←
                        </button>
                        <span className={headerColor}>
                          {currentCalendarMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = new Date(currentCalendarMonth);
                            next.setMonth(next.getMonth() + 1);
                            setCurrentCalendarMonth(next);
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isLightTheme 
                              ? "border-neutral-200 hover:bg-neutral-200 text-neutral-700" 
                              : "border-white/10 hover:bg-white/10 text-white"
                          }`}
                        >
                          →
                        </button>
                      </div>

                      {/* Days of Week */}
                      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-neutral-400">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>

                      {/* Calendar Grid Cells */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {calendarDaysGrid.map((dayObj, idx) => {
                          if (!dayObj) {
                            return <div key={idx} className="h-8" />;
                          }

                          const { dStr, dayNum, isPast, isAvail, isStart, isEnd, isInRange } = dayObj;

                          return (
                            <button
                              key={dStr}
                              type="button"
                              disabled={isPast || !isAvail}
                              onClick={() => {
                                if (!startDateStr || (startDateStr && endDateStr)) {
                                  setStartDateStr(dStr);
                                  setEndDateStr("");
                                } else {
                                  if (dStr >= startDateStr) {
                                    setEndDateStr(dStr);
                                  } else {
                                    setStartDateStr(dStr);
                                    setEndDateStr("");
                                  }
                                }
                              }}
                              className={`h-8 rounded-lg text-[11px] font-semibold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                                isStart || isEnd
                                  ? "bg-[#246596] text-white font-extrabold shadow-sm scale-105 z-10"
                                  : isInRange
                                  ? "bg-[#246596]/20 text-[#246596] dark:text-[#5e9fd0]"
                                  : isPast
                                  ? "opacity-30 cursor-not-allowed text-neutral-400"
                                  : !isAvail
                                  ? isLightTheme
                                    ? "bg-red-50 text-red-500 border border-red-200 cursor-not-allowed line-through"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed line-through"
                                  : isLightTheme
                                  ? "hover:bg-neutral-200 text-neutral-800"
                                  : "hover:bg-white/10 text-white"
                              }`}
                              title={!isAvail ? "Fully Booked" : isPast ? "Past Date" : `Select ${dStr}`}
                            >
                              <span>{dayNum}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className={`flex items-center justify-center gap-4 text-[10px] font-medium pt-1 ${
                        isLightTheme ? "text-neutral-700 font-semibold" : "text-white/70"
                      }`}>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#246596]" /> Selected</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Booked</span>
                      </div>
                    </div>

                    {/* Duration & Availability Validation Notices */}
                    {durationDays < 3 && startDateStr && endDateStr && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-fadeInUp">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 text-amber-600" />
                        <span>Minimum rental duration is 3 days. Please select at least 3 days.</span>
                      </div>
                    )}

                    {!isSelectionValid && startDateStr && endDateStr && durationDays >= 3 && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-semibold flex items-center gap-2 animate-fadeInUp">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 text-red-600" />
                        <span>Some dates in your selected range are fully booked. Please adjust dates.</span>
                      </div>
                    )}

                    {/* Dynamic Rental Price Summary Card */}
                    {startDateStr && endDateStr && durationDays >= 3 && isSelectionValid && (
                      <div className={`p-3.5 rounded-xl border space-y-2 text-xs animate-fadeInUp ${
                        isLightTheme ? "bg-white border-neutral-200" : "bg-black/40 border-white/5"
                      }`}>
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#246596]">
                          <span>Price Breakdown ({durationDays} Days)</span>
                          <span>₹{computedTotalPrice} Total</span>
                        </div>

                        <div className="space-y-1 text-[11px] font-light">
                          <div className="flex justify-between">
                            <span className={subTextColor}>Base 3-Day Rate</span>
                            <span>₹{availabilityItem?.price_3_days || (availabilityItem?.price ? availabilityItem.price * 3 : 1497)}</span>
                          </div>
                          {durationDays > 3 && (
                            <div className="flex justify-between">
                              <span className={subTextColor}>Extra Days ({durationDays - 3} × ₹{availabilityItem?.price_extra_day || availabilityItem?.price || 400})</span>
                              <span>+₹{(durationDays - 3) * (availabilityItem?.price_extra_day || availabilityItem?.price || 400)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section B: Contact Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className={`text-xs block ${labelColor}`}>Full Name</label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10 ${
                          isLightTheme ? "text-neutral-400" : "text-white/45"
                        }`}>
                          <HugeiconsIcon icon={UserIcon} size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter full name"
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-xs block ${labelColor}`}>Mobile Number</label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10 ${
                          isLightTheme ? "text-neutral-400" : "text-white/45"
                        }`}>
                          <HugeiconsIcon icon={CallingIcon} size={16} />
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter mobile number"
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={loadingDetails || !name || !phone || !startDateStr || !endDateStr || durationDays < 3 || !isSelectionValid}
                    className="w-full mt-6 py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingDetails ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Retrieving profile details...</span>
                      </>
                    ) : (
                      <span>Continue to Identity Verification</span>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: Automated KYC verification check */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${headerColor}`}>
                      <HugeiconsIcon icon={Shield01Icon} size={22} className="text-[#246596]" />
                      <span>Identity KYC Status</span>
                    </h3>
                    <p className={`${subTextColor} text-xs mt-1 font-light`}>
                      Verifying secure identity profile from database records.
                    </p>
                  </div>

                  {checkingKyc ? (
                    <div className={`p-12 text-center space-y-4 rounded-xl ${
                      isLightTheme ? "bg-neutral-50 border border-neutral-200" : "card-polished"
                    }`}>
                      <div className="h-8 w-8 border-4 border-[#246596] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className={`text-xs font-light ${subTextColor}`}>Querying KYC database... Please wait.</p>
                    </div>
                  ) : dbKycStatus === "approved" || dbKycVerified ? (
                    <div className="space-y-6">
                      <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-4 animate-fadeInUp">
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                          <HugeiconsIcon icon={Shield01Icon} size={20} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>Identity KYC Verified</h4>
                          <p className={`${subTextColor} text-xs mt-1 font-light`}>Profile checks passed successfully.</p>
                        </div>

                        <div className={`text-left text-[11px] space-y-1.5 p-3.5 rounded-lg font-light ${
                          isLightTheme ? "bg-neutral-100 text-neutral-600" : "bg-black/20 text-white/50"
                        }`}>
                          <div className="flex justify-between"><span>eKYC Registry:</span><span className="text-green-600 font-semibold">Matched</span></div>
                          <div className="flex justify-between"><span>User Profile:</span><span className={isLightTheme ? "text-neutral-800 font-medium" : "text-white/80"}>{name}</span></div>
                          <div className="flex justify-between"><span>Status Check:</span><span className="text-green-600 font-semibold">Verified</span></div>
                        </div>
                      </div>

                      <button
                        onClick={() => setStep(3)}
                        className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                      >
                        Continue to Live Selfie Verification
                      </button>
                    </div>
                  ) : dbKycStatus === "pending" ? (
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4 animate-fadeInUp">
                        <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 animate-pulse">
                          <HugeiconsIcon icon={Shield01Icon} size={20} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>KYC Verification Under Review</h4>
                          <p className={`${subTextColor} text-xs mt-1.5 leading-relaxed font-light`}>
                            Your profile has been submitted and is currently being manually audited by our admins. You can complete booking once approved.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                      >
                        Go to User Dashboard
                      </button>
                    </div>
                  ) : dbKycStatus === "declined" ? (
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-4 animate-fadeInUp">
                        <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-600">
                          <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>KYC Verification Declined</h4>
                          <p className={`${subTextColor} text-xs mt-1.5 leading-relaxed font-light`}>
                            Your previous KYC details check has failed manual verification. Please re-apply in the dashboard.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                      >
                        Re-Apply KYC in Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-[#246596]/10 border border-[#246596]/20 text-center space-y-4 animate-fadeInUp">
                        <div className="mx-auto h-12 w-12 rounded-full bg-[#246596]/20 flex items-center justify-center text-[#246596]">
                          <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>KYC Profile Required</h4>
                          <p className={`${subTextColor} text-xs mt-1.5 leading-relaxed font-light`}>
                            Manual identity verification is required to complete console bookings. Please submit your info.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                      >
                        Complete KYC Application
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Selfie Capture */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${headerColor}`}>
                      <span className="p-2 rounded-xl bg-[#246596]/10 text-[#246596]">
                        <HugeiconsIcon icon={Camera01Icon} size={20} />
                      </span>
                      <span>Liveness & Selfie Verification</span>
                    </h3>
                    <p className={`${subTextColor} text-xs mt-1.5 font-light`}>
                      Ensure your face fits inside the camera view and click the shutter button.
                    </p>
                  </div>

                  <div className={`relative aspect-video w-full max-w-sm mx-auto bg-[#0b132b] rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all ${
                    isLightTheme ? "border border-neutral-300" : "border border-white/15"
                  }`}>
                    {!selfieCaptured ? (
                      <>
                        <video
                          ref={videoRef}
                          muted
                          playsInline
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        
                        {/* Face guide overlay */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                          <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-[50%] border-2 border-dashed border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] flex items-center justify-center">
                            {cameraStatus === "streaming" && (
                              <span className="text-[10px] text-white/70 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-medium">
                                Position face here
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Live Badge */}
                        {cameraStatus === "streaming" && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 z-10">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Camera</span>
                          </div>
                        )}

                        {/* Shutter Button */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            disabled={cameraStatus !== "streaming"}
                            className="h-14 w-14 rounded-full border-4 border-white/30 hover:border-white bg-[#246596] hover:bg-[#1d496b] flex items-center justify-center shadow-xl transition-all duration-300 transform active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                            title="Capture Photo"
                          >
                            <div className="h-6 w-6 rounded-full bg-white group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selfieCaptured} alt="Selfie preview" className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" />
                          <span>Captured</span>
                        </div>
                      </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {cameraStatus === "error" && (
                    <div className="p-4 rounded-xl text-center text-xs bg-red-500/10 border border-red-500/20 text-red-600">
                      Could not access selfie camera. Ensure permissions are granted.
                    </div>
                  )}

                  {selfieCaptured && (
                    <div className="space-y-4 pt-1">
                      <div className="p-3.5 rounded-xl text-center text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2 animate-fadeInUp">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600 shrink-0" />
                        <span>Selfie captured successfully! Would you like to confirm or retake?</span>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={handleRetake}
                          className={backBtnClass}
                        >
                          <HugeiconsIcon icon={RefreshIcon} size={15} />
                          <span>Retake Selfie</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.99]"
                        >
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-white" />
                          <span>Confirm & Continue</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!selfieCaptured && (
                    <button
                      disabled
                      className={`w-full mt-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed ${
                        isLightTheme ? "bg-neutral-100 text-neutral-400" : "bg-white/5 text-white/30"
                      }`}
                    >
                      Please capture your selfie to proceed
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Final Consent & Summary */}
              {step === 4 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fadeInUp">
                  {/* Header */}
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${headerColor}`}>
                      <span className="p-2 rounded-xl bg-[#246596]/10 text-[#246596]">
                        <HugeiconsIcon icon={Shield01Icon} size={20} />
                      </span>
                      <span>Review Reservation</span>
                    </h3>
                    <p className={`${subTextColor} text-xs mt-1.5 font-light`}>
                      Please verify your booking details, delivery location, and terms before confirming.
                    </p>
                  </div>

                  {/* Section 1: Customer & Identity Card */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
                    isLightTheme ? "bg-neutral-50 border-neutral-200 text-neutral-850" : "bg-white/[0.03] border-white/10 text-white"
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-white/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#246596]">Renter Profile</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                        <span>KYC Matched</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className={`block text-[10px] font-medium ${subTextColor}`}>Full Name</span>
                        <span className="font-bold">{name}</span>
                      </div>
                      <div>
                        <span className={`block text-[10px] font-medium ${subTextColor}`}>Mobile Number</span>
                        <span className="font-mono font-semibold">{phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Equipment & Delivery Card */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-all ${
                    isLightTheme ? "bg-neutral-50 border-neutral-200 text-neutral-850" : "bg-white/[0.03] border-white/10 text-white"
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-white/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#246596]">Reservation Gear</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#246596]/10 text-[#246596]">
                        {durationDays} Days Rental
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className={subTextColor}>Item Selected</span>
                        <span className="font-bold text-right max-w-[220px]">{initialConsoleName}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={subTextColor}>Rental Dates</span>
                        <span className="font-mono font-semibold text-right">{startDateStr} to {endDateStr}</span>
                      </div>

                      <div className={`h-[1px] my-2 ${separatorBg}`} />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={subTextColor}>Delivery Destination</span>
                          {!useCustomLocation ? (
                            <button
                              type="button"
                              onClick={handleEnableCustomLocation}
                              className="text-[11px] text-[#246596] hover:underline font-bold transition-all cursor-pointer"
                            >
                              + Change Delivery Location
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRevertToKycLocation}
                              className="text-[11px] text-red-500 hover:underline font-bold transition-all cursor-pointer"
                            >
                              Use Saved KYC Location
                            </button>
                          )}
                        </div>

                        {!useCustomLocation ? (
                          <div className={`p-3 rounded-xl border space-y-1 ${
                            isLightTheme ? "bg-white border-neutral-200" : "bg-black/30 border-white/5"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} />
                                <span>KYC Verified Location</span>
                              </span>
                              {kycMapLink && (
                                <a href={kycMapLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#246596] hover:underline font-bold">
                                  Open Map ↗
                                </a>
                              )}
                            </div>
                            <p className={`text-xs font-mono truncate ${subTextColor}`}>{kycAddress || address || "No Location Loaded"}</p>
                          </div>
                        ) : isCustomLocationConfirmed ? (
                          <div className={`p-3 rounded-xl border space-y-1.5 ${
                            isLightTheme ? "bg-emerald-50/70 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                                <span>Custom Location Confirmed</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsCustomLocationConfirmed(false)}
                                className="text-[10px] text-[#246596] hover:underline font-bold cursor-pointer"
                              >
                                Edit Location
                              </button>
                            </div>
                            <p className={`text-xs font-mono truncate ${isLightTheme ? "text-neutral-800" : "text-white/80"}`}>{customAddress}</p>
                            {customMapLink && (
                              <a href={customMapLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#246596] hover:underline font-semibold block">
                                View Provided Map Link ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1 animate-fadeInUp">
                            <div>
                              <label className={`text-[10px] font-semibold block mb-1 ${labelColor}`}>Delivery Address (Street name, building/flat)</label>
                              <input
                                type="text"
                                required
                                value={customAddress}
                                onChange={(e) => {
                                  setCustomAddress(e.target.value);
                                  setIsCustomLocationConfirmed(false);
                                }}
                                placeholder="Enter street name, building number, flat/apt..."
                                className={inputClassName}
                              />
                            </div>

                            <div>
                              <label className={`text-[10px] font-semibold block mb-1 ${labelColor}`}>Google Maps Location Link</label>
                              <input
                                type="url"
                                required
                                value={customMapLink}
                                onChange={(e) => {
                                  setCustomMapLink(e.target.value);
                                  setIsCustomLocationConfirmed(false);
                                }}
                                placeholder="https://maps.app.goo.gl/..."
                                className={inputClassName}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleConfirmCustomLocation}
                              disabled={!customAddress.trim() || !customMapLink.trim()}
                              className="w-full py-2.5 rounded-xl bg-[#246596] hover:bg-[#1d496b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} className="text-white" />
                              <span>Confirm Location Change</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Formal Price Summary */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
                    isLightTheme ? "bg-neutral-50 border-neutral-200 text-neutral-850" : "bg-white/[0.03] border-white/10 text-white"
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#246596]">Payment Breakdown</span>
                    
                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex justify-between">
                        <span className={subTextColor}>Console Rental Fee ({durationDays} days)</span>
                        <span className="font-semibold">₹{computedTotalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={subTextColor}>Refundable Security Deposit</span>
                        <span className="text-emerald-600 font-semibold">Waived (eKYC Verified)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={subTextColor}>Express Delivery & Setup</span>
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      </div>

                      <div className={`h-[1px] my-2 ${separatorBg}`} />

                      <div className="flex justify-between items-baseline pt-1">
                        <span className={`text-xs uppercase font-extrabold ${isLightTheme ? "text-neutral-900" : "text-white"}`}>Total Payable Amount</span>
                        <span className={`text-2xl font-black ${isLightTheme ? "text-neutral-950" : "text-[#5e9fd0]"}`}>₹{computedTotalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Rental Terms Agreement Trigger */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    agreeTerms 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : isLightTheme ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-500/10 border-amber-500/20"
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          {agreeTerms ? (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600" />
                          ) : (
                            <HugeiconsIcon icon={Shield01Icon} size={16} className="text-amber-600" />
                          )}
                          <span>Rental Terms & Security Policy</span>
                        </h4>
                        <p className={`text-[11px] font-light ${subTextColor}`}>
                          {agreeTerms 
                            ? "Terms reviewed and accepted successfully." 
                            : "Must review and accept terms before booking."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setModalChecked(agreeTerms);
                          setShowTermsModal(true);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                          agreeTerms 
                            ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs" 
                            : "bg-[#246596] text-white hover:bg-[#1d496b] shadow-xs"
                        }`}
                      >
                        {agreeTerms ? "View Agreed Terms" : "Read & Accept Terms"}
                      </button>
                    </div>

                    <label className="flex items-center gap-2 pt-2 cursor-pointer select-none border-t border-black/5 dark:border-white/5">
                      <input
                        type="checkbox"
                        checked={agreeMarketing}
                        onChange={(e) => setAgreeMarketing(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-neutral-300 accent-[#246596] cursor-pointer"
                      />
                      <span className={`text-[10px] ${subTextColor}`}>
                        Receive order updates and notifications via WhatsApp & Email
                      </span>
                    </label>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-500 flex items-center gap-1.5 font-light">
                      <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                      <span>{submitError}</span>
                    </p>
                  )}

                  {/* Form Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className={backBtnClass}
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                      <span>Back</span>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !agreeTerms || (useCustomLocation && (!isCustomLocationConfirmed || !customAddress || !customMapLink))}
                      className="flex-[2] py-3.5 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>Submit Booking Request</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Success Screen */
            <div className="text-center py-8 space-y-6 animate-fadeInUp max-w-md mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_20px_rgba(22,163,74,0.15)]">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} className="text-green-500" />
              </div>

              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${headerColor}`}>Booking Confirmed!</h3>
                <p className={`text-sm ${textBodyColor} font-light`}>
                  Your reservation for <span className="text-[#246596] font-bold">{initialConsoleName}</span> is complete.
                </p>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed font-light ${subTextColor}`}>
                Track your order dispatch status live inside your dashboard panel.
              </p>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-[0_4px_12px_rgba(22,163,74,0.2)]"
                >
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Terms & Agreement Scroll Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeInUp">
          <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 max-h-[90vh] flex flex-col ${
            isLightTheme ? "bg-white border-neutral-200 text-neutral-850" : "bg-[#102435] border-white/10 text-white"
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 border-neutral-200 dark:border-white/10">
              <div>
                <h3 className={`text-base font-black flex items-center gap-2 ${headerColor}`}>
                  <HugeiconsIcon icon={Shield01Icon} size={18} className="text-[#246596]" />
                  <span>GameBees Rental Terms & Agreement</span>
                </h3>
                <p className={`text-[11px] ${subTextColor}`}>Scroll down to read all terms before accepting.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className={`flex-1 overflow-y-auto p-4 rounded-xl border space-y-4 text-xs font-light max-h-72 leading-relaxed ${
              isLightTheme ? "bg-neutral-50 border-neutral-200 text-neutral-700" : "bg-black/40 border-white/5 text-white/80"
            }`}>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">1. Equipment Care & Responsibility</h4>
                <p>The renter agrees to handle the gaming console, controllers, and accessories with utmost care. The equipment must not be opened, modified, or transferred to any third party.</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">2. Security Deposit & Damage Liability</h4>
                <p>Security deposit is waived based on eKYC verification. However, the renter remains fully liable for repair or replacement costs in case of liquid damage, dropped hardware, missing parts, or unapproved tampering.</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">3. Delivery & Return Timeline</h4>
                <p>The console will be delivered to the specified delivery destination. The renter agrees to be present at the delivery location for scheduled pickup at the end of the rental period.</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">4. Identity & Legal Compliance</h4>
                <p>Renter details, selfie capture, and Aadhaar records are securely logged for identity verification and fraud prevention purposes under Applicable Privacy Standards.</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">5. Late Fee & Extension Terms</h4>
                <p>Extensions must be requested 12 hours prior to rental expiry. Unannounced delays beyond 3 hours will incur standard daily penalty charges.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 space-y-3 border-t border-neutral-200 dark:border-white/10">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={modalChecked}
                  onChange={(e) => setModalChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#246596] cursor-pointer"
                />
                <span className={`text-xs font-medium ${isLightTheme ? "text-neutral-800" : "text-white"}`}>
                  I have read, understood, and agree to all the Rental Terms of Service and Damage Policies.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className={backBtnClass}
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  disabled={!modalChecked}
                  onClick={() => {
                    setAgreeTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-white" />
                  <span>Accept & Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 border-4 border-[#246596] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BookingFlow />
    </Suspense>
  );
}
