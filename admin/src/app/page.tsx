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
import { 
  ShoppingBag, 
  Compass, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  User, 
  MapPin, 
  Check, 
  X, 
  AlertCircle,
  Truck,
  LogOut,
  Image as ImageIcon,
  DollarSign
} from "lucide-react";

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

  // Form State for Discarding
  const [discardReason, setDiscardReason] = useState("");

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
      <div className="flex h-screen items-center justify-center bg-[#0d0d0d] text-white">
        <div className="h-8 w-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Login Form ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 text-white font-sans">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-950 border border-sky-500/10 shadow-[0_0_50px_rgba(56,189,248,0.05)]">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-black tracking-tight text-white">
              GameBees <span className="text-sky-400">Admin Control</span>
            </h1>
            <p className="text-zinc-500 text-xs font-light">
              Secure authentication gateway. Authorized personnel only.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">System Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@gamebees.com"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:border-sky-500 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">Security Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:border-sky-500 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800 rounded-xl text-xs font-bold text-black transition-all cursor-pointer flex justify-center items-center shadow-[0_4px_15px_rgba(56,189,248,0.2)]"
            >
              {loggingIn ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Authenticate Credentials</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Admin Dashboard ---
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="h-18 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight">GAMEBEES <span className="text-sky-400 font-medium">ADMIN</span></span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">CONSOLE</span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Console</span>
        </button>
      </header>

      {/* Main Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5">
        
        {/* Sidebar */}
        <aside className="lg:col-span-1 border-r border-zinc-800 p-4 space-y-2 bg-zinc-950/40">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold px-3 pb-2 border-b border-zinc-800/40 mb-3">
            Navigation
          </p>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-sky-500 text-black shadow-[0_4px_15px_rgba(56,189,248,0.15)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Reservations Manager</span>
            {bookings.filter(b => b.status === "booked").length > 0 && (
              <span className="ml-auto bg-red-500 text-white font-bold text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center">
                {bookings.filter(b => b.status === "booked").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "items"
                ? "bg-sky-500 text-black shadow-[0_4px_15px_rgba(56,189,248,0.15)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Product Inventory</span>
          </button>
        </aside>

        {/* Content Container */}
        <main className="lg:col-span-4 p-6 sm:p-8 space-y-6">
          {loadingData ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Tab: Bookings */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black">Customer Reservations</h2>
                    <p className="text-zinc-500 text-xs mt-0.5">Review, verify and dispatch customer orders.</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center text-zinc-500 text-sm">
                      No customer reservations listed in database.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-5 shadow-sm"
                        >
                          {/* Top Row: User Summary */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-zinc-900">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">{booking.full_name}</h3>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                                Booking Ref ID: #{booking.id.slice(-8).toUpperCase()} • Customer: {booking.phone}
                              </span>
                            </div>

                            {/* Status Actions */}
                            <div className="flex flex-wrap gap-2">
                              {booking.status === "booked" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "dispatched", "shipped")}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Approve & Dispatch
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(booking.id, "discarded", "returned")}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Discard Booking
                                  </button>
                                </>
                              )}

                              {booking.status === "dispatched" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "delivered", "delivered")}
                                  className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Mark as Delivered
                                </button>
                              )}

                              {booking.status === "delivered" && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "completed", "returned")}
                                  className="px-3 py-1.5 bg-zinc-700/20 hover:bg-zinc-700/40 text-zinc-300 border border-zinc-700/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Mark Returned (Complete)
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Middle Row: Two Columns for Verification & Address details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            
                            {/* Verification Data */}
                            <div className="md:col-span-1 space-y-2 text-xs">
                              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Identity Proofs</h4>
                              <div className="space-y-1.5 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/40 font-light">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">Aadhaar:</span>
                                  <span className="font-mono text-zinc-300">xxxx-xxxx-{booking.aadhaar_number.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">eKYC Check:</span>
                                  {booking.aadhaar_verified ? (
                                    <span className="text-green-400 font-semibold flex items-center gap-1">
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      <span>OTP Match</span>
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 font-semibold">Unverified</span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center border-t border-zinc-800/40 pt-1.5 mt-1.5">
                                  <span className="text-zinc-500">Status:</span>
                                  <span className="text-sky-400 font-bold uppercase tracking-wider text-[9px]">{booking.tracking_status}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Location */}
                            <div className="md:col-span-1 space-y-2 text-xs">
                              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location & Address</h4>
                              <div className="space-y-2 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/40 font-light h-[82px] flex flex-col justify-between">
                                <span className="text-zinc-300 truncate block">{booking.address}</span>
                                <a 
                                  href={booking.map_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>Open Google Maps Link</span>
                                </a>
                              </div>
                            </div>

                            {/* Captured Selfie Preview */}
                            <div className="md:col-span-1 space-y-2">
                              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Liveness Selfie</h4>
                              <div className="relative h-[82px] w-full bg-zinc-900/30 rounded-xl overflow-hidden border border-zinc-800/40 flex items-center justify-center">
                                {booking.selfie_url && booking.selfie_url.startsWith("data:image") ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    src={booking.selfie_url} 
                                    alt="Live Selfie" 
                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                                    onClick={() => {
                                      // Simple Modal zoom mockup
                                      const w = window.open();
                                      w?.document.write(`<img src="${booking.selfie_url}" style="width:100%;height:auto;"/>`);
                                    }}
                                  />
                                ) : (
                                  <span className="text-zinc-600 text-[10px] font-light">No image captured</span>
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

              {/* Tab: Items */}
              {activeTab === "items" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black">Item Storage & Inventory</h2>
                      <p className="text-zinc-500 text-xs mt-0.5">Manage custom hardware setup packages listed in system.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Add Product Form */}
                    <div className="lg:col-span-1 card-polished p-5 border border-zinc-800 h-fit bg-zinc-950/60">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
                        Add New Setup
                      </h3>

                      <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Product Name</label>
                          <input
                            type="text"
                            required
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="E.g., PlayStation 5 Console"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Category</label>
                          <select
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="Consoles" className="bg-zinc-900">Consoles</option>
                            <option value="Accessories" className="bg-zinc-900">Accessories</option>
                            <option value="Audio" className="bg-zinc-900">Audio</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Price per Day ($)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 text-xs">$</span>
                            <input
                              type="number"
                              required
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                              placeholder="12"
                              className="w-full rounded-lg bg-zinc-900 border border-zinc-850 pl-7 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Image URL (Optional)</label>
                          <input
                            type="url"
                            value={itemImage}
                            onChange={(e) => setItemImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Description</label>
                          <textarea
                            rows={3}
                            value={itemDesc}
                            onChange={(e) => setItemDesc(e.target.value)}
                            placeholder="Provide specifications, bundles, items list..."
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={addingItem}
                          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex justify-center items-center"
                        >
                          {addingItem ? (
                            <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              <span>Add to Listings</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Product List Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-2">
                        Active Products ({items.length})
                      </h3>

                      {items.length === 0 ? (
                        <div className="border border-zinc-850 rounded-2xl p-10 text-center text-zinc-500 text-xs">
                          No product entries found.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item) => (
                            <div 
                              key={item.id} 
                              className="rounded-2xl border border-zinc-850 bg-zinc-950/40 p-4.5 flex flex-col justify-between h-[180px] group hover:border-zinc-700 transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30">
                                    {item.category}
                                  </span>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-white">${item.price}</span>
                                    <span className="text-[8px] text-zinc-500 block">/ day</span>
                                  </div>
                                </div>
                                
                                <h4 className="text-sm font-bold text-zinc-200 truncate">{item.name}</h4>
                                <p className="text-[11px] text-zinc-500 font-light line-clamp-3 leading-normal">{item.description}</p>
                              </div>

                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-fit self-end text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
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
