"use client";

import React, { useState, useEffect } from "react";
import { 
  adminLogin, 
  adminLogout, 
  getAdminSession, 
  adminFetchItems, 
  adminAddProduct, 
  adminUpdateProduct,
  adminDeleteProduct,
  adminFetchBookings,
  adminUpdateBookingStatus,
  adminFetchKycProfiles,
  adminApproveKyc,
  adminDeclineKyc,
  adminUploadProductImage
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ShoppingBag01Icon, 
  Compass01Icon, 
  PlusSignIcon, 
  Delete01Icon, 
  Shield01Icon, 
  AlertCircleIcon,
  Logout01Icon,
  PackageIcon,
  ArrowUpRight01Icon,
  LockIcon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";

const TableSkeleton = () => (
  <div className="w-full space-y-3 animate-pulse py-4">
    <div className="h-8 bg-neutral-200/50 rounded w-full"></div>
    <div className="space-y-2 pt-2">
      <div className="h-7 bg-neutral-100/60 rounded w-full"></div>
      <div className="h-7 bg-neutral-100/60 rounded w-full"></div>
      <div className="h-7 bg-neutral-100/60 rounded w-full"></div>
      <div className="h-7 bg-neutral-100/60 rounded w-full"></div>
      <div className="h-7 bg-neutral-100/60 rounded w-full"></div>
    </div>
  </div>
);

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

  // Detail view state variables
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedKycProfile, setSelectedKycProfile] = useState<any | null>(null);

  // Custom dialogs state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message
    });
  };

  // Form State for Adding Item
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice3Days, setItemPrice3Days] = useState("");
  const [itemPriceExtraDay, setItemPriceExtraDay] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemImages, setItemImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [isAddingListing, setIsAddingListing] = useState(false);

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
    if (initialLoad) setLoadingData(true);
    const [itemsRes, bookingsRes, kycRes] = await Promise.all([
      adminFetchItems(),
      adminFetchBookings(),
      adminFetchKycProfiles()
    ]);
    if (itemsRes.success) setItems(itemsRes.data || []);
    if (bookingsRes.success) setBookings(bookingsRes.data || []);
    if (kycRes.success) setKycProfiles(kycRes.data || []);
    setLoadingData(false);
    setInitialLoad(false);
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

  const handleMultipleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    const res = await adminUploadProductImage(formData);
    setUploadingImages(false);

    if (res.success && res.urls && res.urls.length > 0) {
      setItemImages((prev) => [...prev, ...res.urls]);
      if (!itemImage) setItemImage(res.urls[0]);
    } else {
      triggerAlert("Image Upload Failed", res.error || "Failed to upload image to Supabase storage.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setItemImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0) setItemImage(updated[0]);
      else setItemImage("");
      return updated;
    });
  };

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    setItemName(item.name || "");
    setItemCategory(item.category || "");
    setItemPrice(item.price ? String(item.price) : "");
    setItemQuantity(item.quantity ? String(item.quantity) : "1");
    setItemPrice3Days(item.price_3_days ? String(item.price_3_days) : String((item.price || 0) * 3));
    setItemPriceExtraDay(item.price_extra_day ? String(item.price_extra_day) : String(item.price || ""));
    setItemDesc(item.description || "");
    setItemImage(item.image_url || "");

    let existingImages: string[] = [];
    if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      existingImages = item.image_urls;
    } else if (item.image_url) {
      existingImages = [item.image_url];
    }
    setItemImages(existingImages);
    setIsAddingListing(true);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    setAddingItem(true);

    const basePrice = Number(itemPrice);
    const p3Days = itemPrice3Days ? Number(itemPrice3Days) : basePrice * 3;
    const pExtra = itemPriceExtraDay ? Number(itemPriceExtraDay) : basePrice;
    const primaryImg = itemImages[0] || itemImage || undefined;
    const allImgs = itemImages.length > 0 ? itemImages : (itemImage ? [itemImage] : undefined);

    let res;
    if (editingItemId) {
      res = await adminUpdateProduct(editingItemId, {
        name: itemName,
        category: itemCategory,
        price: basePrice,
        description: itemDesc,
        image_url: primaryImg,
        image_urls: allImgs,
        quantity: Number(itemQuantity) || 1,
        price_3_days: p3Days,
        price_extra_day: pExtra
      });
    } else {
      res = await adminAddProduct({
        name: itemName,
        category: itemCategory,
        price: basePrice,
        description: itemDesc,
        image_url: primaryImg,
        image_urls: allImgs,
        quantity: Number(itemQuantity) || 1,
        price_3_days: p3Days,
        price_extra_day: pExtra
      });
    }
    setAddingItem(false);
    if (res.success) {
      setItemName("");
      setItemPrice("");
      setItemQuantity("1");
      setItemPrice3Days("");
      setItemPriceExtraDay("");
      setItemDesc("");
      setItemImage("");
      setItemImages([]);
      setEditingItemId(null);
      loadData();
    } else {
      triggerAlert("Listing Save Failed", "Error saving item: " + res.error);
    }
  };

  const handleDeleteItem = (id: string) => {
    triggerConfirm(
      "Delete Product Listing",
      "Are you sure you want to permanently delete this console hardware product listing from inventory?",
      async () => {
        const res = await adminDeleteProduct(id);
        if (res.success) {
          loadData();
        } else {
          triggerAlert("Delete Listing Failed", "Error deleting item: " + res.error);
        }
      }
    );
  };

  const handleUpdateStatus = async (bookingId: string, status: string, trackingStatus: string) => {
    const res = await adminUpdateBookingStatus(bookingId, status, trackingStatus);
    if (res.success) {
      loadData();
    } else {
      triggerAlert("Booking Status Sync Failed", "Error updating booking status: " + res.error);
    }
  };

  const handleApproveKyc = (userId: string) => {
    triggerConfirm(
      "Approve Manual KYC",
      "Are you sure you want to APPROVE this user's manual eKYC details and mark them verified?",
      async () => {
        const res = await adminApproveKyc(userId);
        if (res.success) {
          loadData();
        } else {
          triggerAlert("KYC Verification Failed", "Error approving KYC: " + res.error);
        }
      }
    );
  };

  const handleDeclineKyc = (userId: string) => {
    triggerConfirm(
      "Decline Manual KYC",
      "Are you sure you want to DECLINE this user's manual eKYC verification? They will have to re-apply.",
      async () => {
        const res = await adminDeclineKyc(userId);
        if (res.success) {
          loadData();
        } else {
          triggerAlert("KYC Verification Failed", "Error declining KYC: " + res.error);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "dispatched": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "delivered": return "bg-green-50 text-green-700 border border-green-200";
      case "discarded": return "bg-red-50 text-red-700 border border-red-200";
      case "completed": return "bg-neutral-50 text-neutral-600 border border-neutral-200";
      default: return "bg-neutral-50 text-neutral-600 border border-neutral-200";
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-6 w-6 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Login Form ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 text-[#141414] relative overflow-hidden">
        <div className="w-full max-w-sm p-6 rounded-lg border border-neutral-200 bg-white z-10 space-y-6 shadow-sm">
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold tracking-tight text-[#141414]">
              GameBees Admin Console
            </h1>
            <p className="text-neutral-500 text-xs font-light">
              Secure authorization gateway. Enter credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-600 block uppercase">System Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@gamebees.com"
                className="form-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Security Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="form-input"
              />
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
    <div className="flex-1 flex flex-col relative bg-[#FAFAFA] min-h-screen text-[#141414] pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-[#141414]">GAMEBEES</span>
            <span className="text-[8px] uppercase tracking-wider font-bold border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-600">ADMIN</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F4F5] text-[10px] text-neutral-700">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Session: <strong>gamebeesofficial@gmail.com</strong></span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 text-[10px] font-semibold transition-all cursor-pointer"
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
            <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold pb-1.5 border-b border-neutral-200 mb-1.5">
              Menu Navigation
            </p>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-[#141414] text-white"
                  : "text-[#141414] hover:bg-[#F4F4F5]"
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
                  : "text-[#141414] hover:bg-[#F4F4F5]"
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
                  : "text-[#141414] hover:bg-[#F4F4F5]"
              }`}
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
              <span>Catalog Inventory</span>
            </button>
          </div>

          {/* Quick Metrics Widget */}
          <div className="card-polished p-4 space-y-3">
            <h4 className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-200 pb-1.5">
              Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-[#F4F4F5] rounded border border-neutral-200">
                <span className="text-[8px] text-neutral-500 block uppercase">All Bookings</span>
                <span className="text-base font-black text-[#141414]">{bookings.length}</span>
              </div>
              <div className="p-2 bg-[#F4F4F5] rounded border border-neutral-200">
                <span className="text-[8px] text-neutral-500 block uppercase">KYC Pending</span>
                <span className="text-base font-black text-amber-600">
                  {kycProfiles.filter(p => p.kyc_status === "pending").length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-3 space-y-6">
          {/* Tab: Reservations Manager */}
          {activeTab === "bookings" && (
            <div className="space-y-4 animate-fadeInUp">
              <div>
                <h3 className="text-lg font-bold text-[#141414]">
                  Reservations Board
                </h3>
                <p className="text-neutral-500 text-xs mt-0.5 font-light">
                  Click customer names to inspect detailed delivery coordinates, selfies, and manage console rentals.
                </p>
              </div>

              {loadingData ? (
                <TableSkeleton />
              ) : bookings.length === 0 ? (
                <div className="card-polished p-12 text-center space-y-2">
                  <HugeiconsIcon icon={PackageIcon} size={32} className="text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-500 font-light">No customer bookings have been logged yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto card-polished">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>Ref ID / Date</th>
                        <th>Customer Name</th>
                        <th>Item Category</th>
                        <th>Price Total</th>
                        <th>Status Badge</th>
                        <th>Open Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="font-mono text-[10px]">
                            <span className="font-bold text-[#141414]">#{booking.id.slice(-8).toUpperCase()}</span>
                            <span className="block text-[8px] text-neutral-400 mt-0.5">{new Date(booking.created_at).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer"
                            >
                              {booking.full_name}
                            </button>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">{booking.phone}</span>
                          </td>
                          <td>
                            <span className="text-[10px] font-semibold text-neutral-600 block">
                              {booking.items?.name || "Rental Hardware"}
                            </span>
                            <span className="text-[8px] text-neutral-400 block uppercase mt-0.5">{booking.items?.category}</span>
                          </td>
                          <td className="font-mono text-xs font-bold text-[#141414]">
                            ₹{booking.total_price}
                          </td>
                          <td>
                            <span className={`text-[8px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-neutral-600 hover:text-black font-semibold text-[10px] hover:underline cursor-pointer"
                            >
                              Open Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: KYC Approvals */}
          {activeTab === "kyc" && (
            <div className="space-y-4 animate-fadeInUp">
              <div>
                <h3 className="text-lg font-bold text-[#141414]">
                  KYC Manual Approvals Board
                </h3>
                <p className="text-neutral-500 text-xs mt-0.5 font-light">
                  Click names to verify coordinates maps, Aadhaar documents, and match selfies.
                </p>
              </div>

              {loadingData ? (
                <TableSkeleton />
              ) : kycProfiles.length === 0 ? (
                <div className="card-polished p-12 text-center space-y-2">
                  <HugeiconsIcon icon={Shield01Icon} size={32} className="text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-500 font-light">No manual KYC requests have been logged yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto card-polished">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Aadhaar Registry</th>
                        <th>Applied Date</th>
                        <th>Review Status</th>
                        <th>Audit Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycProfiles.map((profile) => (
                        <tr key={profile.id}>
                          <td>
                            <button
                              onClick={() => setSelectedKycProfile(profile)}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer"
                            >
                              {profile.full_name}
                            </button>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">Ph: {profile.phone}</span>
                          </td>
                          <td className="font-mono text-xs text-neutral-600">
                            xxxx-xxxx-{profile.aadhaar_number.slice(-4)}
                          </td>
                          <td className="text-[10px] text-neutral-500">
                            {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`text-[8px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 ${
                              profile.kyc_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              profile.kyc_status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {profile.kyc_status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedKycProfile(profile)}
                              className="text-neutral-600 hover:text-black font-semibold text-[10px] hover:underline cursor-pointer"
                            >
                              Review Application
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Catalog Inventory */}
          {activeTab === "items" && (
            <div className="space-y-4 animate-fadeInUp">
              {isAddingListing ? (
                /* Add / Edit Product Sub-Screen */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-[#141414]">
                        {editingItemId ? "Edit Product Listing" : "Add Product Listing"}
                      </h3>
                      <p className="text-neutral-500 text-xs mt-0.5 font-light">
                        Manage rental inventory stock units and flexible tiered pricing rules.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddingListing(false);
                        setEditingItemId(null);
                      }}
                      className="px-3 py-1.5 btn-secondary text-xs font-semibold"
                    >
                      Back to Listings
                    </button>
                  </div>

                  <div className="card-polished p-6 border border-neutral-200 bg-white max-w-xl">
                    <form onSubmit={async (e) => {
                      await handleAddItem(e);
                      setIsAddingListing(false);
                    }} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Product Name</label>
                        <input
                          type="text"
                          required
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="E.g., PlayStation 5 Pro Console Bundle"
                          className="form-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Category</label>
                        <input
                          type="text"
                          required
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          placeholder="E.g., Consoles, Accessories, Audio..."
                          className="form-input"
                        />
                        {/* Dynamic category suggestions list */}
                        {Array.from(new Set(items.map(item => item.category).filter(Boolean))).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[9px] text-neutral-450 font-bold block w-full">Previously Created Categories:</span>
                            {Array.from(new Set(items.map(item => item.category).filter(Boolean))).map((cat: any) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setItemCategory(cat)}
                                className="text-[10px] bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md px-2 py-0.5 text-neutral-700 cursor-pointer font-medium"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Stock Units (Quantity)</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            placeholder="1"
                            className="form-input"
                          />
                          <span className="text-[9px] text-neutral-400 block">Hidden from public users</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Baseline Daily Rate (₹)</label>
                          <input
                            type="number"
                            required
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            placeholder="499"
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* Tiered Pricing Rules */}
                      <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-3">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider block">
                          Flexible Tiered Pricing Rules
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-neutral-600 block">Base 3-Day Rate (₹)</label>
                            <input
                              type="number"
                              value={itemPrice3Days}
                              onChange={(e) => setItemPrice3Days(e.target.value)}
                              placeholder={itemPrice ? String(Number(itemPrice) * 3) : "1497"}
                              className="form-input bg-white"
                            />
                            <span className="text-[9px] text-neutral-400 block">Initial 3 days total</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-neutral-600 block">Extra Day Rate (₹/day)</label>
                            <input
                              type="number"
                              value={itemPriceExtraDay}
                              onChange={(e) => setItemPriceExtraDay(e.target.value)}
                              placeholder={itemPrice || "400"}
                              className="form-input bg-white"
                            />
                            <span className="text-[9px] text-neutral-400 block">For days 4+</span>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Image Storage Upload Area */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-neutral-600 block uppercase">
                          Product Images (Supabase Storage Upload)
                        </label>

                        <div className="relative border-2 border-dashed border-neutral-300 hover:border-[#246596] rounded-xl p-4 text-center bg-neutral-50/50 transition-all cursor-pointer group">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleMultipleImageUpload(e.target.files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="space-y-1">
                            <div className="mx-auto h-9 w-9 rounded-full bg-[#246596]/10 text-[#246596] flex items-center justify-center">
                              <HugeiconsIcon icon={PlusSignIcon} size={18} />
                            </div>
                            <p className="text-xs font-bold text-neutral-700">Click or Drag & Drop Product Photos</p>
                            <p className="text-[10px] text-neutral-450 font-light">Select 1 or multiple images to upload directly to Supabase Storage</p>
                          </div>
                        </div>

                        {uploadingImages && (
                          <div className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading image(s) to Supabase Storage bucket...</span>
                          </div>
                        )}

                        {/* Multi Image Thumbnails Gallery */}
                        {itemImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            {itemImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-square bg-neutral-100 shadow-xs">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imgUrl} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    Primary Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1 right-1 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
                                  title="Remove Image"
                                >
                                  <HugeiconsIcon icon={Delete01Icon} size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          <label className="text-[9px] font-semibold text-neutral-500 block uppercase">Or External Image URL (Fallback)</label>
                          <input
                            type="url"
                            value={itemImage}
                            onChange={(e) => {
                              setItemImage(e.target.value);
                              if (e.target.value && !itemImages.includes(e.target.value)) {
                                setItemImages((prev) => [e.target.value, ...prev]);
                              }
                            }}
                            placeholder="https://..."
                            className="form-input text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-600 block uppercase">Description</label>
                        <textarea
                          rows={3}
                          value={itemDesc}
                          onChange={(e) => setItemDesc(e.target.value)}
                          placeholder="Controller attachments, dynamic specs, bundled game CD details..."
                          className="w-full rounded border border-neutral-300 px-3 py-2 text-xs text-[#141414] placeholder-neutral-300 outline-none resize-none bg-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingListing(false);
                            setEditingItemId(null);
                          }}
                          className="flex-1 py-2.5 btn-secondary text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingItem || uploadingImages}
                          className="flex-1 py-2.5 rounded btn-glow-pill text-xs font-bold text-white flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {addingItem ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <HugeiconsIcon icon={PlusSignIcon} size={14} />
                              <span>{editingItemId ? "Update Product" : "Add to Listings"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* Active Listings Sub-Screen */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-[#141414]">
                        Catalog Inventory
                      </h3>
                      <p className="text-neutral-500 text-xs mt-0.5 font-light">
                        Manage rental stock quantities and pricing tiers.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItemId(null);
                        setItemName("");
                        setItemCategory("");
                        setItemPrice("");
                        setItemQuantity("1");
                        setItemPrice3Days("");
                        setItemPriceExtraDay("");
                        setItemDesc("");
                        setItemImage("");
                        setItemImages([]);
                        setIsAddingListing(true);
                      }}
                      className="px-3.5 py-2 btn-glow-pill text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={13} />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {loadingData ? (
                    <TableSkeleton />
                  ) : items.length === 0 ? (
                    <div className="card-polished p-10 text-center text-neutral-400 text-xs">
                      No product entries found in the database.
                    </div>
                  ) : (
                    <div className="overflow-x-auto card-polished">
                      <table className="dense-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Stock Units</th>
                            <th>3-Day Base Rate</th>
                            <th>Extra Day Rate</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={item.image_url || (Array.isArray(item.image_urls) && item.image_urls[0]) || "/ps5.png"} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/ps5.png";
                                    }}
                                  />
                                </div>
                              </td>
                              <td>
                                <span className="font-semibold block text-xs">{item.name}</span>
                                <span className="text-[10px] text-neutral-500 block line-clamp-1 leading-tight">{item.description}</span>
                              </td>
                              <td>
                                <span className="text-[8px] font-bold text-[#141414] uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                  {item.category}
                                </span>
                              </td>
                              <td>
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {item.quantity || 1} Units
                                </span>
                              </td>
                              <td>
                                <span className="text-xs font-black text-[#141414]">
                                  ₹{item.price_3_days || (item.price ? item.price * 3 : 1497)}
                                </span>
                              </td>
                              <td>
                                <span className="text-xs font-semibold text-neutral-700">
                                  ₹{item.price_extra_day || item.price || 400}/day
                                </span>
                              </td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-transparent hover:border-blue-200 text-[10px] font-semibold transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                  >
                                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Booking Detail View */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeInUp">
          <div className="bg-white border border-[#E4E4E7] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#141414]">Booking Details: #{selectedBooking.id.slice(-8).toUpperCase()}</h3>
                <span className="text-[10px] text-neutral-400">Created on {new Date(selectedBooking.created_at).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer & Item info */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Customer Info</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between"><span>Name:</span><span className="font-bold text-[#141414]">{selectedBooking.full_name}</span></div>
                      <div className="flex justify-between"><span>Phone:</span><span className="font-mono">{selectedBooking.phone}</span></div>
                      <div className="flex justify-between"><span>Clerk ID:</span><span className="font-mono text-[10px] truncate max-w-[150px]">{selectedBooking.user_id}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-neutral-455 font-bold uppercase block tracking-wider mb-1">Hardware Listing</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between"><span>Product:</span><span className="font-bold">{selectedBooking.items?.name || "Console Hardware"}</span></div>
                      <div className="flex justify-between"><span>Category:</span><span>{selectedBooking.items?.category || "Consoles"}</span></div>
                      <div className="flex justify-between"><span>Price per Day:</span><span>₹{selectedBooking.items?.price || selectedBooking.total_price / selectedBooking.duration_days}</span></div>
                      <div className="flex justify-between"><span>Duration:</span><span>{selectedBooking.duration_days} Days</span></div>
                      <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-bold"><span>Total Paid:</span><span>₹{selectedBooking.total_price}</span></div>
                    </div>
                  </div>
                </div>

                {/* Address & Verifications */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Delivery Address</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-2">
                      <p className="leading-relaxed">{selectedBooking.address}</p>
                      <a 
                        href={selectedBooking.map_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <span>Google Maps Link</span>
                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Aadhaar Proof</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between"><span>Aadhaar Number:</span><span className="font-mono">xxxx-xxxx-{selectedBooking.aadhaar_number.slice(-4)}</span></div>
                      <div className="flex justify-between">
                        <span>Identity Status:</span>
                        {selectedBooking.aadhaar_verified ? (
                          <span className="text-green-700 font-bold">Verified</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Unverified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selfie image */}
              <div>
                <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Captured Selfie Match</span>
                <div className="h-44 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                  {selectedBooking.selfie_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedBooking.selfie_url} 
                      alt="Selfie Match" 
                      className="h-full object-contain cursor-zoom-in" 
                      onClick={() => {
                        const w = window.open();
                        w?.document.write(`<img src="${selectedBooking.selfie_url}" style="max-width:100%;height:auto;border-radius:6px;"/>`);
                      }}
                    />
                  ) : (
                    <span className="text-neutral-400">No selfie uploaded for this booking.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-neutral-200 bg-[#F8F8FA] flex justify-between items-center">
              <div className="flex gap-2">
                {selectedBooking.status === "booked" && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, "dispatched", "shipped");
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-1.5 bg-[#141414] hover:bg-neutral-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Approve & Dispatch
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, "discarded", "returned");
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-1.5 border border-red-500 text-red-600 hover:bg-red-50 rounded text-xs font-semibold cursor-pointer"
                    >
                      Discard Booking
                    </button>
                  </>
                )}

                {selectedBooking.status === "dispatched" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, "delivered", "delivered");
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                )}

                {selectedBooking.status === "delivered" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, "completed", "returned");
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-1.5 bg-[#141414] hover:bg-neutral-800 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Mark Returned
                  </button>
                )}
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 btn-secondary text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: KYC Detail View */}
      {selectedKycProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeInUp">
          <div className="bg-white border border-[#E4E4E7] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#141414]">KYC Application: {selectedKycProfile.full_name}</h3>
                <span className="text-[10px] text-neutral-400">Submitted on {new Date(selectedKycProfile.created_at).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedKycProfile(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Customer Profile</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between"><span>Name:</span><span className="font-bold text-[#141414]">{selectedKycProfile.full_name}</span></div>
                      <div className="flex justify-between"><span>Phone:</span><span className="font-mono">{selectedKycProfile.phone}</span></div>
                      <div className="flex justify-between"><span>User Account ID:</span><span className="font-mono text-[10px] truncate max-w-[150px]">{selectedKycProfile.id}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-neutral-455 font-bold uppercase block tracking-wider mb-1">Aadhaar Card details</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between"><span>Aadhaar Number:</span><span className="font-mono font-bold text-sm text-[#141414] tracking-wide">{selectedKycProfile.aadhaar_number}</span></div>
                      <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-bold">
                        <span>Current Status:</span>
                        <span className={`font-semibold border rounded px-1.5 py-0.5 text-[10px] ${
                          selectedKycProfile.kyc_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedKycProfile.kyc_status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {selectedKycProfile.kyc_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates / Map details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1">Live Coordinates Tracking</span>
                    <div className="p-3 bg-[#F8F8FA] rounded border border-neutral-200 space-y-2">
                      <div className="flex justify-between font-mono"><span>Latitude:</span><span>{selectedKycProfile.latitude?.toFixed(6) || "N/A"}</span></div>
                      <div className="flex justify-between font-mono"><span>Longitude:</span><span>{selectedKycProfile.longitude?.toFixed(6) || "N/A"}</span></div>
                      
                      {selectedKycProfile.latitude && selectedKycProfile.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedKycProfile.latitude},${selectedKycProfile.longitude}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold mt-1"
                        >
                          <span>Show Exact Location on Map</span>
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document verification uploads */}
              <div>
                <span className="text-[9px] text-neutral-450 font-bold uppercase block tracking-wider mb-1.5">Verification Documents</span>
                <div className="grid grid-cols-3 gap-3">
                  {/* Front */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] text-neutral-500 font-semibold block">Aadhaar Front</span>
                    <div className="h-28 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                      {selectedKycProfile.aadhaar_front_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={selectedKycProfile.aadhaar_front_url} 
                          alt="Aadhaar Front" 
                          className="h-full w-full object-cover cursor-zoom-in" 
                          onClick={() => {
                            const w = window.open();
                            w?.document.write(`<img src="${selectedKycProfile.aadhaar_front_url}" style="max-width:100%;height:auto;border-radius:6px;"/>`);
                          }}
                        />
                      ) : (
                        <span className="text-neutral-300 text-[10px]">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Back */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] text-neutral-500 font-semibold block">Aadhaar Back</span>
                    <div className="h-28 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                      {selectedKycProfile.aadhaar_back_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={selectedKycProfile.aadhaar_back_url} 
                          alt="Aadhaar Back" 
                          className="h-full w-full object-cover cursor-zoom-in" 
                          onClick={() => {
                            const w = window.open();
                            w?.document.write(`<img src="${selectedKycProfile.aadhaar_back_url}" style="max-width:100%;height:auto;border-radius:6px;"/>`);
                          }}
                        />
                      ) : (
                        <span className="text-neutral-300 text-[10px]">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] text-neutral-500 font-semibold block">User Selfie</span>
                    <div className="h-28 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                      {selectedKycProfile.selfie_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={selectedKycProfile.selfie_url} 
                          alt="User Selfie" 
                          className="h-full w-full object-cover cursor-zoom-in" 
                          onClick={() => {
                            const w = window.open();
                            w?.document.write(`<img src="${selectedKycProfile.selfie_url}" style="max-width:100%;height:auto;border-radius:6px;"/>`);
                          }}
                        />
                      ) : (
                        <span className="text-neutral-300 text-[10px]">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-neutral-200 bg-[#F8F8FA] flex justify-between items-center">
              <div className="flex gap-2">
                {selectedKycProfile.kyc_status !== "approved" && (
                  <button
                    onClick={() => {
                      handleApproveKyc(selectedKycProfile.id);
                      setSelectedKycProfile(null);
                    }}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Approve KYC
                  </button>
                )}
                {selectedKycProfile.kyc_status !== "declined" && (
                  <button
                    onClick={() => {
                      handleDeclineKyc(selectedKycProfile.id);
                      setSelectedKycProfile(null);
                    }}
                    className="px-4 py-1.5 border border-red-500 text-red-600 hover:bg-red-50 rounded text-xs font-semibold cursor-pointer"
                  >
                    Decline KYC
                  </button>
                )}
              </div>

              <button 
                onClick={() => setSelectedKycProfile(null)}
                className="px-4 py-1.5 btn-secondary text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeInUp">
          <div className="bg-white border border-[#E4E4E7] rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-[#141414] flex items-center gap-1.5">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-[#141414]" />
                <span>{confirmModal.title}</span>
              </h3>
            </div>
            <div className="p-5 text-xs text-neutral-600 leading-relaxed">
              {confirmModal.message}
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 bg-[#F8F8FA] flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 btn-secondary text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-neutral-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Alert Modal */}
      {alertModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeInUp">
          <div className="bg-white border border-[#E4E4E7] rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-[#141414] flex items-center gap-1.5">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-red-500" />
                <span>{alertModal.title}</span>
              </h3>
            </div>
            <div className="p-5 text-xs text-neutral-600 leading-relaxed">
              {alertModal.message}
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 bg-[#F8F8FA] flex justify-end">
              <button
                onClick={() => setAlertModal(null)}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-neutral-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
