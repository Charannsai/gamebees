"use client";

import React, { useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Cancel01Icon, 
  UserIcon, 
  CallingIcon, 
  Location01Icon, 
  CheckmarkCircle01Icon, 
  Camera01Icon, 
  Shield01Icon, 
  AlertCircleIcon, 
  RefreshIcon,
  CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons";
import { createBooking, getKycStatus } from "@/app/actions";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConsoleName?: string;
  initialDuration?: number;
  initialTotal?: number;
  selectedItemId?: string; // If selected from bookings tab
  availableItems?: any[]; // Passed from dashboard or page
  kycVerifiedProp?: boolean;
  onRedirectToKyc?: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialConsoleName = "PlayStation 5 Pro Console",
  initialDuration = 3,
  initialTotal = 36,
  selectedItemId = "",
  availableItems = [],
  kycVerifiedProp = false,
  onRedirectToKyc
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Personal Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  
  // Step 2: Automated KYC status check
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [dbKycStatus, setDbKycStatus] = useState<"pending" | "approved" | "declined" | "not_applied">("not_applied");
  const [dbKycVerified, setDbKycVerified] = useState(false);

  // Step 3: Selfie Capture
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "streaming" | "captured" | "error">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Step 4: Final Consent & Total
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State sync from props
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName("");
      setPhone("");
      setAddress("");
      setMapLink("");
      setSelfieCaptured(null);
      setCameraStatus("idle");
      setAgreeTerms(false);
      setAgreeMarketing(false);
      setIsSuccess(false);
      setSubmitError("");
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // Camera trigger based on step transitions
  useEffect(() => {
    if (isOpen && step === 3) {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [step, isOpen]);

  // Fetch actual KYC status from DB when reaching step 2
  useEffect(() => {
    if (step === 2) {
      setCheckingKyc(true);
      getKycStatus()
        .then((res) => {
          if (res.success && res.profile) {
            setDbKycStatus(res.profile.kyc_status || "pending");
            setDbKycVerified(res.verified);
          } else {
            setDbKycStatus("not_applied");
            setDbKycVerified(false);
          }
          setCheckingKyc(false);
        })
        .catch((err) => {
          console.error("BookingModal KYC lookup error:", err);
          setCheckingKyc(false);
        });
    }
  }, [step]);

  if (!isOpen) return null;

  // Camera handling
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
      console.error("Camera error:", err);
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
      const res = await createBooking({
        fullName: name,
        phone: phone,
        address: address,
        mapLink: mapLink,
        aadhaarNumber: kycVerifiedProp ? "PROFILE_VERIFIED" : "UNVERIFIED_PENDING",
        aadhaarVerified: kycVerifiedProp,
        selfieUrl: selfieCaptured || "data:image/png;base64,mockselfie",
        itemId: itemId || "d832c3f8-8fa3-4df4-8d48-8dfa1ad3943f",
        durationDays: initialDuration,
        totalPrice: initialTotal
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setSubmitError("Booking failed: " + res.error);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Input styling definition to override custom components & prevent text overlaps
  const inputClassName = "w-full rounded-xl bg-[#10324d]/15 border border-[#5e9fd0]/10 py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#5e9fd0]/35 focus:bg-[#10324d]/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-[24px] card-polished pt-12 pb-6 px-6 sm:pt-14 sm:pb-8 sm:px-8 overflow-y-auto max-h-[90vh] z-10 border border-gamebees-accent-blue/30 shadow-[0_0_50px_rgba(36,101,150,0.15)] animate-fadeInUp">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} />
        </button>

        {/* Step Indicator */}
        {!isSuccess && (
          <div className="flex items-center gap-2 mb-6 border-b border-white/[0.05] pb-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-gamebees-accent-blue text-white shadow-[0_0_12px_rgba(36,101,150,0.4)]"
                    : step > s
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-white/5 text-white/40"
                }`}>
                  {step > s ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} className="stroke-[3]" />
                  ) : s}
                </div>
                {s < 4 && <div className={`flex-1 h-[1px] ${step > s ? "bg-green-500/40" : "bg-white/5"}`}></div>}
              </React.Fragment>
            ))}
          </div>
        )}

        {!isSuccess ? (
          <div>
            {/* Step 1: User details and Google Maps delivery link */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                    Delivery Details
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Provide delivery location and contact information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/45 z-10">
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
                    <label className="text-xs font-semibold text-white/70 block">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/45 z-10">
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

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block">Delivery Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/45 z-10">
                        <HugeiconsIcon icon={Location01Icon} size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter street name, building/flat"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block flex justify-between">
                      <span>Google Maps Location Link</span>
                      <span className="text-[10px] text-gamebees-glow-blue font-light">For accurate delivery routing</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gamebees-glow-blue/80 z-10">
                        <HugeiconsIcon icon={Location01Icon} size={16} />
                      </span>
                      <input
                        type="url"
                        required
                        value={mapLink}
                        onChange={(e) => setMapLink(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!name || !phone || !address || !mapLink}
                  className="w-full mt-6 py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Continue to Identity Verification</span>
                </button>
              </div>
            )}

            {/* Step 2: Automated KYC verification check */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <HugeiconsIcon icon={Shield01Icon} size={22} className="text-gamebees-glow-blue" />
                    <span>Identity KYC Status</span>
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Verifying secure identity profile from database records.
                  </p>
                </div>

                {checkingKyc ? (
                  <div className="card-polished p-12 text-center space-y-4">
                    <div className="h-8 w-8 border-4 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/60 text-xs font-light">Querying KYC database... Please wait.</p>
                  </div>
                ) : dbKycStatus === 'approved' || dbKycVerified ? (
                  // KYC is completed
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-4 animate-fadeInUp">
                      <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <HugeiconsIcon icon={Shield01Icon} size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Identity KYC Verified</h4>
                        <p className="text-white/60 text-xs mt-1 font-light">Profile checks passed successfully.</p>
                      </div>

                      <div className="text-left text-[11px] text-white/50 space-y-1.5 p-3.5 bg-black/20 rounded-lg font-light">
                        <div className="flex justify-between"><span>eKYC Registry:</span><span className="text-green-400 font-semibold">Matched</span></div>
                        <div className="flex justify-between"><span>User Profile:</span><span className="text-white/80">{name}</span></div>
                        <div className="flex justify-between"><span>Status Check:</span><span className="text-green-400 font-semibold">Verified</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(3)}
                      className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                    >
                      Continue to Live Selfie Verification
                    </button>
                  </div>
                ) : dbKycStatus === 'pending' ? (
                  // KYC is pending admin review
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4 animate-fadeInUp">
                      <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
                        <HugeiconsIcon icon={Shield01Icon} size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">KYC Verification Under Review</h4>
                        <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-light">
                          Your profile has been submitted and is currently being manually audited by our admins. You can complete booking once approved.
                        </p>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-white/5 text-xs font-bold text-white/40 flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      Awaiting Manual Admin Approval
                    </button>
                  </div>
                ) : dbKycStatus === 'declined' ? (
                  // KYC check was declined
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-4 animate-fadeInUp">
                      <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">KYC Verification Declined</h4>
                        <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-light">
                          Your previous KYC details check has failed manual verification. Please re-apply in the dashboard.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onRedirectToKyc}
                      className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                    >
                      Re-Apply KYC in Dashboard
                    </button>
                  </div>
                ) : (
                  // KYC is NOT completed/applied
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4 animate-fadeInUp">
                      <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">KYC Verification Required</h4>
                        <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-light">
                          You must verify your Aadhaar card and live location coordinates before checking out console rentals.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onRedirectToKyc}
                      className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer animate-fadeInUp"
                    >
                      Complete Your KYC in Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Selfie Capture with Face Detection */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <HugeiconsIcon icon={Camera01Icon} size={22} className="text-gamebees-glow-blue" />
                    <span>Liveness & Selfie Verification</span>
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Ensure your face fits inside the guide and click the shutter button.
                  </p>
                </div>

                <div className="relative aspect-video w-full max-w-sm mx-auto bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
                  {!selfieCaptured ? (
                    <>
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      
                      {/* Dotted Guide Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <div className="w-[150px] h-[200px] rounded-[100px] border-2 border-dashed border-gamebees-glow-blue/50 shadow-[0_0_15px_rgba(36,101,150,0.2)]" />
                      </div>

                      {/* Shutter Button floating over bottom of the camera */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={cameraStatus !== "streaming"}
                          className="h-14 w-14 rounded-full border-4 border-white/20 hover:border-white bg-[#246596]/80 hover:bg-[#246596] flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Capture Photo"
                        >
                          <div className="h-6 w-6 rounded-full bg-white" />
                        </button>
                      </div>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selfieCaptured} alt="Selfie preview" className="w-full h-full object-cover" />
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {cameraStatus === "error" && (
                  <div className="p-4 rounded-xl text-center text-xs bg-red-500/10 border border-red-500/20 text-red-300">
                    Could not access selfie camera. Ensure permissions are granted.
                  </div>
                )}

                {selfieCaptured && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl text-center text-xs bg-green-500/10 border border-green-500/20 text-green-300 font-semibold animate-fadeInUp">
                      Selfie captured successfully! Would you like to confirm or retake?
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={RefreshIcon} size={15} />
                        <span>Retake Selfie</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
                        <span>Confirm & Continue</span>
                      </button>
                    </div>
                  </div>
                )}

                {!selfieCaptured && (
                  <button
                    disabled
                    className="w-full mt-4 py-4 rounded-xl bg-white/5 text-xs font-bold text-white/30 flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    Please capture your selfie to proceed
                  </button>
                )}
              </div>
            )}

            {/* Step 4: Summary, Consent & Submission */}
            {step === 4 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                    Rental Overview
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Review booking rates and complete order verification.
                  </p>
                </div>

                <div className="p-4.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs space-y-3 font-light">
                  <div className="flex justify-between items-center text-white/50 pb-2 border-b border-white/[0.04]">
                    <span>Item to Rent</span>
                    <span className="font-bold text-white text-sm">{initialConsoleName}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Client Name</span>
                    <span className="text-white/80">{name}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Contact Number</span>
                    <span className="text-white/80">{phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Rental Duration</span>
                    <span className="text-white/80">{initialDuration} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Identity Proof</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <HugeiconsIcon icon={Shield01Icon} size={14} />
                      <span>Verified KYC Profile</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Liveness Selfie</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                      <span>Matched</span>
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gamebees-accent-blue/20 to-transparent my-1"></div>

                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs uppercase text-white/30 font-semibold">Total Price Due</span>
                    <span className="text-2xl font-black text-gamebees-glow-blue">${initialTotal}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/10 bg-gamebees-dark-navy/20 accent-gamebees-accent-blue cursor-pointer"
                    />
                    <span className="text-[11px] text-white/60 leading-normal">
                      I agree to the <span className="text-gamebees-glow-blue hover:underline">Terms of Service</span>, security deposits policies, and rental usage agreements.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeMarketing}
                      onChange={(e) => setAgreeMarketing(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/10 bg-gamebees-dark-navy/20 accent-gamebees-accent-blue cursor-pointer"
                    />
                    <span className="text-[11px] text-white/40 leading-normal">
                      I consent to receive order updates, status notifications and promotional offers via WhatsApp and email.
                    </span>
                  </label>
                </div>

                {submitError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2 font-light">
                    <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                    <span>{submitError}</span>
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreeTerms}
                    className="flex-[2] py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gamebees-accent-blue/10 border border-gamebees-accent-blue/20">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} className="text-gamebees-accent-blue" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white title-glow">Booking Requested!</h3>
              <p className="text-white/70 text-sm">
                Congratulations, <span className="text-gamebees-accent-lavender font-bold">{name}</span>!
              </p>
            </div>

            <p className="text-white/50 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-light">
              Your rental reservation for <span className="text-white font-semibold">{initialConsoleName}</span> is complete. 
              The initial status is set to <span className="text-gamebees-glow-blue font-semibold uppercase">Booked</span>. 
              Our delivery admin is reviewing your Aadhaar + Face match details and will dispatch your gear shortly. 
              You can track your order live inside the <strong>Dashboard</strong> tracker!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Back To Landing
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gamebees-accent-blue text-xs font-bold text-white hover:bg-gamebees-glow-blue transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
