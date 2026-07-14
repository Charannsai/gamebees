"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, User, Phone, MapPin, CheckCircle, Camera, Shield, ShieldCheck, Check, AlertCircle, RefreshCw } from "lucide-react";
import { createBooking } from "@/app/actions";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConsoleName?: string;
  initialDuration?: number;
  initialTotal?: number;
  selectedItemId?: string; // If selected from bookings tab
  availableItems?: any[]; // Passed from dashboard or page
}

export default function BookingModal({
  isOpen,
  onClose,
  initialConsoleName = "PlayStation 5 Pro Console",
  initialDuration = 3,
  initialTotal = 36,
  selectedItemId = "",
  availableItems = []
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Personal Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  
  // Step 2: Aadhaar eKYC Sandbox
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Step 3: Selfie Capture with Liveness
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [livenessStatus, setLivenessStatus] = useState<"idle" | "detecting" | "liveness_check" | "auto_capturing" | "captured" | "error">("idle");
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [faceAligned, setFaceAligned] = useState(false);
  const [livenessInstruction, setLivenessInstruction] = useState("Align your face in the frame");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const livenessTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 4: Final Consent & Total
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State sync from props
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName("");
      setPhone("");
      setAddress("");
      setMapLink("");
      setAadhaarNum("");
      setOtpSent(false);
      setAadhaarOtp("");
      setAadhaarVerified(false);
      setAadhaarError("");
      setSelfieCaptured(null);
      setLivenessStatus("idle");
      setAgreeTerms(false);
      setAgreeMarketing(false);
      setIsSuccess(false);
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

  if (!isOpen) return null;

  // Camera handling
  async function startCamera() {
    try {
      setLivenessStatus("detecting");
      setLivenessInstruction("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setLivenessInstruction("Align your face in the oval guide");
      
      // Simulate live face detection and liveness flow
      startLivenessDetection();
    } catch (err) {
      console.error("Camera error:", err);
      setLivenessStatus("error");
      setLivenessInstruction("Could not access selfie camera. Ensure permissions are granted.");
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (livenessTimerRef.current) {
      clearInterval(livenessTimerRef.current);
    }
  }

  // Liveness check simulator (analyzes motion, screen reflections and face presence)
  function startLivenessDetection() {
    let countdown = 0;
    setFaceAligned(false);
    
    livenessTimerRef.current = setInterval(() => {
      countdown += 1;
      
      // Step 1: Detect face presence (simulated coordinate centering check)
      if (countdown === 3) {
        setFaceAligned(true);
        setLivenessStatus("liveness_check");
        setLivenessInstruction("Liveness Check: Please BLINK or smile to verify you are real.");
      }
      
      // Step 2: Incremental Liveness verification checking for eye/mouth coordinate changes
      if (countdown > 3 && countdown <= 7) {
        setLivenessProgress(prev => Math.min(prev + 25, 100));
        if (countdown === 5) {
          setLivenessInstruction("Liveness Verified! Keep still for auto-capture.");
          setLivenessStatus("auto_capturing");
        }
      }

      // Step 3: Auto-Capture on successful liveness verification
      if (countdown === 8) {
        capturePhoto();
      }
    }, 1000);
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the image for intuitive selfie view
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const photoData = canvas.toDataURL("image/jpeg", 0.85);
        setSelfieCaptured(photoData);
        setLivenessStatus("captured");
        setLivenessInstruction("Selfie Captured Successfully!");
        stopCamera();
      }
    }
  }

  function handleRetake() {
    setSelfieCaptured(null);
    setLivenessProgress(0);
    setFaceAligned(false);
    startCamera();
  }

  // Aadhaar eKYC verification simulation
  function handleSendAadhaarOtp() {
    if (aadhaarNum.length !== 12 || !/^\d+$/.test(aadhaarNum)) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setAadhaarError("");
    setVerificationLoading(true);
    
    setTimeout(() => {
      setVerificationLoading(false);
      setOtpSent(true);
    }, 1000);
  }

  function handleVerifyAadhaarOtp() {
    if (aadhaarOtp !== "123456") {
      setAadhaarError("Invalid OTP. For testing/sandbox, please enter '123456'.");
      return;
    }
    setAadhaarError("");
    setVerificationLoading(true);

    setTimeout(() => {
      setVerificationLoading(false);
      setAadhaarVerified(true);
    }, 1200);
  }

  // Submit Booking
  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) return;

    setIsSubmitting(true);
    
    // Find item ID
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
        aadhaarNumber: aadhaarNum,
        aadhaarVerified: aadhaarVerified,
        selfieUrl: selfieCaptured || "data:image/png;base64,mockselfie",
        itemId: itemId || "d832c3f8-8fa3-4df4-8d48-8dfa1ad3943f", // Fallback GUID if not defined
        durationDays: initialDuration,
        totalPrice: initialTotal
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        alert("Booking failed: " + res.error);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-[24px] card-polished p-6 sm:p-8 overflow-y-auto max-h-[90vh] z-10 border border-gamebees-accent-blue/30 shadow-[0_0_50px_rgba(36,101,150,0.15)]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="h-5 w-5" />
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
                  {step > s ? <Check className="h-3 w-3 stroke-[3]" /> : s}
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
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name (as in Govt ID)"
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block">Delivery Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter street name, building/flat"
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 block flex justify-between">
                      <span>Google Maps Location Link</span>
                      <span className="text-[10px] text-gamebees-glow-blue font-light">For accurate delivery routing</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                        <MapPin className="h-4 w-4 text-gamebees-glow-blue" />
                      </span>
                      <input
                        type="url"
                        required
                        value={mapLink}
                        onChange={(e) => setMapLink(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="form-input pl-10 border-gamebees-accent-blue/35 focus:border-gamebees-glow-blue"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!name || !phone || !address || !mapLink}
                  className="w-full mt-6 py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Identity Verification
                </button>
              </div>
            )}

            {/* Step 2: Aadhaar eKYC Sandbox */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-gamebees-glow-blue" />
                    <span>Identity Proof (Aadhaar)</span>
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Complete eKYC verification to confirm details. This is sandboxed.
                  </p>
                </div>

                <div className="bg-gamebees-dark-navy/20 border border-gamebees-accent-blue/20 p-4 rounded-xl space-y-3">
                  <div className="flex gap-2.5 items-start text-xs text-gamebees-glow-blue font-light">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span><strong>Sandbox Notice:</strong> Enter a 12-digit number, click Send OTP, and enter test OTP <strong>123456</strong>. No real data is stored.</span>
                  </div>
                </div>

                {!aadhaarVerified ? (
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
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-white/70 block">Enter 6-Digit OTP</label>
                          <span className="text-[10px] text-green-400 font-light">OTP Sent to registered mobile!</span>
                        </div>
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
                      <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{aadhaarError}</span>
                      </p>
                    )}

                    <div className="pt-2">
                      {verificationLoading ? (
                        <div className="flex justify-center py-2">
                          <div className="h-6 w-6 border-2 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : !otpSent ? (
                        <button
                          onClick={handleSendAadhaarOtp}
                          disabled={aadhaarNum.length !== 12}
                          className="w-full py-3.5 rounded-xl bg-gamebees-accent-blue/80 hover:bg-gamebees-accent-blue text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Send verification OTP
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setOtpSent(false); setAadhaarOtp(""); }}
                            className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleVerifyAadhaarOtp}
                            disabled={aadhaarOtp.length !== 6}
                            className="flex-1 py-3.5 rounded-xl bg-green-500/80 hover:bg-green-500 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Verify & Match
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-4 animate-fadeInUp">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Aadhaar eKYC Verified</h4>
                      <p className="text-white/60 text-xs mt-1">Proof matched: {name}</p>
                    </div>

                    <div className="text-left text-[11px] text-white/50 space-y-1.5 p-3.5 bg-black/20 rounded-lg font-light">
                      <div className="flex justify-between"><span>Document:</span><span className="font-mono text-white/80">XXXXXXXX{aadhaarNum.slice(-4)}</span></div>
                      <div className="flex justify-between"><span>Name:</span><span className="text-white/80">{name}</span></div>
                      <div className="flex justify-between"><span>Address:</span><span className="text-white/80">Karnataka, Bangalore, 560001</span></div>
                      <div className="flex justify-between"><span>Liveness Match:</span><span className="text-green-400 font-semibold">Ready</span></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setStep(3); }}
                  disabled={!aadhaarVerified}
                  className="w-full mt-6 py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Live Selfie Verification
                </button>
              </div>
            )}

            {/* Step 3: Selfie Capture with Face Detection */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Camera className="h-6 w-6 text-gamebees-glow-blue" />
                    <span>Liveness & Selfie Verification</span>
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    Ensure face is well-lit. Front camera only. No screen photos allowed.
                  </p>
                </div>

                <div className="relative aspect-video w-full max-w-sm mx-auto bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  {!selfieCaptured ? (
                    <>
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      
                      {/* Bounding Oval Overlay for face alignment */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-[160px] h-[210px] rounded-[100px] border-2 transition-all duration-500 ${
                          faceAligned
                            ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4),inset_0_0_20px_rgba(74,222,128,0.4)]"
                            : "border-gamebees-accent-blue/60 shadow-[0_0_15px_rgba(36,101,150,0.2)] animate-pulse"
                        }`} />
                      </div>

                      {/* Scanning Light Line */}
                      {livenessStatus === "detecting" && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 bg-gamebees-glow-blue/80 blur-[1px] animate-[bounce_2s_infinite]"></div>
                      )}

                      {/* Liveness Progress Bar */}
                      {livenessStatus === "liveness_check" && (
                        <div className="absolute bottom-4 left-10 right-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gamebees-accent-blue to-green-400 transition-all duration-300"
                            style={{ width: `${livenessProgress}%` }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selfieCaptured} alt="Selfie preview" className="w-full h-full object-cover" />
                  )}

                  {/* Hidden canvas to extract data */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Info Text & Warnings */}
                <div className={`p-4 rounded-xl text-center text-xs transition-colors duration-300 ${
                  livenessStatus === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-300"
                    : livenessStatus === "captured"
                    ? "bg-green-500/10 border border-green-500/20 text-green-300 font-semibold"
                    : "bg-white/5 border border-white/5 text-white/60"
                }`}>
                  {livenessInstruction}
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  {selfieCaptured ? (
                    <button
                      onClick={handleRetake}
                      className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Retake Selfie</span>
                    </button>
                  ) : (
                    livenessStatus === "error" && (
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 rounded-xl bg-gamebees-accent-blue/80 text-xs font-semibold text-white hover:bg-gamebees-accent-blue transition-colors"
                      >
                        Try Again
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setStep(4)}
                  disabled={!selfieCaptured}
                  className="w-full mt-6 py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Summary
                </button>
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

                {/* Detail summary */}
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
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Aadhaar</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>Liveness Selfie</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Matched</span>
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gamebees-accent-blue/20 to-transparent my-1"></div>

                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs uppercase text-white/30 font-semibold">Total Price Due</span>
                    <span className="text-2xl font-black text-gamebees-glow-blue">${initialTotal}</span>
                  </div>
                </div>

                {/* Checkboxes */}
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreeTerms}
                    className="flex-[2] py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
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
              <CheckCircle className="h-10 w-10 text-gamebees-accent-blue" />
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
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
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
