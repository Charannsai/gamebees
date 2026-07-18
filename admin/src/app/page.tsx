"use client";

import React, { useState, useEffect } from "react";
import { 
  adminLogin, 
  adminLogout, 
  getAdminSession, 
  adminFetchItems, 
  adminAddProduct, 
  adminDeleteProduct,
  adminFetchBookings,
  adminUpdateBookingStatus,
  adminFetchKycProfiles,
  adminApproveKyc,
  adminDeclineKyc
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ShoppingBag01Icon, 
  Compass01Icon, 
  PlusSignIcon, 
  Delete01Icon, 
  Shield01Icon, 
  UserIcon, 
  Location01Icon, 
  CheckmarkCircle01Icon, 
  AlertCircleIcon,
  Logout01Icon,
  PackageIcon,
  ArrowUpRight01Icon,
  LockIcon
} from "@hugeicons/core-free-icons";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"items" | "bookings" | "kyc">("bookings");

  // Database Data State
  const [items, setItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form State for Adding Item
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Consoles");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const checkSession = async () => {
    setCheckingAuth(true);
    const res = await getAdminSession();
    setIsAuthenticated(res.isAuthenticated);
    setCheckingAuth(false);
    if (res.isAuthenticated) {
      loadData();
    }
  };

  const loadData = async () => {
    setLoadingData(true);
    const [itemsRes, bookingsRes, kycRes] = await Promise.all([
      adminFetchItems(),
      adminFetchBookings(),
      adminFetchKycProfiles()
    ]);
    if (itemsRes.success) setItems(itemsRes.data || []);
    if (bookingsRes.success) setBookings(bookingsRes.data || []);
    if (kycRes.success) setKycProfiles(kycRes.data || []);
    setLoadingData(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const formData = new FormData(e.currentTarget);
    const res = await adminLogin(formData);
    setLoggingIn(false);
    if (res.success) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoginError(res.error || "Invalid email or password");
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    setAddingItem(true);
    const res = await adminAddProduct({
      name: itemName,
      category: itemCategory,
      price: Number(itemPrice),
      description: itemDesc,
      image_url: itemImage || undefined
    });
    setAddingItem(false);
    if (res.success) {
      setItemName("");
      setItemPrice("");
      setItemDesc("");
      setItemImage("");
      loadData();
    } else {
      alert("Error adding item: " + res.error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await adminDeleteProduct(id);
    if (res.success) {
      loadData();
    } else {
      alert("Error deleting item: " + res.error);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string, trackingStatus: string) => {
    const res = await adminUpdateBookingStatus(bookingId, status, trackingStatus);
    if (res.success) {
      loadData();
    } else {
      alert("Error updating status: " + res.error);
    }
  };

  const handleApproveKyc = async (userId: string) => {
    if (!confirm("Are you sure you want to APPROVE this user's KYC profile?")) return;
    const res = await adminApproveKyc(userId);
    if (res.success) {
      loadData();
    } else {
      alert("Error approving KYC: " + res.error);
    }
  };

  const handleDeclineKyc = async (userId: string) => {
    if (!confirm("Are you sure you want to DECLINE this user's KYC profile?")) return;
    const res = await adminDeclineKyc(userId);
    if (res.success) {
      loadData();
    } else {
      alert("Error declining KYC: " + res.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-blue-100 text-blue-800 border-blue-300";
      case "dispatched": return "bg-amber-100 text-amber-800 border-amber-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "discarded": return "bg-red-100 text-red-800 border-red-300";
      case "completed": return "bg-neutral-100 text-neutral-800 border-neutral-300";
      default: return "bg-neutral-100 text-neutral-800 border-neutral-300";
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Login Form ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#141414] relative overflow-hidden">
        <div className="w-full max-w-sm p-6 rounded border border-[#141414] bg-white z-10 space-y-6 shadow-sm">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#141414]">
              GameBees Admin Console
            </h1>
            <p className="text-neutral-500 text-xs font-light">
              Secure authorization gateway. Enter credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-600 block uppercase">System Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <HugeiconsIcon icon={UserIcon} size={14} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="gamebeesofficial@gmail.com"
                  placeholder="gamebeesofficial@gmail.com"
                  className="form-input pl-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <HugeiconsIcon icon={LockIcon} size={14} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="Iamnithish@02"
                  placeholder="••••••••"
                  className="form-input pl-8"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded border border-red-200 font-light">
                <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-red-500 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 rounded btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loggingIn ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <HugeiconsIcon icon={LockIcon} size={14} />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Admin Dashboard ---
  return (
    <div className="flex-1 flex flex-col relative bg-white min-h-screen text-[#141414] pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#141414]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-[#141414]">GAMEBEES</span>
            <span className="text-[8px] uppercase tracking-wider font-bold border border-[#141414] px-1.5 py-0.5 rounded">ADMIN CONSOLE</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F5F5] border border-[#141414]/10 text-[10px] text-neutral-700">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Session Active: <strong>gamebeesofficial@gmail.com</strong></span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-semibold transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Logout01Icon} size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="card-polished p-3.5 space-y-1">
            <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold pb-1.5 border-b border-[#141414]/10 mb-1.5">
              Menu Navigation
            </p>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-[#141414] text-white"
                  : "text-[#141414] hover:bg-[#F5F5F5]"
              }`}
            >
              <HugeiconsIcon icon={Compass01Icon} size={15} />
              <span>Reservations Board</span>
              {bookings.filter(b => b.status === "booked").length > 0 && (
                <span className="ml-auto bg-amber-500 text-black font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                  {bookings.filter(b => b.status === "booked").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "kyc"
                  ? "bg-[#141414] text-white"
                  : "text-[#141414] hover:bg-[#F5F5F5]"
              }`}
            >
              <HugeiconsIcon icon={Shield01Icon} size={15} />
              <span>KYC Approvals</span>
              {kycProfiles.filter(p => p.kyc_status === "pending").length > 0 && (
                <span className="ml-auto bg-amber-500 text-black font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                  {kycProfiles.filter(p => p.kyc_status === "pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("items")}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "items"
                  ? "bg-[#141414] text-white"
                  : "text-[#141414] hover:bg-[#F5F5F5]"
              }`}
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
              <span>Catalog Inventory</span>
            </button>
          </div>

          {/* Quick Metrics Widget */}
          <div className="card-polished p-4 space-y-3">
            <h4 className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold border-b border-[#141414]/10 pb-1.5">
              Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-[#F5F5F5] rounded border border-[#141414]/5">
                <span className="text-[8px] text-neutral-500 block uppercase">All Bookings</span>
                <span className="text-base font-black text-[#141414]">{bookings.length}</span>
              </div>
              <div className="p-2 bg-[#F5F5F5] rounded border border-[#141414]/5">
                <span className="text-[8px] text-neutral-500 block uppercase">KYC Requests</span>
                <span className="text-base font-black text-amber-600">
                  {kycProfiles.filter(p => p.kyc_status === "pending").length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-3 space-y-6">
          {loadingData ? (
            <div className="card-polished p-16 flex justify-center items-center">
              <div className="h-5 w-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Tab: Reservations Manager */}
              {activeTab === "bookings" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-lg font-bold text-[#141414]">
                      Reservations Board
                    </h3>
                    <p className="text-neutral-500 text-xs mt-0.5 font-light">
                      Audit bookings, review verified customer identities, and manage active console rentals.
                    </p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="card-polished p-12 text-center space-y-2">
                      <HugeiconsIcon icon={PackageIcon} size={32} className="text-neutral-300 mx-auto" />
                      <p className="text-xs text-neutral-500 font-light">No customer bookings have been logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="card-polished p-4 space-y-3 border border-[#141414] hover:shadow-sm transition-shadow">
                          
                          {/* Title / Header bar */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-[#141414]/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#141414]">{booking.full_name}</h4>
                                <span className={`text-[8px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">
                                ID: #{booking.id.slice(-8).toUpperCase()} • Phone: {booking.phone}
                              </span>
                            </div>

                            {/* Status controls */}
                            <div className="flex flex-wrap gap-1.5">
                              {booking.status === "booked" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "dispatched", "shipped")}
                                    className="px-2.5 py-1 bg-[#141414] text-white hover:bg-neutral-800 rounded text-[10px] font-semibold transition-all cursor-pointer"
                                  >
                                    Approve & Dispatch
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "discarded", "returned")}
                                    className="px-2.5 py-1 border border-red-500 text-red-600 hover:bg-red-50 rounded text-[10px] font-semibold transition-all cursor-pointer"
                                  >
                                    Discard
                                  </button>
                                </>
                              )}

                              {booking.status === "dispatched" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "delivered", "delivered")}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold transition-all cursor-pointer"
                                >
                                  Deliver Order
                                </button>
                              )}

                              {booking.status === "delivered" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "completed", "returned")}
                                  className="px-2.5 py-1 bg-[#141414] text-white hover:bg-neutral-800 rounded text-[10px] font-semibold transition-all cursor-pointer"
                                >
                                  Mark Returned
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Data details layout */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            
                            {/* Verification Data */}
                            <div className="space-y-1 text-xs">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Aadhaar Verification</span>
                              <div className="space-y-1 p-2 bg-[#F5F5F5] rounded border border-[#141414]/10 font-mono text-[9px]">
                                <div className="flex justify-between">
                                  <span>Number:</span>
                                  <span>xxxx-xxxx-{booking.aadhaar_number.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Status:</span>
                                  {booking.aadhaar_verified ? (
                                    <span className="text-green-700 font-bold">Verified</span>
                                  ) : (
                                    <span className="text-amber-600 font-bold">Unverified</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-1 text-xs">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Delivery Address</span>
                              <div className="p-2 bg-[#F5F5F5] rounded border border-[#141414]/10 text-[9px] h-[36px] flex items-center justify-between">
                                <span className="truncate max-w-[130px] block">{booking.address}</span>
                                <a 
                                  href={booking.map_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                                >
                                  <span>Maps</span>
                                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
                                </a>
                              </div>
                            </div>

                            {/* Selfie captured image */}
                            <div className="space-y-1">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Selfie Match</span>
                              <div className="h-[36px] w-full bg-neutral-100 rounded border border-[#141414]/10 overflow-hidden flex items-center justify-center relative group">
                                {booking.selfie_url && booking.selfie_url.startsWith("data:image") ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={booking.selfie_url} 
                                      alt="Selfie" 
                                      className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                                      onClick={() => {
                                        const w = window.open();
                                        w?.document.write(`<img src="${booking.selfie_url}" style="max-width:100%;height:auto;border-radius:6px;"/>`);
                                      }}
                                    />
                                  </>
                                ) : (
                                  <span className="text-neutral-400 text-[8px]">No selfie</span>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: KYC Approvals */}
              {activeTab === "kyc" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-lg font-bold text-[#141414]">
                      KYC Manual Approvals Board
                    </h3>
                    <p className="text-neutral-500 text-xs mt-0.5 font-light">
                      Verify coordinate location, Aadhaar card front/back, and customer selfie uploads.
                    </p>
                  </div>

                  {kycProfiles.length === 0 ? (
                    <div className="card-polished p-12 text-center space-y-2">
                      <HugeiconsIcon icon={Shield01Icon} size={32} className="text-neutral-300 mx-auto" />
                      <p className="text-xs text-neutral-500 font-light">No manual KYC requests have been logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {kycProfiles.map((profile) => (
                        <div key={profile.id} className="card-polished p-4 space-y-3 border border-[#141414]">
                          
                          {/* Header / Actions */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-[#141414]/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#141414]">{profile.full_name}</h4>
                                <span className={`text-[8px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 ${
                                  profile.kyc_status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                  profile.kyc_status === 'declined' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                                }`}>
                                  {profile.kyc_status}
                                </span>
                              </div>
                              <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">
                                User ID: {profile.id} • Phone: {profile.phone}
                              </span>
                            </div>

                            {/* Verification status updates */}
                            <div className="flex gap-2">
                              {profile.kyc_status !== "approved" && (
                                <button
                                  onClick={() => handleApproveKyc(profile.id)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold cursor-pointer transition-all"
                                >
                                  Approve
                                </button>
                              )}
                              {profile.kyc_status !== "declined" && (
                                <button
                                  onClick={() => handleDeclineKyc(profile.id)}
                                  className="px-3 py-1 border border-[#141414] hover:bg-neutral-100 rounded text-[10px] font-semibold cursor-pointer transition-all"
                                >
                                  Decline
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Detail fields layout */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            
                            {/* Aadhaar text field */}
                            <div className="space-y-1 text-xs">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Aadhaar card</span>
                              <div className="space-y-1 p-2 bg-[#F5F5F5] rounded border border-[#141414]/10 font-mono text-[9px]">
                                <div className="flex justify-between">
                                  <span>Number:</span>
                                  <span className="font-bold">{profile.aadhaar_number}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Applied:</span>
                                  <span>{new Date(profile.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Location GPS field */}
                            <div className="space-y-1 text-xs">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Live Location</span>
                              <div className="space-y-1 p-2 bg-[#F5F5F5] rounded border border-[#141414]/10 text-[9px]">
                                <div className="flex justify-between font-mono">
                                  <span>GPS:</span>
                                  <span>{profile.latitude?.toFixed(4)}, {profile.longitude?.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Google Maps:</span>
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-bold"
                                  >
                                    Exact Location
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Documents Grid */}
                            <div className="md:col-span-2 space-y-1">
                              <span className="text-[8px] text-neutral-400 uppercase font-bold block">Documents Front / Back / Selfie</span>
                              <div className="flex gap-1.5">
                                {/* Front thumbnail */}
                                <div className="flex-1 text-center">
                                  <div className="h-14 bg-neutral-50 border border-[#141414]/10 rounded overflow-hidden relative group">
                                    {profile.aadhaar_front_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img 
                                        src={profile.aadhaar_front_url} 
                                        alt="Front" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" 
                                        onClick={() => {
                                          const w = window.open();
                                          w?.document.write(`<img src="${profile.aadhaar_front_url}" style="max-width:100%;height:auto;border-radius:4px;"/>`);
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[8px] text-neutral-400 flex items-center justify-center h-full">N/A</span>
                                    )}
                                  </div>
                                </div>

                                {/* Back thumbnail */}
                                <div className="flex-1 text-center">
                                  <div className="h-14 bg-neutral-50 border border-[#141414]/10 rounded overflow-hidden relative group">
                                    {profile.aadhaar_back_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img 
                                        src={profile.aadhaar_back_url} 
                                        alt="Back" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" 
                                        onClick={() => {
                                          const w = window.open();
                                          w?.document.write(`<img src="${profile.aadhaar_back_url}" style="max-width:100%;height:auto;border-radius:4px;"/>`);
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[8px] text-neutral-400 flex items-center justify-center h-full">N/A</span>
                                    )}
                                  </div>
                                </div>

                                {/* Selfie thumbnail */}
                                <div className="flex-1 text-center">
                                  <div className="h-14 bg-neutral-50 border border-[#141414]/10 rounded overflow-hidden relative group">
                                    {profile.selfie_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img 
                                        src={profile.selfie_url} 
                                        alt="Selfie" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" 
                                        onClick={() => {
                                          const w = window.open();
                                          w?.document.write(`<img src="${profile.selfie_url}" style="max-width:100%;height:auto;border-radius:4px;"/>`);
                                        }}
                                      />
                                    ) : (
                                      <span className="text-[8px] text-neutral-400 flex items-center justify-center h-full">N/A</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Catalog Inventory */}
              {activeTab === "items" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-lg font-bold text-[#141414]">
                      Catalog Inventory
                    </h3>
                    <p className="text-neutral-500 text-xs mt-0.5 font-light">
                      Add, view, and delete rental hardware packages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Add Item Form Card */}
                    <div className="lg:col-span-1 card-polished p-4 border border-[#141414] h-fit bg-white">
                      <h4 className="text-xs font-bold text-[#141414] uppercase border-b border-[#141414]/10 pb-2 mb-3 flex items-center gap-1.5">
                        <HugeiconsIcon icon={PlusSignIcon} size={14} />
                        <span>Add Product Listing</span>
                      </h4>

                      <form onSubmit={handleAddItem} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-neutral-500 uppercase">Product Name</label>
                          <input
                            type="text"
                            required
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="E.g., PlayStation 5 Pro"
                            className="form-input text-xs py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-neutral-500 uppercase">Category</label>
                          <select
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            className="w-full rounded border border-[#141414] px-2.5 py-2 text-xs text-[#141414] outline-none bg-white cursor-pointer"
                          >
                            <option value="Consoles" className="bg-white text-[#141414]">Consoles</option>
                            <option value="Accessories" className="bg-white text-[#141414]">Accessories</option>
                            <option value="Audio" className="bg-white text-[#141414]">Audio</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-neutral-500 uppercase">Price per Day ($)</label>
                          <input
                            type="number"
                            required
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            placeholder="12"
                            className="form-input text-xs py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-neutral-500 uppercase">Image URL (Optional)</label>
                          <input
                            type="url"
                            value={itemImage}
                            onChange={(e) => setItemImage(e.target.value)}
                            placeholder="https://..."
                            className="form-input text-xs py-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-neutral-500 uppercase">Description</label>
                          <textarea
                            rows={3}
                            value={itemDesc}
                            onChange={(e) => setItemDesc(e.target.value)}
                            placeholder="Specifications, controller bundles, pre-installed games..."
                            className="w-full rounded border border-[#141414] px-2.5 py-2 text-xs text-[#141414] placeholder-neutral-300 outline-none resize-none bg-white"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={addingItem}
                          className="w-full py-2.5 rounded btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {addingItem ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <HugeiconsIcon icon={PlusSignIcon} size={14} />
                              <span>Add to Listings</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Active Inventory Listings Grid */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-[#141414] uppercase border-b border-[#141414]/10 pb-2 mb-2">
                        Active Products ({items.length})
                      </h4>

                      {items.length === 0 ? (
                        <div className="card-polished p-10 text-center text-neutral-400 text-xs">
                          No product entries found in the database.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item) => (
                            <div key={item.id} className="card-polished p-4 flex flex-col justify-between h-[150px] border border-[#141414] group hover:shadow-sm transition-shadow bg-white">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-bold text-[#141414] uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded border border-[#141414]/10">
                                    {item.category}
                                  </span>
                                  <div className="text-right">
                                    <span className="text-xs font-black text-[#141414]">${item.price}</span>
                                    <span className="text-[8px] text-neutral-400 block">/ day</span>
                                  </div>
                                </div>

                                <h5 className="text-xs font-bold text-[#141414] truncate">{item.name}</h5>
                                <p className="text-[10px] text-neutral-500 font-light line-clamp-3 leading-tight">{item.description}</p>
                              </div>

                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-fit self-end text-red-600 hover:bg-red-50 p-1.5 rounded border border-transparent hover:border-red-200 transition-all cursor-pointer"
                              >
                                <HugeiconsIcon icon={Delete01Icon} size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

    </div>
  );
}
