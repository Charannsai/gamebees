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
  adminUpdateBookingStatus 
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ShoppingBag01Icon, 
  Compass01Icon, 
  PlusIcon, 
  DeleteIcon, 
  Shield01Icon, 
  UserIcon, 
  Location01Icon, 
  CheckmarkCircle01Icon, 
  Cancel01Icon, 
  AlertCircleIcon,
  DeliveryTruck01Icon,
  Logout01Icon,
  Image01Icon,
  DollarIcon,
  PackageIcon,
  Time01Icon,
  SparklesIcon,
  ArrowUpRight01Icon,
  LockIcon
} from "@hugeicons/core-free-icons";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"items" | "bookings">("bookings");

  // Database Data State
  const [items, setItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
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
    const [itemsRes, bookingsRes] = await Promise.all([
      adminFetchItems(),
      adminFetchBookings()
    ]);
    if (itemsRes.success) setItems(itemsRes.data || []);
    if (bookingsRes.success) setBookings(bookingsRes.data || []);
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

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 border-4 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Login Form ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414] px-6 text-white relative overflow-hidden">
        {/* Glow spots */}
        <div 
          className="absolute w-[500px] h-[500px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(36, 101, 150, 0.12) 0%, rgba(20, 20, 20, 0) 75%)",
            filter: "blur(120px)",
          }}
        />

        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-950/40 border border-gamebees-accent-blue/15 backdrop-blur-2xl shadow-[0_0_50px_rgba(36,101,150,0.1)] z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white title-glow animate-fadeInUp">
              GameBees Admin Console
            </h1>
            <p className="text-white/40 text-xs font-light">
              Secure authorization gateway. Enter credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 block">System Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                  <HugeiconsIcon icon={UserIcon} size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="gamebeesofficial@gmail.com"
                  placeholder="gamebeesofficial@gmail.com"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 block">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                  <HugeiconsIcon icon={LockIcon} size={16} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="Iamnithish@02"
                  placeholder="••••••••"
                  className="form-input pl-10"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 font-light">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-4 rounded-xl btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-2 cursor-pointer"
            >
              {loggingIn ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <HugeiconsIcon icon={LockIcon} size={16} />
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
    <div className="flex-1 flex flex-col relative overflow-x-hidden w-full pb-10">
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
      <header className="sticky top-0 z-30 bg-[#141414]/80 backdrop-blur-md border-b border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gamebeeslogo.png" alt="GAMEBEES" className="h-16 w-auto object-contain select-none" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-black bg-gamebees-dark-navy/40 border border-gamebees-accent-blue/30 px-2 py-0.5 rounded text-gamebees-glow-blue">ADMIN CONSOLE</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.04] text-xs text-white/70">
              <div className="h-2 w-2 rounded-full bg-gamebees-glow-blue animate-pulse" />
              <span>Admin: <strong>gamebeesofficial@gmail.com</strong></span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Logout01Icon} size={15} />
              <span>Exit Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="card-polished p-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold px-3 pb-2 border-b border-white/[0.04] mb-2">
              Console Menu
            </p>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={Compass01Icon} size={18} />
              <span>Reservations Board</span>
              {bookings.filter(b => b.status === "booked").length > 0 && (
                <span className="ml-auto bg-amber-500 text-black font-black text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  {bookings.filter(b => b.status === "booked").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("items")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "items"
                  ? "bg-gamebees-accent-blue text-white shadow-[0_4px_12px_rgba(36,101,150,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
              <span>Catalog Inventory</span>
            </button>
          </div>

          {/* Quick Metrics Widget */}
          <div className="card-polished p-5 space-y-4">
            <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-bold border-b border-white/[0.04] pb-2">
              Console Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 block">All Orders</span>
                <span className="text-xl font-black text-white">{bookings.length}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 block">Pending Reviews</span>
                <span className="text-xl font-black text-amber-400">
                  {bookings.filter(b => b.status === "booked").length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-3 space-y-6">
          {loadingData ? (
            <div className="card-polished p-20 flex justify-center items-center">
              <div className="h-6 w-6 border-2 border-gamebees-glow-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Tab: Reservations Manager */}
              {activeTab === "bookings" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Reservations Board
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Audit identity KYC, verify captured selfies, and dispatch active console orders.
                    </p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="card-polished p-16 text-center space-y-3">
                      <HugeiconsIcon icon={PackageIcon} size={40} className="text-white/10 mx-auto" />
                      <p className="text-sm text-white/50 font-light">No customer bookings have been logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="card-polished p-5.5 space-y-5 border border-white/[0.03]">
                          
                          {/* Title / Header bar */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/[0.04]">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-white">{booking.full_name}</h4>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold border rounded-full px-2.5 py-0.5 ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-white/35 font-mono block mt-1">
                                Ref ID: #{booking.id.slice(-8).toUpperCase()} • Contact: {booking.phone}
                              </span>
                            </div>

                            {/* Status controls */}
                            <div className="flex flex-wrap gap-2">
                              {booking.status === "booked" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "dispatched", "shipped")}
                                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Approve & Dispatch
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "discarded", "returned")}
                                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Discard Booking
                                  </button>
                                </>
                              )}

                              {booking.status === "dispatched" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "delivered", "delivered")}
                                  className="px-3.5 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Mark as Delivered
                                </button>
                              )}

                              {booking.status === "delivered" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "completed", "returned")}
                                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Mark Returned
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Data details layout */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            
                            {/* Verification Data */}
                            <div className="space-y-2 text-xs">
                              <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold block">Aadhaar Proof</span>
                              <div className="space-y-1.5 p-3 bg-white/[0.015] border border-white/[0.03] rounded-xl font-light">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/40">Number:</span>
                                  <span className="font-mono text-white/80">xxxx-xxxx-{booking.aadhaar_number.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/40">eKYC Check:</span>
                                  {booking.aadhaar_verified ? (
                                    <span className="text-green-400 font-semibold flex items-center gap-1">
                                      <HugeiconsIcon icon={Shield01Icon} size={14} />
                                      <span>OTP Verified</span>
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 font-semibold">Unverified</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-2 text-xs">
                              <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold block">Location Coordinates</span>
                              <div className="p-3 bg-white/[0.015] border border-white/[0.03] rounded-xl font-light h-[55px] flex items-center justify-between">
                                <span className="text-white/60 truncate max-w-[110px] block">{booking.address}</span>
                                <a 
                                  href={booking.map_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-gamebees-glow-blue hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                                >
                                  <span>Map Link</span>
                                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} />
                                </a>
                              </div>
                            </div>

                            {/* Selfie captured image */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold block">Captured Selfie Match</span>
                              <div className="h-[55px] w-full bg-black/40 rounded-xl overflow-hidden border border-white/[0.03] flex items-center justify-center relative group">
                                {booking.selfie_url && booking.selfie_url.startsWith("data:image") ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={booking.selfie_url} 
                                      alt="Selfie" 
                                      className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                                      onClick={() => {
                                        const w = window.open();
                                        w?.document.write(`<img src="${booking.selfie_url}" style="max-width:100%;height:auto;border-radius:12px;"/>`);
                                      }}
                                    />
                                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[8px] font-semibold uppercase">View Larger</span>
                                  </>
                                ) : (
                                  <span className="text-white/20 text-[9px]">No selfie found</span>
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

              {/* Tab: Catalog Inventory */}
              {activeTab === "items" && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white title-glow">
                      Catalog Inventory
                    </h3>
                    <p className="text-white/50 text-xs mt-1 font-light">
                      Add, view, and delete rental hardware packages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Add Item Form Card */}
                    <div className="lg:col-span-1 card-polished p-5 border border-white/[0.03] h-fit bg-zinc-950/20">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-3 mb-4 flex items-center gap-1.5">
                        <HugeiconsIcon icon={PlusIcon} size={16} className="text-gamebees-glow-blue" />
                        <span>Add Product Listing</span>
                      </h4>

                      <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Product Name</label>
                          <input
                            type="text"
                            required
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="E.g., PlayStation 5 Pro"
                            className="form-input text-xs py-2.5"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Category</label>
                          <select
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            className="w-full rounded-xl bg-[#10324D]/30 border border-white/10 px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="Consoles" className="bg-[#141414]">Consoles</option>
                            <option value="Accessories" className="bg-[#141414]">Accessories</option>
                            <option value="Audio" className="bg-[#141414]">Audio</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Price per Day ($)</label>
                          <input
                            type="number"
                            required
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            placeholder="12"
                            className="form-input text-xs py-2.5"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Image URL (Optional)</label>
                          <input
                            type="url"
                            value={itemImage}
                            onChange={(e) => setItemImage(e.target.value)}
                            placeholder="https://..."
                            className="form-input text-xs py-2.5"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-white/50 uppercase">Description</label>
                          <textarea
                            rows={3}
                            value={itemDesc}
                            onChange={(e) => setItemDesc(e.target.value)}
                            placeholder="Specifications, controller bundles, pre-installed games..."
                            className="w-full rounded-xl bg-[#10324D]/30 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={addingItem}
                          className="w-full py-3.5 rounded-xl btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {addingItem ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <HugeiconsIcon icon={PlusIcon} size={15} />
                              <span>Add to Listings</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Active Inventory Listings Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-3 mb-2">
                        Active Products ({items.length})
                      </h4>

                      {items.length === 0 ? (
                        <div className="card-polished p-10 text-center text-white/30 text-xs">
                          No product entries found in the database.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item) => (
                            <div key={item.id} className="card-polished p-5 flex flex-col justify-between h-[180px] border border-white/[0.03] group hover:border-gamebees-accent-blue/30 transition-colors">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] font-bold text-gamebees-glow-blue uppercase tracking-widest bg-gamebees-dark-navy/40 px-2.5 py-0.5 rounded-full border border-gamebees-accent-blue/20">
                                    {item.category}
                                  </span>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-white">${item.price}</span>
                                    <span className="text-[8px] text-white/30 block">/ day</span>
                                  </div>
                                </div>

                                <h5 className="text-sm font-bold text-white truncate">{item.name}</h5>
                                <p className="text-[11px] text-white/40 font-light line-clamp-3 leading-relaxed">{item.description}</p>
                              </div>

                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-fit self-end text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                              >
                                <HugeiconsIcon icon={DeleteIcon} size={16} />
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
